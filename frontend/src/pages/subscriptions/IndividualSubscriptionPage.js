import React, { useState, useEffect } from 'react';
import { Layout, Card, Row, Col, Button, message, Spin, Divider, Checkbox } from 'antd';
import { ShoppingCartOutlined, CheckCircleOutlined, DownOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import BackButton from '../../components/layout/BackButton';
import api from '../../services/api';

const { Content } = Layout;

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
  const bundleMinDuration = (bundle && bundle.minimumDuration) || 1;
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

const IndividualSubscriptionPage = () => {
  const [loading, setLoading] = useState(true);
  const [bundles, setBundles] = useState([]);
  const [selectedBundles, setSelectedBundles] = useState({}); // { bundleId: { quantity, duration, startDate } }
  const [expandedBundles, setExpandedBundles] = useState([]); // Array of expanded bundle IDs
  const [pricing, setPricing] = useState(null);
  const [discounts, setDiscounts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (Object.keys(selectedBundles).length > 0) {
      calculatePricing();
    }
  }, [selectedBundles]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch active bundles
      const bundlesResponse = await api.get('/bundles');
      const activeBundles = bundlesResponse.data.bundles.filter(b => b.active);
      setBundles(activeBundles);

      // Fetch discount tiers — normalize to { months, percentage }
      const discountsResponse = await api.get('/calculate/discounts');
      const rawDiscounts = discountsResponse.data.discounts || [];
      setDiscounts(rawDiscounts.map(d => ({
        months: d.months ?? d.duration,
        percentage: d.percentage ?? d.discountPercentage ?? 0
      })));
    } catch (error) {
      message.error('Failed to load bundles');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePricing = async () => {
    try {
      // Calculate total subscription pricing for all selected bundles
      let totalOriginalPrice = 0;
      let totalDiscount = 0;
      let totalFinalPrice = 0;
      let totalDeposit = 0;

      // Calculate pricing and deposit for each selected bundle
      for (const [bundleId, config] of Object.entries(selectedBundles)) {
        if (config.quantity > 0 && config.duration) {
          const bundle = bundles.find(b => b._id === bundleId);
          if (bundle) {
            // Get discount percentage for this bundle's duration
            const discount = discounts.find(d => d.months === config.duration);
            const discountPercentage = discount ? discount.percentage : 0;

            // Calculate billing cycles based on bundle's billing cycle and selected duration
            const billingCycles = calculateBillingCycles(config.duration, bundle.billingCycle);
            
            // Calculate subscription price
            const bundleOriginalPrice = bundle.price * billingCycles * config.quantity;
            const bundleDiscount = (bundleOriginalPrice * discountPercentage) / 100;
            const bundleFinalPrice = bundleOriginalPrice - bundleDiscount;

            totalOriginalPrice += bundleOriginalPrice;
            totalDiscount += bundleDiscount;
            totalFinalPrice += bundleFinalPrice;

            // Calculate deposit: admin-set security deposit per bundle × quantity
            let bundleDeposit = 0;
            if (bundle.securityDeposit !== undefined) {
              // Use admin-configured deposit per bundle unit
              bundleDeposit = bundle.securityDeposit * config.quantity;
            } else if (bundle.items && Array.isArray(bundle.items)) {
              // Fallback: calculate from category deposit rules
              for (const item of bundle.items) {
                if (item.category && item.category.depositAmount && item.category.minimumDuration) {
                  bundleDeposit += item.category.depositAmount * item.category.minimumDuration * item.quantity;
                }
              }
              bundleDeposit = bundleDeposit * config.quantity;
            }
            
            totalDeposit += bundleDeposit;
          }
        }
      }

      setPricing({
        originalPrice: Math.round(totalOriginalPrice),
        discount: Math.round(totalDiscount),
        finalPrice: Math.round(totalFinalPrice),
        fixedDeposit: totalDeposit,
        totalAmount: Math.round(totalFinalPrice) + totalDeposit
      });
    } catch (error) {
      console.error('Failed to calculate pricing:', error);
    }
  };

  const handleBundleQuantityChange = (bundleId, quantity) => {
    setSelectedBundles(prev => {
      const updated = { ...prev };
      if (quantity > 0) {
        updated[bundleId] = {
          ...updated[bundleId],
          quantity,
          duration: (updated[bundleId] && updated[bundleId].duration) || 1,
          startDate: (updated[bundleId] && updated[bundleId].startDate) || new Date().toISOString().split('T')[0]
        };
      } else {
        delete updated[bundleId];
      }
      return updated;
    });
  };

  const handleBundleDurationChange = (bundleId, duration) => {
    setSelectedBundles(prev => ({
      ...prev,
      [bundleId]: {
        ...prev[bundleId],
        duration
      }
    }));
  };

  const handleBundleStartDateChange = (bundleId, startDate) => {
    setSelectedBundles(prev => ({
      ...prev,
      [bundleId]: {
        ...prev[bundleId],
        startDate
      }
    }));
  };

  const handleBundleCheckboxChange = (bundleId, checked) => {
    if (checked) {
      const bundle = bundles.find(b => b._id === bundleId);

      // Get available durations for this bundle
      const availableDurations = getBundleAvailableDurations(bundle);
      const defaultDuration = availableDurations[0];

      setExpandedBundles(prev => [...prev, bundleId]);
      setSelectedBundles(prev => ({
        ...prev,
        [bundleId]: {
          quantity: 1,
          duration: defaultDuration,
          startDate: new Date().toISOString().split('T')[0]
        }
      }));
    } else {
      setExpandedBundles(prev => prev.filter(id => id !== bundleId));
      setSelectedBundles(prev => {
        const updated = { ...prev };
        delete updated[bundleId];
        return updated;
      });
    }
  };

  const handleProceedToCheckout = async () => {
    if (Object.keys(selectedBundles).length === 0) {
      message.warning('Please select at least one bundle');
      return;
    }

    // Validate that all selected bundles have required fields
    for (const [bundleId, config] of Object.entries(selectedBundles)) {
      if (!config.duration) {
        message.warning('Please select duration for all bundles');
        return;
      }
      if (!config.startDate) {
        message.warning('Please select start date for all bundles');
        return;
      }
    }

    try {
      // Build full cart data with pricing for each bundle
      const cartItems = [];

      for (const [bundleId, config] of Object.entries(selectedBundles)) {
        if (config.quantity > 0) {
          const bundle = bundles.find(b => b._id === bundleId);
          if (bundle) {
            const discount = discounts.find(d => d.months === config.duration);
            const discountPercentage = discount ? discount.percentage : 0;

            // Calculate billing cycles based on bundle's billing cycle and selected duration
            const billingCycles = calculateBillingCycles(config.duration, bundle.billingCycle);

            const bundleOriginalPrice = bundle.price * billingCycles * config.quantity;
            const bundleDiscount = Math.round((bundleOriginalPrice * discountPercentage) / 100);
            const bundleFinalPrice = bundleOriginalPrice - bundleDiscount;

            // Calculate deposit: admin-set security deposit per bundle × quantity
            let bundleDeposit = 0;
            if (bundle.securityDeposit !== undefined) {
              bundleDeposit = bundle.securityDeposit * config.quantity;
            } else if (bundle.items && Array.isArray(bundle.items)) {
              for (const item of bundle.items) {
                if (item.category && item.category.depositAmount && item.category.minimumDuration) {
                  bundleDeposit += item.category.depositAmount * item.category.minimumDuration * item.quantity;
                }
              }
              bundleDeposit = bundleDeposit * config.quantity;
            }

            cartItems.push({
              bundleId,
              bundleName: bundle.name,
              bundleDescription: bundle.description,
              bundlePrice: bundle.price,
              quantity: config.quantity,
              duration: config.duration,
              startDate: config.startDate,
              discountPercentage,
              originalPrice: Math.round(bundleOriginalPrice),
              discount: bundleDiscount,
              finalPrice: Math.round(bundleFinalPrice),
              deposit: bundleDeposit,
              items: bundle.items
            });
          }
        }
      }

      // Store full cart in sessionStorage so checkout page can read it
      sessionStorage.setItem('checkoutCart', JSON.stringify({
        cartItems,
        summary: pricing
      }));

      // Create subscription requests for all bundles on the backend
      const createdRequestIds = [];
      for (const item of cartItems) {
        const response = await api.post('/subscription-requests', {
          bundleId: item.bundleId,
          duration: item.duration,
          startDate: item.startDate,
          quantity: item.quantity,
          bedConfiguration: { singleBeds: 0, doubleBeds: 0, curtainSets: 0 }
        });
        createdRequestIds.push(response.data.request._id);
      }

      // Store request IDs in sessionStorage
      sessionStorage.setItem('checkoutRequestIds', JSON.stringify(createdRequestIds));

      message.success('Proceeding to checkout...');
      // Navigate to checkout with the first request ID (for delivery/payment flow)
      navigate(`/checkout/${createdRequestIds[0]}`);
    } catch (error) {
      message.error((error.response && error.response.data && error.response.data.message) || 'Failed to create subscription request');
    }
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

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Navbar />
      <Content className="p-4 md:p-8">
        <style>{`
          @keyframes slideDown {
            from {
              max-height: 0;
              opacity: 0;
            }
            to {
              max-height: 400px;
              opacity: 1;
            }
          }
          
          @keyframes slideUp {
            from {
              max-height: 400px;
              opacity: 1;
            }
            to {
              max-height: 0;
              opacity: 0;
            }
          }
          
          .bundle-card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .bundle-card:hover {
            transform: translateY(-2px);
          }
          
          .bundle-details-enter {
            animation: slideDown 0.3s ease-out forwards;
          }
          
          .bundle-details-exit {
            animation: slideUp 0.3s ease-out forwards;
          }
        `}</style>
        <div className="max-w-6xl mx-auto">
          <div className="mb-4">
            <BackButton />
          </div>
          <h1 className="text-3xl font-bold mb-2">Subscribe to Our Bundles</h1>
          <p className="text-gray-600 mb-6">Choose your perfect bedding subscription plan</p>

          <Row gutter={[24, 24]}>
            {/* Left Column - Bundle Selection */}
            <Col xs={24} lg={14}>
              {/* Bundle Selection */}
              <Card title="Step 1: Select Your Bundles" className="mb-6">
                <div className="bg-blue-50 p-3 rounded-lg mb-4 text-sm">
                  <div className="font-semibold mb-1">💡 Deposit Information:</div>
                  <div className="text-gray-700">
                    Security deposit is calculated based on each category's deposit amount and minimum duration.
                    <div className="mt-2 text-green-600 font-medium">✓ 100% Refundable at subscription end</div>
                    <div className="mt-1 text-amber-600 text-xs">* Subject to normal wear and tear conditions</div>
                  </div>
                </div>
                <div className="space-y-3">
                  {bundles.map(bundle => {
                    const isSelected = selectedBundles[bundle._id] && selectedBundles[bundle._id].quantity > 0;
                    const isExpanded = expandedBundles.includes(bundle._id);
                    
                    return (
                      <div
                        key={bundle._id}
                        className={`border rounded-lg transition-all duration-300 ${
                          isSelected
                            ? 'border-blue-500 shadow-lg bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                        }`}
                      >
                        {/* Checkbox Header */}
                        <div
                          className="p-4 cursor-pointer flex items-center justify-between"
                          onClick={() => handleBundleCheckboxChange(bundle._id, !isSelected)}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <Checkbox
                              checked={isSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleBundleCheckboxChange(bundle._id, e.target.checked);
                              }}
                              className="text-lg"
                            />
                            <div className="flex-1">
                              <div className="text-lg font-semibold text-gray-800">{bundle.name}</div>
                              <div className="text-sm text-gray-500">{bundle.description}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600">₹{bundle.price}</div>
                              <div className="text-xs text-gray-500">
                                per {bundle.billingCycle === 'monthly' ? 'month' : 
                                     bundle.billingCycle === 'quarterly' ? 'quarter (3 months)' : 
                                     bundle.billingCycle === 'yearly' ? 'year' : 'billing cycle'}
                              </div>
                            </div>
                            <DownOutlined
                              className={`text-gray-400 transition-transform duration-300 ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </div>
                        </div>

                        {/* Collapsible Details */}
                        <div
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                          }`}
                        >
                          <div className="px-4 pb-4 border-t border-gray-200 pt-4 bg-white">
                            {/* Bundle Items */}
                            <div className="mb-4">
                              <div className="text-sm font-semibold text-gray-700 mb-2">What's Included:</div>
                              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                {bundle.items && Array.isArray(bundle.items) && bundle.items.length > 0 ? (
                                  bundle.items.map((item, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                      <CheckCircleOutlined className="text-green-500" />
                                      <span>{item.quantity}x {(item.category && item.category.name) || 'Item'}</span>
                                    </div>
                                  ))
                                ) : (
                                  <>
                                    {bundle.items && bundle.items.singleBedsheets > 0 && (
                                      <div className="flex items-center gap-2">
                                        <CheckCircleOutlined className="text-green-500" />
                                        <span>{bundle.items.singleBedsheets} Single Bedsheet(s)</span>
                                      </div>
                                    )}
                                    {bundle.items && bundle.items.doubleBedsheets > 0 && (
                                      <div className="flex items-center gap-2">
                                        <CheckCircleOutlined className="text-green-500" />
                                        <span>{bundle.items.doubleBedsheets} Double Bedsheet(s)</span>
                                      </div>
                                    )}
                                    {bundle.items && bundle.items.pillowCovers > 0 && (
                                      <div className="flex items-center gap-2">
                                        <CheckCircleOutlined className="text-green-500" />
                                        <span>{bundle.items.pillowCovers} Pillow Cover(s)</span>
                                      </div>
                                    )}
                                    {bundle.items && bundle.items.curtains > 0 && (
                                      <div className="flex items-center gap-2">
                                        <CheckCircleOutlined className="text-green-500" />
                                        <span>{bundle.items.curtains} Curtain(s)</span>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Quantity Selector */}
                            <div className="bg-gray-50 p-3 rounded-lg mb-3">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                                <div className="flex items-center gap-3">
                                  <Button
                                    size="large"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      const currentQty = (selectedBundles[bundle._id] && selectedBundles[bundle._id].quantity) || 1;
                                      if (currentQty > 1) {
                                        handleBundleQuantityChange(bundle._id, currentQty - 1);
                                      }
                                    }}
                                    disabled={!isSelected || ((selectedBundles[bundle._id] && selectedBundles[bundle._id].quantity) || 1) <= 1}
                                  >
                                    -
                                  </Button>
                                  <div className="w-16 text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                      {(selectedBundles[bundle._id] && selectedBundles[bundle._id].quantity) || 0}
                                    </div>
                                  </div>
                                  <Button
                                    size="large"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      const currentQty = (selectedBundles[bundle._id] && selectedBundles[bundle._id].quantity) || 1;
                                      if (currentQty < 10) {
                                        handleBundleQuantityChange(bundle._id, currentQty + 1);
                                      }
                                    }}
                                    disabled={!isSelected || ((selectedBundles[bundle._id] && selectedBundles[bundle._id].quantity) || 0) >= 10}
                                  >
                                    +
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* Duration Selector */}
                            <div className="bg-gray-50 p-3 rounded-lg mb-3">
                              <div className="text-sm font-medium text-gray-700 mb-2">Subscription Duration:</div>
                              <div className="flex flex-wrap gap-2">
                                {/* Show all available durations based on bundle's minimum duration constraints */}
                                {(() => {
                                  const availableDurations = getBundleAvailableDurations(bundle);

                                  return availableDurations.map(months => {
                                    const discount = discounts.find(d => d.months === months);
                                    const discountPercent = discount ? discount.percentage : 0;
                                    const isSelectedDuration = selectedBundles[bundle._id] && selectedBundles[bundle._id].duration === months;

                                    return (
                                      <div
                                        key={months}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          e.preventDefault();
                                          if (isSelected) {
                                            handleBundleDurationChange(bundle._id, months);
                                          }
                                        }}
                                        className={`px-4 py-2 rounded border text-center transition-all min-w-[70px] ${
                                          isSelectedDuration
                                            ? 'border-blue-500 bg-blue-100 text-blue-700 font-semibold'
                                            : 'border-gray-300 bg-white hover:border-blue-300'
                                        } ${!isSelected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                      >
                                        <div className="text-sm font-medium">
                                          {months} {months === 1 ? 'Month' : 'Months'}
                                        </div>
                                        {discountPercent > 0 && (
                                          <div className="text-xs text-green-600">Save {discountPercent}%</div>
                                        )}
                                      </div>
                                    );
                                  });
                                })()}
                              </div>
                            </div>

                            {/* Start Date Selector */}
                            <div className="bg-gray-50 p-3 rounded-lg mb-3">
                              <div className="text-sm font-medium text-gray-700 mb-2">Start Date:</div>
                              <input
                                type="date"
                                value={(selectedBundles[bundle._id] && selectedBundles[bundle._id].startDate) || ''}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleBundleStartDateChange(bundle._id, e.target.value);
                                }}
                                onFocus={(e) => e.stopPropagation()}
                                onClick={(e) => e.stopPropagation()}
                                disabled={!isSelected}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                              <div className="text-xs text-gray-500 mt-1">
                                Your subscription will start on this date
                              </div>
                            </div>

                            {/* Deposit Info */}
                            <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                              <CheckCircleOutlined className="text-green-500 mr-1" />
                              Includes refundable deposit based on bundle items
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </Col>

            {/* Right Column - Pricing Summary */}
            <Col xs={24} lg={10}>
              <Card title="Pricing Summary" className="sticky top-4">
                {pricing && Object.keys(selectedBundles).length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {/* Selected Bundles Breakdown */}
                      <div className="bg-gray-50 p-3 rounded mb-3">
                        <div className="font-semibold mb-2 text-sm text-gray-700">Selected Bundles:</div>
                        {Object.entries(selectedBundles).map(([bundleId, config]) => {
                          if (config.quantity > 0) {
                            const bundle = bundles.find(b => b._id === bundleId);
                            if (bundle) {
                              const discount = discounts.find(d => d.months === config.duration);
                              const discountPercent = discount ? discount.percentage : 0;
                              const bundleTotal = bundle.price * config.quantity * config.duration;
                              const bundleDiscount = (bundleTotal * discountPercent) / 100;
                              const bundleFinal = bundleTotal - bundleDiscount;
                              
                              return (
                                <div key={bundleId} className="mb-3 pb-3 border-b border-gray-200 last:border-0">
                                  <div className="flex justify-between text-sm font-medium mb-1">
                                    <span className="text-gray-800">{bundle.name}</span>
                                  </div>
                                  <div className="text-xs text-gray-600 space-y-1">
                                    <div className="flex justify-between">
                                      <span>Quantity: {config.quantity}</span>
                                      <span>Duration: {config.duration} month{config.duration > 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Start: {new Date(config.startDate).toLocaleDateString()}</span>
                                      <span>₹{bundle.price}/{bundle.billingCycle === 'monthly' ? 'month' : bundle.billingCycle === 'quarterly' ? 'quarter' : bundle.billingCycle === 'yearly' ? 'year' : 'cycle'}</span>
                                    </div>
                                    {discountPercent > 0 && (
                                      <div className="flex justify-between text-green-600">
                                        <span>Discount ({discountPercent}%)</span>
                                        <span>-₹{Math.round(bundleDiscount)}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between font-semibold text-gray-800 pt-1">
                                      <span>Subtotal:</span>
                                      <span>₹{Math.round(bundleFinal)}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                          }
                          return null;
                        })}
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Subscription Cost</span>
                        <span className="font-medium">₹{pricing.originalPrice}</span>
                      </div>
                      {pricing.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Total Discount</span>
                          <span>-₹{pricing.discount}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subscription Total</span>
                        <span className="font-semibold">₹{pricing.finalPrice}</span>
                      </div>
                      <Divider className="my-3" />
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-gray-600">Security Deposit</div>
                          <div className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircleOutlined /> 100% Refundable
                          </div>
                          <div className="text-xs text-amber-600 mt-1">
                            * Subject to normal wear and tear conditions
                          </div>
                        </div>
                        <span className="font-semibold">₹{pricing.fixedDeposit}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Calculated based on selected bundles
                      </div>
                      <Divider className="my-3" />
                      <div className="flex justify-between items-center text-lg">
                        <span className="font-bold">Total Amount</span>
                        <span className="font-bold text-blue-600">₹{pricing.totalAmount}</span>
                      </div>
                    </div>

                    <Divider />

                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <h4 className="font-semibold mb-2">What's Included:</h4>
                      <ul className="text-sm space-y-1">
                        <li>✓ Fresh, clean bedding delivered to your door</li>
                        <li>✓ Regular replacement every month</li>
                        <li>✓ Free pickup and delivery</li>
                        <li>✓ 100% refundable deposit</li>
                        <li>✓ Cancel anytime</li>
                      </ul>
                    </div>

                    <Button
                      type="primary"
                      size="large"
                      block
                      icon={<ShoppingCartOutlined />}
                      onClick={handleProceedToCheckout}
                      disabled={Object.keys(selectedBundles).length === 0}
                    >
                      Proceed to Checkout
                    </Button>
                  </>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    Select bundles and duration to see pricing
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
    </Layout>
  );
};

export default IndividualSubscriptionPage;
