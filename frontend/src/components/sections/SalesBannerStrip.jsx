import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRightOutlined, FireFilled, TagOutlined } from "@ant-design/icons";

// ── Config — change these to update the banner ────────────────────────────────
const BANNER_CONFIG = {
  badge: "🔥 Limited Time Offer",
  headline: " Save upto ₹1200",
  subtext: "Fresh bedsheets delivered to your door. No commitment. Cancel anytime.",
  highlight: "20% off",
  ctaLabel: "Claim Offer Now",
  ctaPath: "/register",          // ← change this later to any route
  secondaryLabel: "View Plans",
  secondaryPath: "/what-we-offer",
};
// ─────────────────────────────────────────────────────────────────────────────

export default function SalesBannerStrip() {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg,#0f2a52 0%,#1a3a8a 40%,#2a5fc7 75%,#3a7bd5 100%)" }}>

      {/* Animated shimmer sweep */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.07) 50%, transparent 65%)",
          backgroundSize: "200% 100%",
        }}
        animate={{ backgroundPositionX: ["200%", "-200%"] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
      />

      {/* Dot grid texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }}
      />

      {/* Floating orbs */}
      <div className="absolute -left-16 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(168,196,240,0.2), transparent 70%)" }}
      />
      <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(168,196,240,0.15), transparent 70%)" }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >

          {/* Left — text content */}
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            {/* Pulsing fire icon */}
            <motion.div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <FireFilled style={{ color: "#fbbf24", fontSize: 18 }} />
            </motion.div>

            <div className="min-w-0">
              {/* Badge */}
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(251,191,36,0.2)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" }}
                >
                  {BANNER_CONFIG.badge}
                </span>
                <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(168,196,240,0.2)", color: "#a8c4f0", border: "1px solid rgba(168,196,240,0.3)" }}
                >
                  <TagOutlined style={{ fontSize: 9, marginRight: 3 }} />
                  {BANNER_CONFIG.highlight}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span className="text-sm sm:text-base font-bold text-white leading-tight truncate">
                  {BANNER_CONFIG.headline}
                </span>
                <span className="hidden sm:inline text-white/30">·</span>
                <span className="text-xs sm:text-sm text-white/60 truncate">
                  {BANNER_CONFIG.subtext}
                </span>
              </div>
            </div>
          </div>

          {/* Right — CTAs */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Secondary */}
            <button
              onClick={() => navigate(BANNER_CONFIG.secondaryPath)}
              className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 hover:bg-white/10"
              style={{ color: "rgba(0, 29, 75, 0.85)", border: "1px solid rgba(168,196,240,0.25)" }}
            >
              {BANNER_CONFIG.secondaryLabel}
            </button>

            {/* Primary CTA */}
            <motion.button
              onClick={() => navigate(BANNER_CONFIG.ctaPath)}
              className="flex items-center gap-1.5 px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200"
              style={{
                background: "linear-gradient(135deg,#fbbf24,#f59e0b)",
                color: "#00112aff",
                boxShadow: "0 4px 16px rgba(251,191,36,0.35)",
              }}
              whileHover={{ scale: 1.05, boxShadow: "0 6px 24px rgba(251,191,36,0.5)" }}
              whileTap={{ scale: 0.97 }}
            >
              {BANNER_CONFIG.ctaLabel}
              <ArrowRightOutlined style={{ fontSize: 10 }} />
            </motion.button>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
