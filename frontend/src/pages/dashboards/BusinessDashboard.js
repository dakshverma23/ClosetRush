import React, { useState, useEffect } from 'react';
import { Layout, Card, Row, Col, Statistic, Table, Tag, Button, Modal, Form, Input, Spin } from 'antd';
import appMessage from '../../utils/message';
import { HomeOutlined, ShoppingOutlined, DollarOutlined, InboxOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import BackButton from '../../components/layout/BackButton';
import api from '../../services/api';

const { Content } = Layout;
const { TextArea } = Input;

const BusinessDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeSubscriptions: 0,
    totalDeposit: 0,
    totalInventory: 0
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch properties
      const propertiesResponse = await api.get('/properties');
      const propertiesData = propertiesResponse.data.properties || [];
      setProperties(propertiesData);

      // Calculate stats
      let totalSubs = 0;
      let totalDep = 0;
      let totalInv = 0;

      for (const property of propertiesData) {
        // Fetch subscriptions for each property
        try {
          const subsResponse = await api.get(`/properties/${property._id}/subscriptions`);
          totalSubs += subsResponse.data.subscriptions?.filter(s => s.status === 'active').length || 0;
        } catch (error) {
          console.error(`Error fetching subscriptions for property ${property._id}:`, error);
        }

        // Fetch deposit for each property
        try {
          const depositResponse = await api.get(`/properties/${property._id}/deposit`);
          totalDep += depositResponse.data.deposit?.amount || 0;
        } catch (error) {
          console.error(`Error fetching deposit for property ${property._id}:`, error);
        }

        // Fetch inventory for each property
        try {
          const inventoryResponse = await api.get(`/properties/${property._id}/inventory`);
          totalInv += inventoryResponse.data.inventory?.length || 0;
        } catch (error) {
          console.error(`Error fetching inventory for property ${property._id}:`, error);
        }
      }

      setStats({
        totalProperties: propertiesData.length,
        activeSubscriptions: totalSubs,
        totalDeposit: totalDep,
        totalInventory: totalInv
      });
    } catch (error) {
      appMessage.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProperty = async (values) => {
    try {
      await api.post('/properties', values);
      appMessage.success('Property added successfully');
      setIsModalVisible(false);
      form.resetFields();
      fetchDashboardData();
    } catch (error) {
      appMessage.error(error.error?.message || 'Failed to add property');
    }
  };

  const handleDeleteProperty = (id) => {
    Modal.confirm({
      title: 'Delete Property',
      content: 'Are you sure you want to delete this property? This will also remove all associated subscriptions and inventory.',
      okText: 'Yes, Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await api.delete(`/properties/${id}`);
          appMessage.success('Property deleted successfully');
          fetchDashboardData();
        } catch (error) {
          appMessage.error(error.error?.message || 'Failed to delete property');
        }
      }
    });
  };

  const propertyColumns = [
    {
      title: 'Property Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const colors = {
          pg: 'blue',
          homestay: 'green',
          rental: 'orange',
          building: 'purple'
        };
        return <Tag color={colors[type] || 'default'}>{type ? type.toUpperCase() : 'N/A'}</Tag>;
      }
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true
    },
    {
      title: 'Units',
      dataIndex: 'numberOfUnits',
      key: 'units'
    },
    {
      title: 'Contact',
      dataIndex: 'contactPerson',
      key: 'contact'
    },
    {
      title: 'Phone',
      dataIndex: 'contactPhone',
      key: 'phone'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="space-x-2">
          <Button
            size="small"
            type="primary"
            onClick={() => navigate(`/business/properties/${record._id}`)}
          >
            View Details
          </Button>
          <Button
            size="small"
            danger
            onClick={() => handleDeleteProperty(record._id)}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <Layout className="min-h-screen">
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
          <div className="mb-4">
            <BackButton />
          </div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Business Dashboard</h1>
            <div className="flex gap-3">
              <Button
                type="default"
                size="large"
                onClick={() => navigate('/business/quotes')}
              >
                Your Quotes
              </Button>
              <Button
                type="default"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => navigate('/business/subscriptions')}
              >
                Business Quotation
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => setIsModalVisible(true)}
              >
                Add Property
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Properties"
                  value={stats.totalProperties}
                  prefix={<HomeOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Active Subscriptions"
                  value={stats.activeSubscriptions}
                  prefix={<ShoppingOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Deposits"
                  value={stats.totalDeposit}
                  prefix={<DollarOutlined />}
                  suffix="₹"
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Inventory"
                  value={stats.totalInventory}
                  prefix={<InboxOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Properties Table */}
          <Card title="My Properties">
            <Table
              columns={propertyColumns}
              dataSource={properties}
              rowKey="_id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1000 }}
            />
          </Card>

          {/* Add Property Modal */}
          <Modal
            title="Add New Property"
            open={isModalVisible}
            onCancel={() => {
              setIsModalVisible(false);
              form.resetFields();
            }}
            footer={null}
          >
            <Form form={form} onFinish={handleAddProperty} layout="vertical">
              <Form.Item
                name="name"
                label="Property Name"
                rules={[{ required: true, message: 'Please enter property name' }]}
              >
                <Input placeholder="e.g., Sunrise PG" />
              </Form.Item>

              <Form.Item
                name="type"
                label="Property Type"
                rules={[{ required: true, message: 'Please select property type' }]}
              >
                <select className="w-full p-2 border rounded">
                  <option value="">Select Type</option>
                  <option value="pg">PG (Paying Guest)</option>
                  <option value="homestay">Home Stay</option>
                  <option value="rental">Rental Home</option>
                  <option value="building">Building/Apartments</option>
                </select>
              </Form.Item>

              <Form.Item
                name="address"
                label="Address"
                rules={[{ required: true, message: 'Please enter address' }]}
              >
                <TextArea rows={3} placeholder="Full address" />
              </Form.Item>

              <Form.Item
                name="numberOfUnits"
                label="Number of Units"
                rules={[{ required: true, message: 'Please enter number of units' }]}
              >
                <Input type="number" min={1} placeholder="e.g., 10" />
              </Form.Item>

              <Form.Item
                name="contactPerson"
                label="Contact Person"
                rules={[{ required: true, message: 'Please enter contact person name' }]}
              >
                <Input placeholder="Manager/Owner name" />
              </Form.Item>

              <Form.Item
                name="contactPhone"
                label="Contact Phone"
                rules={[
                  { required: true, message: 'Please enter contact phone' },
                  { pattern: /^[0-9]{10}$/, message: 'Enter valid 10-digit phone' }
                ]}
              >
                <Input placeholder="10-digit phone number" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Add Property
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </Content>
    </Layout>
  );
};

export default BusinessDashboard;

