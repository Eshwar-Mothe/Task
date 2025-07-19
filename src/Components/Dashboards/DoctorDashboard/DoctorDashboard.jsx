import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Typography,
  Modal,
  Form,
  DatePicker,
  TimePicker,
  Input,
  Table,
  message,
} from 'antd';
import moment from 'moment';

const { Title } = Typography;
const { RangePicker } = TimePicker;

// Static hospital data
const sampleHospitals = [
  { id: 1, name: 'Sunshine Hospital', departments: ['Cardio', 'Neuro'] },
  { id: 2, name: 'Apollo Hospitals', departments: ['Orthopedics', 'Dermatology'] },
  { id: 3, name: 'KIMS Hospital', departments: ['Cardiology', 'Pediatrics'] },
];

// Get slots from local storage
const getStoredSlots = () => {
  const data = JSON.parse(localStorage.getItem('doctorTimeSlots')) || [];
  return data.map(slot => ({
    ...slot,
    startTime: moment(slot.startTime),
    endTime: moment(slot.endTime),
  }));
};

// Save slots to localStorage
const saveSlotsToStorage = (slots) => {
  const serialized = slots.map(slot => ({
    ...slot,
    startTime: slot.startTime.toISOString(),
    endTime: slot.endTime.toISOString(),
  }));
  localStorage.setItem('doctorTimeSlots', JSON.stringify(serialized));
};

const DoctorDashboard = () => {
  const [doctor, setDoctor] = useState(null);
  const [hospitals] = useState(sampleHospitals);
  const [timeSlots, setTimeSlots] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  // Get doctor info from sessionStorage
  useEffect(() => {
    const loggedInDoctor = JSON.parse(sessionStorage.getItem('loggedInDoctor'));
    if (loggedInDoctor?.username) {
      setDoctor(loggedInDoctor);
    }
  }, []);

  // Load time slots from localStorage
  useEffect(() => {
    setTimeSlots(getStoredSlots());
  }, []);

  // Open add slot modal
  const openModal = (hospital) => {
    setSelectedHospital(hospital);
    setModalVisible(true);
  };

  // Check for overlapping slot for the same doctor (across hospitals)
  const isOverlapping = (date, start, end) => {
    return timeSlots.some(slot =>
      slot.date === date &&
      slot.doctorUsername === doctor.username &&
      start.isBefore(slot.endTime) &&
      end.isAfter(slot.startTime)
    );
  };

  // Handle form submit
  const handleAddSlot = (values) => {
    const { date, time, fee } = values;
    if (!date || !time || time.length !== 2) {
      return messageApi.error('Please select a valid date and time range.');
    }

    const [startRaw, endRaw] = time;
    const start = moment(date).hour(startRaw.hour()).minute(startRaw.minute()).second(0);
    const end = moment(date).hour(endRaw.hour()).minute(endRaw.minute()).second(0);
    const dateStr = date.format('YYYY-MM-DD');

    if (!start.isValid() || !end.isValid() || start.isSameOrAfter(end)) {
      return messageApi.error('Invalid time range.');
    }

    if (isOverlapping(dateStr, start, end)) {
      return messageApi.warning("You're already scheduled during this time.");
    }

    const newSlot = {
      doctorUsername: doctor.username,
      hospitalId: selectedHospital.id,
      hospital: selectedHospital.name,
      date: dateStr,
      startTime: start,
      endTime: end,
      fee: Number(fee),
    };

    const updatedSlots = [...timeSlots, newSlot];
    setTimeSlots(updatedSlots);
    saveSlotsToStorage(updatedSlots);

    messageApi.success('Slot added successfully!');
    form.resetFields();
    setModalVisible(false);
  };

  // Table columns
  const columns = [
    { title: 'Hospital', dataIndex: 'hospital' },
    { title: 'Date', dataIndex: 'date' },
    {
      title: 'Time',
      render: (row) => `${row.startTime.format('HH:mm')} - ${row.endTime.format('HH:mm')}`,
    },
    { title: 'Fee (₹)', dataIndex: 'fee' },
  ];

  return (
    <div style={{ padding: 24 }}>
      {contextHolder}
      <Title level={3}>Doctor Dashboard</Title>

      {/* Doctor Info Card */}
      {doctor && (
        <Card style={{ marginBottom: 24 }}>
          <Title level={4}>Doctor Info</Title>
          <p><strong>Name:</strong> Dr. {doctor.username}</p>
          <p><strong>Qualification:</strong> {doctor.qualification}</p>
          <p><strong>Experience:</strong> {doctor.experience} years</p>
          <p><strong>Specializations:</strong> {doctor.specializations?.join(', ') || 'N/A'}</p>
        </Card>
      )}

      {/* Hospital Cards */}
      <Title level={4}>Hospitals</Title>
      {hospitals.map(hospital => (
        <Card key={hospital.id} style={{ marginBottom: 16 }}>
          <p><strong>{hospital.name}</strong></p>
          <p>Departments: {hospital.departments.join(', ')}</p>
          <Button type="primary" onClick={() => openModal(hospital)}>
            Manage Schedule
          </Button>
        </Card>
      ))}

      {/* Time Slot Table */}
      <Title level={4}>Your Time Slots</Title>
      <Table
        columns={columns}
        dataSource={timeSlots.filter(slot => slot.doctorUsername === doctor?.username)}
        rowKey={(record, index) => index}
        bordered
      />

      {/* Modal to Add Slots */}
      <Modal
        open={modalVisible}
        title={`Manage Schedule - ${selectedHospital?.name}`}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        okText="Add Slot"
      >
        <Form layout="vertical" form={form} onFinish={handleAddSlot}>
          <Form.Item
            name="fee"
            label="Consultation Fee (₹)"
            rules={[{ required: true, message: 'Enter consultation fee' }]}
          >
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item
            name="date"
            label="Select Date"
            rules={[{ required: true, message: 'Select date' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              disabledDate={current => current && current < moment().startOf('day')}
            />
          </Form.Item>
          <Form.Item
            name="time"
            label="Time Range"
            rules={[{ required: true, message: 'Select time range' }]}
          >
            <RangePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DoctorDashboard;
