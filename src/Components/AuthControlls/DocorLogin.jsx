import React from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const DoctorLogin = () => {
  const navigate = useNavigate();

  const onFinish = ({ username, password }) => {
    const storedDoctors = JSON.parse(localStorage.getItem('doctors') || '[]');
    const matchedDoctor = storedDoctors.find(doc => doc.username === username && doc.password === password);

    if (matchedDoctor) {
      sessionStorage.setItem('loggedInDoctor', JSON.stringify(matchedDoctor));
      message.success('Login successful!');
      navigate('/doctor/dashboard');
    } else {
      message.error('Invalid username or password');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 24 }}>
      <Title level={3}>Doctor Login</Title>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item name="username" label="Username" rules={[{ required: true }]} >
          <Input placeholder="Enter username" />
        </Form.Item>
        <Form.Item name="password" label="Password" rules={[{ required: true }]} >
          <Input.Password placeholder="Enter password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>Login</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default DoctorLogin;
