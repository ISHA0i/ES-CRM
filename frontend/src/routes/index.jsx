import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import UserLayout from '../layouts/UserLayout';
// import ManagerLayout from '../layouts/ManagerLayout';
import AdminDashboard from '../pages/admin/Dashboard';
import UserDashboard from '../pages/user/Dashboard';
// import ManagerDashboard from '../pages/manager';
import Login from '../pages/auth/Login';
import NotFound from '../pages/NotFound';

// Placeholder: Replace with real authentication and role logic
const getUserRole = () => {
  // e.g., return 'admin', 'user', or 'manager'
  return localStorage.getItem('role') || 'user';
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
          path="/admin/*"
          element={
            role === 'admin' ? (
              <AdminLayout onLogout={onLogout}>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="*" element={<Navigate to="dashboard" />} />
                </Routes>
              </AdminLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/user/*"
          element={
            role === 'user' ? (
              <UserLayout onLogout={onLogout}>
                <Routes>
                  <Route path="dashboard" element={<UserDashboard />} />
                  <Route path="*" element={<Navigate to="dashboard" />} />
                </Routes>
              </UserLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        
        <Route
          path="/"
          element={
            role === 'admin'
              ? <Navigate to="/admin/dashboard" />
              : <Navigate to="/user/dashboard" />
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes; 