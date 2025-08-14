export interface EnvironmentConfig {
  customerCareApiBaseUrl: string;
  customerApiBaseUrl: string;
  accountsApiBaseUrl: string;
  cardsApiBaseUrl: string;
  transactionsApiBaseUrl: string;
  onboardingApiBaseUrl: string;
  awsSecretName: string;
}

export const environments: Record<string, EnvironmentConfig> = {
  dev: {
    // Dev points to staging
    customerCareApiBaseUrl:
      "http://internal-api.staging.onmo.app/customer-care/v1",
    customerApiBaseUrl:
      "https://partner.staging.onmo.app/service/customers/next",
    accountsApiBaseUrl:
      "https://internal-api.staging.onmo.app/service/accounts/next",
    cardsApiBaseUrl: "https://internal-api.staging.onmo.app/service/cards/next",
    transactionsApiBaseUrl:
      "https://internal-api.staging.onmo.app/service/transactions/v2",
    onboardingApiBaseUrl:
      "https://internal-api.staging.onmo.app/service/onboarding/v1",
    awsSecretName: "onmo-service-layer-staging",
  },
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
    awsSecretName: "onmo-service-layer-staging",
  },
  prod: {
    customerCareApiBaseUrl: "http://internal-api.onmo.app/customer-care/v1",
    customerApiBaseUrl: "https://internal-api.onmo.app/service/customers/v2",
    accountsApiBaseUrl: "https://internal-api.onmo.app/service/accounts/v5",
    cardsApiBaseUrl: "https://internal-api.onmo.app/service/cards/v1",
    transactionsApiBaseUrl:
      "https://internal-api.onmo.app/service/transactions/v2",
    onboardingApiBaseUrl: "https://internal-api.onmo.app/service/onboarding/v1",
    awsSecretName: "onmo-service-layer-production",
  },
};

export function getEnvironmentConfig(): EnvironmentConfig {
  const environment = process.env.ENVIRONMENT || "staging";
  const config = environments[environment];

  if (!config) {
    console.warn(
      `Unknown environment: ${environment}. Falling back to staging.`,
    );
    return environments.staging;
  }

  return config;
}

