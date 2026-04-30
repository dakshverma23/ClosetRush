import React, { useState, useEffect } from 'react';
import {
  Layout, Card, Statistic, Row, Col, Button, Table, Tag, Spin,
  Modal, Input, Upload, Tabs, Select
} from 'antd';
import appMessage from '../../utils/message';
import {
  CameraOutlined, CheckCircleOutlined, ClockCircleOutlined,
  FileTextOutlined, PlusOutlined, WarningOutlined,
  InboxOutlined, TruckOutlined, BuildOutlined, UserOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const { Content } = Layout;
const { TextArea } = Input;
const { Option } = Select;

// ─── Status label / colour maps (8-stage lifecycle) ──────────────────────────
const STATUS_LABELS = {
  pending:                'Preparing',
  assigned_to_warehouse:  'Assigned to You',
  packed:                 'Packed',
  ready_for_pickup:       'Ready to Hand Over',
  assigned_to_logistics:  'Assigned to Logistics',
  out_for_delivery:       'Out for Delivery',
  under_review:           'Under Review',
  delivered:              'Delivered'
};

const STATUS_COLORS = {
  pending:                'default',
  assigned_to_warehouse:  'blue',
  packed:                 'cyan',
  ready_for_pickup:       'purple',
  assigned_to_logistics:  'orange',
  out_for_delivery:       'orange',
  under_review:           'purple',
  delivered:              'green'
};

// ─── Helper: short ID ─────────────────────────────────────────────────────────
const shortId = (id) => (id ? id.slice(-8) : '—');

// ─── Helper: bundle type summary ──────────────────────────────────────────────
const bundleTypes = (order) =>
  (order.orderedBundles || []).map((b) => b.bundleName).join(', ') || '—';

// ─── Helper: total qty ────────────────────────────────────────────────────────
const totalQty = (order) =>
  (order.orderedBundles || []).reduce((s, b) => s + (b.quantity || 0), 0);

// ─── Main Component ───────────────────────────────────────────────────────────
const WarehouseDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ── Orders state ─────────────────────────────────────────────────────────
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // ── Logistics partners state ─────────────────────────────────────────────
  const [logisticsPartners, setLogisticsPartners] = useState([]);
  const [logisticsLoading, setLogisticsLoading] = useState(false);

  // ── Bundle Builder modal state ───────────────────────────────────────────
  const [buildBundlesModal, setBuildBundlesModal] = useState({ visible: false, order: null });
  const [bundleFormData, setBundleFormData] = useState({});
  const [bundleErrors, setBundleErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // ── Assign Logistics modal state ─────────────────────────────────────────
  const [assignLogisticsModal, setAssignLogisticsModal] = useState({ visible: false, order: null });
  const [selectedLogisticsPartner, setSelectedLogisticsPartner] = useState(null);

  // ── Active tab ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('assigned');

  // ─────────────────────────────────────────────────────────────────────────
  // Data loading
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    loadOrders();
    loadLogisticsPartners();
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

  const loadLogisticsPartners = async () => {
    setLogisticsLoading(true);
    try {
      const response = await api.get('/logistics-partners?status=approved');
      setLogisticsPartners(response.data.users || []);
    } catch (error) {
      console.error('Failed to load logistics partners:', error);
    } finally {
      setLogisticsLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Derived order lists
  // ─────────────────────────────────────────────────────────────────────────
  const assignedOrders      = orders.filter((o) => o.status === 'assigned_to_warehouse');
  const packedOrders        = orders.filter((o) => o.status === 'packed');
  const readyForPickupOrders = orders.filter((o) => o.status === 'ready_for_pickup');

  // ─────────────────────────────────────────────────────────────────────────
  // Mark Ready for Pickup (replaces Mark Out for Delivery)
  // ─────────────────────────────────────────────────────────────────────────
  const handleMarkReadyForPickup = async (order) => {
    try {
      await api.patch(`/orders/${order._id}/ready-for-pickup`);
      appMessage.success('Order marked as Ready to Hand Over');
      loadOrders();
    } catch (error) {
      appMessage.error(
        error?.error?.message || error?.response?.data?.message || 'Failed to update order'
      );
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Assign Logistics Partner
  // ─────────────────────────────────────────────────────────────────────────
  const openAssignLogisticsModal = (order) => {
    setSelectedLogisticsPartner(null);
    setAssignLogisticsModal({ visible: true, order });
  };

  const closeAssignLogisticsModal = () => {
    setAssignLogisticsModal({ visible: false, order: null });
    setSelectedLogisticsPartner(null);
  };

  const handleAssignLogistics = async () => {
    const order = assignLogisticsModal.order;
    if (!order || !selectedLogisticsPartner) return;
    setSubmitting(true);
    try {
      await api.post(`/orders/${order._id}/assign-logistics-wh`, {
        logisticsPartnerId: selectedLogisticsPartner
      });
      appMessage.success('Logistics partner assigned successfully!');
      closeAssignLogisticsModal();
      loadOrders();
    } catch (error) {
      appMessage.error(
        error?.error?.message ||
        error?.response?.data?.message ||
        'Failed to assign logistics partner'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Bundle Builder helpers
  // ─────────────────────────────────────────────────────────────────────────
  const openBuildBundlesModal = (order) => {
    // Initialise form data: one entry per bundle unit (quantity times per bundle type)
    const initial = {};
    let idx = 0;
    (order.orderedBundles || []).forEach((ob) => {
      for (let q = 0; q < ob.quantity; q++) {
        initial[idx] = { skuCodes: '' };
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

  const isBundleFormComplete = () => {
    return Object.values(bundleFormData).every(
      (entry) => entry.skuCodes.trim() !== ''
    );
  };

  const handleBuildBundlesSubmit = async () => {
    const order = buildBundlesModal.order;
    if (!order) return;
    setSubmitting(true);
    setBundleErrors({});
    try {
      // Build the bundles array: parse SKU codes (comma or newline separated)
      const bundles = Object.values(bundleFormData).map((entry) => ({
        skuCodes: entry.skuCodes
          .split(/[\n,]+/)
          .map((s) => s.trim())
          .filter(Boolean)
      }));

      // Prompt for order-level bag ID
      const bagId = prompt('Enter Bag ID for this order:');
      if (!bagId || !bagId.trim()) {
        appMessage.warning('Bag ID is required');
        setSubmitting(false);
        return;
      }

      await api.post(`/orders/${order._id}/build-bundles`, { bundles, bagId: bagId.trim() });
      appMessage.success('Bundles built successfully!');
      closeBuildBundlesModal();
      loadOrders();
    } catch (error) {
      const errMsg =
        error?.error?.message ||
        error?.response?.data?.message ||
        'Failed to build bundles';
      setBundleErrors({ general: errMsg });
    } finally {
      setSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Table column definitions
  // ─────────────────────────────────────────────────────────────────────────

  // Shared base columns for order tables
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

  // Assigned orders columns
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
          className="btn-modern-primary"
        >
          Build Bundles
        </Button>
      )
    }
  ];

  // Packed orders columns
  const packedColumns = [
    ...baseOrderColumns,
    {
      title: 'Action',
      key: 'action',
      render: (_, o) => (
        <Button
          type="primary"
          size="small"
          icon={<CheckCircleOutlined />}
          onClick={() => handleMarkReadyForPickup(o)}
          className="btn-modern-primary"
        >
          Mark Ready to Hand Over
        </Button>
      )
    }
  ];

  // Ready for pickup columns (with assign logistics action)
  const readyForPickupColumns = [
    ...baseOrderColumns,
    {
      title: 'Action',
      key: 'action',
      render: (_, o) => (
        <Button
          type="primary"
          size="small"
          icon={<UserOutlined />}
          onClick={() => openAssignLogisticsModal(o)}
          className="btn-modern-primary"
        >
          Assign Logistics Partner
        </Button>
      )
    }
  ];

  // ─────────────────────────────────────────────────────────────────────────
  // Bundle Builder Modal — render helper
  // ─────────────────────────────────────────────────────────────────────────
  const renderBuildBundlesModal = () => {
    const order = buildBundlesModal.order;
    if (!order) return null;

    // Build a flat list of bundle units: [{bundleName, unitIndex, flatIndex}]
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
            className="btn-modern-primary"
          >
            Submit Bundles
          </Button>
        ]}
        width={640}
        destroyOnClose
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
            className="card-modern-glass mb-4"
            title={
              <span className="font-semibold">
                {unit.bundleName} — Unit {unit.unitIndex}
              </span>
            }
          >
            <div className="mb-3">
              <label className="block text-sm font-medium text-text-secondary mb-1">
                SKU Codes <span className="text-red-500">*</span>
                <span className="text-xs text-text-secondary ml-1">(comma or newline separated)</span>
              </label>
              <TextArea
                rows={3}
                placeholder="e.g. SKU001, SKU002"
                value={bundleFormData[unit.flatIndex]?.skuCodes || ''}
                onChange={(e) => updateBundleField(unit.flatIndex, 'skuCodes', e.target.value)}
              />
              {bundleErrors[`sku_${unit.flatIndex}`] && (
                <p className="text-red-500 text-xs mt-1">{bundleErrors[`sku_${unit.flatIndex}`]}</p>
              )}
            </div>
          </Card>
        ))}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
          <strong>Note:</strong> You will be prompted to enter a Bag ID for this order after clicking Submit.
        </div>
      </Modal>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Assign Logistics Modal — render helper
  // ─────────────────────────────────────────────────────────────────────────
  const renderAssignLogisticsModal = () => {
    const order = assignLogisticsModal.order;
    if (!order) return null;

    return (
      <Modal
        title={`Assign Logistics Partner — Order #${shortId(order._id)}`}
        open={assignLogisticsModal.visible}
        onCancel={closeAssignLogisticsModal}
        footer={[
          <Button key="cancel" onClick={closeAssignLogisticsModal}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitting}
            disabled={!selectedLogisticsPartner}
            onClick={handleAssignLogistics}
            className="btn-modern-primary"
          >
            Assign
          </Button>
        ]}
        width={480}
        destroyOnClose
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Select Logistics Partner <span className="text-red-500">*</span>
          </label>
          <Select
            style={{ width: '100%' }}
            placeholder="Choose a logistics partner"
            value={selectedLogisticsPartner}
            onChange={setSelectedLogisticsPartner}
            loading={logisticsLoading}
          >
            {logisticsPartners.map((lp) => (
              <Option key={lp._id} value={lp._id}>
                {lp.name} ({lp.email})
              </Option>
            ))}
          </Select>
        </div>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded text-sm">
          <p><strong>Order Details:</strong></p>
          <p>Bundle Types: {bundleTypes(order)}</p>
          <p>Quantity: {totalQty(order)}</p>
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
  // Tab items
  // ─────────────────────────────────────────────────────────────────────────
  const tabItems = [
    // ── Tab 1: Assigned Orders ──────────────────────────────────────────────
    {
      key: 'assigned',
      label: (
        <span>
          <BuildOutlined />
          Assigned Orders
          {assignedOrders.length > 0 && (
            <Tag color="blue" className="ml-2">{assignedOrders.length}</Tag>
          )}
        </span>
      ),
      children: (
        <Card className="card-modern-glass">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text-primary">Assigned Orders</h2>
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

    // ── Tab 2: Packed Orders ────────────────────────────────────────────────
    {
      key: 'packed',
      label: (
        <span>
          <CheckCircleOutlined />
          Packed Orders
          {packedOrders.length > 0 && (
            <Tag color="cyan" className="ml-2">{packedOrders.length}</Tag>
          )}
        </span>
      ),
      children: (
        <Card className="card-modern-glass">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text-primary">Packed Orders</h2>
            <Button onClick={loadOrders} loading={ordersLoading}>Refresh</Button>
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

    // ── Tab 3: Ready to Hand Over (with logistics assignment) ───────────────
    {
      key: 'ready_for_pickup',
      label: (
        <span>
          <TruckOutlined />
          Ready to Hand Over
          {readyForPickupOrders.length > 0 && (
            <Tag color="purple" className="ml-2">{readyForPickupOrders.length}</Tag>
          )}
        </span>
      ),
      children: (
        <Card className="card-modern-glass">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text-primary">Ready to Hand Over</h2>
            <Button onClick={loadOrders} loading={ordersLoading}>Refresh</Button>
          </div>
          <Table
            dataSource={readyForPickupOrders}
            columns={readyForPickupColumns}
            rowKey="_id"
            loading={ordersLoading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 700 }}
            locale={{ emptyText: 'No orders ready to hand over' }}
          />
        </Card>
      )
    },

    // ── Tab 4: Quality Check ────────────────────────────────────────────────
    {
      key: 'quality_check',
      label: (
        <span>
          <CameraOutlined />
          Quality Check
        </span>
      ),
      children: (
        <Card className="card-modern-glass">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text-primary">Quality Check</h2>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/warehouse/quality-check')}
              className="btn-modern-primary"
            >
              Go to Quality Check
            </Button>
          </div>
          <div className="p-6 text-center text-text-secondary">
            <CameraOutlined style={{ fontSize: 48, marginBottom: 16 }} />
            <p className="text-lg">Submit quality check reports for packed orders</p>
            <p className="text-sm mt-2">Click the button above to access the quality check form</p>
            <ul className="text-left mt-4 space-y-2 max-w-md mx-auto">
              <li>✓ View all packed orders</li>
              <li>✓ Add photos for each SKU with proper labeling</li>
              <li>✓ Reports are shared with admin and customers</li>
            </ul>
          </div>
        </Card>
      )
    }
  ];

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Layout className="min-h-screen bg-gradient-to-br from-bg-main to-bg-elevated">
      <Navbar />
      <Content className="p-6 max-w-7xl mx-auto w-full">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient-primary mb-2">
            Warehouse Dashboard
          </h1>
          <p className="text-text-secondary text-lg">
            Welcome back, {user?.name}! Manage your warehouse operations.
          </p>
        </div>

        {/* Summary Statistics — Order counts */}
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
                title="Ready to Hand Over"
                value={readyForPickupOrders.length}
                prefix={<TruckOutlined style={{ color: '#8b5cf6' }} />}
                valueStyle={{ color: '#8b5cf6' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Tabbed sections */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          type="card"
          size="large"
        />

        {/* Modals */}
        {renderBuildBundlesModal()}
        {renderAssignLogisticsModal()}

      </Content>
      <Footer />
    </Layout>
  );
};

export default WarehouseDashboard;
