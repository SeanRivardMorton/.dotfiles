'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { apiClient, type Customer } from '../lib/api';

export function CustomerLookup() {
  const [customerId, setCustomerId] = useState('');
  const [searchCustomerId, setSearchCustomerId] = useState<string | null>(null);

  const { data: customer, isLoading, error } = useQuery<Customer>({
    queryKey: ['customer', searchCustomerId],
    queryFn: () => apiClient.getCustomer(searchCustomerId!),
    enabled: !!searchCustomerId,
  });

  const handleSearch = () => {
    if (customerId.trim()) {
      setSearchCustomerId(customerId.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Lookup</CardTitle>
        <CardDescription>
          Search for customer information by Customer ID
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter Customer ID"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={!customerId.trim() || isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {error && (
          <div className="p-4 text-sm text-red-600 bg-red-50 rounded-md">
            Error: {error instanceof Error ? error.message : 'Failed to fetch customer'}
          </div>
        )}

        {customer && (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <p className="mt-1 text-sm text-gray-900">{customer.firstName || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <p className="mt-1 text-sm text-gray-900">{customer.lastName || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{customer.emailAddress?.primary || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mobile</label>
                <p className="mt-1 text-sm text-gray-900">{customer.mobileNumber?.primary || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <p className="mt-1 text-sm text-gray-900">{customer.dateOfBirth || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Salesforce Contact ID</label>
                <p className="mt-1 text-sm text-gray-900">{customer.sfContactId || 'N/A'}</p>
              </div>
            </div>

            {customer.addresses && customer.addresses.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                {customer.addresses.map((address, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-md mb-2">
                    <p className="text-sm text-gray-900">
                      {[address.addressLine1, address.addressLine2, address.city, address.postcode]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                    {address.isCurrentAddress && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                        Current Address
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {customer.accounts && customer.accounts.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Accounts</label>
                <div className="space-y-2">
                  {customer.accounts.map((account, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">ID:</span> {account.id}
                      </p>
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">Type:</span> {account.type}
                      </p>
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