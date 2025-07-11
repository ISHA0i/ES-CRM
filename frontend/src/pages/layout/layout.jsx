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
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

// Rename the component to avoid conflict with imported Layout
const AdminLayout = ({ onLogout, children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const siderStyle = {
    background: '#001529',
    color: '#fff',
    minHeight: '100vh',
  };

  const headerStyle = {
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px 0 0',
    minHeight: 64,
    height: 64,
    borderBottom: '1px solid #f0f0f0',
    zIndex: 10,
    width: '100%',
    // Let Ant Design handle sizing!
  };

  const contentStyle = {
    padding: 24,
    minHeight: 'calc(100vh - 64px)',
    margin: 0,
    width: '100%',
  };

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <UserOutlined />,
      label: 'Dashboard',
    },
    {
      key: '2',
      icon: <VideoCameraOutlined />,
      label: 'Leads',
    },
    {
      key: '3',
      icon: <UploadOutlined />,
      label: 'nav 3',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={240}
        style={siderStyle}
        breakpoint="md"
        trigger={null}
      >
        <div
          style={{
            height: 32,
            margin: 16,
            background: 'rgba(255,255,255,0.2)',
          }}
        />
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={({ key }) => {
            if (key === '/admin/dashboard') navigate(key);
          }}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 64, height: 64 }}
            />
            <span style={{ fontWeight: 'bold', fontSize: 18, marginLeft: 16 }}>
              Header
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
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
