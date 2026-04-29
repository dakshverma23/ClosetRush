import React, { useState, useEffect } from 'react';
import {
  Card, Table, Tag, Button, Modal, Form, Input, Select, InputNumber,
  Tabs, Statistic, Row, Col, Badge, Tooltip, message as staticMessage,
  Descriptions, Image, Divider, Space, Progress, Typography, App
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  CheckCircleOutlined, WarningOutlined, InboxOutlined,
  BarChartOutlined, HomeOutlined, TagOutlined, CameraOutlined,
  ReloadOutlined, UserOutlined, PhoneOutlined, MailOutlined,
  ShoppingOutlined, DatabaseOutlined
} from '@ant-design/icons';
import api from '../../services/api';

const { Title, Text } = Typography;

const { Option } = Select;
const { TextArea } = Input;

// ── Status colours ────────────────────────────────────────────────────────────
const STATUS_COLOR = {
  in_stock:       'green',
  out_of_stock:   'orange',
  dismantled:     'red',
  dispatched:     'cyan',
  with_customer:  'blue',
  pickup_pending: 'gold',
  in_laundry:     'purple',
  damaged:        'volcano',
  retired:        'default'
};
const CONDITION_COLOR = {
  new: 'green', good: 'cyan', fair: 'gold', worn: 'orange', damaged: 'red'
};
const WEAR_COLOR = {
  none: 'green', minor: 'cyan', moderate: 'gold', heavy: 'orange', damaged: 'red'
};
const SUB_STATUS_COLOR = {
  active: 'green', paused: 'orange', cancelled: 'red'
};

export default function InventoryManagementPage() {
  const { message } = App.useApp();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders]       = useState([]);
  const [items, setItems]         = useState([]);
  const [reports, setReports]     = useState([]);
  const [pgSummary, setPgSummary] = useState([]);
  const [stats, setStats]         = useState(null);
  const [bundles, setBundles]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]     = useState(false);

  // Modals
  const [itemModal, setItemModal]             = useState(false);
  const [editItem, setEditItem]               = useState(null);
  const [reportModal, setReportModal]         = useState(false);
  const [viewReport, setViewReport]           = useState(null);
  const [viewItem, setViewItem]               = useState(null);
  const [itemDetailModal, setItemDetailModal] = useState(false);
  const [orderDetailModal, setOrderDetailModal] = useState(false);
  const [viewOrder, setViewOrder]             = useState(null);

  const [itemForm]   = Form.useForm();
  const [filterForm] = Form.useForm();

  // ── Load data ───────────────────────────────────────────────────────────────
  const loadAll = async () => {
    setLoading(true);
    try {
      const [oRes, iRes, rRes, pgRes, stRes, bRes, cRes] = await Promise.allSettled([
        api.get('/inventory-management/orders'),
        api.get('/inventory-management/items'),
        api.get('/inventory-management/reports'),
        api.get('/inventory-management/pg-summary'),
        api.get('/inventory-management/stats'),
        api.get('/bundles'),
        api.get('/categories')
      ]);

      if (oRes.status  === 'fulfilled') setOrders(oRes.value.data.orders || []);
      if (iRes.status  === 'fulfilled') setItems(iRes.value.data.items || []);
      if (rRes.status  === 'fulfilled') setReports(rRes.value.data.reports || []);
      if (pgRes.status === 'fulfilled') setPgSummary(pgRes.value.data.summary || []);
      if (stRes.status === 'fulfilled') setStats(stRes.value.data);
      if (bRes.status  === 'fulfilled') setBundles(bRes.value.data.bundles || []);
      if (cRes.status  === 'fulfilled') setCategories(cRes.value.data.categories || []);

      // Check if inventory-management routes failed (backend not restarted)
      if (oRes.status === 'rejected' || iRes.status === 'rejected') {
        message.warning('Some inventory data unavailable — please restart the backend server.');
      }
    } catch {
      message.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  // ── Save item ───────────────────────────────────────────────────────────────
  const handleSaveItem = async (values) => {
    try {
      if (editItem) {
        await api.put(`/inventory-management/items/${editItem._id}`, values);
        message.success('Item updated');
      } else {
        await api.post('/inventory-management/items', values);
        message.success('Item created');
      }
      setItemModal(false);
      itemForm.resetFields();
      setEditItem(null);
      loadAll();
    } catch (e) {
      message.error(e.response?.data?.error?.message || 'Failed to save item');
    }
  };

  const handleDeleteItem = (id) => {
    Modal.confirm({
      title: 'Delete this inventory item?',
      okType: 'danger',
      onOk: async () => {
        await api.delete(`/inventory-management/items/${id}`);
        message.success('Deleted');
        loadAll();
      }
    });
  };

  const handleVerifyReport = async (id) => {
    await api.patch(`/inventory-management/reports/${id}/verify`, {});
    message.success('Report verified');
    loadAll();
  };

  // ── Columns ─────────────────────────────────────────────────────────────────
  const orderColumns = [
    {
      title: 'Bundle Order ID',
      dataIndex: 'bundleOrderId',
      key: 'bundleOrderId',
      fixed: 'left',
      render: v => (
        <Tag
          color="blue"
          style={{
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: 1,
            padding: '2px 10px',
            borderRadius: 6
          }}
        >
          {v || '—'}
        </Tag>
      )
    },
    {
      title: 'User ID',
      dataIndex: ['userId', '_id'],
      key: 'userId',
      render: (v, r) => (
        <Tooltip title="Copy User ID">
          <Tag
            style={{ fontFamily: 'monospace', fontSize: 11, cursor: 'pointer', maxWidth: 120 }}
            onClick={() => {
              const id = v || r.userId?._id;
              if (id) { navigator.clipboard.writeText(id); message.success('User ID copied!'); }
            }}
          >
            {(v || r.userId?._id || '—').toString().slice(-8).toUpperCase()}
          </Tag>
        </Tooltip>
      )
    },
    {
      title: 'User Name',
      dataIndex: ['userId', 'name'],
      key: 'userName',
      render: v => v || '—'
    },
    {
      title: 'Phone',
      dataIndex: ['userId', 'mobile'],
      key: 'userPhone',
      render: v => v ? (
        <Space size={4}>
          <PhoneOutlined className="text-gray-400" />
          <span>{v}</span>
        </Space>
      ) : '—'
    },
    {
      title: 'Email',
      dataIndex: ['userId', 'email'],
      key: 'userEmail',
      render: v => v ? (
        <Space size={4}>
          <MailOutlined className="text-gray-400" />
          <span className="text-xs">{v}</span>
        </Space>
      ) : '—'
    },
    {
      title: 'Bundle Name',
      dataIndex: ['bundleId', 'name'],
      key: 'bundleName',
      render: v => v || '—'
    },
    {
      title: 'Duration',
      dataIndex: 'billingCycle',
      key: 'billingCycle',
      render: v => v ? v.charAt(0).toUpperCase() + v.slice(1) : '—'
    },
    {
      title: 'Final Price',
      dataIndex: 'finalPrice',
      key: 'finalPrice',
      render: v => v != null ? `₹${v}` : '—'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: v => (
        <Tag color={SUB_STATUS_COLOR[v] || 'default'}>
          {v ? v.toUpperCase() : '—'}
        </Tag>
      )
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: v => v ? new Date(v).toLocaleDateString('en-IN') : '—'
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      render: v => v ? new Date(v).toLocaleDateString('en-IN') : '—'
    },
    {
      title: 'Delivery Address',
      dataIndex: 'deliveryAddress',
      key: 'deliveryAddress',
      render: (v, r) => {
        const addr = v || r.userId?.address;
        return addr ? (
          <Tooltip title={addr}>
            <span className="text-xs text-gray-600 max-w-xs truncate block" style={{ maxWidth: 160 }}>
              {addr}
            </span>
          </Tooltip>
        ) : '—';
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, r) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => { setViewOrder(r); setOrderDetailModal(true); }}
        >
          View
        </Button>
      )
    }
  ];

  const itemColumns = [
    {
      title: 'SKU Code', dataIndex: 'skuCode', key: 'skuCode', fixed: 'left',
      render: v => <Tag color="blue" className="font-mono font-bold">{v}</Tag>
    },
    {
      title: 'Category', dataIndex: ['categoryId', 'name'], key: 'category',
      render: v => v || '—'
    },
    {
      title: 'Bundle', dataIndex: ['bundleId', 'name'], key: 'bundle',
      render: v => v || '—'
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: v => <Tag color={STATUS_COLOR[v] || 'default'}>{v?.replace(/_/g, ' ').toUpperCase()}</Tag>
    },
    {
      title: 'Bundle ID',
      dataIndex: 'bundleBuiltId',
      key: 'bundleBuiltId',
      render: v => v
        ? <Tag color="purple" className="font-mono text-xs">{v}</Tag>
        : <span className="text-gray-400">—</span>
    },
    {
      title: 'Bag ID',
      dataIndex: 'bagMarking',
      key: 'bagMarking',
      render: v => v ? <Tag icon={<TagOutlined />}>{v}</Tag> : <span className="text-gray-400">—</span>
    },
    {
      title: 'Dispatch Date',
      dataIndex: 'dispatchDate',
      key: 'dispatchDate',
      render: (v, r) => {
        if (r.status === 'out_of_stock' && v) {
          return <Tag color="orange">{new Date(v).toLocaleDateString('en-IN')}</Tag>;
        }
        return <span className="text-gray-400">—</span>;
      }
    },
    {
      title: 'Condition', dataIndex: 'condition', key: 'condition',
      responsive: ['lg'],
      render: v => <Tag color={CONDITION_COLOR[v]}>{v?.toUpperCase()}</Tag>
    },
    {
      title: 'Actions', key: 'actions',
      render: (_, r) => (
        <Space>
          <Tooltip title="View Details">
            <Button size="small" icon={<EyeOutlined />} onClick={() => { setViewItem(r); setItemDetailModal(true); }} />
          </Tooltip>
          <Tooltip title="Edit">
            <Button size="small" icon={<EditOutlined />} onClick={() => {
              setEditItem(r);
              itemForm.setFieldsValue({
                ...r,
                bundleId: r.bundleId?._id,
                categoryId: r.categoryId?._id
              });
              setItemModal(true);
            }} />
          </Tooltip>
          <Tooltip title="Delete">
            <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteItem(r._id)} />
          </Tooltip>
        </Space>
      )
    }
  ];

  const reportColumns = [
    {
      title: 'SKU', dataIndex: 'skuCode', key: 'skuCode',
      render: v => <Tag color="blue" className="font-mono">{v}</Tag>
    },
    {
      title: 'Bundle', dataIndex: ['bundleId', 'name'], key: 'bundle',
      render: v => v || '—'
    },
    {
      title: 'PG / Room', key: 'location',
      render: (_, r) => `${r.pgName || '—'} / ${r.roomNo || '—'}`
    },
    {
      title: 'Dirty Level', dataIndex: 'dirtyLevel', key: 'dirtyLevel',
      render: v => (
        <div className="flex items-center gap-2">
          <Progress
            percent={v * 10}
            size="small"
            strokeColor={v <= 3 ? '#52c41a' : v <= 6 ? '#faad14' : '#ff4d4f'}
            showInfo={false}
            style={{ width: 60 }}
          />
          <span className="font-bold">{v}/10</span>
        </div>
      )
    },
    {
      title: 'Wear & Tear', dataIndex: 'wearAndTear', key: 'wearAndTear',
      render: v => <Tag color={WEAR_COLOR[v]}>{v?.toUpperCase()}</Tag>
    },
    {
      title: 'Bag', dataIndex: 'bagMarking', key: 'bagMarking',
      render: (v, r) => (
        <span>{v || '—'} <Tag color={r.bagCondition === 'ok' ? 'green' : 'red'}>{r.bagCondition}</Tag></span>
      )
    },
    {
      title: 'Photos', dataIndex: 'photos', key: 'photos',
      render: v => v?.length ? (
        <Image.PreviewGroup>
          <div className="flex gap-1">
            {v.slice(0, 3).map((url, i) => (
              <Image key={i} src={url} width={40} height={40} className="rounded object-cover" />
            ))}
            {v.length > 3 && <span className="text-xs text-gray-500 self-center">+{v.length - 3}</span>}
          </div>
        </Image.PreviewGroup>
      ) : <span className="text-gray-400">No photos</span>
    },
    {
      title: 'Submitted', dataIndex: 'submittedAt', key: 'submittedAt',
      render: v => new Date(v).toLocaleString()
    },
    {
      title: 'Verified', dataIndex: 'verifiedByAdmin', key: 'verified',
      render: v => v
        ? <Tag color="green" icon={<CheckCircleOutlined />}>Verified</Tag>
        : <Tag color="orange" icon={<WarningOutlined />}>Pending</Tag>
    },
    {
      title: 'Actions', key: 'actions',
      render: (_, r) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => { setViewReport(r); setReportModal(true); }}>
            View
          </Button>
          {!r.verifiedByAdmin && (
            <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={() => handleVerifyReport(r._id)}>
              Verify
            </Button>
          )}
        </Space>
      )
    }
  ];

  const pgColumns = [
    { title: 'PG Name', dataIndex: ['_id', 'pgName'], key: 'pgName', render: v => v || 'Unassigned' },
    { title: 'Area',    dataIndex: ['_id', 'area'],   key: 'area',   render: v => v || '—' },
    { title: 'Pincode', dataIndex: ['_id', 'pincode'],key: 'pincode',render: v => v || '—' },
    { title: 'Total SKUs', dataIndex: 'totalItems', key: 'total',
      render: v => <Badge count={v} showZero color="#3a7bd5" /> },
    { title: 'SKU Codes', dataIndex: 'skus', key: 'skus',
      render: v => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {v?.slice(0, 5).map((s, i) => <Tag key={i} className="font-mono text-xs">{s}</Tag>)}
          {v?.length > 5 && <Tag>+{v.length - 5} more</Tag>}
        </div>
      )
    }
  ];

  // ── Stat cards ───────────────────────────────────────────────────────────────
  const activeOrders = orders.filter(o => o.status === 'active').length;
  const statCards = [
    {
      title: 'Total Orders',
      value: orders.length,
      color: '#3a7bd5',
      icon: <ShoppingOutlined />
    },
    {
      title: 'Active Subscriptions',
      value: activeOrders,
      color: '#52c41a',
      icon: <CheckCircleOutlined />
    },
    {
      title: 'Total Items',
      value: stats?.total || items.length,
      color: '#722ed1',
      icon: <DatabaseOutlined />
    },
    {
      title: 'Pickup Pending',
      value: stats?.statusCounts?.find(s => s._id === 'pickup_pending')?.count || 0,
      color: '#faad14',
      icon: <WarningOutlined />
    }
  ];

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Inventory Management</h1>
          <p className="text-slate-500 mt-1">Complete end-to-end tracking — orders, SKUs, pickups.</p>
        </div>
        <Button icon={<ReloadOutlined />} onClick={loadAll} loading={loading}>Refresh</Button>
      </div>

      {/* ── Stat Cards ── */}
      <Row gutter={[16, 16]} className="mb-6">
        {statCards.map((s, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl"
                  style={{ background: s.color }}
                >
                  {s.icon}
                </div>
                <Statistic title={s.title} value={s.value} valueStyle={{ color: s.color, fontWeight: 700 }} />
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ── Main Tabs ── */}
      <Card className="rounded-2xl shadow-md border-0">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            // ── TAB 0: Orders ───────────────────────────────────────────────
            {
              key: 'orders',
              label: <span><ShoppingOutlined /> Orders</span>,
              children: (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-600 font-medium">{orders.length} total orders</span>
                  </div>
                  <Table
                    dataSource={orders}
                    columns={orderColumns}
                    rowKey="_id"
                    loading={loading}
                    scroll={{ x: 1600 }}
                    pagination={{ pageSize: 15, showSizeChanger: true }}
                    size="small"
                  />
                </>
              )
            },

            // ── TAB 1: Inventory Items ──────────────────────────────────────
            {
              key: 'items',
              label: <span><InboxOutlined /> Inventory Items</span>,
              children: (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-600 font-medium">{items.length} items tracked</span>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => { setEditItem(null); itemForm.resetFields(); setItemModal(true); }}
                    >
                      Add Item
                    </Button>
                  </div>
                  <Table
                    dataSource={items}
                    columns={itemColumns}
                    rowKey="_id"
                    loading={loading}
                    scroll={{ x: 1400 }}
                    pagination={{ pageSize: 15, showSizeChanger: true }}
                    size="small"
                  />
                </>
              )
            },

            // ── TAB 2: Pickup Reports ───────────────────────────────────────
            {
              key: 'reports',
              label: (
                <span>
                  <CameraOutlined /> Pickup Reports
                  {reports.filter(r => !r.verifiedByAdmin).length > 0 && (
                    <Badge count={reports.filter(r => !r.verifiedByAdmin).length} className="ml-2" />
                  )}
                </span>
              ),
              children: (
                <Table
                  dataSource={reports}
                  columns={reportColumns}
                  rowKey="_id"
                  loading={loading}
                  scroll={{ x: 1400 }}
                  pagination={{ pageSize: 15, showSizeChanger: true }}
                  size="small"
                  rowClassName={r => !r.verifiedByAdmin ? 'bg-orange-50' : ''}
                />
              )
            },

            // ── TAB 3: PG-wise Distribution ─────────────────────────────────
            {
              key: 'pg',
              label: <span><BarChartOutlined /> PG Distribution</span>,
              children: (
                <Table
                  dataSource={pgSummary}
                  columns={pgColumns}
                  rowKey={r => `${r._id?.pgName}-${r._id?.pincode}`}
                  loading={loading}
                  pagination={{ pageSize: 20 }}
                />
              )
            }
          ]}
        />
      </Card>

      {/* ── Order Detail Modal ── */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <ShoppingOutlined style={{ color: '#3a7bd5', fontSize: 20 }} />
            <div>
              <div className="font-bold text-slate-800">Order Details</div>
              {viewOrder?.bundleOrderId && (
                <Tag
                  color="blue"
                  style={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    fontSize: 14,
                    letterSpacing: 1,
                    marginTop: 2
                  }}
                >
                  {viewOrder.bundleOrderId}
                </Tag>
              )}
            </div>
          </div>
        }
        open={orderDetailModal}
        onCancel={() => { setOrderDetailModal(false); setViewOrder(null); }}
        footer={<Button onClick={() => { setOrderDetailModal(false); setViewOrder(null); }}>Close</Button>}
        width={680}
      >
        {viewOrder && (
          <>
            {/* User Info Card */}
            <Card
              size="small"
              className="mb-4 rounded-xl"
              style={{ background: '#f0f5ff', border: '1px solid #d6e4ff' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                  style={{ background: '#3a7bd5' }}
                >
                  <UserOutlined />
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-base">
                    {viewOrder.userId?.name || '—'}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Tag color="blue">Customer</Tag>
                    <Tooltip title="Full User ID">
                      <Tag
                        style={{ fontFamily: 'monospace', fontSize: 11, cursor: 'pointer' }}
                        onClick={() => {
                          const id = viewOrder.userId?._id;
                          if (id) { navigator.clipboard.writeText(id); message.success('User ID copied!'); }
                        }}
                      >
                        UID: {viewOrder.userId?._id?.toString().slice(-8).toUpperCase() || '—'}
                      </Tag>
                    </Tooltip>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-1 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <MailOutlined className="text-blue-400" />
                  <span>{viewOrder.userId?.email || '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <PhoneOutlined className="text-blue-400" />
                  <span>{viewOrder.userId?.mobile || '—'}</span>
                </div>
                {(viewOrder.deliveryAddress || viewOrder.userId?.address) && (
                  <div className="flex items-start gap-2 text-slate-600">
                    <HomeOutlined className="text-blue-400 mt-0.5" />
                    <span>{viewOrder.deliveryAddress || viewOrder.userId?.address}</span>
                  </div>
                )}
              </div>
            </Card>

            <Divider style={{ margin: '12px 0' }}>Bundle & Subscription</Divider>

            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Bundle Name" span={2}>
                <span className="font-semibold">{viewOrder.bundleId?.name || '—'}</span>
              </Descriptions.Item>
              <Descriptions.Item label="User ID" span={2}>
                <Tooltip title="Click to copy full ID">
                  <span
                    className="font-mono text-xs cursor-pointer text-blue-600 hover:text-blue-800"
                    onClick={() => {
                      const id = viewOrder.userId?._id;
                      if (id) { navigator.clipboard.writeText(id); message.success('User ID copied!'); }
                    }}
                  >
                    {viewOrder.userId?._id || '—'}
                  </span>
                </Tooltip>
              </Descriptions.Item>
              <Descriptions.Item label="Billing Cycle">
                {viewOrder.billingCycle
                  ? viewOrder.billingCycle.charAt(0).toUpperCase() + viewOrder.billingCycle.slice(1)
                  : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Final Price">
                {viewOrder.finalPrice != null ? (
                  <span className="font-bold text-green-600">₹{viewOrder.finalPrice}</span>
                ) : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={SUB_STATUS_COLOR[viewOrder.status] || 'default'}>
                  {viewOrder.status?.toUpperCase() || '—'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Security Deposit">
                {viewOrder.securityDeposit != null ? `₹${viewOrder.securityDeposit}` : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Start Date">
                {viewOrder.startDate ? new Date(viewOrder.startDate).toLocaleDateString('en-IN') : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="End Date">
                {viewOrder.endDate ? new Date(viewOrder.endDate).toLocaleDateString('en-IN') : '—'}
              </Descriptions.Item>
              {viewOrder.notes && (
                <Descriptions.Item label="Notes" span={2}>
                  {viewOrder.notes}
                </Descriptions.Item>
              )}
            </Descriptions>
          </>
        )}
      </Modal>

      {/* ── Add / Edit Item Modal ── */}
      <Modal
        title={editItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
        open={itemModal}
        onCancel={() => { setItemModal(false); setEditItem(null); itemForm.resetFields(); }}
        onOk={() => itemForm.submit()}
        width={700}
        okText="Save"
      >
        <Form form={itemForm} layout="vertical" onFinish={handleSaveItem}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="SKU Code" name="skuCode" rules={[{ required: true }]}>
                <Input placeholder="e.g. CR-SB-001" className="uppercase" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Bag Marking" name="bagMarking">
                <Input placeholder="e.g. BAG-001-A" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Bundle" name="bundleId" rules={[{ required: true }]}>
                <Select placeholder="Select bundle">
                  {bundles.map(b => <Option key={b._id} value={b._id}>{b.name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Category" name="categoryId" rules={[{ required: true }]}>
                <Select placeholder="Select category">
                  {categories.map(c => <Option key={c._id} value={c._id}>{c.name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="PG Name" name="pgName">
                <Input placeholder="e.g. Sunrise PG" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Room No." name="roomNo">
                <Input placeholder="e.g. 204" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Area" name="area">
                <Input placeholder="e.g. Koramangala" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Pincode" name="pincode">
                <Input placeholder="e.g. 560034" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Status" name="status" initialValue="in_stock">
                <Select>
                  <Option value="in_stock">✅ In Stock</Option>
                  <Option value="out_of_stock">📦 Out of Stock</Option>
                  <Option value="dismantled">🔧 Dismantled</Option>
                  <Option value="dispatched">🚚 Dispatched</Option>
                  <Option value="with_customer">👤 With Customer</Option>
                  <Option value="pickup_pending">⏳ Pickup Pending</Option>
                  <Option value="in_laundry">🧺 In Laundry</Option>
                  <Option value="damaged">⚠️ Damaged</Option>
                  <Option value="retired">🗑️ Retired</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Condition" name="condition" initialValue="new">
                <Select>
                  {Object.keys(CONDITION_COLOR).map(c => (
                    <Option key={c} value={c}>{c.toUpperCase()}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Bundle Built ID" name="bundleBuiltId">
                <Input placeholder="Auto-filled when bundles are built" disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Bag ID" name="bagMarking">
                <Input placeholder="Auto-filled from warehouse manager" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Notes" name="notes">
                <TextArea rows={2} placeholder="Any additional notes..." />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* ── Item Detail Modal ── */}
      <Modal
        title={<span><TagOutlined /> Item Details — {viewItem?.skuCode}</span>}
        open={itemDetailModal}
        onCancel={() => setItemDetailModal(false)}
        footer={null}
        width={600}
      >
        {viewItem && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="SKU Code" span={2}>
              <Tag color="blue" className="font-mono font-bold text-base">{viewItem.skuCode}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Bundle">{viewItem.bundleId?.name || '—'}</Descriptions.Item>
            <Descriptions.Item label="Category">{viewItem.categoryId?.name || '—'}</Descriptions.Item>
            <Descriptions.Item label="Bag Marking">{viewItem.bagMarking || '—'}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={STATUS_COLOR[viewItem.status]}>{viewItem.status?.replace(/_/g, ' ').toUpperCase()}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Condition">
              <Tag color={CONDITION_COLOR[viewItem.condition]}>{viewItem.condition?.toUpperCase()}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="PG Name">{viewItem.pgName || '—'}</Descriptions.Item>
            <Descriptions.Item label="Room No.">{viewItem.roomNo || '—'}</Descriptions.Item>
            <Descriptions.Item label="Area">{viewItem.area || '—'}</Descriptions.Item>
            <Descriptions.Item label="Pincode">{viewItem.pincode || '—'}</Descriptions.Item>
            <Descriptions.Item label="Dispatched At">
              {viewItem.dispatchedAt ? new Date(viewItem.dispatchedAt).toLocaleString() : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Picked Up At">
              {viewItem.pickedUpAt ? new Date(viewItem.pickedUpAt).toLocaleString() : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Created At" span={2}>
              {new Date(viewItem.createdAt).toLocaleString()}
            </Descriptions.Item>
            {viewItem.notes && (
              <Descriptions.Item label="Notes" span={2}>{viewItem.notes}</Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* ── Pickup Report Detail Modal ── */}
      <Modal
        title={<span><CameraOutlined /> Pickup Report — {viewReport?.skuCode}</span>}
        open={reportModal}
        onCancel={() => setReportModal(false)}
        footer={
          viewReport && !viewReport.verifiedByAdmin ? (
            <Button type="primary" icon={<CheckCircleOutlined />}
              onClick={() => { handleVerifyReport(viewReport._id); setReportModal(false); }}
            >
              Mark as Verified
            </Button>
          ) : null
        }
        width={700}
      >
        {viewReport && (
          <>
            <Descriptions bordered column={2} size="small" className="mb-4">
              <Descriptions.Item label="SKU Code" span={2}>
                <Tag color="blue" className="font-mono font-bold">{viewReport.skuCode}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Bundle">{viewReport.bundleId?.name || '—'}</Descriptions.Item>
              <Descriptions.Item label="Submitted By">{viewReport.submittedBy?.name || '—'}</Descriptions.Item>
              <Descriptions.Item label="PG Name">{viewReport.pgName || '—'}</Descriptions.Item>
              <Descriptions.Item label="Room No.">{viewReport.roomNo || '—'}</Descriptions.Item>
              <Descriptions.Item label="Area">{viewReport.area || '—'}</Descriptions.Item>
              <Descriptions.Item label="Pincode">{viewReport.pincode || '—'}</Descriptions.Item>
              <Descriptions.Item label="Submitted At" span={2}>
                {new Date(viewReport.submittedAt).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>

            <Divider>Condition Assessment</Divider>

            <Row gutter={16} className="mb-4">
              <Col span={12}>
                <div className="text-slate-600 text-sm mb-1 font-medium">Dirtiness Level</div>
                <div className="flex items-center gap-3">
                  <Progress
                    type="circle"
                    percent={viewReport.dirtyLevel * 10}
                    width={80}
                    strokeColor={
                      viewReport.dirtyLevel <= 3 ? '#52c41a' :
                      viewReport.dirtyLevel <= 6 ? '#faad14' : '#ff4d4f'
                    }
                    format={() => <span className="font-bold text-lg">{viewReport.dirtyLevel}/10</span>}
                  />
                  <div className="text-sm text-slate-500">
                    {viewReport.dirtyLevel <= 3 ? 'Lightly soiled' :
                     viewReport.dirtyLevel <= 6 ? 'Moderately dirty' : 'Heavily soiled'}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className="text-slate-600 text-sm mb-2 font-medium">Wear & Tear</div>
                <Tag color={WEAR_COLOR[viewReport.wearAndTear]} className="text-base px-3 py-1">
                  {viewReport.wearAndTear?.toUpperCase()}
                </Tag>
                {viewReport.wearNotes && (
                  <p className="text-sm text-slate-500 mt-2">{viewReport.wearNotes}</p>
                )}
              </Col>
            </Row>

            <Row gutter={16} className="mb-4">
              <Col span={12}>
                <div className="text-slate-600 text-sm mb-1 font-medium">Bag Marking</div>
                <Tag icon={<TagOutlined />}>{viewReport.bagMarking || '—'}</Tag>
              </Col>
              <Col span={12}>
                <div className="text-slate-600 text-sm mb-1 font-medium">Bag Condition</div>
                <Tag color={viewReport.bagCondition === 'ok' ? 'green' : 'red'}>
                  {viewReport.bagCondition?.toUpperCase()}
                </Tag>
              </Col>
            </Row>

            {viewReport.photos?.length > 0 && (
              <>
                <Divider>Photo Evidence ({viewReport.photos.length} photos)</Divider>
                <Image.PreviewGroup>
                  <div className="grid grid-cols-3 gap-2">
                    {viewReport.photos.map((url, i) => (
                      <Image
                        key={i}
                        src={url}
                        className="rounded-xl object-cover"
                        style={{ height: 120, width: '100%', objectFit: 'cover' }}
                        alt={`Photo ${i + 1}`}
                      />
                    ))}
                  </div>
                </Image.PreviewGroup>
              </>
            )}

            {viewReport.verifiedByAdmin && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                <CheckCircleOutlined className="text-green-600" />
                <span className="text-green-700 font-medium">Verified by Admin</span>
                {viewReport.adminNotes && <span className="text-green-600 text-sm">— {viewReport.adminNotes}</span>}
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
