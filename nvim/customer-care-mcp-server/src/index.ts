#!/usr/bin/env node

import "dotenv/config";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { CustomerCareClient } from "./client.js";

// AWS Secrets Manager client
const secretsClient = new SecretsManagerClient({
  region: "eu-west-1",
});

// Function to get API key from AWS Secrets Manager
async function getApiKeyFromSecretsManager(): Promise<string> {
  try {
    const secretName = "onmo-service-layer-staging";
    const command = new GetSecretValueCommand({
      SecretId: secretName,
    });

    const response = await secretsClient.send(command);

    if (!response.SecretString) {
      throw new Error("Secret value is empty");
    }

    // Parse the JSON secret
    const secret = JSON.parse(response.SecretString);

    // Extract the API key from the secret structure
    // The secret should contain the API key under one of these keys:
    // - apiKey (camelCase)
    // - api_key (snake_case)
    // - CUSTOMER_CARE_API_TOKEN (uppercase)
    const apiKey =
      secret.apiKey || secret.api_key || secret.CUSTOMER_CARE_API_TOKEN;

    console.log(apiKey);

    if (!apiKey) {
      throw new Error("API key not found in secret");
    }

    return apiKey;
  } catch (error) {
    console.error("Error fetching API key from Secrets Manager:", error);
    // Fallback to environment variable if Secrets Manager fails
    const fallbackApiKey = process.env.CUSTOMER_CARE_API_TOKEN;
    if (!fallbackApiKey) {
      throw new Error(
        "Failed to retrieve API key from both Secrets Manager and environment variables",
      );
    }
    console.warn("Using fallback API key from environment variable");
    return fallbackApiKey;
  }
}

// Create server instance
const server = new Server(
  {
    name: "customer-care-mcp-server",
    version: "1.0.0",
    description: "MCP server for Customer Care Portal APIs",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// Initialize client with custom base URLs - API key will be set later
const baseURL =
  process.env.CUSTOMER_CARE_API_BASE_URL ||
  "http://internal-api.staging.onmo.app/customer-care/v1";
const customerBaseURL =
  process.env.CUSTOMER_API_BASE_URL ||
  "https://internal-api.staging.onmo.app/service/customers/v2";
const accountsBaseURL =
  process.env.ACCOUNTS_API_BASE_URL ||
  "https://internal-api.staging.onmo.app/service/accounts/v5";
const cardsBaseURL =
  process.env.CARDS_API_BASE_URL ||
  "https://internal-api.staging.onmo.app/service/cards/v1";
const transactionsBaseURL =
  process.env.TRANSACTIONS_API_BASE_URL ||
  "https://internal-api.staging.onmo.app/service/transactions/v2";
const onboardingBaseURL =
  process.env.ONBOARDING_API_BASE_URL ||
  "https://internal-api.staging.onmo.app/service/onboarding/v1";

// Initialize client without API key initially
const client = new CustomerCareClient(
  baseURL,
  customerBaseURL,
  accountsBaseURL,
  cardsBaseURL,
  transactionsBaseURL,
  onboardingBaseURL,
);

// Tool schemas
const LoanAccountIdSchema = z.object({
  loan_account_id: z.string().describe("The loan account ID to query"),
});

const UpdateArrearDetailsSchema = z.object({
  loan_account_id: z.string().describe("The loan account ID to update"),
  data: z
    .object({
      payment_delay_reason: z.string().optional(),
      paymet_delay_duration: z.string().optional(),
      additional_information: z.string().optional(),
      payment_ability_date: z.string().optional(),
      payment_ability_status: z.string().optional(),
    })
    .describe("Arrear details to update"),
});

const UpdateFinancialsSchema = z.object({
  loan_account_id: z.string().describe("The loan account ID to update"),
  data: z.record(z.unknown()).describe("Financial data to update"),
});

const CustomerIdSchema = z.object({
  custId: z.string().describe("The customer ID to query"),
});

const UpdateCustomerSchema = z.object({
  custId: z.string().describe("The customer ID to update"),
  data: z
    .object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      emailAddress: z.string().optional(),
      address: z.record(z.unknown()).optional(),
      dateOfBirth: z.string().optional(),
      mobileNumber: z.string().optional(),
      updateSource: z.enum(["salesforce"]).optional(),
    })
    .describe("Customer data to update"),
});

const UpdateCustomerPreferencesSchema = z.object({
  custId: z.string().describe("The customer ID to update"),
  preferences: z
    .object({
      channelPreference: z
        .object({
          email: z.boolean().optional(),
          sms: z.boolean().optional(),
        })
        .optional(),
      financialAdvice: z.boolean().optional(),
      offers: z.boolean().optional(),
      partnerOffers: z.boolean().optional(),
      marketingCommunications: z.boolean().optional(),
      productResearch: z.boolean().optional(),
    })
    .describe("Communication preferences to update"),
});

const TokenVerificationSchema = z.object({
  token: z.string().describe("Access token to verify"),
});

const AccountIdSchema = z.object({
  accountId: z.string().describe("The account ID to query"),
});

const CardIdSchema = z.object({
  cardId: z.string().describe("The card ID to query"),
});

const VoidCardSchema = z.object({
  cardId: z.string().describe("The card ID to void"),
  lost: z
    .boolean()
    .optional()
    .describe("Indicates that the card has been lost"),
  stolen: z
    .boolean()
    .optional()
    .describe("Indicates that the card has been stolen"),
});

const GetTransactionsSchema = z.object({
  accountId: z.string().describe("The account ID to query transactions for"),
  startDate: z.string().describe("Start date in YYYY-MM-DD format"),
  endDate: z.string().describe("End date in YYYY-MM-DD format"),
  transactionView: z
    .enum(["CUSTOMER_VIEW", "FULL_VIEW"])
    .optional()
    .describe("Transaction view mode"),
});

const ApplyFeeSchema = z.object({
  accountId: z.string().describe("The account ID to apply fee to"),
  applyDate: z
    .string()
    .describe("Date when the fee should be applied in YYYY-MM-DD format"),
  feeType: z
    .enum([
      "OVER_LIMIT",
      "LATE",
      "FAILED_PAYMENT",
      "ATM",
      "FX",
      "FIRST_MONTH_INTEREST",
    ])
    .describe("The type of fee being applied"),
  externalId: z
    .string()
    .describe("An external reference ID for tracking the fee"),
  notes: z
    .string()
    .describe("Additional notes or comments related to the fee application"),
  amount: z
    .number()
    .optional()
    .describe("Fee amount, required unless feeType is a fixed fee"),
  coreBankingAccountType: z
    .enum(["CREDIT"])
    .optional()
    .describe("Core banking account type"),
});

const AdjustTransactionSchema = z.object({
  transactionId: z.string().describe("The transaction ID to adjust"),
  notes: z
    .string()
    .describe(
      "Additional notes or comments related to the transaction adjustment",
    ),
  coreBankingAccountType: z
    .enum(["CREDIT"])
    .optional()
    .describe("Core banking account type"),
});

const CreateApplicationSchema = z.object({
  title: z
    .enum([
      "Mr",
      "Mrs",
      "Ms",
      "Miss",
      "Dr",
      "Doctor",
      "Professor",
      "Lady",
      "Lord",
      "Mx",
      "HRH",
      "Unknown",
    ])
    .describe("Title"),
  first_name: z.string().describe("First name"),
  last_name: z.string().describe("Last name"),
  postcode: z.string().describe("Postcode"),
  building_number: z.string().optional().describe("Building number"),
  sub_building_number: z.string().optional().describe("Sub building number"),
  building_name: z.string().optional().describe("Building name"),
  thoroughfare: z.string().describe("Thoroughfare"),
  city: z.string().describe("City"),
  resident_from: z.string().describe("Resident from date"),
  date_of_birth: z.string().describe("Date of birth"),
  source_ip: z.string().describe("Source IP address"),
});

const ApplicationIdSchema = z.object({
  applicationId: z.string().describe("The application ID"),
});

const UpdateContactSchema = z.object({
  applicationId: z.string().describe("The application ID"),
  email_address: z.string().email().describe("Email address"),
  mobile_number: z.string().describe("Mobile number"),
});

const UpdateIncomeSchema = z.object({
  applicationId: z.string().describe("The application ID"),
  net_monthly_income: z.number().describe("Net monthly income"),
  monthly_housing_costs: z.number().describe("Monthly housing costs"),
  employment: z
    .enum([
      "Employed Full Time",
      "Employed Part Time",
      "Self Employed",
      "Not Employed",
      "Retired",
      "Homemaker",
    ])
    .describe("Employment status"),
  other_cost: z.number().describe("Other costs"),
  pay_frequency: z
    .enum(["Monthly", "Weekly", "Fortnightly", "Four-Weekly"])
    .describe("Pay frequency"),
  monthly_credit_commitments: z.number().describe("Monthly credit commitments"),
  bank_account_number: z.string().describe("Bank account number"),
  bank_sort_code: z.string().describe("Bank sort code"),
  zero_hour_contract: z.boolean().describe("Zero hour contract"),
});

const AcceptOfferSchema = z.object({
  applicationId: z.string().describe("The application ID"),
  passcode: z.string().describe("6-digit passcode"),
  payment_day: z.number().describe("Payment day"),
});

const AuthorizeSchema = z.object({
  code_challenge: z.string().describe("Code challenge"),
  mobile_number: z.string().describe("Mobile number"),
});

const TokenSchema = z.object({
  code_verifier: z.string().describe("Code verifier"),
  transaction_id: z.string().describe("Transaction ID"),
  auth_code: z.string().describe("Authorization code"),
});

const VerifyOTPSchema = z.object({
  transaction_id: z.string().describe("Transaction ID"),
  verify_code: z.number().describe("Verification code"),
});

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_arrear_details",
        description: "Get arrear details for a loan account",
        inputSchema: {
          type: "object",
          properties: {
            loan_account_id: {
              type: "string",
              description: "The loan account ID to query",
            },
          },
          required: ["loan_account_id"],
        },
      },
      {
        name: "update_arrear_details",
        description: "Update arrear details for a loan account",
        inputSchema: {
          type: "object",
          properties: {
            loan_account_id: {
              type: "string",
              description: "The loan account ID to update",
            },
            data: {
              type: "object",
              description: "Arrear details to update",
              properties: {
                payment_delay_reason: { type: "string" },
                paymet_delay_duration: { type: "string" },
                additional_information: { type: "string" },
                payment_ability_date: { type: "string" },
                payment_ability_status: { type: "string" },
              },
            },
          },
          required: ["loan_account_id", "data"],
        },
      },
      {
        name: "get_financials",
        description: "Get financial details for a loan account",
        inputSchema: {
          type: "object",
          properties: {
            loan_account_id: {
              type: "string",
              description: "The loan account ID to query",
            },
          },
          required: ["loan_account_id"],
        },
      },
      {
        name: "update_financials",
        description: "Update financial details for a loan account",
        inputSchema: {
          type: "object",
          properties: {
            loan_account_id: {
              type: "string",
              description: "The loan account ID to update",
            },
            data: {
              type: "object",
              description: "Financial data to update",
            },
          },
          required: ["loan_account_id", "data"],
        },
      },
      {
        name: "get_arrears_debts",
        description: "Get arrears debts for a loan account",
        inputSchema: {
          type: "object",
          properties: {
            loan_account_id: {
              type: "string",
              description: "The loan account ID to query",
            },
          },
          required: ["loan_account_id"],
        },
      },
      {
        name: "get_budget_totals",
        description: "Get budget totals for a loan account",
        inputSchema: {
          type: "object",
          properties: {
            loan_account_id: {
              type: "string",
              description: "The loan account ID to query",
            },
          },
          required: ["loan_account_id"],
        },
      },
      {
        name: "get_plans",
        description: "Get available plans for a loan account",
        inputSchema: {
          type: "object",
          properties: {
            loan_account_id: {
              type: "string",
              description: "The loan account ID to query",
            },
          },
          required: ["loan_account_id"],
        },
      },
      {
        name: "get_customer",
        description: "Get customer details by customer ID",
        inputSchema: {
          type: "object",
          properties: {
            custId: {
              type: "string",
              description: "The customer ID to query",
            },
          },
          required: ["custId"],
        },
      },
      {
        name: "update_customer",
        description: "Update customer details",
        inputSchema: {
          type: "object",
          properties: {
            custId: {
              type: "string",
              description: "The customer ID to update",
            },
            data: {
              type: "object",
              description: "Customer data to update",
              properties: {
                firstName: { type: "string" },
                lastName: { type: "string" },
                emailAddress: { type: "string" },
                address: { type: "object" },
                dateOfBirth: { type: "string" },
                mobileNumber: { type: "string" },
                updateSource: { type: "string", enum: ["salesforce"] },
              },
            },
          },
          required: ["custId", "data"],
        },
      },
      {
        name: "get_customer_communication_preferences",
        description: "Get customer communication preferences",
        inputSchema: {
          type: "object",
          properties: {
            custId: {
              type: "string",
              description: "The customer ID to query",
            },
          },
          required: ["custId"],
        },
      },
      {
        name: "update_customer_communication_preferences",
        description: "Update customer communication preferences",
        inputSchema: {
          type: "object",
          properties: {
            custId: {
              type: "string",
              description: "The customer ID to update",
            },
            preferences: {
              type: "object",
              description: "Communication preferences to update",
              properties: {
                channelPreference: {
                  type: "object",
                  properties: {
                    email: { type: "boolean" },
                    sms: { type: "boolean" },
                  },
                },
                financialAdvice: { type: "boolean" },
                offers: { type: "boolean" },
                partnerOffers: { type: "boolean" },
                marketingCommunications: { type: "boolean" },
                productResearch: { type: "boolean" },
              },
            },
          },
          required: ["custId", "preferences"],
        },
      },
      {
        name: "generate_customer_otp",
        description: "Generate OTP for customer verification",
        inputSchema: {
          type: "object",
          properties: {
            custId: {
              type: "string",
              description: "The customer ID to generate OTP for",
            },
          },
          required: ["custId"],
        },
      },
      {
        name: "reset_customer_passcode",
        description: "Reset customer passcode",
        inputSchema: {
          type: "object",
          properties: {
            custId: {
              type: "string",
              description: "The customer ID to reset passcode for",
            },
          },
          required: ["custId"],
        },
      },
      {
        name: "verify_customer_token",
        description: "Verify customer access token",
        inputSchema: {
          type: "object",
          properties: {
            token: {
              type: "string",
              description: "Access token to verify",
            },
          },
          required: ["token"],
        },
      },
      {
        name: "get_account",
        description: "Get credit card account details by account ID",
        inputSchema: {
          type: "object",
          properties: {
            accountId: {
              type: "string",
              description: "The account ID to query",
            },
          },
          required: ["accountId"],
        },
      },
      {
        name: "get_card",
        description: "Get card details by card ID",
        inputSchema: {
          type: "object",
          properties: {
            cardId: {
              type: "string",
              description: "The card ID to query",
            },
          },
          required: ["cardId"],
        },
      },
      {
        name: "void_card",
        description:
          "Void a card. If lost or stolen is true, a new card will be created and delivered",
        inputSchema: {
          type: "object",
          properties: {
            cardId: {
              type: "string",
              description: "The card ID to void",
            },
            lost: {
              type: "boolean",
              description: "Indicates that the card has been lost",
            },
            stolen: {
              type: "boolean",
              description: "Indicates that the card has been stolen",
            },
          },
          required: ["cardId"],
        },
      },
      {
        name: "freeze_card",
        description: "Freeze a card to prevent usage",
        inputSchema: {
          type: "object",
          properties: {
            cardId: {
              type: "string",
              description: "The card ID to freeze",
            },
          },
          required: ["cardId"],
        },
      },
      {
        name: "unfreeze_card",
        description: "Unfreeze a card to allow usage",
        inputSchema: {
          type: "object",
          properties: {
            cardId: {
              type: "string",
              description: "The card ID to unfreeze",
            },
          },
          required: ["cardId"],
        },
      },
      {
        name: "get_card_pin_status",
        description: "Get card PIN status",
        inputSchema: {
          type: "object",
          properties: {
            cardId: {
              type: "string",
              description: "The card ID to check PIN status",
            },
          },
          required: ["cardId"],
        },
      },
      {
        name: "get_transactions",
        description:
          "Get transactions for an account within a date range (max 6 months)",
        inputSchema: {
          type: "object",
          properties: {
            accountId: {
              type: "string",
              description: "The account ID to query transactions for",
            },
            startDate: {
              type: "string",
              description: "Start date in YYYY-MM-DD format",
            },
            endDate: {
              type: "string",
              description: "End date in YYYY-MM-DD format",
            },
            transactionView: {
              type: "string",
              enum: ["CUSTOMER_VIEW", "FULL_VIEW"],
              description: "Transaction view mode",
            },
          },
          required: ["accountId", "startDate", "endDate"],
        },
      },
      {
        name: "apply_fee",
        description: "Apply a fee to an account",
        inputSchema: {
          type: "object",
          properties: {
            accountId: {
              type: "string",
              description: "The account ID to apply fee to",
            },
            applyDate: {
              type: "string",
              description:
                "Date when the fee should be applied in YYYY-MM-DD format",
            },
            feeType: {
              type: "string",
              enum: [
                "OVER_LIMIT",
                "LATE",
                "FAILED_PAYMENT",
                "ATM",
                "FX",
                "FIRST_MONTH_INTEREST",
              ],
              description: "The type of fee being applied",
            },
            externalId: {
              type: "string",
              description: "An external reference ID for tracking the fee",
            },
            notes: {
              type: "string",
              description:
                "Additional notes or comments related to the fee application",
            },
            amount: {
              type: "number",
              description: "Fee amount, required unless feeType is a fixed fee",
            },
            coreBankingAccountType: {
              type: "string",
              enum: ["CREDIT"],
              description: "Core banking account type",
            },
          },
          required: [
            "accountId",
            "applyDate",
            "feeType",
            "externalId",
            "notes",
          ],
        },
      },
      {
        name: "adjust_transaction",
        description: "Adjust a transaction",
        inputSchema: {
          type: "object",
          properties: {
            transactionId: {
              type: "string",
              description: "The transaction ID to adjust",
            },
            notes: {
              type: "string",
              description:
                "Additional notes or comments related to the transaction adjustment",
            },
            coreBankingAccountType: {
              type: "string",
              enum: ["CREDIT"],
              description: "Core banking account type",
            },
          },
          required: ["transactionId", "notes"],
        },
      },
      {
        name: "create_application",
        description: "Create a new credit card application",
        inputSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              enum: [
                "Mr",
                "Mrs",
                "Ms",
                "Miss",
                "Dr",
                "Doctor",
                "Professor",
                "Lady",
                "Lord",
                "Mx",
                "HRH",
                "Unknown",
              ],
              description: "Title",
            },
            first_name: {
              type: "string",
              description: "First name",
            },
            last_name: {
              type: "string",
              description: "Last name",
            },
            postcode: {
              type: "string",
              description: "Postcode",
            },
            building_number: {
              type: "string",
              description: "Building number",
            },
            sub_building_number: {
              type: "string",
              description: "Sub building number",
            },
            building_name: {
              type: "string",
              description: "Building name",
            },
            thoroughfare: {
              type: "string",
              description: "Thoroughfare",
            },
            city: {
              type: "string",
              description: "City",
            },
            resident_from: {
              type: "string",
              description: "Resident from date",
            },
            date_of_birth: {
              type: "string",
              description: "Date of birth",
            },
            source_ip: {
              type: "string",
              description: "Source IP address",
            },
          },
          required: [
            "title",
            "first_name",
            "last_name",
            "postcode",
            "thoroughfare",
            "city",
            "resident_from",
            "date_of_birth",
            "source_ip",
          ],
        },
      },
      {
        name: "get_application_status",
        description: "Get application status",
        inputSchema: {
          type: "object",
          properties: {
            applicationId: {
              type: "string",
              description: "The application ID",
            },
          },
          required: ["applicationId"],
        },
      },
      {
        name: "update_contact",
        description: "Update contact information for an application",
        inputSchema: {
          type: "object",
          properties: {
            applicationId: {
              type: "string",
              description: "The application ID",
            },
            email_address: {
              type: "string",
              description: "Email address",
            },
            mobile_number: {
              type: "string",
              description: "Mobile number",
            },
          },
          required: ["applicationId", "email_address", "mobile_number"],
        },
      },
      {
        name: "update_income",
        description: "Update income information for an application",
        inputSchema: {
          type: "object",
          properties: {
            applicationId: {
              type: "string",
              description: "The application ID",
            },
            net_monthly_income: {
              type: "number",
              description: "Net monthly income",
            },
            monthly_housing_costs: {
              type: "number",
              description: "Monthly housing costs",
            },
            employment: {
              type: "string",
              enum: [
                "Employed Full Time",
                "Employed Part Time",
                "Self Employed",
                "Not Employed",
                "Retired",
                "Homemaker",
              ],
              description: "Employment status",
            },
            other_cost: {
              type: "number",
              description: "Other costs",
            },
            pay_frequency: {
              type: "string",
              enum: ["Monthly", "Weekly", "Fortnightly", "Four-Weekly"],
              description: "Pay frequency",
            },
            monthly_credit_commitments: {
              type: "number",
              description: "Monthly credit commitments",
            },
            bank_account_number: {
              type: "string",
              description: "Bank account number",
            },
            bank_sort_code: {
              type: "string",
              description: "Bank sort code",
            },
            zero_hour_contract: {
              type: "boolean",
              description: "Zero hour contract",
            },
          },
          required: [
            "applicationId",
            "net_monthly_income",
            "monthly_housing_costs",
            "employment",
            "other_cost",
            "pay_frequency",
            "monthly_credit_commitments",
            "bank_account_number",
            "bank_sort_code",
            "zero_hour_contract",
          ],
        },
      },
      {
        name: "accept_offer",
        description: "Accept an offer for an application",
        inputSchema: {
          type: "object",
          properties: {
            applicationId: {
              type: "string",
              description: "The application ID",
            },
            passcode: {
              type: "string",
              description: "6-digit passcode",
            },
            payment_day: {
              type: "number",
              description: "Payment day",
            },
          },
          required: ["applicationId", "passcode", "payment_day"],
        },
      },
      {
        name: "get_aggregator_data",
        description: "Get aggregator data for an application",
        inputSchema: {
          type: "object",
          properties: {
            applicationId: {
              type: "string",
              description: "The application ID",
            },
          },
          required: ["applicationId"],
        },
      },
      {
        name: "get_documents",
        description: "Get documents for an application",
        inputSchema: {
          type: "object",
          properties: {
            applicationId: {
              type: "string",
              description: "The application ID",
            },
          },
          required: ["applicationId"],
        },
      },
      {
        name: "authorize",
        description: "Authorize OAuth flow",
        inputSchema: {
          type: "object",
          properties: {
            code_challenge: {
              type: "string",
              description: "Code challenge",
            },
            mobile_number: {
              type: "string",
              description: "Mobile number",
            },
          },
          required: ["code_challenge", "mobile_number"],
        },
      },
      {
        name: "get_token",
        description: "Get OAuth token",
        inputSchema: {
          type: "object",
          properties: {
            code_verifier: {
              type: "string",
              description: "Code verifier",
            },
            transaction_id: {
              type: "string",
              description: "Transaction ID",
            },
            auth_code: {
              type: "string",
              description: "Authorization code",
            },
          },
          required: ["code_verifier", "transaction_id", "auth_code"],
        },
      },
      {
        name: "verify_otp",
        description: "Verify OTP",
        inputSchema: {
          type: "object",
          properties: {
            transaction_id: {
              type: "string",
              description: "Transaction ID",
            },
            verify_code: {
              type: "number",
              description: "Verification code",
            },
          },
          required: ["transaction_id", "verify_code"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "get_arrear_details": {
        const { loan_account_id } = LoanAccountIdSchema.parse(args);
        const result = await client.getArrearDetails(loan_account_id);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "update_arrear_details": {
        const { loan_account_id, data } = UpdateArrearDetailsSchema.parse(args);
        const result = await client.updateArrearDetails(loan_account_id, data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "get_financials": {
        const { loan_account_id } = LoanAccountIdSchema.parse(args);
        const result = await client.getFinancials(loan_account_id);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "update_financials": {
        const { loan_account_id, data } = UpdateFinancialsSchema.parse(args);
        const result = await client.updateFinancials(loan_account_id, data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "get_arrears_debts": {
        const { loan_account_id } = LoanAccountIdSchema.parse(args);
        const result = await client.getArrearsDebts(loan_account_id);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "get_budget_totals": {
        const { loan_account_id } = LoanAccountIdSchema.parse(args);
        const result = await client.getBudgetTotals(loan_account_id);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "get_plans": {
        const { loan_account_id } = LoanAccountIdSchema.parse(args);
        const result = await client.getPlans(loan_account_id);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "get_customer": {
        const { custId } = CustomerIdSchema.parse(args);
        const result = await client.getCustomer(custId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "update_customer": {
        const { custId, data } = UpdateCustomerSchema.parse(args);
        const result = await client.updateCustomer(custId, data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "get_customer_communication_preferences": {
        const { custId } = CustomerIdSchema.parse(args);
        const result = await client.getCustomerCommunicationPreferences(custId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "update_customer_communication_preferences": {
        const { custId, preferences } =
          UpdateCustomerPreferencesSchema.parse(args);
        const result = await client.updateCustomerCommunicationPreferences(
          custId,
          preferences,
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "generate_customer_otp": {
        const { custId } = CustomerIdSchema.parse(args);
        const result = await client.generateOTP(custId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "reset_customer_passcode": {
        const { custId } = CustomerIdSchema.parse(args);
        const result = await client.resetPasscode(custId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "verify_customer_token": {
        const { token } = TokenVerificationSchema.parse(args);
        const result = await client.verifyToken(token);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "get_account": {
        const { accountId } = AccountIdSchema.parse(args);
        const result = await client.getAccount(accountId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "get_card": {
        const { cardId } = CardIdSchema.parse(args);
        const result = await client.getCard(cardId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "void_card": {
        const { cardId, lost, stolen } = VoidCardSchema.parse(args);
        const result = await client.voidCard(cardId, { lost, stolen });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "freeze_card": {
        const { cardId } = CardIdSchema.parse(args);
        const result = await client.freezeCard(cardId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "unfreeze_card": {
        const { cardId } = CardIdSchema.parse(args);
        const result = await client.unfreezeCard(cardId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "get_card_pin_status": {
        const { cardId } = CardIdSchema.parse(args);
        const result = await client.getCardPinStatus(cardId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "get_transactions": {
        const { accountId, startDate, endDate, transactionView } =
          GetTransactionsSchema.parse(args);
        const result = await client.getTransactions(
          accountId,
          startDate,
          endDate,
          transactionView,
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "apply_fee": {
        const {
          accountId,
          applyDate,
          feeType,
          externalId,
          notes,
          amount,
          coreBankingAccountType,
        } = ApplyFeeSchema.parse(args);
        const feeRequest = {
          coreBankingAccountType: coreBankingAccountType || ("CREDIT" as const),
          applyDate,
          feeType,
          externalId,
          notes,
          ...(amount && { amount }),
        };
        const result = await client.applyFee(accountId, feeRequest);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "adjust_transaction": {
        const { transactionId, notes, coreBankingAccountType } =
          AdjustTransactionSchema.parse(args);
        const adjustRequest = {
          coreBankingAccountType: coreBankingAccountType || ("CREDIT" as const),
          notes,
        };
        const result = await client.adjustTransaction(
          transactionId,
          adjustRequest,
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "create_application": {
        const applicationData = CreateApplicationSchema.parse(args);
        const result = await client.createApplication(applicationData);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "get_application_status": {
        const { applicationId } = ApplicationIdSchema.parse(args);
        const result = await client.getApplicationStatus(applicationId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "update_contact": {
        const { applicationId, email_address, mobile_number } =
          UpdateContactSchema.parse(args);
        const result = await client.updateContact(applicationId, {
          email_address,
          mobile_number,
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "update_income": {
        const incomeData = UpdateIncomeSchema.parse(args);
        const { applicationId, ...incomeRequest } = incomeData;
        const result = await client.updateIncome(applicationId, incomeRequest);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "accept_offer": {
        const { applicationId, passcode, payment_day } =
          AcceptOfferSchema.parse(args);
        const result = await client.acceptOffer(applicationId, {
          passcode,
          payment_day,
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "get_aggregator_data": {
        const { applicationId } = ApplicationIdSchema.parse(args);
        const result = await client.getAggregatorData(applicationId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "get_documents": {
        const { applicationId } = ApplicationIdSchema.parse(args);
        const result = await client.getDocuments(applicationId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "authorize": {
        const authData = AuthorizeSchema.parse(args);
        const result = await client.authorize(authData);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "get_token": {
        const tokenData = TokenSchema.parse(args);
        const result = await client.getToken(tokenData);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "verify_otp": {
        const { transaction_id, verify_code } = VerifyOTPSchema.parse(args);
        const result = await client.verifyOTP(transaction_id, { verify_code });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Tool ${name} not found`);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Invalid parameters: ${error.message}`,
      );
    }

    if (error instanceof McpError) {
      throw error;
    }

    // Handle axios errors
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as any;
      const status = axiosError.response?.status;
      const message = axiosError.response?.data?.message || axiosError.message;
      throw new McpError(
        ErrorCode.InternalError,
        `API Error (${status}): ${message}`,
      );
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new McpError(
      ErrorCode.InternalError,
      `Unexpected error: ${errorMessage}`,
    );
  }
});

// Start server
async function main() {
  try {
    // Fetch API key from Secrets Manager
    console.error("Fetching API key from AWS Secrets Manager...");
    const apiKey = await getApiKeyFromSecretsManager();

    // Set the API key on the client
    client.setApiKey(apiKey);
    console.error("API key successfully retrieved and set");

    // Start the server
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Customer Care MCP Server running on stdio");
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
