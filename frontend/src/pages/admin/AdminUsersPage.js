import React, { useState, useEffect } from 'react';
import {
  Layout, Card, Row, Col, Table, Tag, Button, message, Modal,
  Form, Input, Select, Spin, Statistic, Avatar, Drawer, Descriptions, Divider
} from 'antd';
import {
  UserOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined,
  TeamOutlined, EyeOutlined, MenuOutlined, HomeOutlined,
  DashboardOutlined, AppstoreOutlined, CustomerServiceOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import api from '../../services/api';

const { Content } = Layout;
const { TextArea } = Input;
const { Option } = Select;

const AdminUsersPage = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        api.get('/users'),
        api.get('/users/stats/summary')
      ]);
      setUsers(usersRes.data.users || []);
      setUserStats(statsRes.data.stats);
    } catch (error) {
      message.error('Failed to load users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = (record) => {
    setSelectedUser(record);
    setIsDetailModalVisible(true);
  };

  const handleEditUser = (record) => {
    setEditingUser(record);
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      mobile: record.mobile,
      address: record.address,
      userType: record.userType
    });
    setIsEditModalVisible(true);
  };

  const handleSaveUser = async (values) => {
    try {
      await api.put(`/users/${editingUser._id}`, values);
      message.success('User updated successfully');
      setIsEditModalVisible(false);
      form.resetFields();
      fetchUsers();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.patch(`/users/${id}/toggle-status`);
      message.success('User status updated');
      fetchUsers();
    } catch (error) {
      message.error('Failed to update status');
    }
  };

  const handleDeleteUser = (id, name) => {
    Modal.confirm({
      title: 'Delete User',
      content: `Are you sure you want to delete "${name}"? This cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await api.delete(`/users/${id}`);
          message.success('User deleted successfully');
          fetchUsers();
        } catch (error) {
          message.error('Failed to delete user');
        }
      }
    });
  };

  // Filter users based on search + type + status
  const filteredUsers = users.filter(u => {
    const matchesSearch =
      !searchText ||
      u.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      u.mobile?.includes(searchText);
    const matchesType = filterType === 'all' || u.userType === filterType;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && u.active) ||
      (filterStatus === 'inactive' && !u.active);
    return matchesSearch && matchesType && matchesStatus;
  });

  const typeColors = { individual: 'blue', business: 'green', admin: 'red' };

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar icon={<UserOutlined />} className="bg-blue-500 flex-shrink-0" />
          <div>
            <div className="font-semibold text-gray-800">{record.name}</div>
            <div className="text-xs text-gray-500">{record.email}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Mobile',
      dataIndex: 'mobile',
      key: 'mobile',
      render: (mobile) => mobile || <span className="text-gray-400">—</span>
    },
    {
      title: 'Type',
      dataIndex: 'userType',
      key: 'userType',
      render: (type) => (
        <Tag color={typeColors[type] || 'default'}>
          {type ? type.toUpperCase() : 'N/A'}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      render: (active) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'ACTIVE' : 'INACTIVE'}
        </Tag>
      )
    },
    {
      title: 'Registered',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      })
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex flex-wrap gap-1">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewUser(record)}
          >
            View
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
          >
            Edit
          </Button>
          <Button
            size="small"
            onClick={() => handleToggleStatus(record._id)}
          >
            {record.active ? 'Deactivate' : 'Activate'}
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteUser(record._id, record.name)}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <Layout className="min-h-screen bg-gray-50">
        <Navbar />
        <Content className="p-4 md:p-8">
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Navbar />
      <Content className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-4">
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/admin/dashboard')}
              >
                Back
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Users Management</h1>
                <p className="text-gray-500 text-sm mt-0.5">
                  View and manage all registered users
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          {userStats && (
            <Row gutter={[16, 16]} className="mb-6">
              <Col xs={12} sm={6}>
                <Card className="text-center">
                  <Statistic
                    title="Total Users"
                    value={userStats.total || 0}
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card className="text-center">
                  <Statistic
                    title="Active"
                    value={userStats.active || 0}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card className="text-center">
                  <Statistic
                    title="Individual"
                    value={userStats.individual || 0}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card className="text-center">
                  <Statistic
                    title="Business"
                    value={userStats.business || 0}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
            </Row>
          )}

          {/* Filters */}
          <Card className="mb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Search by name, email or mobile..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                allowClear
                className="flex-1"
                size="large"
                prefix={<UserOutlined className="text-gray-400" />}
              />
              <Select
                value={filterType}
                onChange={setFilterType}
                size="large"
                style={{ minWidth: 160 }}
              >
                <Option value="all">All Types</Option>
                <Option value="individual">Individual</Option>
                <Option value="business">Business</Option>
                <Option value="admin">Admin</Option>
              </Select>
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                size="large"
                style={{ minWidth: 140 }}
              >
                <Option value="all">All Status</Option>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </div>
          </Card>

          {/* Users Table */}
          <Card>
            <div className="text-sm text-gray-500 mb-3">
              Showing {filteredUsers.length} of {users.length} users
            </div>
            <Table
              columns={columns}
              dataSource={filteredUsers}
              rowKey="_id"
              pagination={{ pageSize: 15, showSizeChanger: true }}
              scroll={{ x: 900 }}
            />
          </Card>

          {/* View User Detail Modal */}
          <Modal
            title={
              <div className="flex items-center gap-3">
                <Avatar size={40} icon={<UserOutlined />} className="bg-blue-500" />
                <div>
                  <div className="font-bold">{selectedUser?.name}</div>
                  <div className="text-xs text-gray-500 font-normal">{selectedUser?.email}</div>
                </div>
              </div>
            }
            open={isDetailModalVisible}
            onCancel={() => setIsDetailModalVisible(false)}
            footer={[
              <Button key="edit" type="primary" icon={<EditOutlined />}
                onClick={() => { setIsDetailModalVisible(false); handleEditUser(selectedUser); }}>
                Edit User
              </Button>,
              <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
                Close
              </Button>
            ]}
            width={600}
          >
            {selectedUser && (
              <div>
                <Descriptions bordered column={2} size="small">
                  <Descriptions.Item label="Full Name" span={2}>
                    {selectedUser.name}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email" span={2}>
                    {selectedUser.email}
                  </Descriptions.Item>
                  <Descriptions.Item label="Mobile">
                    {selectedUser.mobile || '—'}
                  </Descriptions.Item>
                  <Descriptions.Item label="User Type">
                    <Tag color={typeColors[selectedUser.userType] || 'default'}>
                      {selectedUser.userType?.toUpperCase()}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag color={selectedUser.active ? 'green' : 'red'}>
                      {selectedUser.active ? 'ACTIVE' : 'INACTIVE'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Registered">
                    {new Date(selectedUser.createdAt).toLocaleString('en-IN')}
                  </Descriptions.Item>
                  {selectedUser.address && (
                    <Descriptions.Item label="Address" span={2}>
                      {selectedUser.address}
                    </Descriptions.Item>
                  )}
                  {selectedUser.googleId && (
                    <Descriptions.Item label="Auth Method" span={2}>
                      <Tag color="blue">Google OAuth</Tag>
                    </Descriptions.Item>
                  )}
                </Descriptions>

                <Divider />

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleToggleStatus(selectedUser._id)}
                    type={selectedUser.active ? 'default' : 'primary'}
                  >
                    {selectedUser.active ? 'Deactivate User' : 'Activate User'}
                  </Button>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      setIsDetailModalVisible(false);
                      handleDeleteUser(selectedUser._id, selectedUser.name);
                    }}
                  >
                    Delete User
                  </Button>
                </div>
              </div>
            )}
          </Modal>

          {/* Edit User Modal */}
          <Modal
            title="Edit User"
            open={isEditModalVisible}
            onCancel={() => { setIsEditModalVisible(false); form.resetFields(); }}
            footer={null}
            width={500}
          >
            <Form form={form} layout="vertical" onFinish={handleSaveUser}>
              <Form.Item name="name" label="Full Name"
                rules={[{ required: true, message: 'Please enter name' }]}>
                <Input placeholder="Full name" size="large" />
              </Form.Item>
              <Form.Item name="email" label="Email"
                rules={[{ required: true, type: 'email', message: 'Please enter valid email' }]}>
                <Input placeholder="Email address" size="large" />
              </Form.Item>
              <Form.Item name="mobile" label="Mobile"
                rules={[
                  { required: true, message: 'Please enter mobile' },
                  { pattern: /^[0-9]{10}$/, message: 'Enter valid 10-digit mobile' }
                ]}>
                <Input placeholder="10-digit mobile number" size="large" />
              </Form.Item>
              <Form.Item name="address" label="Address">
                <TextArea rows={3} placeholder="Full address" />
              </Form.Item>
              <Form.Item name="userType" label="User Type"
                rules={[{ required: true, message: 'Please select user type' }]}>
                <Select size="large">
                  <Option value="individual">Individual</Option>
                  <Option value="business">Business</Option>
                  <Option value="admin">Admin</Option>
                </Select>
              </Form.Item>
              <div className="flex gap-2 justify-end">
                <Button onClick={() => { setIsEditModalVisible(false); form.resetFields(); }}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" size="large">
                  Update User
                </Button>
              </div>
            </Form>
          </Modal>

        </div>
      </Content>
    </Layout>
  );
};

export default AdminUsersPage;
