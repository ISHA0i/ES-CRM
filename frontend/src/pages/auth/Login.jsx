import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Alert } from 'antd';
import HemInfotechLogo from '../../assets/Hem Infotech Logo.png';
import '../../root.css'

const Login = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onFinish = (values) => {
    const { email, password } = values;
    if (email === 'admin@example.com' && password === 'admin123') {
      localStorage.setItem('role', 'admin');
      setError('');
      navigate('/admin/dashboard');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: 340, width: '100%', padding: 32, background: 'var(--background-color)', borderRadius: 16, boxShadow: '0 2px 16px #e6eaf0', border: '1px solid var(--border-color)' }}>
        <img src={HemInfotechLogo} alt="Hem Infotech Logo" style={{ display: 'block', margin: '0 auto 16px', maxWidth: 180, height: 'auto' }} />
        <h2 style={{ textAlign: 'center', color: 'var(--header-color)', letterSpacing: 2, marginBottom: 24 }}>Admin Login</h2>
        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please input your email!' }]}> 
            <Input autoComplete="username" size="large" />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please input your password!' }]}> 
            <Input.Password autoComplete="current-password" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" style={{ background: 'var(--accent-500)', borderColor: 'var(--accent-500)', borderRadius: 6 }}>Login</Button>
          </Form.Item>
          <div style={{ fontSize: 12, color: 'var(--text-light)', textAlign: 'center' }}>
            <div>Demo: admin@example.com / admin123</div>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Login; 