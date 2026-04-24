import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { CameraOutlined } from "@ant-design/icons";

const BLUE = "linear-gradient(145deg,#1a3a8a 0%,#2a5fc7 60%,#3a7bd5 100%)";

// ── Card data — more bullets added ───────────────────────────────────────────
const cards = [
  {
    id: "health",
    emoji: "🫀", stat: "30%", statLabel: "Better Sleep",
    title: "Health Benefits",
    desc: "Reduces dust mites, allergens, and bacteria — improving skin health and breathing quality.",
    bullets: [
      "Reduces skin irritation",
      "Minimizes respiratory issues",
      "Prevents bacterial infections",
      "Lowers allergen exposure",
      "Supports immune health",
      "Improves air quality around you",
    ],
    dark: false,
  },
  {
    id: "hygiene",
    emoji: "💉", stat: "99.9%", statLabel: "Bacteria Free",
    title: "Hospital-Grade Hygiene",
    desc: "Every item washed at 60°C+, sanitized with eco-friendly detergents, sealed in sterile packaging.",
    bullets: [
      "High temp washing (60°C+)",
      "Eco friendly sanitization",
      "Sealed sterile packaging",
      "UV-treated fabrics",
      "No harsh chemical residue",
      "Certified clean on delivery",
    ],
    dark: true,
  },
  {
    id: "energy",
    emoji: "⚡", stat: "7", statLabel: "Chakras Aligned",
    title: "Energy & Balance",
    desc: "Clean surroundings promote positive energy flow, grounding, and emotional clarity.",
    bullets: [
      "Root chakra grounding",
      "Enhanced creativity",
      "Emotional well-being",
      "Reduced mental clutter",
      "Better focus & clarity",
      "Promotes restful energy",
    ],
    dark: true,
  },
  {
    id: "mental",
    emoji: "🧠", stat: "40%", statLabel: "Less Stress",
    title: "Mental Well-being",
    desc: "The psychological impact of fresh bedding is profound — reducing stress, creating luxury.",
    bullets: [
      "Reduces anxiety levels",
      "Improves mood daily",
      "Better morning routines",
      "Promotes deeper sleep",
      "Lowers cortisol response",
      "Creates a luxury feel",
    ],
    dark: false,
  },
];

// ── Cloudinary image slot ─────────────────────────────────────────────────────
// Admin can set images via localStorage key `scienceCardImage_${card.id}`
function CardImage({ cardId, isDark }) {
  const storageKey = `scienceCardImage_${cardId}`;
  const [imgUrl, setImgUrl] = useState(localStorage.getItem(storageKey) || "");

  useEffect(() => {
    const handler = () => setImgUrl(localStorage.getItem(storageKey) || "");
    window.addEventListener("storage", handler);
    const t = setInterval(handler, 1500);
    return () => { window.removeEventListener("storage", handler); clearInterval(t); };
  }, [storageKey]);

  if (imgUrl) {
    return (
      <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl overflow-hidden flex-shrink-0 relative group">
        <img
          src={imgUrl}
          alt="card visual"
          className="w-full h-full object-cover"
        />
        {/* Admin overlay hint */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
          <CameraOutlined style={{ color: "#fff", fontSize: 16 }} />
        </div>
      </div>
    );
  }

  // Placeholder — admin hasn't set an image yet
  return (
    <div
      className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl flex flex-col items-center justify-center flex-shrink-0 cursor-default"
      style={{
        background: isDark ? "rgba(255,255,255,0.08)" : "rgba(168,196,240,0.1)",
        border: isDark ? "1px dashed rgba(255,255,255,0.2)" : "1px dashed rgba(90,143,199,0.3)",
      }}
      title="Admin: set image via scienceCardImage_{id} in localStorage or admin panel"
    >
      <CameraOutlined style={{ color: isDark ? "rgba(168,196,240,0.5)" : "rgba(90,143,199,0.5)", fontSize: 18 }} />
      <span className="text-[9px] mt-1 text-center leading-tight"
        style={{ color: isDark ? "rgba(168,196,240,0.4)" : "rgba(90,143,199,0.4)" }}
      >
        Add Image
      </span>
    </div>
  );
}

// ── Card component ────────────────────────────────────────────────────────────
function Card({ card, delay, isExpanded, onToggle, isMobile }) {
  const isDark = card.dark;

  // Mobile accordion view
  if (isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 24 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ once: true }}
        onClick={onToggle}
        className="rounded-2xl overflow-hidden cursor-pointer"
        style={{
          background: isExpanded 
            ? (isDark ? BLUE : "#ffffff") 
            : (isDark ? "linear-gradient(135deg,#0F172A,#1E3A8A)" : "#ffffff"),
          boxShadow: isExpanded 
            ? (isDark ? "0 16px 48px rgba(42,95,199,0.35)" : "0 8px 32px rgba(90,130,200,0.13)")
            : (isDark ? "0 8px 24px rgba(15,23,42,0.3)" : "0 4px 16px rgba(90,130,200,0.08)"),
          border: isExpanded 
            ? (isDark ? "none" : "1px solid rgba(168,196,240,0.35)") 
            : (isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(168,196,240,0.2)"),
          transition: "all 0.3s ease",
        }}
      >
        {/* Header - Always visible */}
        <div className="p-4 flex items-center justify-between gap-3">
          {/* Left: icon + title */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{
                background: isExpanded 
                  ? (isDark ? "rgba(255,255,255,0.15)" : "rgba(168,196,240,0.15)")
                  : (isDark ? "rgba(255,255,255,0.1)" : "rgba(168,196,240,0.1)"),
                border: isExpanded
                  ? (isDark ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(168,196,240,0.3)")
                  : (isDark ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(168,196,240,0.2)"),
              }}
            >
              {card.emoji}
            </div>
            <h3 
              className="text-sm font-bold leading-tight truncate" 
              style={{ color: (isExpanded ? (isDark ? "#fff" : "#0f2a52") : (isDark ? "#ffffff" : "#0f2a52")) }}
            >
              {card.title}
            </h3>
          </div>

          {/* Right: Image */}
          <div className="flex-shrink-0">
            <CardImage cardId={card.id} isDark={(isExpanded && isDark) || (!isExpanded && isDark)} />
          </div>
        </div>

        {/* Expandable content */}
        <motion.div
          initial={false}
          animate={{
            height: isExpanded ? "auto" : 0,
            opacity: isExpanded ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{ overflow: "hidden" }}
        >
          <div className="px-4 pb-4">
            {/* Stat */}
            <div className="flex items-baseline gap-1 mb-2">
              <span 
                className="text-lg font-bold leading-none" 
                style={{ color: isExpanded ? (isDark ? "#a8c4f0" : "#2a5fc7") : "#2a5fc7" }}
              >
                {card.stat}
              </span>
              <span 
                className="text-xs font-medium" 
                style={{ color: isExpanded ? (isDark ? "rgba(168,196,240,0.7)" : "#6a8aaa") : "#6a8aaa" }}
              >
                {card.statLabel}
              </span>
            </div>

            {/* Description */}
            <p 
              className="text-xs leading-relaxed mb-3" 
              style={{ color: isExpanded ? (isDark ? "rgba(247, 244, 244, 1)" : "#01172dff") : "#01172dff" }}
            >
              {card.desc}
            </p>

            {/* Bullets */}
            <ul className="space-y-1.5">
              {card.bullets.map((b, i) => (
                <motion.li
                  key={i}
                  className="flex items-start gap-1.5 text-xs"
                  style={{ color: isExpanded ? (isDark ? "rgba(246, 242, 242, 1)" : "#022f5cff") : "#022f5cff" }}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-[3px]"
                    style={{ background: isExpanded ? (isDark ? "#ffffffff" : "#2a5fc7ff") : "#2a5fc7ff" }}
                  />
                  {b}
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Desktop view - unchanged
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88, y: 24 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className="rounded-2xl p-4 sm:p-5 flex flex-col h-full"
      style={{
        background: isDark ? BLUE : "#ffffff",
        boxShadow: isDark ? "0 16px 48px rgba(42,95,199,0.35)" : "0 8px 32px rgba(90,130,200,0.13)",
        border: isDark ? "none" : "1px solid rgba(168,196,240,0.35)",
      }}
    >
      {/* ── Top row: icon + title inline (left) | stat + image (right) ── */}
      <div className="flex items-start justify-between gap-3 mb-3">

        {/* Left: icon bubble + title stacked */}
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0"
            style={{
              background: isDark ? "rgba(255,255,255,0.15)" : "rgba(168,196,240,0.15)",
              border: isDark ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(168,196,240,0.3)",
            }}
          >
            {card.emoji}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold leading-tight" style={{ color: isDark ? "#fff" : "#0f2a52" }}>
              {card.title}
            </h3>
            {/* Stat inline under title */}
            <div className="flex items-baseline gap-1 mt-0">
              <span className="text-base sm:text-lg font-bold leading-none" style={{ color: isDark ? "#a8c4f0" : "#2a5fc7" }}>
                {card.stat}
              </span>
              <span className="text-[10px] font-medium" style={{ color: isDark ? "rgba(168,196,240,0.7)" : "#6a8aaa" }}>
                {card.statLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Cloudinary image slot */}
        <CardImage cardId={card.id} isDark={isDark} />
      </div>

      {/* Description */}
      <p className="text-xs leading-relaxed mb-3" style={{ color: isDark ? "rgba(247, 244, 244, 1)" : "#01172dff" }}>
        {card.desc}
      </p>

      {/* Bullets — left aligned, 2-column grid on wider cards */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5 flex-1">
        {card.bullets.map((b, i) => (
          <motion.li
            key={i}
            className="flex items-start gap-1.5 text-xs"
            style={{ color: isDark ? "rgba(246, 242, 242, 1)" : "#022f5cff" }}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: delay + 0.3 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-[3px]"
              style={{ background: isDark ? "#ffffffff" : "#2a5fc7ff" }}
            />
            {b}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

// ── SVG branch helpers ────────────────────────────────────────────────────────
function DrawLine({ x1, y1, x2, y2, delay = 0 }) {
  const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  return (
    <motion.line x1={x1} y1={y1} x2={x2} y2={y2}
      stroke="rgba(90,143,199,0.45)" strokeWidth="1.5"
      strokeDasharray={len} strokeDashoffset={len}
      animate={{ strokeDashoffset: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}

function Dot({ cx, cy, delay = 0 }) {
  return (
    <motion.circle cx={cx} cy={cy} r={4} fill="#3a7bd5"
      initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, delay, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function ScienceBehindSection({ embedded = false }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleToggle = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const content = (
    <div className={`relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 ${embedded ? "" : "py-12 sm:py-16 lg:py-20"}`}>

      {/* Standalone header */}
      {!embedded && (
        <motion.div
          className="text-center mb-10 sm:mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-3"
            style={{ borderColor: "rgba(90,143,199,0.3)", background: "rgba(168,196,240,0.12)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#5a8fc7" }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#3a6fa0" }}>
              The Science Behind It
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold" style={{ color: "#0f2a52" }}>
            Why Clean Bedding{" "}
            <span style={{ background: "linear-gradient(135deg,#2a5fc7,#5a8fc7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Changes Everything
            </span>
          </h2>
          <p className="mt-2 text-sm sm:text-base max-w-xl mx-auto" style={{ color: "#4a6a8a" }}>
            Backed by research — the impact of fresh bedding goes far beyond comfort.
          </p>
        </motion.div>
      )}

      {/* Branch layout */}
      <div ref={ref} className="relative">
        {/* SVG branch lines — desktop only */}
        <div className="hidden sm:block absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
          <svg viewBox="0 0 1000 520" preserveAspectRatio="none" className="w-full h-full" style={{ overflow: "visible" }}>
            {inView && (
              <g>
                <DrawLine x1={500} y1={130} x2={500} y2={390} delay={0.1} />
                <DrawLine x1={250} y1={130} x2={750} y2={130} delay={0.3} />
                <DrawLine x1={250} y1={390} x2={750} y2={390} delay={0.5} />
                <DrawLine x1={250} y1={130} x2={250} y2={390} delay={0.7} />
                <DrawLine x1={750} y1={130} x2={750} y2={390} delay={0.7} />
                <Dot cx={500} cy={130} delay={0.35} />
                <Dot cx={500} cy={390} delay={0.55} />
                <Dot cx={250} cy={130} delay={0.4} />
                <Dot cx={750} cy={130} delay={0.4} />
                <Dot cx={250} cy={390} delay={0.75} />
                <Dot cx={750} cy={390} delay={0.75} />
              </g>
            )}
          </svg>
        </div>

        {/* Cards grid */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8" style={{ zIndex: 1 }}>
          {cards.map((card, i) => (
            <Card 
              key={card.id} 
              card={card} 
              delay={0.4 + i * 0.15}
              isExpanded={expandedIndex === i}
              onToggle={() => handleToggle(i)}
              isMobile={isMobile}
            />
          ))}
        </div>
      </div>
    </div>
  );

  if (embedded) return content;

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(160deg,#dce8f8 0%,#e8f0fb 40%,#f0f6ff 70%,#e4eefb 100%)" }}
    >
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(168,196,240,0.25) 0%, transparent 70%)" }}
      />
      {content}
    </section>
  );
}
