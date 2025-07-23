import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { UserOutlined, TeamOutlined, AppstoreOutlined, ShoppingOutlined, GiftOutlined, FileTextOutlined } from '@ant-design/icons';
import {
  fetchLeads,
  fetchClients,
  fetchInventory,
  fetchComponents,
  fetchPackages,
  fetchQuotations,
} from '../../api';

const sectionsConfig = [
  {
    key: 'leads',
    title: 'Leads',
    icon: <UserOutlined style={{ fontSize: 32, color: 'var(--primary-400)' }} />,
    path: '/admin/leads',
    color: 'var(--primary-100)',
  },
  {
    key: 'clients',
    title: 'Clients',
    icon: <TeamOutlined style={{ fontSize: 32, color: 'var(--accent-400)' }} />,
    path: '/admin/clients',
    color: 'var(--accent-100)',
  },
  {
    key: 'inventory',
    title: 'Inventory',
    icon: <AppstoreOutlined style={{ fontSize: 32, color: 'var(--primary-500)' }} />,
    path: '/admin/inventory',
    color: 'var(--primary-200)',
  },
  {
    key: 'components',
    title: 'Components',
    icon: <ShoppingOutlined style={{ fontSize: 32, color: 'var(--primary-4300)' }} />,
    path: '/admin/inventory', // Components are managed under inventory
    color: 'var(--primary-300)',
  },
  {
    key: 'packages',
    title: 'Packages',
    icon: <GiftOutlined style={{ fontSize: 32, color: 'var(--accent-500)' }} />,
    path: '/admin/packages',
    color: 'var(--accent-200)',
  },
  {
    key: 'quotations',
    title: 'Quotations',
    icon: <FileTextOutlined style={{ fontSize: 32, color: 'var(--primary-400)' }} />,
    path: '/admin/quotations',
    color: 'var(--primary-100)',
  },
];

const PAGE_SIZE = 1; // Only need 1 item to get total count for leads/clients

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [totals, setTotals] = useState({
    leads: null,
    clients: null,
    inventory: null,
    components: null,
    packages: null,
    quotations: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllTotals = async () => {
      setLoading(true);
      try {
        const [leadsRes, clientsRes, inventoryRes, componentsRes, packagesRes, quotationsRes] = await Promise.all([
          fetchLeads(1, PAGE_SIZE),
          fetchClients(1, PAGE_SIZE),
          fetchInventory(),
          fetchComponents(),
          fetchPackages('fixed'),
          fetchQuotations(),
        ]);
        setTotals({
          leads: leadsRes.data.total,
          clients: clientsRes.data.total,
          inventory: Array.isArray(inventoryRes.data) ? inventoryRes.data.length : 0,
          components: Array.isArray(componentsRes.data) ? componentsRes.data.length : 0,
          packages: Array.isArray(packagesRes.data.packages) ? packagesRes.data.packages.length : 0,
          quotations: Array.isArray(quotationsRes.data) ? quotationsRes.data.length : 0,
        });
      } catch {
        setTotals({
          leads: '-',
          clients: '-',
          inventory: '-',
          components: '-',
          packages: '-',
          quotations: '-',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAllTotals();
  }, []);

  return (
    <div className="hem-lead-table" style={{ background: 'var(--background-alt)', minHeight: '100vh', padding: 32 }}>
      {/* <div style={{ background: 'var(--background-color)', borderRadius: 16, boxShadow: '0 2px 16px #e6eaf0', padding: 48, minWidth: 320, textAlign: 'center', border: '1px solid var(--border-color)', marginBottom: 32 }}>
        <h1 style={{ color: 'var(--header-color)', letterSpacing: 2, marginBottom: 16 }}>Welcome to HEM INFOTECH CRM</h1>
        <p style={{ color: 'var(--primary-500)', fontSize: 18, margin: 0 }}>Manage your leads and customers efficiently.</p>
      </div> */}
      <Row gutter={[32, 32]} justify="center">
        {sectionsConfig.map(section => (
          <Col xs={24} sm={12} md={8} lg={8} xl={6} key={section.key}>
            <Card
              hoverable
              style={{ borderRadius: 14, background: section.color, minHeight: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #e6eaf0' }}
              bodyStyle={{ padding: 32, textAlign: 'center' }}
              onClick={() => navigate(section.path)}
            >
              <div style={{ marginBottom: 16 }}>{section.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 22, color: 'var(--primary-500)', marginBottom: 12 }}>{section.title}</div>
              <div style={{ fontSize: 24, color: 'var(--primary-400)', marginBottom: 16 }}>
                {loading || totals[section.key] === null ? <Spin size="small" /> : `Total: ${totals[section.key]}`}
              </div>
              <Button type="primary" style={{ borderRadius: 8, background: 'var(--accent-500)', borderColor: 'var(--accent-500)' }} onClick={e => { e.stopPropagation(); navigate(section.path); }}>Go to {section.title}</Button>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default AdminDashboard; 