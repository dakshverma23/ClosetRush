import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout, Form, Input, Button, Typography, message as staticMessage, Divider, Alert, Steps, App } from 'antd';
import {
  UserOutlined, MailOutlined, LockOutlined, MobileOutlined,
  UserAddOutlined, HomeOutlined, CheckCircleOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import api from '../../services/api';
import Navbar from '../../components/layout/Navbar';

const { Content } = Layout;
const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const WarehouseRegisterPageInner = () => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    // Validate email domain
    if (!values.email.endsWith('@closetrush.com')) {
      message.error('Warehouse managers must register with a @closetrush.com email address.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        ...values,
        userType: 'warehouse_manager'
      });

      setRegistered(true);
      message.success('Registration submitted! Awaiting admin approval.');
    } catch (error) {
      const msg = error.response?.data?.error?.message || error.response?.data?.message || 'Registration failed';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Success screen after registration
  if (registered) {
    return (
      <Layout className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <Navbar />
        <Content className="flex items-center justify-center p-4 py-12">
          <div className="w-full max-w-md text-center">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-10">
              <div className="w-20 h-20 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center mx-auto mb-6">
                <ClockCircleOutlined className="text-blue-400 text-4xl" />
              </div>
              <Title level={2} className="!text-white !mb-3">Registration Submitted!</Title>
              <Paragraph className="text-slate-300 text-base mb-8">
                Your warehouse manager account has been created and is now <strong className="text-blue-400">pending admin approval</strong>.
                You'll be able to login once an admin reviews and approves your account.
              </Paragraph>

              <Steps
                direction="vertical"
                size="small"
                className="text-left mb-8"
                items={[
                  {
                    title: <span className="text-white font-semibold">Registration Complete</span>,
                    description: <span className="text-slate-400">Your account has been created</span>,
                    status: 'finish',
                    icon: <CheckCircleOutlined className="text-green-400" />
                  },
                  {
                    title: <span className="text-blue-400 font-semibold">Awaiting Admin Approval</span>,
                    description: <span className="text-slate-400">Admin will review your profile</span>,
                    status: 'process',
                    icon: <ClockCircleOutlined className="text-blue-400" />
                  },
                  {
                    title: <span className="text-slate-400 font-semibold">Access Dashboard</span>,
                    description: <span className="text-slate-500">Login and start managing orders</span>,
                    status: 'wait',
                  }
                ]}
              />

              <Button
                block
                size="large"
                onClick={() => navigate('/warehouse/login')}
                className="h-12 font-semibold rounded-xl border-2 border-blue-500 text-blue-400 hover:bg-blue-500/10 bg-transparent"
              >
                Go to Warehouse Login
              </Button>
            </div>
          </div>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <Navbar />
      <Content className="flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-lg">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}
            >
              <HomeOutlined className="text-white text-3xl" />
            </div>
            <Title level={2} className="!text-3xl font-bold !text-white mb-2">
              Join as Warehouse Manager
            </Title>
            <Paragraph className="text-slate-400 text-base">
              Register your ClosetRush warehouse manager account
            </Paragraph>
          </div>

          {/* Email Requirement Banner */}
          <Alert
            message={<span className="font-semibold">Email Requirement</span>}
            description={
              <span>
                You must register with a <strong>@closetrush.com</strong> email address.
                Your account will be reviewed and approved by an admin before you can access the dashboard.
              </span>
            }
            type="info"
            showIcon
            className="mb-6 rounded-xl"
          />

          {/* Registration Card */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
            <Form onFinish={onFinish} layout="vertical">

              <Form.Item
                name="name"
                rules={[{ required: true, message: 'Please enter your full name' }]}
              >
                <Input
                  prefix={<UserOutlined className="text-blue-400" />}
                  placeholder="Enter your full name"
                  size="large"
                  className="rounded-xl h-12"
                />
              </Form.Item>

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Email is required' },
                  { type: 'email', message: 'Enter a valid email' },
                  {
                    validator: (_, value) => {
                      if (!value || value.endsWith('@closetrush.com')) {
                        return Promise.resolve();
                      }
                      return Promise.reject('Must use a @closetrush.com email address');
                    }
                  }
                ]}
              >
                <Input
                  prefix={<MailOutlined className="text-blue-400" />}
                  placeholder="yourname@closetrush.com"
                  size="large"
                  className="rounded-xl h-12"
                />
              </Form.Item>

              <Form.Item
                name="mobile"
                rules={[
                  { required: true, message: 'Mobile number is required' },
                  { pattern: /^[0-9]{10}$/, message: 'Enter a valid 10-digit mobile number' }
                ]}
              >
                <Input
                  prefix={<MobileOutlined className="text-blue-400" />}
                  placeholder="Enter 10-digit mobile number"
                  size="large"
                  className="rounded-xl h-12"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: 'Password is required' },
                  { min: 8, message: 'Password must be at least 8 characters' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-blue-400" />}
                  placeholder="Create a strong password (min 8 chars)"
                  size="large"
                  className="rounded-xl h-12"
                />
              </Form.Item>

              <Form.Item
                name="address"
                rules={[{ required: true, message: 'Please enter your address' }]}
              >
                <TextArea
                  placeholder="Enter your complete address"
                  rows={3}
                  className="rounded-xl"
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
                icon={<UserAddOutlined />}
                className="h-12 text-base font-semibold rounded-xl mt-2"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none' }}
              >
                Register as Warehouse Manager
              </Button>
            </Form>

            <Divider className="!border-white/20 my-6">
              <span className="text-slate-400 text-sm font-medium">Already registered?</span>
            </Divider>

            <Link to="/warehouse/login">
              <Button
                block
                size="large"
                className="h-12 font-semibold rounded-xl border-2 border-blue-500/50 text-blue-400 hover:border-blue-400 hover:text-blue-300 bg-transparent"
              >
                Login as Warehouse Manager
              </Button>
            </Link>

            <div className="mt-6 text-center">
              <Link
                to="/register"
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                ← Back to Regular Registration
              </Link>
            </div>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

const WarehouseRegisterPage = () => (
  <App>
    <WarehouseRegisterPageInner />
  </App>
);

export default WarehouseRegisterPage;
