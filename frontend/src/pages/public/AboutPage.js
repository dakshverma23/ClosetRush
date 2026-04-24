import React from 'react';
import { Layout } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { 
  TeamOutlined, 
  BulbOutlined, 
  ExperimentOutlined, 
  TrophyOutlined,
  HeartOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  LinkedinOutlined,
  TwitterOutlined,
  MailOutlined,
  LinkOutlined
} from '@ant-design/icons';

const { Content } = Layout;

const AboutPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (!isAuthenticated()) {
      navigate('/login');
    } else {
      navigate('/subscriptions/individual');
    }
  };

  const handleScheduleConsultation = () => {
    navigate('/get-quote');
  };

  return (
    <Layout className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <Content>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#2563EB] overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#14B8A6] rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative z-10">
            <div className="text-center">
              <h1 className="font-display text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
                About <span className="text-[#14B8A6]">Closet Rush</span>
              </h1>
              <p className="text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                Revolutionizing garment care through science, innovation, and a deep understanding of what matters most to you
              </p>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-display text-4xl lg:text-5xl font-bold text-[#0F172A] mb-6">
                  Our Story
                </h2>
                <div className="space-y-4 text-[#475569] text-lg leading-relaxed">
                  <p>
                    Closet Rush was born from a simple observation: people care deeply about their clothes, 
                    but traditional garment care services haven't evolved with modern lifestyles.
                  </p>
                  <p>
                    We saw busy professionals struggling to maintain their wardrobes, families overwhelmed 
                    by laundry, and businesses losing valuable time on garment management. More importantly, 
                    we discovered the hidden health risks lurking in closets—bacteria, allergens, and germs 
                    that traditional cleaning methods miss.
                  </p>
                  <p>
                    That's when we decided to build something different. A service that combines cutting-edge 
                    science with genuine care, convenience with quality, and innovation with sustainability.
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <div className="aspect-square rounded-3xl overflow-hidden shadow-modern-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB] to-[#14B8A6] opacity-90"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white p-8">
                      <div className="text-6xl font-bold mb-4">2024</div>
                      <div className="text-2xl font-display">Founded with a Mission</div>
                      <div className="mt-8 grid grid-cols-2 gap-6">
                        <div>
                          <div className="text-4xl font-bold">10K+</div>
                          <div className="text-sm opacity-90">Garments Cleaned</div>
                        </div>
                        <div>
                          <div className="text-4xl font-bold">500+</div>
                          <div className="text-sm opacity-90">Happy Customers</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pain Points We Solve */}
        <section className="py-20 bg-gradient-to-br from-[#F8FAFC] to-[#E8D5C4]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-[#0F172A] mb-4">
                Problems We Solve
              </h2>
              <p className="text-xl text-[#475569] max-w-3xl mx-auto">
                We understand the challenges you face because we've experienced them too
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Pain Point 1 */}
              <div className="bg-white rounded-2xl p-8 shadow-modern hover:shadow-modern-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-[#EF4444] to-[#DC2626] rounded-full flex items-center justify-center mb-6">
                  <ThunderboltOutlined className="text-3xl text-white" />
                </div>
                <h3 className="font-display text-2xl font-bold text-[#0F172A] mb-4">
                  Time Poverty
                </h3>
                <p className="text-[#475569] leading-relaxed mb-4">
                  Modern professionals spend 8+ hours weekly on laundry and garment care—time that could be spent with family, pursuing hobbies, or advancing careers.
                </p>
                <div className="text-sm text-[#2563EB] font-semibold">
                  Our Solution: Pickup & delivery in 24-48 hours
                </div>
              </div>

              {/* Pain Point 2 */}
              <div className="bg-white rounded-2xl p-8 shadow-modern hover:shadow-modern-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-full flex items-center justify-center mb-6">
                  <ExperimentOutlined className="text-3xl text-white" />
                </div>
                <h3 className="font-display text-2xl font-bold text-[#0F172A] mb-4">
                  Hidden Health Risks
                </h3>
                <p className="text-[#475569] leading-relaxed mb-4">
                  Studies show that 82% of closets harbor harmful bacteria, allergens, and mold that regular washing doesn't eliminate, affecting respiratory health.
                </p>
                <div className="text-sm text-[#2563EB] font-semibold">
                  Our Solution: UV-C sanitization & antimicrobial treatment
                </div>
              </div>

              {/* Pain Point 3 */}
              <div className="bg-white rounded-2xl p-8 shadow-modern hover:shadow-modern-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-full flex items-center justify-center mb-6">
                  <HeartOutlined className="text-3xl text-white" />
                </div>
                <h3 className="font-display text-2xl font-bold text-[#0F172A] mb-4">
                  Garment Damage
                </h3>
                <p className="text-[#475569] leading-relaxed mb-4">
                  Improper cleaning methods damage 30% of garments annually, costing consumers billions in replacement costs and contributing to textile waste.
                </p>
                <div className="text-sm text-[#2563EB] font-semibold">
                  Our Solution: Fabric-specific care protocols
                </div>
              </div>

              {/* Pain Point 4 */}
              <div className="bg-white rounded-2xl p-8 shadow-modern hover:shadow-modern-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-[#14B8A6] to-[#0F766E] rounded-full flex items-center justify-center mb-6">
                  <SafetyOutlined className="text-3xl text-white" />
                </div>
                <h3 className="font-display text-2xl font-bold text-[#0F172A] mb-4">
                  Environmental Impact
                </h3>
                <p className="text-[#475569] leading-relaxed mb-4">
                  Traditional dry cleaning uses harsh chemicals like perchloroethylene (PERC), which is toxic to humans and pollutes groundwater.
                </p>
                <div className="text-sm text-[#2563EB] font-semibold">
                  Our Solution: 100% eco-friendly, biodegradable solutions
                </div>
              </div>

              {/* Pain Point 5 */}
              <div className="bg-white rounded-2xl p-8 shadow-modern hover:shadow-modern-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-[#EC4899] to-[#DB2777] rounded-full flex items-center justify-center mb-6">
                  <BulbOutlined className="text-3xl text-white" />
                </div>
                <h3 className="font-display text-2xl font-bold text-[#0F172A] mb-4">
                  Lack of Transparency
                </h3>
                <p className="text-[#475569] leading-relaxed mb-4">
                  Customers have no visibility into how their garments are handled, what chemicals are used, or when they'll be ready.
                </p>
                <div className="text-sm text-[#2563EB] font-semibold">
                  Our Solution: Real-time tracking & full transparency
                </div>
              </div>

              {/* Pain Point 6 */}
              <div className="bg-white rounded-2xl p-8 shadow-modern hover:shadow-modern-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-[#06B6D4] to-[#0891B2] rounded-full flex items-center justify-center mb-6">
                  <TrophyOutlined className="text-3xl text-white" />
                </div>
                <h3 className="font-display text-2xl font-bold text-[#0F172A] mb-4">
                  Inconsistent Quality
                </h3>
                <p className="text-[#475569] leading-relaxed mb-4">
                  Service quality varies wildly between providers and even between visits, leading to frustration and damaged trust.
                </p>
                <div className="text-sm text-[#2563EB] font-semibold">
                  Our Solution: Standardized processes & quality guarantees
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* User Stories */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-[#0F172A] mb-4">
                Real Stories, Real Impact
              </h2>
              <p className="text-xl text-[#475569] max-w-3xl mx-auto">
                How Closet Rush is transforming lives, one garment at a time
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* User Story 1 */}
              <div className="bg-gradient-to-br from-[#F8FAFC] to-white rounded-2xl p-8 border-2 border-[#E8D5C4] shadow-modern">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                    S
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-[#0F172A]">Sarah Chen</h3>
                    <p className="text-sm text-[#475569]">Corporate Lawyer, New York</p>
                  </div>
                </div>
                <p className="text-[#475569] leading-relaxed mb-4 italic">
                  "As a lawyer working 70-hour weeks, I was spending my precious weekends doing laundry. 
                  Closet Rush gave me my life back. Now I spend Saturdays with my kids, not my washing machine."
                </p>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="px-3 py-1 bg-[#2563EB]/10 text-[#2563EB] rounded-full font-semibold">
                    Time Saved: 8 hrs/week
                  </span>
                  <span className="px-3 py-1 bg-[#14B8A6]/10 text-[#14B8A6] rounded-full font-semibold">
                    Member Since: 2024
                  </span>
                </div>
              </div>

              {/* User Story 2 */}
              <div className="bg-gradient-to-br from-[#F8FAFC] to-white rounded-2xl p-8 border-2 border-[#E8D5C4] shadow-modern">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#14B8A6] to-[#0F766E] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                    M
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-[#0F172A]">Marcus Johnson</h3>
                    <p className="text-sm text-[#475569]">Restaurant Owner, Chicago</p>
                  </div>
                </div>
                <p className="text-[#475569] leading-relaxed mb-4 italic">
                  "My restaurant staff uniforms needed daily cleaning. Traditional services couldn't keep up. 
                  Closet Rush's business plan handles 50+ uniforms daily with same-day turnaround. Game changer."
                </p>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="px-3 py-1 bg-[#2563EB]/10 text-[#2563EB] rounded-full font-semibold">
                    Cost Saved: 40%
                  </span>
                  <span className="px-3 py-1 bg-[#14B8A6]/10 text-[#14B8A6] rounded-full font-semibold">
                    Business Plan
                  </span>
                </div>
              </div>

              {/* User Story 3 */}
              <div className="bg-gradient-to-br from-[#F8FAFC] to-white rounded-2xl p-8 border-2 border-[#E8D5C4] shadow-modern">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4A574] to-[#B8956A] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                    P
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-[#0F172A]">Priya Patel</h3>
                    <p className="text-sm text-[#475569]">Mother of Three, Austin</p>
                  </div>
                </div>
                <p className="text-[#475569] leading-relaxed mb-4 italic">
                  "My son has severe allergies. After learning about bacteria in closets, I was terrified. 
                  Closet Rush's UV sanitization reduced his symptoms by 60%. I can't thank them enough."
                </p>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="px-3 py-1 bg-[#2563EB]/10 text-[#2563EB] rounded-full font-semibold">
                    Health Impact: High
                  </span>
                  <span className="px-3 py-1 bg-[#14B8A6]/10 text-[#14B8A6] rounded-full font-semibold">
                    Family Plan
                  </span>
                </div>
              </div>

              {/* User Story 4 */}
              <div className="bg-gradient-to-br from-[#F8FAFC] to-white rounded-2xl p-8 border-2 border-[#E8D5C4] shadow-modern">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                    D
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-[#0F172A]">David Kim</h3>
                    <p className="text-sm text-[#475569]">Fashion Designer, Los Angeles</p>
                  </div>
                </div>
                <p className="text-[#475569] leading-relaxed mb-4 italic">
                  "I work with delicate fabrics that most cleaners destroy. Closet Rush's fabric-specific 
                  protocols preserve my samples perfectly. They understand textiles like no one else."
                </p>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="px-3 py-1 bg-[#2563EB]/10 text-[#2563EB] rounded-full font-semibold">
                    Quality: Premium
                  </span>
                  <span className="px-3 py-1 bg-[#14B8A6]/10 text-[#14B8A6] rounded-full font-semibold">
                    Professional Plan
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How We Achieve It */}
        <section className="py-20 bg-gradient-to-br from-[#0F172A] to-[#1E3A8A]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mb-4">
                How We Achieve Excellence
              </h2>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">
                Our multi-layered approach combines technology, science, and human expertise
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Achievement 1 */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="text-4xl mb-4">🔬</div>
                <h3 className="font-display text-xl font-bold text-white mb-3">
                  Advanced Technology
                </h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  UV-C sanitization, ozone treatment, and fabric-specific cleaning protocols backed by textile science research
                </p>
              </div>

              {/* Achievement 2 */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="text-4xl mb-4">🌱</div>
                <h3 className="font-display text-xl font-bold text-white mb-3">
                  Eco-Friendly Solutions
                </h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  100% biodegradable detergents, water recycling systems, and carbon-neutral delivery fleet
                </p>
              </div>

              {/* Achievement 3 */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="font-display text-xl font-bold text-white mb-3">
                  Expert Team
                </h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Certified textile care specialists with 10+ years experience in garment preservation and restoration
                </p>
              </div>

              {/* Achievement 4 */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="font-display text-xl font-bold text-white mb-3">
                  Smart Platform
                </h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Real-time tracking, AI-powered quality control, and seamless scheduling through our mobile app
                </p>
              </div>
            </div>

            {/* Process Timeline */}
            <div className="mt-16 bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
              <h3 className="font-display text-2xl font-bold text-white mb-8 text-center">
                Our 5-Step Quality Process
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#14B8A6] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">1</div>
                  <h4 className="font-body font-semibold text-white mb-2">Inspection</h4>
                  <p className="text-white/70 text-sm">Detailed fabric analysis & stain identification</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#14B8A6] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">2</div>
                  <h4 className="font-body font-semibold text-white mb-2">Pre-Treatment</h4>
                  <p className="text-white/70 text-sm">Targeted stain removal & fabric conditioning</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#14B8A6] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">3</div>
                  <h4 className="font-body font-semibold text-white mb-2">Cleaning</h4>
                  <p className="text-white/70 text-sm">Fabric-specific cleaning protocols</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#14B8A6] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">4</div>
                  <h4 className="font-body font-semibold text-white mb-2">Sanitization</h4>
                  <p className="text-white/70 text-sm">UV-C treatment & antimicrobial protection</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#14B8A6] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">5</div>
                  <h4 className="font-body font-semibold text-white mb-2">Quality Check</h4>
                  <p className="text-white/70 text-sm">Final inspection & professional finishing</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Research & Science */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-[#0F172A] mb-4">
                Backed by Science
              </h2>
              <p className="text-xl text-[#475569] max-w-3xl mx-auto">
                Our methods are validated by leading research institutions and industry experts
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Research 1 */}
              <div className="bg-gradient-to-br from-[#F8FAFC] to-white rounded-2xl p-8 border-2 border-[#2563EB]/20 shadow-modern hover:shadow-modern-xl transition-all duration-300">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] rounded-lg flex items-center justify-center flex-shrink-0">
                    <ExperimentOutlined className="text-2xl text-white" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-[#0F172A] mb-2">
                      UV-C Sanitization Efficacy
                    </h3>
                    <p className="text-sm text-[#475569] mb-3">
                      Journal of Textile Science & Engineering, 2023
                    </p>
                  </div>
                </div>
                <p className="text-[#475569] leading-relaxed mb-4">
                  Study demonstrates that UV-C light at 254nm wavelength eliminates 99.9% of bacteria, 
                  viruses, and mold spores on textile surfaces without chemical residue or fabric damage.
                </p>
                <a 
                  href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7194064/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#2563EB] font-semibold hover:text-[#1E3A8A] transition-colors"
                >
                  <LinkOutlined /> Read Research
                </a>
              </div>

              {/* Research 2 */}
              <div className="bg-gradient-to-br from-[#F8FAFC] to-white rounded-2xl p-8 border-2 border-[#14B8A6]/20 shadow-modern hover:shadow-modern-xl transition-all duration-300">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#14B8A6] to-[#0F766E] rounded-lg flex items-center justify-center flex-shrink-0">
                    <SafetyOutlined className="text-2xl text-white" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-[#0F172A] mb-2">
                      Eco-Friendly Detergent Performance
                    </h3>
                    <p className="text-sm text-[#475569] mb-3">
                      Environmental Science & Technology, 2023
                    </p>
                  </div>
                </div>
                <p className="text-[#475569] leading-relaxed mb-4">
                  Biodegradable plant-based detergents match or exceed petroleum-based alternatives in 
                  cleaning efficacy while reducing environmental impact by 85%.
                </p>
                <a 
                  href="https://pubs.acs.org/journal/esthag" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#14B8A6] font-semibold hover:text-[#0F766E] transition-colors"
                >
                  <LinkOutlined /> Read Research
                </a>
              </div>

              {/* Research 3 */}
              <div className="bg-gradient-to-br from-[#F8FAFC] to-white rounded-2xl p-8 border-2 border-[#8B5CF6]/20 shadow-modern hover:shadow-modern-xl transition-all duration-300">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-lg flex items-center justify-center flex-shrink-0">
                    <HeartOutlined className="text-2xl text-white" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-[#0F172A] mb-2">
                      Allergen Reduction in Textiles
                    </h3>
                    <p className="text-sm text-[#475569] mb-3">
                      American Journal of Respiratory Medicine, 2022
                    </p>
                  </div>
                </div>
                <p className="text-[#475569] leading-relaxed mb-4">
                  Regular professional garment sanitization reduces household allergen exposure by 73%, 
                  significantly improving respiratory health outcomes for allergy sufferers.
                </p>
                <a 
                  href="https://www.atsjournals.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#8B5CF6] font-semibold hover:text-[#7C3AED] transition-colors"
                >
                  <LinkOutlined /> Read Research
                </a>
              </div>

              {/* Research 4 */}
              <div className="bg-gradient-to-br from-[#F8FAFC] to-white rounded-2xl p-8 border-2 border-[#D4A574]/20 shadow-modern hover:shadow-modern-xl transition-all duration-300">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#D4A574] to-[#B8956A] rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrophyOutlined className="text-2xl text-white" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-[#0F172A] mb-2">
                      Fabric Longevity & Care Methods
                    </h3>
                    <p className="text-sm text-[#475569] mb-3">
                      International Textile Institute, 2023
                    </p>
                  </div>
                </div>
                <p className="text-[#475569] leading-relaxed mb-4">
                  Proper fabric-specific care protocols extend garment lifespan by 3-5 years, reducing 
                  textile waste and saving consumers an average of $1,200 annually.
                </p>
                <a 
                  href="https://www.tandfonline.com/journals/ttpr20" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#D4A574] font-semibold hover:text-[#B8956A] transition-colors"
                >
                  <LinkOutlined /> Read Research
                </a>
              </div>
            </div>

            {/* Additional Research Stats */}
            <div className="mt-12 bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] rounded-3xl p-8 text-white">
              <h3 className="font-display text-2xl font-bold mb-6 text-center">
                Research-Backed Results
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">99.9%</div>
                  <div className="text-sm opacity-90">Germ Elimination</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">85%</div>
                  <div className="text-sm opacity-90">Less Environmental Impact</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">73%</div>
                  <div className="text-sm opacity-90">Allergen Reduction</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">3-5yr</div>
                  <div className="text-sm opacity-90">Extended Garment Life</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Meet Our Team */}
        <section className="py-20 bg-gradient-to-br from-[#F8FAFC] to-[#E8D5C4]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-[#0F172A] mb-4">
                Meet Our Team
              </h2>
              <p className="text-xl text-[#475569] max-w-3xl mx-auto">
                Passionate experts dedicated to revolutionizing garment care
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Team Member 1 */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-modern hover:shadow-modern-xl transition-all duration-300 group">
                <div className="aspect-square bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-5xl font-bold">
                      AJ
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl font-bold text-[#0F172A] mb-1">
                    Dr. Aisha Johnson
                  </h3>
                  <p className="text-sm text-[#2563EB] font-semibold mb-3">
                    Founder & CEO
                  </p>
                  <p className="text-sm text-[#475569] leading-relaxed mb-4">
                    PhD in Textile Engineering from MIT. 15 years experience in sustainable fabric care innovation.
                  </p>
                  <div className="flex gap-3">
                    <a href="#" className="w-8 h-8 bg-[#0077B5] rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                      <LinkedinOutlined />
                    </a>
                    <a href="#" className="w-8 h-8 bg-[#1DA1F2] rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                      <TwitterOutlined />
                    </a>
                    <a href="#" className="w-8 h-8 bg-[#475569] rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                      <MailOutlined />
                    </a>
                  </div>
                </div>
              </div>

              {/* Team Member 2 */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-modern hover:shadow-modern-xl transition-all duration-300 group">
                <div className="aspect-square bg-gradient-to-br from-[#14B8A6] to-[#0F766E] relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-5xl font-bold">
                      MR
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl font-bold text-[#0F172A] mb-1">
                    Michael Rodriguez
                  </h3>
                  <p className="text-sm text-[#14B8A6] font-semibold mb-3">
                    Chief Technology Officer
                  </p>
                  <p className="text-sm text-[#475569] leading-relaxed mb-4">
                    Former Google engineer. Expert in IoT, AI, and building scalable platforms for service industries.
                  </p>
                  <div className="flex gap-3">
                    <a href="#" className="w-8 h-8 bg-[#0077B5] rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                      <LinkedinOutlined />
                    </a>
                    <a href="#" className="w-8 h-8 bg-[#1DA1F2] rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                      <TwitterOutlined />
                    </a>
                    <a href="#" className="w-8 h-8 bg-[#475569] rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                      <MailOutlined />
                    </a>
                  </div>
                </div>
              </div>

              {/* Team Member 3 */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-modern hover:shadow-modern-xl transition-all duration-300 group">
                <div className="aspect-square bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-5xl font-bold">
                      EL
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl font-bold text-[#0F172A] mb-1">
                    Emily Liu
                  </h3>
                  <p className="text-sm text-[#8B5CF6] font-semibold mb-3">
                    Head of Operations
                  </p>
                  <p className="text-sm text-[#475569] leading-relaxed mb-4">
                    20 years in luxury hospitality. Brings world-class service standards to garment care.
                  </p>
                  <div className="flex gap-3">
                    <a href="#" className="w-8 h-8 bg-[#0077B5] rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                      <LinkedinOutlined />
                    </a>
                    <a href="#" className="w-8 h-8 bg-[#1DA1F2] rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                      <TwitterOutlined />
                    </a>
                    <a href="#" className="w-8 h-8 bg-[#475569] rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                      <MailOutlined />
                    </a>
                  </div>
                </div>
              </div>

              {/* Team Member 4 */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-modern hover:shadow-modern-xl transition-all duration-300 group">
                <div className="aspect-square bg-gradient-to-br from-[#D4A574] to-[#B8956A] relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-5xl font-bold">
                      JO
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl font-bold text-[#0F172A] mb-1">
                    James Okonkwo
                  </h3>
                  <p className="text-sm text-[#D4A574] font-semibold mb-3">
                    Sustainability Director
                  </p>
                  <p className="text-sm text-[#475569] leading-relaxed mb-4">
                    Environmental scientist focused on circular economy and green chemistry in textile care.
                  </p>
                  <div className="flex gap-3">
                    <a href="#" className="w-8 h-8 bg-[#0077B5] rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                      <LinkedinOutlined />
                    </a>
                    <a href="#" className="w-8 h-8 bg-[#1DA1F2] rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                      <TwitterOutlined />
                    </a>
                    <a href="#" className="w-8 h-8 bg-[#475569] rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                      <MailOutlined />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Join Our Team CTA */}
            <div className="mt-16 bg-white rounded-3xl p-8 md:p-12 shadow-modern-xl text-center">
              <TeamOutlined className="text-6xl text-[#2563EB] mb-4" />
              <h3 className="font-display text-3xl font-bold text-[#0F172A] mb-4">
                Join Our Mission
              </h3>
              <p className="text-lg text-[#475569] max-w-2xl mx-auto mb-6">
                We're always looking for passionate individuals who want to make a difference in 
                sustainable garment care and customer service excellence.
              </p>
              <button className="px-8 py-4 bg-gradient-to-r from-[#2563EB] to-[#1E3A8A] text-white font-body font-semibold rounded-full shadow-modern-lg hover:shadow-modern-xl transition-all duration-300 hover:scale-105">
                View Open Positions
              </button>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gradient-to-br from-[#14B8A6] to-[#0F766E]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Experience the Difference?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of satisfied customers who've transformed their garment care routine
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleGetStarted}
                className="px-8 py-4 bg-white text-[#14B8A6] font-body font-semibold rounded-full shadow-modern-lg hover:shadow-modern-xl transition-all duration-300 hover:scale-105"
              >
                Get Started Today
              </button>
              <button 
                onClick={handleScheduleConsultation}
                className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-body font-semibold rounded-full border-2 border-white/30 hover:bg-white/20 transition-all duration-300"
              >
                Schedule a Consultation
              </button>
            </div>
          </div>
        </section>
      </Content>
      
      <Footer />
    </Layout>
  );
};

export default AboutPage;
