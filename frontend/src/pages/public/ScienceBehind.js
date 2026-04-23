import { useState, useEffect, useRef } from 'react';
import { Layout, Spin, message } from 'antd';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import api from '../../services/api';

const { Content } = Layout;

// ── Default data (shown when no DB sections exist yet) ────────────────────────
const DEFAULT_SECTIONS = [
  {
    _id: 'health',
    order: 1,
    title: 'Health Benefits',
    emoji: '🫀',
    stat: '30%',
    statLabel: 'Better Sleep',
    content: {
      mainText: 'Reduces dust mites, allergens, and bacteria — improving skin health and breathing quality. Scientific studies show that clean bedding directly impacts your immune system and respiratory health.',
      bulletPoints: [
        'Reduces skin irritation and eczema flare-ups',
        'Minimizes respiratory issues and allergies',
        'Prevents bacterial and fungal infections',
        'Lowers allergen exposure by up to 80%',
        'Supports immune system function',
        'Improves air quality in your sleep environment',
      ],
      additionalText: 'Research from the American Academy of Allergy shows that regular bedding changes reduce allergy symptoms by up to 30%.',
    },
    images: [],
    backgroundColor: '#ffffff',
    textColor: '#0f2a52',
    dark: false,
    accentColor: '#2a5fc7',
  },
  {
    _id: 'hygiene',
    order: 2,
    title: 'Hospital-Grade Hygiene',
    emoji: '💉',
    stat: '99.9%',
    statLabel: 'Bacteria Free',
    content: {
      mainText: 'Every item washed at 60°C+, sanitized with eco-friendly detergents, sealed in sterile packaging. Our process meets hospital-grade standards to ensure your bedding is truly clean.',
      bulletPoints: [
        'High temperature washing at 60°C+',
        'Eco-friendly sanitization process',
        'Sealed sterile packaging on delivery',
        'UV-treated fabrics for extra protection',
        'No harsh chemical residue',
        'Certified clean on every delivery',
      ],
      additionalText: 'Our cleaning process is certified by independent hygiene laboratories and meets NHS hospital linen standards.',
    },
    images: [],
    backgroundColor: '#1a3a8a',
    textColor: '#ffffff',
    dark: true,
    accentColor: '#a8c4f0',
  },
  {
    _id: 'energy',
    order: 3,
    title: 'Energy & Balance',
    emoji: '⚡',
    stat: '7',
    statLabel: 'Chakras Aligned',
    content: {
      mainText: 'Clean surroundings promote positive energy flow, grounding, and emotional clarity. Ancient wisdom and modern psychology agree — your environment shapes your mental state.',
      bulletPoints: [
        'Root chakra grounding through clean space',
        'Enhanced creativity and mental clarity',
        'Emotional well-being and stability',
        'Reduced mental clutter and anxiety',
        'Better focus and concentration',
        'Promotes restful, restorative energy',
      ],
      additionalText: 'Studies in environmental psychology show that clean, organized sleeping spaces reduce cortisol levels and improve overall mood.',
    },
    images: [],
    backgroundColor: '#1a3a8a',
    textColor: '#ffffff',
    dark: true,
    accentColor: '#a8c4f0',
  },
  {
    _id: 'mental',
    order: 4,
    title: 'Mental Well-being',
    emoji: '🧠',
    stat: '40%',
    statLabel: 'Less Stress',
    content: {
      mainText: 'The psychological impact of fresh bedding is profound — reducing stress, creating a sense of luxury and self-care that carries through your entire day.',
      bulletPoints: [
        'Reduces anxiety and stress levels',
        'Improves mood and emotional resilience',
        'Creates better morning routines',
        'Promotes deeper, more restful sleep',
        'Lowers cortisol stress response',
        'Creates a luxury self-care ritual',
      ],
      additionalText: 'A study by the National Sleep Foundation found that people who make their bed and use fresh bedding report 19% better sleep quality.',
    },
    images: [],
    backgroundColor: '#ffffff',
    textColor: '#0f2a52',
    dark: false,
    accentColor: '#2a5fc7',
  },
];

// ── Merge DB data with defaults ───────────────────────────────────────────────
function mergeWithDefaults(dbSections) {
  if (!dbSections || dbSections.length === 0) return DEFAULT_SECTIONS;
  return DEFAULT_SECTIONS.map((def, i) => {
    const db = dbSections.find(s => s.order === def.order) || dbSections[i];
    if (!db) return def;
    return {
      ...def,
      ...db,
      dark: db.backgroundColor && db.backgroundColor !== '#ffffff' && db.backgroundColor !== '#fff',
      accentColor: db.backgroundColor && db.backgroundColor !== '#ffffff' ? '#a8c4f0' : '#2a5fc7',
      emoji: def.emoji,
      stat: def.stat,
      statLabel: def.statLabel,
    };
  });
}

// ── Animated stat counter ─────────────────────────────────────────────────────
function StatCounter({ value, label, color }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="text-center">
      <motion.div
        className="text-4xl sm:text-5xl font-bold leading-none mb-1"
        style={{ color }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {value}
      </motion.div>
      <div className="text-sm font-medium opacity-70">{label}</div>
    </div>
  );
}

// ── Image gallery for a section ───────────────────────────────────────────────
function SectionImages({ images, isDark }) {
  if (!images || images.length === 0) return null;
  return (
    <div className={`grid gap-3 ${images.length === 1 ? 'grid-cols-1' : images.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
      {images.map((img, i) => (
        <motion.div
          key={img._id || i}
          className="rounded-2xl overflow-hidden aspect-square"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
        >
          <img src={img.url} alt={img.caption || 'Section image'} className="w-full h-full object-cover" />
          {img.caption && (
            <div className="absolute bottom-0 left-0 right-0 p-2 text-xs text-center"
              style={{ background: 'rgba(0,0,0,0.5)', color: '#fff' }}
            >
              {img.caption}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

// ── Individual section block ──────────────────────────────────────────────────
function ScienceSection({ section, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const isEven = index % 2 === 0;
  const isDark = section.dark;
  const accent = section.accentColor || '#2a5fc7';
  const hasImages = section.images && section.images.length > 0;

  return (
    <section
      ref={ref}
      className="relative overflow-hidden"
      style={{
        background: isDark
          ? 'linear-gradient(145deg,#0f2a52 0%,#1a3a8a 50%,#1e4a9a 100%)'
          : index % 4 === 0 ? '#ffffff' : '#f8faff',
      }}
    >
      {/* Dot grid for dark sections */}
      {isDark && (
        <div className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '28px 28px' }}
        />
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${!isEven ? 'lg:grid-flow-dense' : ''}`}>

          {/* ── Text content ── */}
          <motion.div
            className={!isEven ? 'lg:col-start-2' : ''}
            initial={{ opacity: 0, x: isEven ? -40 : 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Section number + emoji */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: isDark ? 'rgba(255,255,255,0.12)' : `${accent}18`, border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : `${accent}30`}` }}
              >
                {section.emoji}
              </div>
              <span className="text-xs font-bold tracking-widest uppercase"
                style={{ color: isDark ? 'rgba(168,196,240,0.7)' : accent }}
              >
                0{section.order} — {section.title}
              </span>
            </div>

            {/* Title */}
            <motion.h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4"
              style={{ color: isDark ? '#ffffff' : '#0f2a52' }}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              {section.title}
            </motion.h2>

            {/* Stat */}
            <motion.div
              className="flex items-baseline gap-2 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="text-4xl font-bold" style={{ color: accent }}>{section.stat}</span>
              <span className="text-sm font-medium" style={{ color: isDark ? 'rgba(168,196,240,0.7)' : '#6a8aaa' }}>{section.statLabel}</span>
            </motion.div>

            {/* Main text */}
            <motion.p
              className="text-base sm:text-lg leading-relaxed mb-6"
              style={{ color: isDark ? 'rgba(255,255,255,0.75)' : '#4a6a8a' }}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              {section.content?.mainText}
            </motion.p>

            {/* Bullet points */}
            {section.content?.bulletPoints?.length > 0 && (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                {section.content.bulletPoints.map((point, i) => (
                  <motion.li
                    key={i}
                    className="flex items-start gap-2 text-sm"
                    style={{ color: isDark ? 'rgba(168,196,240,0.9)' : '#4a6a8a' }}
                    initial={{ opacity: 0, x: -16 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.3 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                      style={{ background: accent }}
                    />
                    {point}
                  </motion.li>
                ))}
              </ul>
            )}

            {/* Additional text */}
            {section.content?.additionalText && (
              <motion.div
                className="rounded-xl p-4 text-sm italic"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.08)' : `${accent}0d`,
                  borderLeft: `3px solid ${accent}`,
                  color: isDark ? 'rgba(168,196,240,0.8)' : '#6a8aaa',
                }}
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                {section.content.additionalText}
              </motion.div>
            )}
          </motion.div>

          {/* ── Visual side ── */}
          <motion.div
            className={!isEven ? 'lg:col-start-1 lg:row-start-1' : ''}
            initial={{ opacity: 0, x: isEven ? 40 : -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            {hasImages ? (
              <SectionImages images={section.images} isDark={isDark} />
            ) : (
              /* Placeholder visual when no images */
              <div className="relative">
                <div className="rounded-3xl overflow-hidden aspect-[4/3] flex items-center justify-center"
                  style={{
                    background: isDark
                      ? 'rgba(255,255,255,0.06)'
                      : `linear-gradient(135deg, ${accent}15, ${accent}08)`,
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : `${accent}25`}`,
                  }}
                >
                  {/* Large emoji + stat display */}
                  <div className="text-center p-8">
                    <motion.div
                      className="text-8xl sm:text-9xl mb-6"
                      animate={{ y: [0, -12, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      {section.emoji}
                    </motion.div>
                    <div className="text-5xl sm:text-6xl font-bold mb-2" style={{ color: accent }}>
                      {section.stat}
                    </div>
                    <div className="text-sm font-medium" style={{ color: isDark ? 'rgba(168,196,240,0.6)' : '#6a8aaa' }}>
                      {section.statLabel}
                    </div>
                  </div>
                </div>

                {/* Floating accent cards */}
                <motion.div
                  className="absolute -top-4 -right-4 rounded-2xl px-4 py-3 shadow-xl"
                  style={{
                    background: isDark ? 'rgba(168,196,240,0.15)' : '#ffffff',
                    border: `1px solid ${isDark ? 'rgba(168,196,240,0.2)' : `${accent}20`}`,
                    backdropFilter: 'blur(12px)',
                  }}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="text-xs font-semibold" style={{ color: isDark ? '#a8c4f0' : accent }}>
                    Scientifically Proven
                  </div>
                </motion.div>

                <motion.div
                  className="absolute -bottom-4 -left-4 rounded-2xl px-4 py-3 shadow-xl"
                  style={{
                    background: isDark ? 'rgba(168,196,240,0.15)' : '#ffffff',
                    border: `1px solid ${isDark ? 'rgba(168,196,240,0.2)' : `${accent}20`}`,
                    backdropFilter: 'blur(12px)',
                  }}
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
                >
                  <div className="text-xs font-semibold" style={{ color: isDark ? '#a8c4f0' : accent }}>
                    ✓ Research Backed
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Section divider wave */}
      {!isDark && index < 3 && (
        <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(168,196,240,0.08))' }}
        />
      )}
    </section>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const ScienceBehindPage = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await api.get('/science-sections');
      const dbSections = response.data.sections || [];
      setSections(mergeWithDefaults(dbSections));
    } catch (error) {
      console.error('Failed to load science sections, using defaults:', error);
      setSections(DEFAULT_SECTIONS);
      message.info('Showing default content');
    } finally {
      setLoading(false);
    }
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
    <Layout className="min-h-screen">
      <Navbar />
      <Content>

        {/* ── Hero ── */}
        <section className="relative overflow-hidden py-24 sm:py-32"
          style={{ background: 'linear-gradient(145deg,#0f2a52 0%,#1a3a8a 50%,#2a5fc7 100%)' }}
        >
          {/* Dot grid */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
          />
          {/* Glow orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(168,196,240,0.15), transparent 70%)' }}
          />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(168,196,240,0.1), transparent 70%)' }}
          />

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6"
              style={{ borderColor: 'rgba(168,196,240,0.3)', background: 'rgba(168,196,240,0.1)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#a8c4f0' }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#a8c4f0' }}>
                Evidence-Based Research
              </span>
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              The Science Behind
              <br />
              <span style={{ background: 'linear-gradient(135deg,#a8c4f0,#d4e5ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Clean Bedding
              </span>
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl mx-auto"
              style={{ color: 'rgba(168,196,240,0.8)' }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              Discover why fresh, clean bedding is essential for your health, hygiene, energy, and mental well-being — backed by science.
            </motion.p>

            {/* 4 stat pills */}
            <motion.div
              className="flex flex-wrap justify-center gap-3"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {sections.map((s, i) => (
                <div key={s._id} className="flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(168,196,240,0.2)' }}
                >
                  <span>{s.emoji}</span>
                  <span className="text-sm font-semibold text-white">{s.stat}</span>
                  <span className="text-xs" style={{ color: 'rgba(168,196,240,0.7)' }}>{s.statLabel}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── 4 Science Sections ── */}
        <AnimatePresence>
          {sections.map((section, index) => (
            <ScienceSection key={section._id} section={section} index={index} />
          ))}
        </AnimatePresence>

        {/* ── Bottom CTA ── */}
        <section className="py-20 px-4"
          style={{ background: 'linear-gradient(135deg,#0f2a52 0%,#1a3a8a 100%)' }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <motion.h2
              className="text-3xl sm:text-4xl font-bold text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            >
              Ready to Experience the Difference?
            </motion.h2>
            <motion.p
              className="text-lg mb-8"
              style={{ color: 'rgba(168,196,240,0.8)' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            >
              Join thousands who've transformed their sleep with scientifically clean bedding.
            </motion.p>
            <motion.a
              href="/subscriptions"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg,#a8c4f0,#d4e5ff)',
                color: '#0f2a52',
                boxShadow: '0 8px 32px rgba(168,196,240,0.3)',
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            >
              Start Your Subscription →
            </motion.a>
          </div>
        </section>

      </Content>
      <Footer />
    </Layout>
  );
};

export default ScienceBehindPage;
