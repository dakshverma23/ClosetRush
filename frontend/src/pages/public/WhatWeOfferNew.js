import React, { useState, useEffect } from 'react';
import { Layout, message, Spin, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingOutlined, 
  ArrowRightOutlined, 
  SafetyCertificateOutlined, 
  ThunderboltOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
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
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FDFCFB]">
        <Spin size="large" />
        <p className="mt-4 font-display text-gray-400 animate-pulse uppercase tracking-widest text-xs">Curating Comfort</p>
      </div>
    );
  }

  return (
    <Layout className="min-h-screen bg-[#FDFCFB]">
      <Navbar />
      <Content>
        {/* --- LUXURY HERO SECTION --- */}
        <section className="relative h-[85vh] flex items-center overflow-hidden bg-[#0F172A]">
          {/* Decorative background depth */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#1e293b] to-transparent opacity-50" />
          <motion.div 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.2, scale: 1 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=2071')] bg-cover bg-center"
          />

          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Tag className="bg-transparent border-[#D4A574] text-[#D4A574] px-4 py-1 mb-6 rounded-full uppercase tracking-[0.2em] text-[10px] font-bold">
                  The New Standard of Sleep
                </Tag>
              </motion.div>
              
              <motion.h1 
                className="text-7xl lg:text-[10rem] font-display font-bold text-white leading-[0.85] mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                CLOSET <br />
                <span className="text-[#D4A574]">RUSH.</span>
              </motion.h1>

              <motion.p 
                className="text-xl text-gray-400 max-w-xl mb-10 font-light leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                Five-star hotel linens, professionally laundered and delivered to your sanctuary. 
                Because your rest isn't a luxury—it's a necessity.
              </motion.p>

              <motion.div 
                className="flex gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <button 
                  onClick={() => navigate('/get-quote')}
                  className="group px-10 py-5 bg-[#D4A574] text-[#0F172A] rounded-full font-bold flex items-center gap-3 hover:bg-white transition-all duration-500 shadow-xl"
                >
                  GET STARTED <ArrowRightOutlined className="group-hover:translate-x-2 transition-transform" />
                </button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* --- INFINITE BUNDLES CAROUSEL --- */}
        <section className="py-32 bg-white overflow-hidden">
          <div className="container mx-auto px-6 mb-20 text-center">
            <h2 className="text-4xl lg:text-6xl font-display font-bold text-[#0F172A] mb-4">The Collections</h2>
            <div className="w-24 h-1 bg-[#D4A574] mx-auto mb-6" />
            <p className="text-gray-500 max-w-2xl mx-auto uppercase tracking-widest text-xs">Hover to explore the details of each bundle</p>
          </div>

          <div className="relative">
            <motion.div 
              className="flex gap-12"
              animate={{
                x: isPaused ? 0 : [0, -2880], // Large negative value for smooth loop
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 40,
                  ease: "linear",
                },
              }}
              style={{ width: 'max-content' }}
            >
              {/* Logic: Tripling the array for a truly seamless loop at high resolutions */}
              {[...bundles, ...bundles, ...bundles].map((bundle, index) => (
                <motion.div
                  key={`${bundle._id}-${index}`}
                  className="relative flex-shrink-0 w-[450px] h-[600px] rounded-[3rem] overflow-hidden group cursor-none"
                  onMouseEnter={() => handleCardHover(index)}
                  onMouseLeave={handleCardLeave}
                  whileHover={{ y: -15 }}
                  transition={{ duration: 0.5, ease: "circOut" }}
                >
                  {/* Bundle Visual */}
                  <div className="absolute inset-0 bg-[#F3F4F6]">
                    {bundle.image ? (
                      <img 
                        src={bundle.image} 
                        alt={bundle.name}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#E8D5C4] to-[#D4A574] flex items-center justify-center">
                        <span className="text-9xl font-bold text-white/20">{bundle.name.charAt(0)}</span>
                      </div>
                    )}
                    {/* Soft gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent opacity-80" />
                  </div>

                  {/* Card Front Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
                    <p className="text-[#D4A574] font-bold tracking-widest text-[10px] uppercase mb-2">Signature Bundle</p>
                    <h3 className="text-4xl font-display font-bold mb-4">{bundle.name}</h3>
                    <div className="flex items-center gap-4">
                       <span className="text-2xl font-light italic">Starting at ₹{bundle.price}</span>
                       <div className="h-[1px] w-12 bg-white/30" />
                    </div>
                  </div>

                  {/* HOVER OVERLAY: MODERN REWRITE */}
                  <AnimatePresence>
                    {hoveredIndex === index && (
                      <motion.div
                        className="absolute inset-0 bg-[#0F172A]/95 backdrop-blur-xl flex flex-col justify-center p-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          <h3 className="text-4xl font-display font-bold text-white mb-6 underline decoration-[#D4A574] underline-offset-8">
                            {bundle.name}
                          </h3>
                          
                          <p className="text-gray-400 text-lg mb-8 font-light leading-relaxed">
                            {bundle.description || 'Our master-tier subscription featuring premium high-thread count cotton and weekly concierge care.'}
                          </p>

                          <div className="space-y-4 mb-10">
                            {bundle.items?.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="flex items-center text-white/90 group">
                                <div className="w-2 h-2 rounded-full bg-[#D4A574] mr-4 group-hover:scale-150 transition-transform" />
                                <span className="text-sm tracking-wide">{item.quantity}x {item.category?.name || 'Luxury Item'}</span>
                              </div>
                            ))}
                          </div>

                          <div className="mb-10">
                            <span className="text-5xl font-bold text-white">₹{bundle.price}</span>
                            <span className="text-gray-500 ml-3 uppercase text-xs tracking-widest">
                               / {bundle.billingCycle}
                            </span>
                          </div>

                          <button
                            onClick={() => handleSubscribe(bundle._id)}
                            className="w-full py-5 bg-[#D4A574] text-[#0F172A] font-bold rounded-2xl hover:bg-white transition-all duration-300 active:scale-95"
                          >
                            SELECT BUNDLE
                          </button>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* --- CLASSY FEATURES SECTION --- */}
        <section className="py-32 bg-[#F8FAFC]">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              {[
                { 
                  icon: <ThunderboltOutlined />, 
                  title: "Elite Delivery", 
                  desc: "Scheduled concierge delivery that respects your time." 
                },
                { 
                  icon: <SafetyCertificateOutlined />, 
                  title: "Hygienic Pro", 
                  desc: "Medical-grade sanitation processes for every fiber." 
                },
                { 
                  icon: <EnvironmentOutlined />, 
                  title: "Eco-Conscious", 
                  desc: "Sustainability in every wash and every route." 
                },
                { 
                  icon: <CheckCircleOutlined />, 
                  title: "Quality Hub", 
                  desc: "100% Cotton, 400+ Thread count as standard." 
                }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  className="group p-8 bg-white rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500"
                  whileHover={{ y: -10 }}
                >
                  <div className="text-3xl text-[#D4A574] mb-6 group-hover:scale-110 transition-transform">{feature.icon}</div>
                  <h4 className="text-xl font-bold text-[#0F172A] mb-3">{feature.title}</h4>
                  <p className="text-gray-500 font-light text-sm leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* --- LUXURY CTA --- */}
        <section className="py-40 bg-[#0F172A] relative overflow-hidden">
          {/* Abstract circles */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4A574] rounded-full opacity-5 blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D4A574] rounded-full opacity-5 blur-[120px]" />

          <div className="container mx-auto px-6 text-center relative z-10">
            <h2 className="text-5xl lg:text-7xl font-display font-bold text-white mb-8">
              Elevate Your <span className="italic font-light">Everyday.</span>
            </h2>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-12 font-light">
              Join the elite circle of individuals who prioritize their recovery as much as their ambition.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button 
                onClick={() => navigate('/register')}
                className="px-12 py-5 bg-white text-[#0F172A] rounded-full font-bold hover:bg-[#D4A574] transition-all duration-500"
              >
                JOIN THE CLUB
              </button>
              <button 
                onClick={() => navigate('/get-quote')}
                className="px-12 py-5 border border-white/20 text-white rounded-full font-bold hover:bg-white/10 transition-all duration-500"
              >
                REQUEST CUSTOM QUOTE
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