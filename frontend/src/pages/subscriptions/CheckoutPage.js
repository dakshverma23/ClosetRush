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
      // Update delivery details for all requests
      const ids = requestIds.length > 0 ? requestIds : [requestId];
      await Promise.all(
        ids.map(id =>
          api.patch(`/subscription-requests/${id}/delivery`, {
            deliveryAddress: values.deliveryAddress,
            preferredDeliveryDate: values.preferredDeliveryDate?.toDate(),
            specialInstructions: values.specialInstructions
          })
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
  const getTotalAmount = () => {
    if (cart?.summary?.totalAmount) return cart.summary.totalAmount;
    if (request?.totalAmount) return request.totalAmount;
    return 0;
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
            <div className="flex justify-between text-sm font-semibold">
              <span>After Discount</span>
              <span>₹{cart.summary.finalPrice}</span>
            </div>

            <Divider className="my-2" />

            <div className="flex justify-between text-sm items-start">
              <div>
                <div className="text-gray-600">Fixed Deposit</div>
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
              <span className="font-bold">Total Amount</span>
              <span className="font-bold text-blue-600">₹{cart.summary.totalAmount}</span>
            </div>
          </div>
        </div>
      );
    }

    // Fallback: single request summary (old behaviour)
    return (
      <div className="space-y-3">
        <div>
          <div className="font-semibold text-lg mb-1">{request.bundleId?.name}</div>
          <div className="text-sm text-gray-600">
            {request.duration} {request.duration === 1 ? 'Month' : 'Months'} Subscription
          </div>
        </div>

        <Divider className="my-3" />

        <div className="flex justify-between">
          <span className="text-gray-600">Subscription Price</span>
          <span>₹{request.subscriptionPrice}</span>
        </div>
        {request.discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount ({request.discountPercentage}%)</span>
            <span>-₹{request.discount}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-600">Subscription Total</span>
          <span className="font-semibold">₹{request.finalSubscriptionPrice}</span>
        </div>

        <Divider className="my-3" />

        <div className="flex justify-between items-center">
          <div>
            <div className="text-gray-600">Fixed Deposit</div>
            <div className="text-xs text-green-600 flex items-center gap-1">
              <SafetyOutlined /> 100% Refundable
            </div>
          </div>
          <span className="font-semibold">₹{request.fixedDeposit}</span>
        </div>

        <Divider className="my-3" />

        <div className="flex justify-between items-center text-lg">
          <span className="font-bold">Total Amount</span>
          <span className="font-bold text-blue-600">₹{request.totalAmount}</span>
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
                    <Form.Item
                      name="deliveryAddress"
                      label="Delivery Address"
                      rules={[{ required: true, message: 'Please enter delivery address' }]}
                    >
                      <TextArea rows={3} placeholder="Enter complete delivery address" />
                    </Form.Item>

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

                    <Form.Item
                      name="specialInstructions"
                      label="Special Instructions (Optional)"
                    >
                      <TextArea rows={2} placeholder="Any special delivery instructions?" />
                    </Form.Item>

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
