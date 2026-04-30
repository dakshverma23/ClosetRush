import { motion } from "framer-motion";
import { Button } from "antd";
import { ArrowRightOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";

const FALLBACK_IMAGE = "/images/bedroom-hero.jpg";

export default function HeroSection() {
  const [heroImage, setHeroImage] = useState(
    localStorage.getItem("heroImage") || FALLBACK_IMAGE
  );

  // Listen for admin updates
  useEffect(() => {
    const handler = () =>
      setHeroImage(localStorage.getItem("heroImage") || FALLBACK_IMAGE);
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background — from Cloudinary or fallback */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${heroImage}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-transparent" />

      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* ── Left Content ── */}
          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >


            {/* ── Headline ── */}
            <motion.div
              className="mb-5 inline-block px-4 py-3 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.3)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <h1 style={{ lineHeight: 1.12 }}>
                {/* "Hygiene @" — medium weight, not chunky */}
                <span
                  className="block text-slate-700"
                  style={{
                    fontSize: "clamp(1.6rem, 3.8vw, 3.2rem)",
                    fontWeight: 400,
                    letterSpacing: "0.01em",
                  }}
                >
                  Hygiene @
                </span>

                {/* "just ₹10" — the hero, bold gradient */}
                <span
                  className="block"
                  style={{
                    fontSize: "clamp(2.6rem, 6.5vw, 5.5rem)",
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    background: "linear-gradient(135deg, #1a3a8a 0%, #2a5fc7 50%, #5a8fc7 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  just ₹10**
                </span>

                {/* "per day." — light, airy */}
                <span
                  className="block text-slate-600"
                  style={{
                    fontSize: "clamp(1.2rem, 2.5vw, 2rem)",
                    fontWeight: 300,
                    letterSpacing: "0.02em",
                  }}
                >
                  per day.
                </span>

                {/* "with ClosetRush" — small attribution below */}
                <span
                  className="block mt-2"
                  style={{
                    fontSize: "clamp(0.65rem, 1vw, 0.78rem)",
                    fontWeight: 600,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "#021d3bff",
                  }}
                >
                  with ClosetRush
                </span>
              </h1>
            </motion.div>

            {/* ── Buttons ── */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <Button
                type="primary"
                size="large"
                icon={<ArrowRightOutlined />}
                className="border-0 font-semibold hover:scale-105 transition-all duration-300 shadow-lg rounded-xl"
                style={{
                  height: 48,
                  paddingInline: 28,
                  fontSize: 15,
                  background: "linear-gradient(135deg, #1a3a8a, #2a5fc7)",
                }}
              >
                Start Your Subscription
              </Button>

              <Button
                size="large"
                icon={<PlayCircleOutlined />}
                className="font-medium hover:scale-105 transition-all duration-300 rounded-xl"
                style={{
                  height: 48,
                  paddingInline: 24,
                  fontSize: 15,
                  background: "rgba(255,255,255,0.7)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(90,143,199,0.4)",
                  color: "#2a5fc7",
                }}
              >
                Watch How It Works
              </Button>
            </motion.div>

            {/* ── Trust pills — compact, all in one row ── */}
            <motion.div
              className="flex flex-wrap gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
            >
              {[
                { icon: "🚚", label: "Free", sub: "Delivery" },
                { icon: "🔄", label: "Cancel", sub: "Anytime" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-xl px-4 py-2 hover:scale-105 transition-all duration-300"
                  style={{
                    background: "linear-gradient(135deg, rgba(26,58,138,0.82), rgba(42,95,199,0.75))",
                    border: "1px solid rgba(168,196,240,0.3)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-base"
                    style={{ background: "rgba(168,196,240,0.18)" }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white leading-none">{item.label}</div>
                    <div className="text-xs leading-none mt-0.5" style={{ color: "#a8c4f0" }}>{item.sub}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — empty, lets background breathe */}
          <div className="hidden lg:block" />
        </div>
      </div>
    </section>
  );
}
