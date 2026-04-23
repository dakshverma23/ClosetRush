import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function generateStars(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 1.5 + 0.5,
    opacity: Math.random() * 0.5 + 0.1,
    duration: Math.random() * 4 + 2
  }));
}
const stars = generateStars(60);

export default function CTASection() {
  const ref = useRef(null);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const navigate = useNavigate();

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const beamOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const beamScale  = useTransform(scrollYProgress, [0, 0.3], [0.5, 1]);

  // ── Aurora canvas animation ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Blob definitions — blue/cyan theme
    const blobs = [
      { x: 0.2, y: 0.3, r: 0.45, color: "37,99,235",   speed: 0.00006, phase: 0 },
      { x: 0.7, y: 0.2, r: 0.40, color: "8,145,178",   speed: 0.00007, phase: 1.2 },
      { x: 0.5, y: 0.7, r: 0.50, color: "99,102,241",  speed: 0.00005, phase: 2.4 },
      { x: 0.1, y: 0.8, r: 0.35, color: "14,165,233",  speed: 0.00006, phase: 0.8 },
      { x: 0.85,y: 0.6, r: 0.38, color: "59,130,246",  speed: 0.00005, phase: 3.1 },
    ];

    let t = 0;
    const draw = () => {
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);

      // Dark base
      ctx.fillStyle = "#050810";
      ctx.fillRect(0, 0, w, h);

      // Draw each blob
      blobs.forEach((b) => {
        const ox = Math.sin(t * b.speed * 1000 + b.phase) * 0.12;
        const oy = Math.cos(t * b.speed * 800  + b.phase) * 0.10;
        const cx = (b.x + ox) * w;
        const cy = (b.y + oy) * h;
        const radius = b.r * Math.min(w, h);

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0,   `rgba(${b.color}, 0.35)`);
        grad.addColorStop(0.5, `rgba(${b.color}, 0.12)`);
        grad.addColorStop(1,   `rgba(${b.color}, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Noise/grain overlay via tiny dots
      ctx.save();
      ctx.globalAlpha = 0.018;
      for (let i = 0; i < 800; i++) {
        const nx = Math.random() * w;
        const ny = Math.random() * h;
        ctx.fillStyle = "#fff";
        ctx.fillRect(nx, ny, 1, 1);
      }
      ctx.restore();

      t = performance.now();
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden" style={{ minHeight: "640px" }}>

      {/* ── Aurora Canvas ── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ filter: "blur(40px)", transform: "scale(1.1)" }}
      />

      {/* ── Overlay to sharpen contrast ── */}
      <div className="absolute inset-0 bg-[#050810]/40" />

      {/* ── Stars ── */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {stars.map((s) => (
          <motion.div
            key={s.id}
            className="absolute rounded-full bg-white"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
            animate={{ opacity: [s.opacity, s.opacity * 0.2, s.opacity] }}
            transition={{ duration: s.duration, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* ── Light Beam ── */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none z-10"
        style={{ opacity: beamOpacity, scale: beamScale }}
      >
        <div className="w-[700px] h-[520px]" style={{
          background: "conic-gradient(from 270deg at 50% 100%, transparent 22%, rgba(37,99,235,0.55) 36%, rgba(8,145,178,0.65) 50%, rgba(37,99,235,0.55) 64%, transparent 78%)",
          filter: "blur(3px)"
        }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[180px] h-[280px]" style={{
          background: "conic-gradient(from 270deg at 50% 100%, transparent 32%, rgba(147,197,253,0.9) 46%, rgba(255,255,255,1) 50%, rgba(147,197,253,0.9) 54%, transparent 68%)",
          filter: "blur(1px)"
        }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[60px] rounded-full" style={{
          background: "radial-gradient(ellipse, rgba(37,99,235,0.7) 0%, rgba(8,145,178,0.3) 50%, transparent 70%)",
          filter: "blur(24px)"
        }} />
      </motion.div>

      {/* ── Content ── */}
      <div className="relative z-20 flex flex-col items-center justify-center py-40 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
        >
          <p className="text-slate-400 text-sm font-semibold tracking-[0.3em] uppercase mb-5">
            ClosetRush
          </p>

          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight mb-6">
            Fresh Sleeping<br />
            <span style={{
              background: "linear-gradient(135deg, #a8c4f0, #d4e5ff, #a8c4f0)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              Start Today
            </span>
          </h2>

          <p className="text-lg max-w-md mx-auto mb-12 leading-relaxed" style={{ color: "rgba(168,196,240,0.55)" }}>
            Ready to transform your sleep experience?<br />
            Subscribe now and get fresh bedding delivered monthly.
          </p>

          {/* Glowing pill button */}
          <motion.button
            onClick={() => navigate("/subscriptions")}
            className="relative inline-flex items-center gap-3 px-10 py-4 rounded-full font-semibold text-lg overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #a8c4f0, #6b9fd4)",
              color: "#0f2a52",
              boxShadow: "0 0 0 1px rgba(168,196,240,0.4), 0 0 50px rgba(168,196,240,0.3), 0 0 100px rgba(168,196,240,0.15), inset 0 1px 0 rgba(255,255,255,0.3)"
            }}
            whileHover={{
              scale: 1.1,
              boxShadow: "0 0 0 1px rgba(168,196,240,0.6), 0 0 70px rgba(168,196,240,0.5), 0 0 140px rgba(168,196,240,0.25), inset 0 1px 0 rgba(255,255,255,0.4)"
            }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2 }}
          >
            {/* Shimmer sweep */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
            />
            <span className="relative font-bold">Subscribe Now</span>
            <motion.span
              className="relative font-bold"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              →
            </motion.span>
          </motion.button>

          {/* Trust pills */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-4 mt-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            viewport={{ once: true }}
          >
            {["🚚 Free Delivery", "✨ Pro Cleaning", "🔄 Cancel Anytime"].map((item, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm backdrop-blur-sm"
                style={{
                  border: "1px solid rgba(168,196,240,0.2)",
                  background: "rgba(168,196,240,0.06)",
                  color: "rgba(168,196,240,0.65)"
                }}
              >
                {item}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom fade into newsletter */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#050810] to-transparent z-20 pointer-events-none" />
    </section>
  );
}
