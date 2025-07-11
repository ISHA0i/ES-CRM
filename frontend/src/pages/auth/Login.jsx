import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Alert } from 'antd';

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
    <div style={{ maxWidth: 320, margin: '80px auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #f0f1f2' }}>
      <h2 style={{ textAlign: 'center' }}>Admin Login</h2>
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please input your email!' }]}> 
          <Input autoComplete="username" />
        </Form.Item>
        <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please input your password!' }]}> 
          <Input.Password autoComplete="current-password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>Login</Button>
        </Form.Item>
        <div style={{ fontSize: 12, color: '#888', textAlign: 'center' }}>
          <div>Demo: admin@example.com / admin123</div>
        </div>
      </Form>
    </div>
  );
};

export default Login; 