import React, { useState, useEffect } from 'react';
import { Layout, message, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const { Content } = Layout;

const WhatWeOfferNew = () => {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
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

  const handleCardHover = (index) => {
    setHoveredIndex(index);
    setIsPaused(true);
  };

  const handleCardLeave = () => {
    setHoveredIndex(null);
    setIsPaused(false);
  };

  if (loading) {
    return (
      <Layout className="min-h-screen">
        <Navbar />
        <Content className="flex items-center justify-center min-h-screen">
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <Content>
        {/* Hero Section with Large Image */}
        <section className="relative h-[70vh] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#E8D5C4] to-[#D4A574]">
            {/* Decorative Elements */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full max-w-7xl mx-auto px-4">
                {/* Decorative vases and objects */}
                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-8 pb-12">
                  <div className="w-24 h-32 bg-white/80 rounded-full"></div>
                  <div className="w-32 h-40 bg-white/80 rounded-t-full"></div>
                  <div className="w-28 h-36 bg-white/80 rounded-full"></div>
                  <div className="w-20 h-28 bg-white/80 rounded-t-full"></div>
                  <div className="w-32 h-40 bg-white/80 rounded-full"></div>
                  <div className="w-24 h-32 bg-white/80 rounded-t-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Text Overlay */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
            <motion.h1 
              className="font-display text-6xl lg:text-8xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              CLOSET RUSH
            </motion.h1>
            <motion.p 
              className="text-xl lg:text-2xl text-white/90 max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Premium Bedding Subscription Service
            </motion.p>
            <motion.button
              className="mt-8 px-8 py-3 bg-[#0F172A] text-white font-body font-semibold rounded-full hover:bg-[#1E3A8A] transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              onClick={() => navigate('/get-quote')}
            >
              Get Started
            </motion.button>
          </div>
        </section>

        {/* Bundles Carousel Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-[#0F172A] mb-4">
                Our Bundles
              </h2>
              <p className="text-lg text-[#475569]">
                Discover the perfect subscription for your needs
              </p>
            </div>

            {/* Animated Carousel */}
            <div className="relative overflow-hidden py-12">
              <motion.div 
                className="flex gap-8"
                animate={{
                  x: isPaused ? 0 : [0, -1920],
                }}
                transition={{
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 30,
                    ease: "linear",
                  },
                }}
                style={{ width: 'max-content' }}
              >
                {/* Duplicate bundles for seamless loop */}
                {[...bundles, ...bundles, ...bundles].map((bundle, index) => (
                  <motion.div
                    key={`${bundle._id}-${index}`}
                    className="relative flex-shrink-0 w-80 h-96 rounded-3xl overflow-hidden shadow-modern-lg cursor-pointer group"
                    onMouseEnter={() => handleCardHover(index)}
                    onMouseLeave={handleCardLeave}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Bundle Image */}
                    <div className="absolute inset-0">
                      {bundle.image ? (
                        <img 
                          src={bundle.image} 
                          alt={bundle.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#E8D5C4] to-[#D4A574] flex items-center justify-center">
                          <span className="text-6xl font-bold text-white/30">{bundle.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>

                    {/* Overlay - Always visible with bundle name */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6">
                      <h3 className="font-display text-2xl font-bold text-white mb-2">
                        {bundle.name}
                      </h3>
                    </div>

                    {/* Hover Details Overlay */}
                    <AnimatePresence>
                      {hoveredIndex === index && (
                        <motion.div
                          className="absolute inset-0 bg-[#0F172A]/95 backdrop-blur-sm flex flex-col justify-center p-8"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <h3 className="font-display text-3xl font-bold text-white mb-4">
                            {bundle.name}
                          </h3>
                          
                          <p className="text-white/80 text-sm mb-4 line-clamp-3">
                            {bundle.description || 'Premium bedding subscription bundle'}
                          </p>

                          <div className="mb-4">
                            <div className="text-4xl font-bold text-[#14B8A6] mb-1">
                              ₹{bundle.price}
                              <span className="text-sm text-white/60">
                                /{bundle.billingCycle === 'monthly' ? 'month' : bundle.billingCycle === 'quarterly' ? '3 months' : 'year'}
                              </span>
                            </div>
                            {bundle.securityDeposit > 0 && (
                              <div className="text-sm text-white/60">
                                Security Deposit: ₹{bundle.securityDeposit}
                              </div>
                            )}
                          </div>

                          <div className="space-y-2 mb-6">
                            <div className="text-white/90 font-semibold text-sm mb-2">What's Included:</div>
                            {bundle.items && bundle.items.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="flex items-center text-white/80 text-sm">
                                <span className="w-2 h-2 bg-[#14B8A6] rounded-full mr-2"></span>
                                {item.quantity}x {item.category?.name || 'Item'}
                              </div>
                            ))}
                            {bundle.items && bundle.items.length > 3 && (
                              <div className="text-white/60 text-xs">
                                +{bundle.items.length - 3} more items
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => handleSubscribe(bundle._id)}
                            className="w-full py-3 bg-gradient-to-r from-[#2563EB] to-[#14B8A6] text-white font-body font-semibold rounded-full hover:shadow-modern-xl transition-all duration-300"
                          >
                            Subscribe Now
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Instruction Text */}
            <div className="text-center mt-8">
              <p className="text-[#475569] text-sm">
                Hover over any bundle to see details and pause the carousel
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gradient-to-br from-[#F8FAFC] to-[#E8D5C4]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-center text-[#0F172A] mb-12">
              All Bundles Include
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white rounded-2xl p-8 text-center shadow-modern hover:shadow-modern-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🚚</span>
                </div>
                <h3 className="font-display text-xl font-bold text-[#0F172A] mb-2">Free Delivery</h3>
                <p className="text-[#475569] text-sm">Convenient doorstep delivery</p>
              </div>

              <div className="bg-white rounded-2xl p-8 text-center shadow-modern hover:shadow-modern-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-[#14B8A6] to-[#0F766E] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📦</span>
                </div>
                <h3 className="font-display text-xl font-bold text-[#0F172A] mb-2">Free Pickup</h3>
                <p className="text-[#475569] text-sm">Hassle-free collection service</p>
              </div>

              <div className="bg-white rounded-2xl p-8 text-center shadow-modern hover:shadow-modern-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✨</span>
                </div>
                <h3 className="font-display text-xl font-bold text-[#0F172A] mb-2">Professional Cleaning</h3>
                <p className="text-[#475569] text-sm">Expert care for your bedding</p>
              </div>

              <div className="bg-white rounded-2xl p-8 text-center shadow-modern hover:shadow-modern-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-[#D4A574] to-[#B8956A] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✓</span>
                </div>
                <h3 className="font-display text-xl font-bold text-[#0F172A] mb-2">Quality Guarantee</h3>
                <p className="text-[#475569] text-sm">100% satisfaction assured</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-[#2563EB] to-[#14B8A6]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Sleep?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of satisfied customers enjoying fresh, clean bedding every week
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/register')}
                className="px-8 py-4 bg-white text-[#2563EB] font-body font-semibold rounded-full shadow-modern-lg hover:shadow-modern-xl transition-all duration-300 hover:scale-105"
              >
                Start Your Subscription
              </button>
              <button 
                onClick={() => navigate('/get-quote')}
                className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-body font-semibold rounded-full border-2 border-white/30 hover:bg-white/20 transition-all duration-300"
              >
                Get a Custom Quote
              </button>
            </div>
          </div>
        </section>
      </Content>
      
      <Footer />
    </Layout>
  );
};

export default WhatWeOfferNew;
