import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/layout";
import Signin from "./pages/registration/signin";
import Registration from "./pages/registration/Registration";
import Categories from "./pages/categories";
import Products from "./pages/products";
import Suppliers from "./pages/suppliers";
import Transactions from "./pages/transactions";
import Users from "./pages/users";
import AdminPanel from "./pages/admin/AdminPanel";

function getLoggedInUser() {
  try {
    return JSON.parse(localStorage.getItem("loggedInUser")) || {};
  } catch {
    return {};
  }
}

function AdminRoute({ children }) {
  const user = getLoggedInUser();
  const isAdmin = String(user.role || "").toLowerCase() === "admin";

  return isAdmin ? children : <Navigate to="/layout" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signin" replace />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/register" element={<Registration />} />

      <Route element={<Layout />}>
        <Route
          path="/layout"
          element={null}
        />

        <Route path="/categories" element={<Categories />} />
        <Route path="/products" element={<Products />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/transactions" element={<Transactions />} />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />

        <Route
          path="/users"
          element={
            <AdminRoute>
              <Users />
            </AdminRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/layout" replace />} />
    </Routes>
  );
}

export default App;