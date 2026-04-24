import React, { useState, useEffect, useRef } from 'react';
import { Layout, Spin, Row, Col, ConfigProvider } from 'antd';
import { motion, useScroll, useTransform, AnimatePresence, useSpring } from 'framer-motion';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import api from '../../services/api';

const { Content } = Layout;

// ── Physics-Based Animation Settings ──────────────────────────────────────────
const smoothSpring = { type: "spring", stiffness: 70, damping: 20, mass: 1 };
const fastSpring = { type: "spring", stiffness: 120, damping: 15 };

const revealVariants = {
  hidden: { y: 100, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

// ── Background Particle Component ─────────────────────────────────────────────
const ScienceBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
    <motion.div 
      animate={{ 
        scale: [1, 1.2, 1],
        opacity: [0.1, 0.15, 0.1],
        rotate: [0, 45, 0] 
      }}
      transition={{ duration: 25, repeat: Infinity }}
      className="absolute -top-1/4 -right-1/4 w-[80%] h-[80%] rounded-full bg-gradient-to-br from-blue-600 to-transparent blur-[140px]" 
    />
    <motion.div 
      animate={{ 
        scale: [1.2, 1, 1.2],
        opacity: [0.05, 0.1, 0.05],
        rotate: [0, -30, 0] 
      }}
      transition={{ duration: 20, repeat: Infinity }}
      className="absolute -bottom-1/4 -left-1/4 w-[70%] h-[70%] rounded-full bg-gradient-to-tr from-indigo-500 to-transparent blur-[120px]" 
    />
  </div>
);

// ── Hero Section ─────────────────────────────────────────────────────────────
const ScienceHero = ({ sections }) => {
  const { scrollY } = useScroll();
  const yTranslate = useTransform(scrollY, [0, 1000], [0, 300]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050b14] py-32">
      <ScienceBackground />
      
      <div className="relative z-10 max-w-7xl mx-auto px-8 w-full">
        <motion.div style={{ y: yTranslate, opacity: heroOpacity }}>
          <Row gutter={[64, 64]} align="middle">
            <Col xs={24} lg={15}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-[1px] w-12 bg-blue-500" />
                  <span className="text-blue-400 text-[11px] font-black uppercase tracking-[0.6em]">
                    Bio-Metric Integrity
                  </span>
                </div>
                <h1 className="text-7xl md:text-[130px] font-bold text-white leading-[0.8] tracking-tighter mb-10">
                  The <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">Atomic</span> <br /> 
                  Detail.
                </h1>
                <p className="text-2xl text-blue-100/30 max-w-2xl font-light leading-relaxed">
                  We don't just wash fabric. We engineer clinical sleep environments using advanced molecular sanitization and fiber-level analysis.
                </p>
              </motion.div>
            </Col>
            
            <Col xs={24} lg={9}>
              <div className="grid grid-cols-1 gap-6">
                {sections.slice(0, 3).map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (i * 0.1), ...smoothSpring }}
                    whileHover={{ x: -20, backgroundColor: "rgba(255,255,255,0.05)" }}
                    className="group p-8 rounded-[32px] bg-white/[0.02] border border-white/[0.08] backdrop-blur-3xl flex items-center gap-8"
                  >
                    <div className="text-5xl group-hover:scale-125 transition-transform duration-500">{s.emoji}</div>
                    <div>
                      <div className="text-4xl font-bold text-white tracking-tighter">{s.stat}</div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-blue-500 font-black">{s.statLabel}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Col>
          </Row>
        </motion.div>
      </div>
    </section>
  );
};

// ── Main Content Section ──────────────────────────────────────────────────────
const ScienceSection = ({ section, index }) => {
  const isEven = index % 2 === 0;
  const accent = section.accentColor || '#2a5fc7';
  
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const imgY = useTransform(scrollYProgress, [0, 1], [-50, 50]);
  const rotateImg = useTransform(scrollYProgress, [0, 1], [isEven ? -2 : 2, isEven ? 2 : -2]);

  const fallbacks = [
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070",
    "https://images.unsplash.com/photo-1532187863486-abf9d39d99c5?q=80&w=2070"
  ];

  return (
    <section ref={ref} className={`relative py-48 md:py-64 overflow-hidden ${section.dark ? 'bg-[#050b14] text-white' : 'bg-white text-[#050b14]'}`}>
      <div className="max-w-[1440px] mx-auto px-10">
        <Row gutter={[120, 80]} align="middle" className={isEven ? '' : 'flex-row-reverse'}>
          
          <Col xs={24} lg={12}>
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
              className="relative"
            >
              <motion.div 
                style={{ y: imgY, rotate: rotateImg }}
                className="relative z-10 rounded-[80px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] aspect-[4/5]"
              >
                <img src={section.images[0]?.url || fallbacks[index % 3]} 
                     className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Lab" />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, ...fastSpring }}
                className={`absolute -bottom-12 ${isEven ? '-right-12' : '-left-12'} z-20 w-64 h-64 rounded-[40px] border-[16px] overflow-hidden shadow-2xl ${section.dark ? 'border-[#050b14]' : 'border-white'}`}
              >
                <img src={section.images[1]?.url || fallbacks[(index + 1) % 3]} className="w-full h-full object-cover" alt="Detail" />
              </motion.div>
            </motion.div>
          </Col>

          <Col xs={24} lg={12}>
            <motion.div 
              variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
            >
              <motion.div variants={revealVariants} className="flex items-center gap-6 mb-12">
                <span className="text-9xl opacity-5 font-black leading-none select-none">0{section.order}</span>
                <div className="h-[2px] flex-grow" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />
              </motion.div>

              <motion.h2 variants={revealVariants} className="text-6xl md:text-[100px] font-bold mb-12 tracking-[-0.05em] leading-[0.85]">
                {section.title}
              </motion.h2>

              <motion.div variants={revealVariants} 
                   className="relative p-14 rounded-[50px] mb-12 border border-current/[0.05]"
                   style={{ background: section.dark ? 'rgba(255,255,255,0.02)' : 'rgba(5,11,20,0.02)' }}>
                
                <div className="flex flex-col gap-10">
                  <div className="flex items-baseline gap-4">
                    <span className="text-8xl font-black tracking-tighter" style={{ color: accent }}>{section.stat}</span>
                    <span className="text-xs font-black uppercase tracking-[0.4em] opacity-30">{section.statLabel}</span>
                  </div>
                  <p className="text-2xl font-light leading-relaxed opacity-70">
                    {section.content?.mainText}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
                  {section.content?.bulletPoints?.map((p, i) => (
                    <motion.div key={i} whileHover={{ x: 10 }} className="flex items-start gap-5 group">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-current opacity-20 group-hover:bg-blue-600 group-hover:border-transparent group-hover:text-white transition-all duration-500">
                        <span className="text-xs font-bold">{i + 1}</span>
                      </div>
                      <span className="text-[15px] font-bold opacity-40 group-hover:opacity-100 transition-opacity pt-3">{p}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.p variants={revealVariants} className="text-[10px] font-black tracking-[0.5em] opacity-20 uppercase">
                 Internal Lab Verification Code: {section._id || 'S-2026'}
              </motion.p>
            </motion.div>
          </Col>
        </Row>
      </div>
    </section>
  );
};

// ── Main Page Logic ──────────────────────────────────────────────────────────
const ScienceBehindPage = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/science-sections');
        setSections(res.data.sections || []);
      } catch (e) {
        setSections([
          { order: 1, title: "Biological Shield", emoji: "🛡️", stat: "99.9%", statLabel: "Anti-Pathogen", content: { mainText: "Our proprietary heat-press sanitization eliminates 99.9% of microscopic allergens that standard home washes leave behind.", bulletPoints: ["Thermal Destruction", "Molecular Purity", "HEPA-Sealed Packing"], additionalText: "Lab Ref: BIO-2026-01" }, dark: true, images: [] },
          { order: 2, title: "Neuro-Recovery", emoji: "⚡", stat: "22%", statLabel: "REM Increase", content: { mainText: "The tactile frequency of our high-thread-count sanitized cotton reduces skin-nerve firing, promoting deeper REM cycles.", bulletPoints: ["Tactile Comfort", "Nerve-Quiet Tech", "Deep Cycle Support"], additionalText: "Lab Ref: NEURO-44" }, dark: false, images: [] }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#050b14]">
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full"
      />
    </div>
  );

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#2a5fc7' } }}>
      <Layout className="bg-[#050b14] antialiased">
        <Navbar />
        <Content>
          <ScienceHero sections={sections} />
          
          <AnimatePresence>
            {sections.map((section, index) => (
              <ScienceSection key={section._id || index} section={section} index={index} />
            ))}
          </AnimatePresence>

          {/* Final Call to Action */}
          <section className="py-64 px-8 bg-white text-center relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[40vw] font-black text-gray-50 -z-0 select-none">
              LAB
            </div>
            <motion.div 
              initial={{ opacity: 0, y: 100 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }}
              className="relative z-10 max-w-5xl mx-auto"
            >
              <h2 className="text-7xl md:text-[150px] font-black tracking-tighter leading-none mb-16 text-[#050b14]">
                Optimize <br /> <span className="text-blue-600">Rest.</span>
              </h2>
              <motion.a
                href="/subscriptions"
                whileHover={{ scale: 1.1, backgroundColor: "#000" }}
                whileTap={{ scale: 0.9 }}
                className="px-24 py-10 rounded-full bg-[#050b14] text-white font-black text-2xl inline-block transition-all shadow-[0_40px_80px_rgba(0,0,0,0.2)]"
              >
                Access Lab Access
              </motion.a>
            </motion.div>
          </section>
        </Content>
        <Footer />
      </Layout>
    </ConfigProvider>
  );
};

export default ScienceBehindPage;