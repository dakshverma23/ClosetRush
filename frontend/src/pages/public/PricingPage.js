import React, { useState, useEffect } from 'react';
import { Layout, Typography, Row, Col, Tag, message } from 'antd';
import { CheckOutlined, StarOutlined, CrownOutlined, GiftOutlined, ThunderboltOutlined } from '@ant-design/icons';
import Navbar from '../../components/layout/Navbar';
import BackButton from '../../components/layout/BackButton';
import api from '../../services/api';

const { Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

const PricingPage = () => {
  const [discounts, setDiscounts] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const response = await api.get('/calculate/discounts');
      setDiscounts(response.data.discounts);
    } catch (error) {
      message.error('Failed to load pricing');
    }
  };

  const pricingTiers = [
    {
      duration: 1,
      label: 'Monthly',
      price: 300,
      originalPrice: null,
      discount: 0,
      icon: <StarOutlined />,
      popular: false,
      features: [
        'All bundle features', 
        'Free delivery & pickup', 
        'Flexible scheduling', 
        'Customer support',
        '24/7 online tracking'
      ],
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      duration: 3,
      label: '3 Months',
      price: 855,
      originalPrice: 900,
      discount: 5,
      icon: <GiftOutlined />,
      popular: false,
      features: [
        'All monthly features', 
        'Priority support', 
        'Flexible rescheduling', 
        'Quality guarantee',
        'Express processing'
      ],
      gradient: 'from-green-500 to-teal-600'
    },
    {
      duration: 6,
      label: '6 Months',
      price: 1620,
      originalPrice: 1800,
      discount: 10,
      icon: <CrownOutlined />,
      popular: true,
      features: [
        'All 3-month features', 
        'Premium customer care', 
        'Express delivery', 
        'Damage protection',
        'Free emergency service'
      ],
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      duration: 12,
      label: '12 Months',
      price: 2880,
      originalPrice: 3600,
      discount: 20,
      icon: <ThunderboltOutlined />,
      popular: false,
      features: [
        'All 6-month features', 
        'Dedicated account manager', 
        'Same-day delivery', 
        'Free replacements',
        'VIP customer status'
      ],
      gradient: 'from-orange-500 to-red-600'
    }
  ];

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-bg-main to-bg-elevated">
      <Navbar />
      <Content>
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-hero"></div>
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent-400/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
          
          <div className="relative z-10 py-20 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="mb-4">
                <BackButton className="!text-white hover:!text-white hover:!bg-white/20" />
              </div>
              <div className="text-center">
                <Title level={1} className="!text-text-inverse !text-4xl md:!text-6xl mb-4 font-bold animate-float">
                  Flexible Pricing Plans
                </Title>
                <Paragraph className="!text-text-inverse/90 !text-xl max-w-2xl mx-auto">
                  Choose the perfect subscription plan for your needs. Save more with longer commitments and enjoy premium bedding service.
                </Paragraph>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="py-20 px-4 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Title level={2} className="!text-3xl md:!text-4xl font-bold text-gradient-primary mb-4">
                Choose Your Plan
              </Title>
              <Paragraph className="!text-lg text-text-secondary max-w-2xl mx-auto mb-8">
                All plans include our premium bedding service with professional cleaning and convenient delivery
              </Paragraph>
            </div>

            <Row gutter={[24, 24]} justify="center">
              {pricingTiers.map((tier, index) => (
                <Col xs={24} sm={12} lg={6} key={tier.duration}>
                  <div 
                    className={`relative h-full ${tier.popular ? 'transform scale-105' : ''}`}
                    onMouseEnter={() => setHoveredCard(index)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    {tier.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="bg-gradient-accent px-6 py-2 rounded-full text-text-inverse text-sm font-bold shadow-modern animate-pulse">
                          Most Popular
                        </div>
                      </div>
                    )}
                    
                    <div className={`card-modern-glass p-8 h-full text-center transition-all duration-500 ${
                      tier.popular ? 'border-2 border-accent-400 shadow-glow-accent' : 'border border-gray-200'
                    } ${
                      hoveredCard === index ? 'transform scale-105 shadow-2xl' : 'hover:transform hover:scale-102'
                    }`}>
                      {/* Icon with gradient background */}
                      <div className={`w-16 h-16 bg-gradient-to-br ${tier.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform transition-transform duration-300 ${
                        hoveredCard === index ? 'rotate-6 scale-110' : ''
                      }`}>
                        <span className="text-2xl text-white">{tier.icon}</span>
                      </div>

                      {/* Plan Name */}
                      <Title level={3} className="!text-text-primary mb-2 font-bold">
                        {tier.label}
                      </Title>

                      {/* Discount Badge */}
                      {tier.discount > 0 && (
                        <Tag color="green" className="mb-4 px-3 py-1 rounded-full font-semibold animate-bounce">
                          Save {tier.discount}%
                        </Tag>
                      )}

                      {/* Pricing */}
                      <div className="mb-6">
                        <div className="text-4xl font-bold text-gradient-primary mb-1 transition-all duration-300">
                          ₹{tier.price.toLocaleString()}
                        </div>
                        {tier.originalPrice && (
                          <div className="text-sm text-text-muted line-through">
                            ₹{tier.originalPrice.toLocaleString()}
                          </div>
                        )}
                        <div className="text-sm text-text-secondary">
                          for {tier.duration} {tier.duration === 1 ? 'month' : 'months'}
                        </div>
                      </div>

                      {/* Features */}
                      <ul className="text-left space-y-3 mb-8">
                        {tier.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start gap-3 group">
                            <CheckOutlined className="text-accent-500 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                            <span className="text-text-secondary group-hover:text-text-primary transition-colors">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA Button */}
                      <button className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform ${
                        tier.popular 
                          ? 'bg-gradient-accent text-white shadow-glow-accent hover:scale-105 hover:shadow-xl' 
                          : 'bg-gradient-primary text-white shadow-glow-primary hover:scale-105 hover:shadow-xl'
                      } ${
                        hoveredCard === index ? 'animate-pulse' : ''
                      }`}>
                        Choose {tier.label}
                      </button>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>

            {/* Example Calculation */}
            <div className="mt-20 text-center">
              <div className="card-modern-glass p-8 max-w-4xl mx-auto">
                <Title level={3} className="!text-text-primary mb-4 font-bold">
                  Example: Single Bed Bundle
                </Title>
                <Paragraph className="!text-text-secondary mb-8">
                  See how much you can save with our flexible pricing tiers
                </Paragraph>
                
                <Row gutter={[16, 16]}>
                  {pricingTiers.map((tier) => (
                    <Col xs={12} sm={6} key={tier.duration}>
                      <div className={`p-4 rounded-modern border-2 transition-all duration-300 hover:transform hover:scale-105 ${
                        tier.popular 
                          ? 'border-accent-400 bg-gradient-to-br from-accent-50 to-primary-50' 
                          : 'border-gray-200 bg-gradient-card'
                      }`}>
                        <div className="font-semibold text-text-primary mb-1">{tier.label}</div>
                        <div className={`text-xl font-bold mb-1 ${tier.popular ? 'text-gradient-accent' : 'text-gradient-primary'}`}>
                          ₹{tier.price.toLocaleString()}
                        </div>
                        {tier.discount > 0 ? (
                          <div className="text-xs text-accent-500 font-medium">
                            Save ₹{(tier.originalPrice - tier.price).toLocaleString()}
                          </div>
                        ) : (
                          <div className="text-xs text-text-muted">No discount</div>
                        )}
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mt-20 text-center">
              <Title level={3} className="!text-text-primary mb-8 font-bold">
                Frequently Asked Questions
              </Title>
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <div className="card-modern-glass p-6 h-full">
                    <Title level={5} className="!text-text-primary mb-3">Can I change my plan?</Title>
                    <Paragraph className="text-text-secondary">
                      Yes! You can upgrade or downgrade your plan at any time. Changes take effect from your next billing cycle.
                    </Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="card-modern-glass p-6 h-full">
                    <Title level={5} className="!text-text-primary mb-3">What's included in delivery?</Title>
                    <Paragraph className="text-text-secondary">
                      All plans include free pickup and delivery, professional cleaning, and quality inspection of your bedding.
                    </Paragraph>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </Content>
      
      <Footer className="text-center bg-gradient-hero text-text-inverse py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-lg font-semibold mb-2">ClosetRush ©2024</div>
          <div className="text-text-inverse/70">Flexible pricing for premium bedding service</div>
        </div>
      </Footer>
    </Layout>
  );
};

export default PricingPage;
