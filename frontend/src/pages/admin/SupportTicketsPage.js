import React, { useState, useEffect } from 'react';
import { Layout, Card, Table, Button, message, Modal, Tag, Select, Input, Descriptions, Timeline, Divider, Avatar, Space } from 'antd';
import { ArrowLeftOutlined, EyeOutlined, UserOutlined, ClockCircleOutlined, SendOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import BackButton from '../../components/layout/BackButton';
import api from '../../services/api';

const { Content } = Layout;
const { TextArea } = Input;

const SupportTicketsPage = () => {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isReplyModalVisible, setIsReplyModalVisible] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await api.get('/support');
      setTickets(response.data.tickets || []);
    } catch (error) {
      message.error('Failed to load support tickets');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (ticket) => {
    setSelectedTicket(ticket);
    setIsDetailModalVisible(true);
  };

  const handleUpdateStatus = async (ticketId, status) => {
    try {
      await api.patch(`/support/${ticketId}/status`, { status });
      message.success('Ticket status updated');
      fetchTickets();
      if (selectedTicket && selectedTicket._id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status });
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleUpdatePriority = async (ticketId, priority) => {
    try {
      await api.patch(`/support/${ticketId}/priority`, { priority });
      message.success('Ticket priority updated');
      fetchTickets();
      if (selectedTicket && selectedTicket._id === ticketId) {
        setSelectedTicket({ ...selectedTicket, priority });
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to update priority');
    }
  };

  const handleAddReply = async () => {
    if (!replyText.trim()) {
      message.warning('Please enter a reply message');
      return;
    }

    try {
      await api.post(`/support/${selectedTicket._id}/reply`, {
        message: replyText
      });
      message.success('Reply added successfully');
      setReplyText('');
      setIsReplyModalVisible(false);
      fetchTickets();
      // Refresh ticket details
      const response = await api.get(`/support/${selectedTicket._id}`);
      setSelectedTicket(response.data.ticket);
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to add reply');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'blue',
      'in-progress': 'orange',
      resolved: 'green',
      closed: 'gray'
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'green',
      medium: 'orange',
      high: 'red'
    };
    return colors[priority] || 'default';
  };

  const filteredTickets = tickets.filter(ticket => {
    const statusMatch = filterStatus === 'all' || ticket.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || ticket.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  const columns = [
    {
      title: 'Ticket ID',
      dataIndex: 'ticketId',
      key: 'ticketId',
      width: 120,
      render: (id) => <span className="font-mono font-semibold">#{id}</span>
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      ellipsis: true
    },
    {
      title: 'User',
      key: 'user',
      width: 200,
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.user?.name || 'N/A'}</div>
          <div className="text-xs text-gray-500">{record.user?.email || 'N/A'}</div>
          <Tag size="small" color={record.user?.userType === 'business' ? 'green' : 'blue'}>
            {record.user?.userType?.toUpperCase() || 'N/A'}
          </Tag>
        </div>
      )
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>
          {priority ? priority.toUpperCase() : 'N/A'}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status ? status.toUpperCase().replace('-', ' ') : 'N/A'}
        </Tag>
      )
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 250,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            View
          </Button>
          <Select
            size="small"
            value={record.status}
            onChange={(value) => handleUpdateStatus(record._id, value)}
            style={{ width: 130 }}
          >
            <Select.Option value="open">Open</Select.Option>
            <Select.Option value="in-progress">In Progress</Select.Option>
            <Select.Option value="resolved">Resolved</Select.Option>
            <Select.Option value="closed">Closed</Select.Option>
          </Select>
        </Space>
      )
    }
  ];

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Navbar />
      <Content className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/admin/dashboard')}
              >
                Back
              </Button>
              <h1 className="text-3xl font-bold">Support Tickets</h1>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <div className="flex gap-4 items-center">
              <div>
                <span className="font-medium mr-2">Filter by Status:</span>
                <Select
                  value={filterStatus}
                  onChange={setFilterStatus}
                  style={{ width: 150 }}
                >
                  <Select.Option value="all">All Status</Select.Option>
                  <Select.Option value="open">Open</Select.Option>
                  <Select.Option value="in-progress">In Progress</Select.Option>
                  <Select.Option value="resolved">Resolved</Select.Option>
                  <Select.Option value="closed">Closed</Select.Option>
                </Select>
              </div>
              <div>
                <span className="font-medium mr-2">Filter by Priority:</span>
                <Select
                  value={filterPriority}
                  onChange={setFilterPriority}
                  style={{ width: 150 }}
                >
                  <Select.Option value="all">All Priority</Select.Option>
                  <Select.Option value="low">Low</Select.Option>
                  <Select.Option value="medium">Medium</Select.Option>
                  <Select.Option value="high">High</Select.Option>
                </Select>
              </div>
              <div className="ml-auto">
                <span className="text-gray-600">
                  Showing {filteredTickets.length} of {tickets.length} tickets
                </span>
              </div>
            </div>
          </Card>

          {/* Tickets Table */}
          <Card>
            <Table
              columns={columns}
              dataSource={filteredTickets}
              rowKey="_id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1200 }}
            />
          </Card>

          {/* Ticket Details Modal */}
          <Modal
            title={
              <div className="flex items-center gap-3">
                <span>Ticket Details</span>
                {selectedTicket && (
                  <span className="font-mono text-sm text-gray-500">
                    #{selectedTicket.ticketId}
                  </span>
                )}
              </div>
            }
            open={isDetailModalVisible}
            onCancel={() => setIsDetailModalVisible(false)}
            footer={null}
            width={900}
          >
            {selectedTicket && (
              <div className="space-y-6">
                {/* Status and Priority Controls */}
                <Card size="small" className="bg-gray-50">
                  <div className="flex gap-4 items-center">
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 mb-1">Status</div>
                      <Select
                        value={selectedTicket.status}
                        onChange={(value) => handleUpdateStatus(selectedTicket._id, value)}
                        style={{ width: '100%' }}
                      >
                        <Select.Option value="open">Open</Select.Option>
                        <Select.Option value="in-progress">In Progress</Select.Option>
                        <Select.Option value="resolved">Resolved</Select.Option>
                        <Select.Option value="closed">Closed</Select.Option>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 mb-1">Priority</div>
                      <Select
                        value={selectedTicket.priority}
                        onChange={(value) => handleUpdatePriority(selectedTicket._id, value)}
                        style={{ width: '100%' }}
                      >
                        <Select.Option value="low">Low</Select.Option>
                        <Select.Option value="medium">Medium</Select.Option>
                        <Select.Option value="high">High</Select.Option>
                      </Select>
                    </div>
                  </div>
                </Card>

                {/* User Information */}
                <Card size="small" title="User Information">
                  <Descriptions column={2} size="small">
                    <Descriptions.Item label="Name">
                      {selectedTicket.user?.name || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="User Type">
                      <Tag color={selectedTicket.user?.userType === 'business' ? 'green' : 'blue'}>
                        {selectedTicket.user?.userType?.toUpperCase() || 'N/A'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      {selectedTicket.user?.email || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Mobile">
                      {selectedTicket.user?.mobile || 'N/A'}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                {/* Ticket Details */}
                <Card size="small" title="Ticket Information">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Subject">
                      <span className="font-semibold">{selectedTicket.subject}</span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Description">
                      <div className="whitespace-pre-wrap">{selectedTicket.description}</div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Category">
                      <Tag>{selectedTicket.category || 'General'}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Created At">
                      {new Date(selectedTicket.createdAt).toLocaleString('en-IN')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Last Updated">
                      {new Date(selectedTicket.updatedAt).toLocaleString('en-IN')}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                {/* Conversation Thread */}
                {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                  <Card size="small" title="Conversation History">
                    <Timeline>
                      {selectedTicket.replies.map((reply, index) => (
                        <Timeline.Item
                          key={index}
                          dot={
                            reply.isAdmin ? (
                              <Avatar size="small" className="bg-blue-500">A</Avatar>
                            ) : (
                              <Avatar size="small" icon={<UserOutlined />} className="bg-green-500" />
                            )
                          }
                        >
                          <div className="mb-2">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">
                                {reply.isAdmin ? 'Admin' : selectedTicket.user?.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(reply.createdAt).toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div className="bg-gray-50 p-3 rounded">
                              {reply.message}
                            </div>
                          </div>
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  </Card>
                )}

                {/* Add Reply Button */}
                <div className="flex gap-2">
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={() => setIsReplyModalVisible(true)}
                    disabled={selectedTicket.status === 'closed'}
                  >
                    Add Reply
                  </Button>
                  <Button onClick={() => setIsDetailModalVisible(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </Modal>

          {/* Add Reply Modal */}
          <Modal
            title="Add Reply to Ticket"
            open={isReplyModalVisible}
            onCancel={() => {
              setIsReplyModalVisible(false);
              setReplyText('');
            }}
            footer={null}
          >
            <div className="space-y-4">
              <TextArea
                rows={6}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply here..."
              />
              <div className="flex gap-2 justify-end">
                <Button onClick={() => {
                  setIsReplyModalVisible(false);
                  setReplyText('');
                }}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleAddReply}
                >
                  Send Reply
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      </Content>
    </Layout>
  );
};

export default SupportTicketsPage;
