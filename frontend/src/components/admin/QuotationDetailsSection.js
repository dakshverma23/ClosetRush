import React from 'react';
import { Table, Tag, Button, Select, Empty } from 'antd';
import { EyeOutlined } from '@ant-design/icons';

const QuotationDetailsSection = ({ 
  quotes, 
  onViewDetails, 
  onUpdateStatus, 
  loading 
}) => {
  // Filter quotes for quotation type (anything that's not 'connect')
  const quotationQuotes = quotes.filter(quote => quote.type !== 'connect');

  // Table columns for quotation details
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
        <Tag color="green">
          {type ? type.toUpperCase() : 'N/A'}
        </Tag>
      )
    },
    {
      title: 'Properties',
      dataIndex: 'numberOfProperties',
      key: 'numberOfProperties',
      render: (count, record) => {
        if (!count) return 'N/A';
        const totalUnits = record.totalUnits || (count * (record.unitsPerProperty || 0));
        return (
          <div className="text-sm">
            <div className="font-medium">{count} properties</div>
            {totalUnits > 0 && (
              <div className="text-gray-500">{totalUnits} total units</div>
            )}
          </div>
        );
      }
    },
    {
      title: 'Bundle Selections',
      dataIndex: 'bundleSelections',
      key: 'bundleSelections',
      render: (selections) => {
        if (!selections || !Array.isArray(selections) || selections.length === 0) {
          return <span className="text-gray-400">No bundles</span>;
        }
        
        const bundleNames = selections.map(selection => 
          `${selection.bundleName || 'Bundle'} (${selection.quantity || 1}x)`
        );
        
        if (bundleNames.length <= 2) {
          return (
            <div className="text-sm">
              {bundleNames.map((name, index) => (
                <div key={index} className="text-gray-700">{name}</div>
              ))}
            </div>
          );
        }
        
        return (
          <div className="text-sm">
            <div className="text-gray-700">{bundleNames[0]}</div>
            <div className="text-gray-500">+{bundleNames.length - 1} more</div>
          </div>
        );
      }
    },
    {
      title: 'Estimated Total',
      dataIndex: 'estimatedCost',
      key: 'estimatedCost',
      render: (cost) => {
        if (!cost) return <span className="text-gray-400">N/A</span>;
        
        const finalAmount = cost.final || cost.total || 0;
        const depositAmount = cost.deposit || 0;
        
        return (
          <div className="text-sm">
            <div className="font-medium text-green-600">
              ₹{finalAmount.toLocaleString()}
            </div>
            {depositAmount > 0 && (
              <div className="text-gray-500">
                +₹{depositAmount.toLocaleString()} deposit
              </div>
            )}
          </div>
        );
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
        return (
          <Tag color={colors[status] || 'default'}>
            {labels[status] || status?.toUpperCase() || 'PENDING'}
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

  // Empty state component
  const EmptyState = () => (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <div className="text-center">
          <div className="text-gray-500 mb-2">No quotation requests yet</div>
          <div className="text-sm text-gray-400">
            Quotation requests from "Get a Quotation" forms will appear here
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
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <h3 className="text-lg font-semibold text-gray-800">
            Quotation Details
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({quotationQuotes.length})
            </span>
          </h3>
        </div>
      </div>

      {/* Table or Empty State */}
      {quotationQuotes.length === 0 ? (
        <div className="bg-gray-50 rounded-lg border border-dashed border-gray-200 p-8">
          <EmptyState />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={quotationQuotes}
          rowKey="_id"
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} quotation requests`
          }}
          scroll={{ x: 1100 }}
          size="middle"
        />
      )}
    </div>
  );
};

export default QuotationDetailsSection;