import React, { useRef } from 'react';
import { Layout, Row, Col, ConfigProvider, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { 
  ExperimentOutlined, 
  SafetyOutlined, 
  HeartOutlined, 
  TrophyOutlined,
  LinkOutlined,
  ArrowRightOutlined,
  CheckCircleFilled,
  EnvironmentOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const { Content } = Layout;

// ── ANIMATION CONSTANTS ──────────────────────────────────────────────────────
const SMOOTH_TRANSITION = { duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] };

// ── SMOOTH REVEAL WRAPPER ────────────────────────────────────────────────────
const SmoothReveal = ({ children, x = 0, y = 40, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-15%" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x, y }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ ...SMOOTH_TRANSITION, delay }}
    >
      {children}
    </motion.div>
  );
};

const AboutPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // Parallax Scroll logic for Hero
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const yImage = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacityText = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const handleGetStarted = () => {
    if (!isAuthenticated()) navigate('/login');
    else navigate('/subscriptions/individual');
  };

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#2563EB', borderRadius: 20 } }}>
      <Layout className="bg-white antialiased">
        <Navbar />
        <Content>
          
          {/* ── SECTION 1: CINEMATIC HERO ── */}
          <section ref={heroRef} className="relative h-screen flex items-center bg-[#020617] overflow-hidden">
            <motion.div style={{ opacity: opacityText }} className="max-w-7xl mx-auto px-6 w-full z-20">
              <SmoothReveal y={30}>
                <div className="flex items-center gap-3 mb-6">
                   <div className="h-[1px] w-12 bg-blue-500" />
                   <span className="text-blue-400 font-black uppercase tracking-[0.4em] text-[10px]">Premium Hygiene Protocol</span>
                </div>
                <h1 className="text-6xl md:text-[120px] font-bold text-white leading-[0.85] tracking-tighter mb-8">
                  Clean Bedding. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 italic">Better Sleep.</span>
                </h1>
                <p className="text-xl md:text-2xl text-slate-400 max-w-2xl font-light leading-relaxed mb-10">
                  At ClosetRush, we are solving a problem most people ignore — dirty, unwashed bedsheets and their hidden impact on health.
                </p>
                <div className="flex flex-wrap gap-6">
                  <button onClick={handleGetStarted} className="px-10 py-5 bg-blue-600 text-white font-black rounded-full hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/30 flex items-center gap-3 group">
                    START SUBSCRIPTION <ArrowRightOutlined className="group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
              </SmoothReveal>
            </motion.div>
            
            {/* Parallax Background */}
            <motion.div style={{ y: yImage }} className="absolute right-0 top-0 w-full lg:w-3/4 h-full z-10 opacity-40">
               <img src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover scale-110" alt="Bedding" />
               <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/80 to-transparent" />
            </motion.div>
          </section>

          {/* ── SECTION 2: THE SCIENTIFIC WARNING ── */}
          <section className="py-32 bg-white">
            <div className="max-w-7xl mx-auto px-6">
              <Row gutter={[80, 80]} align="middle">
                <Col xs={24} lg={12}>
                  <SmoothReveal x={-30}>
                    <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-8 tracking-tighter">
                      The "Invisible" <br/><span className="text-blue-600">Health Threat.</span>
                    </h2>
                    <p className="text-xl text-slate-600 mb-6 leading-relaxed">
                      Medical research reveals that unwashed bedsheets, pillow covers, quilts, and blankets become breeding grounds for harmful microorganisms. Within just 7 days, your bedding can accumulate millions of bacteria, dust mites, fungi, dead skin cells, body oils, and sweat residue.
                    </p>
                    <p className="text-lg text-slate-600 mb-10 leading-relaxed">
                      Regular professional laundry service and proper bedding hygiene are essential for preventing serious health issues. When bedsheets and pillow covers aren't washed frequently with proper sanitization, this can lead to:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6">
                       {[
                         { t: "Skin infections & acne breakouts", d: "Bacterial buildup from unwashed bedsheets triggers severe acne, eczema, and dermatitis." },
                         { t: "Allergies & respiratory problems", d: "Dust mites in dirty bedding cause asthma attacks, allergic rhinitis, and chronic sinus infections." },
                         { t: "Dandruff & hair fall issues", d: "Fungal growth on unwashed pillow covers leads to scalp infections and excessive hair loss." },
                         { t: "Ear & scalp infections", d: "Prolonged exposure to bacteria on dirty pillows causes painful ear infections and scalp irritation." }
                       ].map((item, i) => (
                         <div key={i} className="flex gap-4 group">
                            <div className="w-1 bg-slate-200 group-hover:bg-blue-600 transition-colors" />
                            <div>
                               <h4 className="font-bold text-slate-900">{item.t}</h4>
                               <p className="text-sm text-slate-500">{item.d}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                    <div className="mt-8 p-6 bg-red-50 rounded-2xl border border-red-100">
                      <p className="text-sm font-bold text-red-900 mb-2">⚠️ Health Alert:</p>
                      <p className="text-sm text-red-700">Studies show that bedsheets harbor more bacteria than toilet seats after just one week of use. Professional laundry services with good sanitization are crucial for maintaining bedding hygiene.</p>
                    </div>
                  </SmoothReveal>
                </Col>
                <Col xs={24} lg={12}>
                   <SmoothReveal y={40} delay={0.2}>
                      <div className="relative rounded-[60px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)]">
                         <img src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80" className="w-full aspect-[4/5] object-cover" alt="Bacteria on unwashed bedding" />
                         <div className="absolute inset-0 bg-blue-600/10 mix-blend-multiply" />
                         <div className="absolute bottom-10 left-10 right-10 bg-white/90 backdrop-blur-xl p-8 rounded-3xl border border-white/20">
                            <p className="text-slate-900 font-bold leading-tight mb-3">Despite knowing the health risks, most people in PGs, hostels, and rental apartments neglect regular bedding hygiene and laundry due to:</p>
                            <ul className="text-slate-900 font-semibold leading-relaxed space-y-2 list-disc list-inside">
                              <li>Lack of awareness about bedding hygiene importance</li>
                              <li>Lack of time for regular laundry and washing</li>
                              <li>Lack of proper washing facilities and equipment</li>
                              <li>Lack of hygiene consciousness and health education</li>
                            </ul>
                            <p className="text-xs text-slate-600 mt-4 italic">Professional bedding laundry services solve all these problems with convenient doorstep pickup and delivery.</p>
                         </div>
                      </div>
                   </SmoothReveal>
                </Col>
              </Row>
            </div>
          </section>

          {/* ── SECTION 3: THE EMOTIONAL CORE (HARSHIT'S STORY) ── */}
          <section className="py-40 bg-slate-50 overflow-hidden">
             <div className="max-w-5xl mx-auto px-6 relative">
                <SmoothReveal>
                  <div className="text-center mb-20">
                    <span className="text-blue-600 font-black uppercase tracking-[0.5em] text-[10px]">Real Story / Why this matters</span>
                    <h2 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tighter mt-4">Harshit's Story.</h2>
                  </div>
                  
                  <div className="relative bg-white p-12 md:p-24 rounded-[80px] shadow-sm border border-slate-200">
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-600/40">
                       <HeartOutlined className="text-3xl" />
                    </div>
                    <p className="text-2xl md:text-4xl text-slate-800 font-light leading-snug italic text-center">
                     <span className="font-bold text-blue-600 text-not-italic">Harshit</span>, started facing ear infections and scalp irritation. Later, doctors pointed out that prolonged exposure to bacteria and moisture on unwashed bedding was the trigger."
                    </p>
                    <div className="mt-12 flex flex-wrap justify-center gap-4">
                       <Tag color="red" className="rounded-full px-6 py-2 font-bold uppercase text-[10px]">Sweat during sleep</Tag>
                       <Tag color="red" className="rounded-full px-6 py-2 font-bold uppercase text-[10px]">Weeks of same bedding</Tag>
                    </div>
                  </div>
                </SmoothReveal>
             </div>
          </section>

          {/* ── SECTION 4: FOUNDER'S JOURNEY ── */}
          <section className="py-32 bg-white">
            <div className="max-w-7xl mx-auto px-6">
              <Row gutter={[100, 100]} align="middle" className="flex-row-reverse">
                <Col xs={24} lg={12}>
                  <SmoothReveal x={30}>
                    <h2 className="text-5xl font-bold text-slate-900 mb-8 tracking-tighter leading-none">“I lived in a hostel for 4 years...”</h2>
                    <div className="space-y-8 text-xl text-slate-500 font-light leading-relaxed">
                      <p>From personal experience, I noticed: Bedsheets were the last thing people cared about cleaning. Washing them felt like a big task — soaking, drying, folding.</p>
                      <p className="text-slate-900 font-medium">This wasn’t about laziness — it was about lack of an easy solution.</p>
                      <div className="p-10 bg-blue-600 rounded-[40px] text-white shadow-2xl shadow-blue-600/20">
                         <h3 className="text-white text-3xl font-bold mb-4">The Eureka Moment:</h3>
                         <p className="text-xl">👉 What if clean bedsheets could be as easy as ordering food?</p>
                      </div>
                    </div>
                  </SmoothReveal>
                </Col>
                <Col xs={24} lg={12}>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="pt-20">
                         <img src="https://images.unsplash.com/photo-1555854817-5b2260d50c47?auto=format&fit=crop&q=80" className="rounded-[40px] shadow-lg w-full aspect-[3/4] object-cover" alt="Hostel Life" />
                      </div>
                      <div>
                         <img src="https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80" className="rounded-[40px] shadow-lg w-full aspect-[3/4] object-cover" alt="Focus" />
                      </div>
                   </div>
                </Col>
              </Row>
            </div>
          </section>

          {/* ── SECTION 5: THE SOLUTION (BENTO) ── */}
          <section className="py-32 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-20">
                 <h2 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tighter">Why ClosetRush?</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 h-auto md:h-[700px]">
                
                {/* What We Do */}
                <div className="md:col-span-2 md:row-span-2 bg-white p-12 rounded-[50px] border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-blue-500 transition-all">
                  <div>
                    <Tag color="blue" className="mb-6 font-bold uppercase tracking-widest">Our Solution</Tag>
                    <h3 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">Fresh, professionally cleaned bedding with better hygiene.</h3>
                    <p className="text-slate-600 mb-6 leading-relaxed">ClosetRush provides premium bedding laundry services with doorstep pickup and delivery. Our professional washing process ensures cleanliness for your bedsheets, pillow covers, quilts, blankets, and curtains.</p>
                    <ul className="space-y-4 text-slate-500 text-lg">
                       <li className="flex gap-3 items-start"><CheckCircleFilled className="text-blue-500 mt-1" /> <span><strong>Regular replacement cycles:</strong> To maintain optimal hygiene</span></li>
                       <li className="flex gap-3 items-start"><CheckCircleFilled className="text-blue-500 mt-1" /> <span><strong>Medical-grade sanitization:</strong> UV-C sterilization and eco-friendly detergents eliminate 99.9% bacteria</span></li>
                       <li className="flex gap-3 items-start"><CheckCircleFilled className="text-blue-500 mt-1" /> <span><strong>Doorstep service:</strong> Convenient pickup and delivery at your home, hostel, or PG accommodation</span></li>
                       <li className="flex gap-3 items-start"><CheckCircleFilled className="text-blue-500 mt-1" /> <span><strong>Affordable pricing:</strong> Starting at just ₹10** per day for complete bedding hygiene solution</span></li>
                    </ul>
                  </div>
                  <div className="mt-10 p-8 bg-slate-50 rounded-3xl">
                     <p className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-2">Designed For:</p>
                     <p className="text-slate-500 leading-relaxed">Students in hostels and PG accommodations, working professionals in rental apartments, busy families, and anyone who values bedding hygiene but lacks time for regular laundry. Perfect for bachelors, couples, and shared living spaces in Delhi NCR.</p>
                  </div>
                </div>

                {/* Hygiene Benefit */}
                <div className="md:col-span-2 bg-[#020617] p-10 rounded-[50px] text-white flex flex-col justify-center">
                   <ThunderboltOutlined className="text-4xl text-blue-500 mb-6" />
                   <h3 className="text-2xl font-bold mb-4 text-white">Reduce Bacteria, Allergens & Dust Mites</h3>
                   <p className="text-slate-300 leading-relaxed">Save time and effort on laundry while dramatically improving sleep quality and overall health through cleanliness. Our professional bedding washing service eliminates harmful microorganisms, reduces allergy symptoms, and prevents skin infections. Experience better sleep, clearer skin, and improved respiratory health with regularly sanitized bedding.</p>
                </div>

                {/* Sustainability */}
                <div className="md:col-span-1 bg-blue-600 p-10 rounded-[50px] text-white flex flex-col justify-center">
                   <h3 className="text-xl font-bold mb-3 text-white">Eco-Friendly Laundry</h3>
                   <p className="text-blue-100 text-sm leading-relaxed">Our shared bedding model and industrial washing efficiency reduce water consumption by atleast 40% and energy usage by 35% compared to home washing machines. Biodegradable detergents protect the environment while delivering superior cleaning results.</p>
                </div>

                {/* Service Area */}
                <div className="md:col-span-1 bg-slate-200 p-10 rounded-[50px] flex flex-col justify-center">
                   <EnvironmentOutlined className="text-3xl text-slate-900 mb-4" />
                   <h3 className="text-xl font-bold text-slate-900 mb-2">Delhi NCR Coverage</h3>
                   <p className="text-slate-600 text-sm leading-relaxed">Currently serving Gurgaon and regions like Noida, Greater Noida, Delhi, Faridabad, and nearby "will be available soon". Expanding rapidly to cover entire NCR region and major Indian cities.</p>
                </div>
              </div>
            </div>
          </section>

          {/* ── SECTION 6: RESEARCH LINKS ── */}
          <section className="py-32 bg-white">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                 <div className="max-w-2xl">
                    <h2 className="text-5xl font-bold text-slate-900 tracking-tighter">Backed by Science.</h2>
                    <p className="text-xl text-slate-500 mt-4 font-light">Our methods are validated by leading research institutions and industry experts.</p>
                 </div>
              </div>
              <Row gutter={[24, 24]}>
                {[
                  { icon: ExperimentOutlined, t: "UV-C Sanitization", j: "Journal of Textile Science, 2023", c: "UV-C light at 254nm wavelength eliminates 99.9% of bacteria, viruses, and mold spores.", l: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7194064/", bg: "#eff6ff", tx: "#2563eb" },
                  { icon: SafetyOutlined, t: "Eco-Detergent Performance", j: "Env Science & Tech, 2023", c: "Biodegradable detergents match petroleum alternatives in efficacy while reducing impact by 85%.", l: "https://pubs.acs.org/journal/esthag", bg: "#f0fdf4", tx: "#16a34a" },
                  { icon: HeartOutlined, t: "Allergen Reduction", j: "Respiratory Medicine, 2022", c: "Regular sanitization reduces household allergen exposure by 73%, improving respiratory health.", l: "https://www.atsjournals.org/", bg: "#faf5ff", tx: "#9333ea" },
                  { icon: TrophyOutlined, t: "Fabric Longevity", j: "International Textile Institute, 2023", c: "Specific care protocols extend garment lifespan by 3-5 years, reducing waste and saving costs.", l: "https://www.tandfonline.com/journals/ttpr20", bg: "#fff7ed", tx: "#ea580c" }
                ].map((res, i) => (
                  <Col xs={24} md={12} lg={6} key={i}>
                    <SmoothReveal y={30} delay={i * 0.1}>
                      <div className="h-full p-10 rounded-[40px] border border-slate-100 flex flex-col hover:shadow-xl transition-all group" style={{ backgroundColor: res.bg }}>
                         <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg" style={{ backgroundColor: res.tx }}>
                            <res.icon className="text-2xl" />
                         </div>
                         <h4 className="text-xl font-bold text-slate-900 mb-2 leading-tight">{res.t}</h4>
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-50">{res.j}</p>
                         <p className="text-slate-600 text-sm leading-relaxed mb-8 flex-grow">{res.c}</p>
                         <a href={res.l} target="_blank" className="font-bold text-xs uppercase tracking-widest inline-flex items-center gap-2 group-hover:gap-4 transition-all" style={{ color: res.tx }}>
                            Read Research <LinkOutlined />
                         </a>
                      </div>
                    </SmoothReveal>
                  </Col>
                ))}
              </Row>
            </div>
          </section>

          {/* ── SECTION 7: USER STORIES (INDIAN CUSTOMERS) ── */}
          <section className="py-32 bg-[#020617] text-white">
            <div className="max-w-7xl mx-auto px-6">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-20 text-center">Real Impact.</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {[
                   { n: "Rahul Sharma", r: "Software Engineer, Gurgaon", q: "Working 12-hour shifts at my tech company, I had no time for laundry. ClosetRush's weekly bedding service means I always have fresh, clean sheets. My skin allergies have reduced significantly!", s: ["Time Saved: 6 hrs/week", "Member Since: 2024"] },
                   { n: "Anjali Verma", r: "PG Owner, Noida", q: "Managing 25 rooms was a nightmare with bedding hygiene. ClosetRush handles all my bedsheets, pillow covers, and quilts with same-day pickup. My tenants are much happier now!", s: ["Cost Saved: 35%", "Business Plan"] },
                   { n: "Priya Kapoor", r: "Working Mother, Delhi", q: "My daughter had constant dust allergies and skin rashes. After switching to ClosetRush's UV-sanitized bedding service, her symptoms reduced by 70%. Best decision ever!", s: ["Health Impact: High", "Family Plan"] },
                   { n: "Vikram Singh", r: "Medical Student, AIIMS", q: "Living in a hostel, washing bedsheets was impossible. ClosetRush delivers fresh, hospital-grade clean bedding every week at just ₹10/day. Perfect for students like me!", s: ["Student Discount", "Monthly Plan"] }
                 ].map((user, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-12 rounded-[50px] hover:bg-white/10 transition-all group">
                       <p className="text-2xl font-light italic text-slate-300 leading-relaxed mb-10 group-hover:text-white transition-colors">"{user.q}"</p>
                       <div className="flex items-center justify-between flex-wrap gap-4">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white uppercase">{user.n[0]}</div>
                             <div>
                                <p className="font-bold">{user.n}</p>
                                <p className="text-xs text-slate-500">{user.r}</p>
                             </div>
                          </div>
                          <div className="flex gap-2">
                             {user.s.map((stat, idx) => <span key={idx} className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-blue-400 border border-blue-500/20">{stat}</span>)}
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
            </div>
          </section>

          {/* ── SECTION 8: FINAL VISION ── */}
          <section className="py-40 bg-white relative overflow-hidden text-center">
             <div className="max-w-5xl mx-auto px-6 relative z-10">
                <SmoothReveal>
                   <h2 className="text-7xl md:text-[140px] font-bold text-slate-900 leading-[0.8] tracking-tighter mb-12">
                      The Bigger <br/><span className="text-blue-600 italic">Vision.</span>
                   </h2>
                   <p className="text-2xl text-slate-500 max-w-3xl mx-auto font-light leading-relaxed mb-12">
                      ClosetRush is building more than a service — we’re building awareness. Because your bed and home is where you spend more than 1/3rd of your life. And it deserves to be clean, safe, and healthy.
                   </p>
                   <button onClick={handleGetStarted} className="px-16 py-8 bg-[#020617] text-white text-xl font-black rounded-full shadow-2xl hover:scale-105 transition-all">
                      JOIN THE HYGIENE REVOLUTION
                   </button>
                </SmoothReveal>
             </div>
             {/* Dynamic background text */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[40vw] font-black text-slate-50/50 -z-0 pointer-events-none select-none">
                CLOSET
             </div>
          </section>

        </Content>
        <Footer />
      </Layout>
    </ConfigProvider>
  );
};

export default AboutPage;