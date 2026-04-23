import React, { useState, useEffect } from 'react';
import { Layout, Typography, Row, Col, Card, Button, Tag, message } from 'antd';
import { CheckOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import BackButton from '../../components/layout/BackButton';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const WhatWeOffer = () => {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchBundles();
  }, []);

  const fetchBundles = async () => {
    try {
      const response = await api.get('/bundles');
      setBundles(response.data.bundles);
    } catch (error) {
      message.error('Failed to load bundles');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (bundleId) => {
    if (!isAuthenticated()) {
      message.info('Please login to subscribe');
      navigate('/login');
      return;
    }
    navigate('/subscriptions', { state: { bundleId } });
  };

  return (
    <Layout className="min-h-screen">
      <Navbar />
      <Content>
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 text-white py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-4">
              <BackButton className="!text-white hover:!text-white hover:!bg-white/20" />
            </div>
            <div className="text-center">
              <Title level={1} className="!text-white !text-4xl md:!text-5xl mb-4">
                What We Offer
              </Title>
              <Paragraph className="!text-white !text-lg">
                Choose the perfect subscription bundle for your needs
              </Paragraph>
            </div>
          </div>
        </div>

        {/* Bundles Section */}
        <div className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <Row gutter={[32, 32]}>
              {bundles.map((bundle) => (
                <Col xs={24} md={8} key={bundle._id}>
                  <Card 
                    className="h-full hover:shadow-xl transition-shadow"
                    actions={[
                      <Button 
                        type="primary" 
                        icon={<ShoppingCartOutlined />}
                        onClick={() => handleSubscribe(bundle._id)}
                        block
                      >
                        Subscribe Now
                      </Button>
                    ]}
                  >
                    <div className="text-center mb-4">
                      <Title level={3}>{bundle.name}</Title>
                      <div className="text-3xl font-bold text-primary-600 mb-2">
                        ₹{bundle.price}
                        <span className="text-sm text-gray-500">/{bundle.billingCycle === 'monthly' ? 'month' : '3 months'}</span>
                      </div>
                      {bundle.depositAmount > 0 && (
                        <Tag color="orange">Deposit: ₹{bundle.depositAmount}</Tag>
                      )}
                    </div>

                    <Paragraph className="text-gray-600 mb-4">
                      {bundle.description}
                    </Paragraph>

                    <div className="space-y-2">
                      <Title level={5}>What's Included:</Title>
                      {bundle.items.singleBedsheets > 0 && (
                        <div className="flex items-center">
                          <CheckOutlined className="text-green-500 mr-2" />
                          <span>{bundle.items.singleBedsheets} Single Bedsheets</span>
                        </div>
                      )}
                      {bundle.items.doubleBedsheets > 0 && (
                        <div className="flex items-center">
                          <CheckOutlined className="text-green-500 mr-2" />
                          <span>{bundle.items.doubleBedsheets} Double Bedsheets</span>
                        </div>
                      )}
                      {bundle.items.pillowCovers > 0 && (
                        <div className="flex items-center">
                          <CheckOutlined className="text-green-500 mr-2" />
                          <span>{bundle.items.pillowCovers} Pillow Covers</span>
                        </div>
                      )}
                      {bundle.items.curtains > 0 && (
                        <div className="flex items-center">
                          <CheckOutlined className="text-green-500 mr-2" />
                          <span>{bundle.items.curtains} Curtain Sets</span>
                        </div>
                      )}
                    </div>
                  </Card>
                </Col>
              ))}

              {/* Coming Soon Card */}
              <Col xs={24} md={8}>
                <Card className="h-full bg-gray-50">
                  <div className="text-center">
                    <Title level={3}>Coming Soon</Title>
                    <Paragraph className="text-gray-600">
                      More exciting bundles and options are on the way!
                    </Paragraph>
                    <ul className="text-left space-y-2 mt-4">
                      <li>• Premium Luxury Bedding</li>
                      <li>• Seasonal Collections</li>
                      <li>• Custom Bundle Builder</li>
                      <li>• Towel Subscriptions</li>
                    </ul>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Features Section */}
            <div className="mt-16 bg-primary-50 p-8 rounded-lg">
              <Title level={2} className="text-center mb-8">All Bundles Include</Title>
              <Row gutter={[32, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <div className="text-center">
                    <CheckOutlined className="text-3xl text-primary-600 mb-2" />
                    <div className="font-semibold">Free Delivery</div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div className="text-center">
                    <CheckOutlined className="text-3xl text-primary-600 mb-2" />
                    <div className="font-semibold">Free Pickup</div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div className="text-center">
                    <CheckOutlined className="text-3xl text-primary-600 mb-2" />
                    <div className="font-semibold">Professional Cleaning</div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div className="text-center">
                    <CheckOutlined className="text-3xl text-primary-600 mb-2" />
                    <div className="font-semibold">Quality Guarantee</div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </Content>
      
      <Footer />
    </Layout>
  );
};

export default WhatWeOffer;
