import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import EditTable from "../components/table";
import api from "../api";
export default function Categories() {
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get("/categories");
      setCategories(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // const filteredCategories = categories.filter((category) =>
  //   (category.name || "")
  //     .toLowerCase()
  //     .includes(search.toLowerCase())
  // );
  const filteredCategories = categories.filter((category) => {
  const searchText = search.toLowerCase().trim();

  return (
    String(category.category_id || "").toLowerCase().includes(searchText) ||
    String(category.category_name || "").toLowerCase().includes(searchText) ||
    String(category.description || "").toLowerCase().includes(searchText)
  );
});

  return (
    <div>
      <div className="mb-6">
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          Categories
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Organize and manage your product categories.
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
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <p className="p-4 text-slate-500">
              Loading categories...
            </p>
          ) : error ? (
            <div className="p-4">
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchCategories}
                className="mt-2 rounded bg-blue-600 px-4 py-2 text-white"
              >
                Retry
              </button>
            </div>
          ) : (
            <EditTable
              initialData={filteredCategories}
              columns={[
                { key: "category_id", label: "Category ID", editable: false },
                { key: "category_name", label: "Category Name" },
                { key: "description", label: "Description" },
              ]}
              resource="/categories"
              onRefresh={fetchCategories}
              hideDelete={true}
          />
          )}
        </div>
      </div>
    </div>
  );
}
