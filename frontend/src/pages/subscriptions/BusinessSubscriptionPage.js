import React, { useState, useEffect } from 'react';
import {
  Layout, Card, Row, Col, Button, message, Spin, Form, Input,
  InputNumber, Select, Divider, Alert, Tag, Checkbox
} from 'antd';
import {
  SendOutlined, PhoneOutlined, MailOutlined, TeamOutlined,
  CheckCircleOutlined, SafetyOutlined, ShoppingOutlined, DollarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import BackButton from '../../components/layout/BackButton';
import api from '../../services/api';

const { Content } = Layout;
const { TextArea } = Input;
const { Option } = Select;

// Get available durations for a bundle (respecting minimum duration constraints)
const getBundleAvailableDurations = (bundle) => {
  // Standard duration options
  const standardDurations = [1, 3, 6, 12];
  
  if (bundle && bundle.items && Array.isArray(bundle.items)) {
    // Get the highest minimum duration from all categories in this bundle
    const minDurations = bundle.items
      .map(item => item.category && item.category.minimumDuration)
      .filter(Boolean);
    
    if (minDurations.length > 0) {
      const highestMinDuration = Math.max(...minDurations);
      // Return only durations that meet or exceed the minimum requirement
      return standardDurations.filter(duration => duration >= highestMinDuration);
    }
  }
  
  // Fallback: use bundle's minimum duration or default to all options
  const bundleMinDuration = bundle?.minimumDuration || 1;
  return standardDurations.filter(duration => duration >= bundleMinDuration);
};

// Helper function to get billing cycle duration in months
const getBillingCycleMonths = (billingCycle) => {
  switch (billingCycle) {
    case 'monthly': return 1;
    case 'quarterly': return 3;
    case 'yearly': return 12;
    default: return 1; // Default to monthly
  }
};

// Helper function to calculate billing cycles from duration
const calculateBillingCycles = (durationMonths, billingCycle) => {
  const cycleMonths = getBillingCycleMonths(billingCycle);
  return Math.ceil(durationMonths / cycleMonths);
};

const BusinessSubscriptionPage = () => {
  const [loading, setLoading] = useState(true);
  const [submittingContact, setSubmittingContact] = useState(false);
  const [submittingQuote, setSubmittingQuote] = useState(false);
  const [bundles, setBundles] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [activeTab, setActiveTab] = useState('connect');
  const [selectedBundles, setSelectedBundles] = useState({});
  const [expandedBundles, setExpandedBundles] = useState([]);
  const [numberOfProperties, setNumberOfProperties] = useState(1);
  const [unitsPerProperty, setUnitsPerProperty] = useState(1);
  const [contactForm] = Form.useForm();
  const [quoteForm] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const bundlesRes = await api.get('/bundles');
      setBundles((bundlesRes.data.bundles || []).filter(b => b.active));
      const discountsRes = await api.get('/calculate/discounts');
      setDiscounts(discountsRes.data.discounts || []);
    } catch (error) {
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitContact = async (values) => {
    setSubmittingContact(true);
    try {
      await api.post('/quotes', {
        businessName: values.businessName,
        contactPerson: values.contactPerson,
        email: values.email,
        phone: values.phone,
        businessType: values.businessType,
        additionalRequirements: values.message,
        type: 'connect'
      });
      message.success('Message sent! Our team will contact you within 24 hours.');
      contactForm.resetFields();
    } catch (error) {
      message.error((error.response && error.response.data && error.response.data.message) || 'Failed to send message');
    } finally {
      setSubmittingContact(false);
    }
  };

  const handleBundleCheckboxChange = (bundleId, checked) => {
    if (checked) {
      const bundle = bundles.find(b => b._id === bundleId);
      const durations = getBundleAvailableDurations(bundle);
      setExpandedBundles(prev => [...prev, bundleId]);
      setSelectedBundles(prev => ({ ...prev, [bundleId]: { quantity: 1, duration: durations[0] } }));
    } else {
      setExpandedBundles(prev => prev.filter(id => id !== bundleId));
      setSelectedBundles(prev => { const u = { ...prev }; delete u[bundleId]; return u; });
    }
  };

  const handleBundleDurationChange = (bundleId, duration) => {
    setSelectedBundles(prev => ({ ...prev, [bundleId]: { ...prev[bundleId], duration } }));
  };

  const handleBundleQuantityChange = (bundleId, quantity) => {
    setSelectedBundles(prev => ({ ...prev, [bundleId]: { ...prev[bundleId], quantity: Math.max(1, quantity || 1) } }));
  };

  const calculatePricing = () => {
    let totalOriginal = 0, totalDiscount = 0, totalDeposit = 0;
    Object.entries(selectedBundles).forEach(([bundleId, config]) => {
      const bundle = bundles.find(b => b._id === bundleId);
      if (!bundle || !config.quantity || !config.duration) return;
      const discountObj = discounts.find(d => d.months === config.duration);
      const discountPct = discountObj ? discountObj.percentage : 0;
      
      // Calculate billing cycles based on bundle's billing cycle and selected duration
      const billingCycles = calculateBillingCycles(config.duration, bundle.billingCycle);
      
      // Formula: no. of bundles × price × billing cycles × no. of properties
      const original = config.quantity * bundle.price * billingCycles * numberOfProperties;
      const disc = Math.round((original * discountPct) / 100);
      totalOriginal += original;
      totalDiscount += disc;
      if (bundle.items && Array.isArray(bundle.items)) {
        bundle.items.forEach(item => {
          if (item.category && item.category.depositAmount && item.category.minimumDuration) {
            totalDeposit += item.category.depositAmount * item.category.minimumDuration * item.quantity * config.quantity * numberOfProperties;
          }
        });
      }
    });
    return { original: totalOriginal, discount: totalDiscount, final: totalOriginal - totalDiscount, deposit: totalDeposit, total: totalOriginal - totalDiscount + totalDeposit };
  };

  const pricing = calculatePricing();

  const handleSubmitQuote = async (values) => {
    if (Object.keys(selectedBundles).length === 0) { message.warning('Please select at least one bundle'); return; }
    setSubmittingQuote(true);
    try {
      const bundleSelections = Object.entries(selectedBundles).map(([bundleId, config]) => {
        const bundle = bundles.find(b => b._id === bundleId);
        return { bundleId, bundleName: bundle ? bundle.name : '', quantity: config.quantity, duration: config.duration };
      });
      await api.post('/quotes', {
        businessName: values.businessName, contactPerson: values.contactPerson,
        email: values.email, phone: values.phone, businessType: values.businessType,
        numberOfProperties,
        unitsPerProperty,
        totalUnits: numberOfProperties * unitsPerProperty,
        bundleSelections, additionalRequirements: values.additionalRequirements,
        estimatedCost: pricing, type: 'quotation'
      });
      message.success('Quote request submitted! Our team will contact you with a detailed proposal.');
      quoteForm.resetFields(); setSelectedBundles({}); setExpandedBundles([]); setNumberOfProperties(1); setUnitsPerProperty(1);
      setTimeout(() => navigate('/business/dashboard'), 2000);
    } catch (error) {
      message.error((error.response && error.response.data && error.response.data.message) || 'Failed to submit quote');
    } finally { setSubmittingQuote(false); }
  };

  if (loading) {
    return (
      <Layout className="min-h-screen bg-gradient-to-br from-bg-main to-bg-elevated">
        <Navbar />
        <Content className="p-4 md:p-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Spin size="large" />
              <div className="mt-4 text-text-secondary font-medium">Loading business solutions...</div>
            </div>
          </div>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-bg-main to-bg-elevated">
      <Navbar />
      <Content className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <BackButton />
          </div>
          {/* Hero Section */}
          <div className="text-center mb-12 relative">
            <div className="absolute inset-0 bg-gradient-hero opacity-5 rounded-modern-lg blur-3xl"></div>
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient-primary animate-float">
                Business Solutions
              </h1>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
                Premium bedding subscriptions for PGs, homestays, rental properties and more. 
                Scale your business with our enterprise-grade solutions.
              </p>
            </div>
          </div>

          {/* Modern Tab Switcher */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex rounded-modern bg-gradient-card backdrop-blur-sm p-1.5 shadow-modern-lg border border-white/20">
              <button 
                onClick={() => setActiveTab('connect')}
                className={`px-8 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === 'connect' 
                    ? 'bg-gradient-primary text-text-inverse shadow-modern transform scale-105' 
                    : 'text-text-secondary hover:text-primary-500 hover:bg-white/50'
                }`}
              >
                Connect With Us
              </button>
              <button 
                onClick={() => setActiveTab('quotation')}
                className={`px-8 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === 'quotation' 
                    ? 'bg-gradient-primary text-text-inverse shadow-modern transform scale-105' 
                    : 'text-text-secondary hover:text-primary-500 hover:bg-white/50'
                }`}
              >
                Get a Quotation
              </button>
            </div>
          </div>

          {/* ── CONNECT WITH US ── */}
          {activeTab === 'connect' && (
            <div className="max-w-4xl mx-auto">
              {/* Contact Cards */}
              <Row gutter={[24, 24]} className="mb-8">
                <Col xs={24} sm={8}>
                  <div className="card-modern-glass p-6 text-center h-full hover:transform hover:scale-105 transition-all duration-300 group">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-pulse-glow">
                      <PhoneOutlined className="text-2xl text-text-inverse" />
                    </div>
                    <div className="font-bold text-text-primary mb-2">Call Us</div>
                    <div className="text-sm text-text-muted mb-2">Mon–Sat, 9am–6pm</div>
                    <div className="text-primary-500 font-semibold">+91 98765 43210</div>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div className="card-modern-glass p-6 text-center h-full hover:transform hover:scale-105 transition-all duration-300 group">
                    <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-pulse-glow">
                      <MailOutlined className="text-2xl text-text-inverse" />
                    </div>
                    <div className="font-bold text-text-primary mb-2">Email Us</div>
                    <div className="text-sm text-text-muted mb-2">Reply within 24 hours</div>
                    <div className="text-accent-500 font-semibold">business@closetrush.com</div>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div className="card-modern-glass p-6 text-center h-full hover:transform hover:scale-105 transition-all duration-300 group">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-pulse-glow">
                      <TeamOutlined className="text-2xl text-text-inverse" />
                    </div>
                    <div className="font-bold text-text-primary mb-2">Dedicated Manager</div>
                    <div className="text-sm text-text-muted mb-2">For 10+ properties</div>
                    <div className="text-primary-500 font-semibold">Priority support</div>
                  </div>
                </Col>
              </Row>

              {/* Contact Form */}
              <div className="card-modern-glass p-8 backdrop-blur-sm">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gradient-primary mb-2">Send Us a Message</h3>
                  <p className="text-text-secondary">Tell us about your business needs and we'll get back to you within 24 hours</p>
                </div>
                <Form form={contactForm} layout="vertical" onFinish={handleSubmitContact}>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Form.Item name="businessName" label={<span className="font-semibold text-text-primary">Business Name</span>} rules={[{ required: true, message: 'Required' }]}>
                        <Input placeholder="e.g., Sunrise PG" size="large" className="input-modern" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item name="businessType" label={<span className="font-semibold text-text-primary">Business Type</span>} rules={[{ required: true, message: 'Required' }]}>
                        <Select placeholder="Select type" size="large" className="input-modern">
                          <Option value="pg">PG (Paying Guest)</Option>
                          <Option value="homestay">Home Stay</Option>
                          <Option value="rental">Rental Properties</Option>
                          <Option value="building">Building / Apartments</Option>
                          <Option value="hotel">Hotel / Hostel</Option>
                          <Option value="other">Other</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item name="contactPerson" label={<span className="font-semibold text-text-primary">Your Name</span>} rules={[{ required: true, message: 'Required' }]}>
                        <Input placeholder="Full name" size="large" className="input-modern" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item name="phone" label={<span className="font-semibold text-text-primary">Phone Number</span>} rules={[{ required: true, message: 'Required' }, { pattern: /^[0-9]{10}$/, message: 'Enter valid 10-digit number' }]}>
                        <Input placeholder="10-digit mobile" size="large" className="input-modern" />
                      </Form.Item>
                    </Col>
                    <Col xs={24}>
                      <Form.Item name="email" label={<span className="font-semibold text-text-primary">Email Address</span>} rules={[{ required: true, message: 'Required' }, { type: 'email', message: 'Enter valid email' }]}>
                        <Input placeholder="your@email.com" size="large" className="input-modern" />
                      </Form.Item>
                    </Col>
                    <Col xs={24}>
                      <Form.Item name="message" label={<span className="font-semibold text-text-primary">Message (Optional)</span>}>
                        <TextArea rows={4} placeholder="Tell us about your requirements, number of properties, etc." className="input-modern" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Button 
                    type="primary" 
                    size="large" 
                    block 
                    htmlType="submit" 
                    icon={<SendOutlined />} 
                    loading={submittingContact}
                    className="btn-modern-primary mt-4 h-12 text-base font-semibold"
                  >
                    Send Message
                  </Button>
                </Form>
              </div>
            </div>
          )}

          {/* ── GET A QUOTATION ── */}
          {activeTab === 'quotation' && (
            <Form form={quoteForm} layout="vertical" onFinish={handleSubmitQuote}>
              <Row gutter={[32, 32]}>
                {/* Left column */}
                <Col xs={24} lg={14}>
                  {/* Business Details Card */}
                  <div className="card-modern-glass p-8 mb-8 backdrop-blur-sm">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mr-4">
                        <TeamOutlined className="text-xl text-text-inverse" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gradient-primary mb-1">Business Details</h3>
                        <p className="text-text-muted text-sm">Tell us about your business requirements</p>
                      </div>
                    </div>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12}>
                        <Form.Item name="businessName" label={<span className="font-semibold text-text-primary">Business Name</span>} rules={[{ required: true, message: 'Required' }]}>
                          <Input placeholder="e.g., Sunrise PG" size="large" className="input-modern" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="businessType" label={<span className="font-semibold text-text-primary">Business Type</span>} rules={[{ required: true, message: 'Required' }]}>
                          <Select placeholder="Select type" size="large" className="input-modern">
                            <Option value="pg">PG (Paying Guest)</Option>
                            <Option value="homestay">Home Stay</Option>
                            <Option value="rental">Rental Properties</Option>
                            <Option value="building">Building / Apartments</Option>
                            <Option value="hotel">Hotel / Hostel</Option>
                            <Option value="other">Other</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="contactPerson" label={<span className="font-semibold text-text-primary">Contact Person</span>} rules={[{ required: true, message: 'Required' }]}>
                          <Input placeholder="Full name" size="large" className="input-modern" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="phone" label={<span className="font-semibold text-text-primary">Phone</span>} rules={[{ required: true, message: 'Required' }, { pattern: /^[0-9]{10}$/, message: 'Enter valid 10-digit number' }]}>
                          <Input placeholder="10-digit mobile" size="large" className="input-modern" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="email" label={<span className="font-semibold text-text-primary">Email</span>} rules={[{ required: true, message: 'Required' }, { type: 'email', message: 'Enter valid email' }]}>
                          <Input placeholder="your@email.com" size="large" className="input-modern" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item label={<span className="font-semibold text-text-primary">Number of Properties</span>} tooltip="How many separate properties / locations do you manage?">
                          <InputNumber
                            min={1} max={10000}
                            value={numberOfProperties}
                            onChange={v => setNumberOfProperties(v || 1)}
                            className="w-full input-modern" size="large"
                            placeholder="e.g., 3"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item label={<span className="font-semibold text-text-primary">Approx. Units per Property</span>} tooltip="Average number of rooms / beds per property">
                          <InputNumber
                            min={1} max={10000}
                            value={unitsPerProperty}
                            onChange={v => setUnitsPerProperty(v || 1)}
                            className="w-full input-modern" size="large"
                            placeholder="e.g., 20"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24}>
                        <Form.Item name="additionalRequirements" label={<span className="font-semibold text-text-primary">Additional Requirements (Optional)</span>}>
                          <TextArea rows={3} placeholder="Any specific requirements?" className="input-modern" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>

                  {/* Bundle Selection Card */}
                  <div className="card-modern-glass p-8 backdrop-blur-sm">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center mr-4">
                        <ShoppingOutlined className="text-xl text-text-inverse" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gradient-accent mb-1">Select Bundles</h3>
                        <p className="text-text-muted text-sm">Choose the perfect bundles for your business</p>
                      </div>
                    </div>
                    <Alert 
                      message="Duration options are configured by admin per category" 
                      type="info" 
                      showIcon 
                      className="mb-6 bg-primary-50 border-primary-200" 
                    />
                    <div className="space-y-4">
                      {bundles.map(bundle => {
                        const isSelected = !!selectedBundles[bundle._id];
                        const isExpanded = expandedBundles.includes(bundle._id);
                        const availableDurations = getBundleAvailableDurations(bundle);
                        return (
                          <div key={bundle._id} className={`border-2 rounded-modern transition-all duration-300 ${
                            isSelected 
                              ? 'border-primary-300 shadow-modern-lg bg-gradient-to-r from-primary-50 to-accent-50' 
                              : 'border-gray-200 bg-gradient-card hover:border-primary-200 hover:shadow-modern'
                          }`}>
                            <div className="p-6 cursor-pointer flex items-center justify-between" onClick={() => handleBundleCheckboxChange(bundle._id, !isSelected)}>
                              <div className="flex items-center gap-4 flex-1">
                                <Checkbox 
                                  checked={isSelected} 
                                  onChange={e => { e.stopPropagation(); handleBundleCheckboxChange(bundle._id, e.target.checked); }}
                                  className="scale-125"
                                />
                                <div className="flex-1">
                                  <div className="font-bold text-text-primary text-lg mb-1">{bundle.name}</div>
                                  <div className="text-sm text-text-secondary mb-2">{bundle.description}</div>
                                  <div className="flex flex-wrap gap-2">
                                    {availableDurations.map(d => (
                                      <Tag key={d} color="blue" className="text-xs font-medium px-2 py-1 rounded-lg">
                                        {d} {d === 1 ? 'Month' : 'Months'}
                                      </Tag>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right ml-6">
                                <div className="text-2xl font-bold text-gradient-primary">₹{bundle.price}</div>
                                <div className="text-sm text-text-muted">
                                  per {bundle.billingCycle === 'monthly' ? 'month' : 
                                       bundle.billingCycle === 'quarterly' ? 'quarter (3 months)' : 
                                       bundle.billingCycle === 'yearly' ? 'year' : 'billing cycle'}
                                </div>
                              </div>
                            </div>
                            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                              <div className="px-6 pb-6 border-t border-gray-200/50 pt-6 bg-gradient-to-r from-white to-bg-elevated">
                                {bundle.items && Array.isArray(bundle.items) && bundle.items.length > 0 && (
                                  <div className="mb-4">
                                    <div className="text-sm font-bold text-text-primary mb-3">What's Included:</div>
                                    <div className="grid grid-cols-2 gap-2">
                                      {bundle.items.map((item, i) => (
                                        <div key={i} className="flex items-center text-sm bg-gradient-card px-3 py-2 rounded-lg border border-white/20">
                                          <CheckCircleOutlined className="text-accent-500 mr-2 text-base" />
                                          <span className="font-medium text-text-primary">
                                            {item.quantity}x {item.category ? item.category.name : 'Item'}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Quantity Selector */}
                                <div className="bg-gradient-card p-4 rounded-modern mb-4 border border-white/20">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-text-primary">Quantity per property:</span>
                                    <div className="flex items-center gap-3">
                                      <Button 
                                        size="small" 
                                        onClick={e => { e.stopPropagation(); const q = selectedBundles[bundle._id] ? selectedBundles[bundle._id].quantity : 1; if (q > 1) handleBundleQuantityChange(bundle._id, q - 1); }} 
                                        disabled={!isSelected || (selectedBundles[bundle._id] ? selectedBundles[bundle._id].quantity : 1) <= 1}
                                        className="w-8 h-8 rounded-lg border-primary-200 hover:border-primary-400 hover:bg-primary-50"
                                      >
                                        -
                                      </Button>
                                      <span className="text-xl font-bold text-gradient-primary w-12 text-center bg-white px-3 py-1 rounded-lg border-2 border-primary-200">
                                        {selectedBundles[bundle._id] ? selectedBundles[bundle._id].quantity : 1}
                                      </span>
                                      <Button 
                                        size="small" 
                                        onClick={e => { e.stopPropagation(); const q = selectedBundles[bundle._id] ? selectedBundles[bundle._id].quantity : 1; handleBundleQuantityChange(bundle._id, q + 1); }} 
                                        disabled={!isSelected}
                                        className="w-8 h-8 rounded-lg border-primary-200 hover:border-primary-400 hover:bg-primary-50"
                                      >
                                        +
                                      </Button>
                                    </div>
                                  </div>
                                </div>

                                {/* Duration Selector */}
                                <div className="bg-gradient-card p-4 rounded-modern border border-white/20">
                                  <div className="text-sm font-semibold text-text-primary mb-3">Subscription Duration:</div>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {availableDurations.map(months => {
                                      const discountObj = discounts.find(d => d.months === months);
                                      const discountPct = discountObj ? discountObj.percentage : 0;
                                      const isActiveDuration = selectedBundles[bundle._id] && selectedBundles[bundle._id].duration === months;
                                      return (
                                        <div 
                                          key={months} 
                                          onClick={e => { e.stopPropagation(); if (isSelected) handleBundleDurationChange(bundle._id, months); }}
                                          className={`p-3 rounded-modern text-center transition-all duration-300 cursor-pointer border-2 ${
                                            isActiveDuration 
                                              ? 'border-primary-400 bg-gradient-primary text-text-inverse shadow-modern transform scale-105' 
                                              : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-modern'
                                          } ${!isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                          <div className="font-semibold">{months} {months === 1 ? 'Month' : 'Months'}</div>
                                          {discountPct > 0 && (
                                            <div className={`text-xs mt-1 font-medium ${isActiveDuration ? 'text-accent-300' : 'text-accent-500'}`}>
                                              Save {discountPct}%
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Col>

                {/* Right column - Quote summary */}
                <Col xs={24} lg={10}>
                  <div className="sticky top-4">
                    <div className="card-modern-glass p-8 backdrop-blur-sm">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center mr-4">
                          <DollarOutlined className="text-xl text-text-inverse" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gradient-accent mb-1">Estimated Quote</h3>
                          <p className="text-text-muted text-sm">Real-time pricing calculation</p>
                        </div>
                      </div>

                      {Object.keys(selectedBundles).length > 0 ? (
                        <div className="space-y-4">
                          {/* Selected Bundles */}
                          <div className="bg-gradient-card p-4 rounded-modern border border-white/20">
                            <div className="text-sm font-bold text-text-primary mb-3">Selected Bundles:</div>
                            {Object.entries(selectedBundles).map(([bundleId, config]) => {
                              const bundle = bundles.find(b => b._id === bundleId);
                              if (!bundle) return null;
                              const discountObj = discounts.find(d => d.months === config.duration);
                              const discountPct = discountObj ? discountObj.percentage : 0;
                              
                              // Calculate billing cycles based on bundle's billing cycle and selected duration
                              const billingCycles = calculateBillingCycles(config.duration, bundle.billingCycle);
                              
                              const original = config.quantity * bundle.price * billingCycles * numberOfProperties;
                              const disc = Math.round((original * discountPct) / 100);
                              return (
                                <div key={bundleId} className="mb-4 pb-4 border-b border-gray-200/50 last:border-0">
                                  <div className="text-sm font-bold text-text-primary mb-2">{bundle.name}</div>
                                  <div className="text-xs text-text-secondary space-y-2">
                                    <div className="flex justify-between items-center">
                                      <span>{config.quantity} bundles × ₹{bundle.price}/{bundle.billingCycle === 'monthly' ? 'mo' : bundle.billingCycle === 'quarterly' ? 'qtr' : bundle.billingCycle === 'yearly' ? 'yr' : 'cycle'} × {billingCycles} {billingCycles === 1 ? 'cycle' : 'cycles'} × {numberOfProperties} {numberOfProperties === 1 ? 'property' : 'properties'}</span>
                                      <span className="font-semibold">₹{original}</span>
                                    </div>
                                    {discountPct > 0 && (
                                      <div className="flex justify-between items-center text-accent-500">
                                        <span>Discount ({discountPct}%)</span>
                                        <span className="font-semibold">-₹{disc}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between items-center font-bold text-text-primary pt-2 border-t border-gray-200/50">
                                      <span>Subtotal</span>
                                      <span>₹{original - disc}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Property breakdown */}
                          <div className="bg-gradient-to-r from-primary-50 to-accent-50 p-4 rounded-modern border border-primary-200/50">
                            <div className="text-xs text-primary-700 space-y-2">
                              <div className="flex justify-between items-center">
                                <span>No. of Properties</span>
                                <span className="font-bold">{numberOfProperties}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>Approx. Units per Property</span>
                                <span className="font-bold">{unitsPerProperty}</span>
                              </div>
                              <div className="flex justify-between items-center pt-2 border-t border-primary-200/50 font-bold">
                                <span>Total Units</span>
                                <span>{numberOfProperties * unitsPerProperty}</span>
                              </div>
                            </div>
                          </div>

                          {/* Pricing Summary */}
                          <div className="space-y-3">
                            <Divider className="my-3" />
                            <div className="flex justify-between text-sm">
                              <span className="text-text-secondary">Subscription Total</span>
                              <span className="font-semibold">₹{pricing.original}</span>
                            </div>
                            {pricing.discount > 0 && (
                              <div className="flex justify-between text-sm text-accent-500">
                                <span>Total Discount</span>
                                <span className="font-semibold">-₹{pricing.discount}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-base font-bold">
                              <span>After Discount</span>
                              <span>₹{pricing.final}</span>
                            </div>
                            <Divider className="my-3" />

                            {/* Security deposit */}
                            <div className="bg-gradient-card p-4 rounded-modern border border-white/20">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="text-text-primary font-semibold mb-1">Security Deposit</div>
                                  <div className="text-xs text-accent-500 flex items-center gap-1 mb-1">
                                    <SafetyOutlined /> 100% Refundable
                                  </div>
                                  <div className="text-xs text-amber-600">* Subject to wear and tear</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-bold text-gradient-primary">Get a Quote</div>
                                  <div className="text-xs text-text-muted">Confirmed by our team</div>
                                </div>
                              </div>
                            </div>

                            <Divider className="my-3" />
                            
                            {/* Final Total */}
                            <div className="bg-gradient-primary p-4 rounded-modern text-text-inverse">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-lg">Estimated Subscription</span>
                                <span className="font-bold text-2xl">₹{pricing.final}</span>
                              </div>
                            </div>
                            
                            <div className="text-xs text-text-muted bg-gradient-card p-3 rounded-lg border border-white/20">
                              * Subscription estimate only. Security deposit and final pricing confirmed by our team after reviewing your requirements.
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-text-muted py-12">
                          <div className="text-6xl mb-4 opacity-50">📋</div>
                          <div className="text-lg font-medium">Select bundles to see estimated pricing</div>
                          <div className="text-sm mt-2">Choose from our premium bundle options above</div>
                        </div>
                      )}
                      
                      <Divider className="my-6" />
                      <Button 
                        type="primary" 
                        size="large" 
                        block 
                        htmlType="submit" 
                        icon={<SendOutlined />} 
                        loading={submittingQuote} 
                        disabled={Object.keys(selectedBundles).length === 0}
                        className="btn-modern-primary h-12 text-base font-semibold"
                      >
                        Submit Quote Request
                      </Button>
                    </div>
                  </div>
                </Col>
              </Row>
            </Form>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default BusinessSubscriptionPage;
