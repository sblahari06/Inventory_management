
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import EditTable from "../components/table";
import api from "../api";

export default function Suppliers() {
    const [search, setSearch] = useState("");
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchSuppliers = async () => {
        try {
            setLoading(true);

            const response = await api.get("/suppliers");

            setSuppliers(response.data);
            setError("");
        } catch (err) {
            console.error("Error fetching suppliers:", err);
            setError("Failed to load suppliers.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const filteredSuppliers = suppliers.filter((supplier) => {
        const searchText = search.toLowerCase().trim();

        return (
            String(supplier.supplier_id || "").toLowerCase().includes(searchText) ||
            String(supplier.supplier_name || "").toLowerCase().includes(searchText) ||
            String(supplier.phone || "").toLowerCase().includes(searchText) ||
            String(supplier.email || "").toLowerCase().includes(searchText) ||
            String(supplier.address || "").toLowerCase().includes(searchText)
        );
    });

    return (
        <div>
            <div className="mb-6">
                <h1 className="mt-2 text-2xl font-bold text-slate-900">
                    Suppliers
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Manage and organize your suppliers.
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
                            placeholder="Search suppliers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <p className="p-4 text-slate-500">
                            Loading suppliers...
                        </p>
                    ) : error ? (
                        <div className="p-4">
                            <p className="text-red-600">{error}</p>

                            <button
                                onClick={fetchSuppliers}
                                className="mt-2 rounded bg-blue-600 px-4 py-2 text-white"
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        <EditTable
                            initialData={filteredSuppliers}
                            columns={[
                                {
                                    key: "supplier_id",
                                    label: "Supplier ID",
                                    editable: false,
                                },
                                {
                                    key: "supplier_name",
                                    label: "Supplier Name",
                                },
                                {
                                    key: "phone",
                                    label: "Phone",
                                },
                                {
                                    key: "email",
                                    label: "Email",
                                },
                                {
                                    key: "address",
                                    label: "Address",
                                },
                                {
                                    key: "created_at",
                                    label: "Created At",
                                    editable: false,
                                },
                            ]}
                            resource="/suppliers"
                            onRefresh={fetchSuppliers}
                            hideDelete={true}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
