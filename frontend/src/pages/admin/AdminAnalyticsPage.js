import React, { useState, useEffect } from 'react';
import {
  Layout, Card, Row, Col, Statistic, Spin, 
  Breadcrumb, Typography, Divider, Button, Drawer
} from 'antd';
import {
  ArrowLeftOutlined, HomeOutlined, RiseOutlined,
  UserOutlined, MenuOutlined, DashboardOutlined,
  AppstoreOutlined, CustomerServiceOutlined, TeamOutlined,
  LogoutOutlined, FileTextOutlined, DollarOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const { Content, Sider } = Layout;
const { Title } = Typography;

const AdminAnalyticsPage = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Data fetching
  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Fetch all required data
      const [analyticsRes, usersRes, quotesRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/users'),
        api.get('/quotes')
      ]);
      
      setAnalytics(analyticsRes.data);
      setUsers(usersRes.data.users || []);
      setQuotes(quotesRes.data.quotes || []);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Set default values if API fails
      setAnalytics({
        totalUsers: 0,
        activeSubscriptions: 0,
        totalRevenue: 0,
        monthlyGrowth: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Sidebar navigation menu
  const sidebarMenu = (
    <div className="flex flex-col h-full bg-gradient-surface">
      {/* User Profile Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow-primary">
            <UserOutlined className="text-white text-2xl" />
          </div>
          <div>
            <div className="font-bold text-lg text-text-primary">{user?.name}</div>
            <div className="text-sm text-text-secondary bg-primary-300 bg-opacity-20 px-3 py-1 rounded-full">
              {user?.userType?.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 py-6 px-2">
        <div
          className="mx-2 mb-2 px-4 py-3 hover:bg-primary-500 hover:bg-opacity-10 cursor-pointer flex items-center gap-3 text-text-secondary hover:text-primary-500 rounded-xl transition-all duration-300"
          onClick={() => navigate('/')}
        >
          <HomeOutlined className="text-xl" />
          <span className="font-medium">Home</span>
        </div>

        <div
          className="mx-2 mb-2 px-4 py-3 hover:bg-primary-500 hover:bg-opacity-10 cursor-pointer flex items-center gap-3 text-text-secondary hover:text-primary-500 rounded-xl transition-all duration-300"
          onClick={() => navigate('/admin/dashboard')}
        >
          <DashboardOutlined className="text-xl" />
          <span className="font-medium">Dashboard</span>
        </div>

        <div className="mx-2 mb-2 px-4 py-3 bg-gradient-primary cursor-pointer flex items-center gap-3 text-white rounded-xl shadow-modern">
          <RiseOutlined className="text-xl" />
          <span className="font-medium">Analytics</span>
        </div>

        <div
          className="mx-2 mb-2 px-4 py-3 hover:bg-primary-500 hover:bg-opacity-10 cursor-pointer flex items-center gap-3 text-text-secondary hover:text-primary-500 rounded-xl transition-all duration-300"
          onClick={() => navigate('/admin/categories')}
        >
          <AppstoreOutlined className="text-xl" />
          <span className="font-medium">Categories</span>
        </div>

        <div
          className="mx-2 mb-2 px-4 py-3 hover:bg-primary-500 hover:bg-opacity-10 cursor-pointer flex items-center gap-3 text-text-secondary hover:text-primary-500 rounded-xl transition-all duration-300"
          onClick={() => navigate('/admin/users')}
        >
          <TeamOutlined className="text-xl" />
          <span className="font-medium">Users</span>
          <span className="ml-auto text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {users.length}
          </span>
        </div>

        <div
          className="mx-2 mb-2 px-4 py-3 hover:bg-primary-500 hover:bg-opacity-10 cursor-pointer flex items-center gap-3 text-text-secondary hover:text-primary-500 rounded-xl transition-all duration-300"
          onClick={() => navigate('/admin/quotes')}
        >
          <FileTextOutlined className="text-xl" />
          <span className="font-medium">Quotes</span>
          <span className="ml-auto text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {quotes.length}
          </span>
        </div>

        <div
          className="mx-2 mb-2 px-4 py-3 hover:bg-primary-500 hover:bg-opacity-10 cursor-pointer flex items-center gap-3 text-text-secondary hover:text-primary-500 rounded-xl transition-all duration-300"
          onClick={() => navigate('/admin/support-tickets')}
        >
          <CustomerServiceOutlined className="text-xl" />
          <span className="font-medium">Support Tickets</span>
        </div>
      </div>

      {/* Logout */}
      <div className="border-t border-gray-100 p-2">
        <div
          className="mx-2 px-4 py-3 hover:bg-red-50 cursor-pointer flex items-center gap-3 text-red-500 hover:text-red-600 rounded-xl transition-all duration-300"
          onClick={logout}
        >
          <LogoutOutlined className="text-xl" />
          <span className="font-medium">Logout</span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Layout className="min-h-screen bg-bg-main">
        <Content className="p-4 md:p-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Spin size="large" />
              <div className="mt-4 text-text-secondary">Loading analytics data...</div>
            </div>
          </div>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen bg-bg-main">
      {/* Desktop Sidebar */}
      <Sider
        width={280}
        className="hidden lg:block bg-bg-surface border-r border-gray-100 shadow-modern"
        style={{ height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0 }}
      >
        {sidebarMenu}
      </Sider>

      {/* Mobile Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <MenuOutlined className="text-white text-sm" />
            </div>
            <span className="text-text-primary font-semibold">Menu</span>
          </div>
        }
        placement="left"
        onClose={() => setMobileDrawerVisible(false)}
        open={mobileDrawerVisible}
        width={280}
        bodyStyle={{ padding: 0 }}
      >
        {sidebarMenu}
      </Drawer>

      {/* Main Content */}
      <Layout style={{ marginLeft: window.innerWidth >= 1024 ? 280 : 0 }}>
        {/* Mobile Header */}
        <div className="lg:hidden bg-bg-surface border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-10 shadow-modern">
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setMobileDrawerVisible(true)}
            size="large"
            className="hover:bg-primary-500 hover:bg-opacity-10 hover:text-primary-500 rounded-xl"
          />
          <div className="font-bold text-xl text-text-primary">Analytics</div>
          <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow-primary">
            <UserOutlined className="text-white" />
          </div>
        </div>

        <Content className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <Breadcrumb className="mb-6">
                <Breadcrumb.Item>
                  <HomeOutlined className="text-primary-500" />
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                  <span className="text-text-secondary">Admin</span>
                </Breadcrumb.Item>
                <Breadcrumb.Item className="text-text-primary font-medium">Analytics</Breadcrumb.Item>
              </Breadcrumb>
              
              <div className="flex items-center justify-between">
                <div>
                  <Title level={2} className="mb-2 text-text-primary">
                    <span className="bg-gradient-primary bg-clip-text text-transparent">
                      Analytics Dashboard
                    </span>
                  </Title>
                  <p className="text-text-secondary text-lg">
                    Comprehensive overview of system performance and metrics
                  </p>
                </div>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate('/admin/dashboard')}
                  className="hidden md:flex items-center gap-2 px-6 py-3 h-auto bg-bg-elevated hover:bg-primary-500 hover:bg-opacity-10 border-gray-200 hover:border-primary-500 text-text-secondary hover:text-primary-500 rounded-xl transition-all duration-300"
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>

            {/* Main Analytics Cards */}
            <Row gutter={[24, 24]} className="mb-8">
              <Col xs={24} sm={12} lg={6}>
                <Card 
                  className="cursor-pointer hover:shadow-modern-lg transition-all duration-300 border-0 bg-gradient-card backdrop-blur-sm hover:scale-105"
                  onClick={() => navigate('/admin/users')}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-accent animate-float">
                      <UserOutlined className="text-white text-2xl" />
                    </div>
                    <div className="text-3xl font-bold text-accent-500 mb-2">
                      {analytics?.totalUsers || users.length || 0}
                    </div>
                    <div className="text-text-secondary font-medium">Total Users</div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card 
                  className="cursor-pointer hover:shadow-modern-lg transition-all duration-300 border-0 bg-gradient-card backdrop-blur-sm hover:scale-105"
                  onClick={() => navigate('/admin/dashboard')}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-primary animate-float">
                      <ShoppingOutlined className="text-white text-2xl" />
                    </div>
                    <div className="text-3xl font-bold text-primary-500 mb-2">
                      {analytics?.activeSubscriptions || 0}
                    </div>
                    <div className="text-text-secondary font-medium">Active Subscriptions</div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="hover:shadow-modern-lg transition-all duration-300 border-0 bg-gradient-card backdrop-blur-sm hover:scale-105">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float">
                      <DollarOutlined className="text-white text-2xl" />
                    </div>
                    <div className="text-3xl font-bold text-red-500 mb-2">
                      ₹{analytics?.totalRevenue || 0}
                    </div>
                    <div className="text-text-secondary font-medium">Total Revenue</div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="hover:shadow-modern-lg transition-all duration-300 border-0 bg-gradient-card backdrop-blur-sm hover:scale-105">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float">
                      <RiseOutlined className="text-white text-2xl" />
                    </div>
                    <div className="text-3xl font-bold text-purple-500 mb-2">
                      {analytics?.monthlyGrowth || 0}%
                    </div>
                    <div className="text-text-secondary font-medium">Monthly Growth</div>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Secondary Metrics */}
            <Row gutter={[24, 24]} className="mb-8">
              <Col xs={24} sm={12} lg={8}>
                <Card 
                  className="cursor-pointer hover:shadow-modern-lg transition-all duration-300 border-0 bg-gradient-card backdrop-blur-sm hover:scale-105"
                  onClick={() => navigate('/admin/quotes')}
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-3">
                      <FileTextOutlined className="text-white text-xl" />
                    </div>
                    <div className="text-3xl font-bold text-primary-500 mb-2">
                      {quotes.filter(q => q.type === 'connect').length}
                    </div>
                    <div className="text-text-secondary font-medium">Connection Requests</div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <Card 
                  className="cursor-pointer hover:shadow-modern-lg transition-all duration-300 border-0 bg-gradient-card backdrop-blur-sm hover:scale-105"
                  onClick={() => navigate('/admin/quotes')}
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center mx-auto mb-3">
                      <FileTextOutlined className="text-white text-xl" />
                    </div>
                    <div className="text-3xl font-bold text-accent-500 mb-2">
                      {quotes.filter(q => q.type !== 'connect').length}
                    </div>
                    <div className="text-text-secondary font-medium">Quotation Requests</div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <Card 
                  className="cursor-pointer hover:shadow-modern-lg transition-all duration-300 border-0 bg-gradient-card backdrop-blur-sm hover:scale-105"
                  onClick={() => navigate('/admin/quotes')}
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <FileTextOutlined className="text-white text-xl" />
                    </div>
                    <div className="text-3xl font-bold text-purple-500 mb-2">
                      {quotes.length}
                    </div>
                    <div className="text-text-secondary font-medium">Total Quotes</div>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* User Breakdown */}
            <Row gutter={[24, 24]} className="mb-8">
              <Col xs={24} lg={12}>
                <Card 
                  title={
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-accent rounded-lg flex items-center justify-center">
                        <UserOutlined className="text-white text-sm" />
                      </div>
                      <span className="text-text-primary font-semibold">User Distribution</span>
                    </div>
                  } 
                  className="h-full border-0 bg-gradient-card backdrop-blur-sm shadow-modern-lg"
                >
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <div className="text-center p-4 bg-gradient-to-br from-primary-300 to-primary-500 bg-opacity-10 rounded-xl border border-primary-300 border-opacity-20">
                        <div className="text-2xl font-bold text-primary-500 mb-1">
                          {users.filter(u => u.userType === 'individual').length}
                        </div>
                        <div className="text-text-secondary font-medium">Individual Users</div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="text-center p-4 bg-gradient-to-br from-accent-300 to-accent-500 bg-opacity-10 rounded-xl border border-accent-300 border-opacity-20">
                        <div className="text-2xl font-bold text-accent-500 mb-1">
                          {users.filter(u => u.userType === 'business').length}
                        </div>
                        <div className="text-text-secondary font-medium">Business Users</div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="text-center p-4 bg-gradient-to-br from-purple-300 to-purple-500 bg-opacity-10 rounded-xl border border-purple-300 border-opacity-20">
                        <div className="text-2xl font-bold text-purple-500 mb-1">
                          {users.filter(u => u.active).length}
                        </div>
                        <div className="text-text-secondary font-medium">Active Users</div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="text-center p-4 bg-gradient-to-br from-red-300 to-red-500 bg-opacity-10 rounded-xl border border-red-300 border-opacity-20">
                        <div className="text-2xl font-bold text-red-500 mb-1">
                          {users.filter(u => !u.active).length}
                        </div>
                        <div className="text-text-secondary font-medium">Inactive Users</div>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card 
                  title={
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                        <FileTextOutlined className="text-white text-sm" />
                      </div>
                      <span className="text-text-primary font-semibold">Quote Status Distribution</span>
                    </div>
                  } 
                  className="h-full border-0 bg-gradient-card backdrop-blur-sm shadow-modern-lg"
                >
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <div className="text-center p-4 bg-gradient-to-br from-orange-300 to-orange-500 bg-opacity-10 rounded-xl border border-orange-300 border-opacity-20">
                        <div className="text-2xl font-bold text-orange-500 mb-1">
                          {quotes.filter(q => q.status === 'pending').length}
                        </div>
                        <div className="text-text-secondary font-medium">Pending</div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="text-center p-4 bg-gradient-to-br from-primary-300 to-primary-500 bg-opacity-10 rounded-xl border border-primary-300 border-opacity-20">
                        <div className="text-2xl font-bold text-primary-500 mb-1">
                          {quotes.filter(q => q.status === 'contacted').length}
                        </div>
                        <div className="text-text-secondary font-medium">Contacted</div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="text-center p-4 bg-gradient-to-br from-accent-300 to-accent-500 bg-opacity-10 rounded-xl border border-accent-300 border-opacity-20">
                        <div className="text-2xl font-bold text-accent-500 mb-1">
                          {quotes.filter(q => q.status === 'accepted').length}
                        </div>
                        <div className="text-text-secondary font-medium">Accepted</div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="text-center p-4 bg-gradient-to-br from-red-300 to-red-500 bg-opacity-10 rounded-xl border border-red-300 border-opacity-20">
                        <div className="text-2xl font-bold text-red-500 mb-1">
                          {quotes.filter(q => q.status === 'rejected').length}
                        </div>
                        <div className="text-text-secondary font-medium">Rejected</div>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>

            {/* Quick Actions */}
            <Card 
              title={
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <RiseOutlined className="text-white text-sm" />
                  </div>
                  <span className="text-text-primary font-semibold">Quick Actions</span>
                </div>
              } 
              className="mb-6 border-0 bg-gradient-card backdrop-blur-sm shadow-modern-lg"
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Button 
                    type="primary" 
                    block 
                    size="large"
                    onClick={() => navigate('/admin/users')}
                    className="h-12 rounded-xl font-semibold bg-gradient-primary border-0 shadow-glow-primary hover:scale-105 transition-all duration-300"
                  >
                    Manage Users
                  </Button>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Button 
                    block 
                    size="large"
                    onClick={() => navigate('/admin/quotes')}
                    className="h-12 rounded-xl font-semibold bg-bg-elevated hover:bg-primary-500 hover:bg-opacity-10 border-gray-200 hover:border-primary-500 text-text-secondary hover:text-primary-500 transition-all duration-300"
                  >
                    View Quotes
                  </Button>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Button 
                    block 
                    size="large"
                    onClick={() => navigate('/admin/categories')}
                    className="h-12 rounded-xl font-semibold bg-bg-elevated hover:bg-accent-500 hover:bg-opacity-10 border-gray-200 hover:border-accent-500 text-text-secondary hover:text-accent-500 transition-all duration-300"
                  >
                    Manage Categories
                  </Button>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Button 
                    block 
                    size="large"
                    onClick={() => navigate('/admin/support-tickets')}
                    className="h-12 rounded-xl font-semibold bg-bg-elevated hover:bg-purple-500 hover:bg-opacity-10 border-gray-200 hover:border-purple-500 text-text-secondary hover:text-purple-500 transition-all duration-300"
                  >
                    Support Tickets
                  </Button>
                </Col>
              </Row>
            </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminAnalyticsPage;