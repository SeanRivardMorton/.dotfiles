# Customer Care MCP Server

An MCP (Model Context Protocol) server for the Customer Care Portal APIs, providing access to arrears management, financial details, and customer care functionality.

## Features

- **Arrear Management**: Get and update arrear details for loan accounts
- **Financial Details**: Access customer financial information including income, benefits, and outgoings
- **Debt Information**: Retrieve priority and non-priority debt details
- **Budget Analysis**: Get budget totals and disposable income calculations
- **Payment Plans**: Access available payment plans for customers

## Installation

```bash
npm install
npm run build
```

## Configuration

Set the following environment variables:

```bash
# Optional: API authentication token
export CUSTOMER_CARE_API_TOKEN="your-api-token-here"

# Optional: Custom API base URL (defaults to staging)
export CUSTOMER_CARE_API_BASE_URL="http://internal-api.staging.onmo.app/customer-care/v1"
```

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

1. **get_arrear_details** - Get arrear details for a loan account
2. **update_arrear_details** - Update arrear details for a loan account
3. **get_financials** - Get financial details for a loan account
4. **update_financials** - Update financial details for a loan account
5. **get_arrears_debts** - Get arrears debts for a loan account
6. **get_budget_totals** - Get budget totals for a loan account
7. **get_plans** - Get available plans for a loan account

### Claude Code Integration

To use this MCP server with Claude Code, add it to your Claude Code configuration:

```json
{
  "mcpServers": {
    "customer-care": {
      "command": "node",
      "args": ["path/to/customer-care-mcp-server/dist/index.js"],
      "env": {
        "CUSTOMER_CARE_API_TOKEN": "your-token-here"
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