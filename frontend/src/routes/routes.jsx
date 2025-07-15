import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AdminLayout from "../pages/layout/layout.jsx";
import AdminDashboard from '../pages/admin/Dashboard.jsx';
import Lead from '../pages/admin/Lead.jsx';
import Login from '../pages/auth/Login.jsx';
import NotFound from '../pages/NotFound.jsx';
import Client from '../pages/admin/Client.jsx';
import Inventory from '../pages/admin/Inventory.jsx';
import ComponentPage from '../pages/admin/Component.jsx';

// Placeholder: Replace with real authentication and role logic
const getUserRole = () => {
  // e.g., return 'admin', 'user', or 'manager'
  return localStorage.getItem('role') || 'admin';
};

const onLogout = () => {
  localStorage.removeItem('role');
  window.location.href = '/login';
};

const AppRoutes = () => {
  const role = getUserRole();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            role === 'admin' ? (
              <AdminLayout onLogout={onLogout}>
                <Outlet />
              </AdminLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="leads" element={<Lead />} />
          <Route path="clients" element={<Client />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="inventory/:id" element={<ComponentPage />} />
          <Route path="*" element={<Navigate to="dashboard" />} />
        </Route>
        <Route
          path="/"
          element={<Navigate to="/admin/dashboard" />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes; 