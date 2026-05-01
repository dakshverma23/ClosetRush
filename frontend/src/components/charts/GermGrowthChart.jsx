import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, PieChart, Pie
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { germData } from "../../data/germData";

// ── Helpers ──────────────────────────────────────────────────────────────────
const barColor = (index) => {
  const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];
  return colors[index] || "#3b82f6";
};

const riskColor = (v) => {
  if (v < 30) return "#10b981"; // Green
  if (v < 70) return "#f59e0b"; // Orange
  return "#ef4444";             // Red
};

// ── Enhanced Tooltip ─────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-slate-900 border-2 border-white/10 rounded-xl p-4 shadow-2xl backdrop-blur-md">
      <p className="text-white font-black text-sm mb-1">{d.day}</p>
      <div className="space-y-1">
        <p className="text-blue-400 font-bold text-lg">
          {d.germs >= 1e6 ? `${(d.germs / 1e6).toFixed(1)}M` : `${(d.germs / 1000).toFixed(0)}K`}
          <span className="text-[10px] ml-1 text-slate-400">CFU</span>
        </p>
        <p className="text-slate-300 text-[11px] leading-tight">{d.label}</p>
      </div>
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────
export default function GermGrowthChart() {
  const [activeIndex, setActiveIndex] = useState(germData.length - 1);
  const active = germData[activeIndex] ?? germData[germData.length - 1];

  const pieData = [
    { name: "Bacteria", value: active.bacteria, fill: "#3b82f6" },
    { name: "Fungi", value: active.fungi, fill: "#8b5cf6" },
    { name: "Allergens", value: active.allergens, fill: "#06b6d4" },
  ];

  return (
    <div className="w-full rounded-[32px] overflow-hidden relative text-white"
      style={{
        background: "#050b14",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
      }}
    >
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-600/10 blur-[120px] pointer-events-none" />

      {/* Header Section */}
      <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
              Live Lab Data
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tighter">Microbial Proliferation</h2>
        </div>

        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/5">
          <div className="text-right">
            <p className="text-[10px] text-slate-500 font-bold uppercase">Status</p>
            <p className="text-sm font-black" style={{ color: riskColor(active.riskLevel) }}>
              {active.day}: {active.surfaceEquivalent}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-white/5">
            {active.riskLevel > 70 ? "☣️" : active.riskLevel > 30 ? "⚠️" : "✅"}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        
        {/* Top Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Load", val: active.germs >= 1e6 ? `${(active.germs/1e6).toFixed(1)}M` : `${active.germs/1000}K`, unit: "CFU", color: "#3b82f6" },
            { label: "Mite Count", val: active.miteCount, unit: "/sq in", color: "#f59e0b" },
            { label: "Risk Factor", val: active.riskLevel, unit: "%", color: riskColor(active.riskLevel) },
            { label: "Surface Match", val: active.surfaceEquivalent, unit: "", color: "#fff" }
          ].map((stat, i) => (
            <motion.div key={i} whileHover={{ y: -5 }} className="bg-white/5 border border-white/10 p-4 rounded-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full" style={{ background: stat.color }} />
               <p className="text-[10px] font-black text-slate-500 uppercase mb-1">{stat.label}</p>
               <p className="text-xl font-black">{stat.val}<span className="text-[10px] ml-1 text-slate-500">{stat.unit}</span></p>
            </motion.div>
          ))}
        </div>

        {/* Middle Section: Bar Chart & Pie */}
        <div className="grid lg:grid-cols-12 gap-6">
          
          {/* Main Solid Bar Chart */}
          <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-[24px] p-6">
            <div className="flex justify-between items-center mb-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Colony Growth Plateau</p>
              <div className="flex gap-4">
                {["Low", "Medium", "Critical"].map((l, i) => (
                    <div key={l} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                        <div className="w-2 h-2 rounded-full" style={{ background: barColor(i === 0 ? 0 : i === 1 ? 1 : 3) }} />
                        {l}
                    </div>
                ))}
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={germData} onMouseMove={(s) => {
                    if (s.activeTooltipIndex !== undefined && s.activeTooltipIndex >= 0 && s.activeTooltipIndex < germData.length) {
                      setActiveIndex(s.activeTooltipIndex);
                    }
                  }}>
                  <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 800, fontSize: 11 }} dy={10} />
                  <YAxis hide domain={[0, 'auto']} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="germs" radius={[8, 8, 0, 0]} barSize={50} isAnimationActive={true}>
                    {germData.map((entry, index) => (
                      <Cell 
                        key={index} 
                        fill={barColor(index)} 
                        fillOpacity={1}
                        stroke={activeIndex === index ? "#fff" : "none"}
                        strokeWidth={2}
                        className="transition-all duration-300"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Breakdown Side Panel */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-white/5 border border-white/10 rounded-[24px] p-6 flex-1 flex flex-col items-center justify-center">
                <p className="text-[10px] font-black text-slate-500 uppercase mb-4 w-full">Biological Mix</p>
                <div className="relative">
                    <ResponsiveContainer width={160} height={160}>
                        <PieChart>
                            <Pie data={pieData} innerRadius={50} outerRadius={75} dataKey="value" stroke="none" paddingAngle={5}>
                                {pieData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Risk</p>
                        <p className="text-xl font-black">{active.riskLevel}%</p>
                    </div>
                </div>
                <div className="w-full space-y-2 mt-4">
                    {pieData.map((item, i) => (
                        <div key={i} className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-xl">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ background: item.fill }} />
                                <span className="text-[11px] font-bold text-slate-400">{item.name}</span>
                            </div>
                            <span className="text-[11px] font-black">{item.value}%</span>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </div>

        {/* Bottom Health Analysis Footer */}
        <div className="bg-blue-600/10 border border-blue-500/20 rounded-[24px] p-6 relative overflow-hidden">
            <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1">
                    <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-2">Clinical Observation</p>
                    <h4 className="text-lg font-black mb-1">{active.healthNote}</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">
                        Data extrapolated from NIH microbial load studies and high-precision CFU tracking. 
                        Washing at 60°C is required to reset these values to zero.
                    </p>
                </div>
                <div className="flex gap-2">
                    {["Week 1", "Week 2", "Week 3", "Week 4"].map((w, i) => (
                        <button 
                            key={w}
                            onClick={() => setActiveIndex(i)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${activeIndex === i ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
                        >
                            {w}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}