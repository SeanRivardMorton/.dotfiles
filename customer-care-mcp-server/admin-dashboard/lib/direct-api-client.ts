import axios, { AxiosInstance } from "axios";

// Environment configuration
interface EnvironmentConfig {
  customerCareApiBaseUrl: string;
  customerApiBaseUrl: string;
  accountsApiBaseUrl: string;
  cardsApiBaseUrl: string;
  transactionsApiBaseUrl: string;
  onboardingApiBaseUrl: string;
  awsSecretName: string;
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  const env = process.env.ENVIRONMENT || "staging";

  const configs: Record<string, EnvironmentConfig> = {
    staging: {
      customerCareApiBaseUrl:
        "http://internal-api.staging.onmo.app/customer-care/v1",
      customerApiBaseUrl:
        "https://internal-api.staging.onmo.app/service/customers/v2",
      accountsApiBaseUrl:
        "https://internal-api.staging.onmo.app/service/accounts/v5",
      cardsApiBaseUrl: "https://internal-api.staging.onmo.app/service/cards/v1",
      transactionsApiBaseUrl:
        "https://internal-api.staging.onmo.app/service/transactions/v2",
      onboardingApiBaseUrl:
        "https://internal-api.staging.onmo.app/service/onboarding/v1",
      awsSecretName: "mcp-server/customer-care-api-key",
    },
    production: {
      customerCareApiBaseUrl: "http://internal-api.onmo.app/customer-care/v1",
      customerApiBaseUrl: "https://internal-api.onmo.app/service/customers/v2",
      accountsApiBaseUrl: "https://internal-api.onmo.app/service/accounts/v5",
      cardsApiBaseUrl: "https://internal-api.onmo.app/service/cards/v1",
      transactionsApiBaseUrl:
        "https://internal-api.onmo.app/service/transactions/v2",
      onboardingApiBaseUrl:
        "https://internal-api.onmo.app/service/onboarding/v1",
      awsSecretName: "mcp-server/customer-care-api-key-prod",
    },
  };

  return configs[env] || configs.staging;
};

export class DirectApiClient {
  private client: AxiosInstance;
  private customerClient: AxiosInstance;
  private accountsClient: AxiosInstance;
  private cardsClient: AxiosInstance;
  private transactionsClient: AxiosInstance;
  private onboardingClient: AxiosInstance;
  private databricksClient: AxiosInstance;

  constructor() {
    const config = getEnvironmentConfig();
    const apiKey = process.env.CUSTOMER_CARE_API_TOKEN || 
                   process.env.NEXT_PUBLIC_API_TOKEN ||
                   "96619bb73e4907e8d7849fef57601816f4e9c19e4ad32cad1ce420e1251edc95";

    console.log(
      "[DirectApiClient] Initializing with environment:",
      process.env.ENVIRONMENT || "staging",
    );
    console.log(
      "[DirectApiClient] API Key source:",
      process.env.CUSTOMER_CARE_API_TOKEN
        ? "CUSTOMER_CARE_API_TOKEN"
        : process.env.NEXT_PUBLIC_API_TOKEN
          ? "NEXT_PUBLIC_API_TOKEN"
          : "default hardcoded key",
    );
    console.log("[DirectApiClient] API Key length:", apiKey.length);
    console.log(
      "[DirectApiClient] API Key preview:",
      apiKey.substring(0, 10) + "...",
    );

    const authHeaders = {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // Customer Care API client
    this.client = axios.create({
      baseURL:
        process.env.CUSTOMER_CARE_API_BASE_URL || config.customerCareApiBaseUrl,
      timeout: 30000,
      headers: authHeaders,
    });

    // Customer Management API client
    this.customerClient = axios.create({
      baseURL: process.env.CUSTOMER_API_BASE_URL || config.customerApiBaseUrl,
      timeout: 30000,
      headers: authHeaders,
    });

    // Add request interceptor for debugging
    this.customerClient.interceptors.request.use(
      (config) => {
        console.log("[CustomerAPI] Request:", {
          method: config.method,
          url: config.url,
          baseURL: config.baseURL,
          headers: config.headers,
          fullURL: `${config.baseURL}${config.url}`,
        });
        return config;
      },
      (error) => {
        console.error("[CustomerAPI] Request Error:", error);
        return Promise.reject(error);
      },
    );

    // Add response interceptor for debugging
    this.customerClient.interceptors.response.use(
      (response) => {
        console.log("[CustomerAPI] Response:", {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
        return response;
      },
      (error) => {
        if (error.response) {
          console.error("[CustomerAPI] Response Error:", {
            status: error.response.status,
            statusText: error.response.statusText,
            headers: error.response.headers,
            data: error.response.data,
          });
        }
        return Promise.reject(error);
      },
    );

    // Accounts API client
    this.accountsClient = axios.create({
      baseURL: process.env.ACCOUNTS_API_BASE_URL || config.accountsApiBaseUrl,
      timeout: 30000,
      headers: authHeaders,
    });

    // Cards API client
    this.cardsClient = axios.create({
      baseURL: process.env.CARDS_API_BASE_URL || config.cardsApiBaseUrl,
      timeout: 30000,
      headers: authHeaders,
    });

    // Transactions API client
    this.transactionsClient = axios.create({
      baseURL:
        process.env.TRANSACTIONS_API_BASE_URL || config.transactionsApiBaseUrl,
      timeout: 30000,
      headers: authHeaders,
    });

    // Onboarding API client
    this.onboardingClient = axios.create({
      baseURL:
        process.env.ONBOARDING_API_BASE_URL || config.onboardingApiBaseUrl,
      timeout: 30000,
      headers: authHeaders,
    });

    // Databricks client
    this.databricksClient = axios.create({
      baseURL: process.env.DATABRICKS_BASE_URL || "",
      timeout: 60000,
      headers: {
        Authorization: `Bearer ${process.env.DATABRICKS_TOKEN || ""}`,
        "Content-Type": "application/json",
      },
    });
  }

  // Customer Care API methods
  async getArrearDetails(loanAccountId: string) {
    const response = await this.client.get(`/arrears/${loanAccountId}/`);
    return response.data;
  }

  async updateArrearDetails(loanAccountId: string, data: any) {
    const response = await this.client.post(`/arrears/${loanAccountId}/`, data);
    return response.data;
  }

  async getFinancials(loanAccountId: string) {
    const response = await this.client.get(
      `/arrears/${loanAccountId}/financial`,
    );
    return response.data;
  }

  async updateFinancials(loanAccountId: string, data: any) {
    const response = await this.client.post(
      `/arrears/${loanAccountId}/financial`,
      data,
    );
    return response.data;
  }

  async getArrearsDebts(loanAccountId: string) {
    const response = await this.client.get(
      `/arrears/${loanAccountId}/financials/debt`,
    );
    return response.data;
  }

  async getBudgetTotals(loanAccountId: string) {
    const response = await this.client.get(
      `/arrears/${loanAccountId}/financials/budget`,
    );
    return response.data;
  }

  async getPlans(loanAccountId: string) {
    const response = await this.client.get(`/arrears/${loanAccountId}/plans`);
    return response.data;
  }

  // Customer Management API methods
  async getCustomer(custId: string) {
    try {
      console.log(`[DirectApiClient] Fetching customer: ${custId}`);
      console.log(
        `[DirectApiClient] Customer API base URL: ${this.customerClient.defaults.baseURL}`,
      );
      console.log(
        `[DirectApiClient] Full URL: ${this.customerClient.defaults.baseURL}/${custId}`,
      );
      console.log(
        `[DirectApiClient] Headers:`,
        this.customerClient.defaults.headers,
      );

      const response = await this.customerClient.get(`/${custId}`);
      console.log(
        `[DirectApiClient] Customer fetch successful, status: ${response.status}`,
      );
      return response.data;
    } catch (error: any) {
      console.error(`[DirectApiClient] Error fetching customer ${custId}:`);
      console.error(`[DirectApiClient] Error type: ${error.constructor.name}`);
      console.error(`[DirectApiClient] Error message: ${error.message}`);

      if (error.response) {
        console.error(
          `[DirectApiClient] Response status: ${error.response.status}`,
        );
        console.error(
          `[DirectApiClient] Response statusText: ${error.response.statusText}`,
        );
        console.error(
          `[DirectApiClient] Response headers:`,
          error.response.headers,
        );
        console.error(`[DirectApiClient] Response data:`, error.response.data);
      } else if (error.request) {
        console.error(
          `[DirectApiClient] Request made but no response received`,
        );
        console.error(`[DirectApiClient] Request:`, error.request);
      } else {
        console.error(
          `[DirectApiClient] Error setting up request:`,
          error.message,
        );
      }

      throw error;
    }
  }

  async updateCustomer(custId: string, data: any) {
    const response = await this.customerClient.patch(`/${custId}`, data);
    return response.data;
  }

  async getCustomerCommunicationPreferences(custId: string) {
    const response = await this.customerClient.get(
      `/${custId}/communications-preferences`,
    );
    return response.data;
  }

  async updateCustomerCommunicationPreferences(
    custId: string,
    preferences: any,
  ) {
    const response = await this.customerClient.patch(
      `/${custId}/communications-preferences`,
      preferences,
    );
    return response.data;
  }

  async generateOTP(custId: string) {
    const response = await this.customerClient.post(`/${custId}/generate-otp`);
    return response.data;
  }

  async resetPasscode(custId: string) {
    const response = await this.customerClient.post(
      `/${custId}/reset-passcode`,
    );
    return response.data;
  }

  async verifyToken(token: string) {
    const response = await this.customerClient.post("/idv", { token });
    return response.data;
  }

  // Account Management API methods
  async getAccount(accountId: string) {
    const response = await this.accountsClient.get(`/credit/${accountId}`);
    return response.data;
  }

  // Card Management API methods
  async getCard(cardId: string) {
    const response = await this.cardsClient.get(`/${cardId}`);
    return response.data;
  }

  async voidCard(cardId: string, data?: { lost?: boolean; stolen?: boolean }) {
    const response = await this.cardsClient.post(`/${cardId}/void`, data || {});
    return response.data;
  }

  async freezeCard(cardId: string) {
    const response = await this.cardsClient.post(`/${cardId}/freeze`);
    return response.data;
  }

  async unfreezeCard(cardId: string) {
    const response = await this.cardsClient.post(`/${cardId}/unfreeze`);
    return response.data;
  }

  async getCardPinStatus(cardId: string) {
    const response = await this.cardsClient.get(`/${cardId}/pin-status`);
    return response.data;
  }

  // Transactions API methods
  async getTransactions(
    accountId: string,
    startDate: string,
    endDate: string,
    transactionView?: "CUSTOMER_VIEW" | "FULL_VIEW",
  ) {
    const params: any = { startDate, endDate };
    if (transactionView) {
      params.transactionView = transactionView;
    }

    const response = await this.transactionsClient.get(
      `/accounts/${accountId}`,
      { params },
    );
    return response.data;
  }

  async applyFee(
    accountId: string,
    feeRequest: {
      applyDate: string;
      feeType:
        | "OVER_LIMIT"
        | "LATE"
        | "FAILED_PAYMENT"
        | "ATM"
        | "FX"
        | "FIRST_MONTH_INTEREST";
      externalId: string;
      notes: string;
      amount?: number;
      coreBankingAccountType?: "CREDIT";
    },
  ) {
    const response = await this.transactionsClient.post(
      `/accounts/${accountId}/apply-fee`,
      feeRequest,
    );
    return response.data;
  }

  async adjustTransaction(
    transactionId: string,
    adjustRequest: {
      notes: string;
      coreBankingAccountType?: "CREDIT";
    },
  ) {
    const response = await this.transactionsClient.post(
      `/${transactionId}/adjust`,
      adjustRequest,
    );
    return response.data;
  }

  // Credit Card Onboarding API methods
  async createApplication(applicationData: any) {
    const response = await this.onboardingClient.post(
      "/applications",
      applicationData,
    );
    return response.data;
  }

  async updateContact(applicationId: string, contactData: any) {
    const response = await this.onboardingClient.patch(
      `/applications/${applicationId}/contact`,
      contactData,
    );
    return response.data;
  }

  async updateIncome(applicationId: string, incomeData: any) {
    const response = await this.onboardingClient.patch(
      `/applications/${applicationId}/income`,
      incomeData,
    );
    return response.data;
  }

  async getApplicationStatus(applicationId: string) {
    const response = await this.onboardingClient.get(
      `/applications/${applicationId}/status`,
    );
    return response.data;
  }

  async acceptOffer(applicationId: string, offerData: any) {
    const response = await this.onboardingClient.post(
      `/applications/${applicationId}/accept-offer`,
      offerData,
    );
    return response.data;
  }

  async getAggregatorData(applicationId: string) {
    const response = await this.onboardingClient.get(
      `/applications/${applicationId}/aggregator`,
    );
    return response.data;
  }

  async getDocuments(applicationId: string) {
    const response = await this.onboardingClient.get(
      `/applications/${applicationId}/documents`,
    );
    return response.data;
  }

  async authorize(authData: any) {
    const response = await this.onboardingClient.post(
      "/oauth/authorize",
      authData,
    );
    return response.data;
  }

  async getToken(tokenData: any) {
    const response = await this.onboardingClient.post(
      "/oauth/token",
      tokenData,
    );
    return response.data;
  }

  async verifyOTP(transactionId: string, otpData: any) {
    const response = await this.onboardingClient.post(
      `/oauth/verify/${transactionId}`,
      otpData,
    );
    return response.data;
  }

  // Databricks API methods
  async executeDatabricksQuery(
    warehouse_id: string,
    statement: string,
    catalog?: string,
    schema?: string,
    parameters?: Record<string, any>,
  ) {
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

  async getDatabricksQueryStatus(statement_id: string) {
    const response = await this.databricksClient.get(
      `/api/2.0/sql/statements/${statement_id}`,
    );
    return response.data;
  }

  async getDatabricksQueryResults(statement_id: string, chunk_index = 0) {
    const response = await this.databricksClient.get(
      `/api/2.0/sql/statements/${statement_id}/result`,
      { params: { chunk_index } },
    );
    return response.data;
  }

  async cancelDatabricksQuery(statement_id: string) {
    const response = await this.databricksClient.post(
      `/api/2.0/sql/statements/${statement_id}/cancel`,
    );
    return response.data;
  }

  async executeDatabricksQueryAndWait(
    warehouse_id: string,
    statement: string,
    catalog?: string,
    schema?: string,
    parameters?: Record<string, any>,
    max_wait_time = 30000,
  ) {
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
}

// Export singleton instance
export const directApiClient = new DirectApiClient();

