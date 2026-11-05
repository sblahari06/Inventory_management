import React, { useEffect, useState } from "react";
import EditTable from "../components/table";
import api from "../api";

function Products() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);

    const fetchProducts = async () => {
        try {
            const response = await api.get("/products");
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const fetchForeignKeys = async () => {
        try {
            const [categoryResponse, supplierResponse] = await Promise.all([
                api.get("/categories"),
                api.get("/suppliers"),
            ]);

            setCategories(categoryResponse.data);
            setSuppliers(supplierResponse.data);
        } catch (error) {
            console.error("Error fetching categories or suppliers:", error);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchForeignKeys();
    }, []);

    const lowStockProducts = products.filter((product) => {
        const quantity = Number(product.quantity);
        const reorderLevel = Number(product.reorder_level);

        return (
            Number.isFinite(quantity) &&
            Number.isFinite(reorderLevel) &&
            quantity <= reorderLevel
        );
    });

    const totalInventoryValue = products.reduce((total, product) => {
        const quantity = Number(product.quantity);
        const unitPrice = Number(product.unit_price);

        if (!Number.isFinite(quantity) || !Number.isFinite(unitPrice)) {
            return total;
        }

        return total + quantity * unitPrice;
    }, 0);

    const escapeCsvValue = (value) => {
        const text = String(value ?? "");
        return `"${text.replace(/"/g, '""')}"`;
    };

    const exportInventoryCsv = () => {
        const headers = [
            "Product ID",
            "Product Code",
            "Product Name",
            "Category ID",
            "Supplier ID",
            "Unit Price",
            "Quantity",
            "Reorder Level",
            "Stock Value",
        ];

        const rows = products.map((product) => {
            const quantity = Number(product.quantity) || 0;
            const unitPrice = Number(product.unit_price) || 0;

            return [
                product.product_id,
                product.product_code,
                product.product_name,
                product.category_id,
                product.supplier_id,
                unitPrice.toFixed(2),
                quantity,
                product.reorder_level,
                (quantity * unitPrice).toFixed(2),
            ];
        });

        const csvContent = [headers, ...rows]
            .map((row) => row.map(escapeCsvValue).join(","))
            .join("\r\n");

        const blob = new Blob(["\uFEFF", csvContent], {
            type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "inventory-report.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Products
                </h1>
                <p className="mt-2 text-gray-500">
                    View and manage all inventory products.
                </p>
            </div>

            <section
                className={`mb-6 rounded-lg border p-4 ${
                    lowStockProducts.length > 0
                        ? "border-amber-300 bg-amber-50"
                        : "border-green-200 bg-green-50"
                }`}
            >
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-semibold text-gray-800">
                        Low-stock alert
                    </h2>
                    <span
                        className={`rounded-full px-3 py-1 text-sm font-semibold ${
                            lowStockProducts.length > 0
                                ? "bg-amber-200 text-amber-900"
                                : "bg-green-200 text-green-900"
                        }`}
                    >
                        {lowStockProducts.length} product
                        {lowStockProducts.length === 1 ? "" : "s"}
                    </span>
                </div>

                {lowStockProducts.length === 0 ? (
                    <p className="mt-2 text-sm text-gray-600">
                        No products are currently at or below their reorder level.
                    </p>
                ) : (
                    <div className="mt-3 overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="text-gray-600">
                                    <th className="px-3 py-2">Product Code</th>
                                    <th className="px-3 py-2">Product Name</th>
                                    <th className="px-3 py-2">Quantity</th>
                                    <th className="px-3 py-2">Reorder Level</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lowStockProducts.map((product) => (
                                    <tr
                                        key={product.product_id}
                                        className="border-t border-amber-200"
                                    >
                                        <td className="px-3 py-2">
                                            {product.product_code}
                                        </td>
                                        <td className="px-3 py-2">
                                            {product.product_name}
                                        </td>
                                        <td className="px-3 py-2 font-semibold text-amber-800">
                                            {product.quantity}
                                        </td>
                                        <td className="px-3 py-2">
                                            {product.reorder_level}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <section className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div>
                    <h2 className="font-semibold text-gray-800">
                        Stock valuation
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Total value of current stock (quantity × unit price)
                    </p>
                    <p className="mt-2 text-2xl font-bold text-blue-800">
                        {totalInventoryValue.toLocaleString("en-IN", {
                            style: "currency",
                            currency: "INR",
                        })}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={exportInventoryCsv}
                    disabled={products.length === 0}
                    className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Export Inventory CSV
                </button>
            </section>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <EditTable
                    initialData={products}
                    onRefresh={fetchProducts}
                    resource="/products"
                    columns={[
                        {
                            key: "product_id",
                            label: "Product ID",
                            editable: false,
                        },
                        {
                            key: "product_code",
                            label: "Product Code",
                        },
                        {
                            key: "product_name",
                            label: "Product Name",
                        },
                        {
                            key: "category_id",
                            label: "Category",
                            type: "select",
                            options: categories.map((category) => ({
                                value: category.category_id,
                                label: category.category_name,
                            })),
                        },
                        {
                            key: "supplier_id",
                            label: "Supplier",
                            type: "select",
                            options: suppliers.map((supplier) => ({
                                value: supplier.supplier_id,
                                label: supplier.supplier_name,
                            })),
                        },
                        {
                            key: "unit_price",
                            label: "Unit Price",
                            type: "number",
                        },
                        {
                            key: "quantity",
                            label: "Quantity",
                            type: "number",
                        },
                        {
                            key: "reorder_level",
                            label: "Reorder Level",
                            type: "number",
                        },
                    ]}
                    hideDelete={false}
                />
            </div>
        </div>
    );
}

export default Products;