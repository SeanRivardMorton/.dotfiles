'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { apiClient, type CreditCardAccount } from '../lib/api';

export function AccountDetails() {
  const [accountId, setAccountId] = useState('');
  const [searchAccountId, setSearchAccountId] = useState<string | null>(null);

  const { data: account, isLoading, error } = useQuery<CreditCardAccount>({
    queryKey: ['account', searchAccountId],
    queryFn: () => apiClient.getAccount(searchAccountId!),
    enabled: !!searchAccountId,
  });

  const handleSearch = () => {
    if (accountId.trim()) {
      setSearchAccountId(accountId.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'N/A';
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Details</CardTitle>
        <CardDescription>
          View detailed account information including balances and payment plans
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter Account ID"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={!accountId.trim() || isLoading}>
            {isLoading ? 'Loading...' : 'Search'}
          </Button>
        </div>

        {error && (
          <div className="p-4 text-sm text-red-600 bg-red-50 rounded-md">
            Error: {error instanceof Error ? error.message : 'Failed to fetch account'}
          </div>
        )}

        {account && (
          <div className="mt-6 space-y-6">
            {/* Account Details */}
            <div>
              <h3 className="text-lg font-medium mb-3">Account Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account ID</label>
                  <p className="mt-1 text-sm text-gray-900">{account.accountDetails.accountId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer ID</label>
                  <p className="mt-1 text-sm text-gray-900">{account.accountDetails.customerId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <p className="mt-1 text-sm text-gray-900">{account.accountDetails.state}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account State</label>
                  <p className="mt-1 text-sm text-gray-900">{account.accountDetails.accountState}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Credit Limit</label>
                  <p className="mt-1 text-sm text-gray-900">{formatCurrency(account.accountDetails.creditLimit)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Available Credit</label>
                  <p className="mt-1 text-sm text-gray-900">{formatCurrency(account.accountDetails.availableCredit)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">APR</label>
                  <p className="mt-1 text-sm text-gray-900">{account.accountDetails.apr}%</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">In Arrears</label>
                  <p className="mt-1 text-sm text-gray-900">
                    <span className={`inline-block px-2 py-1 text-xs rounded ${
                      account.accountDetails.isInArrears 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {account.accountDetails.isInArrears ? 'Yes' : 'No'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Account Balances */}
            <div>
              <h3 className="text-lg font-medium mb-3">Account Balances</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-md">
                  <h4 className="font-medium text-blue-900">Current Balance</h4>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrency(account.accountBalances.balances.total)}
                  </p>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Principal: {formatCurrency(account.accountBalances.balances.principal)}</p>
                    <p>Interest: {formatCurrency(account.accountBalances.balances.interest)}</p>
                    <p>Fees: {formatCurrency(account.accountBalances.balances.fees)}</p>
                  </div>
                </div>
                <div className="p-4 bg-orange-50 rounded-md">
                  <h4 className="font-medium text-orange-900">Amount Due</h4>
                  <p className="text-2xl font-bold text-orange-900">
                    {formatCurrency(account.accountBalances.due.total)}
                  </p>
                  <div className="mt-2 text-sm text-orange-700">
                    <p>Principal: {formatCurrency(account.accountBalances.due.principal)}</p>
                    <p>Interest: {formatCurrency(account.accountBalances.due.interest)}</p>
                    <p>Fees: {formatCurrency(account.accountBalances.due.fees)}</p>
                  </div>
                </div>
                <div className="p-4 bg-red-50 rounded-md">
                  <h4 className="font-medium text-red-900">Arrears</h4>
                  <p className="text-2xl font-bold text-red-900">
                    {formatCurrency(account.accountBalances.arrearBalances.total)}
                  </p>
                  <div className="mt-2 text-sm text-red-700">
                    <p>Principal: {formatCurrency(account.accountBalances.arrearBalances.principal)}</p>
                    <p>Interest: {formatCurrency(account.accountBalances.arrearBalances.interest)}</p>
                    <p>Fees: {formatCurrency(account.accountBalances.arrearBalances.fees)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cards */}
            {account.cards.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3">Associated Cards</h3>
                <div className="space-y-2">
                  {account.cards.map((card) => (
                    <div key={card.cardId} className="p-3 bg-gray-50 rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Card ID: {card.cardId}</p>
                          <p className="text-sm text-gray-600">State: {card.state}</p>
                        </div>
                        <div className="flex gap-2">
                          <span className={`inline-block px-2 py-1 text-xs rounded ${
                            card.isActivated ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {card.isActivated ? 'Activated' : 'Not Activated'}
                          </span>
                          <span className={`inline-block px-2 py-1 text-xs rounded ${
                            card.hasPinSet ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {card.hasPinSet ? 'PIN Set' : 'No PIN'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Plans */}
            {account.paymentPlans.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3">Payment Plans</h3>
                <div className="space-y-2">
                  {account.paymentPlans.map((plan, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{plan.type}</p>
                          <p className="text-sm text-gray-600">
                            {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{plan.amount}</p>
                          <span className={`inline-block px-2 py-1 text-xs rounded ${
                            plan.status === 'Active' ? 'bg-green-100 text-green-800' :
                            plan.status === 'Broken' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {plan.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}