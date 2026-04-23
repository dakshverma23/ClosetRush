import React, { useState } from 'react';
import { Layout, Typography, Form, Input, Button, Card, message } from 'antd';
import { PhoneOutlined, MailOutlined, UserOutlined, HomeOutlined } from '@ant-design/icons';
import Navbar from '../../components/layout/Navbar';
import BackButton from '../../components/layout/BackButton';
import api from '../../services/api';

const { Content, Footer } = Layout;
const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const GetQuotePage = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await api.post('/quotes', values);
      message.success('Quote request submitted! We will contact you soon.');
      form.resetFields();
    } catch (error) {
      message.error(error.error?.message || 'Failed to submit quote request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="min-h-screen">
      <Navbar />
      <Content>
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 text-white py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-4">
              <BackButton className="!text-white hover:!text-white hover:!bg-white/20" />
            </div>
            <div className="text-center">
              <Title level={1} className="!text-white !text-4xl md:!text-5xl mb-4">
                Get a Business Quote
              </Title>
              <Paragraph className="!text-white !text-lg">
                Custom solutions for PGs, homestays, rental properties, and more
              </Paragraph>
            </div>
          </div>
        </div>

        <div className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <Card>
              <Title level={2} className="mb-6">Request a Quote</Title>
              <Form form={form} onFinish={onFinish} layout="vertical">
                <Form.Item 
                  name="businessName" 
                  label="Business Name"
                  rules={[{ required: true, message: 'Please enter business name' }]}
                >
                  <Input prefix={<HomeOutlined />} placeholder="Your Business Name" size="large" />
                </Form.Item>

                <Form.Item 
                  name="contactPerson" 
                  label="Contact Person"
                  rules={[{ required: true, message: 'Please enter contact person name' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Your Name" size="large" />
                </Form.Item>

                <Form.Item 
                  name="email" 
                  label="Email"
                  rules={[
                    { required: true, message: 'Please enter email' },
                    { type: 'email', message: 'Please enter valid email' }
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="your@email.com" size="large" />
                </Form.Item>

                <Form.Item 
                  name="phone" 
                  label="Phone Number"
                  rules={[{ required: true, message: 'Please enter phone number' }]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder="Your Phone Number" size="large" />
                </Form.Item>

                <Form.Item 
                  name="propertyDetails" 
                  label="Property Details"
                  rules={[{ required: true, message: 'Please provide property details' }]}
                >
                  <TextArea 
                    rows={6} 
                    placeholder="Tell us about your property (type, number of units, location, etc.)"
                  />
                </Form.Item>

                <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                  Submit Quote Request
                </Button>
              </Form>
            </Card>

            <div className="mt-12">
              <Title level={3} className="text-center mb-8">Perfect For</Title>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <Title level={4}>🏠 PGs & Hostels</Title>
                  <Paragraph>Manage bedding for multiple rooms with ease</Paragraph>
                </Card>
                <Card>
                  <Title level={4}>🏡 Homestays</Title>
                  <Paragraph>Keep guest rooms fresh and welcoming</Paragraph>
                </Card>
                <Card>
                  <Title level={4}>🏢 Rental Properties</Title>
                  <Paragraph>Maintain multiple properties effortlessly</Paragraph>
                </Card>
                <Card>
                  <Title level={4}>🏘️ Apartment Buildings</Title>
                  <Paragraph>Bulk subscriptions for entire buildings</Paragraph>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </Content>
      <Footer className="text-center bg-gray-800 text-white">
        ClosetRush ©2024
      </Footer>
    </Layout>
  );
};

export default GetQuotePage;
