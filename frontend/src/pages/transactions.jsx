import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import EditTable from "../components/table";
import api from "../api";

export default function Transactions() {
  const [search, setSearch] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loggedInUser = JSON.parse(
    localStorage.getItem("loggedInUser") || "null"
  );

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get("/transactions");
      setTransactions(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to load stock transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const searchText = search.toLowerCase().trim();

  const filteredTransactions = transactions.filter((transaction) =>
    [
      transaction.transaction_id,
      transaction.product_id,
      transaction.transaction_type,
      transaction.quantity,
      transaction.previous_quantity,
      transaction.new_quantity,
      transaction.reason,
      transaction.user_id,
    ].some((value) =>
      String(value ?? "").toLowerCase().includes(searchText)
    )
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          Stock Transactions
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Add and view stock transaction records.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <div className="relative max-w-sm">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <p className="p-4 text-slate-500">Loading transactions...</p>
          ) : error ? (
            <div className="p-4">
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchTransactions}
                className="mt-2 rounded bg-blue-600 px-4 py-2 text-white"
              >
                Retry
              </button>
            </div>
          ) : (
            <EditTable
              initialData={filteredTransactions}
              columns={[
                {
                  key: "transaction_id",
                  label: "Transaction ID",
                  editable: false,
                },
                {
                  key: "product_id",
                  label: "Product ID",
                  type: "number",
                },
                {
                  key: "transaction_type",
                  label: "Type",
                },
                {
                  key: "quantity",
                  label: "Quantity",
                  type: "number",
                },
                {
                  key: "previous_quantity",
                  label: "Previous Stock",
                  editable: false,
                },
                {
                  key: "new_quantity",
                  label: "New Stock",
                  editable: false,
                },
                {
                  key: "unit_price",
                  label: "Unit Price",
                  editable: false,
                },
                {
                  key: "amount",
                  label: "Amount",
                  editable: false,
                },
                {
                  key: "reason",
                  label: "Reason",
                },
                {
                  key: "user_id",
                  label: "User ID",
                  editable: false,
                },
                {
                  key: "created_at",
                  label: "Created At",
                  editable: false,
                },
              ]}
              addFormKeys={[
                "product_id",
                "transaction_type",
                "quantity",
                "reason",
              ]}
              extraPayload={{
                user_id: loggedInUser?.user_id,
              }}
              resource="/transactions"
              onRefresh={fetchTransactions}
              hideEdit={true}
              hideDelete={true}
              hideActions={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}