import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="hem-lead-table" style={{ background: 'var(--background-alt)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--background-color)', borderRadius: 16, boxShadow: '0 2px 16px #e6eaf0', padding: 48, minWidth: 320, textAlign: 'center', border: '1px solid var(--border-color)' }}>
        <h1 style={{ color: 'var(--header-color)', letterSpacing: 2, marginBottom: 16 }}>Welcome to HEM INFOTECH CRM</h1>
        <p style={{ color: 'var(--primary-500)', fontSize: 18, margin: 0 }}>Manage your leads and customers efficiently.</p>
      </div>
    </div>
  );
};

export default AdminDashboard; 