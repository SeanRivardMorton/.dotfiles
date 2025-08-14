# Customer Care MCP Server

An MCP (Model Context Protocol) server for the Customer Care Portal APIs, providing access to arrears management, financial details, customer care functionality, and Databricks SQL warehouse querying.

## Features

- **Arrear Management**: Get and update arrear details for loan accounts
- **Financial Details**: Access customer financial information including income, benefits, and outgoings
- **Debt Information**: Retrieve priority and non-priority debt details
- **Budget Analysis**: Get budget totals and disposable income calculations
- **Payment Plans**: Access available payment plans for customers
- **Databricks Integration**: Query Databricks SQL warehouses with support for multiple authentication methods

## Installation

```bash
npm install
npm run build
```

## Configuration

### Environment Selection

Set the environment to control which API endpoints are used:

```bash
# Options: dev, staging, prod
# - dev: points to staging environment
# - staging: points to staging environment  
# - prod: points to production environment
export ENVIRONMENT="staging"
```

### API Configuration

Set the following environment variables:

```bash
# Optional: API authentication token
export CUSTOMER_CARE_API_TOKEN="your-api-token-here"

# Optional: Override specific API base URLs (defaults to environment-specific URLs)
export CUSTOMER_CARE_API_BASE_URL="http://internal-api.staging.onmo.app/customer-care/v1"
export CUSTOMER_API_BASE_URL="https://internal-api.staging.onmo.app/service/customers/v2"
export ACCOUNTS_API_BASE_URL="https://internal-api.staging.onmo.app/service/accounts/v5"
export CARDS_API_BASE_URL="https://internal-api.staging.onmo.app/service/cards/v1"
export TRANSACTIONS_API_BASE_URL="https://internal-api.staging.onmo.app/service/transactions/v2"
export ONBOARDING_API_BASE_URL="https://internal-api.staging.onmo.app/service/onboarding/v1"

# Databricks Configuration
export DATABRICKS_BASE_URL="https://your-databricks-workspace.cloud.databricks.com"

# Choose authentication method: 'token' or 'service-principal'
export DATABRICKS_AUTH_TYPE="service-principal"

# For Service Principal Authentication (recommended for organizations)
export DATABRICKS_CLIENT_ID="your-service-principal-client-id"
export DATABRICKS_CLIENT_SECRET="your-service-principal-client-secret" 
export DATABRICKS_TENANT_ID="your-azure-tenant-id"

# For Personal Access Token (if enabled in your organization)
# export DATABRICKS_AUTH_TYPE="token"
# export DATABRICKS_TOKEN="your-databricks-pat"
```

### Setting up Service Principal Authentication

1. **Create an Azure AD Service Principal:**
   ```bash
   az ad sp create-for-rbac --name "databricks-mcp-server" --role contributor
   ```

2. **Grant the Service Principal access to Databricks:**
   - Go to your Databricks workspace
   - Navigate to Settings > User Settings > Access Tokens (or Admin Console)
   - Add the service principal with appropriate permissions

3. **Configure environment variables with the service principal details**

## Usage

### Running the Server

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

### Available Tools

#### Customer Care Tools
1. **get_arrear_details** - Get arrear details for a loan account
2. **update_arrear_details** - Update arrear details for a loan account
3. **get_financials** - Get financial details for a loan account
4. **update_financials** - Update financial details for a loan account
5. **get_arrears_debts** - Get arrears debts for a loan account
6. **get_budget_totals** - Get budget totals for a loan account
7. **get_plans** - Get available plans for a loan account

#### Databricks Tools
8. **databricks_execute_query** - Execute a SQL query on Databricks SQL warehouse
9. **databricks_query_status** - Check the status of a running query
10. **databricks_query_results** - Get results from a completed query
11. **databricks_cancel_query** - Cancel a running query
12. **databricks_execute_and_wait** - Execute a query and wait for results (recommended)

### Claude Code Integration

To use this MCP server with Claude Code, add it to your Claude Code configuration:

```json
{
  "mcpServers": {
    "customer-care": {
      "command": "node",
      "args": ["path/to/customer-care-mcp-server/dist/index.js"],
      "env": {
        "CUSTOMER_CARE_API_TOKEN": "your-token-here",
        "DATABRICKS_BASE_URL": "https://your-workspace.cloud.databricks.com",
        "DATABRICKS_AUTH_TYPE": "service-principal",
        "DATABRICKS_CLIENT_ID": "your-client-id",
        "DATABRICKS_CLIENT_SECRET": "your-client-secret",
        "DATABRICKS_TENANT_ID": "your-tenant-id"
      }
    }
  }
}
```

## API Endpoints

The server provides access to the following Customer Care Portal API endpoints:

- `GET /arrears/{loan_account_id}/` - Get arrear details
- `POST /arrears/{loan_account_id}/` - Update arrear details
- `GET /arrears/{loan_account_id}/financial` - Get financial details
- `POST /arrears/{loan_account_id}/financial` - Update financial details
- `GET /arrears/{loan_account_id}/financials/debt` - Get arrears debts
- `GET /arrears/{loan_account_id}/financials/budget` - Get budget totals
- `GET /arrears/{loan_account_id}/plans` - Get available plans

## Error Handling

The server handles various error conditions:

- **400 Bad Request**: Invalid parameters or request data
- **404 Not Found**: Account or resource not found
- **500 Internal Server Error**: Server-side errors
- **Validation Errors**: Invalid input parameters

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## License

MIT