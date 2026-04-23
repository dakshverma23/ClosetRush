import React, { useState, useEffect } from 'react';
import { Layout, Card, Table, Button, Modal, Form, Input, Select, Upload, message, Tag, Spin, Popconfirm, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, PictureOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import BackButton from '../../components/layout/BackButton';
import api from '../../services/api';

const { Content } = Layout;
const { TextArea } = Input;
const { Option } = Select;

const ScienceSectionsPage = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [form] = Form.useForm();
  const [imageForm] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const response = await api.get('/science-sections');
      setSections(response.data.sections || []);
    } catch (error) {
      message.error('Failed to load sections');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingSection(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (section) => {
    setEditingSection(section);
    form.setFieldsValue({
      title: section.title,
      order: section.order,
      layout: section.layout,
      mainText: section.content?.mainText || '',
      bulletPoints: section.content?.bulletPoints?.join('\n') || '',
      additionalText: section.content?.additionalText || '',
      backgroundColor: section.backgroundColor,
      textColor: section.textColor,
      active: section.active
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/science-sections/${id}`);
      message.success('Section deleted successfully');
      fetchSections();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to delete section');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const bulletPoints = values.bulletPoints
        ? values.bulletPoints.split('\n').filter(point => point.trim())
        : [];

      const data = {
        title: values.title,
        order: values.order,
        layout: values.layout,
        content: {
          mainText: values.mainText || '',
          bulletPoints,
          additionalText: values.additionalText || ''
        },
        backgroundColor: values.backgroundColor || '#ffffff',
        textColor: values.textColor || '#0f172a',
        active: values.active !== false
      };

      if (editingSection) {
        await api.put(`/science-sections/${editingSection._id}`, data);
        message.success('Section updated successfully');
      } else {
        await api.post('/science-sections', data);
        message.success('Section created successfully');
      }

      setModalVisible(false);
      form.resetFields();
      fetchSections();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to save section');
    }
  };

  const handleManageImages = (section) => {
    setSelectedSection(section);
    setImageModalVisible(true);
    imageForm.resetFields();
    setFileList([]);
  };

  const handleImageUpload = async (values) => {
    if (fileList.length === 0) {
      message.error('Please select an image');
      return;
    }

    const formData = new FormData();
    formData.append('image', fileList[0].originFileObj);
    formData.append('caption', values.caption || '');
    formData.append('position', values.position || 'left');

    try {
      await api.post(`/science-sections/${selectedSection._id}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      message.success('Image uploaded successfully');
      imageForm.resetFields();
      setFileList([]);
      fetchSections();
      // Update selected section
      const response = await api.get(`/science-sections/${selectedSection._id}`);
      setSelectedSection(response.data.section);
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to upload image');
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await api.delete(`/science-sections/${selectedSection._id}/images/${imageId}`);
      message.success('Image deleted successfully');
      fetchSections();
      // Update selected section
      const response = await api.get(`/science-sections/${selectedSection._id}`);
      setSelectedSection(response.data.section);
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to delete image');
    }
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Image must be smaller than 5MB!');
        return false;
      }
      setFileList([file]);
      return false;
    },
    fileList,
    onRemove: () => {
      setFileList([]);
    }
  };

  const layoutDescriptions = {
    layout1: 'Image Left, Content Right (with bullet points)',
    layout2: 'Content Left, Vertical Image Right',
    layout3: 'Full Width with Two Images at Bottom',
    layout4: 'Card with Top Icons/Images Row'
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
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            size="small"
            icon={<PictureOutlined />}
            onClick={() => handleManageImages(record)}
          >
            Images
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this section?"
            onConfirm={() => handleDelete(record._id)}
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
    <Layout className="min-h-screen bg-gray-50">
      <Navbar />
      <Content className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <BackButton />
          </div>

          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Science Sections Management</h1>
              <p className="text-gray-600 mt-2">Manage content for the "Science Behind" page</p>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              Add Section
            </Button>
          </div>

          <Card>
            <Table
              columns={columns}
              dataSource={sections}
              rowKey="_id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>

          {/* Section Modal */}
          <Modal
            title={editingSection ? 'Edit Section' : 'Add New Section'}
            open={modalVisible}
            onCancel={() => {
              setModalVisible(false);
              form.resetFields();
            }}
            footer={null}
            width={800}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Form.Item
                name="title"
                label="Section Title"
                rules={[{ required: true, message: 'Please enter section title' }]}
              >
                <Input placeholder="e.g., Health Benefits" />
              </Form.Item>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="order"
                  label="Order (1-4)"
                  rules={[
                    { required: true, message: 'Please enter order' },
                    { type: 'number', min: 1, max: 4, message: 'Order must be between 1 and 4' }
                  ]}
                >
                  <Input type="number" min={1} max={4} />
                </Form.Item>

                <Form.Item
                  name="layout"
                  label="Layout Type"
                  rules={[{ required: true, message: 'Please select layout' }]}
                >
                  <Select placeholder="Select layout">
                    <Option value="layout1">Layout 1 - Image Left, Content Right</Option>
                    <Option value="layout2">Layout 2 - Content Left, Image Right (Vertical)</Option>
                    <Option value="layout3">Layout 3 - Full Width, 2 Images Bottom</Option>
                    <Option value="layout4">Layout 4 - Card with Top Icons</Option>
                  </Select>
                </Form.Item>
              </div>

              <Form.Item
                name="mainText"
                label="Main Text"
              >
                <TextArea rows={4} placeholder="Enter main content text" />
              </Form.Item>

              <Form.Item
                name="bulletPoints"
                label="Bullet Points (one per line)"
              >
                <TextArea rows={6} placeholder="Enter each bullet point on a new line" />
              </Form.Item>

              <Form.Item
                name="additionalText"
                label="Additional Text"
              >
                <TextArea rows={3} placeholder="Enter additional text (optional)" />
              </Form.Item>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="backgroundColor"
                  label="Background Color"
                >
                  <Input type="color" defaultValue="#ffffff" />
                </Form.Item>

                <Form.Item
                  name="textColor"
                  label="Text Color"
                >
                  <Input type="color" defaultValue="#0f172a" />
                </Form.Item>
              </div>

              <Form.Item
                name="active"
                label="Status"
                valuePropName="checked"
                initialValue={true}
              >
                <Select>
                  <Option value={true}>Active</Option>
                  <Option value={false}>Inactive</Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    {editingSection ? 'Update Section' : 'Create Section'}
                  </Button>
                  <Button onClick={() => {
                    setModalVisible(false);
                    form.resetFields();
                  }}>
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>

          {/* Image Management Modal */}
          <Modal
            title={`Manage Images - ${selectedSection?.title}`}
            open={imageModalVisible}
            onCancel={() => {
              setImageModalVisible(false);
              setSelectedSection(null);
              imageForm.resetFields();
              setFileList([]);
            }}
            footer={null}
            width={800}
          >
            {selectedSection && (
              <div>
                {/* Current Images */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Current Images ({selectedSection.images?.length || 0})</h3>
                  {selectedSection.images && selectedSection.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {selectedSection.images.map((image) => (
                        <div key={image._id} className="border rounded-lg p-3">
                          <img
                            src={image.url}
                            alt={image.caption}
                            className="w-full h-40 object-cover rounded mb-2"
                          />
                          <p className="text-sm text-gray-600 mb-2">{image.caption || 'No caption'}</p>
                          <Popconfirm
                            title="Delete this image?"
                            onConfirm={() => handleDeleteImage(image._id)}
                            okText="Yes"
                            cancelText="No"
                          >
                            <Button size="small" danger icon={<DeleteOutlined />}>
                              Delete
                            </Button>
                          </Popconfirm>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No images uploaded yet</p>
                  )}
                </div>

                {/* Upload New Image */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-3">Upload New Image</h3>
                  <Form
                    form={imageForm}
                    layout="vertical"
                    onFinish={handleImageUpload}
                  >
                    <Form.Item
                      label="Image File"
                      required
                    >
                      <Upload {...uploadProps} listType="picture">
                        <Button icon={<UploadOutlined />}>Select Image</Button>
                      </Upload>
                      <p className="text-xs text-gray-500 mt-1">Max size: 5MB. Formats: JPG, PNG, GIF</p>
                    </Form.Item>

                    <Form.Item
                      name="caption"
                      label="Image Caption (optional)"
                    >
                      <Input placeholder="Enter image caption" />
                    </Form.Item>

                    <Form.Item
                      name="position"
                      label="Image Position"
                      initialValue="left"
                    >
                      <Select>
                        <Option value="left">Left</Option>
                        <Option value="right">Right</Option>
                        <Option value="top">Top</Option>
                        <Option value="bottom">Bottom</Option>
                        <Option value="center">Center</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item>
                      <Button type="primary" htmlType="submit" icon={<UploadOutlined />}>
                        Upload Image
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </Content>
    </Layout>
  );
};

export default ScienceSectionsPage;
