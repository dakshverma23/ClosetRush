import React from 'react';
import { Card, Button, Table, Tag, Space, Popconfirm, Modal, Form, Input, Select, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PictureOutlined, UploadOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

const ScienceSectionsTab = ({
  sections,
  loadingSections,
  onAddSection,
  onEditSection,
  onDeleteSection,
  onManageImages
}) => {
  const layoutDescriptions = {
    layout1: '2x2 Grid (4 sections)',
    layout2: 'Left (Image+Bar) | Right (Tall Image+Content)',
    layout3: 'Full Width Orange Frame',
    layout4: 'Top Icons + Tilted Card'
  };

  const columns = [
    {
      title: 'Order',
      dataIndex: 'order',
      key: 'order',
      width: 80,
      sorter: (a, b) => a.order - b.order
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: 'Layout',
      dataIndex: 'layout',
      key: 'layout',
      render: (layout) => (
        <Tag color="blue">{layoutDescriptions[layout]}</Tag>
      )
    },
    {
      title: 'Images',
      key: 'images',
      render: (_, record) => (
        <span>{record.images?.length || 0} image(s)</span>
      )
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      render: (active) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEditSection(record)}
          >
            Edit
          </Button>
          <Button
            size="small"
            icon={<PictureOutlined />}
            onClick={() => onManageImages(record)}
          >
            Images
          </Button>
          <Popconfirm
            title="Delete this section?"
            onConfirm={() => onDeleteSection(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <Card className="shadow-lg rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-700">Science Behind Page Sections</h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage the 4 sections displayed on the "Science Behind" page
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAddSection}
        >
          Add Section
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={sections}
        rowKey="_id"
        loading={loadingSections}
        pagination={false}
        size="small"
      />

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-700 mb-2">
          <strong>Layout Guide:</strong>
        </p>
        <ul className="text-xs text-blue-600 space-y-1">
          <li><strong>Layout 1:</strong> Creates a 2x2 grid. Add 4 sections with layout1 (each needs 1 image)</li>
          <li><strong>Layout 2:</strong> Left side: small image + text bar. Right: tall image + content (needs 2 images)</li>
          <li><strong>Layout 3:</strong> Full-width orange frame with title, 2 text columns, 2 images at bottom</li>
          <li><strong>Layout 4:</strong> Top row of 4 icons + tilted card below (needs 4-5 images)</li>
        </ul>
      </div>
    </Card>
  );
};

export default ScienceSectionsTab;
