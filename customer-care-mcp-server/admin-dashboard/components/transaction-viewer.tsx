'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { apiClient } from '../lib/api';

export function TransactionViewer() {
  const [accountId, setAccountId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transactionView, setTransactionView] = useState<'CUSTOMER_VIEW' | 'FULL_VIEW'>('CUSTOMER_VIEW');
  const [searchParams, setSearchParams] = useState<{
    accountId: string;
    startDate: string;
    endDate: string;
    transactionView: 'CUSTOMER_VIEW' | 'FULL_VIEW';
  } | null>(null);

  const { data: transactions, isLoading, error } = useQuery({
    queryKey: ['transactions', searchParams],
    queryFn: () => 
      apiClient.getTransactions(
        searchParams!.accountId,
        searchParams!.startDate,
        searchParams!.endDate,
        searchParams!.transactionView
      ),
    enabled: !!searchParams,
  });

  const handleSearch = () => {
    if (accountId.trim() && startDate && endDate) {
      setSearchParams({
        accountId: accountId.trim(),
        startDate,
        endDate,
        transactionView,
      });
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'N/A';
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SETTLED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'DECLINED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionTypeColor = (type: string) => {
    if (type.startsWith('REPAYMENT')) return 'text-green-600';
    if (type.startsWith('FEE_APPLIED')) return 'text-red-600';
    if (type === 'CARD') return 'text-blue-600';
    return 'text-gray-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Viewer</CardTitle>
        <CardDescription>
          View account transactions within a date range (max 6 months)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Input
            placeholder="Account ID"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
          />
          <Input
            type="date"
            placeholder="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            type="date"
            placeholder="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={transactionView}
            onChange={(e) => setTransactionView(e.target.value as 'CUSTOMER_VIEW' | 'FULL_VIEW')}
          >
            <option value="CUSTOMER_VIEW">Customer View</option>
            <option value="FULL_VIEW">Full View</option>
          </select>
        </div>

        <Button 
          onClick={handleSearch} 
          disabled={!accountId.trim() || !startDate || !endDate || isLoading}
          className="w-full"
        >
          {isLoading ? 'Loading Transactions...' : 'Search Transactions'}
        </Button>

        {error && (
          <div className="p-4 text-sm text-red-600 bg-red-50 rounded-md">
            Error: {error instanceof Error ? error.message : 'Failed to fetch transactions'}
          </div>
        )}

        {transactions && (
          <div className="mt-6">
            <div className="mb-4 p-4 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-900">
                Found {transactions.transactions.length} transactions for account {searchParams?.accountId}
              </p>
            </div>

            <div className="space-y-3">
              {transactions.transactions.map((transaction) => (
                <div key={transaction.transactionId} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-lg">{transaction.title}</h4>
                      <p className="text-sm text-gray-600">
                        Transaction ID: {transaction.transactionId}
                      </p>
                      {transaction.cardId && (
                        <p className="text-sm text-gray-600">
                          Card ID: {transaction.cardId}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        {formatCurrency(transaction.destinationAmount)}
                      </p>
                      <span className={`inline-block px-2 py-1 text-xs rounded ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <label className="block font-medium text-gray-700">Transaction Type</label>
                      <p className={`mt-1 ${getTransactionTypeColor(transaction.onmoTransactionType)}`}>
                        {transaction.onmoTransactionType}
                      </p>
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700">Date & Time</label>
                      <p className="mt-1 text-gray-900">{formatDateTime(transaction.dateTime)}</p>
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700">Currency</label>
                      <p className="mt-1 text-gray-900">{transaction.currencyCode}</p>
                    </div>
                    {transaction.feeAmount && transaction.feeAmount > 0 && (
                      <div>
                        <label className="block font-medium text-gray-700">Fee Amount</label>
                        <p className="mt-1 text-red-600">{formatCurrency(transaction.feeAmount)}</p>
                      </div>
                    )}
                  </div>

                  {transaction.merchantInfo.merchantName && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <h5 className="font-medium text-sm text-gray-700">Merchant Information</h5>
                      <div className="mt-1 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Name:</span> {transaction.merchantInfo.merchantName}
                        </div>
                        {transaction.merchantInfo.merchantCity && (
                          <div>
                            <span className="font-medium">City:</span> {transaction.merchantInfo.merchantCity}
                          </div>
                        )}
                        {transaction.merchantInfo.merchantCountryCode && (
                          <div>
                            <span className="font-medium">Country:</span> {transaction.merchantInfo.merchantCountryCode}
                          </div>
                        )}
                        {transaction.merchantInfo.merchantCategoryCode && (
                          <div>
                            <span className="font-medium">Category:</span> {transaction.merchantInfo.merchantCategoryCode}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {transaction.status === 'DECLINED' && transaction.declineReason && (
                    <div className="mt-3 p-3 bg-red-50 rounded-md">
                      <h5 className="font-medium text-sm text-red-700">Decline Reason</h5>
                      <p className="mt-1 text-sm text-red-600">{transaction.declineReason}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {transactions.transactions.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No transactions found for the specified criteria.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}