import React, { useState, useEffect } from 'react';
import {
  Layout, Card, Statistic, Row, Col, Button, Table, Tag, Spin,
  Modal, Input, Upload, Tabs
} from 'antd';
import appMessage from '../../utils/message';
import {
  CheckCircleOutlined, ClockCircleOutlined,
  TruckOutlined, InboxOutlined
} from '@ant-design/icons';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const { Content } = Layout;

const STATUS_LABELS = {
  assigned_to_logistics:  'Assigned to You',
  out_for_delivery:       'Out for Delivery',
  under_review:           'Under Review',
  delivered:              'Delivered'
};

const STATUS_COLORS = {
  assigned_to_logistics:  'blue',
  out_for_delivery:       'orange',
  under_review:           'gold',
  delivered:              'green'
};

const shortId = (id) => (id ? id.slice(-8) : '—');
const bundleTypes = (order) =>
  (order.orderedBundles || []).map((b) => b.bundleName).join(', ') || '—';
const totalQty = (order) =>
  (order.orderedBundles || []).reduce((s, b) => s + (b.quantity || 0), 0);

const LogisticsDashboard = () => {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Delivery form modal state
  const [deliveryFormModal, setDeliveryFormModal] = useState({ visible: false, order: null });
  const [deliveryFiles, setDeliveryFiles] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState({ buildingName: '', floor: '', roomNumber: '' });
  const [submitting, setSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState('assigned');

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadOrders = async () => {
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

  // ─── Derived order lists ──────────────────────────────────────────────────
  const assignedOrders       = orders.filter((o) => o.status === 'assigned_to_logistics');
  const outForDeliveryOrders = orders.filter((o) => o.status === 'out_for_delivery');
  const reviewOrders         = orders.filter((o) => ['under_review', 'delivered'].includes(o.status));

  // ─── Mark Out for Delivery ────────────────────────────────────────────────
  const handleMarkOutForDelivery = async (order) => {
    try {
      await api.patch(`/orders/${order._id}/out-for-delivery`);
      appMessage.success('Order marked as Out for Delivery');
      loadOrders();
    } catch (error) {
      appMessage.error(
        error?.response?.data?.error?.message || 'Failed to update order'
      );
    }
  };

  // ─── Delivery Form helpers ────────────────────────────────────────────────
  const openDeliveryFormModal = (order) => {
    setDeliveryFiles([]);
    setDeliveryAddress({ buildingName: '', floor: '', roomNumber: '' });
    setDeliveryFormModal({ visible: true, order });
  };

  const closeDeliveryFormModal = () => {
    setDeliveryFormModal({ visible: false, order: null });
    setDeliveryFiles([]);
    setDeliveryAddress({ buildingName: '', floor: '', roomNumber: '' });
  };

  const isDeliveryFormComplete = () =>
    deliveryFiles.length > 0 &&
    deliveryAddress.buildingName.trim() !== '' &&
    deliveryAddress.floor.trim() !== '' &&
    deliveryAddress.roomNumber.trim() !== '';

  const handleDeliveryFormSubmit = async () => {
    const order = deliveryFormModal.order;
    if (!order) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      deliveryFiles.forEach((f) => formData.append('images', f.originFileObj));
      formData.append('buildingName', deliveryAddress.buildingName);
      formData.append('floor', deliveryAddress.floor);
      formData.append('roomNumber', deliveryAddress.roomNumber);
      await api.post(`/orders/${order._id}/delivery-form`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      appMessage.success('Delivery form submitted successfully!');
      closeDeliveryFormModal();
      loadOrders();
    } catch (error) {
      appMessage.error(
        error?.response?.data?.error?.message || 'Failed to submit delivery form'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Table columns ────────────────────────────────────────────────────────
  const baseOrderColumns = [
    {
      title: 'Order ID',
      key: 'orderId',
      render: (_, o) => <Tag color="blue" className="font-mono">{shortId(o._id)}</Tag>
    },
    {
      title: 'Subscription ID',
      key: 'subscriptionId',
      render: (_, o) => (
        <span className="font-mono text-sm">
          {shortId(o.subscriptionId?._id || o.subscriptionId)}
        </span>
      )
    },
    {
      title: 'Bundle Types',
      key: 'bundleTypes',
      render: (_, o) => bundleTypes(o)
    },
    {
      title: 'Qty',
      key: 'qty',
      render: (_, o) => totalQty(o)
    }
  ];

  const assignedColumns = [
    ...baseOrderColumns,
    {
      title: 'Action',
      key: 'action',
      render: (_, o) => (
        <Button
          type="primary"
          size="small"
          icon={<TruckOutlined />}
          onClick={() => handleMarkOutForDelivery(o)}
          style={{ background: '#10b981', borderColor: '#10b981' }}
        >
          Mark Out for Delivery
        </Button>
      )
    }
  ];

  const outForDeliveryColumns = [
    ...baseOrderColumns,
    {
      title: 'Action',
      key: 'action',
      render: (_, o) => (
        <Button
          type="primary"
          size="small"
          icon={<CheckCircleOutlined />}
          onClick={() => openDeliveryFormModal(o)}
          style={{ background: '#f59e0b', borderColor: '#f59e0b' }}
        >
          Submit Delivery Form
        </Button>
      )
    }
  ];

  const reviewColumns = [
    ...baseOrderColumns,
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
      title: 'Updated At',
      key: 'updatedAt',
      render: (_, o) => o.updatedAt ? new Date(o.updatedAt).toLocaleString() : '—'
    }
  ];

  // ─── Delivery Form Modal ──────────────────────────────────────────────────
  const renderDeliveryFormModal = () => {
    const order = deliveryFormModal.order;
    if (!order) return null;

    const uploadProps = {
      listType: 'picture-card',
      fileList: deliveryFiles,
      beforeUpload: () => false,
      onChange: ({ fileList }) => setDeliveryFiles(fileList),
      multiple: true,
      accept: 'image/*'
    };

    return (
      <Modal
        title={`Delivery Form — Order #${shortId(order._id)}`}
        open={deliveryFormModal.visible}
        onCancel={closeDeliveryFormModal}
        footer={[
          <Button key="cancel" onClick={closeDeliveryFormModal}>Cancel</Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitting}
            disabled={!isDeliveryFormComplete()}
            onClick={handleDeliveryFormSubmit}
          >
            Submit Delivery Form
          </Button>
        ]}
        width={560}
        destroyOnClose
      >
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Delivery Photos <span className="text-red-500">*</span>
            <span className="text-xs text-gray-400 ml-1">(at least 1 required)</span>
          </label>
          <Upload {...uploadProps}>
            {deliveryFiles.length < 10 && (
              <div>
                <InboxOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">
            Building Name <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="e.g. Sunrise Apartments"
            value={deliveryAddress.buildingName}
            onChange={(e) =>
              setDeliveryAddress((prev) => ({ ...prev, buildingName: e.target.value }))
            }
          />
        </div>

        <Row gutter={12}>
          <Col span={12}>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">
                Floor <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. 3"
                value={deliveryAddress.floor}
                onChange={(e) =>
                  setDeliveryAddress((prev) => ({ ...prev, floor: e.target.value }))
                }
              />
            </div>
          </Col>
          <Col span={12}>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">
                Room Number <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. 304"
                value={deliveryAddress.roomNumber}
                onChange={(e) =>
                  setDeliveryAddress((prev) => ({ ...prev, roomNumber: e.target.value }))
                }
              />
            </div>
          </Col>
        </Row>
      </Modal>
    );
  };

  if (ordersLoading && orders.length === 0) {
    return (
      <Layout className="min-h-screen">
        <Navbar />
        <Content className="flex items-center justify-center p-8">
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  const tabItems = [
    {
      key: 'assigned',
      label: (
        <span>
          <TruckOutlined />
          Assigned Orders
          {assignedOrders.length > 0 && <Tag color="blue" className="ml-2">{assignedOrders.length}</Tag>}
        </span>
      ),
      children: (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Assigned Orders</h2>
            <Button onClick={loadOrders} loading={ordersLoading}>Refresh</Button>
          </div>
          <Table
            dataSource={assignedOrders}
            columns={assignedColumns}
            rowKey="_id"
            loading={ordersLoading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 700 }}
            locale={{ emptyText: 'No assigned orders' }}
          />
        </Card>
      )
    },
    {
      key: 'out_for_delivery',
      label: (
        <span>
          <TruckOutlined />
          Out for Delivery
          {outForDeliveryOrders.length > 0 && <Tag color="orange" className="ml-2">{outForDeliveryOrders.length}</Tag>}
        </span>
      ),
      children: (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Out for Delivery</h2>
            <Button onClick={loadOrders} loading={ordersLoading}>Refresh</Button>
          </div>
          <Table
            dataSource={outForDeliveryOrders}
            columns={outForDeliveryColumns}
            rowKey="_id"
            loading={ordersLoading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 700 }}
            locale={{ emptyText: 'No orders out for delivery' }}
          />
        </Card>
      )
    },
    {
      key: 'review',
      label: (
        <span>
          <ClockCircleOutlined />
          Delivery Review
          {reviewOrders.length > 0 && <Tag color="gold" className="ml-2">{reviewOrders.length}</Tag>}
        </span>
      ),
      children: (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Delivery Review</h2>
            <Button onClick={loadOrders} loading={ordersLoading}>Refresh</Button>
          </div>
          <Table
            dataSource={reviewOrders}
            columns={reviewColumns}
            rowKey="_id"
            loading={ordersLoading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 800 }}
            locale={{ emptyText: 'No orders under review or delivered' }}
          />
        </Card>
      )
    }
  ];

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-bg-main to-bg-elevated">
      <Navbar />
      <Content className="p-6 max-w-7xl mx-auto w-full">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient-primary mb-2">
            Logistics Dashboard
          </h1>
          <p className="text-gray-500 text-lg">
            Welcome back, {user?.name}! Manage your deliveries.
          </p>
        </div>

        {/* Summary Stats */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Assigned"
                value={assignedOrders.length}
                prefix={<TruckOutlined style={{ color: '#2563EB' }} />}
                valueStyle={{ color: '#2563EB' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Out for Delivery"
                value={outForDeliveryOrders.length}
                prefix={<TruckOutlined style={{ color: '#f59e0b' }} />}
                valueStyle={{ color: '#f59e0b' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Delivered"
                value={orders.filter((o) => o.status === 'delivered').length}
                prefix={<CheckCircleOutlined style={{ color: '#10b981' }} />}
                valueStyle={{ color: '#10b981' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          type="card"
          size="large"
        />

        {renderDeliveryFormModal()}
      </Content>
      <Footer />
    </Layout>
  );
};

export default LogisticsDashboard;
