import React, { useState, useEffect } from 'react';
import { Layout, Card, Row, Col, Statistic, Table, Tag, Button, Modal, Spin } from 'antd';
import appMessage from '../../utils/message';
import { DollarOutlined, ShoppingOutlined, InboxOutlined, PlusOutlined, UserOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import BackButton from '../../components/layout/BackButton';
import api from '../../services/api';

const { Content } = Layout;

const STATUS_LABELS = {
  pending:                'Preparing Your Order',
  assigned_to_warehouse:  'Warehouse Assigned',
  packed:                 'Packed & Ready',
  ready_for_pickup:       'Ready for Pickup',
  assigned_to_logistics:  'Delivery Partner Assigned',
  out_for_delivery:       'Out for Delivery',
  under_review:           'Delivery Under Review',
  delivered:              'Delivered'
};

const STATUS_COLORS = {
  pending:                'default',
  assigned_to_warehouse:  'blue',
  packed:                 'cyan',
  ready_for_pickup:       'geekblue',
  assigned_to_logistics:  'purple',
  out_for_delivery:       'orange',
  under_review:           'gold',
  delivered:              'green'
};

const shortId = (id) => (id ? String(id).slice(-8) : '—');

const IndividualDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const [deposit, setDeposit] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState({
    activeSubscriptions: 0,
    totalDeposit: 0,
    itemsHolding: 0
  });
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    fetchOrders();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch subscriptions
      const subsResponse = await api.get('/subscriptions');
      setSubscriptions(subsResponse.data.subscriptions || []);

      // Fetch deposit
      const depositResponse = await api.get('/deposits/me');
      setDeposit(depositResponse.data.deposit);

      // Fetch inventory
      const inventoryResponse = await api.get('/inventory/me');
      setInventory(inventoryResponse.data.inventory || []);

      // Calculate stats
      const activeCount = subsResponse.data.subscriptions?.filter(s => s.status === 'active').length || 0;
      const totalDeposit = depositResponse.data.deposit?.amount || 0;
      const itemsCount = inventoryResponse.data.inventory?.length || 0;

      setStats({
        activeSubscriptions: activeCount,
        totalDeposit,
        itemsHolding: itemsCount
      });
    } catch (error) {
      appMessage.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await api.get('/orders');
      setOrders(response.data.orders || []);
    } catch (error) {
      appMessage.error('Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  const handlePauseSubscription = async (id) => {
    try {
      await api.patch(`/subscriptions/${id}/pause`);
      appMessage.success('Subscription paused successfully');
      fetchDashboardData();
    } catch (error) {
      appMessage.error(error.error?.message || 'Failed to pause subscription');
    }
  };

  const handleResumeSubscription = async (id) => {
    try {
      await api.patch(`/subscriptions/${id}/resume`);
      appMessage.success('Subscription resumed successfully');
      fetchDashboardData();
    } catch (error) {
      appMessage.error(error.error?.message || 'Failed to resume subscription');
    }
  };

  const handleCancelSubscription = (id) => {
    Modal.confirm({
      title: 'Cancel Subscription',
      content: 'Are you sure you want to cancel this subscription? This action cannot be undone.',
      okText: 'Yes, Cancel',
      okType: 'danger',
      onOk: async () => {
        try {
          await api.delete(`/subscriptions/${id}`);
          appMessage.success('Subscription cancelled successfully');
          fetchDashboardData();
        } catch (error) {
          appMessage.error(error.error?.message || 'Failed to cancel subscription');
        }
      }
    });
  };

  const subscriptionColumns = [
    {
      title: 'Bundle',
      dataIndex: ['bundle', 'name'],
      key: 'bundle',
      render: (text) => (
        <span className="font-medium text-text-primary">{text || 'N/A'}</span>
      )
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => (
        <span className="text-text-secondary">{duration ? `${duration} months` : 'N/A'}</span>
      )
    },
    {
      title: 'Price',
      dataIndex: 'totalPrice',
      key: 'price',
      render: (price) => (
        <span className="font-semibold text-primary-500">{price ? `₹${price}` : 'N/A'}</span>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          active: 'bg-gradient-accent text-white',
          paused: 'bg-gradient-to-r from-orange-400 to-orange-500 text-white',
          cancelled: 'bg-gradient-to-r from-red-400 to-red-500 text-white',
          expired: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
        };
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-200 text-gray-700'}`}>
            {status ? status.toUpperCase() : 'N/A'}
          </span>
        );
      }
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => (
        <span className="text-text-secondary">{date ? new Date(date).toLocaleDateString() : 'N/A'}</span>
      )
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date) => (
        <span className="text-text-secondary">{date ? new Date(date).toLocaleDateString() : 'N/A'}</span>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex gap-2">
          {record.status === 'active' && (
            <Button 
              size="small" 
              onClick={() => handlePauseSubscription(record._id)}
              className="bg-bg-elevated hover:bg-orange-500 hover:bg-opacity-10 border-gray-200 hover:border-orange-500 text-text-secondary hover:text-orange-500 rounded-lg transition-all duration-300"
            >
              Pause
            </Button>
          )}
          {record.status === 'paused' && (
            <Button 
              size="small" 
              type="primary" 
              onClick={() => handleResumeSubscription(record._id)}
              className="bg-gradient-accent border-0 shadow-glow-accent hover:scale-105 transition-all duration-300 rounded-lg"
            >
              Resume
            </Button>
          )}
          {(record.status === 'active' || record.status === 'paused') && (
            <Button 
              size="small" 
              danger 
              onClick={() => handleCancelSubscription(record._id)}
              className="bg-red-50 hover:bg-red-500 hover:bg-opacity-10 border-red-200 hover:border-red-500 text-red-500 hover:text-red-600 rounded-lg transition-all duration-300"
            >
              Cancel
            </Button>
          )}
        </div>
      )
    }
  ];

  const inventoryColumns = [
    {
      title: 'Category',
      dataIndex: ['category', 'name'],
      key: 'category',
      render: (text) => (
        <span className="font-medium text-text-primary">{text || 'N/A'}</span>
      )
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity) => (
        <span className="font-semibold text-primary-500">{quantity}</span>
      )
    },
    {
      title: 'Assigned Date',
      dataIndex: 'assignedDate',
      key: 'assignedDate',
      render: (date) => (
        <span className="text-text-secondary">{new Date(date).toLocaleDateString()}</span>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          status === 'assigned' 
            ? 'bg-gradient-primary text-white' 
            : 'bg-gradient-accent text-white'
        }`}>
          {status ? status.toUpperCase() : 'N/A'}
        </span>
      )
    }
  ];

  if (loading) {
    return (
      <Layout className="min-h-screen bg-bg-main">
        <Navbar />
        <Content className="p-4 md:p-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Spin size="large" />
              <div className="mt-4 text-text-secondary">Loading your dashboard...</div>
            </div>
          </div>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen bg-bg-main">
      <Navbar />
      <Content className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <BackButton />
          </div>
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  My Dashboard
                </span>
              </h1>
              <p className="text-text-secondary text-lg">
                Manage your subscriptions and track your inventory
              </p>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => navigate('/subscriptions')}
              className="bg-gradient-primary border-0 shadow-glow-primary hover:scale-105 transition-all duration-300 rounded-xl font-semibold px-8 py-3 h-auto"
            >
              Start New Subscription
            </Button>
          </div>

          {/* Stats Cards */}
          <Row gutter={[24, 24]} className="mb-8">
            <Col xs={24} sm={8}>
              <Card className="border-0 bg-gradient-card backdrop-blur-sm shadow-modern hover:shadow-modern-lg transition-all duration-300 hover:scale-105">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-accent animate-float">
                    <ShoppingOutlined className="text-white text-2xl" />
                  </div>
                  <div className="text-3xl font-bold text-accent-500 mb-2">
                    {stats.activeSubscriptions}
                  </div>
                  <div className="text-text-secondary font-medium">Active Subscriptions</div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="border-0 bg-gradient-card backdrop-blur-sm shadow-modern hover:shadow-modern-lg transition-all duration-300 hover:scale-105">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-primary animate-float">
                    <DollarOutlined className="text-white text-2xl" />
                  </div>
                  <div className="text-3xl font-bold text-primary-500 mb-2">
                    ₹{stats.totalDeposit}
                  </div>
                  <div className="text-text-secondary font-medium">Total Deposit</div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="border-0 bg-gradient-card backdrop-blur-sm shadow-modern hover:shadow-modern-lg transition-all duration-300 hover:scale-105">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float">
                    <InboxOutlined className="text-white text-2xl" />
                  </div>
                  <div className="text-3xl font-bold text-purple-500 mb-2">
                    {stats.itemsHolding}
                  </div>
                  <div className="text-text-secondary font-medium">Items Holding</div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Deposit Details */}
          {deposit && (
            <Card 
              title={
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <DollarOutlined className="text-white text-sm" />
                  </div>
                  <span className="text-text-primary font-semibold">Deposit Details</span>
                </div>
              } 
              className="mb-8 border-0 bg-gradient-card backdrop-blur-sm shadow-modern-lg"
            >
              <Row gutter={[24, 24]} className="mb-6">
                <Col xs={24} sm={8}>
                  <div className="text-center p-6 bg-gradient-to-br from-primary-300 to-primary-500 bg-opacity-10 rounded-xl border border-primary-300 border-opacity-20">
                    <p className="text-text-secondary font-medium mb-2">Total Deposit</p>
                    <p className="text-3xl font-bold text-primary-500">₹{deposit.amount}</p>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div className="text-center p-6 bg-gradient-to-br from-red-300 to-red-500 bg-opacity-10 rounded-xl border border-red-300 border-opacity-20">
                    <p className="text-text-secondary font-medium mb-2">Deductions</p>
                    <p className="text-3xl font-bold text-red-500">₹{deposit.deductions || 0}</p>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div className="text-center p-6 bg-gradient-to-br from-accent-300 to-accent-500 bg-opacity-10 rounded-xl border border-accent-300 border-opacity-20">
                    <p className="text-text-secondary font-medium mb-2">Current Balance</p>
                    <p className="text-3xl font-bold text-accent-500">
                      ₹{deposit.amount - (deposit.deductions || 0)}
                    </p>
                  </div>
                </Col>
              </Row>
              {deposit.deductionHistory && deposit.deductionHistory.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-4 text-text-primary flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-accent rounded-lg flex items-center justify-center">
                      <HomeOutlined className="text-white text-xs" />
                    </div>
                    Deduction History
                  </h4>
                  <div className="space-y-3">
                    {deposit.deductionHistory.map((deduction, index) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-bg-elevated rounded-xl border border-gray-100">
                        <div>
                          <p className="font-medium text-text-primary">{deduction.reason}</p>
                          <p className="text-sm text-text-secondary">
                            {new Date(deduction.date).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-red-500 font-bold text-lg">-₹{deduction.amount}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Subscriptions */}
          <Card 
            title={
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-accent rounded-lg flex items-center justify-center">
                  <ShoppingOutlined className="text-white text-sm" />
                </div>
                <span className="text-text-primary font-semibold">My Subscriptions</span>
              </div>
            } 
            className="mb-8 border-0 bg-gradient-card backdrop-blur-sm shadow-modern-lg"
          >
            <Table
              columns={subscriptionColumns}
              dataSource={subscriptions}
              rowKey="_id"
              pagination={{ pageSize: 5 }}
              scroll={{ x: 800 }}
              className="modern-table"
            />
          </Card>

          {/* My Orders */}
          <Card className="card-modern-glass mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-text-primary">My Orders</h2>
              <Button onClick={fetchOrders} loading={ordersLoading}>Refresh</Button>
            </div>
            <Table
              columns={[
                {
                  title: 'Order ID',
                  key: 'orderId',
                  render: (_, o) => <Tag color="blue" className="font-mono">{shortId(o._id)}</Tag>
                },
                {
                  title: 'Bundle Types',
                  key: 'bundles',
                  render: (_, o) => (o.orderedBundles || []).map(b => b.bundleName).join(', ') || '—'
                },
                {
                  title: 'Status',
                  key: 'status',
                  render: (_, o) => (
                    <Tag color={STATUS_COLORS[o.status] || 'default'}>
                      {STATUS_LABELS[o.status] || o.status}
                    </Tag>
                  )
                },
                {
                  title: 'Bundle IDs',
                  key: 'bundleIds',
                  render: (_, o) => {
                    if (!['out_for_delivery', 'under_review', 'delivered'].includes(o.status)) {
                      return <span className="text-gray-400">—</span>;
                    }
                    const ids = (o.builtBundles || []).map(b => b.bundleId).filter(Boolean);
                    return ids.length > 0
                      ? <div className="text-xs font-mono">{ids.join(', ')}</div>
                      : <span className="text-gray-400">—</span>;
                  }
                },
                {
                  title: 'Created At',
                  key: 'createdAt',
                  render: (_, o) => o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'
                }
              ]}
              dataSource={orders}
              rowKey="_id"
              loading={ordersLoading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 800 }}
              locale={{ emptyText: 'No orders yet' }}
            />
          </Card>

          {/* Inventory */}
          <Card 
            title={
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                  <InboxOutlined className="text-white text-sm" />
                </div>
                <span className="text-text-primary font-semibold">My Inventory</span>
              </div>
            } 
            className="border-0 bg-gradient-card backdrop-blur-sm shadow-modern-lg"
          >
            <Table
              columns={inventoryColumns}
              dataSource={inventory}
              rowKey="_id"
              pagination={{ pageSize: 5 }}
              className="modern-table"
            />
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default IndividualDashboard;

