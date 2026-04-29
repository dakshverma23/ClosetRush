import React, { useState, useEffect } from 'react';
import {
  Layout, Card, Form, Input, InputNumber, Select, Button, Upload,
  message, Row, Col, Slider, Typography, Divider
} from 'antd';
import {
  CameraOutlined, UploadOutlined, SaveOutlined, ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import api from '../../services/api';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const SubmitPickupReport = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [dirtyLevel, setDirtyLevel] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    loadInventoryItems();
  }, []);

  const loadInventoryItems = async () => {
    try {
      const response = await api.get('/inventory-management/items');
      // Filter items that are with_customer or pickup_pending
      const availableItems = response.data.items.filter(
        item => ['with_customer', 'dispatched'].includes(item.status)
      );
      setItems(availableItems);
    } catch (error) {
      message.error('Failed to load inventory items');
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Find selected item details
      const selectedItem = items.find(item => item._id === values.inventoryItemId);
      
      if (!selectedItem) {
        message.error('Please select a valid inventory item');
        return;
      }

      // Prepare photos (convert file list to base64 or URLs)
      const photos = fileList.map(file => file.thumbUrl || file.url);

      const reportData = {
        inventoryItemId: values.inventoryItemId,
        skuCode: selectedItem.skuCode,
        bundleId: selectedItem.bundleId._id || selectedItem.bundleId,
        pgName: values.pgName,
        roomNo: values.roomNo,
        area: values.area,
        pincode: values.pincode,
        dirtyLevel: values.dirtyLevel,
        wearAndTear: values.wearAndTear,
        wearNotes: values.wearNotes,
        bagMarking: values.bagMarking,
        bagCondition: values.bagCondition,
        photos
      };

      await api.post('/inventory-management/reports', reportData);
      
      message.success('Pickup report submitted successfully!');
      form.resetFields();
      setFileList([]);
      navigate('/pickup/dashboard');
    } catch (error) {
      message.error(error.response?.data?.error?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    listType: 'picture-card',
    fileList,
    beforeUpload: (file) => {
      // Convert to base64 for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFileList(prev => [...prev, {
          uid: file.uid,
          name: file.name,
          status: 'done',
          url: e.target.result,
          thumbUrl: e.target.result
        }]);
      };
      reader.readAsDataURL(file);
      return false; // Prevent auto upload
    },
    onRemove: (file) => {
      setFileList(prev => prev.filter(f => f.uid !== file.uid));
    },
    maxCount: 5
  };

  const dirtyMarks = {
    0: 'Clean',
    3: 'Light',
    5: 'Moderate',
    7: 'Heavy',
    10: 'Extreme'
  };

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-bg-main to-bg-elevated">
      <Navbar />
      <Content className="p-6 max-w-4xl mx-auto w-full">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/pickup/dashboard')}
          className="mb-4"
        >
          Back to Dashboard
        </Button>

        <Card className="card-modern-glass">
          <div className="mb-6">
            <Title level={2} className="!text-gradient-primary !mb-2">
              <CameraOutlined className="mr-3" />
              Submit Pickup Report
            </Title>
            <Text className="text-text-secondary">
              Document the condition of items picked up from customers
            </Text>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              dirtyLevel: 5,
              wearAndTear: 'none',
              bagCondition: 'ok'
            }}
          >
            <Divider orientation="left">Item Information</Divider>

            <Form.Item
              label="Select Inventory Item (SKU)"
              name="inventoryItemId"
              rules={[{ required: true, message: 'Please select an item' }]}
            >
              <Select
                placeholder="Search by SKU code"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
                size="large"
              >
                {items.map(item => (
                  <Option key={item._id} value={item._id}>
                    {item.skuCode} - {item.bundleId?.name} ({item.categoryId?.name})
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Divider orientation="left">Pickup Location</Divider>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="PG Name"
                  name="pgName"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <Input placeholder="e.g., Sunrise PG" size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Room Number"
                  name="roomNo"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <Input placeholder="e.g., 204" size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Area"
                  name="area"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <Input placeholder="e.g., Koramangala" size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Pincode"
                  name="pincode"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <Input placeholder="e.g., 560034" size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Condition Assessment</Divider>

            <Form.Item
              label={`Dirtiness Level: ${dirtyLevel}/10`}
              name="dirtyLevel"
              rules={[{ required: true }]}
            >
              <Slider
                marks={dirtyMarks}
                min={0}
                max={10}
                onChange={setDirtyLevel}
                tooltip={{ formatter: (v) => `${v}/10` }}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Wear & Tear"
                  name="wearAndTear"
                  rules={[{ required: true }]}
                >
                  <Select size="large">
                    <Option value="none">None</Option>
                    <Option value="minor">Minor</Option>
                    <Option value="moderate">Moderate</Option>
                    <Option value="heavy">Heavy</Option>
                    <Option value="damaged">Damaged</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Bag Condition"
                  name="bagCondition"
                  rules={[{ required: true }]}
                >
                  <Select size="large">
                    <Option value="ok">OK</Option>
                    <Option value="torn">Torn</Option>
                    <Option value="missing">Missing</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Bag Marking" name="bagMarking">
              <Input placeholder="e.g., BAG-001-A" size="large" />
            </Form.Item>

            <Form.Item label="Wear & Tear Notes" name="wearNotes">
              <TextArea
                rows={3}
                placeholder="Describe any damage, stains, or wear..."
              />
            </Form.Item>

            <Divider orientation="left">Photo Evidence</Divider>

            <Form.Item
              label="Upload Photos (Max 5)"
              extra="Take clear photos showing the condition of items"
            >
              <Upload {...uploadProps}>
                {fileList.length < 5 && (
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
            </Form.Item>

            <Form.Item className="mt-8">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                icon={<SaveOutlined />}
                loading={loading}
                block
                className="btn-modern-primary h-14 text-lg font-semibold"
              >
                Submit Pickup Report
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Content>
      <Footer />
    </Layout>
  );
};

export default SubmitPickupReport;
