import { z } from 'zod';

// Base schemas
const FrequencyAmountSchema = z.object({
  frequency: z.string(),
  amount: z.number(),
  note: z.string()
});

// Arrear Details Schema
export const ArrearDetailsSchema = z.object({
  loan_account_id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  status: z.string(),
  current_arrears: z.number(),
  payment_delay_reason: z.string(),
  paymet_delay_duration: z.string(),
  additional_information: z.string(),
  payment_ability_date: z.string(),
  payment_ability_status: z.string(),
  updated_at: z.string(),
  created_at: z.string()
});

// Financials Schema
export const FinancialsSchema = z.object({
  loan_account_id: z.string(),
  employment_status: z.string(),
  housing_tenure: z.string(),
  children_under_16: z.number(),
  children_16_to_18: z.number(),
  other_dependants: z.number(),
  total_people: z.number(),
  vehicles: z.number(),
  earnings: z.object({
    total: z.number(),
    wages: FrequencyAmountSchema,
    other_earnings: FrequencyAmountSchema
  }),
  benefits: z.object({
    total: z.number(),
    universal_credit: FrequencyAmountSchema,
    jobseekers_allowance_income_based: FrequencyAmountSchema,
    jobseekers_allowance_contribution_based: FrequencyAmountSchema,
    income_support: FrequencyAmountSchema,
    working_tax_credit: FrequencyAmountSchema,
    child_tax_credit: FrequencyAmountSchema,
    child_benefit: FrequencyAmountSchema,
    employment_and_support_allowance: FrequencyAmountSchema,
    disability_benefits: FrequencyAmountSchema,
    carers_allowance: FrequencyAmountSchema,
    housing_benefit: FrequencyAmountSchema,
    council_tax_support: FrequencyAmountSchema,
    other_benefits: FrequencyAmountSchema
  }),
  pentions: z.object({
    total: z.number(),
    state_pensions: FrequencyAmountSchema,
    work_pensions: FrequencyAmountSchema,
    pension_credit: FrequencyAmountSchema,
    other_pension: FrequencyAmountSchema
  }),
  other_income: z.object({
    total: z.number(),
    child_support: FrequencyAmountSchema,
    lodgers: FrequencyAmountSchema,
    non_dependants_contributions: FrequencyAmountSchema,
    student_loans_and_grants: FrequencyAmountSchema,
    other_income: FrequencyAmountSchema
  }),
  total_monthly: z.number(),
  household_fixed_outgoings: z.object({
    home_and_contents: z.record(z.unknown()),
    utilities: z.record(z.unknown()),
    water: z.record(z.unknown()),
    care_and_health_cost: z.record(z.unknown()),
    transport_and_travel: z.record(z.unknown()),
    school_cost: z.record(z.unknown()),
    pension_and_insurance: z.record(z.unknown()),
    professional_cost: z.record(z.unknown()),
    other_essential_cost: z.record(z.unknown()),
    total_monthly: z.record(z.unknown())
  }),
  flexible_outgoings: z.object({
    communication_and_leisure: z.record(z.unknown()),
    food_and_housekeeping: z.record(z.unknown()),
    personal_cost: z.record(z.unknown()),
    total_monthly: z.string()
  })
});

// Arrears Debts Schema
export const ArrearsDebtsSchema = z.object({
  loan_account_id: z.string(),
  priority_debt: z.object({
    arrears: z.number(),
    outstanding: z.number(),
    monthly: z.number(),
    total: z.number()
  }),
  non_priority_debt: z.object({
    arrears: z.number(),
    outstanding: z.number(),
    monthly: z.number(),
    total: z.number()
  })
});

// Budget Totals Schema
export const BudgetTotalsSchema = z.object({
  loan_account_id: z.string(),
  income: z.number(),
  outgoing: z.number(),
  monthly_repayments: z.number(),
  disposabl_income: z.number()
});

// Plan Detail Schema
export const PlanDetailSchema = z.object({
  id: z.string(),
  loan_account_id: z.string(),
  plan_name: z.string(),
  description: z.string()
});

// Customer Management API Schemas
export const AddressSchema = z.object({
  city: z.string().optional(),
  country: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  postcode: z.string().optional(),
  region: z.string().optional(),
  dateMovedIn: z.string().optional(),
  dateMovedOut: z.string().optional(),
  isCurrentAddress: z.boolean().optional()
});

export const CustomerSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  emailAddress: z.object({
    primary: z.string().optional(),
    others: z.array(z.string()).optional(),
    isEmailValidated: z.boolean().optional()
  }).optional(),
  addresses: z.array(AddressSchema).optional(),
  dateOfBirth: z.string().optional(),
  mobileNumber: z.object({
    primary: z.string().optional(),
    others: z.array(z.string()).optional()
  }).optional(),
  accounts: z.array(z.object({
    type: z.string().optional(),
    id: z.string().optional()
  })).optional(),
  sfContactId: z.string().nullable().optional()
});

export const ContactPreferencesSchema = z.object({
  channelPreference: z.object({
    email: z.boolean(),
    sms: z.boolean()
  }),
  financialAdvice: z.boolean(),
  offers: z.boolean(),
  partnerOffers: z.boolean(),
  marketingCommunications: z.boolean(),
  productResearch: z.boolean()
});

export const ContactPreferencesUpdateSchema = z.object({
  channelPreference: z.object({
    email: z.boolean().optional(),
    sms: z.boolean().optional()
  }).optional(),
  financialAdvice: z.boolean().optional(),
  offers: z.boolean().optional(),
  partnerOffers: z.boolean().optional(),
  marketingCommunications: z.boolean().optional(),
  productResearch: z.boolean().optional()
});

export const CustomerUpdateSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  emailAddress: z.string().optional(),
  address: AddressSchema.optional(),
  dateOfBirth: z.string().optional(),
  mobileNumber: z.string().optional(),
  updateSource: z.enum(['salesforce']).optional()
});

export const OTPResponseSchema = z.object({
  message: z.string(),
  otp: z.string().optional()
});

export const TokenVerificationSchema = z.object({
  token: z.string()
});

export const TokenVerificationResponseSchema = z.object({
  message: z.string(),
  isValid: z.boolean()
});

// Account Management API Schemas
export const AccountDetailsSchema = z.object({
  accountId: z.string(),
  customerId: z.string(),
  state: z.string(),
  accountState: z.string(),
  additionalAccountState: z.string().nullable(),
  inArrearsDate: z.string().nullable(),
  isInArrears: z.boolean(),
  creditLimit: z.number().nullable(),
  availableCredit: z.number(),
  apr: z.number(),
  startOfBillingCycle: z.string(),
  nextStatementDueDate: z.string().nullable(),
  daysLate: z.number().nullable()
});

export const DirectDebitSettingsSchema = z.object({
  amountPreference: z.string().nullable(),
  mandateID: z.string().nullable(),
  mandateReference: z.string().nullable(),
  provider: z.string().nullable(),
  nextDirectDebitAmount: z.number().nullable(),
  scheduledDirectDebitAmount: z.number().nullable(),
  directDebitRetryInProgress: z.boolean(),
  directDebitRetryDate: z.string().nullable(),
  directDebitPreventRetryDate: z.string().nullable(),
  directDebitAvoidFeeCutOffDate: z.string().nullable()
});

export const BalancesSchema = z.object({
  total: z.number(),
  principal: z.number(),
  interest: z.number(),
  fees: z.number()
});

export const ArrearBalancesSchema = z.object({
  total: z.number().nullable(),
  principal: z.number().nullable(),
  interest: z.number().nullable(),
  fees: z.number().nullable()
});

export const DueSchema = z.object({
  total: z.number(),
  principal: z.number(),
  interest: z.number(),
  fees: z.number()
});

export const AccountBalancesSchema = z.object({
  totalNextMinimumPaymentDue: z.number().nullable(),
  balances: BalancesSchema,
  arrearBalances: ArrearBalancesSchema,
  due: DueSchema
});

export const CardSchema = z.object({
  cardId: z.string(),
  state: z.string(),
  isActivated: z.boolean(),
  hasPinSet: z.boolean()
});

export const PaymentPlanSchema = z.object({
  type: z.enum([
    "Promise To Pay",
    "Payment Plan",
    "Payment Plan - With Fees",
    "DCA Payment Plan",
    "IVA Payment Plan",
    "DRO Payment Plan",
    "DMC Payment Plan"
  ]),
  status: z.enum(["Active", "Broken", "Expired"]),
  amount: z.string(),
  startDate: z.string(),
  endDate: z.string()
});

export const CreditCardAccountSchema = z.object({
  accountDetails: AccountDetailsSchema,
  directDebitSettings: DirectDebitSettingsSchema,
  accountBalances: AccountBalancesSchema,
  cards: z.array(CardSchema),
  paymentPlans: z.array(PaymentPlanSchema)
});

// Card Management API Schemas
export const CardDetailsSchema = z.object({
  cardId: z.string(),
  lastFourDigits: z.string(),
  isActivated: z.boolean(),
  creationDate: z.string(),
  expirationDate: z.string(),
  numIncorrectPinAttempts: z.number(),
  status: z.enum([
    "ACTIVE",
    "PENDING",
    "RETAIN",
    "FREEZE",
    "VERIFY",
    "LOST",
    "STOLEN",
    "EXPIRED",
    "LOCK",
    "VOID"
  ]),
  statusDate: z.string(),
  lastEvent: z.string()
});

export const VoidCardRequestSchema = z.object({
  lost: z.boolean().optional(),
  stolen: z.boolean().optional()
});

export const VoidCardResponseSchema = z.object({
  message: z.string(),
  newCardId: z.string().optional()
});

export const PinStatusResponseSchema = z.object({
  pinSet: z.boolean()
});

export const EncryptedDataRequestSchema = z.object({
  encryptedAesKey: z.string(),
  iv: z.string(),
  aesAuthTag: z.string(),
  encryptedData: z.string()
});

export const EncryptedDataResponseSchema = z.object({
  encryptedAesKey: z.string(),
  iv: z.string(),
  aesAuthTag: z.string(),
  encryptedData: z.string()
});

// Transactions API Schemas
export const MerchantInfoSchema = z.object({
  merchantName: z.string().nullable(),
  merchantCountryCode: z.string().nullable(),
  merchantPostCode: z.string().nullable(),
  merchantCity: z.string().nullable(),
  merchantCategoryCode: z.string().nullable()
});

export const TransactionDataOIDCSchema = z.object({
  accountId: z.string(),
  transactionId: z.string(),
  cardId: z.string().nullable(),
  title: z.string(),
  onmoTransactionType: z.enum([
    "CARD",
    "DISBURSEMENT",
    "WITHDRAWAL",
    "CARD_TRANSACTION_REVERSAL",
    "REPAYMENT - GOOD_WILL",
    "REPAYMENT - ACQUIRED",
    "REPAYMENT - STRIPE_CARD",
    "REPAYMENT - STRIPE_DD",
    "REPAYMENT - GOCARDLESS",
    "REPAYMENT",
    "REPAYMENT_ADJUSTMENT",
    "REPAYMENT - ARDENT",
    "REPAYMENT - COEO",
    "REPAYMENT - THIRD_PARTY",
    "FEE_APPLIED",
    "FEE_ADJUSTMENT",
    "REPAYMENT - FAILED_PAYMENT",
    "FEE_APPLIED - FAILED_PAYMENT",
    "FEE_ADJUSTMENT - FAILED_PAYMENT",
    "REPAYMENT - ATM",
    "FEE_APPLIED - ATM",
    "FEE_ADJUSTMENT - ATM",
    "REPAYMENT - FX",
    "FEE_APPLIED - FX",
    "FEE_ADJUSTMENT - FX",
    "REPAYMENT - LATE",
    "FEE_APPLIED - LATE",
    "FEE_ADJUSTMENT - LATE",
    "REPAYMENT - OVER_LIMIT",
    "FEE_APPLIED - OVER_LIMIT",
    "FEE_ADJUSTMENT - OVER_LIMIT",
    "WRITE_OFF"
  ]),
  cardTransactionType: z.string().nullable(),
  status: z.enum(["PENDING", "SETTLED", "DECLINED"]),
  declineReason: z.string().nullable(),
  sourceAmount: z.number().nullable(),
  destinationAmount: z.number().nullable(),
  feeAmount: z.number().nullable(),
  currencyCode: z.string(),
  dateTime: z.string(),
  merchantInfo: MerchantInfoSchema
});

export const TransactionDataSchema = z.object({
  accountId: z.string(),
  transactionId: z.string(),
  cardId: z.string().nullable(),
  title: z.string(),
  terminalId: z.string().nullable(),
  settlementId: z.string().nullable(),
  onmoTransactionType: z.enum([
    "CARD",
    "DISBURSEMENT",
    "WITHDRAWAL",
    "CARD_TRANSACTION_REVERSAL",
    "REPAYMENT - GOOD_WILL",
    "REPAYMENT - ACQUIRED",
    "REPAYMENT - STRIPE_CARD",
    "REPAYMENT - STRIPE_DD",
    "REPAYMENT - GOCARDLESS",
    "REPAYMENT",
    "REPAYMENT_ADJUSTMENT",
    "REPAYMENT - ARDENT",
    "REPAYMENT - COEO",
    "REPAYMENT - THIRD_PARTY",
    "FEE_APPLIED",
    "FEE_ADJUSTMENT",
    "REPAYMENT - FAILED_PAYMENT",
    "FEE_APPLIED - FAILED_PAYMENT",
    "FEE_ADJUSTMENT - FAILED_PAYMENT",
    "REPAYMENT - ATM",
    "FEE_APPLIED - ATM",
    "FEE_ADJUSTMENT - ATM",
    "REPAYMENT - FX",
    "FEE_APPLIED - FX",
    "FEE_ADJUSTMENT - FX",
    "REPAYMENT - LATE",
    "FEE_APPLIED - LATE",
    "FEE_ADJUSTMENT - LATE",
    "REPAYMENT - OVER_LIMIT",
    "FEE_APPLIED - OVER_LIMIT",
    "FEE_ADJUSTMENT - OVER_LIMIT",
    "WRITE_OFF"
  ]),
  cardTransactionType: z.string().nullable(),
  packetType: z.enum([
    "TC05",
    "TC25",
    "TC06",
    "TC26",
    "TC07",
    "TC27",
    "TC15",
    "TC35",
    "TC16",
    "TC36",
    "TC17",
    "TC37"
  ]).nullable(),
  status: z.enum(["PENDING", "SETTLED", "DECLINED"]),
  declineReason: z.string().nullable(),
  sourceAmount: z.number().nullable(),
  destinationAmount: z.number().nullable(),
  feeAmount: z.number().nullable(),
  currencyCode: z.string(),
  sourceToBaseExchangeRate: z.number().nullable(),
  baseToDestinationExchangeRate: z.number().nullable(),
  dateTime: z.string(),
  merchantInfo: MerchantInfoSchema
});

export const TransactionsResponseSchema = z.object({
  transactions: z.array(TransactionDataSchema)
});

export const ApplyFeeRequestSchema = z.object({
  coreBankingAccountType: z.enum(["CREDIT"]).default("CREDIT"),
  applyDate: z.string(),
  feeType: z.enum(["OVER_LIMIT", "LATE", "FAILED_PAYMENT", "ATM", "FX", "FIRST_MONTH_INTEREST"]),
  externalId: z.string(),
  notes: z.string(),
  amount: z.number().optional()
});

export const ApplyFeeResponseSchema = z.object({
  coreBankingTransactionId: z.string(),
  onmoTransactionType: z.string(),
  amount: z.string(),
  valueDate: z.string(),
  notes: z.string()
});

export const AdjustTransactionRequestSchema = z.object({
  coreBankingAccountType: z.enum(["CREDIT"]).default("CREDIT"),
  notes: z.string()
});

export const AdjustTransactionResponseSchema = z.object({
  coreBankingTransactionId: z.string(),
  onmoTransactionType: z.string(),
  amount: z.string(),
  valueDate: z.string(),
  adjustmentTransactionKey: z.string()
});

// Credit Card Onboarding API Schemas
export const CreateApplicationRequestSchema = z.object({
  title: z.enum([
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
    "Unknown"
  ]),
  first_name: z.string(),
  last_name: z.string(),
  postcode: z.string(),
  building_number: z.string().optional(),
  sub_building_number: z.string().optional(),
  building_name: z.string().optional(),
  thoroughfare: z.string(),
  city: z.string(),
  resident_from: z.string(),
  date_of_birth: z.string(),
  source_ip: z.string()
});

export const CreateApplicationResponseSchema = z.object({
  lead_id: z.string(),
  application_id: z.string(),
  status: z.enum(["APPLICATION_RECEIVED"]),
  access_token: z.string()
});

export const UpdateContactRequestSchema = z.object({
  email_address: z.string().email(),
  mobile_number: z.string()
});

export const UpdateContactResponseSchema = z.object({
  lead_id: z.string(),
  application_id: z.string(),
  status: z.enum(["CONTACT_INFO_RECEIVED"])
});

export const UpdateIncomeRequestSchema = z.object({
  net_monthly_income: z.number(),
  monthly_housing_costs: z.number(),
  employment: z.enum([
    "Employed Full Time",
    "Employed Part Time",
    "Self Employed",
    "Not Employed",
    "Retired",
    "Homemaker"
  ]),
  other_cost: z.number(),
  pay_frequency: z.enum(["Monthly", "Weekly", "Fortnightly", "Four-Weekly"]),
  monthly_credit_commitments: z.number(),
  bank_account_number: z.string(),
  bank_sort_code: z.string(),
  zero_hour_contract: z.boolean()
});

export const UpdateIncomeResponseSchema = z.object({
  lead_id: z.string(),
  application_id: z.string(),
  status: z.enum(["INCOME_EXPENSES_RECEIVED"])
});

export const ApplicationStatusResponseSchema = z.object({
  lead_id: z.string(),
  application_id: z.string(),
  status: z.enum(["INCOME_EXPENSES_RECEIVED", "CAT11_APPROVED", "CAT11_DECLINED"]),
  outcome: z.enum(["PENDING", "APPROVED", "DECLINED"])
});

export const AcceptOfferRequestSchema = z.object({
  passcode: z.string().regex(/^\d{6}$/),
  payment_day: z.number()
});

export const AcceptOfferResponseSchema = z.object({
  lead_id: z.string(),
  application_id: z.string(),
  status: z.enum(["APPLICATION_COMPLETE"])
});

export const AggregatorResponseSchema = z.object({
  lead_data: z.object({
    title: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    addressLine1: z.string(),
    addressLine2: z.string(),
    addressLine3: z.string(),
    city: z.string(),
    postcode: z.string(),
    residentFrom: z.string(),
    dateOfBirth: z.string()
  }),
  offer_details: z.object({
    apr: z.string(),
    credit_limit: z.number()
  }),
  application_id: z.string(),
  lead_id: z.string(),
  status: z.enum(["APPLICATION_VIEWED"])
});

export const DocumentsResponseSchema = z.object({
  lead_id: z.string(),
  application_id: z.string(),
  status: z.enum(["CAT11_APPROVED", "CAT19_APPROVED"]),
  pcci_body: z.string(),
  credit_agreement_body: z.string(),
  apr: z.string(),
  credit_limit: z.number(),
  interest_rate: z.string()
});

export const AuthorizeRequestSchema = z.object({
  code_challenge: z.string(),
  mobile_number: z.string()
});

export const AuthorizeResponseSchema = z.object({
  transaction_id: z.string(),
  next_endpoint: z.string()
});

export const TokenRequestSchema = z.object({
  code_verifier: z.string(),
  transaction_id: z.string(),
  auth_code: z.string()
});

export const TokenResponseSchema = z.object({
  access_token: z.string()
});

export const VerifyOTPRequestSchema = z.object({
  verify_code: z.number()
});

export const VerifyOTPResponseSchema = z.object({
  auth_code: z.string(),
  next_endpoint: z.string()
});

// CVV Support Utilities Schema
export const GetCVVRequestSchema = z.object({
  mobileNo: z.string()
});

export const GetCVVResponseSchema = z.object({
  cvv: z.string(),
  customerId: z.string().optional(),
  cardId: z.string().optional()
});

// Export types
export type ArrearDetails = z.infer<typeof ArrearDetailsSchema>;
export type Financials = z.infer<typeof FinancialsSchema>;
export type ArrearsDebts = z.infer<typeof ArrearsDebtsSchema>;
export type BudgetTotals = z.infer<typeof BudgetTotalsSchema>;
export type PlanDetail = z.infer<typeof PlanDetailSchema>;
export type Address = z.infer<typeof AddressSchema>;
export type Customer = z.infer<typeof CustomerSchema>;
export type ContactPreferences = z.infer<typeof ContactPreferencesSchema>;
export type ContactPreferencesUpdate = z.infer<typeof ContactPreferencesUpdateSchema>;
export type CustomerUpdate = z.infer<typeof CustomerUpdateSchema>;
export type OTPResponse = z.infer<typeof OTPResponseSchema>;
export type TokenVerification = z.infer<typeof TokenVerificationSchema>;
export type TokenVerificationResponse = z.infer<typeof TokenVerificationResponseSchema>;
export type AccountDetails = z.infer<typeof AccountDetailsSchema>;
export type DirectDebitSettings = z.infer<typeof DirectDebitSettingsSchema>;
export type Balances = z.infer<typeof BalancesSchema>;
export type ArrearBalances = z.infer<typeof ArrearBalancesSchema>;
export type Due = z.infer<typeof DueSchema>;
export type AccountBalances = z.infer<typeof AccountBalancesSchema>;
export type Card = z.infer<typeof CardSchema>;
export type PaymentPlan = z.infer<typeof PaymentPlanSchema>;
export type CreditCardAccount = z.infer<typeof CreditCardAccountSchema>;
export type CardDetails = z.infer<typeof CardDetailsSchema>;
export type VoidCardRequest = z.infer<typeof VoidCardRequestSchema>;
export type VoidCardResponse = z.infer<typeof VoidCardResponseSchema>;
export type PinStatusResponse = z.infer<typeof PinStatusResponseSchema>;
export type EncryptedDataRequest = z.infer<typeof EncryptedDataRequestSchema>;
export type EncryptedDataResponse = z.infer<typeof EncryptedDataResponseSchema>;
export type MerchantInfo = z.infer<typeof MerchantInfoSchema>;
export type TransactionDataOIDC = z.infer<typeof TransactionDataOIDCSchema>;
export type TransactionData = z.infer<typeof TransactionDataSchema>;
export type TransactionsResponse = z.infer<typeof TransactionsResponseSchema>;
export type ApplyFeeRequest = z.infer<typeof ApplyFeeRequestSchema>;
export type ApplyFeeResponse = z.infer<typeof ApplyFeeResponseSchema>;
export type AdjustTransactionRequest = z.infer<typeof AdjustTransactionRequestSchema>;
export type AdjustTransactionResponse = z.infer<typeof AdjustTransactionResponseSchema>;
export type CreateApplicationRequest = z.infer<typeof CreateApplicationRequestSchema>;
export type CreateApplicationResponse = z.infer<typeof CreateApplicationResponseSchema>;
export type UpdateContactRequest = z.infer<typeof UpdateContactRequestSchema>;
export type UpdateContactResponse = z.infer<typeof UpdateContactResponseSchema>;
export type UpdateIncomeRequest = z.infer<typeof UpdateIncomeRequestSchema>;
export type UpdateIncomeResponse = z.infer<typeof UpdateIncomeResponseSchema>;
export type ApplicationStatusResponse = z.infer<typeof ApplicationStatusResponseSchema>;
export type AcceptOfferRequest = z.infer<typeof AcceptOfferRequestSchema>;
export type AcceptOfferResponse = z.infer<typeof AcceptOfferResponseSchema>;
export type AggregatorResponse = z.infer<typeof AggregatorResponseSchema>;
export type DocumentsResponse = z.infer<typeof DocumentsResponseSchema>;
export type AuthorizeRequest = z.infer<typeof AuthorizeRequestSchema>;
export type AuthorizeResponse = z.infer<typeof AuthorizeResponseSchema>;
export type TokenRequest = z.infer<typeof TokenRequestSchema>;
export type TokenResponse = z.infer<typeof TokenResponseSchema>;
export type VerifyOTPRequest = z.infer<typeof VerifyOTPRequestSchema>;
export type VerifyOTPResponse = z.infer<typeof VerifyOTPResponseSchema>;
export type GetCVVRequest = z.infer<typeof GetCVVRequestSchema>;
export type GetCVVResponse = z.infer<typeof GetCVVResponseSchema>;

