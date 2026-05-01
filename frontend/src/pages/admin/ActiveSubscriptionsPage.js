import React, { useState, useEffect } from 'react';
import { Layout, Card, Table, Tag, Button, Statistic, Row, Col, Select, DatePicker, Space, Spin, Descriptions, Modal, Input } from 'antd';
import {
  ShoppingOutlined,
  DollarOutlined,
  UserOutlined,
  CalendarOutlined,
  FilterOutlined,
  ReloadOutlined,
  EyeOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import appMessage from '../../utils/message';

const { Content } = Layout;
const { RangePicker } = DatePicker;

const ActiveSubscriptionsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState([null, null]);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [actionReason, setActionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalActive: 0,
    totalCancelled: 0,
    totalPaused: 0,
    totalRevenue: 0,
    monthlyRecurring: 0
  });

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [subscriptions, statusFilter, dateRange]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/subscriptions');
      const subs = response.data.subscriptions || [];
      setSubscriptions(subs);
      calculateStats(subs);
    } catch (error) {
      appMessage.error('Failed to load subscriptions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (subs) => {
    const active = subs.filter(s => s.status === 'active').length;
    const cancelled = subs.filter(s => s.status === 'cancelled').length;
    const paused = subs.filter(s => s.status === 'paused').length;
    
    // Calculate total revenue (sum of all finalPrice)
    const totalRevenue = subs.reduce((sum, s) => sum + (s.finalPrice || 0), 0);
    
    // Calculate monthly recurring revenue (active subscriptions only)
    const monthlyRecurring = subs
      .filter(s => s.status === 'active')
      .reduce((sum, s) => {
        // Convert to monthly rate based on duration
        const monthlyRate = (s.finalPrice || 0) / (s.duration || 1);
        return sum + monthlyRate;
      }, 0);

    setStats({
      totalActive: active,
      totalCancelled: cancelled,
      totalPaused: paused,
      totalRevenue: Math.round(totalRevenue),
      monthlyRecurring: Math.round(monthlyRecurring)
    });
  };

  const applyFilters = () => {
    let filtered = [...subscriptions];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter);
    }

    // Date range filter
    if (dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf('day').toDate();
      const endDate = dateRange[1].endOf('day').toDate();
      filtered = filtered.filter(s => {
        const subDate = new Date(s.createdAt);
        return subDate >= startDate && subDate <= endDate;
      });
    }

    setFilteredSubscriptions(filtered);
  };

  const handleViewDetails = (subscription) => {
    setSelectedSubscription(subscription);
    setDetailsModalVisible(true);
  };

  const handleAction = (subscription, type) => {
    setSelectedSubscription(subscription);
    setActionType(type);
    setActionReason('');
    setActionModalVisible(true);
  };

  const executeAction = async () => {
    if (!selectedSubscription || !actionType) return;

    setActionLoading(true);
    try {
      let endpoint = '';
      let payload = {};

      switch (actionType) {
        case 'pause':
          endpoint = `/subscriptions/${selectedSubscription._id}/pause`;
          break;
        case 'resume':
          endpoint = `/subscriptions/${selectedSubscription._id}/resume`;
          break;
        case 'cancel':
          if (!actionReason.trim()) {
            appMessage.warning('Please provide a cancellation reason');
            setActionLoading(false);
            return;
          }
          endpoint = `/subscriptions/${selectedSubscription._id}`;
          payload = { reason: actionReason };
          break;
        default:
          break;
      }

      if (actionType === 'cancel') {
        await api.delete(endpoint, { data: payload });
      } else {
        await api.patch(endpoint, payload);
      }

      appMessage.success(`Subscription ${actionType}d successfully`);
      setActionModalVisible(false);
      setActionReason('');
      fetchSubscriptions();
    } catch (error) {
      appMessage.error(error.response?.data?.message || `Failed to ${actionType} subscription`);
    } finally {
      setActionLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Subscription ID', 'User Name', 'User Email', 'Bundle', 'Duration', 'Price', 'Status', 'Start Date', 'End Date'];
    const rows = filteredSubscriptions.map(s => [
      s._id,
      s.userId?.name || 'N/A',
      s.userId?.email || 'N/A',
      s.bundleId?.name || 'N/A',
      `${s.duration} months`,
      `₹${s.finalPrice}`,
      s.status,
      new Date(s.startDate).toLocaleDateString(),
      new Date(s.endDate).toLocaleDateString()
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscriptions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const columns = [
    {
      title: 'Subscription ID',
      key: 'id',
      render: (_, record) => (
        <Tag color="purple" className="font-mono">
          {record._id.slice(-8)}
        </Tag>
      ),
      width: 140
    },
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <div>
          <div className="font-medium text-slate-800">{record.userId?.name || 'N/A'}</div>
          <div className="text-xs text-slate-500">{record.userId?.email || 'N/A'}</div>
        </div>
      ),
      width: 200
    },
    {
      title: 'Bundle',
      key: 'bundle',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.bundleId?.name || 'N/A'}</div>
          <div className="text-xs text-slate-500">
            {record.bundleId?.description?.substring(0, 40)}...
          </div>
        </div>
      ),
      width: 200
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => `${duration} month${duration > 1 ? 's' : ''}`,
      width: 100
    },
    {
      title: 'Price',
      key: 'price',
      render: (_, record) => (
        <div>
          <div className="font-semibold text-indigo-600">₹{record.finalPrice}</div>
          {record.discount > 0 && (
            <div className="text-xs text-slate-500 line-through">₹{record.originalPrice}</div>
          )}
        </div>
      ),
      width: 120
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          active: 'green',
          paused: 'orange',
          cancelled: 'red'
        };
        return (
          <Tag color={colors[status] || 'default'}>
            {status?.toUpperCase()}
          </Tag>
        );
      },
      width: 100
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      sorter: (a, b) => new Date(a.startDate) - new Date(b.startDate),
      width: 120
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date) => new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      sorter: (a, b) => new Date(a.endDate) - new Date(b.endDate),
      width: 120
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      render: (_, record) => (
        <Space wrap>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            View
          </Button>
          {record.status === 'active' && (
            <>
              <Button
                size="small"
                icon={<PauseCircleOutlined />}
                onClick={() => handleAction(record, 'pause')}
              >
                Pause
              </Button>
              <Button
                size="small"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => handleAction(record, 'cancel')}
              >
                Cancel
              </Button>
            </>
          )}
          {record.status === 'paused' && (
            <Button
              size="small"
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => handleAction(record, 'resume')}
              style={{ background: '#10b981', borderColor: '#10b981' }}
            >
              Resume
            </Button>
          )}
        </Space>
      ),
      width: 250
    }
  ];

  if (loading) {
    return (
      <Layout className="min-h-screen bg-slate-50">
        <Content className="p-4 md:p-8">
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen bg-slate-50">
      <Content className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Active Subscriptions
                  </span>
                </h1>
                <p className="text-slate-600 text-lg">
                  Manage all subscriptions, view analytics, and track revenue
                </p>
              </div>
              <Button
                type="default"
                onClick={() => navigate('/admin/dashboard')}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <Row gutter={[24, 24]} className="mb-8">
            <Col xs={24} sm={12} lg={6}>
              <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                <Statistic
                  title={<span className="text-slate-600 font-medium">Active Subscriptions</span>}
                  value={stats.totalActive}
                  prefix={<ShoppingOutlined className="text-green-600" />}
                  valueStyle={{ color: '#10b981', fontSize: '2rem', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                <Statistic
                  title={<span className="text-slate-600 font-medium">Paused</span>}
                  value={stats.totalPaused}
                  prefix={<PauseCircleOutlined className="text-orange-600" />}
                  valueStyle={{ color: '#f59e0b', fontSize: '2rem', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                <Statistic
                  title={<span className="text-slate-600 font-medium">Cancelled</span>}
                  value={stats.totalCancelled}
                  prefix={<CloseCircleOutlined className="text-red-600" />}
                  valueStyle={{ color: '#ef4444', fontSize: '2rem', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                <Statistic
                  title={<span className="text-slate-600 font-medium">Total Revenue</span>}
                  value={stats.totalRevenue}
                  prefix="₹"
                  suffix={
                    <div className="text-xs text-slate-500 mt-1">
                      MRR: ₹{stats.monthlyRecurring}
                    </div>
                  }
                  valueStyle={{ color: '#6366f1', fontSize: '2rem', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Filters and Actions */}
          <Card className="shadow-lg border-0 bg-white rounded-xl mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                <FilterOutlined /> Filters:
              </span>

              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 150 }}
                size="middle"
              >
                <Select.Option value="all">All Statuses</Select.Option>
                <Select.Option value="active">Active</Select.Option>
                <Select.Option value="paused">Paused</Select.Option>
                <Select.Option value="cancelled">Cancelled</Select.Option>
              </Select>

              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                format="DD MMM YYYY"
                placeholder={['Start Date', 'End Date']}
                size="middle"
              />

              {(statusFilter !== 'all' || dateRange[0]) && (
                <Button
                  size="middle"
                  onClick={() => {
                    setStatusFilter('all');
                    setDateRange([null, null]);
                  }}
                >
                  Clear Filters
                </Button>
              )}

              <span className="ml-auto text-sm text-slate-500">
                Showing {filteredSubscriptions.length} of {subscriptions.length} subscriptions
              </span>

              <Button
                icon={<ReloadOutlined />}
                onClick={fetchSubscriptions}
                loading={loading}
              >
                Refresh
              </Button>

              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={exportToCSV}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 border-0"
              >
                Export CSV
              </Button>
            </div>
          </Card>

          {/* Subscriptions Table */}
          <Card className="shadow-lg border-0 bg-white rounded-xl">
            <Table
              columns={columns}
              dataSource={filteredSubscriptions}
              rowKey="_id"
              pagination={{
                pageSize: 15,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} subscriptions`,
                pageSizeOptions: ['10', '15', '25', '50']
              }}
              scroll={{ x: 1400 }}
              locale={{ emptyText: 'No subscriptions found' }}
            />
          </Card>

          {/* Details Modal */}
          <Modal
            title={
              <div className="flex items-center gap-2">
                <ShoppingOutlined className="text-indigo-600" />
                <span>Subscription Details</span>
              </div>
            }
            open={detailsModalVisible}
            onCancel={() => setDetailsModalVisible(false)}
            footer={[
              <Button key="close" onClick={() => setDetailsModalVisible(false)}>
                Close
              </Button>
            ]}
            width={700}
          >
            {selectedSubscription && (
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Subscription ID">
                  <Tag color="purple" className="font-mono">
                    {selectedSubscription._id}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Bundle Order ID">
                  {selectedSubscription.bundleOrderId || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="User Name">
                  {selectedSubscription.userId?.name || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="User Email">
                  {selectedSubscription.userId?.email || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="User Mobile">
                  {selectedSubscription.userId?.mobile || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Bundle">
                  {selectedSubscription.bundleId?.name || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Bundle Description">
                  {selectedSubscription.bundleId?.description || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Duration">
                  {selectedSubscription.duration} month{selectedSubscription.duration > 1 ? 's' : ''}
                </Descriptions.Item>
                <Descriptions.Item label="Original Price">
                  ₹{selectedSubscription.originalPrice}
                </Descriptions.Item>
                <Descriptions.Item label="Discount">
                  ₹{selectedSubscription.discount}
                </Descriptions.Item>
                <Descriptions.Item label="Final Price">
                  <span className="font-semibold text-indigo-600">
                    ₹{selectedSubscription.finalPrice}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Security Deposit">
                  ₹{selectedSubscription.fixedDeposit}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={
                    selectedSubscription.status === 'active' ? 'green' :
                    selectedSubscription.status === 'paused' ? 'orange' : 'red'
                  }>
                    {selectedSubscription.status?.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Start Date">
                  {new Date(selectedSubscription.startDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </Descriptions.Item>
                <Descriptions.Item label="End Date">
                  {new Date(selectedSubscription.endDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </Descriptions.Item>
                {selectedSubscription.deliveryDate && (
                  <Descriptions.Item label="Delivery Date">
                    {new Date(selectedSubscription.deliveryDate).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </Descriptions.Item>
                )}
                {selectedSubscription.pickupDate && (
                  <Descriptions.Item label="Pickup Date">
                    {new Date(selectedSubscription.pickupDate).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </Descriptions.Item>
                )}
                {selectedSubscription.status === 'cancelled' && (
                  <>
                    <Descriptions.Item label="Cancellation Reason">
                      {selectedSubscription.cancellationReason || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Cancelled At">
                      {selectedSubscription.cancelledAt
                        ? new Date(selectedSubscription.cancelledAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })
                        : 'N/A'}
                    </Descriptions.Item>
                  </>
                )}
                <Descriptions.Item label="Created At">
                  {new Date(selectedSubscription.createdAt).toLocaleString('en-IN')}
                </Descriptions.Item>
                <Descriptions.Item label="Last Updated">
                  {new Date(selectedSubscription.updatedAt).toLocaleString('en-IN')}
                </Descriptions.Item>
              </Descriptions>
            )}
          </Modal>

          {/* Action Modal */}
          <Modal
            title={`${actionType?.charAt(0).toUpperCase()}${actionType?.slice(1)} Subscription`}
            open={actionModalVisible}
            onCancel={() => setActionModalVisible(false)}
            onOk={executeAction}
            confirmLoading={actionLoading}
            okText={actionType?.charAt(0).toUpperCase() + actionType?.slice(1)}
            okButtonProps={{
              danger: actionType === 'cancel',
              style: actionType === 'resume' ? { background: '#10b981', borderColor: '#10b981' } : {}
            }}
          >
            <p className="mb-4">
              Are you sure you want to {actionType} this subscription?
            </p>
            {actionType === 'cancel' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cancellation Reason <span className="text-red-500">*</span>
                </label>
                <Input.TextArea
                  rows={4}
                  placeholder="Enter reason for cancellation..."
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                />
              </div>
            )}
          </Modal>
        </div>
      </Content>
    </Layout>
  );
};

export default ActiveSubscriptionsPage;
