import React, { useState, useEffect } from 'react';
import { Layout, message, Spin, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRightOutlined, 
  SafetyCertificateOutlined, 
  ThunderboltOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  ExpandOutlined
} from '@ant-design/icons';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const { Content } = Layout;

const WhatWeOfferNew = () => {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const visibleBundles = showAll ? bundles : bundles.slice(0, 6);

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

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0F172A]">
        <Spin size="large" />
        <p className="mt-4 font-display text-blue-400 animate-pulse uppercase tracking-[0.3em] text-[10px]">Curating Comfort</p>
      </div>
    );
  }

  return (
    <Layout className="min-h-screen bg-[#FDFCFB]">
      <Navbar />
      <Content>
        {/* --- LUXURY HERO SECTION (Restored & Polished) --- */}
        <section className="relative h-[85vh] flex items-center overflow-hidden bg-[#0F172A]">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#1e3a8a] to-transparent opacity-50 z-1" />
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
                <Tag className="bg-transparent border-blue-500 text-blue-400 px-4 py-1 mb-6 rounded-full uppercase tracking-[0.2em] text-[10px] font-bold">
                  The New Standard of Sleep
                </Tag>
              </motion.div>
              
              <motion.h1 
                className="text-6xl lg:text-[10rem] font-display font-bold text-white leading-[0.85] mb-8 tracking-tighter"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                CLOSET <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400">RUSH.</span>
              </motion.h1>

              <motion.p 
                className="text-lg text-gray-400 max-w-xl mb-10 font-light leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                Five-star hotel linens, professionally laundered and delivered to your sanctuary. 
                Because hygiene isn't a luxury—it's a necessity.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <button 
                  onClick={() => navigate('/get-quote')}
                  className="group px-10 py-5 bg-blue-600 text-white rounded-full font-bold flex items-center gap-3 hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-500"
                >
                  GET STARTED <ArrowRightOutlined className="group-hover:translate-x-2 transition-transform" />
                </button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* --- COMPACT BUNDLES GRID --- */}
        <section className="py-20 md:py-32 bg-[#FDFCFB]">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mb-16 text-center md:text-left">
              <h2 className="text-4xl font-display font-bold text-[#0F172A] mb-2">The Collections</h2>
              <div className="w-16 h-1 bg-blue-600 mx-auto md:mx-0" />
            </div>

            {/* Grid Logic: 2 columns on mobile, 3 on desktop to reduce scroll */}
            <motion.div 
              layout
              className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-10"
            >
              <AnimatePresence mode='popLayout'>
                {visibleBundles.map((bundle, index) => (
                  <motion.div
                    key={bundle._id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 100, delay: index * 0.05 }}
                    className="group relative h-[320px] md:h-[600px] rounded-[1.5rem] md:rounded-[3rem] overflow-hidden bg-slate-200 shadow-xl shadow-black/5"
                  >
                    {/* Visual */}
                    <div className="absolute inset-0">
                      {bundle.image ? (
                        <img src={bundle.image} alt={bundle.name} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white/10 text-6xl font-bold">{bundle.name[0]}</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    </div>

                    {/* Info */}
                    <div className="absolute inset-0 p-5 md:p-12 flex flex-col justify-end text-white">
                      <Tag className="w-fit bg-blue-600/80 backdrop-blur-md border-none text-white text-[8px] md:text-[10px] px-2 mb-2 rounded-full uppercase font-bold">
                        {bundle.billingCycle}
                      </Tag>
                      <h3 className="text-xl md:text-4xl font-display font-bold mb-1 md:mb-4">{bundle.name}</h3>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-white/20 mt-2">
                        <div>
                          <span className="text-lg md:text-3xl font-bold">₹{bundle.price}</span>
                          <p className="text-[8px] md:text-[10px] text-white/50 uppercase tracking-widest">Base Rate</p>
                        </div>
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleSubscribe(bundle._id)}
                          className="w-10 h-10 md:w-16 md:h-16 bg-white text-black rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-lg"
                        >
                          <ArrowRightOutlined className="text-sm md:text-xl" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination Button */}
            {!showAll && bundles.length > 6 && (
              <div className="mt-20 text-center">
                <button 
                  onClick={() => setShowAll(true)}
                  className="px-10 py-4 bg-[#0F172A] text-white rounded-full font-bold flex items-center gap-3 mx-auto hover:bg-blue-600 transition-all shadow-xl"
                >
                  <ExpandOutlined /> SHOW ALL EDITIONS
                </button>
              </div>
            )}
          </div>
        </section>

        {/* --- LUXURY CTA --- */}
        <section className="py-32 bg-[#0F172A] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="container mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-10">Elevate Your Everyday.</h2>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button 
                onClick={() => navigate('/register')}
                className="px-12 py-5 bg-blue-600 text-white rounded-full font-bold hover:shadow-2xl hover:shadow-blue-500/50 transition-all"
              >
                JOIN THE CLUB
              </button>
              <button 
                onClick={() => navigate('/get-quote')}
                className="px-12 py-5 bg-white text-blue-600 rounded-full font-bold border border-white hover:bg-transparent hover:text-white transition-all duration-300"
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