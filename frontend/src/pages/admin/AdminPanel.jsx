import React from "react";
import { Link } from "react-router-dom";

const adminPages = [
  { title: "Products", description: "Manage products and stock details.", path: "/products" },
  { title: "Categories", description: "Manage product categories.", path: "/categories" },
  { title: "Suppliers", description: "Manage supplier information.", path: "/suppliers" },
  { title: "Stock Transactions", description: "View inventory stock movements.", path: "/transactions" },
  { title: "Users", description: "Manage registered users.", path: "/users" },
];

function AdminPanel() {
  return (
    <section>
      <h1 className="mb-2 text-2xl font-bold text-gray-800">Admin Panel</h1>
      <p className="mb-6 text-gray-500">
        Manage inventory records and users from one place.
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {adminPages.map((page) => (
          <Link
            key={page.path}
            to={page.path}
            className="rounded-lg border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <h2 className="font-semibold text-blue-700">{page.title}</h2>
            <p className="mt-2 text-sm text-gray-500">{page.description}</p>
            <p className="mt-4 text-sm font-medium text-blue-600">
              Open page →
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default AdminPanel;