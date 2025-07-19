import React from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const AdminLogin = () => {
  const navigate = useNavigate();

  const onFinish = ({ username, password }) => {
    const users = JSON.parse(localStorage.getItem("adminUsers") || '[]');

    const match = users.find(
      u => u.username === username && u.password === password
    );

    if (match) {
      sessionStorage.setItem("adminSession", JSON.stringify(match));
      message.success("Login successful!");
      navigate('/admin/dashboard');
    } else {
      message.error("Invalid credentials.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: '2rem' }}>
      <Title level={3}>Admin Login</Title>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true }]}
        >
          <Input placeholder="Enter username" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true }]}
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>
        <Button type="primary" htmlType="submit" block>
          Login
        </Button>
      </Form>
    </div>
  );
};

export default AdminLogin;
