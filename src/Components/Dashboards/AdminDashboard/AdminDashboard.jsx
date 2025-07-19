import React, { useEffect, useState } from 'react';
import {
  Layout,
  Menu,
  Typography,
  Card,
  Row,
  Col,
  message,
  Divider,
  List,
  Select,
  Input,
  Button,
  Form,
  Statistic
} from 'antd';
import {
  DashboardOutlined,
  AppstoreAddOutlined,
  NodeIndexOutlined,
  TeamOutlined,
  DollarOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [section, setSection] = useState('overview');
  const [hospitals, setHospitals] = useState(() =>
    JSON.parse(localStorage.getItem('hospitals') || '[]')
  );
  const [hospitalRevenue] = useState(() =>
    JSON.parse(localStorage.getItem('hospitalRevenue') || '[]')
  );

  useEffect(() => {
    const session = sessionStorage.getItem('adminSession');
    if (!session) {
      message.warning("Please log in as admin.");
      return navigate('/admin/login');
    }
    setAdmin(JSON.parse(session));
  }, [navigate]);

  // Persist hospitals when changed
  useEffect(() => {
    localStorage.setItem('hospitals', JSON.stringify(hospitals));
  }, [hospitals]);

  const handleMenuClick = (key) => {
    if (key === 'logout') {
      sessionStorage.removeItem('adminSession');
      message.success('Logged out');
      return navigate('/admin/login');
    }
    setSection(key);
  };

  const handleAddHospital = (values) => {
    const id = Date.now();
    const hospital = {
      id,
      ...values,
      departments: [],
    };
    setHospitals(prev => [...prev, hospital]);
    message.success("Hospital added successfully!");
    setSection('overview');
  };

  const handleAddDepartment = ({ hospitalId, department }) => {
    if (!department.trim()) {
      return message.warning("Please enter a valid department name.");
    }

    const updated = hospitals.map(h =>
      h.id === hospitalId
        ? { ...h, departments: [...h.departments, department] }
        : h
    );

    setHospitals(updated);
    message.success("Department added!");
  };

  // 📊 Aggregate booking revenue for relavant hospital
  const getRevenueStats = (hospitalName) => {
    const bookings = hospitalRevenue.filter(r => r.hospital === hospitalName);
    const totalConsultations = bookings.length;
    const totalRevenue = bookings.reduce((sum, r) => sum + (r.fee || 0), 0);
    const doctorShare = totalRevenue * 0.6;
    const hospitalShare = totalRevenue * 0.4;

    const revenueByDoctor = {};
    const revenueByDepartment = {};

    bookings.forEach(r => {
      revenueByDoctor[r.doctor] = (revenueByDoctor[r.doctor] || 0) + r.fee * 0.6;
      revenueByDepartment[r.specialization] = (revenueByDepartment[r.specialization] || 0) + r.fee * 0.4;
    });

    return {
      totalConsultations,
      totalRevenue,
      doctorShare,
      hospitalShare,
      revenueByDoctor,
      revenueByDepartment,
    };
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={240}>
        <Menu
          mode="inline"
          selectedKeys={[section]}
          onClick={(e) => handleMenuClick(e.key)}
          style={{ height: '100%' }}
        >
          <Menu.Item key="overview" icon={<DashboardOutlined />}>Overview</Menu.Item>
          <Menu.Item key="add" icon={<AppstoreAddOutlined />}>Register Hospital</Menu.Item>
          <Menu.Item key="departments" icon={<NodeIndexOutlined />}>Manage Departments</Menu.Item>
          <Menu.Item key="stats" icon={<DollarOutlined />}>Statistics</Menu.Item>
          <Menu.Item key="doctors" icon={<TeamOutlined />}>All Bookings</Menu.Item>
          <Menu.Item key="logout" icon={<LogoutOutlined />}>Logout</Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        <Header style={{ background: "#fff", padding: 16 }}>
          <Title level={3}>Welcome, {admin?.username || "Admin"}</Title>
        </Header>

        <Content style={{ margin: 24, padding: 24, background: "#fff" }}>
          {/* Overview */}
          {section === 'overview' && (
            <Row gutter={16}>
              {hospitals.map(h => (
                <Col span={8} key={h.id}>
                  <Card title={h.name}>
                    <p><strong>City:</strong> {h.city}</p>
                    <p><strong>Email:</strong> {h.email}</p>
                    <p><strong>Phone:</strong> {h.phone}</p>
                    <p><strong>Departments:</strong> {h.departments.join(', ') || 'None'}</p>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {/* Add Hospital */}
          {section === 'add' && <HospitalForm onSubmit={handleAddHospital} />}

          {/* Manage Departments */}
          {section === 'departments' && (
            <DepartmentManager hospitals={hospitals} onAdd={handleAddDepartment} />
          )}

          {/* Booking Records */}
          {section === 'doctors' && (
            <>
              <Title level={4}>All Booking Records</Title>
              {hospitals.map(h => (
                <Card key={h.id} title={h.name} style={{ marginBottom: 24 }}>
                  <List
                    dataSource={hospitalRevenue.filter(r => r.hospital === h.name)}
                    renderItem={item => (
                      <List.Item>
                        <b>{item.doctor}</b> — {item.specialization} | ₹{item.fee} | Slot: {item.slot} | Patient: {item.patient}
                      </List.Item>
                    )}
                    locale={{ emptyText: "No bookings found" }}
                  />
                </Card>
              ))}
            </>
          )}

          {/* Statistics */}
          {section === 'stats' && (
            <>
              <Title level={4}>Revenue Statistics</Title>
              {hospitals.map(h => {
                const {
                  totalConsultations,
                  totalRevenue,
                  doctorShare,
                  hospitalShare,
                  revenueByDoctor,
                  revenueByDepartment
                } = getRevenueStats(h.name);

                return (
                  <Card key={h.id} title={h.name} style={{ marginBottom: 32 }}>
                    <Row gutter={16}>
                      <Col span={6}><Statistic title="Consultations" value={totalConsultations} /></Col>
                      <Col span={6}><Statistic title="Total Revenue" prefix="₹" value={totalRevenue.toFixed(2)} /></Col>
                      <Col span={6}><Statistic title="Doctor Share (60%)" prefix="₹" value={doctorShare.toFixed(2)} /></Col>
                      <Col span={6}><Statistic title="Hospital Share (40%)" prefix="₹" value={hospitalShare.toFixed(2)} /></Col>
                    </Row>

                    <Divider />
                    <Title level={5}>Doctor Earnings</Title>
                    <List
                      dataSource={Object.entries(revenueByDoctor)}
                      renderItem={([name, val]) => (
                        <List.Item>{name}: ₹{val.toFixed(2)}</List.Item>
                      )}
                    />

                    <Divider />
                    <Title level={5}>Revenue by Department (Hospital Share)</Title>
                    <List
                      dataSource={Object.entries(revenueByDepartment)}
                      renderItem={([dept, val]) => (
                        <List.Item>{dept}: ₹{val.toFixed(2)}</List.Item>
                      )}
                    />
                  </Card>
                );
              })}
            </>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

// 🔧 Add Hospital Form
const HospitalForm = ({ onSubmit }) => {
  const [form] = Form.useForm();
  const onFinish = (values) => {
    onSubmit(values);
    form.resetFields();
  };

  return (
    <Form layout="vertical" form={form} onFinish={onFinish} style={{ maxWidth: 600 }}>
      <Title level={4}>Register Hospital</Title>
      <Form.Item name="name" label="Hospital Name" rules={[{ required: true }]}><Input /></Form.Item>
      <Form.Item name="type" label="Hospital Type" rules={[{ required: true }]}>
        <Select>
          <Option value="Clinic">Clinic</Option>
          <Option value="Multi-specialty">Multi-specialty</Option>
        </Select>
      </Form.Item>
      <Form.Item name="city" label="City" rules={[{ required: true }]}><Input /></Form.Item>
      <Form.Item name="address" label="Address" rules={[{ required: true }]}><Input /></Form.Item>
      <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
      <Form.Item name="phone" label="Contact" rules={[{ required: true }]}><Input /></Form.Item>
      <Button type="primary" htmlType="submit">Add Hospital</Button>
    </Form>
  );
};

// 🔧 Department Manager
const DepartmentManager = ({ hospitals, onAdd }) => {
  const [selected, setSelected] = useState();
  const [department, setDepartment] = useState('');

  const handleSelect = (id) => {
    const hospital = hospitals.find(h => h.id === parseInt(id));
    setSelected(hospital);
  };

  const handleAdd = () => {
    if (selected && department.trim()) {
      onAdd({ hospitalId: selected.id, department });
      setDepartment('');
    }
  };

  return (
    <>
      <Select placeholder="Select Hospital" style={{ width: 300 }} onChange={handleSelect}>
        {hospitals.map(h => <Option key={h.id} value={h.id.toString()}>{h.name}</Option>)}
      </Select>

      {selected && (
        <>
          <div style={{ marginTop: 24 }}>
            <Input
              placeholder="New Department"
              value={department}
              onChange={e => setDepartment(e.target.value)}
              style={{ width: '50%', marginRight: 10 }}
            />
            <Button type="primary" onClick={handleAdd}>Add Department</Button>
          </div>

          <Divider />
          <Title level={5}>Departments in {selected.name}</Title>
          <List bordered dataSource={selected.departments} renderItem={dep => <List.Item>{dep}</List.Item>} />
        </>
      )}
    </>
  );
};

export default AdminDashboard;
