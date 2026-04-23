import React, { useState, useEffect } from 'react';
import { Layout, Card, Row, Col, Button, message, Modal, Form, Input, InputNumber, Tag, Empty, Spin, Upload, Radio } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined, AppstoreOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import BackButton from '../../components/layout/BackButton';
import api from '../../services/api';

const { Content } = Layout;
const { TextArea } = Input;

const CategoriesPage = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get('/categories');
      setCategories(response.data.categories || []);
    } catch (error) {
      message.error('Failed to load categories');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setImageUrl('');
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setImageUrl(category.image || '');
    form.setFieldsValue({
      name: category.name,
      description: category.description,
      price: category.price,
      depositAmount: category.depositAmount || 0,
      minimumDuration: category.minimumDuration || 1
    });
    setIsModalVisible(true);
  };

  const handleImageUpload = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'closetrush_preset');

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );
      const data = await response.json();
      
      if (data.secure_url) {
        setImageUrl(data.secure_url);
        message.success('Image uploaded successfully');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      message.error('Failed to upload image');
      console.error(error);
    } finally {
      setUploading(false);
    }
    return false; // Prevent default upload behavior
  };

  const handleSaveCategory = async (values) => {
    try {
      const categoryData = {
        name: values.name,
        description: values.description,
        image: imageUrl,
        price: values.price,
        depositAmount: values.depositAmount || 0,
        minimumDuration: values.minimumDuration || 1
      };

      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, categoryData);
        message.success('Category updated successfully');
      } else {
        await api.post('/categories', categoryData);
        message.success('Category created successfully');
      }

      setIsModalVisible(false);
      form.resetFields();
      setImageUrl('');
      fetchCategories();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDeleteCategory = (id, name) => {
    Modal.confirm({
      title: 'Delete Category',
      content: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await api.delete(`/categories/${id}`);
          message.success('Category deleted successfully');
          fetchCategories();
        } catch (error) {
          message.error(error.response?.data?.message || 'Failed to delete category');
        }
      }
    });
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.patch(`/categories/${id}/toggle-status`);
      message.success('Category status updated');
      fetchCategories();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <Layout className="min-h-screen bg-gray-50">
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-4">
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/admin/dashboard')}
              >
                Back
              </Button>
              <h1 className="text-2xl sm:text-3xl font-bold">Categories Management</h1>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleAddCategory}
            >
              Add New Category
            </Button>
          </div>

          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AppstoreOutlined className="text-blue-600 text-xl mt-1" />
              <div>
                <div className="font-semibold text-blue-900 mb-1">About Categories</div>
                <div className="text-sm text-blue-800">
                  Categories are the basic items like "Single Bed", "Double Bed", "Curtains", "Pillow Covers", etc. 
                  After creating categories, you can create bundles that combine multiple categories with pricing.
                </div>
              </div>
            </div>
          </div>

          {categories.length === 0 ? (
            <Card>
              <Empty
                description="No categories created yet"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCategory}>
                  Create First Category
                </Button>
              </Empty>
            </Card>
          ) : (
            <Row gutter={[16, 16]}>
              {categories.map((category) => (
                <Col xs={24} sm={12} md={8} lg={6} key={category._id}>
                  <Card
                    hoverable
                    className="h-full"
                    cover={
                      category.image ? (
                        <div className="h-48 overflow-hidden bg-gray-100">
                          <img
                            alt={category.name}
                            src={category.image}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-48 bg-gray-100 flex items-center justify-center">
                          <AppstoreOutlined className="text-6xl text-gray-400" />
                        </div>
                      )
                    }
                    actions={[
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEditCategory(category)}
                      >
                        Edit
                      </Button>,
                      <Button
                        type="text"
                        onClick={() => handleToggleStatus(category._id)}
                      >
                        {category.active ? 'Deactivate' : 'Activate'}
                      </Button>,
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteCategory(category._id, category.name)}
                      >
                        Delete
                      </Button>
                    ]}
                  >
                    <div className="text-center">
                      <h3 className="text-lg font-bold mb-2">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                      )}
                      <div className="mb-3">
                        <span className="text-xl font-bold text-blue-600">₹{category.price}</span>
                        <span className="text-sm text-gray-500"> /item</span>
                      </div>
                      <Tag color={category.active ? 'green' : 'orange'}>
                        {category.active ? 'ACTIVE' : 'COMING SOON'}
                      </Tag>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {/* Add/Edit Category Modal */}
          <Modal
            title={editingCategory ? 'Edit Category' : 'Add New Category'}
            open={isModalVisible}
            onCancel={() => {
              setIsModalVisible(false);
              form.resetFields();
              setImageUrl('');
            }}
            footer={null}
            width={600}
          >
            <Form form={form} onFinish={handleSaveCategory} layout="vertical">
              <Form.Item
                name="name"
                label="Category Name"
                rules={[
                  { required: true, message: 'Please enter category name' },
                  { min: 2, message: 'Category name must be at least 2 characters' }
                ]}
              >
                <Input 
                  placeholder="e.g., Single Bed, Double Bed, Curtains, Pillow Covers" 
                  size="large" 
                />
              </Form.Item>

              <Form.Item
                name="description"
                label="Description (Optional)"
              >
                <TextArea 
                  rows={3} 
                  placeholder="Brief description of this category" 
                />
              </Form.Item>

              <Form.Item
                name="price"
                label="Price per Item (₹)"
                rules={[
                  { required: true, message: 'Please enter price' },
                  { 
                    validator: (_, value) => {
                      if (!value || value < 0) {
                        return Promise.reject('Price must be a positive number');
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <InputNumber 
                  placeholder="e.g., 299" 
                  size="large"
                  prefix="₹"
                  min={0}
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                name="depositAmount"
                label="Security Deposit Amount (₹)"
                rules={[
                  { required: true, message: 'Please enter deposit amount' },
                  { 
                    validator: (_, value) => {
                      if (value === undefined || value < 0) {
                        return Promise.reject('Deposit amount must be a positive number');
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
                tooltip="This deposit will be calculated based on the minimum duration"
              >
                <InputNumber 
                  placeholder="e.g., 500" 
                  size="large"
                  prefix="₹"
                  min={0}
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                name="minimumDuration"
                label="Minimum Subscription Duration"
                rules={[
                  { required: true, message: 'Please select minimum duration' }
                ]}
                tooltip="Bundles containing this category will have this as minimum duration"
              >
                <Radio.Group size="large" className="w-full">
                  <div className="grid grid-cols-4 gap-2">
                    <Radio.Button value={1} className="text-center">1 Month</Radio.Button>
                    <Radio.Button value={3} className="text-center">3 Months</Radio.Button>
                    <Radio.Button value={6} className="text-center">6 Months</Radio.Button>
                    <Radio.Button value={12} className="text-center">12 Months</Radio.Button>
                  </div>
                </Radio.Group>
              </Form.Item>

              <Form.Item label="Category Image">
                <Upload
                  beforeUpload={handleImageUpload}
                  showUploadList={false}
                  accept="image/*"
                >
                  <Button icon={<UploadOutlined />} loading={uploading} size="large">
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </Button>
                </Upload>
                {imageUrl && (
                  <div className="mt-3">
                    <img
                      src={imageUrl}
                      alt="Category preview"
                      className="w-full h-48 object-cover rounded border"
                    />
                  </div>
                )}
              </Form.Item>

              <Form.Item className="mb-0">
                <div className="flex gap-2 justify-end">
                  <Button onClick={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                    setImageUrl('');
                  }}>
                    Cancel
                  </Button>
                  <Button type="primary" htmlType="submit" size="large">
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </Content>
    </Layout>
  );
};

export default CategoriesPage;
