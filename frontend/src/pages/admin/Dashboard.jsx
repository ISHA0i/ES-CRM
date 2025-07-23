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
      <style>{`
        .dashboard-hr-card {
          background: var(--card-bg, #fff);
          border-radius: 18px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.08);
          transition: box-shadow 0.3s, transform 0.2s;
          cursor: pointer;
          outline: none;
          padding: 0;
          position: relative;
        }
        .dashboard-hr-card:hover, .dashboard-hr-card:focus {
          box-shadow: 0 6px 24px rgba(0,0,0,0.16);
          transform: translateY(-2px) scale(1.03);
        }
        .dashboard-hr-card-accent {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 8px;
          border-top-left-radius: 18px;
          border-top-right-radius: 18px;
          background: linear-gradient(90deg, var(--primary-400), var(--accent-400));
          opacity: 0.12;
        }
        .dashboard-hr-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 32px 24px 16px 24px;
        }
        .dashboard-hr-card-metric {
          font-size: 2.2rem;
          font-weight: 700;
          color: var(--primary-500);
          margin: 0;
          min-width: 48px;
          text-align: center;
        }
        .dashboard-hr-card-metric-label {
          font-size: 1rem;
          color: var(--primary-300);
          margin: 0;
        }
        .dashboard-hr-card-icon {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .dashboard-hr-card-icon-bg {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--icon-bg, #f5f5f5);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.07);
          margin-right: 0;
          padding: 10px;
        }
        .dashboard-hr-card-icon-shadow {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          border-radius: 50%;
          background: var(--icon-shadow);
          z-index: 0;
        }
        .dashboard-hr-card-divider {
          height: 1px;
          background: var(--primary-100);
          margin: 0 24px 0 24px;
        }
        .dashboard-hr-card-action {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          font-size: 1.08rem;
          color: var(--accent-400);
          padding: 16px 24px 20px 24px;
          font-weight: 500;
          transition: color 0.2s;
        }
        .dashboard-hr-card-action:hover {
          color: var(--accent-500);
        }
        .dashboard-hr-card-action-arrow {
          margin-left: 8px;
          font-size: 1.2rem;
        }
      `}</style>
      <Row gutter={[32, 32]} justify="center">
        {sectionsConfig.slice(0, 3).map(section => (
          <Col xs={24} sm={12} md={8} lg={8} xl={8} key={section.key}>
            <div
              className="dashboard-hr-card"
              tabIndex={0}
              onClick={() => navigate(section.path)}
              aria-label={`Go to ${section.title}`}
            >
              <div className="dashboard-hr-card-accent" />
              <div className="dashboard-hr-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="dashboard-hr-card-metric">
                    {loading || totals[section.key] === null ? <Spin size="small" /> : totals[section.key]}
                  </div>
                  <div className="dashboard-hr-card-metric-label">Total</div>
                </div>
                <div className="dashboard-hr-card-icon">
                  <span className="dashboard-hr-card-icon-shadow" style={{ '--icon-shadow': section.color + '33' }} />
                  <span className="dashboard-hr-card-icon-bg" style={{ background: section.color }}>
                    {section.icon}
                  </span>
                </div>
              </div>
              <div className="dashboard-hr-card-divider" />
              <span
                className="dashboard-hr-card-action"
                onClick={e => { e.stopPropagation(); navigate(section.path); }}
                tabIndex={0}
                role="button"
                aria-label={`Manage ${section.title}`}
              >
                Manage {section.title} <span className="dashboard-hr-card-action-arrow">&rarr;</span>
              </span>
            </div>
          </Col>
        ))}
      </Row>
      <Row gutter={[32, 32]} justify="center" style={{ marginTop: 0 }}>
        {sectionsConfig.slice(3, 6).map(section => (
          <Col xs={24} sm={12} md={8} lg={8} xl={8} key={section.key}>
            <div
              className="dashboard-hr-card"
              tabIndex={0}
              onClick={() => navigate(section.path)}
              aria-label={`Go to ${section.title}`}
            >
              <div className="dashboard-hr-card-accent" />
              <div className="dashboard-hr-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="dashboard-hr-card-metric">
                    {loading || totals[section.key] === null ? <Spin size="small" /> : totals[section.key]}
                  </div>
                  <div className="dashboard-hr-card-metric-label">Total</div>
                </div>
                <div className="dashboard-hr-card-icon">
                  <span className="dashboard-hr-card-icon-shadow" style={{ '--icon-shadow': section.color + '33' }} />
                  <span className="dashboard-hr-card-icon-bg" style={{ background: section.color }}>
                    {section.icon}
                  </span>
                </div>
              </div>
              <div className="dashboard-hr-card-divider" />
              <span
                className="dashboard-hr-card-action"
                onClick={e => { e.stopPropagation(); navigate(section.path); }}
                tabIndex={0}
                role="button"
                aria-label={`Manage ${section.title}`}
              >
                Manage {section.title} <span className="dashboard-hr-card-action-arrow">&rarr;</span>
              </span>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default AdminDashboard; 