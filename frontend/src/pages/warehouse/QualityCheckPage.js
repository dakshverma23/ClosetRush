import React, { useState, useEffect } from 'react';
import {
  Layout, Card, Table, Button, Modal, Form, Input, Upload, Select, Tag, Spin, Row, Col, Image
} from 'antd';
import {
  CameraOutlined, PlusOutlined, CheckCircleOutlined, InboxOutlined, DeleteOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import appMessage from '../../utils/message';

const { Content } = Layout;
const { TextArea } = Input;
const { Option } = Select;

// ─── Helper: short ID ─────────────────────────────────────────────────────────
const shortId = (id) => (id ? id.slice(-8) : '—');

// ─── Helper: bundle type summary ──────────────────────────────────────────────
const bundleTypes = (order) =>
  (order.orderedBundles || []).map((b) => b.bundleName).join(', ') || '—';

// ─── Helper: total qty ────────────────────────────────────────────────────────
const totalQty = (order) =>
  (order.orderedBundles || []).reduce((s, b) => s + (b.quantity || 0), 0);

const QualityCheckPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ── State ────────────────────────────────────────────────────────────────
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);

  // ── Quality Check Modal state ────────────────────────────────────────────
  const [qcModal, setQcModal] = useState({ visible: false, order: null });
  const [skuPhotoEntries, setSkuPhotoEntries] = useState([]);
  // skuPhotoEntries: [{ skuCode: '', photos: [], id: uniqueId }]
  const [notes, setNotes] = useState('');
  const [overallCondition, setOverallCondition] = useState('good');
  const [submitting, setSubmitting] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // Data loading
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    loadOrders();
    loadInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await api.get('/orders');
      // Filter only packed orders (status = 'packed')
      const packedOrders = (response.data.orders || []).filter(o => o.status === 'packed');
      setOrders(packedOrders);
    } catch (error) {
      appMessage.error('Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadInventory = async () => {
    setInventoryLoading(true);
    try {
      const response = await api.get('/inventory-management/inventory');
      // Filter only in_stock items
      const inStockItems = (response.data.inventory || []).filter(item => item.status === 'in_stock');
      setInventoryItems(inStockItems);
    } catch (error) {
      console.error('Failed to load inventory:', error);
    } finally {
      setInventoryLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Quality Check Modal helpers
  // ─────────────────────────────────────────────────────────────────────────
  const openQualityCheckModal = (order) => {
    // Calculate total quantity needed based on ordered bundles
    const totalQuantity = totalQty(order);
    
    // Initialize SKU photo entries based on total quantity
    const initialEntries = Array.from({ length: totalQuantity }, (_, idx) => ({
      id: `entry_${Date.now()}_${idx}`,
      skuCode: '',
      photos: []
    }));

    setSkuPhotoEntries(initialEntries);
    setNotes('');
    setOverallCondition('good');
    setQcModal({ visible: true, order });
  };

  const closeQualityCheckModal = () => {
    setQcModal({ visible: false, order: null });
    setSkuPhotoEntries([]);
    setNotes('');
    setOverallCondition('good');
  };

  const updateSkuCode = (entryId, skuCode) => {
    setSkuPhotoEntries(prev =>
      prev.map(entry =>
        entry.id === entryId ? { ...entry, skuCode } : entry
      )
    );
  };

  const handlePhotoUpload = (entryId, fileList) => {
    setSkuPhotoEntries(prev =>
      prev.map(entry =>
        entry.id === entryId ? { ...entry, photos: fileList } : entry
      )
    );
  };

  const isFormComplete = () => {
    // All entries must have a SKU code and at least one photo
    return skuPhotoEntries.every(entry => 
      entry.skuCode.trim() !== '' && entry.photos.length > 0
    );
  };

  const handleSubmitQualityCheck = async () => {
    const order = qcModal.order;
    if (!order) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('orderId', order._id);
      formData.append('notes', notes);
      formData.append('overallCondition', overallCondition);
      formData.append('bagId', order.bagId || '');

      // Build skuPhotosJson mapping: [{ skuCode, count }]
      const skuPhotosMapping = skuPhotoEntries.map(entry => ({
        skuCode: entry.skuCode,
        count: entry.photos.length
      }));
      formData.append('skuPhotosJson', JSON.stringify(skuPhotosMapping));

      // Append all photos in order
      skuPhotoEntries.forEach(entry => {
        entry.photos.forEach(photo => {
          formData.append('images', photo.originFileObj);
        });
      });

      await api.post('/quality-checks', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      appMessage.success('Quality check submitted successfully!');
      closeQualityCheckModal();
      loadOrders();
    } catch (error) {
      appMessage.error(
        error?.error?.message ||
        error?.response?.data?.message ||
        'Failed to submit quality check'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Get available SKU codes for a specific order based on bundle types
  // ─────────────────────────────────────────────────────────────────────────
  const getAvailableSkuCodes = (order) => {
    if (!order || !order.orderedBundles) return [];

    // Get all bundle type IDs from the order
    const bundleTypeIds = order.orderedBundles.map(ob => ob.bundleTypeId);

    // Filter inventory items that match these bundle types and are in stock
    const availableItems = inventoryItems.filter(item => 
      bundleTypeIds.includes(item.bundleTypeId) && item.status === 'in_stock'
    );

    return availableItems;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Table columns
  // ─────────────────────────────────────────────────────────────────────────
  const orderColumns = [
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
      title: 'Customer',
      key: 'customer',
      render: (_, o) => o.userId?.name || '—'
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
    },
    {
      title: 'Bag ID',
      key: 'bagId',
      render: (_, o) => o.bagId ? <Tag color="purple">{o.bagId}</Tag> : '—'
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, o) => (
        <Button
          type="primary"
          size="small"
          icon={<CameraOutlined />}
          onClick={() => openQualityCheckModal(o)}
          className="btn-modern-primary"
        >
          Quality Check
        </Button>
      )
    }
  ];

  // ─────────────────────────────────────────────────────────────────────────
  // Render Quality Check Modal
  // ─────────────────────────────────────────────────────────────────────────
  const renderQualityCheckModal = () => {
    const order = qcModal.order;
    if (!order) return null;

    const availableSkus = getAvailableSkuCodes(order);

    return (
      <Modal
        title={`Quality Check — Order #${shortId(order._id)}`}
        open={qcModal.visible}
        onCancel={closeQualityCheckModal}
        footer={[
          <Button key="cancel" onClick={closeQualityCheckModal}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitting}
            disabled={!isFormComplete()}
            onClick={handleSubmitQualityCheck}
            className="btn-modern-primary"
          >
            Submit Quality Check
          </Button>
        ]}
        width={800}
        destroyOnClose
      >
        {/* Order Info */}
        <Card size="small" className="mb-4 bg-blue-50">
          <Row gutter={16}>
            <Col span={12}>
              <p><strong>Customer:</strong> {order.userId?.name || '—'}</p>
              <p><strong>Bundle Types:</strong> {bundleTypes(order)}</p>
            </Col>
            <Col span={12}>
              <p><strong>Total Quantity:</strong> {totalQty(order)}</p>
              <p><strong>Bag ID:</strong> {order.bagId || '—'}</p>
            </Col>
          </Row>
        </Card>

        {/* SKU Photo Entries */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-3">
            SKU Photos <span className="text-red-500">*</span>
            <span className="text-sm font-normal text-gray-500 ml-2">
              (Add {skuPhotoEntries.length} items based on order quantity)
            </span>
          </h3>

          {skuPhotoEntries.map((entry, index) => (
            <Card
              key={entry.id}
              size="small"
              className="mb-3"
              title={`Item ${index + 1}`}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">
                      SKU Code <span className="text-red-500">*</span>
                    </label>
                    <Select
                      style={{ width: '100%' }}
                      placeholder="Select SKU Code"
                      value={entry.skuCode || undefined}
                      onChange={(value) => updateSkuCode(entry.id, value)}
                      loading={inventoryLoading}
                      showSearch
                      filterOption={(input, option) =>
                        option.children.toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {availableSkus.map(item => (
                        <Option key={item._id} value={item.skuCode}>
                          {item.skuCode} - {item.itemName}
                        </Option>
                      ))}
                    </Select>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">
                      Photos <span className="text-red-500">*</span>
                      <span className="text-xs text-gray-500 ml-1">(at least 1 required)</span>
                    </label>
                    <Upload
                      listType="picture-card"
                      fileList={entry.photos}
                      beforeUpload={() => false}
                      onChange={({ fileList }) => handlePhotoUpload(entry.id, fileList)}
                      multiple
                      accept="image/*"
                    >
                      {entry.photos.length < 5 && (
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>Upload</div>
                        </div>
                      )}
                    </Upload>
                  </div>
                </Col>
              </Row>
            </Card>
          ))}
        </div>

        {/* Overall Condition */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">
            Overall Condition
          </label>
          <Select
            style={{ width: '100%' }}
            value={overallCondition}
            onChange={setOverallCondition}
          >
            <Option value="excellent">Excellent</Option>
            <Option value="good">Good</Option>
            <Option value="fair">Fair</Option>
            <Option value="poor">Poor</Option>
          </Select>
        </div>

        {/* Notes */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">
            Notes (Optional)
          </label>
          <TextArea
            rows={3}
            placeholder="Add any additional notes about the quality check..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          <strong>Note:</strong> This quality check report will be shared with the admin and the customer ({order.userId?.name}).
        </div>
      </Modal>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Loading state
  // ─────────────────────────────────────────────────────────────────────────
  if (ordersLoading) {
    return (
      <Layout className="min-h-screen bg-gradient-to-br from-bg-main to-bg-elevated">
        <Navbar />
        <Content className="flex items-center justify-center p-8">
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Layout className="min-h-screen bg-gradient-to-br from-bg-main to-bg-elevated">
      <Navbar />
      <Content className="p-6 max-w-7xl mx-auto w-full">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gradient-primary mb-2">
                Quality Check
              </h1>
              <p className="text-text-secondary text-lg">
                Submit quality check reports for packed orders
              </p>
            </div>
            <Button
              type="default"
              onClick={() => navigate('/warehouse/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Packed Orders Table */}
        <Card className="card-modern-glass">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text-primary">
              Packed Orders
              {orders.length > 0 && (
                <Tag color="cyan" className="ml-2">{orders.length}</Tag>
              )}
            </h2>
            <Button onClick={loadOrders} loading={ordersLoading}>
              Refresh
            </Button>
          </div>
          <Table
            dataSource={orders}
            columns={orderColumns}
            rowKey="_id"
            loading={ordersLoading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 900 }}
            locale={{ emptyText: 'No packed orders available for quality check' }}
          />
        </Card>

        {/* Quality Check Modal */}
        {renderQualityCheckModal()}

      </Content>
      <Footer />
    </Layout>
  );
};

export default QualityCheckPage;
