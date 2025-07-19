import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Statistic,
  Row,
  Col,
  Table,
  Typography,
  Form,
  Input,
  Select,
  Button,
  Divider,
  DatePicker,
  TimePicker,
  message,
} from 'antd';
import moment from 'moment';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = TimePicker;

const sampleHospitals = [
  { id: 1, name: 'Sunshine Hospital', departments: ['Cardiology', 'Neurology'] },
  { id: 2, name: 'Apollo Hospitals', departments: ['Orthopedics', 'Dermatology'] },
  { id: 3, name: 'KIMS Hospital', departments: ['Cardiology', 'Pediatrics'] },
];

// Utility to fetch from localStorage
const getStoredSlots = () => {
  return JSON.parse(localStorage.getItem('doctorTimeSlots')) || [];
};

const saveSlotsToStorage = (slots) => {
  localStorage.setItem('doctorTimeSlots', JSON.stringify(slots));
};

const DoctorDashboard = () => {
  const [doctor, setDoctor] = useState(null);
  const [form] = Form.useForm();
  const [associatedHospitals, setAssociatedHospitals] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [consultationFees, setConsultationFees] = useState({});
  const [messageApi, contextHolder] = message.useMessage();

  // Load previous slots
  useEffect(() => {
    const stored = getStoredSlots();
    setTimeSlots(stored);
  }, []);

  const eligibleHospitals = useMemo(() => {
    if (!doctor) return [];
    return sampleHospitals.filter(hospital =>
      hospital.departments.some(dep => doctor.specializations.includes(dep))
    );
  }, [doctor]);

  const handleRegister = (values) => {
    setDoctor(values);
    messageApi.success('Doctor Registered');
  };

  const handleFeeChange = (hospitalId, value) => {
    setConsultationFees(prev => ({ ...prev, [hospitalId]: Number(value) }));
  };

  const handleAssociate = (hospitalId) => {
    const hospital = sampleHospitals.find(h => h.id === hospitalId);
    if (!hospital) return;

    const already = associatedHospitals.some(h => h.id === hospitalId);
    if (already) return messageApi.warning('Already associated');

    const fee = consultationFees[hospitalId];
    if (!fee || fee <= 0) {
      return messageApi.error('Enter a valid consultation fee');
    }

    setAssociatedHospitals(prev => [...prev, { ...hospital, fee }]);
    messageApi.success(`Associated with ${hospital.name}`);
  };

  // Check for time conflict
  const isOverlapping = (date, start, end) => {
    return timeSlots.some(slot => {
      return (
        slot.date === date &&
        moment(start).isBefore(moment(slot.endTime)) &&
        moment(end).isAfter(moment(slot.startTime))
      );
    });
  };

  const handleTimeSlotAdd = (hospitalId, date, timeRange) => {
    const hospital = associatedHospitals.find(h => h.id === hospitalId);
    if (!hospital) return;

    const fee = hospital.fee;
    const dateStr = date.format('YYYY-MM-DD');
    const [start, end] = timeRange;

    if (start.isSameOrAfter(end)) {
      return messageApi.error('Start time should be before end time');
    }

    if (isOverlapping(dateStr, start, end)) {
      return messageApi.error('Slot overlaps with an existing time');
    }

    const newSlot = {
      hospitalId,
      hospital: hospital.name,
      date: dateStr,
      startTime: start,
      endTime: end,
      fee,
    };

    const updated = [...timeSlots, newSlot];
    setTimeSlots(updated);
    saveSlotsToStorage(updated);
    messageApi.success('Time slot added!');
  };

  const consultations = useMemo(() => {
    const map = {};
    timeSlots.forEach(slot => {
      const fee = Number(slot.fee);
      if (!map[slot.hospital]) {
        map[slot.hospital] = {
          hospital: slot.hospital,
          consultations: 0,
          totalFee: 0,
          doctorEarnings: 0,
          hospitalEarnings: 0
        };
      }
      map[slot.hospital].consultations++;
      map[slot.hospital].totalFee += fee;
      map[slot.hospital].doctorEarnings += fee * 0.6;
      map[slot.hospital].hospitalEarnings += fee * 0.4;
    });
    return Object.values(map);
  }, [timeSlots]);

  const totals = {
    totalConsultations: consultations.reduce((a, b) => a + b.consultations, 0),
    totalFee: consultations.reduce((a, b) => a + b.totalFee, 0),
    doctorEarnings: consultations.reduce((a, b) => a + b.doctorEarnings, 0),
    hospitalEarnings: consultations.reduce((a, b) => a + b.hospitalEarnings, 0),
  };

  const columns = [
    { title: 'Hospital', dataIndex: 'hospital' },
    { title: 'Consultations', dataIndex: 'consultations' },
    {
      title: 'Total Fee',
      dataIndex: 'totalFee',
      render: (val) => `₹${val.toFixed(2)}`
    },
    {
      title: 'Doctor Earnings (60%)',
      dataIndex: 'doctorEarnings',
      render: (val) => `₹${val.toFixed(2)}`
    },
    {
      title: 'Hospital Share (40%)',
      dataIndex: 'hospitalEarnings',
      render: (val) => `₹${val.toFixed(2)}`
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {contextHolder}
      <Title level={3}>Doctor Dashboard</Title>

      {!doctor && (
        <>
          <Title level={4}>Doctor Registration</Title>
          <Form layout="vertical" form={form} onFinish={handleRegister} style={{ maxWidth: 600 }}>
            <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="qualifications" label="Qualifications" rules={[{ required: true }]}>
              <Select placeholder="Select">
                <Option value="MBBS">MBBS</Option>
                <Option value="MD">MD</Option>
                <Option value="BDS">BDS</Option>
              </Select>
            </Form.Item>
            <Form.Item name="specializations" label="Specializations" rules={[{ required: true }]}>
              <Select mode="multiple">
                <Option value="Cardiology">Cardiology</Option>
                <Option value="Neurology">Neurology</Option>
                <Option value="Orthopedics">Orthopedics</Option>
                <Option value="Dermatology">Dermatology</Option>
                <Option value="Pediatrics">Pediatrics</Option>
              </Select>
            </Form.Item>
            <Form.Item name="experience" label="Experience (Years)" rules={[{ required: true }]}>
              <Input type="number" min={0} />
            </Form.Item>
            <Button type="primary" htmlType="submit">Register</Button>
          </Form>
        </>
      )}

      {doctor && (
        <>
          <Card style={{ marginBottom: 20 }}>
            <Title level={4}>Welcome Dr. {doctor.name}</Title>
            <p><strong>Qualification:</strong> {doctor.qualifications}</p>
            <p><strong>Experience:</strong> {doctor.experience} years</p>
            <p><strong>Specialization(s):</strong> {doctor.specializations.join(', ')}</p>
          </Card>

          <Divider />
          <Title level={4}>Associate with Hospitals</Title>
          {eligibleHospitals.map(hospital => (
            <Card key={hospital.id} style={{ marginBottom: 16 }}>
              <p><strong>{hospital.name}</strong></p>
              <p>Departments: {hospital.departments.join(', ')}</p>
              <Input
                placeholder="Consultation Fee (₹)"
                type="number"
                min={0}
                style={{ width: 160, marginRight: 10 }}
                onChange={(e) => handleFeeChange(hospital.id, e.target.value)}
              />
              <Button type="primary" onClick={() => handleAssociate(hospital.id)}>
                Associate
              </Button>
            </Card>
          ))}

          <Divider />
          <Title level={4}>Add Time Slots</Title>
          {associatedHospitals.map(h => (
            <Card key={h.id} title={h.name} style={{ marginBottom: 24 }}>
              <Form
                layout="inline"
                onFinish={v => handleTimeSlotAdd(h.id, v.date, v.time)}
              >
                <Form.Item name="date" rules={[{ required: true }]}>
                  <DatePicker />
                </Form.Item>
                <Form.Item name="time" rules={[{ required: true }]}>
                  <RangePicker format="HH:mm" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">Add Slot</Button>
                </Form.Item>
              </Form>

              <ul style={{ marginTop: 10 }}>
                {timeSlots
                  .filter(slot => slot.hospitalId === h.id)
                  .map((s, idx) => (
                    <li key={idx}>
                      {s.date} | {s.startTime.format('HH:mm')} - {s.endTime.format('HH:mm')} | ₹{s.fee}
                    </li>
                  ))}
              </ul>
            </Card>
          ))}

          {consultations.length > 0 && (
            <>
              <Divider />
              <Title level={4}>Earnings Summary</Title>
              <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}><Card><Statistic title="Total Consultations" value={totals.totalConsultations} /></Card></Col>
                <Col span={6}><Card><Statistic title="Total Fee" prefix="₹" value={totals.totalFee.toFixed(2)} /></Card></Col>
                <Col span={6}><Card><Statistic title="Doctor Earnings" prefix="₹" value={totals.doctorEarnings.toFixed(2)} /></Card></Col>
                <Col span={6}><Card><Statistic title="Hospital Share" prefix="₹" value={totals.hospitalEarnings.toFixed(2)} /></Card></Col>
              </Row>

              <Title level={5}>Earnings by Hospital</Title>
              <Table columns={columns} dataSource={consultations} pagination={false} bordered />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default DoctorDashboard;
