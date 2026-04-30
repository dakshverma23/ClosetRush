import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { CheckOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Card: alternating blue/white — even index = blue, odd = white
function PricingCard({ t, index, compact = false, onChoose }) {
  const isBlue = index % 2 === 0;
  const p = compact ? "p-4" : "p-6";

  return (
    <div className="relative h-full">
      {t.popular && !isBlue && (
        <div className="absolute -inset-px rounded-2xl pointer-events-none"
          style={{ background: "linear-gradient(180deg,rgba(168,196,240,0.6),rgba(90,143,199,0.3))" }}
        />
      )}
      <motion.div
        className={`relative rounded-2xl h-full flex flex-col ${p}`}
        style={isBlue ? {
          background: "linear-gradient(145deg,#1a3a8a 0%,#2a5fc7 60%,#3a7bd5 100%)",
          boxShadow: "0 12px 40px rgba(42,95,199,0.3)",
          border: "1px solid rgba(168,196,240,0.3)"
        } : {
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          border: t.popular ? "1px solid transparent" : "1px solid rgba(168,196,240,0.3)",
          boxShadow: t.popular ? "0 8px 32px rgba(90,143,199,0.2)" : "0 4px 20px rgba(90,143,199,0.08)"
        }}
        whileHover={{ y: -5, scale: 1.02 }}
        transition={{ duration: 0.22 }}
      >
        {t.popular && (
          <div className={`absolute ${compact ? "top-2 right-2" : "top-4 right-4"}`}>
            <span className={`font-bold rounded-full ${compact ? "text-[9px] px-2 py-0.5" : "text-xs px-2.5 py-1"}`}
              style={isBlue
                ? { background: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }
                : { background: "linear-gradient(135deg,#a8c4f0,#6b9fd4)", color: "#0f2a52" }
              }
            >
              Best Value
            </span>
          </div>
        )}

        {/* Duration */}
        <div className={`font-semibold uppercase tracking-widest ${compact ? "text-[9px] mb-2" : "text-xs mb-3"}`}
          style={{ color: isBlue ? "rgba(168,196,240,0.7)" : "rgba(90,143,199,0.6)" }}
        >
          {t.duration}
        </div>

        {/* Title */}
        <h3 className={`font-bold ${compact ? "text-sm mb-2" : "text-xl mb-3"}`}
          style={{ color: isBlue ? "#ffffff" : "#0f2a52" }}
        >
          {t.label}
        </h3>

        {/* Price */}
        <div className="mb-2">
          <span className={`font-bold ${compact ? "text-xl" : "text-4xl"}`}
            style={{ color: isBlue ? "#ffffff" : "#0f2a52" }}
          >
            ₹{t.price.toLocaleString()}
          </span>
          {t.original && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`line-through ${compact ? "text-[10px]" : "text-sm"}`}
                style={{ color: isBlue ? "rgba(168,196,240,0.5)" : "rgba(90,143,199,0.4)" }}
              >
                ₹{t.original.toLocaleString()}
              </span>
              <span className={`font-semibold ${compact ? "text-[9px]" : "text-xs"}`}
                style={{ color: isBlue ? "#a8e6cf" : "#10b981" }}
              >
                {t.discount}
              </span>
            </div>
          )}
        </div>

        <div className={`w-full h-px ${compact ? "my-2.5" : "my-4"}`}
          style={{ background: isBlue ? "rgba(255,255,255,0.15)" : "rgba(168,196,240,0.2)" }}
        />

        {/* Features */}
        <ul className={`flex-1 ${compact ? "space-y-1.5 mb-3" : "space-y-2.5 mb-6"}`}>
          {t.features.map((f, j) => (
            <li key={j} className={`flex items-start gap-2 ${compact ? "text-[10px]" : "text-sm"}`}
              style={{ color: isBlue ? "rgba(255,255,255,0.85)" : "#4a6a8a" }}
            >
              <div className={`rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${compact ? "w-3 h-3" : "w-4 h-4"}`}
                style={isBlue
                  ? { background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)" }
                  : { background: "rgba(58,123,213,0.1)", border: "1px solid rgba(58,123,213,0.2)" }
                }
              >
                <CheckOutlined style={{ fontSize: compact ? 6 : 8, color: isBlue ? "#fff" : "#3a7bd5" }} />
              </div>
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <motion.button
          className={`w-full rounded-xl font-semibold ${compact ? "py-2 text-xs" : "py-3 text-sm"}`}
          style={isBlue ? {
            background: "rgba(255,255,255,0.18)",
            border: "1px solid rgba(255,255,255,0.3)",
            color: "#ffffff"
          } : {
            background: "linear-gradient(135deg,#a8c4f0,#6b9fd4)",
            color: "#0f2a52",
            boxShadow: "0 4px 16px rgba(168,196,240,0.3)"
          }}
          whileHover={{ scale: 1.02, background: isBlue ? "rgba(255,255,255,0.25)" : undefined }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onChoose(t)}
        >
          Choose {t.label}
        </motion.button>
      </motion.div>
    </div>
  );
}

export default function PricingSection() {
  const [visiblePair, setVisiblePair] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleChoosePlan = (tier) => {
    if (isAuthenticated()) {
      // Navigate to appropriate subscription page based on user type
      if (user?.userType === 'business') {
        navigate('/subscriptions/business');
      } else if (user?.userType === 'individual') {
        navigate('/subscriptions/individual');
      } else {
        // Default to individual subscription page
        navigate('/subscriptions/individual');
      }
    } else {
      // Not logged in, redirect to login page
      navigate('/login');
    }
  };

  useEffect(() => {
    const t = setInterval(() => {
      setDirection(1);
      setVisiblePair(p => (p + 1) % 2);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const switchPair = (i) => {
    setDirection(i > visiblePair ? 1 : -1);
    setVisiblePair(i);
  };

  const tiers = [
    {
      label: "Starter", duration: "1 Month",
      price: " 300**", original: null, discount: null,
      features: ["All bundle features", "Free delivery & pickup", "Flexible scheduling", "Customer support", "24/7 tracking"],
      popular: false
    },
    {
      label: "Growth", duration: "3 Months",
      price: "855**", original: 900, discount: "5% off",
      features: ["Everything in Starter", "Priority support", "Flexible rescheduling", "Quality guarantee", "Express processing"],
      popular: false
    },
    {
      label: "Professional", duration: "6 Months",
      price: "1620**", original: 1800, discount: "10% off",
      features: ["Everything in Growth", "Premium customer care", "Express delivery", "Damage protection", "Free emergency service"],
      popular: true
    },
    {
      label: "Enterprise", duration: "12 Months",
      price: "2880**", original: 3600, discount: "20% off",
      features: ["Everything in Professional", "Dedicated account manager", "Same-day delivery", "Free replacements", "VIP status"],
      popular: false
    }
  ];

  const currentPair = visiblePair === 0 ? [tiers[0], tiers[1]] : [tiers[2], tiers[3]];
  // Global index for colour alternation: pair 0 → indices 0,1; pair 1 → indices 2,3
  const baseIndex = visiblePair * 2;

  return (
    <section className="relative py-8 sm:py-14 overflow-hidden"
      style={{ background: "linear-gradient(160deg,#f0f6ff 0%,#e4eefb 40%,#d8e8f8 70%,#eef4ff 100%)" }}
    >
      {/* Grid pattern */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(90,143,199,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(90,143,199,0.1) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
          opacity: 0.4
        }}
      />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 60% at 50% 40%,rgba(240,246,255,0.88) 0%,transparent 70%)" }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-3"
            style={{ borderColor: "rgba(90,143,199,0.3)", background: "rgba(168,196,240,0.15)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#5a8fc7" }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#3a6fa0" }}>Pricing</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mb-2" style={{ color: "#0f2a52" }}>
            Choose Your{" "}
            <span style={{ background: "linear-gradient(135deg,#3a7bd5,#5a8fc7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Perfect Plan
            </span>
          </h2>

          <p className="text-xs sm:text-sm max-w-md mx-auto mb-4" style={{ color: "#4a6a8a" }}>
            All plans include premium bedding service with professional cleaning.
          </p>

          {/* Dots — mobile only */}
          <div className="flex sm:hidden items-center justify-center gap-2">
            {[0, 1].map(i => (
              <motion.button key={i} onClick={() => switchPair(i)}
                className="rounded-full"
                animate={{ width: i === visiblePair ? 20 : 7, background: i === visiblePair ? "#3a7bd5" : "rgba(90,143,199,0.3)" }}
                transition={{ duration: 0.3 }}
                style={{ height: 7 }}
              />
            ))}
          </div>
        </motion.div>

        {/* ── DESKTOP: all 4 ── */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {tiers.map((t, i) => (
            <motion.div key={t.label}
              initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40, y: 20 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            >
              <PricingCard t={t} index={i} onChoose={handleChoosePlan} />
            </motion.div>
          ))}
        </div>

        {/* ── MOBILE: carousel 2 at a time ── */}
        <div className="sm:hidden relative overflow-hidden mb-6">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={visiblePair}
              custom={direction}
              variants={{
                enter: (d) => ({ opacity: 0, x: d > 0 ? 80 : -80 }),
                center: { opacity: 1, x: 0 },
                exit: (d) => ({ opacity: 0, x: d > 0 ? -80 : 80 })
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-2 gap-3"
            >
              {currentPair.map((t, i) => (
                <motion.div key={t.label}
                  initial={{ opacity: 0, x: i === 0 ? -30 : 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  <PricingCard t={t} index={baseIndex + i} compact onChoose={handleChoosePlan} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Savings bar ── */}
        <motion.div
          className="rounded-2xl p-4 sm:p-6 max-w-3xl mx-auto"
          style={{
            border: "1px solid rgba(168,196,240,0.25)",
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 4px 20px rgba(90,143,199,0.1)"
          }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <p className="text-center text-[10px] sm:text-xs mb-3 uppercase tracking-widest font-semibold"
            style={{ color: "rgba(90,143,199,0.5)" }}
          >
            Savings at a glance
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {tiers.map((t, i) => (
              <div key={i} className="text-center p-2.5 sm:p-3 rounded-xl"
                style={{ background: "rgba(168,196,240,0.08)", border: "1px solid rgba(168,196,240,0.15)" }}
              >
                <div className="text-[9px] sm:text-xs mb-1 uppercase tracking-wider" style={{ color: "rgba(90,143,199,0.5)" }}>
                  {t.label}
                </div>
                <div className="text-base sm:text-xl font-bold mb-0.5" style={{ color: "#0f2a52" }}>
                  ₹{t.price.toLocaleString()}
                </div>
                {t.discount
                  ? <div className="text-[9px] sm:text-xs font-semibold" style={{ color: "#10b981" }}>{t.discount}</div>
                  : <div className="text-[9px] sm:text-xs" style={{ color: "rgba(90,143,199,0.3)" }}>Standard</div>
                }
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
