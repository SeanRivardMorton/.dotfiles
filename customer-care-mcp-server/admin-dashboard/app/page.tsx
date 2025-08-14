import { CustomerLookup } from "../components/customer-lookup";
import { AccountDetails } from "../components/account-details";
import { TransactionViewer } from "../components/transaction-viewer";
import { DatabricksQuery } from "../components/databricks-query";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Customer Care Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage customer accounts, cards, and transactions
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Customer Management Section */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Customer Management
            </h2>
            <CustomerLookup />
          </section>

          {/* Account Management Section */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Account Management
            </h2>
            <AccountDetails />
          </section>

          {/* Transaction Management Section */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Transaction Management
            </h2>
            <TransactionViewer />
          </section>

          {/* Databricks Analytics Section */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Data Analytics
            </h2>
            <DatabricksQuery />
          </section>
        </div>
      </main>

      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm text-gray-500">
            Customer Care Admin Dashboard - Built with Next.js and React Query
          </p>
        </div>
      </footer>
    </div>
  );
}
