import React, { useState, useEffect } from 'react';
import {
  Layout, Card, Statistic, Row, Col, Button, Table, Tag, Spin,
  Modal, Input, Tabs, Upload, Select, Form, Badge, Image, Descriptions
} from 'antd';
import appMessage from '../../utils/message';
import {
  CheckCircleOutlined, ClockCircleOutlined,
  FileTextOutlined, BuildOutlined, TruckOutlined,
  SafetyCertificateOutlined, PlusOutlined, EyeOutlined,
  DatabaseOutlined, ReloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const { Content } = Layout;
const { TextArea } = Input;
const { Option } = Select;

const STATUS_LABELS = {
  pending: 'Pending',
  assigned_to_warehouse: 'Assigned to You',
  packed: 'Packed',
  ready_for_pickup: 'Ready for Pickup',
  assigned_to_logistics: 'Assigned to Logistics',
  out_for_delivery: 'Out for Delivery',
  under_review: 'Under Review',
  delivered: 'Delivered'
};

const STATUS_COLORS = {
  pending: 'default',
  assigned_to_warehouse: 'blue',
  packed: 'cyan',
  ready_for_pickup: 'geekblue',
  assigned_to_logistics: 'purple',
  out_for_delivery: 'orange',
  under_review: 'gold',
  delivered: 'green'
};

const shortId = (id) => (id ? id.slice(-8) : '—');
const bundleTypes = (order) => (order.orderedBundles || []).map((b) => b.bundleName).join(', ') || '—';
const totalQty = (order) => (order.orderedBundles || []).reduce((s, b) => s + (b.quantity || 0), 0);

const WarehouseDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Bundle builder modal state
  const [buildBundlesModal, setBuildBundlesModal] = useState({ visible: false, order: null });
  const [bundleFormData, setBundleFormData] = useState({});
  const [bundleErrors, setBundleErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Quality check state
  const [qualityChecks, setQualityChecks] = useState([]);
  const [qcLoading, setQcLoading] = useState(false);
  const [qcModal, setQcModal] = useState({ visible: false, order: null });
  const [qcViewModal, setQcViewModal] = useState({ visible: false, record: null });
  const [qcForm] = Form.useForm();
  const [qcImages, setQcImages] = useState([]);
  const [qcSubmitting, setQcSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState('assigned');

  useEffect(() => {
    loadOrders();
    loadQualityChecks();
    loadInventoryItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Data loaders ────────────────────────────────────────────────────────────
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

  const loadQualityChecks = async () => {
    setQcLoading(true);
    try {
      const res = await api.get('/quality-checks');
      setQualityChecks(res.data.qualityChecks || []);
    } catch {
      appMessage.error('Failed to load quality checks');
    } finally {
      setQcLoading(false);
    }
  };

  // ── Bundle builder helpers ──────────────────────────────────────────────────
  const openBuildBundlesModal = (order) => {
    const initial = {};
    let idx = 0;
    (order.orderedBundles || []).forEach((ob) => {
      for (let q = 0; q < ob.quantity; q++) {
        initial[idx] = { skuCodes: '', bagId: '' };
        idx++;
      }
    });
    setBundleFormData(initial);
    setBundleErrors({});
    setBuildBundlesModal({ visible: true, order });
  };

  const closeBuildBundlesModal = () => {
    setBuildBundlesModal({ visible: false, order: null });
    setBundleFormData({});
    setBundleErrors({});
  };

  const updateBundleField = (idx, field, value) => {
    setBundleFormData((prev) => ({
      ...prev,
      [idx]: { ...prev[idx], [field]: value }
    }));
  };

  const isBundleFormComplete = () =>
    Object.values(bundleFormData).every(
      (entry) => entry.skuCodes.trim() !== '' && entry.bagId.trim() !== ''
    );

  const handleBuildBundlesSubmit = async () => {
    const order = buildBundlesModal.order;
    if (!order) return;
    setSubmitting(true);
    setBundleErrors({});
    try {
      const bundles = Object.values(bundleFormData).map((entry) => ({
        skuCodes: entry.skuCodes
          .split(/[\n,]+/)
          .map((s) => s.trim())
          .filter(Boolean),
        bagId: entry.bagId.trim()
      }));
      await api.post(`/orders/${order._id}/build-bundles`, { bundles });
      appMessage.success('Bundles built successfully!');
      closeBuildBundlesModal();
      loadOrders();
    } catch (error) {
      setBundleErrors({
        general:
          error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          'Failed to build bundles'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Mark ready for pickup ───────────────────────────────────────────────────
  const handleMarkReadyForPickup = async (order) => {
    try {
      await api.patch(`/orders/${order._id}/ready-for-pickup`);
      appMessage.success('Order marked as Ready for Pickup');
      loadOrders();
    } catch (error) {
      appMessage.error(
        error?.response?.data?.error?.message || 'Failed to update order'
      );
    }
  };

  // ─── Inventory state ─────────────────────────────────────────────────────────
  const [inventoryItems, setInventoryItems] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);

  const loadInventoryItems = async () => {
    setInventoryLoading(true);
    try {
      const res = await api.get('/inventory-management/items');
      setInventoryItems(res.data.items || []);
    } catch {
      appMessage.error('Failed to load inventory items');
    } finally {
      setInventoryLoading(false);
    }
  };

  // ─── Quality check handlers ──────────────────────────────────────────────────
  const openQcModal = (order) => {
    qcForm.resetFields();
    setQcImages([]);
    const bagIds = (order.builtBundles || []).map((b) => b.bagId).filter(Boolean).join(', ');
    const skus = (order.builtBundles || []).flatMap((b) => b.skuCodes || []).join(', ');
    const summary = (order.orderedBundles || [])
      .map((b) => `${b.quantity}x ${b.bundleName}`)
      .join(', ');
    qcForm.setFieldsValue({ bundleSummary: summary, bagIds, skuCodes: skus });
    setQcModal({ visible: true, order });
  };

  const handleQcSubmit = async (values) => {
    if (qcImages.length === 0) {
      appMessage.warning('Please upload at least one image');
      return;
    }
    setQcSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('orderId', qcModal.order._id);
      formData.append('bundleSummary', values.bundleSummary || '');
      formData.append('bagIds', values.bagIds || '');
      formData.append('skuCodes', values.skuCodes || '');
      formData.append('notes', values.notes || '');
      formData.append('overallCondition', values.overallCondition || 'good');
      qcImages.forEach((f) => formData.append('images', f.originFileObj));
      await api.post('/quality-checks', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      appMessage.success('Quality check submitted!');
      setQcModal({ visible: false, order: null });
      loadQualityChecks();
    } catch (error) {
      appMessage.error(
        error?.response?.data?.error?.message || 'Failed to submit quality check'
      );
    } finally {
      setQcSubmitting(false);
    }
  };

  // ── Derived order lists ─────────────────────────────────────────────────────
  const assignedOrders = orders.filter((o) => o.status === 'assigned_to_warehouse');
  const packedOrders = orders.filter((o) => o.status === 'packed');
  const readyForPickupOrders = orders.filter((o) => o.status === 'ready_for_pickup');

  // ── Column definitions ──────────────────────────────────────────────────────
  const baseOrderColumns = [
    {
      title: 'Order ID',
      key: 'orderId',
      render: (_, o) => (
        <Tag color="blue" className="font-mono">
          {shortId(o._id)}
        </Tag>
      )
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
          icon={<BuildOutlined />}
          onClick={() => openBuildBundlesModal(o)}
        >
          Build Bundles
        </Button>
      )
    }
  ];

  const packedColumns = [
    ...baseOrderColumns,
    {
      title: 'Action',
      key: 'action',
      render: (_, o) => (
        <div className="flex flex-wrap gap-2">
          <Button
            type="primary"
            size="small"
            icon={<TruckOutlined />}
            onClick={() => handleMarkReadyForPickup(o)}
            style={{ background: '#2563eb', borderColor: '#2563eb' }}
          >
            Mark Ready for Pickup
          </Button>
          <Button
            size="small"
            icon={<SafetyCertificateOutlined />}
            onClick={() => openQcModal(o)}
            style={{ borderColor: '#7c3aed', color: '#7c3aed' }}
          >
            Quality Check
          </Button>
        </div>
      )
    }
  ];

  const readyForPickupColumns = [
    ...baseOrderColumns,
    {
      title: 'Status',
      key: 'status',
      render: () => <Tag color="geekblue">Ready for Pickup</Tag>
    },
    {
      title: 'Updated At',
      key: 'updatedAt',
      render: (_, o) => (o.updatedAt ? new Date(o.updatedAt).toLocaleString() : '—')
    }
  ];

  // ── Build Bundles Modal ─────────────────────────────────────────────────────
  const renderBuildBundlesModal = () => {
    const order = buildBundlesModal.order;
    if (!order) return null;

    const units = [];
    let flatIdx = 0;
    (order.orderedBundles || []).forEach((ob) => {
      for (let q = 0; q < ob.quantity; q++) {
        units.push({ bundleName: ob.bundleName, unitIndex: q + 1, flatIndex: flatIdx });
        flatIdx++;
      }
    });

    return (
      <Modal
        title={`Build Bundles — Order #${shortId(order._id)}`}
        open={buildBundlesModal.visible}
        onCancel={closeBuildBundlesModal}
        footer={[
          <Button key="cancel" onClick={closeBuildBundlesModal}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitting}
            disabled={!isBundleFormComplete()}
            onClick={handleBuildBundlesSubmit}
          >
            Submit Bundles
          </Button>
        ]}
        width={640}
      >
        {bundleErrors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
            {bundleErrors.general}
          </div>
        )}
        {units.map((unit) => (
          <Card
            key={unit.flatIndex}
            size="small"
            className="mb-4"
            title={
              <span className="font-semibold">
                {unit.bundleName} — Unit {unit.unitIndex}
              </span>
            }
          >
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">
                SKU Codes <span className="text-red-500">*</span>
                <span className="text-xs text-gray-400 ml-1">(comma or newline separated)</span>
              </label>
              <TextArea
                rows={3}
                placeholder="e.g. SKU001, SKU002"
                value={bundleFormData[unit.flatIndex]?.skuCodes || ''}
                onChange={(e) => updateBundleField(unit.flatIndex, 'skuCodes', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Bag ID <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. BAG001"
                value={bundleFormData[unit.flatIndex]?.bagId || ''}
                onChange={(e) => updateBundleField(unit.flatIndex, 'bagId', e.target.value)}
              />
            </div>
          </Card>
        ))}
      </Modal>
    );
  };

  // ── Quality Check Modal ─────────────────────────────────────────────────────
  const renderQcModal = () => {
    const order = qcModal.order;
    if (!order) return null;

    return (
      <Modal
        title={
          <div className="flex items-center gap-2">
            <SafetyCertificateOutlined className="text-purple-600" />
            <span>Quality Check — Order #{order._id?.slice(-8)}</span>
          </div>
        }
        open={qcModal.visible}
        onCancel={() => setQcModal({ visible: false, order: null })}
        footer={null}
        width={620}
      >
        {/* Customer info */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="text-sm text-blue-700 font-medium">Customer</div>
          <div className="font-semibold">{order.userId?.name || '—'}</div>
          <div className="text-sm text-gray-500">{order.userId?.email || ''}</div>
        </div>

        <Form form={qcForm} layout="vertical" onFinish={handleQcSubmit}>
          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item label="Bundle Summary" name="bundleSummary">
                <Input placeholder="e.g. 2x Bedroom Bundle" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Overall Condition"
                name="overallCondition"
                initialValue="good"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="excellent">✅ Excellent</Option>
                  <Option value="good">👍 Good</Option>
                  <Option value="fair">⚠️ Fair</Option>
                  <Option value="poor">❌ Poor</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item label="Bag IDs" name="bagIds">
                <Input placeholder="e.g. BAG001, BAG002" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="SKU Codes" name="skuCodes">
                <Input placeholder="e.g. SKU001, SKU002" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Notes / Observations" name="notes">
            <TextArea
              rows={3}
              placeholder="Any quality observations, damage notes, or special remarks..."
            />
          </Form.Item>

          <Form.Item
            label={
              <span>
                Item Photos <span className="text-red-500">*</span>
                <span className="text-xs text-gray-400 ml-1">(min 1, max 10)</span>
              </span>
            }
          >
            <Upload
              listType="picture-card"
              fileList={qcImages}
              beforeUpload={() => false}
              onChange={({ fileList }) => setQcImages(fileList)}
              multiple
              accept="image/*"
            >
              {qcImages.length < 10 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <div className="flex justify-end gap-3 mt-2">
            <Button onClick={() => setQcModal({ visible: false, order: null })}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={qcSubmitting}
              disabled={qcImages.length === 0}
              icon={<SafetyCertificateOutlined />}
              style={{ background: '#7c3aed', borderColor: '#7c3aed' }}
            >
              Submit Quality Check
            </Button>
          </div>
        </Form>
      </Modal>
    );
  };

  // ── QC View Modal ───────────────────────────────────────────────────────────
  const renderQcViewModal = () => {
    const rec = qcViewModal.record;
    if (!rec) return null;
    const conditionColors = { excellent: 'green', good: 'blue', fair: 'orange', poor: 'red' };

    return (
      <Modal
        title={
          <div className="flex items-center gap-2">
            <SafetyCertificateOutlined className="text-purple-600" />
            <span>Quality Check Details</span>
          </div>
        }
        open={qcViewModal.visible}
        onCancel={() => setQcViewModal({ visible: false, record: null })}
        footer={
          <Button onClick={() => setQcViewModal({ visible: false, record: null })}>
            Close
          </Button>
        }
        width={680}
      >
        <Descriptions bordered column={1} size="small" className="mb-4">
          <Descriptions.Item label="Customer">
            {rec.userId?.name || '—'}{' '}
            <span className="text-gray-400 text-xs">({rec.userId?.email})</span>
          </Descriptions.Item>
          <Descriptions.Item label="Order ID">
            <Tag color="blue" className="font-mono">
              {rec.orderId?._id?.slice(-8) || rec.orderId?.slice?.(-8) || '—'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Bundle Summary">{rec.bundleSummary || '—'}</Descriptions.Item>
          <Descriptions.Item label="Bag IDs">{rec.bagIds?.join(', ') || '—'}</Descriptions.Item>
          <Descriptions.Item label="SKU Codes">{rec.skuCodes?.join(', ') || '—'}</Descriptions.Item>
          <Descriptions.Item label="Overall Condition">
            <Tag color={conditionColors[rec.overallCondition] || 'default'}>
              {rec.overallCondition?.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Notes">{rec.notes || '—'}</Descriptions.Item>
          <Descriptions.Item label="Submitted">
            {new Date(rec.createdAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Admin Reviewed">
            {rec.reviewedByAdmin ? (
              <Tag color="green">Reviewed</Tag>
            ) : (
              <Tag color="orange">Pending Review</Tag>
            )}
          </Descriptions.Item>
          {rec.adminNotes && (
            <Descriptions.Item label="Admin Notes">{rec.adminNotes}</Descriptions.Item>
          )}
        </Descriptions>

        {rec.images?.length > 0 && (
          <div>
            <div className="font-medium text-gray-700 mb-2">
              Photos ({rec.images.length})
            </div>
            <Image.PreviewGroup>
              <div className="flex flex-wrap gap-2">
                {rec.images.map((url, i) => (
                  <Image
                    key={i}
                    src={url}
                    width={100}
                    height={100}
                    style={{ objectFit: 'cover', borderRadius: 8 }}
                  />
                ))}
              </div>
            </Image.PreviewGroup>
          </div>
        )}
      </Modal>
    );
  };

  // ── Loading check ───────────────────────────────────────────────────────────
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

  // ── Tab items ───────────────────────────────────────────────────────────────
  const tabItems = [
    {
      key: 'assigned',
      label: (
        <span>
          <BuildOutlined />
          {' '}Assigned Orders
          {assignedOrders.length > 0 && (
            <Tag color="blue" className="ml-2">
              {assignedOrders.length}
            </Tag>
          )}
        </span>
      ),
      children: (
        <Card className="card-modern-glass">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Assigned Orders</h2>
            <Button onClick={loadOrders} loading={ordersLoading}>
              Refresh
            </Button>
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
      key: 'packed',
      label: (
        <span>
          <CheckCircleOutlined />
          {' '}Packed Orders
          {packedOrders.length > 0 && (
            <Tag color="cyan" className="ml-2">
              {packedOrders.length}
            </Tag>
          )}
        </span>
      ),
      children: (
        <Card className="card-modern-glass">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Packed Orders</h2>
            <Button onClick={loadOrders} loading={ordersLoading}>
              Refresh
            </Button>
          </div>
          <Table
            dataSource={packedOrders}
            columns={packedColumns}
            rowKey="_id"
            loading={ordersLoading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 700 }}
            locale={{ emptyText: 'No packed orders' }}
          />
        </Card>
      )
    },
    {
      key: 'ready_for_pickup',
      label: (
        <span>
          <ClockCircleOutlined />
          {' '}Ready for Pickup
          {readyForPickupOrders.length > 0 && (
            <Tag color="geekblue" className="ml-2">
              {readyForPickupOrders.length}
            </Tag>
          )}
        </span>
      ),
      children: (
        <Card className="card-modern-glass">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Ready for Pickup</h2>
            <Button onClick={loadOrders} loading={ordersLoading}>
              Refresh
            </Button>
          </div>
          <Table
            dataSource={readyForPickupOrders}
            columns={readyForPickupColumns}
            rowKey="_id"
            loading={ordersLoading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 700 }}
            locale={{ emptyText: 'No orders ready for pickup' }}
          />
        </Card>
      )
    },
    {
      key: 'reports',
      label: (
        <span>
          <FileTextOutlined />
          {' '}Pickup Reports
        </span>
      ),
      children: (
        <Card className="card-modern-glass">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Pickup Reports</h2>
            <Button
              type="primary"
              onClick={() => navigate('/warehouse/submit-report')}
            >
              Submit New Report
            </Button>
          </div>
          <p className="text-gray-500">
            Navigate to Submit Report to file a new pickup report.
          </p>
        </Card>
      )
    },
    {
      key: 'inventory',
      label: (
        <span>
          <DatabaseOutlined />
          {' '}Inventory
          {inventoryItems.length > 0 && (
            <Tag color="geekblue" className="ml-2">{inventoryItems.length}</Tag>
          )}
        </span>
      ),
      children: (
        <Card className="card-modern-glass">
          <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
            <h2 className="text-xl font-bold">My Inventory Items</h2>
            <Button icon={<ReloadOutlined />} onClick={loadInventoryItems} loading={inventoryLoading}>
              Refresh
            </Button>
          </div>
          <Table
            dataSource={inventoryItems}
            rowKey="_id"
            loading={inventoryLoading}
            pagination={{ pageSize: 15, responsive: true }}
            scroll={{ x: 800 }}
            locale={{ emptyText: 'No inventory items yet — build bundles to populate' }}
            columns={[
              {
                title: 'SKU Code',
                dataIndex: 'skuCode',
                key: 'skuCode',
                fixed: 'left',
                render: v => <Tag color="blue" className="font-mono font-bold">{v}</Tag>
              },
              {
                title: 'Category',
                key: 'category',
                render: (_, r) => r.categoryId?.name || '—'
              },
              {
                title: 'Bundle',
                key: 'bundle',
                render: (_, r) => r.bundleId?.name || '—'
              },
              {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: v => {
                  const colors = { in_stock: 'green', out_of_stock: 'orange', dismantled: 'red', dispatched: 'cyan', with_customer: 'blue', pickup_pending: 'gold', damaged: 'volcano', retired: 'default' };
                  return <Tag color={colors[v] || 'default'}>{v?.replace(/_/g, ' ').toUpperCase()}</Tag>;
                }
              },
              {
                title: 'Bundle ID',
                dataIndex: 'bundleBuiltId',
                key: 'bundleBuiltId',
                render: v => v ? <Tag color="purple" className="font-mono text-xs">{v}</Tag> : <span className="text-gray-400">—</span>
              },
              {
                title: 'Bag ID',
                dataIndex: 'bagMarking',
                key: 'bagMarking',
                render: v => v ? <Tag>{v}</Tag> : <span className="text-gray-400">—</span>
              },
              {
                title: 'Dispatch Date',
                dataIndex: 'dispatchDate',
                key: 'dispatchDate',
                render: (v, r) => r.status === 'out_of_stock' && v
                  ? <Tag color="orange">{new Date(v).toLocaleDateString('en-IN')}</Tag>
                  : <span className="text-gray-400">—</span>
              }
            ]}
          />
        </Card>
      )
    },
    {
      key: 'quality',
      label: (
        <span>
          <SafetyCertificateOutlined />
          {' '}Quality Checks
          {qualityChecks.filter((q) => !q.reviewedByAdmin).length > 0 && (
            <Badge
              count={qualityChecks.filter((q) => !q.reviewedByAdmin).length}
              size="small"
              className="ml-2"
              style={{ backgroundColor: '#7c3aed' }}
            />
          )}
        </span>
      ),
      children: (
        <Card className="card-modern-glass">
          <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
            <h2 className="text-xl font-bold">Quality Check Reports</h2>
            <Button
              icon={<SafetyCertificateOutlined />}
              onClick={loadQualityChecks}
              loading={qcLoading}
            >
              Refresh
            </Button>
          </div>
          <Table
            dataSource={qualityChecks}
            rowKey="_id"
            loading={qcLoading}
            pagination={{ pageSize: 10, responsive: true }}
            scroll={{ x: 600 }}
            locale={{ emptyText: 'No quality checks submitted yet' }}
            columns={[
              {
                title: 'Order ID',
                key: 'orderId',
                render: (_, r) => (
                  <Tag color="purple" className="font-mono">
                    {r.orderId?._id?.slice(-8) || '—'}
                  </Tag>
                )
              },
              {
                title: 'Customer',
                key: 'customer',
                responsive: ['md'],
                render: (_, r) => (
                  <div>
                    <div className="font-medium">{r.userId?.name || '—'}</div>
                    <div className="text-xs text-gray-400">{r.userId?.email}</div>
                  </div>
                )
              },
              {
                title: 'Bundle',
                dataIndex: 'bundleSummary',
                key: 'bundle',
                responsive: ['lg'],
                render: (v) => v || '—'
              },
              {
                title: 'Condition',
                key: 'condition',
                render: (_, r) => {
                  const colors = { excellent: 'green', good: 'blue', fair: 'orange', poor: 'red' };
                  return (
                    <Tag color={colors[r.overallCondition] || 'default'}>
                      {r.overallCondition?.toUpperCase()}
                    </Tag>
                  );
                }
              },
              {
                title: 'Photos',
                key: 'photos',
                render: (_, r) => (
                  <span className="text-gray-500 text-sm">{r.images?.length || 0} photo(s)</span>
                )
              },
              {
                title: 'Admin Review',
                key: 'reviewed',
                render: (_, r) =>
                  r.reviewedByAdmin ? (
                    <Tag color="green">Reviewed</Tag>
                  ) : (
                    <Tag color="orange">Pending</Tag>
                  )
              },
              {
                title: 'Submitted',
                key: 'date',
                responsive: ['md'],
                render: (_, r) => new Date(r.createdAt).toLocaleDateString()
              },
              {
                title: 'Action',
                key: 'action',
                render: (_, r) => (
                  <Button
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => setQcViewModal({ visible: true, record: r })}
                  >
                    View
                  </Button>
                )
              }
            ]}
          />
        </Card>
      )
    }
  ];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <Layout className="min-h-screen bg-gradient-to-br from-bg-main to-bg-elevated">
      <Navbar />
      <Content className="p-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient-primary mb-2">
            Warehouse Dashboard
          </h1>
          <p className="text-gray-500 text-lg">
            Welcome back, {user?.name}! Manage your warehouse orders.
          </p>
        </div>

        {/* Summary Stats */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={8}>
            <Card className="card-modern-glass">
              <Statistic
                title="Total Assigned"
                value={assignedOrders.length}
                prefix={<BuildOutlined style={{ color: '#2563EB' }} />}
                valueStyle={{ color: '#2563EB' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="card-modern-glass">
              <Statistic
                title="Total Packed"
                value={packedOrders.length}
                prefix={<CheckCircleOutlined style={{ color: '#06b6d4' }} />}
                valueStyle={{ color: '#06b6d4' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="card-modern-glass">
              <Statistic
                title="Total Ready for Pickup"
                value={readyForPickupOrders.length}
                prefix={<TruckOutlined style={{ color: '#4f46e5' }} />}
                valueStyle={{ color: '#4f46e5' }}
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

        {renderBuildBundlesModal()}
        {renderQcModal()}
        {renderQcViewModal()}
      </Content>
      <Footer />
    </Layout>
  );
};

export default WarehouseDashboard;
