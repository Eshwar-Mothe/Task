import React, { useEffect, useState } from 'react';
import {
  Layout, Menu, Typography, Card, Statistic, Select,
  Button, Tag, Table, message, Modal,
  Row,
  Col
} from 'antd';
import {
  AppstoreOutlined,
  ScheduleOutlined,
  HistoryOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const mockDoctors = [
  {
    id: 1,
    name: 'Dr. Asha Menon',
    specialization: 'Cardiology',
    hospital: 'Apollo',
    availableSlots: ['10:00 AM', '11:30 AM', '3:00 PM']
  },
  {
    id: 2,
    name: 'Dr. Rajeev Kumar',
    specialization: 'Dermatology',
    hospital: 'Manipal',
    availableSlots: ['12:30 PM', '2:00 PM', '4:00 PM']
  },
  {
    id: 3,
    name: 'Dr. Shalini Patil',
    specialization: 'Neurology',
    hospital: 'Fortis',
    availableSlots: ['9:00 AM', '1:00 PM']
  }
];

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [menuPage, setMenuPage] = useState('overview');
  const [filteredDoctors, setFilteredDoctors] = useState(mockDoctors);
  const [bookedSlots, setBookedSlots] = useState({});
  const [consultationFees] = useState(() =>
    Object.fromEntries(mockDoctors.map(d => [d.id, Math.floor(Math.random() * 500) + 200]))
  );

  const [bookings, setBookings] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [patientInfo, setPatientInfo] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();

  // Load patient session
  useEffect(() => {
    const patientCreds = JSON.parse(localStorage.getItem('patientCredentials'));
    const stored = JSON.parse(localStorage.getItem('patientBookings')) || [];

    if (!patientCreds || !patientCreds.email) {
      messageApi.error('You must be logged in.');
      return navigate('/patient/signin');
    }

    const slotMap = {};
    stored.forEach(b => {
      const doc = mockDoctors.find(d => d.name === b.doctor);
      if (doc) {
        if (!slotMap[doc.id]) slotMap[doc.id] = [];
        slotMap[doc.id].push(b.slot);
      }
    });

    setBookings(stored);
    setPatientInfo(patientCreds);
    setBookedSlots(slotMap);
  }, [navigate]);

  // Appointment Booking Modal
  const openBookingModal = (doctor, slot) => {
    setSelectedDoctor(doctor);
    setSelectedSlot(slot);
    setModalVisible(true);
  };

  const handleBooking = () => {
    if (!selectedDoctor || !selectedSlot) return;

    const newBooking = {
      id: Date.now(),
      doctor: selectedDoctor.name,
      specialization: selectedDoctor.specialization,
      hospital: selectedDoctor.hospital,
      slot: selectedSlot,
      fee: consultationFees[selectedDoctor.id],
      patient: patientInfo.name || patientInfo.email,
      timestamp: new Date().toISOString()
    };

    // Save to patient's bookings
    const updatedPatientBookings = [...bookings, newBooking];
    localStorage.setItem('patientBookings', JSON.stringify(updatedPatientBookings));
    setBookings(updatedPatientBookings);

    // Save to hospital revenue (used in admin)
    const prevRevenue = JSON.parse(localStorage.getItem('hospitalRevenue') || '[]');
    const updatedRevenue = [...prevRevenue, newBooking];
    localStorage.setItem('hospitalRevenue', JSON.stringify(updatedRevenue));

    setBookedSlots(prev => ({
      ...prev,
      [selectedDoctor.id]: [...(prev[selectedDoctor.id] || []), selectedSlot]
    }));

    setModalVisible(false);
    messageApi.success('Appointment booked successfully!');
  };

  const handleLogout = () => {
    localStorage.removeItem('patientCredentials');
    messageApi.success('Logged out');
    navigate('/patient/signin');
  };

  const handleFilter = () => {
    const filtered = mockDoctors.filter(doc =>
      (!selectedSpecialization || doc.specialization === selectedSpecialization) &&
      (!selectedHospital || doc.hospital === selectedHospital)
    );
    setFilteredDoctors(filtered);
  };

  const renderOverview = () => {
    const totalDoctors = mockDoctors.length;
    const totalBookings = bookings.length;
    const uniqueSpecs = Array.from(new Set(mockDoctors.map(doc => doc.specialization))).length;

    return (
      <div>
        {contextHolder}
        <Title level={3}>Welcome, {patientInfo?.name || patientInfo?.email}</Title>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}><Card><Statistic title="Total Doctors" value={totalDoctors} /></Card></Col>
          <Col span={6}><Card><Statistic title="Total Bookings" value={totalBookings} /></Card></Col>
          <Col span={6}><Card><Statistic title="Specializations" value={uniqueSpecs} /></Card></Col>
        </Row>

        {totalBookings > 0 && (
          <>
            <Title level={4}>Recent Bookings</Title>
            <Table
              dataSource={bookings.slice(-3)}
              rowKey="id"
              pagination={false}
              columns={[
                { title: 'Doctor', dataIndex: 'doctor' },
                { title: 'Slot', dataIndex: 'slot' },
                { title: 'Hospital', dataIndex: 'hospital' },
                { title: 'Fee (₹)', dataIndex: 'fee' },
              ]}
            />
          </>
        )}
      </div>
    );
  };

  const renderBooking = () => (
    <>
    {contextHolder}
      <Title level={3}>Book Appointment</Title>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <Select
          placeholder="Specialization"
          style={{ width: 180 }}
          allowClear
          onChange={setSelectedSpecialization}
        >
          <Option value="Cardiology">Cardiology</Option>
          <Option value="Dermatology">Dermatology</Option>
          <Option value="Neurology">Neurology</Option>
        </Select>
        <Select
          placeholder="Hospital"
          style={{ width: 180 }}
          allowClear
          onChange={setSelectedHospital}
        >
          <Option value="Apollo">Apollo</Option>
          <Option value="Manipal">Manipal</Option>
          <Option value="Fortis">Fortis</Option>
        </Select>
        <Button type="primary" onClick={handleFilter}>Filter</Button>
      </div>

      {filteredDoctors.map(doc => (
        <Card
          key={doc.id}
          title={doc.name}
          style={{ marginBottom: 16 }}
          extra={<Tag>{doc.specialization}</Tag>}
        >
          <p><b>Hospital:</b> {doc.hospital}</p>
          <p><b>Fee:</b> ₹{consultationFees[doc.id]}</p>
          <p><b>Available Slots:</b></p>
          <div style={{ display: 'flex', gap: 8 }}>
            {doc.availableSlots.map(slot => (
              <Button
                key={slot}
                disabled={bookedSlots[doc.id]?.includes(slot)}
                type="default"
                size="small"
                onClick={() => openBookingModal(doc, slot)}
              >
                {slot}
              </Button>
            ))}
          </div>
        </Card>
      ))}

      <Modal
        title="Confirm Appointment"
        open={modalVisible}
        onOk={handleBooking}
        onCancel={() => setModalVisible(false)}
        okText="Confirm"
      >
        <p><b>Doctor:</b> {selectedDoctor?.name}</p>
        <p><b>Specialization:</b> {selectedDoctor?.specialization}</p>
        <p><b>Hospital:</b> {selectedDoctor?.hospital}</p>
        <p><b>Slot:</b> {selectedSlot}</p>
        <p><b>Fee:</b> ₹{selectedDoctor ? consultationFees[selectedDoctor.id] : 0}</p>
      </Modal>
    </>
  );

  const renderHistory = () => (
    <>
    {contextHolder}
      <Title level={3}>Your Booking History</Title>
      <Table
        dataSource={bookings}
        rowKey="id"
        columns={[
          { title: 'Doctor', dataIndex: 'doctor' },
          { title: 'Specialization', dataIndex: 'specialization' },
          { title: 'Hospital', dataIndex: 'hospital' },
          { title: 'Slot', dataIndex: 'slot' },
          { title: 'Fee (₹)', dataIndex: 'fee' },
        ]}
      />
    </>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
        {contextHolder}
      <Sider>
        <div style={{ color: 'white', padding: 16, fontSize: 18, textAlign: 'center' }}>
          {patientInfo?.name || 'Patient'}
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[menuPage]}>
          <Menu.Item key="overview" icon={<AppstoreOutlined />} onClick={() => setMenuPage('overview')}>
            Overview
          </Menu.Item>
          <Menu.Item key="booking" icon={<ScheduleOutlined />} onClick={() => setMenuPage('booking')}>
            Book Appointment
          </Menu.Item>
          <Menu.Item key="history" icon={<HistoryOutlined />} onClick={() => setMenuPage('history')}>
            Booking History
          </Menu.Item>
          <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
            Logout
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        <Header style={{ background: 'white', paddingLeft: 16 }}>
          <Title level={4} style={{ margin: 0 }}>
            {menuPage === 'overview' && 'Dashboard Overview'}
            {menuPage === 'booking' && 'Book Appointment'}
            {menuPage === 'history' && 'Booking History'}
          </Title>
        </Header>
        <Content style={{ margin: 16 }}>
          <div style={{ background: '#fff', padding: 24, minHeight: 400 }}>
            {menuPage === 'overview' && renderOverview()}
            {menuPage === 'booking' && renderBooking()}
            {menuPage === 'history' && renderHistory()}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default PatientDashboard;
