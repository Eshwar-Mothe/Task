import React, { useState } from 'react';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Typography,
  Tag,
  message,
  Select
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom'; // ✅ Import Link here

const { Title } = Typography;
const { Option } = Select;

const DoctorSignup = () => {
  const [form] = Form.useForm();
  const [inputValue, setInputValue] = useState('');
  const [tags, setTags] = useState([]);
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();


  const handleTagInput = (e) => setInputValue(e.target.value);
  const handleTagAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setInputValue('');
  };

  const handleRemoveTag = (removedTag) => {
    setTags(tags.filter(tag => tag !== removedTag));
  };

  const onFinish = (values) => {
    if (tags.length === 0) {
      messageApi.error('Please enter at least one specialization.');
      return;
    }

    const newDoctor = {
      ...values,
      specializations: tags
    };

    const existingDoctors = JSON.parse(localStorage.getItem('doctors') || '[]');
    const doctorExists = existingDoctors.some(doc => doc.username === values.username);

    if (doctorExists) {
      messageApi.error('Username already taken. Try a different one.');
      return;
    }

    const updatedDoctors = [...existingDoctors, newDoctor];
    localStorage.setItem('doctors', JSON.stringify(updatedDoctors));
    messageApi.success('Doctor registered successfully!');
    form.resetFields();
    setTags([]);
    navigate('/doctor/signin');
  };

  const onFinishFailed = (errorInfo) => {
    messageApi.error('Please complete all required fields.');
  };

  const onSpecializationKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTagAdd();
    }
  };

  return (
    <div style={{ padding: 24 }}>
      {contextHolder}
      <Title level={3}>Doctor Signup</Title>

      <Form
        form={form}
        name="doctorSignupForm"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        {/* Name */}
        <Form.Item
          label="Name"
          name="username"
          rules={[{ required: true, message: 'Please enter your name!' }]}
        >
          <Input placeholder="Enter your full name" />
        </Form.Item>

        {/* Qualification */}
        <Form.Item
          label="Qualification"
          name="qualification"
          rules={[{ required: true, message: 'Please select your qualification!' }]}
        >
          <Select placeholder="Select Qualification">
            <Option value="mbbs">MBBS</Option>
            <Option value="bds">BDS</Option>
            <Option value="bams">BAMS</Option>
            <Option value="bhms">BHMS</Option>
            <Option value="bpt">BPT</Option>
            <Option value="md">MD</Option>
            <Option value="ms">MS</Option>
          </Select>
        </Form.Item>

        {/* Experience */}
        <Form.Item
          label="Experience (Years)"
          name="experience"
          rules={[{ required: true, message: 'Please provide your experience!' }]}
        >
          <InputNumber min={0} max={50} style={{ width: '100%' }} />
        </Form.Item>

        {/* Password */}
        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please enter your password!' }]}
        >
          <Input.Password placeholder="Choose a password" />
        </Form.Item>

        {/* Specializations */}
        <Form.Item label="Specializations" required>
          <Input
            placeholder="Type specialization and press Enter"
            value={inputValue}
            onChange={handleTagInput}
            onKeyDown={onSpecializationKeyDown}
            suffix={<PlusOutlined onClick={handleTagAdd} style={{ cursor: 'pointer' }} />}
          />
          <div style={{ marginTop: 8 }}>
            {tags.map(tag => (
              <Tag
                key={tag}
                closable
                onClose={() => handleRemoveTag(tag)}
              >
                {tag}
              </Tag>
            ))}
          </div>
        </Form.Item>

        {/* Submit */}
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit">
            Signup
          </Button>
        </Form.Item>

        {/* ✅ Signin link */}
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <span>Already have an account? </span>
          <Link to="/doctor/signin">Sign in here</Link>
        </Form.Item>
      </Form>
    </div>
  );
};

export default DoctorSignup;
