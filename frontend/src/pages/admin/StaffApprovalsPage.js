import React, { useState, useEffect, useCallback } from 'react';
import {
  Layout, Card, Table, Tag, Button, Modal, Input, Select,
  Tabs, Badge, Descriptions, App
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, EyeOutlined,
  HomeOutlined, CarOutlined
} from '@ant-design/icons';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import api from '../../services/api';

const { Content } = Layout;
const { TextArea } = Input;
const { Option } = Select;

const STATUS_COLORS = {
  pending:  'orange',
  approved: 'green',
  rejected: 'red'
};

const StaffApprovalsPageInner = () => {
  const { message } = App.useApp();

  const [activeRoleTab, setActiveRoleTab] = useState('warehouse');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [warehouseManagers, setWarehouseManagers] = useState([]);
  const [logisticsPartners, setLogisticsPartners] = useState([]);

  // Detail modal
  const [detailModal, setDetailModal] = useState({ visible: false, record: null });

  // Reject modal
  const [rejectModal, setRejectModal] = useState({ visible: false, record: null });
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchWarehouseManagers = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const res = await api.get(`/warehouse-managers${params}`);
      setWarehouseManagers(res.data.warehouseManagers || res.data || []);
    } catch {
      message.error('Failed to load warehouse managers');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, message]);

  const fetchLogisticsPartners = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const res = await api.get(`/logistics-partners${params}`);
      setLogisticsPartners(res.data.logisticsPartners || res.data || []);
    } catch {
      message.error('Failed to load logistics partners');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, message]);

  useEffect(() => {
    fetchWarehouseManagers();
    fetchLogisticsPartners();
  }, [fetchWarehouseManagers, fetchLogisticsPartners]);

  // ─── Approve ──────────────────────────────────────────────────────────────
  const handleApprove = async (record) => {
    setActionLoading(true);
    try {
      const endpoint = activeRoleTab === 'warehouse'
        ? `/warehouse-managers/${record._id}/approve`
        : `/logistics-partners/${record._id}/approve`;
      await api.patch(endpoint);
      message.success(`${record.name} has been approved.`);
      fetchWarehouseManagers();
      fetchLogisticsPartners();
      setDetailModal({ visible: false, record: null });
    } catch (error) {
      message.error(error?.response?.data?.error?.message || 'Approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Reject ───────────────────────────────────────────────────────────────
  const openRejectModal = (record) => {
    setRejectReason('');
    setRejectModal({ visible: true, record });
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      message.warning('Please provide a rejection reason.');
      return;
    }
    setActionLoading(true);
    try {
      const record = rejectModal.record;
      const endpoint = activeRoleTab === 'warehouse'
        ? `/warehouse-managers/${record._id}/reject`
        : `/logistics-partners/${record._id}/reject`;
      await api.patch(endpoint, { reason: rejectReason.trim() });
      message.success(`${record.name} has been rejected.`);
      setRejectModal({ visible: false, record: null });
      fetchWarehouseManagers();
      fetchLogisticsPartners();
      setDetailModal({ visible: false, record: null });
    } catch (error) {
      message.error(error?.response?.data?.error?.message || 'Rejection failed');
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Table columns ────────────────────────────────────────────────────────
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (v) => <span className="font-semibold">{v}</span>
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Mobile',
      dataIndex: 'mobile',
      key: 'mobile',
      render: (v) => v || '—'
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const status = activeRoleTab === 'warehouse'
          ? record.warehouseManagerStatus
          : record.logisticsPartnerStatus;
        return (
          <Tag color={STATUS_COLORS[status] || 'default'}>
            {status?.toUpperCase() || 'UNKNOWN'}
          </Tag>
        );
      }
    },
    {
      title: 'Registered',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v) => v ? new Date(v).toLocaleDateString() : '—'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const status = activeRoleTab === 'warehouse'
          ? record.warehouseManagerStatus
          : record.logisticsPartnerStatus;
        return (
          <div className="flex gap-2">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setDetailModal({ visible: true, record })}
            >
              View
            </Button>
            {status === 'pending' && (
              <>
                <Button
                  size="small"
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleApprove(record)}
                  loading={actionLoading}
                  style={{ background: '#10b981', borderColor: '#10b981' }}
                >
                  Approve
                </Button>
                <Button
                  size="small"
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => openRejectModal(record)}
                >
                  Reject
                </Button>
              </>
            )}
          </div>
        );
      }
    }
  ];

  // ─── Pending counts for badges ────────────────────────────────────────────
  const warehousePending = warehouseManagers.filter(
    (u) => u.warehouseManagerStatus === 'pending'
  ).length;
  const logisticsPending = logisticsPartners.filter(
    (u) => u.logisticsPartnerStatus === 'pending'
  ).length;

  // ─── Filtered data ────────────────────────────────────────────────────────
  const filteredWarehouse = statusFilter === 'all'
    ? warehouseManagers
    : warehouseManagers.filter((u) => u.warehouseManagerStatus === statusFilter);

  const filteredLogistics = statusFilter === 'all'
    ? logisticsPartners
    : logisticsPartners.filter((u) => u.logisticsPartnerStatus === statusFilter);

  // ─── Detail modal content ─────────────────────────────────────────────────
  const renderDetailModal = () => {
    const record = detailModal.record;
    if (!record) return null;
    const status = activeRoleTab === 'warehouse'
      ? record.warehouseManagerStatus
      : record.logisticsPartnerStatus;
    const approvedBy = activeRoleTab === 'warehouse'
      ? record.warehouseManagerApprovedBy
      : record.logisticsPartnerApprovedBy;
    const approvedAt = activeRoleTab === 'warehouse'
      ? record.warehouseManagerApprovedAt
      : record.logisticsPartnerApprovedAt;
    const rejectionReason = activeRoleTab === 'warehouse'
      ? record.warehouseManagerRejectionReason
      : record.logisticsPartnerRejectionReason;

    return (
      <Modal
        title={`Staff Details — ${record.name}`}
        open={detailModal.visible}
        onCancel={() => setDetailModal({ visible: false, record: null })}
        footer={
          status === 'pending' ? [
            <Button key="close" onClick={() => setDetailModal({ visible: false, record: null })}>
              Close
            </Button>,
            <Button
              key="reject"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => openRejectModal(record)}
            >
              Reject
            </Button>,
            <Button
              key="approve"
              type="primary"
              icon={<CheckCircleOutlined />}
              loading={actionLoading}
              onClick={() => handleApprove(record)}
              style={{ background: '#10b981', borderColor: '#10b981' }}
            >
              Approve
            </Button>
          ] : [
            <Button key="close" onClick={() => setDetailModal({ visible: false, record: null })}>
              Close
            </Button>
          ]
        }
        width={560}
      >
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Name">{record.name}</Descriptions.Item>
          <Descriptions.Item label="Email">{record.email}</Descriptions.Item>
          <Descriptions.Item label="Mobile">{record.mobile || '—'}</Descriptions.Item>
          <Descriptions.Item label="Address">{record.address || '—'}</Descriptions.Item>
          <Descriptions.Item label="Registered">
            {record.createdAt ? new Date(record.createdAt).toLocaleString() : '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={STATUS_COLORS[status] || 'default'}>{status?.toUpperCase()}</Tag>
          </Descriptions.Item>
          {approvedBy && (
            <Descriptions.Item label="Approved By">
              {approvedBy?.name || approvedBy}
            </Descriptions.Item>
          )}
          {approvedAt && (
            <Descriptions.Item label="Approved At">
              {new Date(approvedAt).toLocaleString()}
            </Descriptions.Item>
          )}
          {rejectionReason && (
            <Descriptions.Item label="Rejection Reason">
              <span className="text-red-500">{rejectionReason}</span>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Modal>
    );
  };

  const roleTabs = [
    {
      key: 'warehouse',
      label: (
        <span>
          <HomeOutlined />
          Warehouse Managers
          {warehousePending > 0 && (
            <Badge count={warehousePending} className="ml-2" />
          )}
        </span>
      ),
      children: (
        <Table
          dataSource={filteredWarehouse}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
          locale={{ emptyText: 'No warehouse managers found' }}
        />
      )
    },
    {
      key: 'logistics',
      label: (
        <span>
          <CarOutlined />
          Logistics Partners
          {logisticsPending > 0 && (
            <Badge count={logisticsPending} className="ml-2" />
          )}
        </span>
      ),
      children: (
        <Table
          dataSource={filteredLogistics}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
          locale={{ emptyText: 'No logistics partners found' }}
        />
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
            Staff Approvals
          </h1>
          <p className="text-gray-500 text-lg">
            Manage warehouse manager and logistics partner registrations.
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="flex items-center gap-4">
            <span className="font-medium">Filter by Status:</span>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 160 }}
            >
              <Option value="all">All</Option>
              <Option value="pending">Pending</Option>
              <Option value="approved">Approved</Option>
              <Option value="rejected">Rejected</Option>
            </Select>
          </div>
        </Card>

        {/* Role Tabs */}
        <Card>
          <Tabs
            activeKey={activeRoleTab}
            onChange={setActiveRoleTab}
            items={roleTabs}
            type="card"
          />
        </Card>

        {/* Detail Modal */}
        {renderDetailModal()}

        {/* Reject Modal */}
        <Modal
          title="Reject Staff Member"
          open={rejectModal.visible}
          onCancel={() => setRejectModal({ visible: false, record: null })}
          onOk={handleReject}
          okText="Confirm Rejection"
          okButtonProps={{ danger: true, loading: actionLoading }}
          destroyOnClose
        >
          <p className="mb-3">
            Please provide a reason for rejecting <strong>{rejectModal.record?.name}</strong>:
          </p>
          <TextArea
            rows={4}
            placeholder="Enter rejection reason..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </Modal>
      </Content>
      <Footer />
    </Layout>
  );
};

const StaffApprovalsPage = () => (
  <App>
    <StaffApprovalsPageInner />
  </App>
);

export default StaffApprovalsPage;
