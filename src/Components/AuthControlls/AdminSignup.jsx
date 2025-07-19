import React from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const AdminSignup = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = ({ username, password }) => {
    const existing = localStorage.getItem("adminUsers") || '[]';
    const users = JSON.parse(existing);

    const exists = users.find(user => user.username === username);
    if (exists) {
      message.error("Username already taken.");
      return;
    }

    users.push({ username, password });
    localStorage.setItem("adminUsers", JSON.stringify(users));
    message.success("Successfully registered!");
    navigate('/admin/login');
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: '2rem' }}>
      <Title level={3}>Admin Signup</Title>
      <Form layout="vertical" form={form} onFinish={onFinish}>
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
          Signup
        </Button>
      </Form>
    </div>
  );
};

export default AdminSignup;
