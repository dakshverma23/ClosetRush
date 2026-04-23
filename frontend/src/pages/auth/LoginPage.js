import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout, Form, Input, Button, Typography, message, Tabs, Divider } from 'antd';
import { UserOutlined, LockOutlined, MobileOutlined, GoogleOutlined, LoginOutlined } from '@ant-design/icons';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onEmailLogin = async (values) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', values);
      login(response.data.token, response.data.user);
      message.success('Login successful!');
      
      // Redirect based on user type
      if (response.data.user.userType === 'admin') {
        navigate('/admin/dashboard');
      } else if (response.data.user.userType === 'business') {
        navigate('/business/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      message.error(error.error?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const onMobileLogin = async (values) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login/mobile', values);
      login(response.data.token, response.data.user);
      message.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      message.error(error.error?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
  };

  const tabItems = [
    {
      key: 'email',
      label: (
        <span className="flex items-center gap-2 font-semibold">
          <UserOutlined />
          Email
        </span>
      ),
      children: (
        <Form onFinish={onEmailLogin} layout="vertical" className="space-y-4">
          <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Please enter valid email' }]}>
            <Input 
              prefix={<UserOutlined className="text-primary-400" />} 
              placeholder="Enter your email" 
              size="large" 
              className="input-modern"
            />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Please enter password' }]}>
            <Input.Password 
              prefix={<LockOutlined className="text-primary-400" />} 
              placeholder="Enter your password" 
              size="large" 
              className="input-modern"
            />
          </Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            block 
            size="large" 
            loading={loading}
            className="btn-modern-primary h-12 text-base font-semibold mt-6"
            icon={<LoginOutlined />}
          >
            Login with Email
          </Button>
        </Form>
      )
    },
    {
      key: 'mobile',
      label: (
        <span className="flex items-center gap-2 font-semibold">
          <MobileOutlined />
          Mobile
        </span>
      ),
      children: (
        <Form onFinish={onMobileLogin} layout="vertical" className="space-y-4">
          <Form.Item name="mobile" rules={[{ required: true, pattern: /^[0-9]{10}$/, message: 'Enter 10-digit mobile' }]}>
            <Input 
              prefix={<MobileOutlined className="text-primary-400" />} 
              placeholder="Enter 10-digit mobile number" 
              size="large" 
              className="input-modern"
            />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Please enter password' }]}>
            <Input.Password 
              prefix={<LockOutlined className="text-primary-400" />} 
              placeholder="Enter your password" 
              size="large" 
              className="input-modern"
            />
          </Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            block 
            size="large" 
            loading={loading}
            className="btn-modern-primary h-12 text-base font-semibold mt-6"
            icon={<LoginOutlined />}
          >
            Login with Mobile
          </Button>
        </Form>
      )
    }
  ];

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-bg-main to-bg-elevated">
      <Navbar />
      <Content className="flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Title level={2} className="!text-3xl font-bold text-gradient-primary mb-2">
              Welcome Back
            </Title>
            <Paragraph className="text-text-secondary text-lg">
              Sign in to your ClosetRush account
            </Paragraph>
          </div>

          {/* Login Card */}
          <div className="card-modern-glass p-8 backdrop-blur-sm">
            <Tabs 
              items={tabItems} 
              centered 
              className="modern-tabs"
              size="large"
            />
            
            <Divider className="my-6">
              <span className="text-text-muted font-medium">OR</span>
            </Divider>
            
            <Button 
              icon={<GoogleOutlined />} 
              onClick={handleGoogleLogin}
              block 
              size="large"
              className="border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 text-text-primary font-semibold rounded-modern h-12 transition-all duration-300 hover:transform hover:scale-105"
            >
              Continue with Google
            </Button>
            
            <div className="mt-8 text-center">
              <Paragraph className="text-text-secondary">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="text-gradient-primary font-semibold hover:underline transition-all duration-300"
                >
                  Sign up for free
                </Link>
              </Paragraph>
            </div>

            {/* Additional Links */}
            <div className="mt-6 text-center space-y-2">
              <div>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-text-muted hover:text-primary-500 transition-colors duration-300"
                >
                  Forgot your password?
                </Link>
              </div>
              <div>
                <Link 
                  to="/" 
                  className="text-sm text-text-muted hover:text-primary-500 transition-colors duration-300"
                >
                  ← Back to Home
                </Link>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 text-center">
            <div className="flex justify-center items-center gap-6 text-text-muted text-sm">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-accent-500 rounded-full"></div>
                <span>Secure Login</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-accent-500 rounded-full"></div>
                <span>Privacy Protected</span>
              </div>
            </div>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default LoginPage;
