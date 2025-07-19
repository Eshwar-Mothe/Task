import React from 'react';
import { Card, Button, Row, Col, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { UserOutlined, MedicineBoxOutlined, CrownOutlined } from '@ant-design/icons';

const { Title } = Typography;

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f0f2f5'
    }}>
      <Title level={2} style={{ marginBottom: 40 }}>Welcome to the Hospital Portal</Title>
      <Row gutter={32} justify="center">
        <Col xs={24} sm={12} md={8}>
          <Card
            bordered
            style={{ minWidth: 250, textAlign: 'center', minHeight: 260 }}
            cover={<CrownOutlined style={{ fontSize: 64, color: '#d4b106', marginTop: 16 }} />}
          >
            <Title level={4}>Admin</Title>
            <p>Access analytics and manage hospital data.</p>
            <Button type="primary" onClick={() => navigate('/admin/login')}>
              Admin Sign In
            </Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card
            bordered
            style={{ minWidth: 250, textAlign: 'center', minHeight: 260 }}
            cover={<MedicineBoxOutlined style={{ fontSize: 64, color: '#08979c', marginTop: 16 }} />}
          >
            <Title level={4}>Doctor</Title>
            <p>Register as a new doctor to start offering consultations.</p>
            <Button type="primary" onClick={() => navigate('/doctor/signup')}>
              Doctor Signup
            </Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card
            bordered
            style={{ minWidth: 250, textAlign: 'center', minHeight: 260 }}
            cover={<UserOutlined style={{ fontSize: 64, color: '#1d39c4', marginTop: 16 }} />}
          >
            <Title level={4}>Patient</Title>
            <p>Sign up as a patient to book doctor appointments.</p>
            <Button type="primary" onClick={() => navigate('/patient/signup')}>
              Patient Signup
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HomePage;
