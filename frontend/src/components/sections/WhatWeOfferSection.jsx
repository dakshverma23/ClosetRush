import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { CheckOutlined, ArrowRightOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const BLUE_BG = "linear-gradient(145deg,#1a3a8a 0%,#2a5fc7 60%,#3a7bd5 100%)";
const BLUE_SHADOW = "0 12px 40px rgba(42,95,199,0.25)";

const cardVariants = {
  tl: { hidden: { opacity: 0, x: -40, scale: 0.94 }, show: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } } },
  tr: { hidden: { opacity: 0, y: -40, scale: 0.94 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] } } },
  bl: { hidden: { opacity: 0, x: -30, y: 40, scale: 0.94 }, show: { opacity: 1, x: 0, y: 0, scale: 1, transition: { duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] } } },
  br: { hidden: { opacity: 0, x: 40, scale: 0.94 }, show: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.65, delay: 0.3, ease: [0.22, 1, 0.36, 1] } } },
};

const fieldVariants = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  show: (i) => ({ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.3, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] } }),
  exit: (i) => ({ opacity: 0, y: -8, filter: "blur(4px)", transition: { duration: 0.18, delay: i * 0.03 } }),
};

const otherBundles = [
  { icon: "🏨", tag: "Most Popular", title: "Business Solutions", subtitle: "Hotels & properties", price: "Custom", period: "pricing", features: ["Bulk management", "Priority processing", "Account manager"], popular: true },
  { icon: "👑", tag: "Premium", title: "Premium Bundles", subtitle: "Luxury experience", price: "₹1,299", period: "/month", features: ["Premium fabrics", "Curtains & towels", "Express delivery"], popular: false },
  { icon: "🛏️", tag: "Double Bed", title: "Double Bed Plan", subtitle: "Couples & families", price: "₹699", period: "/month", features: ["Double bedsheets", "4 pillow covers", "Free delivery"], popular: false },
];

export default function WhatWeOfferSection() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [videoUrl, setVideoUrl] = useState(localStorage.getItem("offerVideo") || "");

  const handleSubscribe = () => {
    if (!isAuthenticated()) { navigate("/register"); return; }
    if (user?.userType === "business") navigate("/business/subscriptions");
    else navigate("/subscriptions");
  };

  useEffect(() => {
    if (isPaused) return; // Don't run interval when paused
    const t = setInterval(() => setCurrent(p => (p + 1) % otherBundles.length), 4000);
    return () => clearInterval(t);
  }, [isPaused]); // Re-run effect when isPaused changes

  useEffect(() => {
    const handler = () => setVideoUrl(localStorage.getItem("offerVideo") || "");
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const bundle = otherBundles[current];

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(160deg,#f0f6ff 0%,#e4eefb 40%,#d8e8f8 70%,#eef4ff 100%)", padding: "20px 0" }}
    >
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 50%,rgba(168,196,240,0.2) 0%,transparent 70%)" }}
      />

      <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div className="flex items-center justify-between mb-3"
          initial="hidden" whileInView="show" variants={cardVariants.tl} viewport={{ once: true }}
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-1"
              style={{ borderColor: "rgba(90,143,199,0.3)", background: "rgba(168,196,240,0.15)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#5a8fc7" }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#3a6fa0" }}>What We Offer</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-bold tracking-tight" style={{ color: "#0f2a52" }}>
              Fresh Bedding,{" "}
              <span style={{ background: "linear-gradient(135deg,#3a7bd5,#5a8fc7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Your Way
              </span>
            </h2>
          </div>
          <p className="text-sm max-w-xs text-right hidden md:block" style={{ color: "#4a6a8a" }}>
            Professional service, delivered to your door.
          </p>
        </motion.div>

        {/* 2×2 Grid — explicit row heights so all 4 cells are identical */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "var(--card-h, 280px) var(--card-h, 280px)",
          gap: "10px",
        }}
          className="bento-grid"
        >

          {/* ── CARD 1: Individual Plan (blue) ── */}
          <motion.div
            initial="hidden" whileInView="show" variants={cardVariants.tl} viewport={{ once: true }}
            className="rounded-xl sm:rounded-2xl relative overflow-hidden"
            style={{ background: BLUE_BG, boxShadow: BLUE_SHADOW }}
            whileHover={{ scale: 1.012, transition: { duration: 0.22 } }}
          >
            {/* star particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div key={i} className="absolute rounded-full bg-white"
                style={{ width: 2, height: 2, left: `${8 + i * 14}%`, top: `${10 + (i % 3) * 28}%`, opacity: 0.2 }}
                animate={{ opacity: [0.3, 0.4, 0.3] }}
                transition={{ duration: 2.5 + i * 0.3, repeat: Infinity }}
              />
            ))}

            {/* inner flex — fills card exactly */}
            <div className="absolute inset-0 flex flex-col p-3 sm:p-5">
              {/* top content */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full mb-1.5 sm:mb-2"
                  style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}
                >
                  <span className="text-[9px] sm:text-xs font-semibold text-white">🏠 Individual Plan</span>
                </div>

                <h3 className="text-xs sm:text-lg font-bold text-white leading-tight mb-1">
                  Hygiene at just <span style={{ color: "#a8c4f0" }}>₹10/day.</span>
                </h3>

                <p className="text-[9px] sm:text-xs mb-1.5 sm:mb-2 leading-snug" style={{ color: "rgba(255,255,255,0.65)" }}>
                  Fresh bedsheet + pillow covers monthly. Free pickup & delivery.
                </p>

                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mb-1.5 sm:mb-2">
                  {[["🛏️","Single Bed"],["🧼","Pro Clean"],["🚚","Free Del."],["🔄","Monthly"]].map(([icon, label], i) => (
                    <div key={i} className="flex items-center gap-1">
                      <span className="text-[9px] sm:text-[11px]">{icon}</span>
                      <span className="text-[9px] sm:text-xs truncate" style={{ color: "rgba(255,255,255,0.8)" }}>{label}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-base sm:text-2xl font-bold text-white">₹299</span>
                  <span className="text-[9px] sm:text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>/mo</span>
                  <span className="text-[8px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded-full"
                    style={{ background: "rgba(168,196,240,0.25)", color: "#ffffffff" }}
                  ></span>
                </div>
              </div>

              {/* CTA pinned to bottom */}
              <motion.button
                onClick={handleSubscribe}
                className="w-full py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-semibold text-[10px] sm:text-xs flex items-center justify-center gap-1 text-white mt-2 flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
                whileHover={{ background: "rgba(255,255,255,0.22)" }}
                whileTap={{ scale: 0.97 }}
              >
                Get Started <ArrowRightOutlined style={{ fontSize: 8 }} />
              </motion.button>
            </div>
          </motion.div>

          {/* ── CARD 2: Video / Flip board ── */}
          <motion.div
            initial="hidden" whileInView="show" variants={cardVariants.tr} viewport={{ once: true }}
            className="rounded-xl sm:rounded-2xl relative overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.75)",
              border: "1px solid rgba(168,196,240,0.35)",
              boxShadow: "0 4px 20px rgba(90,143,199,0.1)",
              backdropFilter: "blur(16px)",
            }}
            whileHover={{ scale: 1.012, transition: { duration: 0.22 } }}
          >
            {videoUrl ? (
              <>
                <video src={videoUrl} autoPlay muted loop playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg text-[9px] sm:text-xs font-semibold text-white"
                  style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
                >
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col p-2 sm:p-5 overflow-hidden">
                <p className="text-[10px] sm:text-base font-bold mb-1 sm:mb-3 leading-tight flex-shrink-0" style={{ color: "#0f2a52" }}>
                  Delivered so far...
                </p>
                {/* Flip letters — sized to fill available space */}
                <div className="flex justify-center gap-1 sm:gap-2 flex-1 min-h-0 items-center">
                  {["R","O","L","D"].map((letter, i) => (
                    <motion.div key={i}
                      className="flex-1 max-w-[22%] aspect-square rounded-md sm:rounded-lg flex items-center justify-center font-bold text-sm sm:text-2xl text-white"
                      style={{ background: "linear-gradient(145deg,#1a1a2e,#2d2d44)", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
                      animate={{ rotateX: [0, 90, 0] }}
                      transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      {letter}
                    </motion.div>
                  ))}
                </div>
                <p className="text-[8px] sm:text-xs leading-snug mt-1 sm:mt-3 flex-shrink-0" style={{ color: "#4a6a8a" }}>
                  Built on trust — custom-made bedsheets.
                </p>
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] sm:text-xs font-semibold text-white mt-1 flex-shrink-0"
                  style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", alignSelf: "flex-start" }}
                >
                  <PlayCircleOutlined style={{ fontSize: 9 }} />
                  ClosetRush in Action
                </div>
              </div>
            )}
          </motion.div>

          {/* ── CARD 3: Other Bundles carousel ── */}
          <motion.div
            initial="hidden" whileInView="show" variants={cardVariants.bl} viewport={{ once: true }}
            className="rounded-xl sm:rounded-2xl relative overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.82)",
              border: "1px solid rgba(168,196,240,0.3)",
              boxShadow: "0 4px 20px rgba(90,143,199,0.08)",
              backdropFilter: "blur(16px)",
            }}
            whileHover={{ scale: 1.012, transition: { duration: 0.22 } }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="absolute inset-0 flex flex-col p-2 sm:p-5">
              {/* header + dots */}
              <div className="flex items-center justify-between mb-1 sm:mb-2 flex-shrink-0">
                <h3 className="text-[9px] sm:text-sm font-bold" style={{ color: "#0f2a52" }}>Other Bundles</h3>
                <div className="flex gap-1">
                  {otherBundles.map((_, i) => (
                    <motion.button key={i} onClick={() => setCurrent(i)}
                      className="rounded-full"
                      animate={{ width: i === current ? 14 : 4, background: i === current ? "#3a7bd5" : "rgba(90,143,199,0.3)" }}
                      transition={{ duration: 0.3 }}
                      style={{ height: 4 }}
                    />
                  ))}
                </div>
              </div>

              {/* animated content */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div key={current} className="flex flex-col h-full w-full">

                    <motion.div className="flex items-center justify-between mb-1"
                      custom={0} variants={fieldVariants} initial="hidden" animate="show" exit="exit"
                    >
                      <span className="text-[7px] sm:text-xs font-semibold px-1.5 py-0.5 rounded-full leading-none"
                        style={bundle.popular
                          ? { background: "rgba(58,123,213,0.1)", color: "#3a7bd5", border: "1px solid rgba(58,123,213,0.2)" }
                          : { background: "rgba(168,196,240,0.12)", color: "#5a8fc7", border: "1px solid rgba(168,196,240,0.25)" }
                        }
                      >{bundle.tag}</span>
                      <span className="text-base sm:text-xl leading-none">{bundle.icon}</span>
                    </motion.div>

                    <motion.h4
                      className="text-[9px] sm:text-base font-bold leading-tight mb-0"
                      style={{ color: "#0f2a52", lineHeight: 1.1 }}
                      custom={1} variants={fieldVariants} initial="hidden" animate="show" exit="exit"
                    >{bundle.title}</motion.h4>

                    <motion.p
                      className="text-[7px] sm:text-xs mb-0.5"
                      style={{ color: "#6a8aaa", lineHeight: 1.2 }}
                      custom={2} variants={fieldVariants} initial="hidden" animate="show" exit="exit"
                    >{bundle.subtitle}</motion.p>

                    <motion.div className="flex items-baseline gap-1 mb-0.5"
                      custom={3} variants={fieldVariants} initial="hidden" animate="show" exit="exit"
                    >
                      <span className="text-xs sm:text-xl font-bold leading-none" style={{ color: "#0f2a52" }}>{bundle.price}</span>
                      <span className="text-[7px] sm:text-xs leading-none" style={{ color: "#6a8aaa" }}>{bundle.period}</span>
                    </motion.div>

                    <ul className="space-y-0.5 sm:space-y-1 flex-1 min-h-0 overflow-hidden w-full">
                      {bundle.features.map((f, i) => (
                        <motion.li
                          key={`${current}-${i}`}
                          className="flex items-center gap-1 text-[7px] sm:text-xs leading-none"
                          style={{ color: "#4a6a8a" }}
                          custom={4 + i} variants={fieldVariants} initial="hidden" animate="show" exit="exit"
                        >
                          <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: "rgba(58,123,213,0.08)", border: "1px solid rgba(58,123,213,0.18)" }}
                          >
                            <CheckOutlined style={{ fontSize: 5, color: "#3a7bd5" }} />
                          </div>
                          {f}
                        </motion.li>
                      ))}
                    </ul>

                    <motion.button
                      onClick={handleSubscribe}
                      className="w-full py-1 sm:py-2 rounded-lg sm:rounded-xl font-semibold text-[8px] sm:text-xs flex items-center justify-center gap-1 mt-1 sm:mt-2 flex-shrink-0"
                      style={{ background: "linear-gradient(135deg,#a8c4f0,#6b9fd4)", color: "#0f2a52" }}
                      custom={7} variants={fieldVariants} initial="hidden" animate="show" exit="exit"
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    >
                      Choose Plan <ArrowRightOutlined style={{ fontSize: 7 }} />
                    </motion.button>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* ── CARD 4: Other Offers (blue) ── */}
          <motion.div
            initial="hidden" whileInView="show" variants={cardVariants.br} viewport={{ once: true }}
            className="rounded-xl sm:rounded-2xl relative overflow-hidden"
            style={{ background: BLUE_BG, boxShadow: BLUE_SHADOW }}
            whileHover={{ scale: 1.012, transition: { duration: 0.22 } }}
          >
            {[...Array(5)].map((_, i) => (
              <motion.div key={i} className="absolute rounded-full bg-white"
                style={{ width: 2, height: 2, left: `${12 + i * 16}%`, top: `${8 + (i % 3) * 30}%`, opacity: 0.15 }}
                animate={{ opacity: [0.08, 0.35, 0.08] }}
                transition={{ duration: 3 + i * 0.4, repeat: Infinity }}
              />
            ))}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle,rgba(168,196,240,0.15),transparent 70%)" }}
            />

            <div className="absolute inset-0 flex flex-col p-2 sm:p-5">
              <div className="flex-shrink-0 mb-1 sm:mb-2">
                <h3 className="text-[9px] sm:text-base font-bold text-white leading-tight">Other Offers</h3>
                <p className="text-[7px] sm:text-xs" style={{ color: "rgba(168,196,240,0.7)" }}>
                  Full range of bedding solutions.
                </p>
              </div>

              <div className="flex-1 min-h-0 flex flex-col justify-between">
                <div className="space-y-1 sm:space-y-2">
                  {[
                    { icon: "🏨", label: "Business Solutions", sub: "Hotels & properties", price: "Custom" },
                    { icon: "👑", label: "Premium Bundles",    sub: "Luxury experience",   price: "₹1,299/mo" },
                    { icon: "🛏️", label: "Double Bed Plan",   sub: "Couples & families",  price: "₹699/mo" },
                  ].map((item, i) => (
                    <motion.div key={i}
                      className="flex items-center justify-between px-1.5 py-1 sm:p-2.5 rounded-lg sm:rounded-xl cursor-pointer"
                      style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(168,196,240,0.15)" }}
                      whileHover={{ background: "rgba(255,255,255,0.14)", x: 3, transition: { duration: 0.18 } }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleSubscribe}
                    >
                      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                        <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-md sm:rounded-lg flex items-center justify-center text-[10px] sm:text-sm flex-shrink-0"
                          style={{ background: "rgba(168,196,240,0.15)", border: "1px solid rgba(168,196,240,0.2)" }}
                        >
                          {item.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[7px] sm:text-xs font-semibold text-white leading-tight truncate">{item.label}</div>
                          <div className="text-[6px] sm:text-xs leading-tight truncate" style={{ color: "rgba(168,196,240,0.55)" }}>{item.sub}</div>
                        </div>
                      </div>
                      <div className="text-[7px] sm:text-xs font-bold flex-shrink-0 ml-1" style={{ color: "#a8c4f0" }}>{item.price}</div>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  onClick={handleSubscribe}
                  className="w-full py-1 sm:py-2 rounded-lg sm:rounded-xl font-semibold text-[8px] sm:text-xs flex items-center justify-center gap-1 mt-1 sm:mt-2 text-white flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
                  whileHover={{ background: "rgba(255,255,255,0.22)" }}
                  whileTap={{ scale: 0.97 }}
                >
                  Discover All Plans <ArrowRightOutlined style={{ fontSize: 7 }} />
                </motion.button>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
