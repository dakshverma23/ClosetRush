import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout, Form, Input, Button, Typography, Divider, Alert, App } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined, CarOutlined } from '@ant-design/icons';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const LogisticsLoginPageInner = () => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', values);
      const user = response.data.user;

      // Only allow logistics partners through this page
      if (user.userType !== 'logistics_partner') {
        message.error('This login is only for logistics partners. Please use the regular login page.');
        return;
      }

      login(response.data.token, user);
      message.success('Login successful! Welcome back.');
      navigate('/logistics/dashboard');
    } catch (error) {
      const code = error.response?.data?.error?.code;
      if (code === 'PENDING_APPROVAL') {
        message.warning('Your account is pending admin approval. Please wait.');
      } else if (code === 'ACCOUNT_REJECTED') {
        message.error(error.response?.data?.error?.message || 'Your account was rejected.');
      } else {
        message.error(error.response?.data?.error?.message || 'Login failed. Check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <Navbar />
      <Content className="flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              <CarOutlined className="text-white text-3xl" />
            </div>
            <Title level={2} className="!text-3xl font-bold !text-white mb-2">
              Logistics Partner Login
            </Title>
            <Paragraph className="text-slate-400 text-base">
              Sign in to your ClosetRush logistics partner account
            </Paragraph>
          </div>

          {/* Info Banner */}
          <Alert
            message="Logistics Partner Portal"
            description="This login is exclusively for ClosetRush logistics partners. Your account must be approved by an admin before you can access the dashboard."
            type="success"
            showIcon
            className="mb-6 rounded-xl"
          />

          {/* Login Card */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
            <Form onFinish={onFinish} layout="vertical">
              <Form.Item
                name="email"
                rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}
              >
                <Input
                  prefix={<UserOutlined className="text-green-400" />}
                  placeholder="Enter your @closetrush.com email"
                  size="large"
                  className="rounded-xl h-12"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Please enter your password' }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-green-400" />}
                  placeholder="Enter your password"
                  size="large"
                  className="rounded-xl h-12"
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
                icon={<LoginOutlined />}
                className="h-12 text-base font-semibold rounded-xl mt-2"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}
              >
                Login as Logistics Partner
              </Button>
            </Form>

            <Divider className="!border-white/20 my-6">
              <span className="text-slate-400 text-sm font-medium">New here?</span>
            </Divider>

            <Link to="/logistics/register">
              <Button
                block
                size="large"
                className="h-12 font-semibold rounded-xl border-2 border-green-500/50 text-green-400 hover:border-green-400 hover:text-green-300 bg-transparent"
              >
                Register as Logistics Partner
              </Button>
            </Link>

            <div className="mt-6 text-center space-y-2">
              <div>
                <Link
                  to="/login"
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  ← Back to Regular Login
                </Link>
              </div>
            </div>
          </div>

          {/* Status Info */}
          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            {[
              { icon: '📝', label: 'Register' },
              { icon: '⏳', label: 'Await Approval' },
              { icon: '✅', label: 'Access Dashboard' },
            ].map((step, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="text-2xl mb-1">{step.icon}</div>
                <div className="text-xs text-slate-400 font-medium">{step.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Content>
    </Layout>
  );
};

const LogisticsLoginPage = () => (
  <App>
    <LogisticsLoginPageInner />
  </App>
);

export default LogisticsLoginPage;
