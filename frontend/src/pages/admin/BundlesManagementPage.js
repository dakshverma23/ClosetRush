import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, InputNumber, Select,
  message, Space, Tag, Upload, Image, Tooltip, Switch, App as AntApp
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  UploadOutlined, PictureOutlined
} from '@ant-design/icons';
import api from '../../services/api';

const { TextArea } = Input;
const { Option } = Select;

export default function BundlesManagementPage() {
  const { message: msg } = AntApp.useApp();
  const [bundles, setBundles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBundle, setEditingBundle] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bundlesRes, categoriesRes] = await Promise.all([
        api.get('/bundles?active=all'),
        api.get('/categories')
      ]);
      setBundles(bundlesRes.data.bundles || []);
      setCategories(categoriesRes.data.categories || []);
    } catch (error) {
      msg.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (info) => {
    const file = info.file.originFileObj || info.file;
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();
      
      // Add all form fields
      formData.append('name', values.name);
      formData.append('description', values.description || '');
      formData.append('price', values.price);
      formData.append('securityDeposit', values.securityDeposit || 0);
      formData.append('billingCycle', values.billingCycle);
      formData.append('items', JSON.stringify(values.items));
      
      // Add image if selected
      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (editingBundle) {
        await api.put(`/bundles/${editingBundle._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        msg.success('Bundle updated successfully');
      } else {
        await api.post('/bundles', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        msg.success('Bundle created successfully');
      }

      setModalVisible(false);
      form.resetFields();
      setImageFile(null);
      setImagePreview('');
      setEditingBundle(null);
      loadData();
    } catch (error) {
      msg.error(error.response?.data?.error?.message || 'Failed to save bundle');
    }
  };

  const handleEdit = (bundle) => {
    setEditingBundle(bundle);
    setImagePreview(bundle.image || '');
    form.setFieldsValue({
      name: bundle.name,
      description: bundle.description,
      price: bundle.price,
      securityDeposit: bundle.securityDeposit,
      billingCycle: bundle.billingCycle,
      items: bundle.items.map(item => ({
        category: item.category._id || item.category,
        quantity: item.quantity
      }))
    });
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Bundle',
      content: 'Are you sure you want to delete this bundle?',
      okType: 'danger',
      onOk: async () => {
        try {
          await api.delete(`/bundles/${id}`);
          msg.success('Bundle deleted successfully');
          loadData();
        } catch (error) {
          msg.error(error.response?.data?.error?.message || 'Failed to delete bundle');
        }
      }
    });
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/bundles/${id}/status`, { active: !currentStatus });
      msg.success(`Bundle ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      loadData();
    } catch (error) {
      msg.error('Failed to update bundle status');
    }
  };

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      width: 100,
      render: (image) => image ? (
        <Image src={image} width={60} height={60} className="rounded-lg object-cover" />
      ) : (
        <div className="w-[60px] h-[60px] bg-gray-100 rounded-lg flex items-center justify-center">
          <PictureOutlined className="text-gray-400 text-2xl" />
        </div>
      )
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <span className="font-semibold">{name}</span>
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc) => (
        <Tooltip title={desc}>
          <span className="text-gray-600">{desc || '—'}</span>
        </Tooltip>
      )
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <span className="font-bold text-green-600">₹{price}</span>
    },
    {
      title: 'Deposit',
      dataIndex: 'securityDeposit',
      key: 'securityDeposit',
      render: (deposit) => `₹${deposit || 0}`
    },
    {
      title: 'Billing Cycle',
      dataIndex: 'billingCycle',
      key: 'billingCycle',
      render: (cycle) => (
        <Tag color="blue">{cycle?.charAt(0).toUpperCase() + cycle?.slice(1)}</Tag>
      )
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items) => (
        <div className="flex flex-wrap gap-1">
          {items?.slice(0, 2).map((item, idx) => (
            <Tag key={idx} className="text-xs">
              {item.category?.name || 'Unknown'} x{item.quantity}
            </Tag>
          ))}
          {items?.length > 2 && <Tag className="text-xs">+{items.length - 2}</Tag>}
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      render: (active, record) => (
        <Switch
          checked={active}
          onChange={() => handleToggleStatus(record._id, active)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record._id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Bundles Management</h1>
          <p className="text-slate-500 mt-1">Manage subscription bundles and their images</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingBundle(null);
            setImageFile(null);
            setImagePreview('');
            form.resetFields();
            setModalVisible(true);
          }}
          size="large"
        >
          Add Bundle
        </Button>
      </div>

      <Card className="rounded-2xl shadow-md">
        <Table
          dataSource={bundles}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </Card>

      <Modal
        title={editingBundle ? 'Edit Bundle' : 'Add New Bundle'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setImageFile(null);
          setImagePreview('');
          setEditingBundle(null);
        }}
        onOk={() => form.submit()}
        width={800}
        okText="Save"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Bundle Name"
              name="name"
              rules={[{ required: true, message: 'Please enter bundle name' }]}
            >
              <Input placeholder="e.g., Single Bed Bundle" />
            </Form.Item>

            <Form.Item
              label="Billing Cycle"
              name="billingCycle"
              rules={[{ required: true, message: 'Please select billing cycle' }]}
            >
              <Select placeholder="Select billing cycle">
                <Option value="monthly">Monthly</Option>
                <Option value="quarterly">Quarterly</Option>
                <Option value="yearly">Yearly</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Price (₹)"
              name="price"
              rules={[{ required: true, message: 'Please enter price' }]}
            >
              <InputNumber min={0} className="w-full" placeholder="0" />
            </Form.Item>

            <Form.Item
              label="Security Deposit (₹)"
              name="securityDeposit"
            >
              <InputNumber min={0} className="w-full" placeholder="0" />
            </Form.Item>
          </div>

          <Form.Item
            label="Description"
            name="description"
          >
            <TextArea rows={3} placeholder="Describe what's included in this bundle..." />
          </Form.Item>

          <Form.Item label="Bundle Image">
            <Upload
              listType="picture-card"
              maxCount={1}
              beforeUpload={() => false}
              onChange={handleImageChange}
              onRemove={() => {
                setImageFile(null);
                setImagePreview('');
              }}
            >
              {!imagePreview && (
                <div>
                  <UploadOutlined />
                  <div className="mt-2">Upload Image</div>
                </div>
              )}
            </Upload>
            {imagePreview && (
              <Image src={imagePreview} width={200} className="mt-2 rounded-lg" />
            )}
          </Form.Item>

          <Form.List
            name="items"
            rules={[
              {
                validator: async (_, items) => {
                  if (!items || items.length < 1) {
                    return Promise.reject(new Error('At least 1 item is required'));
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-semibold">Bundle Items</label>
                  <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                    Add Item
                  </Button>
                </div>
                {fields.map((field, index) => (
                  <div key={field.key} className="flex gap-2 mb-2">
                    <Form.Item
                      {...field}
                      name={[field.name, 'category']}
                      rules={[{ required: true, message: 'Select category' }]}
                      className="flex-1 mb-0"
                    >
                      <Select placeholder="Select category">
                        {categories.map(cat => (
                          <Option key={cat._id} value={cat._id}>{cat.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, 'quantity']}
                      rules={[{ required: true, message: 'Enter quantity' }]}
                      className="w-32 mb-0"
                    >
                      <InputNumber min={1} placeholder="Qty" className="w-full" />
                    </Form.Item>
                    <Button danger onClick={() => remove(field.name)} icon={<DeleteOutlined />} />
                  </div>
                ))}
                <Form.ErrorList errors={errors} />
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
}
