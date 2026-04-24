import React, { useState, useEffect, useRef } from 'react';
import { Layout, Spin, Row, Col, ConfigProvider } from 'antd';
import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import api from '../../services/api';

const { Content } = Layout;

// ── 🖼️ IMAGE & CONTENT CONFIGURATION ────────────────────────────────────────
// CHANGE THESE URLS TO UPDATE THE IMAGES INSTANTLY
const IMAGE_CONFIG = {
  heroBg: "https://images.unsplash.com/photo-1532187863486-abf9d39d99c5?q=80&w=2070",
  health: [
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1400",
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800"
  ],
  hygiene: [
    "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=1400",
    "https://images.unsplash.com/photo-1583947215259-38e31be8751f?q=80&w=800"
  ],
  energy: [
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1400",
    "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=800"
  ],
  mental: [
    "https://images.unsplash.com/photo-1493839523149-2864fca44919?q=80&w=1400",
    "https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?q=80&w=800"
  ]
};

// ── ANIMATION SETTINGS ──────────────────────────────────────────────────────
const TRANSITION = { duration: 1.2, ease: [0.16, 1, 0.3, 1] };

const ScienceHero = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  
  return (
    <section className="relative h-[90vh] flex items-center px-8 overflow-hidden bg-[#050b14]">
      <div className="max-w-7xl mx-auto w-full z-10">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={TRANSITION}>
          <span className="text-blue-400 font-black tracking-[0.6em] text-[10px] uppercase mb-6 block">
            Research & Development
          </span>
          <motion.h1 style={{ y }} className="text-[9vw] md:text-[7vw] font-bold text-white leading-[0.8] tracking-tighter mb-8">
            The Benefits of <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-white">Clean Bedding.</span>
          </motion.h1>
          <p className="text-xl md:text-2xl text-blue-100/30 max-w-2xl font-light leading-relaxed">
            Eliminating microscopic disruptions to optimize your well being.
          </p>
        </motion.div>
      </div>
      <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
        <img src={IMAGE_CONFIG.heroBg} className="w-full h-full object-cover" alt="background" />
      </div>
    </section>
  );
};

const ScienceSection = ({ section, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-15%" });
  const isEven = index % 2 === 0;

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yImage = useTransform(scrollYProgress, [0, 1], [-60, 60]);

  // Determine which image array to use based on section key/title
  const getImages = () => {
    if (section.title.toLowerCase().includes('health')) return IMAGE_CONFIG.health;
    if (section.title.toLowerCase().includes('hygiene')) return IMAGE_CONFIG.hygiene;
    if (section.title.toLowerCase().includes('energy')) return IMAGE_CONFIG.energy;
    if (section.title.toLowerCase().includes('mental')) return IMAGE_CONFIG.mental;
    return IMAGE_CONFIG.health; // Default
  };

  const images = section.images?.length > 0 ? section.images.map(img => img.url) : getImages();

  return (
    <section ref={ref} className={`py-32 md:py-56 relative overflow-hidden ${section.dark ? 'bg-[#050b14] text-white' : 'bg-white text-[#050b14]'}`}>
      <div className="max-w-[1400px] mx-auto px-8">
        <Row gutter={[100, 80]} align="middle" className={isEven ? '' : 'flex-row-reverse'}>
          
          <Col xs={24} lg={12}>
            <motion.div initial={{ opacity: 0, x: isEven ? -60 : 60 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={TRANSITION}>
              <div className="flex items-center gap-6 mb-12">
                <span className="text-8xl font-black opacity-10 leading-none">0{index + 1}</span>
                <div className="h-[2px] flex-grow bg-current opacity-10" />
              </div>

              <h2 className="text-5xl md:text-[80px] font-bold mb-10 tracking-tighter leading-[0.9]">
                {section.title}
              </h2>

              <div className="mb-14">
                <div className="flex items-baseline gap-4 mb-6">
                  <span className="text-7xl font-black tracking-tighter text-blue-500">{section.stat}</span>
                  <span className="text-[10px] uppercase tracking-[0.3em] font-black opacity-30">{section.statLabel}</span>
                </div>
                <p className="text-xl md:text-2xl font-light leading-relaxed opacity-60">
                  {section.content?.mainText}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {section.content?.bulletPoints?.map((point, i) => (
                  <motion.div key={i} whileHover={{ x: 12 }} className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center border border-current opacity-20 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      <span className="text-[10px] font-bold">{i + 1}</span>
                    </div>
                    <span className="text-[14px] font-bold opacity-40 group-hover:opacity-100 transition-opacity pt-2">
                      {point}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </Col>

          <Col xs={24} lg={12}>
            <div className="relative pt-12"> {/* Added padding top to prevent overlap */}
              <motion.div 
                style={{ y: yImage }}
                className="aspect-[4/5] rounded-[60px] overflow-hidden shadow-2xl relative z-10"
              >
                <img src={images[0]} className="w-full h-full object-cover transition-transform duration-1000 hover:scale-110" alt="Main" />
              </motion.div>
              
              {/* FIXED DETAIL IMAGE CONTAINER */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                transition={{ delay: 0.5, ...TRANSITION }}
                className={`absolute -bottom-12 ${isEven ? '-right-8' : '-left-8'} z-30 p-1 w-64 h-64 rounded-[40px] shadow-2xl hidden md:block overflow-hidden
                  ${section.dark ? 'bg-[#050b14]' : 'bg-white'}`}
              >
                 <div className="relative w-full h-full rounded-[38px] overflow-hidden">
                    <img src={images[1]} className="w-full h-full object-cover" alt="Detail View" />
                    {/* Detail Label Overlay */}
                    <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                        <span className="text-white text-[9px] font-black uppercase tracking-widest">Detail View</span>
                    </div>
                 </div>
              </motion.div>
            </div>
          </Col>
        </Row>
      </div>
    </section>
  );
};

const ScienceBehindPage = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const CATEGORIES = [
    { key: 'health', title: 'Health Benefits', emoji: '🫀', stat: '82%', label: 'Allergen Reduction' },
    { key: 'hygiene', title: 'Hospital Hygiene', emoji: '🌡️', stat: '60°C', label: 'Sanitation' },
    { key: 'energy', title: 'Energy & Balance', emoji: '⚡', stat: '94%', label: 'Grounding Index' },
    { key: 'mental', title: 'Mental Well-being', emoji: '🧠', stat: '40%', label: 'Cortisol Drop' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/science-sections');
        const dbData = response.data.sections || [];
        
        const formatted = CATEGORIES.map((cat, i) => {
          const dbMatch = dbData.find(d => d.title.toLowerCase().includes(cat.key)) || {};
          return {
            ...dbMatch,
            title: cat.title,
            emoji: cat.emoji,
            stat: dbMatch.stat || cat.stat,
            statLabel: dbMatch.statLabel || cat.label,
            order: i + 1,
            dark: i % 2 === 0,
            content: {
              mainText: dbMatch.content?.mainText || "Our biological research proves that clinical environments influence cellular regeneration.",
              bulletPoints: dbMatch.content?.bulletPoints || ["Molecular Cleanliness", "Hypoallergenic Sealing", "Fiber Restoration"],
              additionalText: dbMatch.content?.additionalText || "Clinical Grade Verification"
            },
            images: dbMatch.images || []
          };
        });
        setSections(formatted);
      } catch (error) {
        console.error("Fetch failed, using local config.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#050b14]"><Spin size="large" /></div>;

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#2a5fc7', borderRadius: 24 } }}>
      <Layout className="bg-[#050b14] antialiased">
        <Navbar />
        <Content>
          <ScienceHero />
          <AnimatePresence>
            {sections.map((section, index) => (
              <ScienceSection key={index} section={section} index={index} />
            ))}
          </AnimatePresence>
          <section className="py-60 px-8 bg-white text-center relative overflow-hidden">
            <h2 className="text-7xl md:text-[10vw] font-black tracking-tighter leading-none mb-16 text-[#050b14]">
                Start <br /> <span className="text-blue-600 italic">Today.</span>
            </h2>
            <motion.a href="/subscriptions" whileHover={{ scale: 1.05 }} className="px-20 py-10 rounded-full bg-[#050b14] text-white font-black text-2xl inline-block shadow-2xl">
                Subscribe Here
            </motion.a>
          </section>
        </Content>
        <Footer />
      </Layout>
    </ConfigProvider>
  );
};

export default ScienceBehindPage;