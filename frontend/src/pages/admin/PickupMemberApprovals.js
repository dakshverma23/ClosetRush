import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Tag, Button, Modal, Descriptions, message,
  Badge, Space, Tooltip, Tabs, Select, Input, Row, Col, Statistic
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, EyeOutlined,
  UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined,
  CarOutlined, ReloadOutlined
} from '@ant-design/icons';
import api from '../../services/api';

const { Option } = Select;
const { TextArea } = Input;

const STATUS_COLORS = { pending: 'orange', approved: 'green', rejected: 'red' };

const StaffApprovalsPanel = () => {
  const [activeTab, setActiveTab] = useState('warehouse');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [warehouseManagers, setWarehouseManagers] = useState([]);
  const [logisticsPartners, setLogisticsPartners] = useState([]);

  const [viewMember, setViewMember] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadWarehouseManagers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/warehouse-managers');
      setWarehouseManagers(Array.isArray(res.data.members) ? res.data.members : []);
    } catch {
      message.error('Failed to load warehouse managers');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLogisticsPartners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/logistics-partners');
      setLogisticsPartners(Array.isArray(res.data.members) ? res.data.members : []);
    } catch {
      message.error('Failed to load logistics partners');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWarehouseManagers();
    loadLogisticsPartners();
  }, [loadWarehouseManagers, loadLogisticsPartners]);

  const refresh = () => {
    loadWarehouseManagers();
    loadLogisticsPartners();
  };

  // ── Approve ────────────────────────────────────────────────────────────────
  const handleApprove = async (record) => {
    setActionLoading(true);
    try {
      const endpoint = activeTab === 'warehouse'
        ? `/warehouse-managers/${record._id}/approve`
        : `/logistics-partners/${record._id}/approve`;
      await api.patch(endpoint);
      message.success(`${record.name} approved successfully!`);
      setDetailModal(false);
      refresh();
    } catch (error) {
      message.error(error?.response?.data?.error?.message || 'Failed to approve');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Reject ─────────────────────────────────────────────────────────────────
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      message.warning('Please provide a rejection reason');
      return;
    }
    setActionLoading(true);
    try {
      const endpoint = activeTab === 'warehouse'
        ? `/warehouse-managers/${viewMember._id}/reject`
        : `/logistics-partners/${viewMember._id}/reject`;
      await api.patch(endpoint, { reason: rejectReason.trim() });
      message.success(`${viewMember.name} rejected`);
      setRejectModal(false);
      setDetailModal(false);
      setRejectReason('');
      refresh();
    } catch (error) {
      message.error(error?.response?.data?.error?.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Status field helper ────────────────────────────────────────────────────
  const getStatus = (record) =>
    activeTab === 'warehouse'
      ? record.warehouseManagerStatus
      : record.logisticsPartnerStatus;

  // ── Filtered data ──────────────────────────────────────────────────────────
  const currentData = activeTab === 'warehouse' ? warehouseManagers : logisticsPartners;
  const filtered = statusFilter === 'all'
    ? currentData
    : currentData.filter(r => getStatus(r) === statusFilter);

  const warehousePending = warehouseManagers.filter(r => r.warehouseManagerStatus === 'pending').length;
  const logisticsPending = logisticsPartners.filter(r => r.logisticsPartnerStatus === 'pending').length;

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (v) => (
        <div className="flex items-center gap-2">
          <UserOutlined className="text-indigo-500" />
          <span className="font-semibold">{v}</span>
        </div>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      responsive: ['md'],
      render: v => (
        <div className="flex items-center gap-1">
          <MailOutlined className="text-gray-400" />
          <span className="text-sm">{v}</span>
        </div>
      )
    },
    {
      title: 'Mobile',
      dataIndex: 'mobile',
      key: 'mobile',
      responsive: ['lg'],
      render: v => (
        <div className="flex items-center gap-1">
          <PhoneOutlined className="text-gray-400" />
          <span>{v || '—'}</span>
        </div>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, r) => {
        const s = getStatus(r);
        return (
          <Tag color={STATUS_COLORS[s] || 'default'} icon={
            s === 'approved' ? <CheckCircleOutlined /> : <CloseCircleOutlined />
          }>
            {s?.toUpperCase() || '—'}
          </Tag>
        );
      }
    },
    {
      title: 'Registered',
      dataIndex: 'createdAt',
      key: 'createdAt',
      responsive: ['md'],
      render: v => new Date(v).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, r) => {
        const s = getStatus(r);
        return (
          <Space wrap>
            <Tooltip title="View Details">
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => { setViewMember(r); setDetailModal(true); }}
              />
            </Tooltip>
            {s === 'pending' && (
              <>
                <Button
                  size="small"
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleApprove(r)}
                  style={{ background: '#10b981', borderColor: '#10b981' }}
                >
                  Approve
                </Button>
                <Button
                  size="small"
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => { setViewMember(r); setRejectModal(true); }}
                >
                  Reject
                </Button>
              </>
            )}
          </Space>
        );
      }
    }
  ];

  // ── Detail modal ───────────────────────────────────────────────────────────
  const renderDetailModal = () => {
    if (!viewMember) return null;
    const s = getStatus(viewMember);
    const isWH = activeTab === 'warehouse';
    const approvedAt = isWH ? viewMember.warehouseManagerApprovedAt : viewMember.logisticsPartnerApprovedAt;
    const rejectionReason = isWH ? viewMember.warehouseManagerRejectionReason : viewMember.logisticsPartnerRejectionReason;

    return (
      <Modal
        title={
          <div className="flex items-center gap-2">
            {isWH ? <HomeOutlined className="text-blue-500" /> : <CarOutlined className="text-green-500" />}
            <span>{isWH ? 'Warehouse Manager' : 'Logistics Partner'} Details</span>
          </div>
        }
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        footer={
          s === 'pending' ? (
            <Space wrap>
              <Button onClick={() => setDetailModal(false)}>Cancel</Button>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => { setDetailModal(false); setRejectModal(true); }}
              >
                Reject
              </Button>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                loading={actionLoading}
                onClick={() => handleApprove(viewMember)}
                style={{ background: '#10b981', borderColor: '#10b981' }}
              >
                Approve
              </Button>
            </Space>
          ) : (
            <Button onClick={() => setDetailModal(false)}>Close</Button>
          )
        }
        width={560}
      >
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Name">{viewMember.name}</Descriptions.Item>
          <Descriptions.Item label="Email">{viewMember.email}</Descriptions.Item>
          <Descriptions.Item label="Mobile">{viewMember.mobile || '—'}</Descriptions.Item>
          <Descriptions.Item label="Address">
            <div className="flex items-start gap-2">
              <HomeOutlined className="text-gray-400 mt-1 flex-shrink-0" />
              <span>{viewMember.address || '—'}</span>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={STATUS_COLORS[s] || 'default'}>{s?.toUpperCase()}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Registered">
            {new Date(viewMember.createdAt).toLocaleString()}
          </Descriptions.Item>
          {approvedAt && (
            <Descriptions.Item label="Actioned At">
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

  const tabItems = [
    {
      key: 'warehouse',
      label: (
        <span className="flex items-center gap-2">
          <HomeOutlined />
          <span>Warehouse Managers</span>
          {warehousePending > 0 && (
            <Badge count={warehousePending} size="small" />
          )}
        </span>
      ),
      children: (
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, responsive: true }}
          scroll={{ x: 600 }}
          rowClassName={r => r.warehouseManagerStatus === 'pending' ? 'bg-orange-50' : ''}
          locale={{ emptyText: 'No warehouse managers found' }}
        />
      )
    },
    {
      key: 'logistics',
      label: (
        <span className="flex items-center gap-2">
          <CarOutlined />
          <span>Logistics Partners</span>
          {logisticsPending > 0 && (
            <Badge count={logisticsPending} size="small" />
          )}
        </span>
      ),
      children: (
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, responsive: true }}
          scroll={{ x: 600 }}
          rowClassName={r => r.logisticsPartnerStatus === 'pending' ? 'bg-orange-50' : ''}
          locale={{ emptyText: 'No logistics partners found' }}
        />
      )
    }
  ];

  return (
    <div>
      {/* Header */}
      <Card className="card-modern-glass mb-4">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={16}>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">
              Staff Approvals
            </h2>
            <p className="text-slate-500 text-sm">
              Review and approve warehouse manager and logistics partner registrations
            </p>
          </Col>
          <Col xs={24} sm={8} className="flex sm:justify-end gap-3">
            <Button icon={<ReloadOutlined />} onClick={refresh} loading={loading}>
              Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Stats */}
      <Row gutter={[12, 12]} className="mb-4">
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center">
            <Statistic
              title="WH Pending"
              value={warehousePending}
              valueStyle={{ color: '#f59e0b', fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center">
            <Statistic
              title="WH Approved"
              value={warehouseManagers.filter(r => r.warehouseManagerStatus === 'approved').length}
              valueStyle={{ color: '#10b981', fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center">
            <Statistic
              title="LP Pending"
              value={logisticsPending}
              valueStyle={{ color: '#f59e0b', fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center">
            <Statistic
              title="LP Approved"
              value={logisticsPartners.filter(r => r.logisticsPartnerStatus === 'approved').length}
              valueStyle={{ color: '#10b981', fontSize: 20 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filter */}
      <Card className="card-modern-glass mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-medium text-slate-600 text-sm">Filter by Status:</span>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 140 }}
            size="small"
          >
            <Option value="all">All</Option>
            <Option value="pending">Pending</Option>
            <Option value="approved">Approved</Option>
            <Option value="rejected">Rejected</Option>
          </Select>
        </div>
      </Card>

      {/* Tabs */}
      <Card className="card-modern-glass">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => { setActiveTab(key); setStatusFilter('all'); }}
          items={tabItems}
          type="card"
        />
      </Card>

      {/* Detail Modal */}
      {renderDetailModal()}

      {/* Reject Modal */}
      <Modal
        title={`Reject ${activeTab === 'warehouse' ? 'Warehouse Manager' : 'Logistics Partner'}`}
        open={rejectModal}
        onCancel={() => { setRejectModal(false); setRejectReason(''); }}
        onOk={handleReject}
        okText="Confirm Rejection"
        okButtonProps={{ danger: true, loading: actionLoading }}
        destroyOnClose
      >
        <p className="mb-3 text-slate-600">
          Provide a reason for rejecting <strong>{viewMember?.name}</strong>:
        </p>
        <TextArea
          rows={4}
          placeholder="Enter rejection reason..."
          value={rejectReason}
          onChange={e => setRejectReason(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default StaffApprovalsPanel;
