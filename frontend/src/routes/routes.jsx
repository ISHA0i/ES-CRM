import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from "../pages/layout/layout.jsx";
import AdminDashboard from '../pages/admin/Dashboard.jsx';
import Login from '../pages/auth/Login.jsx';
import NotFound from '../pages/NotFound.jsx';

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
              <AdminLayout onLogout={onLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
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