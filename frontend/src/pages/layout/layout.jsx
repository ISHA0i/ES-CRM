import React, { useState } from 'react';
import { Layout, Menu, Button } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined,
  VideoCameraOutlined,
  UploadOutlined,
  LogoutOutlined,
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

  const headerStyle = {
    background: 'var(--background-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px 0 0',
    minHeight: 64,
    height: 64,
    // borderBottom: '1px solid var(--border-color)',
    zIndex: 10,
    width: '100%',
    // boxShadow: '0 2px 8px #e6eaf0',
  };

  const contentStyle = {
    padding: 10,
    minHeight: 'calc(100vh - 64px)',
    margin: 0,
    width: '100%',
    background: 'var(--background-alt)',
    borderRadius: 12,
  };

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <HomeIcon style={{ width: 20, height: 20 }} />, // Dashboard
      label: 'Dashboard',
    },
    {
      key: '/admin/leads',
      icon: <UsersIcon style={{ width: 20, height: 20 }} />, // Leads
      label: 'Leads',
    },
    {
      key: '/admin/clients',
      icon: <UserGroupIcon style={{ width: 20, height: 20 }} />, // Clients
      label: 'Clients',
    },
    {
      key: '/admin/inventory',
      icon: <ArchiveBoxIcon style={{ width: 20, height: 20 }} />, // Inventory
      label: 'Inventory',
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // height: 32,
            marginBottom:  12,
            background: 'var(--accent-200)',
            // borderRadius: 12,
            padding: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <img src={HemInfotechLogo} alt="Hem Infotech Logo" style={{ height: 40, maxWidth: 180, objectFit: 'contain', borderRadius: 8, display: 'block' }} />
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={({ key }) => {
            navigate(key);
          }}
          items={menuItems}
        />
      </Sider>
      <Layout className="layout-content-with-fixed-sider">
        <Header style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 64, height: 64 }}
            />
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
        <Content style={contentStyle}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
