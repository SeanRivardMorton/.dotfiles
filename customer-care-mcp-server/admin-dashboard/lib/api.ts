// API client for direct API endpoints
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export interface Customer {
  firstName?: string;
  lastName?: string;
  emailAddress?: {
    primary?: string;
    others?: string[];
    isEmailValidated?: boolean;
  };
  addresses?: Array<{
    city?: string;
    country?: string;
    addressLine1?: string;
    addressLine2?: string;
    postcode?: string;
    region?: string;
    dateMovedIn?: string;
    dateMovedOut?: string;
    isCurrentAddress?: boolean;
  }>;
  dateOfBirth?: string;
  mobileNumber?: {
    primary?: string;
    others?: string[];
  };
  accounts?: Array<{
    type?: string;
    id?: string;
  }>;
  sfContactId?: string | null;
}

export interface CreditCardAccount {
  accountDetails: {
    accountId: string;
    customerId: string;
    state: string;
    accountState: string;
    additionalAccountState: string | null;
    inArrearsDate: string | null;
    isInArrears: boolean;
    creditLimit: number | null;
    availableCredit: number;
    apr: number;
    startOfBillingCycle: string;
    nextStatementDueDate: string | null;
    daysLate: number | null;
  };
  directDebitSettings: {
    amountPreference: string | null;
    mandateID: string | null;
    mandateReference: string | null;
    provider: string | null;
    nextDirectDebitAmount: number | null;
    scheduledDirectDebitAmount: number | null;
    directDebitRetryInProgress: boolean;
    directDebitRetryDate: string | null;
    directDebitPreventRetryDate: string | null;
    directDebitAvoidFeeCutOffDate: string | null;
  };
  accountBalances: {
    totalNextMinimumPaymentDue: number | null;
    balances: {
      total: number;
      principal: number;
      interest: number;
      fees: number;
    };
    arrearBalances: {
      total: number | null;
      principal: number | null;
      interest: number | null;
      fees: number | null;
    };
    due: {
      total: number;
      principal: number;
      interest: number;
      fees: number;
    };
  };
  cards: Array<{
    cardId: string;
    state: string;
    isActivated: boolean;
    hasPinSet: boolean;
  }>;
  paymentPlans: Array<{
    type: string;
    status: string;
    amount: string;
    startDate: string;
    endDate: string;
  }>;
}

export interface TransactionData {
  accountId: string;
  transactionId: string;
  cardId: string | null;
  title: string;
  terminalId?: string | null;
  settlementId?: string | null;
  onmoTransactionType: string;
  cardTransactionType: string | null;
  packetType?: string | null;
  status: 'PENDING' | 'SETTLED' | 'DECLINED';
  declineReason: string | null;
  sourceAmount: number | null;
  destinationAmount: number | null;
  feeAmount: number | null;
  currencyCode: string;
  sourceToBaseExchangeRate?: number | null;
  baseToDestinationExchangeRate?: number | null;
  dateTime: string;
  merchantInfo: {
    merchantName: string | null;
    merchantCountryCode: string | null;
    merchantPostCode: string | null;
    merchantCity: string | null;
    merchantCategoryCode: string | null;
  };
}

class ApiClient {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Customer Management
  async getCustomer(custId: string): Promise<Customer> {
    return this.makeRequest<Customer>(`/api/customer/${custId}`);
  }

  async updateCustomer(custId: string, data: Partial<Customer>): Promise<void> {
    return this.makeRequest<void>(`/api/customer/${custId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Account Management
  async getAccount(accountId: string): Promise<CreditCardAccount> {
    return this.makeRequest<CreditCardAccount>(`/api/account/${accountId}`);
  }

  // Card Management
  async getCard(cardId: string): Promise<unknown> {
    return this.makeRequest(`/api/card/${cardId}`);
  }

  async voidCard(cardId: string, options: { lost?: boolean; stolen?: boolean } = {}): Promise<unknown> {
    return this.makeRequest(`/api/card/${cardId}/void`, {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }

  async freezeCard(cardId: string): Promise<unknown> {
    return this.makeRequest(`/api/card/${cardId}/freeze`, {
      method: 'POST',
    });
  }

  async unfreezeCard(cardId: string): Promise<unknown> {
    return this.makeRequest(`/api/card/${cardId}/unfreeze`, {
      method: 'POST',
    });
  }

  // Transactions
  async getTransactions(
    accountId: string,
    startDate: string,
    endDate: string,
    transactionView: 'CUSTOMER_VIEW' | 'FULL_VIEW' = 'CUSTOMER_VIEW'
  ): Promise<{ transactions: TransactionData[] }> {
    const params = new URLSearchParams({
      startDate,
      endDate,
      transactionView,
    });
    return this.makeRequest<{ transactions: TransactionData[] }>(`/api/account/${accountId}/transactions?${params}`);
  }

  async applyFee(accountId: string, data: {
    applyDate: string;
    feeType: 'OVER_LIMIT' | 'LATE' | 'FAILED_PAYMENT' | 'ATM' | 'FX' | 'FIRST_MONTH_INTEREST';
    externalId: string;
    notes: string;
    amount?: number;
    coreBankingAccountType?: 'CREDIT';
  }): Promise<unknown> {
    return this.makeRequest(`/api/account/${accountId}/fee`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async adjustTransaction(transactionId: string, data: {
    notes: string;
    coreBankingAccountType?: 'CREDIT';
  }): Promise<unknown> {
    return this.makeRequest(`/api/transaction/${transactionId}/adjust`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Databricks queries
  async executeDatabricksQuery(data: {
    warehouse_id: string;
    statement: string;
    catalog?: string;
    schema?: string;
    parameters?: Record<string, unknown>;
  }): Promise<unknown> {
    return this.makeRequest('/api/databricks/execute', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getDatabricksQueryStatus(statement_id: string): Promise<unknown> {
    return this.makeRequest(`/api/databricks/status/${statement_id}`);
  }

  async getDatabricksQueryResults(statement_id: string, chunk_index = 0): Promise<unknown> {
    return this.makeRequest(`/api/databricks/results/${statement_id}?chunk_index=${chunk_index}`);
  }
}

export const apiClient = new ApiClient();