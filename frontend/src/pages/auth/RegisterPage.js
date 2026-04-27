import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout, Form, Input, Button, Typography, message, Select, Divider } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, MobileOutlined, HomeOutlined, GoogleOutlined, UserAddOutlined, TeamOutlined } from '@ant-design/icons';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';

const { Content } = Layout;
const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', values);
      login(response.data.token, response.data.user);
      message.success('Registration successful! Welcome to ClosetRush!');
      navigate('/dashboard');
    } catch (error) {
      message.error(error.error?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
  };

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-bg-main to-bg-elevated">
      <Navbar />
      <Content className="flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <Title level={2} className="!text-3xl font-bold text-gradient-primary mb-2">
              Join ClosetRush
            </Title>
            <Paragraph className="text-text-secondary text-lg">
              Create your account and start enjoying fresh bedding
            </Paragraph>
          </div>

          {/* Registration Card */}
          <div className="card-modern-glass p-8 backdrop-blur-sm">
            <Form onFinish={onFinish} layout="vertical" className="space-y-4">
              <Form.Item name="name" rules={[{ required: true, message: 'Please enter your name' }]}>
                <Input 
                  prefix={<UserOutlined className="text-primary-400" />} 
                  placeholder="Enter your full name" 
                  size="large" 
                  className="input-modern"
                />
              </Form.Item>
              
              <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Please enter valid email' }]}>
                <Input 
                  prefix={<MailOutlined className="text-primary-400" />} 
                  placeholder="Enter your email address" 
                  size="large" 
                  className="input-modern"
                />
              </Form.Item>
              
              <Form.Item name="mobile" rules={[{ required: true, pattern: /^[0-9]{10}$/, message: 'Enter 10-digit mobile' }]}>
                <Input 
                  prefix={<MobileOutlined className="text-primary-400" />} 
                  placeholder="Enter 10-digit mobile number" 
                  size="large" 
                  className="input-modern"
                />
              </Form.Item>
              
              <Form.Item name="password" rules={[{ required: true, min: 8, message: 'Password must be at least 8 characters' }]}>
                <Input.Password 
                  prefix={<LockOutlined className="text-primary-400" />} 
                  placeholder="Create a strong password" 
                  size="large" 
                  className="input-modern"
                />
              </Form.Item>
              
              <Form.Item name="address" rules={[{ required: true, message: 'Please enter your address' }]}>
                <TextArea 
                  placeholder="Enter your complete address for delivery" 
                  rows={3} 
                  className="input-modern"
                />
              </Form.Item>
              
              <Form.Item name="userType" initialValue="individual" rules={[{ required: true }]}>
                <Select size="large" className="input-modern">
                  <Select.Option value="individual">
                    <div className="flex items-center gap-2">
                      <UserOutlined className="text-primary-500" />
                      <span>Individual User</span>
                    </div>
                  </Select.Option>
                  <Select.Option value="business">
                    <div className="flex items-center gap-2">
                      <TeamOutlined className="text-accent-500" />
                      <span>Business User</span>
                    </div>
                  </Select.Option>
                </Select>
              </Form.Item>
              
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                size="large" 
                loading={loading}
                className="btn-modern-primary h-12 text-base font-semibold mt-6"
                icon={<UserAddOutlined />}
              >
                Create Account
              </Button>
            </Form>
            
            <Divider className="my-6">
              <span className="text-text-muted font-medium">OR</span>
            </Divider>
            
            <Button 
              icon={<GoogleOutlined />} 
              onClick={handleGoogleSignup}
              block 
              size="large"
              className="border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 text-text-primary font-semibold rounded-modern h-12 transition-all duration-300 hover:transform hover:scale-105"
            >
              Sign up with Google
            </Button>
            
            <div className="mt-8 text-center">
              <Paragraph className="text-gray-700 text-base">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-primary-600 font-semibold hover:text-primary-700 hover:underline transition-all duration-300"
                >
                  Sign in here
                </Link>
              </Paragraph>
            </div>

            {/* Terms and Privacy */}
            <div className="mt-6 text-center">
              <Paragraph className="text-xs text-text-muted leading-relaxed">
                By creating an account, you agree to our{' '}
                <Link to="/terms" className="text-primary-500 hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-primary-500 hover:underline">Privacy Policy</Link>
              </Paragraph>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-gradient-card rounded-modern border border-white/20">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-text-inverse text-sm">✓</span>
              </div>
              <div className="text-sm font-medium text-text-primary">Fresh Bedding</div>
            </div>
            <div className="p-4 bg-gradient-card rounded-modern border border-white/20">
              <div className="w-8 h-8 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-text-inverse text-sm">✓</span>
              </div>
              <div className="text-sm font-medium text-text-primary">Free Delivery</div>
            </div>
            <div className="p-4 bg-gradient-card rounded-modern border border-white/20">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-text-inverse text-sm">✓</span>
              </div>
              <div className="text-sm font-medium text-text-primary">24/7 Support</div>
            </div>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default RegisterPage;
