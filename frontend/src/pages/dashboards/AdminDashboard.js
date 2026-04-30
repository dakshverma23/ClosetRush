import React, { useState, useEffect } from 'react';
import { Layout, Card, Row, Col, Statistic, Table, Tag, Button, Modal, Form, Input, InputNumber, Select, Spin, Tabs, Drawer, Avatar, Dropdown, Descriptions, Divider, Upload, Image, DatePicker, Space } from 'antd';
import appMessage from '../../utils/message';
import {
  UserOutlined,
  ShoppingOutlined,
  DollarOutlined,
  RiseOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
  LogoutOutlined,
  DashboardOutlined,
  MenuOutlined,
  EyeOutlined,
  AppstoreOutlined,
  CustomerServiceOutlined,
  TeamOutlined,
  FileTextOutlined,
  SettingOutlined,
  DatabaseOutlined,
  UploadOutlined,
  PictureOutlined,
  ShopOutlined,
  TruckOutlined,
  CheckOutlined,
  CloseOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const { Content, Sider } = Layout;
const { TextArea } = Input;

// ─── Quality Checks Panel (used inside AdminDashboard orders tabs) ─────────────
const QualityChecksPanel = () => {
  const [qcList, setQcList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewModal, setViewModal] = useState({ visible: false, record: null });
  const [reviewModal, setReviewModal] = useState({ visible: false, record: null });
  const [adminNotes, setAdminNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/quality-checks');
      setQcList(res.data.qualityChecks || []);
    } catch {
      appMessage.error('Failed to load quality checks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleReview = async () => {
    setSubmitting(true);
    try {
      await api.patch(`/quality-checks/${reviewModal.record._id}/review`, { adminNotes });
      appMessage.success('Quality check reviewed');
      setReviewModal({ visible: false, record: null });
      setAdminNotes('');
      load();
    } catch {
      appMessage.error('Failed to review');
    } finally {
      setSubmitting(false);
    }
  };

  const conditionColors = { excellent: 'green', good: 'blue', fair: 'orange', poor: 'red' };

  const columns = [
    {
      title: 'Order ID',
      key: 'orderId',
      render: (_, r) => <Tag color="purple" className="font-mono">{r.orderId?._id?.slice(-8) || '—'}</Tag>
    },
    {
      title: 'Customer',
      key: 'customer',
      responsive: ['md'],
      render: (_, r) => (
        <div>
          <div className="font-medium">{r.userId?.name || '—'}</div>
          <div className="text-xs text-slate-400">{r.userId?.email}</div>
        </div>
      )
    },
    {
      title: 'Submitted By',
      key: 'submittedBy',
      responsive: ['lg'],
      render: (_, r) => r.submittedBy?.name || '—'
    },
    {
      title: 'Condition',
      key: 'condition',
      render: (_, r) => (
        <Tag color={conditionColors[r.overallCondition] || 'default'}>
          {r.overallCondition?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Photos',
      key: 'photos',
      render: (_, r) => <span className="text-slate-500 text-sm">{r.images?.length || 0}</span>
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, r) => r.reviewedByAdmin
        ? <Tag color="green">Reviewed</Tag>
        : <Tag color="orange">Pending</Tag>
    },
    {
      title: 'Date',
      key: 'date',
      responsive: ['md'],
      render: (_, r) => new Date(r.createdAt).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, r) => (
        <Space wrap>
          <Button size="small" icon={<EyeOutlined />} onClick={() => setViewModal({ visible: true, record: r })}>
            View
          </Button>
          {!r.reviewedByAdmin && (
            <Button
              size="small"
              type="primary"
              onClick={() => { setAdminNotes(''); setReviewModal({ visible: true, record: r }); }}
              style={{ background: '#7c3aed', borderColor: '#7c3aed' }}
            >
              Review
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Quality Check Reports</h3>
        <Button onClick={load} loading={loading}>Refresh</Button>
      </div>
      <Table
        dataSource={qcList}
        columns={columns}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10, responsive: true }}
        scroll={{ x: 700 }}
        locale={{ emptyText: 'No quality checks submitted yet' }}
        rowClassName={r => !r.reviewedByAdmin ? 'bg-purple-50' : ''}
      />

      {/* View Modal */}
      <Modal
        title="Quality Check Details"
        open={viewModal.visible}
        onCancel={() => setViewModal({ visible: false, record: null })}
        footer={<Button onClick={() => setViewModal({ visible: false, record: null })}>Close</Button>}
        width={680}
      >
        {viewModal.record && (
          <>
            <Descriptions bordered column={1} size="small" className="mb-4">
              <Descriptions.Item label="Customer">
                {viewModal.record.userId?.name} ({viewModal.record.userId?.email})
              </Descriptions.Item>
              <Descriptions.Item label="Order ID">
                <Tag color="purple" className="font-mono">{viewModal.record.orderId?._id?.slice(-8)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Bundle">{viewModal.record.bundleSummary || '—'}</Descriptions.Item>
              <Descriptions.Item label="Bag IDs">{viewModal.record.bagIds?.join(', ') || '—'}</Descriptions.Item>
              <Descriptions.Item label="SKU Codes">{viewModal.record.skuCodes?.join(', ') || '—'}</Descriptions.Item>
              <Descriptions.Item label="Condition">
                <Tag color={conditionColors[viewModal.record.overallCondition]}>{viewModal.record.overallCondition?.toUpperCase()}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Notes">{viewModal.record.notes || '—'}</Descriptions.Item>
              <Descriptions.Item label="Submitted By">{viewModal.record.submittedBy?.name}</Descriptions.Item>
              <Descriptions.Item label="Submitted At">{new Date(viewModal.record.createdAt).toLocaleString()}</Descriptions.Item>
              {viewModal.record.adminNotes && (
                <Descriptions.Item label="Admin Notes">{viewModal.record.adminNotes}</Descriptions.Item>
              )}
            </Descriptions>
            {viewModal.record.images?.length > 0 && (
              <div>
                <div className="font-medium text-slate-700 mb-2">Photos ({viewModal.record.images.length})</div>
                <Image.PreviewGroup>
                  <div className="flex flex-wrap gap-2">
                    {viewModal.record.images.map((url, i) => (
                      <Image key={i} src={url} width={90} height={90} style={{ objectFit: 'cover', borderRadius: 8 }} />
                    ))}
                  </div>
                </Image.PreviewGroup>
              </div>
            )}
          </>
        )}
      </Modal>

      {/* Review Modal */}
      <Modal
        title="Review Quality Check"
        open={reviewModal.visible}
        onCancel={() => setReviewModal({ visible: false, record: null })}
        onOk={handleReview}
        okText="Mark as Reviewed"
        confirmLoading={submitting}
        okButtonProps={{ style: { background: '#7c3aed', borderColor: '#7c3aed' } }}
      >
        <p className="mb-3 text-slate-600">Add any admin notes for this quality check (optional):</p>
        <Input.TextArea
          rows={4}
          placeholder="Admin notes..."
          value={adminNotes}
          onChange={e => setAdminNotes(e.target.value)}
        />
      </Modal>
    </div>
  );
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [isBundleModalVisible, setIsBundleModalVisible] = useState(false);
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
  const [isQuoteDetailModalVisible, setIsQuoteDetailModalVisible] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [editingBundle, setEditingBundle] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [bundleItems, setBundleItems] = useState([]);
  const [bundleImage, setBundleImage] = useState(null);
  const [bundleImagePreview, setBundleImagePreview] = useState('');
  const [pendingPickupMembers, setPendingPickupMembers] = useState(0);
  const [pendingLogisticsPartners, setPendingLogisticsPartners] = useState(0);
  const [form] = Form.useForm();
  const [userForm] = Form.useForm();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [pickupMembers, setPickupMembers] = useState([]);
  const [assignModal, setAssignModal] = useState({ visible: false, order: null });
  const [assigningPickupMemberId, setAssigningPickupMemberId] = useState(null);
  const [rejectModal, setRejectModal] = useState({ visible: false, order: null });
  const [rejectionReason, setRejectionReason] = useState('');
  const [previewImages, setPreviewImages] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // ── All Orders filter state ───────────────────────────────────────────────
  const [orderFilterStatus, setOrderFilterStatus] = useState('all');
  const [orderFilterBundle, setOrderFilterBundle] = useState('all');
  const [orderFilterDateRange, setOrderFilterDateRange] = useState([null, null]);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const shortId = (id) => (id ? String(id).slice(-8) : '—');

  useEffect(() => {
    fetchDashboardData();
    fetchPendingPickupMembers();
    fetchOrders();
  }, []);

  const fetchPendingPickupMembers = async () => {
    try {
      const [whRes, lpRes] = await Promise.all([
        api.get('/warehouse-managers?status=pending'),
        api.get('/logistics-partners?status=pending')
      ]);
      const whData = Array.isArray(whRes.data.members) ? whRes.data.members : [];
      const lpData = Array.isArray(lpRes.data.members) ? lpRes.data.members : [];
      setPendingPickupMembers(whData.length);
      setPendingLogisticsPartners(lpData.length);
    } catch (error) {
      console.error('Failed to load pending staff counts');
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch analytics
      const analyticsResponse = await api.get('/analytics/overview');
      setAnalytics(analyticsResponse.data);

      // Fetch users
      const usersResponse = await api.get('/users');
      setUsers(usersResponse.data.users || []);

      // Fetch user stats
      const userStatsResponse = await api.get('/users/stats/summary');
      setUserStats(userStatsResponse.data.stats);

      // Fetch bundles
      const bundlesResponse = await api.get('/bundles');
      setBundles(bundlesResponse.data.bundles || []);

      // Fetch categories
      const categoriesResponse = await api.get('/categories');
      setCategories(categoriesResponse.data.categories || []);

      // Fetch quotes
      const quotesResponse = await api.get('/quotes');
      setQuotes(quotesResponse.data.quotes || []);

      // Fetch support tickets
      const ticketsResponse = await api.get('/support');
      setTickets(ticketsResponse.data.tickets || []);

    } catch (error) {
      appMessage.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBundle = () => {
    setEditingBundle(null);
    setBundleItems([{ category: '', quantity: 1 }]);
    setBundleImage(null);
    setBundleImagePreview('');
    form.resetFields();
    setIsBundleModalVisible(true);
  };

  const handleEditBundle = (bundle) => {
    setEditingBundle(bundle);
    
    // Handle both old and new bundle structures
    let items = [];
    
    if (bundle.items && Array.isArray(bundle.items)) {
      // New structure: items is an array
      items = bundle.items.map(item => ({
        category: item.category?._id || item.category || '',
        quantity: item.quantity || 1
      }));
    } else if (bundle.items && typeof bundle.items === 'object') {
      // Old structure: items is an object with singleBedsheets, doubleBedsheets, etc.
      // Convert to empty array for now, or you can map old items to categories if you have the mapping
      items = [{ category: '', quantity: 1 }];
      appMessage.warning('This bundle uses the old format. Please update the items.');
    } else {
      // No items
      items = [{ category: '', quantity: 1 }];
    }
    
    setBundleItems(items);
    setBundleImagePreview(bundle.image || '');
    setBundleImage(null);
    form.setFieldsValue({
      name: bundle.name,
      description: bundle.description,
      price: bundle.price,
      securityDeposit: bundle.securityDeposit || 0,
      billingCycle: bundle.billingCycle
    });
    setIsBundleModalVisible(true);
  };

  const handleAddBundleItem = () => {
    setBundleItems([...bundleItems, { category: '', quantity: 1 }]);
  };

  const handleRemoveBundleItem = (index) => {
    const newItems = bundleItems.filter((_, i) => i !== index);
    setBundleItems(newItems);
  };

  const handleBundleItemChange = (index, field, value) => {
    const newItems = [...bundleItems];
    newItems[index][field] = value;
    setBundleItems(newItems);
  };

  const handleImageChange = (info) => {
    const file = info.file.originFileObj || info.file;
    if (file) {
      setBundleImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setBundleImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBundle = async (values) => {
    try {
      // Validate bundle items
      if (bundleItems.length === 0) {
        appMessage.error('Please add at least one item to the bundle');
        return;
      }

      for (const item of bundleItems) {
        if (!item.category) {
          appMessage.error('Please select a category for all items');
          return;
        }
        if (!item.quantity || item.quantity < 1) {
          appMessage.error('Please enter valid quantities for all items');
          return;
        }
      }

      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('description', values.description);
      formData.append('price', values.price);
      formData.append('securityDeposit', values.securityDeposit || 0);
      formData.append('billingCycle', values.billingCycle);
      formData.append('items', JSON.stringify(bundleItems));
      
      // Add image if selected
      if (bundleImage) {
        formData.append('image', bundleImage);
      }

      if (editingBundle) {
        await api.put(`/bundles/${editingBundle._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        appMessage.success('Bundle updated successfully');
      } else {
        await api.post('/bundles', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        appMessage.success('Bundle created successfully');
      }

      setIsBundleModalVisible(false);
      form.resetFields();
      setBundleItems([]);
      setBundleImage(null);
      setBundleImagePreview('');
      fetchDashboardData();
    } catch (error) {
      appMessage.error(error.response?.data?.message || 'Failed to save bundle');
    }
  };

  const handleDeleteBundle = (id) => {
    Modal.confirm({
      title: 'Delete Bundle',
      content: 'Are you sure you want to delete this bundle?',
      okText: 'Yes, Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await api.delete(`/bundles/${id}`);
          appMessage.success('Bundle deleted successfully');
          fetchDashboardData();
        } catch (error) {
          appMessage.error(error.error?.message || 'Failed to delete bundle');
        }
      }
    });
  };

  const handleToggleBundleStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/bundles/${id}/status`, { active: !currentStatus });
      appMessage.success('Bundle status updated');
      fetchDashboardData();
    } catch (error) {
      appMessage.error(error.error?.message || 'Failed to update status');
    }
  };

  const handleUpdateQuoteStatus = async (id, status) => {
    try {
      await api.patch(`/quotes/${id}/status`, { status });
      appMessage.success('Quote status updated');
      fetchDashboardData();
    } catch (error) {
      appMessage.error(error.error?.message || 'Failed to update quote status');
    }
  };

  const handleViewQuoteDetails = (quote) => {
    setSelectedQuote(quote);
    setIsQuoteDetailModalVisible(true);
  };

  const handleUpdateTicketStatus = async (id, status) => {
    try {
      await api.patch(`/support/${id}/status`, { status });
      appMessage.success('Ticket status updated');
      fetchDashboardData();
    } catch (error) {
      appMessage.error(error.error?.message || 'Failed to update ticket status');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    userForm.setFieldsValue({
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      address: user.address,
      userType: user.userType
    });
    setIsUserModalVisible(true);
  };

  const handleSaveUser = async (values) => {
    try {
      await api.put(`/users/${editingUser._id}`, values);
      appMessage.success('User updated successfully');
      setIsUserModalVisible(false);
      userForm.resetFields();
      fetchDashboardData();
    } catch (error) {
      appMessage.error(error.error?.message || 'Failed to update user');
    }
  };

  const handleToggleUserStatus = async (id) => {
    try {
      await api.patch(`/users/${id}/toggle-status`);
      appMessage.success('User status updated');
      fetchDashboardData();
    } catch (error) {
      appMessage.error(error.error?.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = (id) => {
    Modal.confirm({
      title: 'Delete User',
      content: 'Are you sure you want to delete this user? This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await api.delete(`/users/${id}`);
          appMessage.success('User deleted successfully');
          fetchDashboardData();
        } catch (error) {
          appMessage.error(error.error?.message || 'Failed to delete user');
        }
      }
    });
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

  // Fetch approved warehouse managers for assignment
  const fetchPickupMembers = async () => {
    try {
      const response = await api.get('/warehouse-managers?status=approved');
      setPickupMembers(response.data.warehouseManagers || response.data.members || []);
    } catch (error) {
      console.error('Failed to load warehouse managers');
    }
  };

  // Fetch approved logistics partners for logistics assignment
  const [logisticsPartners, setLogisticsPartners] = useState([]);
  const [assignLogisticsModal, setAssignLogisticsModal] = useState({ visible: false, order: null });
  const [assigningLogisticsPartnerId, setAssigningLogisticsPartnerId] = useState(null);

  const fetchLogisticsPartners = async () => {
    try {
      const response = await api.get('/logistics-partners?status=approved');
      setLogisticsPartners(response.data.logisticsPartners || []);
    } catch (error) {
      console.error('Failed to load logistics partners');
    }
  };

  const handleOpenAssignModal = (order) => {
    setAssigningPickupMemberId(null);
    setAssignModal({ visible: true, order });
    fetchPickupMembers();
  };

  const handleOpenAssignLogisticsModal = (order) => {
    setAssigningLogisticsPartnerId(null);
    setAssignLogisticsModal({ visible: true, order });
    fetchLogisticsPartners();
  };

  const handleAssignOrder = async () => {
    if (!assigningPickupMemberId) {
      appMessage.warning('Please select a warehouse manager');
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/orders/${assignModal.order._id}/assign-warehouse`, {
        warehouseManagerId: assigningPickupMemberId
      });
      appMessage.success('Order assigned to warehouse manager successfully');
      setAssignModal({ visible: false, order: null });
      setAssigningPickupMemberId(null);
      fetchOrders();
    } catch (error) {
      appMessage.error(
        error?.error?.message || error?.response?.data?.message || 'Failed to assign order'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignLogistics = async () => {
    if (!assigningLogisticsPartnerId) {
      appMessage.warning('Please select a logistics partner');
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/orders/${assignLogisticsModal.order._id}/assign-logistics`, {
        logisticsPartnerId: assigningLogisticsPartnerId
      });
      appMessage.success('Order assigned to logistics partner successfully');
      setAssignLogisticsModal({ visible: false, order: null });
      setAssigningLogisticsPartnerId(null);
      fetchOrders();
    } catch (error) {
      appMessage.error(
        error?.error?.message || error?.response?.data?.message || 'Failed to assign logistics'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveDelivery = async (order) => {
    try {
      await api.patch(`/orders/${order._id}/approve-delivery`);
      appMessage.success('Delivery approved. Order marked as delivered.');
      fetchOrders();
    } catch (error) {
      appMessage.error(
        error?.error?.message || error?.response?.data?.message || 'Failed to approve delivery'
      );
    }
  };

  const handleOpenRejectModal = (order) => {
    setRejectionReason('');
    setRejectModal({ visible: true, order });
  };

  const handleRejectDelivery = async () => {
    if (!rejectionReason.trim()) {
      appMessage.warning('Please enter a rejection reason');
      return;
    }
    setSubmitting(true);
    try {
      await api.patch(`/orders/${rejectModal.order._id}/reject-delivery`, {
        rejectionReason
      });
      appMessage.success('Delivery rejected. Order reverted to out for delivery.');
      setRejectModal({ visible: false, order: null });
      setRejectionReason('');
      fetchOrders();
    } catch (error) {
      appMessage.error(
        error?.error?.message || error?.response?.data?.message || 'Failed to reject delivery'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const userColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Mobile',
      dataIndex: 'mobile',
      key: 'mobile'
    },
    {
      title: 'User Type',
      dataIndex: 'userType',
      key: 'userType',
      render: (type) => {
        const colors = {
          individual: 'blue',
          business: 'green',
          admin: 'red'
        };
        return <Tag color={colors[type] || 'default'}>{type ? type.toUpperCase() : 'N/A'}</Tag>;
      }
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
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="space-x-2">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
          >
            Edit
          </Button>
          <Button
            size="small"
            onClick={() => handleToggleUserStatus(record._id)}
          >
            {record.active ? 'Deactivate' : 'Activate'}
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteUser(record._id)}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  const bundleColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `₹${price}`
    },
    {
      title: 'Security Deposit',
      dataIndex: 'securityDeposit',
      key: 'securityDeposit',
      render: (deposit) => {
        const amount = typeof deposit === 'number' && !isNaN(deposit) && deposit >= 0 ? deposit : 0;
        return `₹${amount}`;
      },
      sorter: (a, b) => {
        const aDeposit = typeof a.securityDeposit === 'number' && !isNaN(a.securityDeposit) && a.securityDeposit >= 0 ? a.securityDeposit : 0;
        const bDeposit = typeof b.securityDeposit === 'number' && !isNaN(b.securityDeposit) && b.securityDeposit >= 0 ? b.securityDeposit : 0;
        return aDeposit - bDeposit;
      }
    },
    {
      title: 'Billing Cycle',
      dataIndex: 'billingCycle',
      key: 'billingCycle',
      render: (cycle) => cycle ? cycle.charAt(0).toUpperCase() + cycle.slice(1) : 'N/A'
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items) => {
        if (!items) return <span className="text-gray-400">No items</span>;
        
        // Handle new structure (array)
        if (Array.isArray(items) && items.length > 0) {
          return (
            <div className="text-xs">
              {items.map((item, index) => (
                <div key={index}>
                  {item.category?.name || 'Unknown'}: {item.quantity}
                </div>
              ))}
            </div>
          );
        }
        
        // Handle old structure (object)
        if (typeof items === 'object' && !Array.isArray(items)) {
          return (
            <div className="text-xs">
              {items.singleBedsheets > 0 && <div>Single: {items.singleBedsheets}</div>}
              {items.doubleBedsheets > 0 && <div>Double: {items.doubleBedsheets}</div>}
              {items.pillowCovers > 0 && <div>Pillows: {items.pillowCovers}</div>}
              {items.curtains > 0 && <div>Curtains: {items.curtains}</div>}
            </div>
          );
        }
        
        return <span className="text-gray-400">No items</span>;
      }
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
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="space-x-2">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditBundle(record)}
          >
            Edit
          </Button>
          <Button
            size="small"
            onClick={() => handleToggleBundleStatus(record._id, record.active)}
          >
            {record.active ? 'Deactivate' : 'Activate'}
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteBundle(record._id)}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  const quoteColumns = [
    {
      title: 'Business Name',
      dataIndex: 'businessName',
      key: 'businessName'
    },
    {
      title: 'Contact Person',
      dataIndex: 'contactPerson',
      key: 'contactPerson'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: 'Type',
      dataIndex: 'businessType',
      key: 'businessType',
      render: (type) => <Tag>{type ? type.toUpperCase() : 'N/A'}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          pending: 'orange',
          contacted: 'blue',
          quote_sent: 'cyan',
          negotiating: 'purple',
          accepted: 'green',
          rejected: 'red'
        };
        const labels = {
          pending: 'PENDING',
          contacted: 'CONTACTED',
          quote_sent: 'QUOTE SENT',
          negotiating: 'NEGOTIATING',
          accepted: 'ACCEPTED',
          rejected: 'REJECTED'
        };
        return <Tag color={colors[status] || 'default'}>{labels[status] || status?.toUpperCase() || 'N/A'}</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="space-x-2">
          <Button
            size="small"
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleViewQuoteDetails(record)}
          >
            See Details
          </Button>
          <Select
            size="small"
            value={record.status}
            onChange={(value) => handleUpdateQuoteStatus(record._id, value)}
            style={{ width: 140 }}
          >
            <Select.Option value="pending">Pending</Select.Option>
            <Select.Option value="contacted">Contacted</Select.Option>
            <Select.Option value="quote_sent">Quote Sent</Select.Option>
            <Select.Option value="negotiating">Negotiating</Select.Option>
            <Select.Option value="accepted">Accepted</Select.Option>
            <Select.Option value="rejected">Rejected</Select.Option>
          </Select>
        </div>
      )
    }
  ];

  const ticketColumns = [
    {
      title: 'Ticket ID',
      dataIndex: 'ticketId',
      key: 'ticketId'
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject'
    },
    {
      title: 'User',
      dataIndex: ['user', 'name'],
      key: 'user',
      render: (text) => text || 'N/A'
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        const colors = {
          low: 'green',
          medium: 'orange',
          high: 'red'
        };
        return <Tag color={colors[priority] || 'default'}>{priority ? priority.toUpperCase() : 'N/A'}</Tag>;
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          open: 'blue',
          'in-progress': 'orange',
          resolved: 'green',
          closed: 'gray'
        };
        return <Tag color={colors[status] || 'default'}>{status ? status.toUpperCase() : 'N/A'}</Tag>;
      }
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Select
          size="small"
          value={record.status}
          onChange={(value) => handleUpdateTicketStatus(record._id, value)}
          style={{ width: 120 }}
        >
          <Select.Option value="open">Open</Select.Option>
          <Select.Option value="in-progress">In Progress</Select.Option>
          <Select.Option value="resolved">Resolved</Select.Option>
          <Select.Option value="closed">Closed</Select.Option>
        </Select>
      )
    }
  ];

  if (loading) {
    return (
      <Layout className="min-h-screen">
        <Content className="p-4 md:p-8">
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        </Content>
      </Layout>
    );
  }

  const sidebarMenu = (
    <div className="flex flex-col h-full bg-gradient-surface">
      {/* User Profile Section */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <UserOutlined className="text-white text-2xl" />
          </div>
          <div>
            <div className="font-bold text-lg text-slate-800">{user?.name}</div>
            <div className="text-sm text-slate-600 bg-indigo-100 px-3 py-1 rounded-full">
              {user?.userType?.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 py-6 px-2">
        <div
          className="mx-2 mb-2 px-4 py-3 hover:bg-indigo-50 cursor-pointer flex items-center gap-3 text-slate-600 hover:text-indigo-600 rounded-xl transition-all duration-300"
          onClick={() => navigate('/')}
        >
          <HomeOutlined className="text-xl" />
          <span className="font-medium">Home</span>
        </div>

        <div className="mx-2 mb-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 cursor-pointer flex items-center gap-3 text-white rounded-xl shadow-lg">
          <DashboardOutlined className="text-xl" />
          <span className="font-medium">Dashboard</span>
        </div>

        <div
          className="mx-2 mb-2 px-4 py-3 hover:bg-indigo-50 cursor-pointer flex items-center gap-3 text-slate-600 hover:text-indigo-600 rounded-xl transition-all duration-300"
          onClick={() => navigate('/admin/analytics')}
        >
          <RiseOutlined className="text-xl" />
          <span className="font-medium">Analytics</span>
        </div>

        <div
          className="mx-2 mb-2 px-4 py-3 hover:bg-indigo-50 cursor-pointer flex items-center gap-3 text-slate-600 hover:text-indigo-600 rounded-xl transition-all duration-300"
          onClick={() => navigate('/admin/categories')}
        >
          <AppstoreOutlined className="text-xl" />
          <span className="font-medium">Categories</span>
        </div>

        <div
          className="mx-2 mb-2 px-4 py-3 hover:bg-indigo-50 cursor-pointer flex items-center gap-3 text-slate-600 hover:text-indigo-600 rounded-xl transition-all duration-300"
          onClick={() => navigate('/admin/brand-settings')}
        >
          <SettingOutlined className="text-xl" />
          <span className="font-medium">Brand Settings</span>
        </div>

        <div
          className="mx-2 mb-2 px-4 py-3 hover:bg-indigo-50 cursor-pointer flex items-center gap-3 text-slate-600 hover:text-indigo-600 rounded-xl transition-all duration-300"
          onClick={() => navigate('/admin/inventory')}
        >
          <DatabaseOutlined className="text-xl" />
          <span className="font-medium">Inventory</span>
        </div>

        <div
          className="mx-2 mb-2 px-4 py-3 hover:bg-indigo-50 cursor-pointer flex items-center gap-3 text-slate-600 hover:text-indigo-600 rounded-xl transition-all duration-300"
          onClick={() => navigate('/admin/users')}
        >
          <TeamOutlined className="text-xl" />
          <span className="font-medium">Users</span>
          <span className="ml-auto text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
            {users.length}
          </span>
        </div>

        <div
          className="mx-2 mb-2 px-4 py-3 hover:bg-indigo-50 cursor-pointer flex items-center gap-3 text-slate-600 hover:text-indigo-600 rounded-xl transition-all duration-300"
          onClick={() => navigate('/admin/staff-approvals')}
        >
          <UserOutlined className="text-xl" />
          <span className="font-medium">Staff Approvals</span>
          {(pendingPickupMembers + pendingLogisticsPartners) > 0 && (
            <span className="ml-auto text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full animate-pulse">
              {pendingPickupMembers + pendingLogisticsPartners}
            </span>
          )}
        </div>

        <div
          className="mx-2 mb-2 px-4 py-3 hover:bg-indigo-50 cursor-pointer flex items-center gap-3 text-slate-600 hover:text-indigo-600 rounded-xl transition-all duration-300"
          onClick={() => navigate('/admin/quotes')}
        >
          <FileTextOutlined className="text-xl" />
          <span className="font-medium">Quotes</span>
          <span className="ml-auto text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
            {quotes.length}
          </span>
        </div>

        <div
          className="mx-2 mb-2 px-4 py-3 hover:bg-indigo-50 cursor-pointer flex items-center gap-3 text-slate-600 hover:text-indigo-600 rounded-xl transition-all duration-300"
          onClick={() => navigate('/admin/support-tickets')}
        >
          <CustomerServiceOutlined className="text-xl" />
          <span className="font-medium">Support Tickets</span>
        </div>

        <Dropdown
          menu={{
            items: [
              {
                key: 'profile-info',
                label: (
                  <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200">
                    <div className="font-semibold mb-3 text-slate-800">Profile Information</div>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <strong className="text-slate-600">Name:</strong> 
                        <span className="text-slate-800">{user?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <strong className="text-slate-600">Email:</strong> 
                        <span className="text-slate-800">{user?.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <strong className="text-slate-600">Mobile:</strong> 
                        <span className="text-slate-800">{user?.mobile}</span>
                      </div>
                      <div className="flex justify-between">
                        <strong className="text-slate-600">Type:</strong> 
                        <span className="text-indigo-600 font-medium">{user?.userType}</span>
                      </div>
                    </div>
                  </div>
                ),
                disabled: true
              }
            ]
          }}
          trigger={['click']}
        >
          <div className="mx-2 mb-2 px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 text-slate-600 hover:text-slate-800 rounded-xl transition-all duration-300">
            <UserOutlined className="text-xl" />
            <span className="font-medium">Profile</span>
          </div>
        </Dropdown>
      </div>

      {/* Logout */}
      <div className="border-t border-slate-200 p-2">
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

  return (
    <Layout className="min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <Sider
        width={280}
        className="hidden lg:block bg-white border-r border-slate-200 shadow-lg"
        style={{ height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0 }}
      >
        {sidebarMenu}
      </Sider>

      {/* Mobile Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <MenuOutlined className="text-white text-sm" />
            </div>
            <span className="text-slate-800 font-semibold">Menu</span>
          </div>
        }
        placement="left"
        onClose={() => setMobileDrawerVisible(false)}
        open={mobileDrawerVisible}
        width={280}
        styles={{ body: { padding: 0 } }}
      >
        {sidebarMenu}
      </Drawer>

      {/* Main Content */}
      <Layout style={{ marginLeft: window.innerWidth >= 1024 ? 280 : 0 }}>
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setMobileDrawerVisible(true)}
            size="large"
            className="hover:bg-indigo-50 hover:text-indigo-600 rounded-xl"
          />
          <div className="font-bold text-xl text-slate-800">Admin Dashboard</div>
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <UserOutlined className="text-white" />
          </div>
        </div>

        <Content className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </span>
              </h1>
              <p className="text-slate-600 text-lg">
                Comprehensive system management and analytics overview
              </p>
            </div>

          {/* Stats Cards */}
          {analytics && (
            <Row gutter={[24, 24]} className="mb-8">
              <Col xs={24} sm={12} lg={6}>
                <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <UserOutlined className="text-white text-2xl" />
                    </div>
                    <div className="text-3xl font-bold text-emerald-600 mb-2">
                      {analytics.totalUsers || 0}
                    </div>
                    <div className="text-slate-600 font-medium">Total Users</div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <ShoppingOutlined className="text-white text-2xl" />
                    </div>
                    <div className="text-3xl font-bold text-indigo-600 mb-2">
                      {analytics.activeSubscriptions || 0}
                    </div>
                    <div className="text-slate-600 font-medium">Active Subscriptions</div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <DollarOutlined className="text-white text-2xl" />
                    </div>
                    <div className="text-3xl font-bold text-rose-600 mb-2">
                      ₹{analytics.totalRevenue || 0}
                    </div>
                    <div className="text-slate-600 font-medium">Total Revenue</div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <RiseOutlined className="text-white text-2xl" />
                    </div>
                    <div className="text-3xl font-bold text-amber-600 mb-2">
                      {analytics.monthlyGrowth || 0}%
                    </div>
                    <div className="text-slate-600 font-medium">Monthly Growth</div>
                  </div>
                </Card>
              </Col>
            </Row>
          )}

          {/* Tabs for different sections */}
          <Card className="shadow-lg border-0 bg-white rounded-xl">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              id="admin-tabs"
              className="modern-tabs"
              items={[
                {
                  key: 'users',
                  label: (
                    <div className="flex items-center gap-2">
                      <UserOutlined />
                      <span>Users ({users.length})</span>
                    </div>
                  ),
                  children: (
                    <div>
                      {userStats && (
                        <Row gutter={[16, 16]} className="mb-6">
                          <Col xs={12} sm={8} md={6}>
                            <Card size="small" className="border-0 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-indigo-600 mb-1">
                                  {userStats.total}
                                </div>
                                <div className="text-slate-600 font-medium">Total Users</div>
                              </div>
                            </Card>
                          </Col>
                          <Col xs={12} sm={8} md={6}>
                            <Card size="small" className="border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-emerald-600 mb-1">
                                  {userStats.active}
                                </div>
                                <div className="text-slate-600 font-medium">Active</div>
                              </div>
                            </Card>
                          </Col>
                          <Col xs={12} sm={8} md={6}>
                            <Card size="small" className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600 mb-1">
                                  {userStats.individual}
                                </div>
                                <div className="text-slate-600 font-medium">Individual</div>
                              </div>
                            </Card>
                          </Col>
                          <Col xs={12} sm={8} md={6}>
                            <Card size="small" className="border-0 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-green-600 mb-1">
                                  {userStats.business}
                                </div>
                                <div className="text-slate-600 font-medium">Business</div>
                              </div>
                            </Card>
                          </Col>
                        </Row>
                      )}
                      <Table
                        columns={userColumns}
                        dataSource={users}
                        rowKey="_id"
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: 1000 }}
                        className="modern-table"
                      />
                    </div>
                  )
                },
                {
                  key: 'bundles',
                  label: (
                    <div className="flex items-center gap-2">
                      <AppstoreOutlined />
                      <span>Bundles</span>
                    </div>
                  ),
                  children: (
                    <div>
                      <div className="mb-6">
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={handleAddBundle}
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 border-0 shadow-lg hover:scale-105 transition-all duration-300 rounded-xl font-semibold"
                          size="large"
                        >
                          Add Bundle
                        </Button>
                      </div>
                      <Table
                        columns={bundleColumns}
                        dataSource={bundles}
                        rowKey="_id"
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: 1200 }}
                        className="modern-table"
                      />
                    </div>
                  )
                },
                {
                  key: 'quotes',
                  label: `Quotes (${quotes.length})`,
                  children: (
                    <div>
                      {/* Connect With Us section */}
                      <div className="mb-8">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Connect With Us
                            <span className="ml-2 text-sm font-normal text-gray-500">
                              ({quotes.filter(q => q.type === 'connect').length})
                            </span>
                          </h3>
                        </div>
                        {quotes.filter(q => q.type === 'connect').length === 0 ? (
                          <div className="text-center text-gray-400 py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            No connect requests yet
                          </div>
                        ) : (
                          <Table
                            columns={[
                              { title: 'Business Name', dataIndex: 'businessName', key: 'businessName' },
                              { title: 'Contact Person', dataIndex: 'contactPerson', key: 'contactPerson' },
                              { title: 'Email', dataIndex: 'email', key: 'email' },
                              { title: 'Phone', dataIndex: 'phone', key: 'phone' },
                              {
                                title: 'Business Type',
                                dataIndex: 'businessType',
                                key: 'businessType',
                                render: (type) => <Tag>{type ? type.toUpperCase() : 'N/A'}</Tag>
                              },
                              {
                                title: 'Message',
                                dataIndex: 'additionalRequirements',
                                key: 'message',
                                render: (msg) => msg
                                  ? <span className="text-sm text-gray-600">{msg.length > 60 ? msg.slice(0, 60) + '…' : msg}</span>
                                  : <span className="text-gray-400">—</span>
                              },
                              {
                                title: 'Received',
                                dataIndex: 'createdAt',
                                key: 'createdAt',
                                render: (date) => new Date(date).toLocaleDateString()
                              },
                              {
                                title: 'Status',
                                dataIndex: 'status',
                                key: 'status',
                                render: (status) => {
                                  const colors = { pending: 'orange', contacted: 'blue', accepted: 'green', rejected: 'red' };
                                  return <Tag color={colors[status] || 'default'}>{status ? status.toUpperCase() : 'N/A'}</Tag>;
                                }
                              },
                              {
                                title: 'Actions',
                                key: 'actions',
                                render: (_, record) => (
                                  <div className="flex gap-2">
                                    <Button size="small" type="primary" icon={<EyeOutlined />}
                                      onClick={() => handleViewQuoteDetails(record)}>
                                      View
                                    </Button>
                                    <Select size="small" value={record.status}
                                      onChange={(value) => handleUpdateQuoteStatus(record._id, value)}
                                      style={{ width: 130 }}>
                                      <Select.Option value="pending">Pending</Select.Option>
                                      <Select.Option value="contacted">Contacted</Select.Option>
                                      <Select.Option value="accepted">Accepted</Select.Option>
                                      <Select.Option value="rejected">Rejected</Select.Option>
                                    </Select>
                                  </div>
                                )
                              }
                            ]}
                            dataSource={quotes.filter(q => q.type === 'connect')}
                            rowKey="_id"
                            pagination={{ pageSize: 10 }}
                            scroll={{ x: 900 }}
                            size="small"
                          />
                        )}
                      </div>

                      {/* Quotation Requests section */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Quotation Requests
                            <span className="ml-2 text-sm font-normal text-gray-500">
                              ({quotes.filter(q => q.type !== 'connect').length})
                            </span>
                          </h3>
                        </div>
                        {quotes.filter(q => q.type !== 'connect').length === 0 ? (
                          <div className="text-center text-gray-400 py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            No quotation requests yet
                          </div>
                        ) : (
                          <Table
                            columns={[
                              { title: 'Business Name', dataIndex: 'businessName', key: 'businessName' },
                              { title: 'Contact Person', dataIndex: 'contactPerson', key: 'contactPerson' },
                              { title: 'Email', dataIndex: 'email', key: 'email' },
                              { title: 'Phone', dataIndex: 'phone', key: 'phone' },
                              {
                                title: 'Business Type',
                                dataIndex: 'businessType',
                                key: 'businessType',
                                render: (type) => <Tag>{type ? type.toUpperCase() : 'N/A'}</Tag>
                              },
                              {
                                title: 'Properties',
                                dataIndex: 'numberOfProperties',
                                key: 'numberOfProperties',
                                render: (n) => n || '—'
                              },
                              {
                                title: 'Bundles',
                                dataIndex: 'bundleSelections',
                                key: 'bundleSelections',
                                render: (selections) => selections && selections.length > 0
                                  ? <span className="text-sm">{selections.map(s => s.bundleName).join(', ')}</span>
                                  : <span className="text-gray-400">—</span>
                              },
                              {
                                title: 'Est. Total',
                                dataIndex: 'estimatedCost',
                                key: 'estimatedCost',
                                render: (cost) => cost && cost.total
                                  ? <span className="font-semibold text-blue-600">₹{cost.total}</span>
                                  : <span className="text-gray-400">—</span>
                              },
                              {
                                title: 'Status',
                                dataIndex: 'status',
                                key: 'status',
                                render: (status) => {
                                  const colors = { pending: 'orange', contacted: 'blue', quote_sent: 'cyan', negotiating: 'purple', accepted: 'green', rejected: 'red' };
                                  const labels = { pending: 'PENDING', contacted: 'CONTACTED', quote_sent: 'QUOTE SENT', negotiating: 'NEGOTIATING', accepted: 'ACCEPTED', rejected: 'REJECTED' };
                                  return <Tag color={colors[status] || 'default'}>{labels[status] || status?.toUpperCase() || 'N/A'}</Tag>;
                                }
                              },
                              {
                                title: 'Actions',
                                key: 'actions',
                                render: (_, record) => (
                                  <div className="flex gap-2">
                                    <Button size="small" type="primary" icon={<EyeOutlined />}
                                      onClick={() => handleViewQuoteDetails(record)}>
                                      View
                                    </Button>
                                    <Select size="small" value={record.status}
                                      onChange={(value) => handleUpdateQuoteStatus(record._id, value)}
                                      style={{ width: 140 }}>
                                      <Select.Option value="pending">Pending</Select.Option>
                                      <Select.Option value="contacted">Contacted</Select.Option>
                                      <Select.Option value="quote_sent">Quote Sent</Select.Option>
                                      <Select.Option value="negotiating">Negotiating</Select.Option>
                                      <Select.Option value="accepted">Accepted</Select.Option>
                                      <Select.Option value="rejected">Rejected</Select.Option>
                                    </Select>
                                  </div>
                                )
                              }
                            ]}
                            dataSource={quotes.filter(q => q.type !== 'connect')}
                            rowKey="_id"
                            pagination={{ pageSize: 10 }}
                            scroll={{ x: 1100 }}
                            size="small"
                          />
                        )}
                      </div>
                    </div>
                  )
                },
                {
                  key: 'tickets',
                  label: `Support Tickets (${tickets.length})`,
                  children: (
                    <Table
                      columns={ticketColumns}
                      dataSource={tickets}
                      rowKey="_id"
                      pagination={{ pageSize: 10 }}
                      scroll={{ x: 1000 }}
                    />
                  )
                },
                {
                  key: 'science-images',
                  label: '🖼️ Science Card Images',
                  children: (
                    <div>
                      <p className="text-gray-500 mb-6 text-sm">
                        Upload images for each Science Behind It card. Images are stored via Cloudinary and displayed on the homepage.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[
                          { id: 'health',  label: 'Health Benefits',        emoji: '🫀' },
                          { id: 'hygiene', label: 'Hospital-Grade Hygiene', emoji: '💉' },
                          { id: 'energy',  label: 'Energy & Balance',       emoji: '⚡' },
                          { id: 'mental',  label: 'Mental Well-being',      emoji: '🧠' },
                        ].map(card => {
                          const storageKey = `scienceCardImage_${card.id}`;
                          const currentImg = localStorage.getItem(storageKey) || '';
                          return (
                            <div key={card.id} className="border border-gray-200 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-xl">{card.emoji}</span>
                                <span className="font-semibold text-gray-800">{card.label}</span>
                              </div>
                              {currentImg && (
                                <div className="mb-3 rounded-lg overflow-hidden h-32">
                                  <img src={currentImg} alt={card.label} className="w-full h-full object-cover" />
                                </div>
                              )}
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Paste Cloudinary image URL..."
                                  defaultValue={currentImg}
                                  id={`science-img-${card.id}`}
                                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                />
                                <button
                                  onClick={() => {
                                    const val = document.getElementById(`science-img-${card.id}`).value.trim();
                                    if (val) {
                                      localStorage.setItem(storageKey, val);
                                      window.dispatchEvent(new Event('storage'));
                                      appMessage.success(`Image updated for ${card.label}`);
                                    } else {
                                      localStorage.removeItem(storageKey);
                                      window.dispatchEvent(new Event('storage'));
                                      appMessage.info(`Image removed for ${card.label}`);
                                    }
                                  }}
                                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                                  style={{ background: 'linear-gradient(135deg,#1a3a8a,#3a7bd5)' }}
                                >
                                  Save
                                </button>
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                Upload to Cloudinary first, then paste the URL here.
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )
                },
                {
                  key: 'all_orders',
                  label: (
                    <div className="flex items-center gap-2">
                      <FilterOutlined />
                      <span>All Orders {orders.length > 0 && `(${orders.length})`}</span>
                    </div>
                  ),
                  children: (() => {
                    // ── Compute unique bundle names for the filter dropdown ──
                    const allBundleNames = [...new Set(
                      orders.flatMap(o => (o.orderedBundles || []).map(b => b.bundleName).filter(Boolean))
                    )].sort();

                    // ── Apply filters ──────────────────────────────────────
                    const filteredOrders = orders.filter(o => {
                      // Status filter
                      if (orderFilterStatus !== 'all' && o.status !== orderFilterStatus) return false;

                      // Bundle/category filter
                      if (orderFilterBundle !== 'all') {
                        const names = (o.orderedBundles || []).map(b => b.bundleName);
                        if (!names.includes(orderFilterBundle)) return false;
                      }

                      // Date range filter
                      const [from, to] = orderFilterDateRange;
                      if (from && to) {
                        const created = new Date(o.createdAt);
                        const start = from.startOf('day').toDate();
                        const end   = to.endOf('day').toDate();
                        if (created < start || created > end) return false;
                      }

                      return true;
                    });

                    const STATUS_COLORS = {
                      pending:          'default',
                      assigned:         'blue',
                      packed:           'cyan',
                      out_for_delivery: 'orange',
                      under_review:     'purple',
                      delivered:        'green',
                    };
                    const STATUS_LABELS = {
                      pending:          'Pending',
                      assigned:         'Assigned',
                      packed:           'Packed',
                      out_for_delivery: 'Out for Delivery',
                      under_review:     'Under Review',
                      delivered:        'Delivered',
                    };

                    return (
                      <div>
                        {/* ── Filter bar ── */}
                        <div className="flex flex-wrap items-center gap-3 mb-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-sm font-semibold text-slate-600 flex items-center gap-1">
                            <FilterOutlined /> Filters:
                          </span>

                          {/* Status filter */}
                          <Select
                            value={orderFilterStatus}
                            onChange={setOrderFilterStatus}
                            style={{ width: 170 }}
                            size="small"
                          >
                            <Select.Option value="all">All Statuses</Select.Option>
                            <Select.Option value="pending">Pending</Select.Option>
                            <Select.Option value="assigned">Assigned</Select.Option>
                            <Select.Option value="packed">Packed</Select.Option>
                            <Select.Option value="out_for_delivery">Out for Delivery</Select.Option>
                            <Select.Option value="under_review">Under Review</Select.Option>
                            <Select.Option value="delivered">Delivered</Select.Option>
                          </Select>

                          {/* Bundle / category filter */}
                          <Select
                            value={orderFilterBundle}
                            onChange={setOrderFilterBundle}
                            style={{ width: 200 }}
                            size="small"
                          >
                            <Select.Option value="all">All Bundle Types</Select.Option>
                            {allBundleNames.map(name => (
                              <Select.Option key={name} value={name}>{name}</Select.Option>
                            ))}
                          </Select>

                          {/* Date range filter */}
                          <DatePicker.RangePicker
                            size="small"
                            value={orderFilterDateRange}
                            onChange={dates => setOrderFilterDateRange(dates || [null, null])}
                            format="DD MMM YYYY"
                            allowClear
                            placeholder={['From date', 'To date']}
                          />

                          {/* Clear filters */}
                          {(orderFilterStatus !== 'all' || orderFilterBundle !== 'all' || orderFilterDateRange[0]) && (
                            <Button
                              size="small"
                              onClick={() => {
                                setOrderFilterStatus('all');
                                setOrderFilterBundle('all');
                                setOrderFilterDateRange([null, null]);
                              }}
                            >
                              Clear
                            </Button>
                          )}

                          <span className="ml-auto text-xs text-slate-500">
                            Showing {filteredOrders.length} of {orders.length} orders
                          </span>

                          <Button size="small" onClick={fetchOrders} loading={ordersLoading}>
                            Refresh
                          </Button>
                        </div>

                        {/* ── Orders table ── */}
                        <Table
                          columns={[
                            {
                              title: 'Order ID',
                              key: 'orderId',
                              render: (_, o) => <Tag color="blue" className="font-mono">{shortId(o._id)}</Tag>
                            },
                            {
                              title: 'User',
                              key: 'user',
                              render: (_, o) => (
                                <div>
                                  <div className="font-medium text-slate-800">{o.userId?.name || '—'}</div>
                                  <div className="text-xs text-slate-500">{o.userId?.email || shortId(o.userId)}</div>
                                </div>
                              )
                            },
                            {
                              title: 'Bundle Types',
                              key: 'bundles',
                              render: (_, o) => (
                                <div className="flex flex-wrap gap-1">
                                  {(o.orderedBundles || []).map((b, i) => (
                                    <Tag key={i} color="geekblue" className="text-xs">
                                      {b.bundleName} ×{b.quantity}
                                    </Tag>
                                  ))}
                                </div>
                              )
                            },
                            {
                              title: 'Status',
                              key: 'status',
                              render: (_, o) => (
                                <Tag color={STATUS_COLORS[o.status] || 'default'}>
                                  {STATUS_LABELS[o.status] || o.status}
                                </Tag>
                              ),
                              filters: Object.entries(STATUS_LABELS).map(([v, t]) => ({ text: t, value: v })),
                              onFilter: (value, record) => record.status === value,
                            },
                            {
                              title: 'Assigned To',
                              key: 'assignedTo',
                              render: (_, o) => o.assignedPickupMemberId?.name
                                ? <span className="text-slate-700">{o.assignedPickupMemberId.name}</span>
                                : <span className="text-slate-400">—</span>
                            },
                            {
                              title: 'Created At',
                              key: 'createdAt',
                              render: (_, o) => o.createdAt
                                ? new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                : '—',
                              sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
                              defaultSortOrder: 'descend',
                            },
                            {
                              title: 'Action',
                              key: 'action',
                              render: (_, o) => o.status === 'pending' ? (
                                <Button
                                  type="primary"
                                  size="small"
                                  icon={<UserOutlined />}
                                  onClick={() => handleOpenAssignModal(o)}
                                  className="bg-gradient-to-r from-indigo-500 to-purple-600 border-0"
                                >
                                  Assign
                                </Button>
                              ) : o.status === 'under_review' ? (
                                <div className="space-x-1">
                                  <Button
                                    size="small"
                                    type="primary"
                                    icon={<CheckOutlined />}
                                    onClick={() => handleApproveDelivery(o)}
                                    style={{ background: '#10b981', borderColor: '#10b981' }}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="small"
                                    danger
                                    icon={<CloseOutlined />}
                                    onClick={() => handleOpenRejectModal(o)}
                                  >
                                    Reject
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400">—</span>
                              )
                            }
                          ]}
                          dataSource={filteredOrders}
                          rowKey="_id"
                          loading={ordersLoading}
                          pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (t) => `${t} orders` }}
                          scroll={{ x: 1000 }}
                          locale={{ emptyText: 'No orders match the selected filters' }}
                        />
                      </div>
                    );
                  })()
                },
                {
                  key: 'pending_orders',
                  label: (
                    <div className="flex items-center gap-2">
                      <ShopOutlined />
                      <span>Pending Orders {orders.filter(o => o.status === 'pending').length > 0 && `(${orders.filter(o => o.status === 'pending').length})`}</span>
                    </div>
                  ),
                  children: (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-800">Pending Orders — Assign to Warehouse Manager</h3>
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
                            title: 'User',
                            key: 'user',
                            render: (_, o) => (
                              <div>
                                <div className="font-medium">{o.userId?.name || '—'}</div>
                                <div className="text-xs text-slate-500">{o.userId?.email || shortId(o.userId)}</div>
                              </div>
                            )
                          },
                          {
                            title: 'Subscription ID',
                            key: 'subId',
                            render: (_, o) => <span className="font-mono text-sm">{shortId(o.subscriptionId?._id || o.subscriptionId)}</span>
                          },
                          {
                            title: 'Bundle Types',
                            key: 'bundles',
                            render: (_, o) => (
                              <div className="flex flex-wrap gap-1">
                                {(o.orderedBundles || []).map((b, i) => (
                                  <Tag key={i} color="geekblue" className="text-xs">{b.bundleName} ×{b.quantity}</Tag>
                                ))}
                                {o.orderType === 'renewal' && (
                                  <Tag color="volcano" className="text-xs">Renewal</Tag>
                                )}
                              </div>
                            )
                          },
                          {
                            title: 'Created At',
                            key: 'createdAt',
                            render: (_, o) => o.createdAt
                              ? new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                              : '—',
                            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
                            defaultSortOrder: 'descend',
                          },
                          {
                            title: 'Action',
                            key: 'action',
                            render: (_, o) => (
                              <Button
                                type="primary"
                                size="small"
                                icon={<UserOutlined />}
                                onClick={() => handleOpenAssignModal(o)}
                                className="bg-gradient-to-r from-indigo-500 to-purple-600 border-0"
                              >
                                Assign Warehouse
                              </Button>
                            )
                          }
                        ]}
                        dataSource={orders.filter(o => o.status === 'pending')}
                        rowKey="_id"
                        loading={ordersLoading}
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: 800 }}
                        locale={{ emptyText: 'No pending orders' }}
                      />
                    </div>
                  )
                },
                {
                  key: 'ready_for_pickup',
                  label: (
                    <div className="flex items-center gap-2">
                      <TruckOutlined />
                      <span>Ready for Pickup {orders.filter(o => o.status === 'ready_for_pickup').length > 0 && `(${orders.filter(o => o.status === 'ready_for_pickup').length})`}</span>
                    </div>
                  ),
                  children: (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-800">Ready for Pickup — Assign to Logistics Partner</h3>
                        <Button onClick={fetchOrders} loading={ordersLoading}>Refresh</Button>
                      </div>
                      <Table
                        columns={[
                          {
                            title: 'Order ID',
                            key: 'orderId',
                            render: (_, o) => <Tag color="geekblue" className="font-mono">{shortId(o._id)}</Tag>
                          },
                          {
                            title: 'User',
                            key: 'user',
                            render: (_, o) => (
                              <div>
                                <div className="font-medium">{o.userId?.name || '—'}</div>
                                <div className="text-xs text-slate-500">{o.userId?.email || shortId(o.userId)}</div>
                              </div>
                            )
                          },
                          {
                            title: 'Bundle Types',
                            key: 'bundles',
                            render: (_, o) => (
                              <div className="flex flex-wrap gap-1">
                                {(o.orderedBundles || []).map((b, i) => (
                                  <Tag key={i} color="geekblue" className="text-xs">{b.bundleName} ×{b.quantity}</Tag>
                                ))}
                                {o.orderType === 'renewal' && (
                                  <Tag color="volcano" className="text-xs">Renewal</Tag>
                                )}
                              </div>
                            )
                          },
                          {
                            title: 'Warehouse Manager',
                            key: 'wm',
                            render: (_, o) => o.assignedWarehouseManagerId?.name || shortId(o.assignedWarehouseManagerId) || '—'
                          },
                          {
                            title: 'Bag ID',
                            key: 'bagId',
                            render: (_, o) => o.bagId
                              ? <Tag color="geekblue" style={{ fontWeight: 600 }}>{o.bagId}</Tag>
                              : <span className="text-slate-400">—</span>
                          },
                          {
                            title: 'Action',
                            key: 'action',
                            render: (_, o) => (
                              <Button
                                type="primary"
                                size="small"
                                icon={<TruckOutlined />}
                                onClick={() => handleOpenAssignLogisticsModal(o)}
                                style={{ background: '#10b981', borderColor: '#10b981' }}
                              >
                                Assign Logistics
                              </Button>
                            )
                          }
                        ]}
                        dataSource={orders.filter(o => o.status === 'ready_for_pickup')}
                        rowKey="_id"
                        loading={ordersLoading}
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: 800 }}
                        locale={{ emptyText: 'No orders ready for pickup' }}
                      />
                    </div>
                  )
                },
                {
                  key: 'delivery_review',
                  label: (
                    <div className="flex items-center gap-2">
                      <TruckOutlined />
                      <span>Delivery Review {orders.filter(o => o.status === 'under_review').length > 0 && `(${orders.filter(o => o.status === 'under_review').length})`}</span>
                    </div>
                  ),
                  children: (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-800">Delivery Review</h3>
                        <Button onClick={fetchOrders} loading={ordersLoading}>Refresh</Button>
                      </div>
                      <Table
                        columns={[
                          {
                            title: 'Order ID',
                            key: 'orderId',
                            render: (_, o) => <Tag color="purple" className="font-mono">{shortId(o._id)}</Tag>
                          },
                          {
                            title: 'Logistics Partner',
                            key: 'pm',
                            render: (_, o) => o.assignedLogisticsPartnerId?.name || shortId(o.assignedLogisticsPartnerId) || '—'
                          },
                          {
                            title: 'Delivery Address',
                            key: 'address',
                            render: (_, o) => o.deliveryForm
                              ? `${o.deliveryForm.buildingName || ''}, Floor ${o.deliveryForm.floor || ''}, Room ${o.deliveryForm.roomNumber || ''}`
                              : '—'
                          },
                          {
                            title: 'Images',
                            key: 'images',
                            render: (_, o) => {
                              const imgs = o.deliveryForm?.images || [];
                              if (!imgs.length) return '—';
                              return (
                                <Button
                                  size="small"
                                  icon={<EyeOutlined />}
                                  onClick={() => {
                                    setPreviewImages(imgs);
                                    setPreviewIndex(0);
                                    setPreviewVisible(true);
                                  }}
                                >
                                  View {imgs.length} photo{imgs.length > 1 ? 's' : ''}
                                </Button>
                              );
                            }
                          },
                          {
                            title: 'Actions',
                            key: 'actions',
                            render: (_, o) => (
                              <div className="space-x-2">
                                <Button
                                  size="small"
                                  type="primary"
                                  icon={<CheckOutlined />}
                                  onClick={() => handleApproveDelivery(o)}
                                  style={{ background: '#10b981', borderColor: '#10b981' }}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="small"
                                  danger
                                  icon={<CloseOutlined />}
                                  onClick={() => handleOpenRejectModal(o)}
                                >
                                  Reject
                                </Button>
                              </div>
                            )
                          }
                        ]}
                        dataSource={orders.filter(o => o.status === 'under_review')}
                        rowKey="_id"
                        loading={ordersLoading}
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: 900 }}
                        locale={{ emptyText: 'No deliveries awaiting review' }}
                      />
                    </div>
                  )
                },
                {
                  key: 'quality_checks',
                  label: (
                    <div className="flex items-center gap-2">
                      <span>🔍</span>
                      <span>Quality Checks</span>
                    </div>
                  ),
                  children: (
                    <QualityChecksPanel />
                  )
                }
              ]}
            />
          </Card>

          {/* Bundle Modal */}
          <Modal
            title={editingBundle ? 'Edit Bundle' : 'Add New Bundle'}
            open={isBundleModalVisible}
            onCancel={() => {
              setIsBundleModalVisible(false);
              form.resetFields();
              setBundleImage(null);
              setBundleImagePreview('');
            }}
            footer={null}
            width={600}
          >
            <Form form={form} onFinish={handleSaveBundle} layout="vertical">
              <Form.Item
                name="name"
                label="Bundle Name"
                rules={[{ required: true, message: 'Please enter bundle name' }]}
              >
                <Input placeholder="e.g., Single Bed Bundle" />
              </Form.Item>

              <Form.Item
                name="description"
                label="Description"
                rules={[{ required: true, message: 'Please enter description' }]}
              >
                <TextArea rows={3} placeholder="Bundle description" />
              </Form.Item>

              <Form.Item label="Bundle Image">
                <Upload
                  listType="picture-card"
                  maxCount={1}
                  beforeUpload={() => false}
                  onChange={handleImageChange}
                  onRemove={() => {
                    setBundleImage(null);
                    setBundleImagePreview('');
                  }}
                  showUploadList={!bundleImagePreview}
                >
                  {!bundleImagePreview && (
                    <div>
                      <PictureOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>
                {bundleImagePreview && (
                  <div style={{ marginTop: 8 }}>
                    <Image src={bundleImagePreview} width={200} style={{ borderRadius: 8 }} />
                    <Button 
                      danger 
                      size="small" 
                      onClick={() => {
                        setBundleImage(null);
                        setBundleImagePreview('');
                      }}
                      style={{ marginTop: 8 }}
                    >
                      Remove Image
                    </Button>
                  </div>
                )}
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="price"
                    label="Price (₹)"
                    rules={[{ required: true, message: 'Please enter price' }]}
                  >
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="billingCycle"
                    label="Billing Cycle"
                    rules={[{ required: true, message: 'Please select billing cycle' }]}
                  >
                    <Select>
                      <Select.Option value="monthly">Monthly</Select.Option>
                      <Select.Option value="quarterly">Quarterly</Select.Option>
                      <Select.Option value="yearly">Yearly</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="securityDeposit"
                label="Security Deposit per Bundle (₹)"
                tooltip="Refundable deposit charged per bundle quantity selected by the user"
                rules={[{ required: true, message: 'Please enter security deposit' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="e.g., 500"
                  prefix="₹"
                />
              </Form.Item>

              <div className="mb-4 font-semibold">Bundle Items:</div>

              {bundleItems.map((item, index) => (
                <Row gutter={16} key={index} className="mb-3">
                  <Col xs={24} sm={10}>
                    <Form.Item label={index === 0 ? "Category" : ""} required>
                      <Select
                        value={item.category}
                        onChange={(value) => handleBundleItemChange(index, 'category', value)}
                        placeholder="Select category"
                      >
                        {categories.filter(cat => cat.active).map(category => (
                          <Select.Option key={category._id} value={category._id}>
                            {category.name} (₹{category.price})
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={16} sm={10}>
                    <Form.Item label={index === 0 ? "Quantity" : ""} required>
                      <InputNumber
                        min={1}
                        value={item.quantity}
                        onChange={(value) => handleBundleItemChange(index, 'quantity', value)}
                        style={{ width: '100%' }}
                        placeholder="Quantity"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={8} sm={4}>
                    <Form.Item label={index === 0 ? " " : ""}>
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveBundleItem(index)}
                        disabled={bundleItems.length === 1}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              ))}

              <Button
                type="dashed"
                onClick={handleAddBundleItem}
                icon={<PlusOutlined />}
                block
                className="mb-4"
              >
                Add Item
              </Button>

              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  {editingBundle ? 'Update Bundle' : 'Create Bundle'}
                </Button>
              </Form.Item>
            </Form>
          </Modal>

          {/* Edit User Modal */}
          <Modal
            title="Edit User"
            open={isUserModalVisible}
            onCancel={() => {
              setIsUserModalVisible(false);
              userForm.resetFields();
            }}
            footer={null}
          >
            <Form form={userForm} onFinish={handleSaveUser} layout="vertical">
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: 'Please enter name' }]}
              >
                <Input placeholder="Full Name" />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, type: 'email', message: 'Please enter valid email' }]}
              >
                <Input placeholder="Email" />
              </Form.Item>

              <Form.Item
                name="mobile"
                label="Mobile"
                rules={[
                  { required: true, message: 'Please enter mobile' },
                  { pattern: /^[0-9]{10}$/, message: 'Enter valid 10-digit mobile' }
                ]}
              >
                <Input placeholder="10-digit mobile number" />
              </Form.Item>

              <Form.Item
                name="address"
                label="Address"
                rules={[{ required: true, message: 'Please enter address' }]}
              >
                <TextArea rows={3} placeholder="Full address" />
              </Form.Item>

              <Form.Item
                name="userType"
                label="User Type"
                rules={[{ required: true, message: 'Please select user type' }]}
              >
                <Select>
                  <Select.Option value="individual">Individual</Select.Option>
                  <Select.Option value="business">Business</Select.Option>
                  <Select.Option value="admin">Admin</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Update User
                </Button>
              </Form.Item>
            </Form>
          </Modal>

          {/* Quote Details Modal */}
          <Modal
            title={
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${selectedQuote?.type === 'connect' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                {selectedQuote?.type === 'connect' ? 'Connect Request Details' : 'Quotation Request Details'}
              </div>
            }
            open={isQuoteDetailModalVisible}
            onCancel={() => setIsQuoteDetailModalVisible(false)}
            footer={null}
            width={700}
          >
            {selectedQuote && (
              <div>
                <Descriptions bordered column={2} size="small">
                  <Descriptions.Item label="Business Name" span={2}>
                    {selectedQuote.businessName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Contact Person">
                    {selectedQuote.contactPerson}
                  </Descriptions.Item>
                  <Descriptions.Item label="Business Type">
                    <Tag>{selectedQuote.businessType?.toUpperCase()}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {selectedQuote.email}
                  </Descriptions.Item>
                  <Descriptions.Item label="Phone">
                    {selectedQuote.phone}
                  </Descriptions.Item>
                  <Descriptions.Item label="Type" span={2}>
                    <Tag color={selectedQuote.type === 'connect' ? 'blue' : 'green'}>
                      {selectedQuote.type === 'connect' ? 'CONNECT REQUEST' : 'QUOTATION REQUEST'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Status" span={2}>
                    <Tag color={selectedQuote.status === 'pending' ? 'orange' : 'blue'}>
                      {selectedQuote.status?.toUpperCase()}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Received" span={2}>
                    {new Date(selectedQuote.createdAt).toLocaleString()}
                  </Descriptions.Item>
                </Descriptions>

                {/* Message for connect type */}
                {selectedQuote.type === 'connect' && selectedQuote.additionalRequirements && (
                  <>
                    <Divider>Message</Divider>
                    <Card size="small" className="bg-blue-50">
                      <div className="text-sm">{selectedQuote.additionalRequirements}</div>
                    </Card>
                  </>
                )}

                {/* Bundle selections for quotation type */}
                {selectedQuote.type !== 'connect' && selectedQuote.bundleSelections && selectedQuote.bundleSelections.length > 0 && (
                  <>
                    <Divider>Bundle Selections</Divider>
                    <div className="space-y-2 mb-4">
                      {selectedQuote.bundleSelections.map((sel, i) => (
                        <Card key={i} size="small" className="bg-gray-50">
                          <Row gutter={16}>
                            <Col span={12}>
                              <div className="text-sm font-semibold">{sel.bundleName}</div>
                            </Col>
                            <Col span={6}>
                              <div className="text-xs text-gray-500">Qty/property: <strong>{sel.quantity}</strong></div>
                            </Col>
                            <Col span={6}>
                              <div className="text-xs text-gray-500">Duration: <strong>{sel.duration} mo</strong></div>
                            </Col>
                          </Row>
                        </Card>
                      ))}
                    </div>

                    {selectedQuote.numberOfProperties && (
                      <div className="text-sm text-gray-600 mb-4 bg-blue-50 p-3 rounded-lg">
                        <div className="flex justify-between mb-1">
                          <span><strong>Number of Properties:</strong></span>
                          <span>{selectedQuote.numberOfProperties}</span>
                        </div>
                        {selectedQuote.unitsPerProperty && (
                          <div className="flex justify-between mb-1">
                            <span><strong>Approx. Units per Property:</strong></span>
                            <span>{selectedQuote.unitsPerProperty}</span>
                          </div>
                        )}
                        {selectedQuote.totalUnits && (
                          <div className="flex justify-between font-semibold border-t border-blue-200 pt-1 mt-1">
                            <span>Total Units:</span>
                            <span>{selectedQuote.totalUnits}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedQuote.estimatedCost && selectedQuote.estimatedCost.total > 0 && (
                      <Card className="bg-blue-50 mb-4">
                        <div className="font-semibold mb-2">Estimated Cost Breakdown</div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Subscription Total</span>
                            <span>₹{selectedQuote.estimatedCost.original}</span>
                          </div>
                          {selectedQuote.estimatedCost.discount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Discount</span>
                              <span>-₹{selectedQuote.estimatedCost.discount}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>After Discount</span>
                            <span>₹{selectedQuote.estimatedCost.final}</span>
                          </div>
                          <div className="flex justify-between text-blue-600">
                            <span>Security Deposit (refundable)</span>
                            <span>₹{selectedQuote.estimatedCost.deposit}</span>
                          </div>
                          <Divider className="my-1" />
                          <div className="flex justify-between font-bold text-base">
                            <span>Estimated Total</span>
                            <span className="text-blue-600">₹{selectedQuote.estimatedCost.total}</span>
                          </div>
                        </div>
                      </Card>
                    )}
                  </>
                )}

                {selectedQuote.additionalRequirements && selectedQuote.type !== 'connect' && (
                  <>
                    <Divider>Additional Requirements</Divider>
                    <Card size="small">
                      <div className="text-sm">{selectedQuote.additionalRequirements}</div>
                    </Card>
                  </>
                )}

                <Divider />

                <div className="flex gap-2">
                  <Select
                    value={selectedQuote.status}
                    onChange={(value) => {
                      handleUpdateQuoteStatus(selectedQuote._id, value);
                      setSelectedQuote({ ...selectedQuote, status: value });
                    }}
                    style={{ width: 200 }}
                  >
                    <Select.Option value="pending">Pending</Select.Option>
                    <Select.Option value="contacted">Contacted</Select.Option>
                    {selectedQuote.type !== 'connect' && (
                      <>
                        <Select.Option value="quote_sent">Quote Sent</Select.Option>
                        <Select.Option value="negotiating">Negotiating</Select.Option>
                      </>
                    )}
                    <Select.Option value="accepted">Accepted</Select.Option>
                    <Select.Option value="rejected">Rejected</Select.Option>
                  </Select>
                  <Button onClick={() => setIsQuoteDetailModalVisible(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </Modal>

          {/* Assign Warehouse Manager Modal */}
          <Modal
            title={`Assign Order #${shortId(assignModal.order?._id)} to Warehouse Manager`}
            open={assignModal.visible}
            onCancel={() => { setAssignModal({ visible: false, order: null }); setAssigningPickupMemberId(null); }}
            onOk={handleAssignOrder}
            okText="Assign"
            confirmLoading={submitting}
            okButtonProps={{ disabled: !assigningPickupMemberId }}
          >
            <p className="mb-4 text-slate-600">
              Select an approved warehouse manager to handle this order.
            </p>
            <Select
              style={{ width: '100%' }}
              placeholder="Select warehouse manager"
              value={assigningPickupMemberId}
              onChange={setAssigningPickupMemberId}
              showSearch
              filterOption={(input, option) =>
                option.children?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {pickupMembers.map(pm => (
                <Select.Option key={pm._id} value={pm._id}>
                  {pm.name} ({pm.email})
                </Select.Option>
              ))}
            </Select>
          </Modal>

          {/* Assign Logistics Partner Modal */}
          <Modal
            title={`Assign Order #${shortId(assignLogisticsModal.order?._id)} to Logistics Partner`}
            open={assignLogisticsModal.visible}
            onCancel={() => { setAssignLogisticsModal({ visible: false, order: null }); setAssigningLogisticsPartnerId(null); }}
            onOk={handleAssignLogistics}
            okText="Assign"
            confirmLoading={submitting}
            okButtonProps={{ disabled: !assigningLogisticsPartnerId }}
          >
            <p className="mb-4 text-slate-600">
              Select an approved logistics partner to deliver this order.
            </p>
            <Select
              style={{ width: '100%' }}
              placeholder="Select logistics partner"
              value={assigningLogisticsPartnerId}
              onChange={setAssigningLogisticsPartnerId}
              showSearch
              filterOption={(input, option) =>
                option.children?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {logisticsPartners.map(lp => (
                <Select.Option key={lp._id} value={lp._id}>
                  {lp.name} ({lp.email})
                </Select.Option>
              ))}
            </Select>
          </Modal>

          {/* Reject Delivery Modal */}
          <Modal
            title={`Reject Delivery — Order #${shortId(rejectModal.order?._id)}`}
            open={rejectModal.visible}
            onCancel={() => { setRejectModal({ visible: false, order: null }); setRejectionReason(''); }}
            onOk={handleRejectDelivery}
            okText="Reject Delivery"
            okButtonProps={{ danger: true, disabled: !rejectionReason.trim() }}
            confirmLoading={submitting}
          >
            <p className="mb-3 text-slate-600">
              Please provide a reason for rejecting this delivery. The pickup member will be notified.
            </p>
            <TextArea
              rows={4}
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
            />
          </Modal>

          {/* Image Preview Modal */}
          <Modal
            open={previewVisible}
            footer={null}
            onCancel={() => setPreviewVisible(false)}
            width={800}
            title={`Delivery Photos (${previewIndex + 1} / ${previewImages.length})`}
          >
            {previewImages.length > 0 && (
              <div>
                <img
                  src={previewImages[previewIndex]}
                  alt={`Delivery photo ${previewIndex + 1}`}
                  style={{ width: '100%', borderRadius: 8, maxHeight: 500, objectFit: 'contain' }}
                />
                {previewImages.length > 1 && (
                  <div className="flex justify-center gap-4 mt-4">
                    <Button
                      disabled={previewIndex === 0}
                      onClick={() => setPreviewIndex(i => i - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      disabled={previewIndex === previewImages.length - 1}
                      onClick={() => setPreviewIndex(i => i + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
                <div className="flex gap-2 mt-4 flex-wrap">
                  {previewImages.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`thumb ${idx + 1}`}
                      onClick={() => setPreviewIndex(idx)}
                      style={{
                        width: 60, height: 60, objectFit: 'cover', borderRadius: 6,
                        cursor: 'pointer',
                        border: idx === previewIndex ? '2px solid #6366f1' : '2px solid transparent'
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </Modal>
        </div>
      </Content>
    </Layout>
  </Layout>
  );
};

export default AdminDashboard;

