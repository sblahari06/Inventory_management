import React, { useCallback, useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import api from "../api";

function Layout() {
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/layout";

  const [loggedInUser, setLoggedInUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("loggedInUser")) || {};
    } catch {
      return {};
    }
  });

  const isAdmin =
    String(loggedInUser.role || "").toLowerCase() === "admin";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [countsLoading, setCountsLoading] = useState(false);
  const [countsError, setCountsError] = useState("");

  const fetchDashboardData = useCallback(async () => {
    setCountsLoading(true);
    setCountsError("");

    const requests = [
      api.get("/products"),
      api.get("/categories"),
      api.get("/suppliers"),
      api.get("/transactions"),
    ];

    if (isAdmin) {
      requests.push(api.get("/users"));
    }

    const results = await Promise.allSettled(requests);

    const setArrayFromResult = (result, setter) => {
      if (result.status === "fulfilled") {
        setter(Array.isArray(result.value.data) ? result.value.data : []);
      } else {
        setter([]);
        console.error("Error fetching dashboard data:", result.reason);
      }
    };

    setArrayFromResult(results[0], setProducts);
    setArrayFromResult(results[1], setCategories);
    setArrayFromResult(results[2], setSuppliers);
    setArrayFromResult(results[3], setTransactions);

    if (isAdmin) {
      setArrayFromResult(results[4], setUsers);
    } else {
      setUsers([]);
    }

    if (results.some((result) => result.status === "rejected")) {
      setCountsError("Some dashboard totals could not be refreshed.");
    }

    setCountsLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    if (isHome) {
      fetchDashboardData();
    }
  }, [isHome, location.key, fetchDashboardData]);

  useEffect(() => {
    const handleInventoryChange = () => {
      fetchDashboardData();
    };

    window.addEventListener("inventory:data-changed", handleInventoryChange);

    return () => {
      window.removeEventListener(
        "inventory:data-changed",
        handleInventoryChange
      );
    };
  }, [fetchDashboardData]);

  const totalProducts = products.length;
  const totalCategories = categories.length;
  const totalSuppliers = suppliers.length;

  const lowStockItems = products.filter(
    (product) =>
      Number(product.quantity) <= Number(product.reorder_level)
  ).length;

  const totalStockUnits = products.reduce(
    (total, product) => total + Number(product.quantity || 0),
    0
  );

  const inventoryValue = products.reduce(
    (total, product) =>
      total +
      Number(product.quantity || 0) * Number(product.unit_price || 0),
    0
  );

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    setLoggedInUser({});
    setProfileOpen(false);
    navigate("/signin");
  };

  const cards = [
    {
      title: "Total Products",
      value: totalProducts,
      color: "text-blue-600",
      to: "/products",
    },
    {
      title: "Categories",
      value: totalCategories,
      color: "text-green-600",
      to: "/categories",
    },
    {
      title: "Suppliers",
      value: totalSuppliers,
      color: "text-purple-600",
      to: "/suppliers",
    },
    {
      title: "Low Stock Items",
      value: lowStockItems,
      color: "text-red-600",
      to: "/products",
    },
    {
      title: "Total Stock Units",
      value: totalStockUnits,
      color: "text-indigo-600",
      to: "/products",
    },
    {
      title: "Stock Transactions",
      value: transactions.length,
      color: "text-orange-600",
      to: "/transactions",
    },
    {
      title: "Inventory Value",
      value: formatCurrency(inventoryValue),
      color: "text-teal-600",
      to: "/products",
    },
  ];

  if (isAdmin) {
    cards.push({
      title: "Users",
      value: users.length,
      color: "text-pink-600",
      to: "/users",
    });
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="sticky top-0 z-20 flex min-h-20 w-full items-center justify-between gap-4 border-b border-gray-200 bg-blue-400 px-6 py-4 shadow-sm">
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-400 text-xl font-bold text-white">
            <img
              src="/shnoor.png"
              alt="Shnoor logo"
              className="h-full w-full rounded-full object-cover"
            />
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800">Shnoor</h2>
            <p className="text-lg font-bold text-gray-800">International</p>
          </div>
        </div>

        <h2 className="hidden text-4xl font-semibold text-gray-800 md:block">
          Inventory Management
        </h2>

        <div className="relative flex shrink-0 items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800">
              {loggedInUser.username || "User"}
            </p>
            <p className="text-xs text-gray-600">
              {loggedInUser.role || "Role"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200"
            aria-label="Open user profile"
            aria-expanded={profileOpen}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
            </svg>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-14 z-30 w-56 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
              <p className="font-semibold text-gray-800">
                {loggedInUser.username || "User"}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {loggedInUser.role || "Role"}
              </p>

              <div className="my-3 border-t border-gray-200" />

              <button
                type="button"
                onClick={handleLogout}
                className="block w-full rounded-md bg-red-50 px-4 py-2 text-center font-medium text-red-600 hover:bg-red-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-80px)]">
        <aside className="w-65 min-w-65 shrink-0 bg-gray-300 p-6 text-gray-800">
          <nav className="flex flex-col gap-4">
            <Link to="/layout" className="rounded-md px-4 py-3 hover:bg-gray-500">
              Home
            </Link>
            <Link to="/products" className="rounded-md px-4 py-3 hover:bg-gray-500">
              Products
            </Link>
            <Link to="/categories" className="rounded-md px-4 py-3 hover:bg-gray-500">
              Categories
            </Link>
            <Link to="/suppliers" className="rounded-md px-4 py-3 hover:bg-gray-500">
              Suppliers
            </Link>
            <Link to="/transactions" className="rounded-md px-4 py-3 hover:bg-gray-500">
              Stock Transactions
            </Link>
            {isAdmin && (
            <Link to="/admin" className="rounded-md px-4 py-3 hover:bg-gray-500">
                Admin Panel
            </Link>
            )}
            {isAdmin && (
              <Link to="/users" className="rounded-md px-4 py-3 hover:bg-gray-500">
                Users
              </Link>
            )}
          </nav>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex-1 p-6 md:p-8">
            {isHome && (
              <>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-gray-800">
                    Welcome to Inventory Management
                  </h1>
                  <p className="mt-2 text-gray-500">
                    Manage your products, categories, suppliers, and stock.
                  </p>
                </div>

                {countsError && (
                  <div className="mb-4 flex items-center gap-3 text-sm text-red-600">
                    <span>{countsError}</span>
                    <button
                      type="button"
                      onClick={fetchDashboardData}
                      className="underline"
                    >
                      Retry
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                  {cards.map((card) => (
                    <Link
                      key={card.title}
                      to={card.to}
                      className="block rounded-lg border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label={`Open ${card.title}`}
                    >
                      <h3 className="text-gray-500">{card.title}</h3>
                      <p className={`mt-2 text-3xl font-bold ${card.color}`}>
                        {countsLoading ? "…" : card.value}
                      </p>
                      <p className="mt-3 text-sm text-gray-400">
                        Click to view
                      </p>
                    </Link>
                  ))}
                </div>
              </>
            )}

            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;