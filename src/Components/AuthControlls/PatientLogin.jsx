// src/pages/PatientLogin.jsx

import React from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const PatientLogin = () => {
  const navigate = useNavigate();

  const onFinish = (values) => {
    const stored = localStorage.getItem('patientCredentials');
    if (!stored) {
      message.error('No patient found. Please signup.');
      return;
    }

    const parsed = JSON.parse(stored);
    if (parsed.email === values.email && parsed.password === values.password) {
      message.success('Login successful!');
      navigate('/patient/dashboard'); // redirect to dashboard
    } else {
      message.error('Invalid email or password');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 24, background: '#fff', borderRadius: 8 }}>
      <Title level={3}>Patient Login</Title>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Email is invalid' }
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please enter your password' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button htmlType="submit" type="primary" block>
            Login
          </Button>
        </Form.Item>
        <div style={{ textAlign: 'center' }}>
          Don't have an account? <a onClick={() => navigate('/patient/signup')}>Signup</a>
        </div>
      </Form>
    </div>
  );
};

export default PatientLogin;
