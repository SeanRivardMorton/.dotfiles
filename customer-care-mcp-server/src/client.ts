import axios, { AxiosInstance } from "axios";
import {
  ArrearDetails,
  Financials,
  ArrearsDebts,
  BudgetTotals,
  PlanDetail,
  Customer,
  ContactPreferences,
  ContactPreferencesUpdate,
  CustomerUpdate,
  OTPResponse,
  TokenVerification,
  TokenVerificationResponse,
  CreditCardAccount,
  CardDetails,
  VoidCardRequest,
  VoidCardResponse,
  PinStatusResponse,
  TransactionsResponse,
  ApplyFeeRequest,
  ApplyFeeResponse,
  AdjustTransactionRequest,
  AdjustTransactionResponse,
  CreateApplicationRequest,
  CreateApplicationResponse,
  UpdateContactRequest,
  UpdateContactResponse,
  UpdateIncomeRequest,
  UpdateIncomeResponse,
  ApplicationStatusResponse,
  AcceptOfferRequest,
  AcceptOfferResponse,
  AggregatorResponse,
  DocumentsResponse,
  AuthorizeRequest,
  AuthorizeResponse,
  TokenRequest,
  TokenResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
} from "./types";

export class CustomerCareClient {
  private client: AxiosInstance;
  private customerClient: AxiosInstance;
  private accountsClient: AxiosInstance;
  private cardsClient: AxiosInstance;
  private transactionsClient: AxiosInstance;
  private onboardingClient: AxiosInstance;
  private databricksClient: AxiosInstance;

  constructor(
    baseURL: string = "http://internal-api.staging.onmo.app/customer-care/v1",
    customerBaseURL: string = "https://partner.staging.onmo.app/service/customers/v2",
    accountsBaseURL: string = "https://internal.staging.onmo.app/service/accounts/v5",
    cardsBaseURL: string = "https://internal-api.staging.onmo.app/service/cards/v1",
    transactionsBaseURL: string = "https://internal-api.staging.onmo.app/service/transactions/v2",
    onboardingBaseURL: string = "https://internal-api.staging.onmo.app/service/onboarding/v1",
    apiKey: string = "bf03ed2e65e71d5c0897f3ec995dbc1ee1eb085c4d4a6edcf6337ba63906fee7",
  ) {
    const authHeaders = {
      "x-api-key":
        "96619bb73e4907e8d7849fef57601816f4e9c19e4ad32cad1ce420e1251edc95",
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // Customer Care API client
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: authHeaders,
    });

    // Customer Management API client
    this.customerClient = axios.create({
      baseURL: customerBaseURL,
      timeout: 30000,
      headers: authHeaders,
    });

    // Accounts API client
    this.accountsClient = axios.create({
      baseURL: accountsBaseURL,
      timeout: 30000,
      headers: authHeaders,
    });

    // Cards API client
    this.cardsClient = axios.create({
      baseURL: cardsBaseURL,
      timeout: 30000,
      headers: authHeaders,
    });

    // Transactions API client
    this.transactionsClient = axios.create({
      baseURL: transactionsBaseURL,
      timeout: 30000,
      headers: authHeaders,
    });

    // Onboarding API client
    this.onboardingClient = axios.create({
      baseURL: onboardingBaseURL,
      timeout: 30000,
      headers: authHeaders,
    });

    // Databricks API client
    this.databricksClient = axios.create({
      baseURL: process.env.DATABRICKS_BASE_URL || "",
      timeout: 60000,
      headers: {
        Authorization: `Bearer ${process.env.DATABRICKS_TOKEN || ""}`,
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Set API key for authentication
   */
  setApiKey(apiKey: string) {
    this.client.defaults.headers.common["x-api-key"] = apiKey;
    this.customerClient.defaults.headers.common["x-api-key"] = apiKey;
    this.accountsClient.defaults.headers.common["x-api-key"] = apiKey;
    this.cardsClient.defaults.headers.common["x-api-key"] = apiKey;
    this.transactionsClient.defaults.headers.common["x-api-key"] = apiKey;
    this.onboardingClient.defaults.headers.common["x-api-key"] = apiKey;
  }

  /**
   * Get arrear details for a loan account
   */
  async getArrearDetails(loanAccountId: string): Promise<ArrearDetails> {
    const response = await this.client.get(`/arrears/${loanAccountId}/`);
    return response.data;
  }

  /**
   * Update arrear details for a loan account
   */
  async updateArrearDetails(
    loanAccountId: string,
    data: Partial<ArrearDetails>,
  ): Promise<ArrearDetails> {
    const response = await this.client.post(`/arrears/${loanAccountId}/`, data);
    return response.data;
  }

  /**
   * Get financial details for a loan account
   */
  async getFinancials(loanAccountId: string): Promise<Financials> {
    const response = await this.client.get(
      `/arrears/${loanAccountId}/financial`,
    );
    return response.data;
  }

  /**
   * Update financial details for a loan account
   */
  async updateFinancials(
    loanAccountId: string,
    data: Partial<Financials>,
  ): Promise<Financials> {
    const response = await this.client.post(
      `/arrears/${loanAccountId}/financial`,
      data,
    );
    return response.data;
  }

  /**
   * Get arrears debts for a loan account
   */
  async getArrearsDebts(loanAccountId: string): Promise<ArrearsDebts> {
    const response = await this.client.get(
      `/arrears/${loanAccountId}/financials/debt`,
    );
    return response.data;
  }

  /**
   * Get budget totals for a loan account
   */
  async getBudgetTotals(loanAccountId: string): Promise<BudgetTotals> {
    const response = await this.client.get(
      `/arrears/${loanAccountId}/financials/budget`,
    );
    return response.data;
  }

  /**
   * Get available plans for a loan account
   */
  async getPlans(loanAccountId: string): Promise<PlanDetail[]> {
    const response = await this.client.get(`/arrears/${loanAccountId}/plans`);
    return response.data;
  }

  // Customer Management API methods

  /**
   * Get customer details by customer ID
   */
  async getCustomer(custId: string): Promise<Customer> {
    const response = await this.customerClient.get(`/${custId}`);
    return response.data;
  }

  /**
   * Update customer details
   */
  async updateCustomer(
    custId: string,
    data: CustomerUpdate,
  ): Promise<{ message: string }> {
    const response = await this.customerClient.patch(`/${custId}`, data);
    return response.data;
  }

  /**
   * Get customer communication preferences
   */
  async getCustomerCommunicationPreferences(
    custId: string,
  ): Promise<ContactPreferences> {
    const response = await this.customerClient.get(
      `/${custId}/communications-preferences`,
    );
    return response.data;
  }

  /**
   * Update customer communication preferences
   */
  async updateCustomerCommunicationPreferences(
    custId: string,
    preferences: ContactPreferencesUpdate,
  ): Promise<{ message: string }> {
    const response = await this.customerClient.patch(
      `/${custId}/communications-preferences`,
      preferences,
    );
    return response.data;
  }

  /**
   * Generate OTP for customer verification
   */
  async generateOTP(custId: string): Promise<OTPResponse> {
    const response = await this.customerClient.post(`/${custId}/generate-otp`);
    return response.data;
  }

  /**
   * Reset customer passcode
   */
  async resetPasscode(custId: string): Promise<{ message: string }> {
    const response = await this.customerClient.post(
      `/${custId}/reset-passcode`,
    );
    return response.data;
  }

  /**
   * Verify customer access token
   */
  async verifyToken(token: string): Promise<TokenVerificationResponse> {
    const response = await this.customerClient.post("/idv", { token });
    return response.data;
  }

  // Account Management API methods

  /**
   * Get credit card account details by account ID
   */
  async getAccount(accountId: string): Promise<CreditCardAccount> {
    const response = await this.accountsClient.get(`/credit/${accountId}`);
    return response.data;
  }

  // Card Management API methods

  /**
   * Get card details by card ID
   */
  async getCard(cardId: string): Promise<CardDetails> {
    const response = await this.cardsClient.get(`/${cardId}`);
    return response.data;
  }

  /**
   * Void a card
   */
  async voidCard(
    cardId: string,
    data?: VoidCardRequest,
  ): Promise<VoidCardResponse> {
    const response = await this.cardsClient.post(`/${cardId}/void`, data || {});
    return response.data;
  }

  /**
   * Freeze a card
   */
  async freezeCard(cardId: string): Promise<{ message: string }> {
    const response = await this.cardsClient.post(`/${cardId}/freeze`);
    return response.data;
  }

  /**
   * Unfreeze a card
   */
  async unfreezeCard(cardId: string): Promise<{ message: string }> {
    const response = await this.cardsClient.post(`/${cardId}/unfreeze`);
    return response.data;
  }

  /**
   * Get card PIN status
   */
  async getCardPinStatus(cardId: string): Promise<PinStatusResponse> {
    const response = await this.cardsClient.get(`/${cardId}/pin-status`);
    return response.data;
  }

  // Transactions API methods

  /**
   * Get transactions for an account within a date range
   */
  async getTransactions(
    accountId: string,
    startDate: string,
    endDate: string,
    transactionView?: "CUSTOMER_VIEW" | "FULL_VIEW",
  ): Promise<TransactionsResponse> {
    const params: any = {
      startDate,
      endDate,
    };

    if (transactionView) {
      params.transactionView = transactionView;
    }

    const response = await this.transactionsClient.get(
      `/accounts/${accountId}`,
      {
        params,
      },
    );
    return response.data;
  }

  /**
   * Apply a fee to an account
   */
  async applyFee(
    accountId: string,
    feeRequest: ApplyFeeRequest,
  ): Promise<ApplyFeeResponse> {
    const response = await this.transactionsClient.post(
      `/accounts/${accountId}/apply-fee`,
      feeRequest,
    );
    return response.data;
  }

  /**
   * Adjust a transaction
   */
  async adjustTransaction(
    transactionId: string,
    adjustRequest: AdjustTransactionRequest,
  ): Promise<AdjustTransactionResponse> {
    const response = await this.transactionsClient.post(
      `/${transactionId}/adjust`,
      adjustRequest,
    );
    return response.data;
  }

  // Credit Card Onboarding API methods

  /**
   * Create a new credit card application
   */
  async createApplication(
    applicationData: CreateApplicationRequest,
  ): Promise<CreateApplicationResponse> {
    const response = await this.onboardingClient.post(
      "/applications",
      applicationData,
    );
    return response.data;
  }

  /**
   * Update contact information for an application
   */
  async updateContact(
    applicationId: string,
    contactData: UpdateContactRequest,
  ): Promise<UpdateContactResponse> {
    const response = await this.onboardingClient.patch(
      `/applications/${applicationId}/contact`,
      contactData,
    );
    return response.data;
  }

  /**
   * Update income information for an application
   */
  async updateIncome(
    applicationId: string,
    incomeData: UpdateIncomeRequest,
  ): Promise<UpdateIncomeResponse> {
    const response = await this.onboardingClient.patch(
      `/applications/${applicationId}/income`,
      incomeData,
    );
    return response.data;
  }

  /**
   * Get application status
   */
  async getApplicationStatus(
    applicationId: string,
  ): Promise<ApplicationStatusResponse> {
    const response = await this.onboardingClient.get(
      `/applications/${applicationId}/status`,
    );
    return response.data;
  }

  /**
   * Accept an offer for an application
   */
  async acceptOffer(
    applicationId: string,
    offerData: AcceptOfferRequest,
  ): Promise<AcceptOfferResponse> {
    const response = await this.onboardingClient.post(
      `/applications/${applicationId}/accept-offer`,
      offerData,
    );
    return response.data;
  }

  /**
   * Get aggregator data for an application
   */
  async getAggregatorData(applicationId: string): Promise<AggregatorResponse> {
    const response = await this.onboardingClient.get(
      `/applications/${applicationId}/aggregator`,
    );
    return response.data;
  }

  /**
   * Get documents for an application
   */
  async getDocuments(applicationId: string): Promise<DocumentsResponse> {
    const response = await this.onboardingClient.get(
      `/applications/${applicationId}/documents`,
    );
    return response.data;
  }

  /**
   * Authorize OAuth flow
   */
  async authorize(authData: AuthorizeRequest): Promise<AuthorizeResponse> {
    const response = await this.onboardingClient.post(
      "/oauth/authorize",
      authData,
    );
    return response.data;
  }

  /**
   * Get OAuth token
   */
  async getToken(tokenData: TokenRequest): Promise<TokenResponse> {
    const response = await this.onboardingClient.post(
      "/oauth/token",
      tokenData,
    );
    return response.data;
  }

  /**
   * Verify OTP
   */
  async verifyOTP(
    transactionId: string,
    otpData: VerifyOTPRequest,
  ): Promise<VerifyOTPResponse> {
    const response = await this.onboardingClient.post(
      `/oauth/verify/${transactionId}`,
      otpData,
    );
    return response.data;
  }

  // Databricks API methods

  /**
   * Execute a SQL query on Databricks
   */
  async executeDatabricksQuery(
    warehouse_id: string,
    statement: string,
    catalog?: string,
    schema?: string,
    parameters?: Record<string, any>,
  ): Promise<any> {
    const requestBody: any = {
      warehouse_id,
      statement,
    };

    if (catalog) requestBody.catalog = catalog;
    if (schema) requestBody.schema = schema;
    if (parameters) requestBody.parameters = parameters;

    const response = await this.databricksClient.post(
      "/api/2.0/sql/statements/",
      requestBody,
    );
    return response.data;
  }

  /**
   * Get the status of a Databricks query
   */
  async getDatabricksQueryStatus(statement_id: string): Promise<any> {
    const response = await this.databricksClient.get(
      `/api/2.0/sql/statements/${statement_id}`,
    );
    return response.data;
  }

  /**
   * Get the results of a completed Databricks query
   */
  async getDatabricksQueryResults(statement_id: string, chunk_index = 0): Promise<any> {
    const response = await this.databricksClient.get(
      `/api/2.0/sql/statements/${statement_id}/result`,
      { params: { chunk_index } },
    );
    return response.data;
  }

  /**
   * Cancel a running Databricks query
   */
  async cancelDatabricksQuery(statement_id: string): Promise<any> {
    const response = await this.databricksClient.post(
      `/api/2.0/sql/statements/${statement_id}/cancel`,
    );
    return response.data;
  }

  /**
   * Execute a SQL query on Databricks and wait for results
   */
  async executeDatabricksQueryAndWait(
    warehouse_id: string,
    statement: string,
    catalog?: string,
    schema?: string,
    parameters?: Record<string, any>,
    max_wait_time = 30000,
  ): Promise<any> {
    // Execute query
    const executeResult = await this.executeDatabricksQuery(
      warehouse_id,
      statement,
      catalog,
      schema,
      parameters,
    );
    const statement_id = executeResult.statement_id;

    const startTime = Date.now();

    // Poll for completion
    while (Date.now() - startTime < max_wait_time) {
      const status = await this.getDatabricksQueryStatus(statement_id);

      if (status.status?.state === "SUCCEEDED") {
        const results = await this.getDatabricksQueryResults(statement_id);
        return { ...status, results };
      } else if (
        status.status?.state === "FAILED" ||
        status.status?.state === "CANCELED"
      ) {
        throw new Error(
          `Query failed: ${status.status?.error?.message || "Unknown error"}`,
        );
      }

      // Wait 1 second before polling again
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    throw new Error("Query timeout exceeded");
  }

  /**
   * Set Databricks token for authentication
   */
  setDatabricksToken(token: string): void {
    this.databricksClient.defaults.headers.Authorization = `Bearer ${token}`;
  }

  /**
   * Set Databricks authentication
   */
  async setDatabricksAuth(auth: {
    type: 'service-principal';
    clientId: string;
    clientSecret: string;
    tenantId: string;
  }): Promise<void> {
    if (auth.type === 'service-principal') {
      // For service principal auth, we would typically need to get an OAuth token
      // This is a placeholder implementation
      throw new Error('Service principal authentication not yet implemented');
    }
  }
}
