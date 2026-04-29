import React, { useState, useEffect } from 'react';
import { Layout, Card, Table, Tag, Button, Spin, Empty, Descriptions, Modal, Timeline } from 'antd';
import appMessage from '../../utils/message';
import { ArrowLeftOutlined, EyeOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import BackButton from '../../components/layout/BackButton';
import api from '../../services/api';

const { Content } = Layout;

const MyQuotesPage = () => {
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/quotes/my-quotes');
      setQuotes(response.data.quotes || []);
    } catch (error) {
      appMessage.error('Failed to load quotes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      contacted: 'blue',
      quote_sent: 'cyan',
      negotiating: 'purple',
      accepted: 'green',
      rejected: 'red'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pending Review',
      contacted: 'Contacted',
      quote_sent: 'Quote Sent',
      negotiating: 'Under Negotiation',
      accepted: 'Accepted',
      rejected: 'Rejected'
    };
    return texts[status] || status;
  };

  const handleViewDetails = (quote) => {
    setSelectedQuote(quote);
    setDetailsVisible(true);
  };

  const columns = [
    {
      title: 'Quote ID',
      dataIndex: '_id',
      key: 'id',
      render: (id) => `#${id.slice(-6).toUpperCase()}`,
      width: 120
    },
    {
      title: 'Business Name',
      dataIndex: 'businessName',
      key: 'businessName'
    },
    {
      title: 'Business Type',
      dataIndex: 'businessType',
      key: 'businessType',
      render: (type) => type ? type.toUpperCase() : 'N/A'
    },
    {
      title: 'Properties',
      dataIndex: 'properties',
      key: 'properties',
      render: (properties) => properties?.length || 0
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'Submitted',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    },
    {
      title: 'Quoted Amount',
      dataIndex: 'quotedAmount',
      key: 'quotedAmount',
      render: (amount) => amount ? `₹${amount.toLocaleString('en-IN')}` : '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
        >
          View Details
        </Button>
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
          <div className="flex items-center mb-6">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/business/dashboard')}
              className="mr-4"
            >
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold">Your Quotes</h1>
          </div>

          <Card>
            {quotes.length === 0 ? (
              <Empty
                description="No quotes submitted yet"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button type="primary" onClick={() => navigate('/get-quote')}>
                  Submit a Quote Request
                </Button>
              </Empty>
            ) : (
              <Table
                columns={columns}
                dataSource={quotes}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 1200 }}
              />
            )}
          </Card>

          {/* Quote Details Modal */}
          <Modal
            title={`Quote Details - #${selectedQuote?._id.slice(-6).toUpperCase()}`}
            open={detailsVisible}
            onCancel={() => setDetailsVisible(false)}
            footer={[
              <Button key="close" onClick={() => setDetailsVisible(false)}>
                Close
              </Button>
            ]}
            width={800}
          >
            {selectedQuote && (
              <div className="space-y-6">
                {/* Status and Basic Info */}
                <Card size="small" title="Status">
                  <div className="flex justify-between items-center">
                    <Tag color={getStatusColor(selectedQuote.status)} className="text-lg px-4 py-2">
                      {getStatusText(selectedQuote.status)}
                    </Tag>
                    {selectedQuote.quotedAmount && (
                      <div className="text-right">
                        <div className="text-gray-500 text-sm">Quoted Amount</div>
                        <div className="text-2xl font-bold text-green-600">
                          ₹{selectedQuote.quotedAmount.toLocaleString('en-IN')}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Business Information */}
                <Card size="small" title="Business Information">
                  <Descriptions column={2} size="small">
                    <Descriptions.Item label="Business Name">
                      {selectedQuote.businessName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Business Type">
                      {selectedQuote.businessType?.toUpperCase() || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Contact Person">
                      {selectedQuote.contactPerson}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      {selectedQuote.email}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phone">
                      {selectedQuote.phone}
                    </Descriptions.Item>
                    <Descriptions.Item label="Submitted On">
                      {new Date(selectedQuote.createdAt).toLocaleString('en-IN')}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                {/* Properties */}
                <Card size="small" title="Properties">
                  {selectedQuote.properties?.map((property, index) => (
                    <Card key={index} type="inner" className="mb-3" size="small">
                      <Descriptions column={2} size="small">
                        <Descriptions.Item label="Property Name" span={2}>
                          {property.propertyName || 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Address" span={2}>
                          {property.address || 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Number of Units">
                          {property.numberOfUnits || 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Single Beds">
                          {property.bedConfiguration?.singleBeds || 0}
                        </Descriptions.Item>
                        <Descriptions.Item label="Double Beds">
                          {property.bedConfiguration?.doubleBeds || 0}
                        </Descriptions.Item>
                        <Descriptions.Item label="Curtain Sets">
                          {property.bedConfiguration?.curtainSets || 0}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  ))}
                </Card>

                {/* Additional Requirements */}
                {selectedQuote.additionalRequirements && (
                  <Card size="small" title="Additional Requirements">
                    <p className="whitespace-pre-wrap">{selectedQuote.additionalRequirements}</p>
                  </Card>
                )}

                {/* Estimated Deposit */}
                {selectedQuote.estimatedDeposit && (
                  <Card size="small" title="Estimated Deposit">
                    <div className="text-xl font-semibold">
                      ₹{selectedQuote.estimatedDeposit.toLocaleString('en-IN')}
                    </div>
                  </Card>
                )}

                {/* Admin Notes/Updates */}
                {selectedQuote.adminNotes && selectedQuote.adminNotes.length > 0 && (
                  <Card size="small" title="Updates from Admin">
                    <Timeline>
                      {selectedQuote.adminNotes.map((note, index) => (
                        <Timeline.Item
                          key={index}
                          dot={<ClockCircleOutlined />}
                          color="blue"
                        >
                          <div className="mb-2">
                            <div className="text-gray-500 text-sm">
                              {new Date(note.addedAt).toLocaleString('en-IN')}
                            </div>
                            <div className="mt-1">{note.note}</div>
                          </div>
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  </Card>
                )}

                {/* Follow-up Information */}
                {(selectedQuote.lastContactedAt || selectedQuote.nextFollowUpDate) && (
                  <Card size="small" title="Follow-up Information">
                    <Descriptions column={1} size="small">
                      {selectedQuote.lastContactedAt && (
                        <Descriptions.Item label="Last Contacted">
                          {new Date(selectedQuote.lastContactedAt).toLocaleString('en-IN')}
                        </Descriptions.Item>
                      )}
                      {selectedQuote.nextFollowUpDate && (
                        <Descriptions.Item label="Next Follow-up">
                          {new Date(selectedQuote.nextFollowUpDate).toLocaleString('en-IN')}
                        </Descriptions.Item>
                      )}
                    </Descriptions>
                  </Card>
                )}
              </div>
            )}
          </Modal>
        </div>
      </Content>
    </Layout>
  );
};

export default MyQuotesPage;

