import React, { useState } from 'react';
import { Layout, Menu, Button } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined,
  VideoCameraOutlined,
  UploadOutlined,
  LogoutOutlined,
  TeamOutlined,
  AppstoreOutlined,
  GiftOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import HemInfotechLogo from '../../assets/Hem Infotech Logo.png';
import '../../root.css'
import { HomeIcon, UsersIcon, UserGroupIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';

const { Header, Sider, Content } = Layout;

// Rename the component to avoid conflict with imported Layout
const AdminLayout = ({ onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  let selectedKey = location.pathname;
  if (selectedKey.startsWith('/admin/inventory')) {
    selectedKey = '/admin/inventory';
  }

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <HomeIcon style={{ width: 20, height: 20 }} />, // Dashboard
      label: 'Dashboard',
    },
    {
      key: '/admin/leads',
      icon: <UserOutlined style={{ fontSize: 20 }} />, // Leads
      label: 'Leads',
    },
    {
      key: '/admin/clients',
      icon: <TeamOutlined style={{ fontSize: 20 }} />, // Clients
      label: 'Clients',
    },
    {
      key: '/admin/inventory',
      icon: <AppstoreOutlined style={{ fontSize: 20 }} />, // Inventory
      label: 'Inventory',
    },
    {
      key: '/admin/package',
      icon: <GiftOutlined style={{ fontSize: 20 }} />, // Package
      label: 'Package',
    },
    {
      key: '/admin/quotation',
      icon: <FileTextOutlined style={{ fontSize: 20 }} />, // Quotation
      label: 'Quotation',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={240}
        className="custom-sider"
        breakpoint="md"
        trigger={null}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
          background: 'var(--accent-200)',
          padding: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          borderRadius: 8,
        }}>
          <img src={HemInfotechLogo} alt="Hem Infotech Logo" style={{ height: 40, maxWidth: 180, objectFit: 'contain', borderRadius: 8, display: 'block' }} />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={({ key }) => {
            navigate(key);
          }}
          items={menuItems}
        />
      </Sider>
      <Layout
        style={{
          marginLeft: collapsed ? 80 : 240,
          transition: 'margin-left 0.2s',
        }}
      >
        <Header className="custom-header">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold', fontSize: 18, marginLeft: 16, color: 'var(--header-color)', letterSpacing: 2 }}>
              HEM INFOTECH
            </span>
          </div>
          <Button
            type="text"
            icon={<LogoutOutlined style={{ fontSize: 20, color: '#f00' }} />}
            onClick={onLogout}
            style={{ marginLeft: 'auto' }}
          />
        </Header>
        <Content className="custom-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
