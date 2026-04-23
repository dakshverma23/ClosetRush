import React, { useState, useEffect } from 'react';
import {
  Layout, Card, Row, Col, Button, message, Modal, Spin, 
  Breadcrumb, Typography, Divider, Drawer
} from 'antd';
import {
  ArrowLeftOutlined, HomeOutlined, FileTextOutlined,
  UserOutlined, MenuOutlined, DashboardOutlined,
  AppstoreOutlined, CustomerServiceOutlined, TeamOutlined,
  LogoutOutlined, RiseOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ConnectionDetailsSection from '../../components/admin/ConnectionDetailsSection';
import QuotationDetailsSection from '../../components/admin/QuotationDetailsSection';
import QuoteDetailModal from '../../components/admin/QuoteDetailModal';
import api from '../../services/api';

const { Content, Sider } = Layout;
const { Title } = Typography;

const AdminQuotesPage = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [isQuoteDetailModalVisible, setIsQuoteDetailModalVisible] = useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Data fetching
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all required data
      const [quotesRes, analyticsRes, usersRes] = await Promise.all([
        api.get('/quotes'),
        api.get('/analytics/overview'),
        api.get('/users')
      ]);
      
      setQuotes(quotesRes.data.quotes || []);
      setAnalytics(analyticsRes.data);
      setUsers(usersRes.data.users || []);
    } catch (error) {
      message.error('Failed to load dashboard data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Quote filtering utility functions
  const filterQuotesByType = (type) => {
    if (type === 'connect') {
      return quotes.filter(quote => quote.type === 'connect');
    } else if (type === 'quotation') {
      return quotes.filter(quote => quote.type !== 'connect');
    }
    return quotes;
  };

  // Event handlers
  const handleViewQuoteDetails = (quote) => {
    setSelectedQuote(quote);
    setIsQuoteDetailModalVisible(true);
  };

  const handleUpdateQuoteStatus = async (quoteId, status) => {
    try {
      await api.patch(`/quotes/${quoteId}/status`, { status });
      message.success('Quote status updated');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      message.error('Failed to update quote status');
      console.error('Error updating quote status:', error);
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

        <div
          className="mx-2 mb-2 px-4 py-3 hover:bg-primary-500 hover:bg-opacity-10 cursor-pointer flex items-center gap-3 text-text-secondary hover:text-primary-500 rounded-xl transition-all duration-300"
          onClick={() => navigate('/admin/analytics')}
        >
          <RiseOutlined className="text-xl" />
          <span className="font-medium">Analytics</span>
        </div>

        <div className="mx-2 mb-2 px-4 py-3 bg-gradient-primary cursor-pointer flex items-center gap-3 text-white rounded-xl shadow-modern">
          <FileTextOutlined className="text-xl" />
          <span className="font-medium">Quotes</span>
          <span className="ml-auto text-xs bg-white bg-opacity-20 text-white px-2 py-1 rounded-full">
            {quotes.length}
          </span>
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
              <div className="mt-4 text-text-secondary">Loading dashboard data...</div>
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
        className="modern-drawer"
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
          <div className="font-bold text-xl text-text-primary">Quotes Management</div>
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
                <Breadcrumb.Item className="text-text-primary font-medium">
                  Quotes Management
                </Breadcrumb.Item>
              </Breadcrumb>
              
              <div className="flex items-center justify-between">
                <div>
                  <Title level={2} className="mb-2 text-text-primary">
                    <span className="bg-gradient-primary bg-clip-text text-transparent">
                      Quotes Management
                    </span>
                  </Title>
                  <p className="text-text-secondary text-lg">
                    Manage connection requests and quotation submissions from customers
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

            {/* Stats Overview */}
            <Row gutter={[24, 24]} className="mb-8">
              <Col xs={24} sm={6}>
                <Card 
                  className="cursor-pointer hover:shadow-modern-lg transition-all duration-300 border-0 bg-gradient-card backdrop-blur-sm hover:scale-105"
                  onClick={() => navigate('/admin/users')}
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center mx-auto mb-3 shadow-glow-accent">
                      <UserOutlined className="text-white text-xl" />
                    </div>
                    <div className="text-2xl font-bold text-accent-500 mb-1">
                      {analytics?.totalUsers || users.length || 0}
                    </div>
                    <div className="text-text-secondary font-medium">Total Users</div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card 
                  className="cursor-pointer hover:shadow-modern-lg transition-all duration-300 border-0 bg-gradient-card backdrop-blur-sm hover:scale-105"
                  onClick={() => navigate('/admin/dashboard')}
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-3 shadow-glow-primary">
                      <DashboardOutlined className="text-white text-xl" />
                    </div>
                    <div className="text-2xl font-bold text-primary-500 mb-1">
                      {analytics?.activeSubscriptions || 0}
                    </div>
                    <div className="text-text-secondary font-medium">Active Subscriptions</div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card 
                  className="cursor-pointer hover:shadow-modern-lg transition-all duration-300 border-0 bg-gradient-card backdrop-blur-sm hover:scale-105"
                  onClick={() => navigate('/admin/analytics')}
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <RiseOutlined className="text-white text-xl" />
                    </div>
                    <div className="text-2xl font-bold text-red-500 mb-1">
                      ₹{analytics?.totalRevenue?.toLocaleString() || 0}
                    </div>
                    <div className="text-text-secondary font-medium">Total Revenue</div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card 
                  className="cursor-pointer hover:shadow-modern-lg transition-all duration-300 border-0 bg-gradient-card backdrop-blur-sm hover:scale-105"
                  onClick={() => navigate('/admin/analytics')}
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <RiseOutlined className="text-white text-xl" />
                    </div>
                    <div className="text-2xl font-bold text-purple-500 mb-1">
                      {analytics?.monthlyGrowth || 0}%
                    </div>
                    <div className="text-text-secondary font-medium">Monthly Growth</div>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Quote-specific Stats */}
            <Row gutter={[24, 24]} className="mb-8">
              <Col xs={24} sm={8}>
                <Card className="border-0 bg-gradient-card backdrop-blur-sm shadow-modern hover:shadow-modern-lg transition-all duration-300">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-3">
                      <FileTextOutlined className="text-white text-lg" />
                    </div>
                    <div className="text-3xl font-bold text-primary-500 mb-2">
                      {filterQuotesByType('connect').length}
                    </div>
                    <div className="text-text-secondary font-medium">Connection Requests</div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card className="border-0 bg-gradient-card backdrop-blur-sm shadow-modern hover:shadow-modern-lg transition-all duration-300">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-gradient-accent rounded-lg flex items-center justify-center mx-auto mb-3">
                      <FileTextOutlined className="text-white text-lg" />
                    </div>
                    <div className="text-3xl font-bold text-accent-500 mb-2">
                      {filterQuotesByType('quotation').length}
                    </div>
                    <div className="text-text-secondary font-medium">Quotation Requests</div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card className="border-0 bg-gradient-card backdrop-blur-sm shadow-modern hover:shadow-modern-lg transition-all duration-300">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <FileTextOutlined className="text-white text-lg" />
                    </div>
                    <div className="text-3xl font-bold text-purple-500 mb-2">
                      {quotes.length}
                    </div>
                    <div className="text-text-secondary font-medium">Total Quotes</div>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Main Content Sections */}
            <div className="space-y-8">
              {/* Connection Details Section */}
              <Card className="shadow-modern-lg border-0 bg-gradient-card backdrop-blur-sm rounded-modern-lg overflow-hidden">
                <ConnectionDetailsSection
                  quotes={quotes}
                  onViewDetails={handleViewQuoteDetails}
                  onUpdateStatus={handleUpdateQuoteStatus}
                  loading={loading}
                />
              </Card>

              {/* Quotation Details Section */}
              <Card className="shadow-modern-lg border-0 bg-gradient-card backdrop-blur-sm rounded-modern-lg overflow-hidden">
                <QuotationDetailsSection
                  quotes={quotes}
                  onViewDetails={handleViewQuoteDetails}
                  onUpdateStatus={handleUpdateQuoteStatus}
                  loading={loading}
                />
              </Card>
            </div>
          </div>
        </Content>
      </Layout>

      {/* Quote Detail Modal */}
      <QuoteDetailModal
        quote={selectedQuote}
        visible={isQuoteDetailModalVisible}
        onClose={() => setIsQuoteDetailModalVisible(false)}
        onUpdateStatus={handleUpdateQuoteStatus}
      />
    </Layout>
  );
};

export default AdminQuotesPage;