import React, { useState, useEffect } from 'react';
import { Layout, Card, Row, Col, Button, message, Spin, Form, Input, DatePicker, Radio, Divider, Steps, Alert, Tag } from 'antd';
import { CreditCardOutlined, BankOutlined, MobileOutlined, CheckCircleOutlined, SafetyOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import BackButton from '../../components/layout/BackButton';
import api from '../../services/api';
import moment from 'moment';

const { Content } = Layout;
const { TextArea } = Input;
const { Step } = Steps;

const CheckoutPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [request, setRequest] = useState(null);
  const [cart, setCart] = useState(null); // Full cart from sessionStorage
  const [requestIds, setRequestIds] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [form] = Form.useForm();

  // Watch form values to auto-generate complete address
  const formValues = Form.useWatch([], form);

  useEffect(() => {
    if (formValues) {
      const {
        buildingName,
        floor,
        roomNo,
        locality,
        area,
        city,
        state,
        pincode,
        landmark
      } = formValues;

      // Auto-generate complete address
      const addressParts = [];
      
      if (buildingName) addressParts.push(buildingName);
      if (floor && roomNo) {
        addressParts.push(`Floor ${floor}, Room ${roomNo}`);
      } else if (floor) {
        addressParts.push(`Floor ${floor}`);
      } else if (roomNo) {
        addressParts.push(`Room ${roomNo}`);
      }
      if (locality) addressParts.push(locality);
      if (area) addressParts.push(area);
      if (city) addressParts.push(city);
      if (state) addressParts.push(state);
      if (pincode) addressParts.push(pincode);
      if (landmark) addressParts.push(`(Near: ${landmark})`);

      const completeAddress = addressParts.join(', ');
      
      if (completeAddress) {
        form.setFieldsValue({ deliveryAddress: completeAddress });
      }
    }
  }, [formValues, form]);

  useEffect(() => {
    // Load cart data from sessionStorage
    const storedCart = sessionStorage.getItem('checkoutCart');
    const storedRequestIds = sessionStorage.getItem('checkoutRequestIds');

    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
    if (storedRequestIds) {
      setRequestIds(JSON.parse(storedRequestIds));
    }

    fetchSubscriptionRequest();
  }, [requestId]);

  const fetchSubscriptionRequest = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/subscription-requests/${requestId}`);
      setRequest(response.data.request);
    } catch (error) {
      message.error('Failed to load subscription request');
      console.error(error);
      navigate('/subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleDeliveryDetailsSubmit = async (values) => {
    try {
      // Prepare delivery details object with all fields
      const deliveryDetails = {
        deliveryAddress: values.deliveryAddress,
        mobileNo: values.mobileNo,
        pincode: values.pincode,
        state: values.state,
        city: values.city,
        area: values.area,
        locality: values.locality,
        buildingName: values.buildingName,
        floor: values.floor,
        roomNo: values.roomNo,
        landmark: values.landmark || '',
        preferredDeliveryDate: values.preferredDeliveryDate?.toDate(),
        preferredDeliveryTime: values.preferredDeliveryTime,
        specialInstructions: values.specialInstructions || ''
      };

      // Update delivery details for all requests
      const ids = requestIds.length > 0 ? requestIds : [requestId];
      await Promise.all(
        ids.map(id =>
          api.patch(`/subscription-requests/${id}/delivery`, deliveryDetails)
        )
      );
      setCurrentStep(1);
      message.success('Delivery details saved');
    } catch (error) {
      message.error('Failed to save delivery details');
    }
  };

  const handlePayment = async () => {
    if (!paymentMethod) {
      message.warning('Please select a payment method');
      return;
    }

    setProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Process payment for all requests
      const ids = requestIds.length > 0 ? requestIds : [requestId];
      await Promise.all(
        ids.map(id =>
          api.post(`/subscription-requests/${id}/payment`, {
            paymentMethod,
            paymentId: `TEMP_${Date.now()}`,
            status: 'pending'
          })
        )
      );

      // Clear cart from sessionStorage after successful payment
      sessionStorage.removeItem('checkoutCart');
      sessionStorage.removeItem('checkoutRequestIds');

      setCurrentStep(2);
      message.success('Payment initiated successfully!');

      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (error) {
      message.error(error.response?.data?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  // Calculate total amount to display on Pay button
  const GST_RATE = 0.18;

  const getGstAmount = () => {
    const base = cart?.summary?.finalPrice ?? request?.finalSubscriptionPrice ?? 0;
    return Math.round(base * GST_RATE);
  };

  const getTotalAmount = () => {
    const base = cart?.summary?.finalPrice ?? request?.finalSubscriptionPrice ?? 0;
    const deposit = cart?.summary?.fixedDeposit ?? request?.fixedDeposit ?? 0;
    const gst = Math.round(base * GST_RATE);
    return base + gst + deposit;
  };

  if (loading) {
    return (
      <Layout className="min-h-screen">
        <Navbar />
        <Content className="p-4 md:p-8">
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        </Content>
      </Layout>
    );
  }

  if (!request) {
    return null;
  }

  // Render order summary — use full cart if available, else fall back to single request
  const renderOrderSummary = () => {
    if (cart && cart.cartItems && cart.cartItems.length > 0) {
      return (
        <div className="space-y-4">
          {/* Per-bundle breakdown */}
          {cart.cartItems.map((item, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-3">
              <div className="font-semibold text-gray-800 mb-1">{item.bundleName}</div>
              {item.bundleDescription && (
                <div className="text-xs text-gray-500 mb-2">{item.bundleDescription}</div>
              )}

              {/* Items included */}
              {item.items && Array.isArray(item.items) && item.items.length > 0 && (
                <div className="mb-2">
                  <div className="text-xs text-gray-500 mb-1">Includes:</div>
                  <div className="flex flex-wrap gap-1">
                    {item.items.map((bundleItem, i) => (
                      <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                        {bundleItem.quantity}× {bundleItem.category?.name || 'Item'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-600 space-y-1 mt-2">
                <div className="flex justify-between">
                  <span>Qty: {item.quantity} × {item.duration} month{item.duration > 1 ? 's' : ''}</span>
                  <span>₹{item.bundlePrice}/mo</span>
                </div>
                <div className="flex justify-between">
                  <span>Start: {new Date(item.startDate).toLocaleDateString()}</span>
                  <span>₹{item.originalPrice}</span>
                </div>
                {item.discountPercentage > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({item.discountPercentage}%)</span>
                    <span>-₹{item.discount}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-gray-800 border-t border-gray-200 pt-1">
                  <span>Subtotal</span>
                  <span>₹{item.finalPrice}</span>
                </div>
                {item.deposit > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Deposit (refundable)</span>
                    <span>₹{item.deposit}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          <Divider className="my-3" />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subscription Total</span>
              <span>₹{cart.summary.originalPrice}</span>
            </div>
            {cart.summary.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Total Discount</span>
                <span>-₹{cart.summary.discount}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal (after discount)</span>
              <span>₹{cart.summary.finalPrice}</span>
            </div>
            <div className="flex justify-between text-sm text-orange-600">
              <span>GST (18%)</span>
              <span>+₹{Math.round(cart.summary.finalPrice * GST_RATE)}</span>
            </div>

            <Divider className="my-2" />

            <div className="flex justify-between text-sm items-start">
              <div>
                <div className="text-gray-600">Security Deposit</div>
                <div className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                  <SafetyOutlined /> 100% Refundable
                </div>
                <div className="text-xs text-amber-600 mt-0.5">
                  * Subject to wear & tear conditions
                </div>
              </div>
              <span className="font-semibold">₹{cart.summary.fixedDeposit}</span>
            </div>

            <Divider className="my-2" />

            <div className="flex justify-between items-center text-lg">
              <span className="font-bold">Total Payable</span>
              <span className="font-bold text-blue-600">
                ₹{cart.summary.finalPrice + Math.round(cart.summary.finalPrice * GST_RATE) + cart.summary.fixedDeposit}
              </span>
            </div>
            <div className="text-xs text-gray-400 text-right">
              (incl. GST + refundable deposit)
            </div>
          </div>
        </div>
      );
    }

    // Fallback: single request summary (old behaviour)
    const gst = Math.round((request.finalSubscriptionPrice || 0) * GST_RATE);
    return (
      <div className="space-y-3">
        <div>
          <div className="font-semibold text-lg mb-1">{request.bundleId?.name}</div>
          <div className="text-sm text-gray-600">
            {request.duration} {request.duration === 1 ? 'Month' : 'Months'} Subscription
          </div>
        </div>

        <Divider className="my-3" />

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subscription Price</span>
          <span>₹{request.subscriptionPrice}</span>
        </div>
        {request.discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount ({request.discountPercentage}%)</span>
            <span>-₹{request.discount}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal (after discount)</span>
          <span>₹{request.finalSubscriptionPrice}</span>
        </div>
        <div className="flex justify-between text-sm text-orange-600">
          <span>GST (18%)</span>
          <span>+₹{gst}</span>
        </div>

        <Divider className="my-3" />

        <div className="flex justify-between items-center text-sm">
          <div>
            <div className="text-gray-600">Security Deposit</div>
            <div className="text-xs text-green-600 flex items-center gap-1">
              <SafetyOutlined /> 100% Refundable
            </div>
          </div>
          <span className="font-semibold">₹{request.fixedDeposit}</span>
        </div>

        <Divider className="my-3" />

        <div className="flex justify-between items-center text-lg">
          <span className="font-bold">Total Payable</span>
          <span className="font-bold text-blue-600">
            ₹{(request.finalSubscriptionPrice || 0) + gst + (request.fixedDeposit || 0)}
          </span>
        </div>
        <div className="text-xs text-gray-400 text-right">
          (incl. GST + refundable deposit)
        </div>
      </div>
    );
  };

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Navbar />
      <Content className="p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-4">
            <BackButton />
          </div>
          <h1 className="text-3xl font-bold mb-2">Checkout</h1>
          <p className="text-gray-600 mb-6">Complete your subscription</p>

          <Steps current={currentStep} className="mb-8">
            <Step title="Delivery Details" />
            <Step title="Payment" />
            <Step title="Confirmation" />
          </Steps>

          <Row gutter={[24, 24]}>
            {/* Left Column - Forms */}
            <Col xs={24} lg={14}>
              {currentStep === 0 && (
                <Card title="Delivery Information">
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleDeliveryDetailsSubmit}
                    initialValues={{
                      deliveryAddress: request.deliveryAddress,
                      preferredDeliveryDate: request.preferredDeliveryDate
                        ? moment(request.preferredDeliveryDate)
                        : null,
                      specialInstructions: request.specialInstructions
                    }}
                  >
                    {/* Contact Information */}
                    <div className="bg-blue-50 p-3 rounded-lg mb-4">
                      <div className="font-semibold text-sm mb-3 text-gray-700">Contact Information</div>
                      <Row gutter={16}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="mobileNo"
                            label="Mobile Number"
                            rules={[
                              { required: true, message: 'Please enter mobile number' },
                              { pattern: /^[0-9]{10}$/, message: 'Enter valid 10-digit mobile number' }
                            ]}
                          >
                            <Input placeholder="10-digit mobile number" maxLength={10} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="pincode"
                            label="Pincode"
                            rules={[
                              { required: true, message: 'Please enter pincode' },
                              { pattern: /^[0-9]{6}$/, message: 'Enter valid 6-digit pincode' }
                            ]}
                          >
                            <Input placeholder="6-digit pincode" maxLength={6} />
                          </Form.Item>
                        </Col>
                      </Row>
                    </div>

                    {/* Address Details */}
                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                      <div className="font-semibold text-sm mb-3 text-gray-700">Address Details</div>
                      <Row gutter={16}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="state"
                            label="State"
                            rules={[{ required: true, message: 'Please enter state' }]}
                          >
                            <Input placeholder="e.g., Maharashtra" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="city"
                            label="City"
                            rules={[{ required: true, message: 'Please enter city' }]}
                          >
                            <Input placeholder="e.g., Mumbai" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="area"
                            label="Area"
                            rules={[{ required: true, message: 'Please enter area' }]}
                          >
                            <Input placeholder="e.g., Andheri West" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="locality"
                            label="Locality"
                            rules={[{ required: true, message: 'Please enter locality' }]}
                          >
                            <Input placeholder="e.g., Lokhandwala Complex" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </div>

                    {/* Building Details */}
                    <div className="bg-green-50 p-3 rounded-lg mb-4">
                      <div className="font-semibold text-sm mb-3 text-gray-700">Building Details</div>
                      <Row gutter={16}>
                        <Col xs={24}>
                          <Form.Item
                            name="buildingName"
                            label="Building Name / House Number"
                            rules={[{ required: true, message: 'Please enter building name or house number' }]}
                          >
                            <Input placeholder="e.g., Sunrise Apartments or House No. 123" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="floor"
                            label="Floor Number"
                            rules={[{ required: true, message: 'Please enter floor number' }]}
                          >
                            <Input placeholder="e.g., 3rd Floor or Ground Floor" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="roomNo"
                            label="Flat / Room Number"
                            rules={[{ required: true, message: 'Please enter flat/room number' }]}
                          >
                            <Input placeholder="e.g., 304 or A-12" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </div>

                    {/* Landmark (Optional) */}
                    <Form.Item
                      name="landmark"
                      label="Landmark (Optional)"
                    >
                      <Input placeholder="e.g., Near City Mall, Opposite Park" />
                    </Form.Item>

                    {/* Complete Address Preview */}
                    <Form.Item
                      name="deliveryAddress"
                      label="Complete Address (Auto-generated)"
                      tooltip="This will be auto-filled based on above details"
                    >
                      <TextArea 
                        rows={3} 
                        placeholder="Complete address will be generated automatically" 
                        disabled
                        className="bg-gray-100"
                      />
                    </Form.Item>

                    {/* Delivery Preferences */}
                    <Divider>Delivery Preferences</Divider>

                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="preferredDeliveryDate"
                          label="Preferred Delivery Date"
                          rules={[{ required: true, message: 'Please select preferred delivery date' }]}
                        >
                          <DatePicker
                            className="w-full"
                            disabledDate={(current) => current && current < moment().add(2, 'days')}
                            format="DD/MM/YYYY"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="preferredDeliveryTime"
                          label="Preferred Delivery Time"
                          rules={[{ required: true, message: 'Please select preferred time' }]}
                        >
                          <Radio.Group className="w-full">
                            <Radio.Button value="morning" className="w-1/3 text-center">
                              Morning<br/><span className="text-xs text-gray-500">9AM-12PM</span>
                            </Radio.Button>
                            <Radio.Button value="afternoon" className="w-1/3 text-center">
                              Afternoon<br/><span className="text-xs text-gray-500">12PM-4PM</span>
                            </Radio.Button>
                            <Radio.Button value="evening" className="w-1/3 text-center">
                              Evening<br/><span className="text-xs text-gray-500">4PM-8PM</span>
                            </Radio.Button>
                          </Radio.Group>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      name="specialInstructions"
                      label="Special Delivery Instructions (Optional)"
                    >
                      <TextArea 
                        rows={2} 
                        placeholder="e.g., Call before arriving, Ring doorbell twice, Security gate code, etc." 
                      />
                    </Form.Item>

                    <Alert
                      message="Delivery Information"
                      description="Our delivery partner will contact you 30 minutes before delivery. Please ensure someone is available to receive the items."
                      type="info"
                      showIcon
                      className="mb-4"
                    />

                    <Form.Item>
                      <Button type="primary" htmlType="submit" size="large" block>
                        Continue to Payment
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              )}

              {currentStep === 1 && (
                <Card title="Select Payment Method">
                  <Alert
                    message="Payment Gateway Integration Pending"
                    description="Payment gateways will be integrated soon. For now, you can proceed with a test payment."
                    type="info"
                    showIcon
                    className="mb-4"
                  />

                  <Radio.Group
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full"
                  >
                    <div className="space-y-3">
                      {[
                        { value: 'razorpay', label: 'Razorpay', sub: 'Credit/Debit Card, UPI, Net Banking', icon: <CreditCardOutlined className="text-2xl text-blue-600" /> },
                        { value: 'paytm', label: 'Paytm', sub: 'Paytm Wallet, UPI', icon: <MobileOutlined className="text-2xl text-blue-600" /> },
                        { value: 'phonepe', label: 'PhonePe', sub: 'PhonePe Wallet, UPI', icon: <MobileOutlined className="text-2xl text-purple-600" /> },
                        { value: 'upi', label: 'UPI', sub: 'Google Pay, PhonePe, Paytm', icon: <BankOutlined className="text-2xl text-green-600" /> },
                        { value: 'bank_transfer', label: 'Bank Transfer', sub: 'NEFT, RTGS, IMPS', icon: <BankOutlined className="text-2xl text-gray-600" /> }
                      ].map(opt => (
                        <Card
                          key={opt.value}
                          className={`cursor-pointer transition-all ${
                            paymentMethod === opt.value
                              ? 'border-2 border-blue-500'
                              : 'border border-gray-200 hover:border-blue-300'
                          }`}
                          onClick={() => setPaymentMethod(opt.value)}
                        >
                          <Radio value={opt.value}>
                            <div className="flex items-center gap-3">
                              {opt.icon}
                              <div>
                                <div className="font-semibold">{opt.label}</div>
                                <div className="text-xs text-gray-500">{opt.sub}</div>
                              </div>
                              <Tag color="orange" className="ml-auto">Coming Soon</Tag>
                            </div>
                          </Radio>
                        </Card>
                      ))}
                    </div>
                  </Radio.Group>

                  <Divider />

                  <div className="flex gap-3">
                    <Button size="large" onClick={() => setCurrentStep(0)}>
                      Back
                    </Button>
                    <Button
                      type="primary"
                      size="large"
                      block
                      onClick={handlePayment}
                      loading={processing}
                      icon={<CreditCardOutlined />}
                    >
                      {processing ? 'Processing...' : `Pay ₹${getTotalAmount()}`}
                    </Button>
                  </div>
                </Card>
              )}

              {currentStep === 2 && (
                <Card>
                  <div className="text-center py-8">
                    <CheckCircleOutlined className="text-6xl text-green-500 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Payment Initiated!</h2>
                    <p className="text-gray-600 mb-4">
                      Your subscription request has been received. Once payment gateway is integrated,
                      your subscription will be activated automatically.
                    </p>
                    <Alert
                      message="Test Mode"
                      description="This is a test payment. In production, your subscription will be activated immediately after successful payment."
                      type="info"
                      showIcon
                      className="mb-4"
                    />
                    <Button type="primary" size="large" onClick={() => navigate('/dashboard')}>
                      Go to Dashboard
                    </Button>
                  </div>
                </Card>
              )}
            </Col>

            {/* Right Column - Order Summary */}
            <Col xs={24} lg={10}>
              <Card
                title={
                  <div className="flex items-center justify-between">
                    <span>Order Summary</span>
                    {cart?.cartItems?.length > 1 && (
                      <span className="text-sm font-normal text-gray-500">
                        {cart.cartItems.length} bundles
                      </span>
                    )}
                  </div>
                }
                className="sticky top-4"
              >
                {renderOrderSummary()}

                <Divider />

                <div className="bg-green-50 p-3 rounded-lg text-sm">
                  <div className="font-semibold mb-2 flex items-center gap-2">
                    <SafetyOutlined /> Secure Payment
                  </div>
                  <ul className="space-y-1 text-xs">
                    <li>✓ 100% secure payment</li>
                    <li>✓ Deposit fully refundable</li>
                    <li>✓ Cancel anytime</li>
                  </ul>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
    </Layout>
  );
};

export default CheckoutPage;
