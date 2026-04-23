import React from 'react';
import { Table, Tag, Button, Select, Empty } from 'antd';
import { EyeOutlined } from '@ant-design/icons';

const ConnectionDetailsSection = ({ 
  quotes, 
  onViewDetails, 
  onUpdateStatus, 
  loading 
}) => {
  // Filter quotes for connection type
  const connectionQuotes = quotes.filter(quote => quote.type === 'connect');

  // Table columns for connection details
  const columns = [
    {
      title: 'Business Name',
      dataIndex: 'businessName',
      key: 'businessName',
      render: (text) => text || 'N/A'
    },
    {
      title: 'Contact Person',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
      render: (text) => text || 'N/A'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => (
        <span className="text-blue-600">{email || 'N/A'}</span>
      )
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => phone || 'N/A'
    },
    {
      title: 'Business Type',
      dataIndex: 'businessType',
      key: 'businessType',
      render: (type) => (
        <Tag color="blue">
          {type ? type.toUpperCase() : 'N/A'}
        </Tag>
      )
    },
    {
      title: 'Message',
      dataIndex: 'additionalRequirements',
      key: 'message',
      render: (message) => {
        if (!message) return <span className="text-gray-400">—</span>;
        
        const truncated = message.length > 60 
          ? message.slice(0, 60) + '…' 
          : message;
        
        return (
          <span 
            className="text-sm text-gray-600 cursor-pointer" 
            title={message}
          >
            {truncated}
          </span>
        );
      }
    },
    {
      title: 'Received',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          pending: 'orange',
          contacted: 'blue',
          accepted: 'green',
          rejected: 'red'
        };
        return (
          <Tag color={colors[status] || 'default'}>
            {status ? status.toUpperCase() : 'PENDING'}
          </Tag>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            size="small"
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => onViewDetails(record)}
          >
            View
          </Button>
          <Select
            size="small"
            value={record.status || 'pending'}
            onChange={(value) => onUpdateStatus(record._id, value)}
            style={{ width: 130 }}
          >
            <Select.Option value="pending">Pending</Select.Option>
            <Select.Option value="contacted">Contacted</Select.Option>
            <Select.Option value="accepted">Accepted</Select.Option>
            <Select.Option value="rejected">Rejected</Select.Option>
          </Select>
        </div>
      )
    }
  ];

  // Empty state component
  const EmptyState = () => (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <div className="text-center">
          <div className="text-gray-500 mb-2">No connection requests yet</div>
          <div className="text-sm text-gray-400">
            Connection requests from "Connect With Us" forms will appear here
          </div>
        </div>
      }
    />
  );

  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <h3 className="text-lg font-semibold text-gray-800">
            Connection Details
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({connectionQuotes.length})
            </span>
          </h3>
        </div>
      </div>

      {/* Table or Empty State */}
      {connectionQuotes.length === 0 ? (
        <div className="bg-gray-50 rounded-lg border border-dashed border-gray-200 p-8">
          <EmptyState />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={connectionQuotes}
          rowKey="_id"
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} connection requests`
          }}
          scroll={{ x: 900 }}
          size="middle"
        />
      )}
    </div>
  );
};

export default ConnectionDetailsSection;