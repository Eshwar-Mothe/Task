// src/pages/PatientSignup.jsx

import React from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const PatientSignup = () => {
  const navigate = useNavigate();

  const onFinish = (values) => {
    // Save patient creds to localStorage
    localStorage.setItem('patientCredentials', JSON.stringify(values));
    message.success('Signup successful! Please login.');
    navigate('/patient/signin');
  };

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 24, background: '#fff', borderRadius: 8 }}>
      <Title level={3}>Patient Signup</Title>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please enter your name' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Invalid email' }
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please enter a password' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Signup
          </Button>
        </Form.Item>
        <div style={{ textAlign: 'center' }}>
          Already have an account? <a onClick={() => navigate('/patient/signin')}>Login</a>
        </div>
      </Form>
    </div>
  );
};

export default PatientSignup;
