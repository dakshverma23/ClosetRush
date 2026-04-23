import React from 'react';
import { Modal, Descriptions, Tag, Card, Row, Col, Divider, Button, Select } from 'antd';

const QuoteDetailModal = ({ 
  quote, 
  visible, 
  onClose, 
  onUpdateStatus 
}) => {
  if (!quote) return null;

  const handleStatusChange = (value) => {
    onUpdateStatus(quote._id, value);
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${quote.type === 'connect' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
          {quote.type === 'connect' ? 'Connect Request Details' : 'Quotation Request Details'}
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <div>
        {/* Basic Information */}
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="Business Name" span={2}>
            {quote.businessName || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Contact Person">
            {quote.contactPerson || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Business Type">
            <Tag>{quote.businessType?.toUpperCase() || 'N/A'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {quote.email || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Phone">
            {quote.phone || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Type" span={2}>
            <Tag color={quote.type === 'connect' ? 'blue' : 'green'}>
              {quote.type === 'connect' ? 'CONNECT REQUEST' : 'QUOTATION REQUEST'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Status" span={2}>
            <Tag color={
              quote.status === 'pending' ? 'orange' : 
              quote.status === 'contacted' ? 'blue' :
              quote.status === 'quote_sent' ? 'cyan' :
              quote.status === 'negotiating' ? 'purple' :
              quote.status === 'accepted' ? 'green' : 'red'
            }>
              {quote.status?.toUpperCase() || 'PENDING'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Received" span={2}>
            {quote.createdAt ? new Date(quote.createdAt).toLocaleString() : 'N/A'}
          </Descriptions.Item>
        </Descriptions>

        {/* Message for connect type */}
        {quote.type === 'connect' && quote.additionalRequirements && (
          <>
            <Divider>Message</Divider>
            <Card size="small" className="bg-blue-50">
              <div className="text-sm">{quote.additionalRequirements}</div>
            </Card>
          </>
        )}

        {/* Bundle selections for quotation type */}
        {quote.type !== 'connect' && quote.bundleSelections && quote.bundleSelections.length > 0 && (
          <>
            <Divider>Bundle Selections</Divider>
            <div className="space-y-2 mb-4">
              {quote.bundleSelections.map((sel, i) => (
                <Card key={i} size="small" className="bg-gray-50">
                  <Row gutter={16}>
                    <Col span={12}>
                      <div className="text-sm font-semibold">{sel.bundleName || 'Bundle'}</div>
                    </Col>
                    <Col span={6}>
                      <div className="text-xs text-gray-500">
                        Qty/property: <strong>{sel.quantity || 1}</strong>
                      </div>
                    </Col>
                    <Col span={6}>
                      <div className="text-xs text-gray-500">
                        Duration: <strong>{sel.duration || 1} mo</strong>
                      </div>
                    </Col>
                  </Row>
                </Card>
              ))}
            </div>

            {/* Property Information */}
            {quote.numberOfProperties && (
              <div className="text-sm text-gray-600 mb-4 bg-blue-50 p-3 rounded-lg">
                <div className="flex justify-between mb-1">
                  <span><strong>Number of Properties:</strong></span>
                  <span>{quote.numberOfProperties}</span>
                </div>
                {quote.unitsPerProperty && (
                  <div className="flex justify-between mb-1">
                    <span><strong>Approx. Units per Property:</strong></span>
                    <span>{quote.unitsPerProperty}</span>
                  </div>
                )}
                {quote.totalUnits && (
                  <div className="flex justify-between font-semibold border-t border-blue-200 pt-1 mt-1">
                    <span>Total Units:</span>
                    <span>{quote.totalUnits}</span>
                  </div>
                )}
              </div>
            )}

            {/* Cost Breakdown */}
            {quote.estimatedCost && quote.estimatedCost.total > 0 && (
              <Card className="bg-blue-50 mb-4">
                <div className="font-semibold mb-2">Estimated Cost Breakdown</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Subscription Total</span>
                    <span>₹{quote.estimatedCost.original?.toLocaleString() || 0}</span>
                  </div>
                  {quote.estimatedCost.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{quote.estimatedCost.discount?.toLocaleString() || 0}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>After Discount</span>
                    <span>₹{quote.estimatedCost.final?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between text-blue-600">
                    <span>Security Deposit (refundable)</span>
                    <span>₹{quote.estimatedCost.deposit?.toLocaleString() || 0}</span>
                  </div>
                  <Divider className="my-1" />
                  <div className="flex justify-between font-bold text-base">
                    <span>Estimated Total</span>
                    <span className="text-blue-600">
                      ₹{quote.estimatedCost.total?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}

        {/* Additional Requirements for quotation type */}
        {quote.additionalRequirements && quote.type !== 'connect' && (
          <>
            <Divider>Additional Requirements</Divider>
            <Card size="small">
              <div className="text-sm">{quote.additionalRequirements}</div>
            </Card>
          </>
        )}

        <Divider />

        {/* Actions */}
        <div className="flex gap-2">
          <Select
            value={quote.status || 'pending'}
            onChange={handleStatusChange}
            style={{ width: 200 }}
          >
            <Select.Option value="pending">Pending</Select.Option>
            <Select.Option value="contacted">Contacted</Select.Option>
            {quote.type !== 'connect' && (
              <>
                <Select.Option value="quote_sent">Quote Sent</Select.Option>
                <Select.Option value="negotiating">Negotiating</Select.Option>
              </>
            )}
            <Select.Option value="accepted">Accepted</Select.Option>
            <Select.Option value="rejected">Rejected</Select.Option>
          </Select>
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default QuoteDetailModal;