import GermGrowthChart from "../charts/GermGrowthChart";
import ScienceBehindSection from "./ScienceBehindSection";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ArrowRightOutlined, ExperimentOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";

export default function WhatHappensSection() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [showChart, setShowChart] = useState(false);

  const handleSubscribe = () => {
    if (!isAuthenticated()) { navigate("/register"); return; }
    if (user?.userType === "business") navigate("/business/subscriptions");
    else navigate("/subscriptions");
  };

  return (
    <section className="relative bg-white overflow-hidden">
      {/* Seamless connector from section above */}
      <div className="absolute top-0 left-0 right-0 h-16 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, #eef4ff, transparent)" }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8 sm:pt-14 sm:pb-12">

        {/* ── Science Behind It cards (always visible, replaces old "Scientific Analysis" label) ── */}
        <ScienceBehindSection embedded />

        {/* ── "Explore Science Behind It" toggle button ── */}
        <motion.div
          className="flex justify-center mt-8 mb-2"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
        >
          <button
            onClick={() => setShowChart(v => !v)}
            className="group flex items-center gap-2.5 px-6 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 hover:scale-105"
            style={{
              background: showChart
                ? "linear-gradient(135deg,#1a3a8a,#3a7bd5)"
                : "rgba(168,196,240,0.12)",
              color: showChart ? "#ffffff" : "#2a5fc7",
              border: showChart
                ? "1px solid transparent"
                : "1px solid rgba(168,196,240,0.4)",
              boxShadow: showChart ? "0 8px 24px rgba(42,95,199,0.3)" : "none",
            }}
          >
            <ExperimentOutlined style={{ fontSize: 15 }} />
            Explore Science Behind It
            <motion.span
              animate={{ rotate: showChart ? 180 : 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <DownOutlined style={{ fontSize: 11 }} />
            </motion.span>
          </button>
        </motion.div>

        {/* ── Collapsible chart section ── */}
        <AnimatePresence initial={false}>
          {showChart && (
            <motion.div
              key="chart-panel"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 24 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: "hidden" }}
            >
              {/* Scientific Analysis label */}
              <div className="flex items-center gap-2 mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border"
                  style={{ borderColor: "rgba(168,196,240,0.5)", background: "rgba(168,196,240,0.08)" }}
                >
                  <ExperimentOutlined style={{ color: "#5a8fc7", fontSize: 11 }} />
                  <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#5a8fc7" }}>
                    Scientific Analysis
                  </span>
                </div>
                <p className="text-sm hidden sm:block" style={{ color: "#6a8aaa" }}>
                  Bedsheets harbor <span className="font-semibold" style={{ color: "#0f2a52" }}>millions of bacteria</span> within days.
                </p>
              </div>

              {/* Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="mb-6"
              >
                <GermGrowthChart />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CTA Banner ── */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="relative rounded-2xl overflow-hidden"
            style={{ background: "linear-gradient(135deg, #0f2a52 0%, #1a4a8a 50%, #0e3d6e 100%)" }}
          >
            <div className="absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "28px 28px" }}
            />
            <div className="absolute -top-20 right-10 w-72 h-72 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(168,196,240,0.18), transparent 70%)" }}
            />
            <div className="relative p-6 flex flex-col lg:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-1">Ready for Cleaner Sleep?</h3>
                <p style={{ color: "#a8c4f0" }}>Join thousands who've transformed their sleep experience</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 items-center flex-shrink-0">
                <button
                  onClick={handleSubscribe}
                  className="h-12 px-8 font-bold rounded-xl border-0 flex items-center gap-2 transition-all duration-300 hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #a8c4f0, #d4e5ff)", color: "#0f2a52", boxShadow: "0 4px 20px rgba(168,196,240,0.35)" }}
                >
                  Start Subscription <ArrowRightOutlined />
                </button>
                <div className="flex items-center gap-5 text-sm" style={{ color: "rgba(168,196,240,0.7)" }}>
                  <span className="flex items-center gap-1.5"><span style={{ color: "#a8c4f0" }}>✓</span> Free Delivery</span>
                  <span className="flex items-center gap-1.5"><span style={{ color: "#a8c4f0" }}>✓</span> Cancel Anytime</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
