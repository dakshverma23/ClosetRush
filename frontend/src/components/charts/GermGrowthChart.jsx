import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, PieChart, Pie
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { germData } from "../../data/germData";

// ── Derived datasets ──────────────────────────────────────────────────────────
const dailyMultiplierData = germData.map((d, i) => ({
  day: d.day.replace("Day ", "D"),
  multiplier: i === 0 ? 1 : parseFloat((d.germs / germData[i - 1].germs).toFixed(1)),
  germs: d.germs
}));

const barColor = (dayStr) => {
  const n = parseInt(dayStr.split(" ")[1]);
  if (n <= 2) return "url(#safeG)";
  if (n <= 4) return "url(#midG)";
  return "url(#highG)";
};

const riskColor = (v) => {
  if (v < 20) return "#10b981";
  if (v < 50) return "#f59e0b";
  return "#ef4444";
};

// ── Tooltips ──────────────────────────────────────────────────────────────────
const BarTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-slate-900/98 border border-slate-700/60 rounded-xl p-3 shadow-2xl text-xs max-w-[180px]">
      <p className="text-slate-400 mb-1 font-semibold">{d.day}</p>
      <p className="text-white font-bold text-sm">
        {d.germs >= 1e6 ? `${(d.germs/1e6).toFixed(1)}M` : `${(d.germs/1000).toFixed(0)}K`}
        <span className="text-slate-400 font-normal ml-1">CFU/sq in</span>
      </p>
      <p className="text-slate-400 mt-1 leading-snug">{d.label}</p>
    </div>
  );
};

const MultiplierTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-slate-900/98 border border-slate-700/60 rounded-xl p-2.5 shadow-xl text-xs">
      <p className="text-slate-400">{d.day}</p>
      <p className="text-cyan-400 font-bold">
        {d.multiplier === 1 ? "Baseline" : `${d.multiplier}× prev day`}
      </p>
    </div>
  );
};

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon, value, label, sub, color }) => (
  <div className="rounded-xl p-2.5 flex items-center gap-2 relative overflow-hidden"
    style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.14)" }}
  >
    <div className="absolute inset-0 opacity-10 rounded-xl"
      style={{ background: `radial-gradient(circle at 20% 50%, ${color}, transparent 70%)` }}
    />
    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
      style={{ background: `${color}22`, border: `1px solid ${color}44` }}
    >
      {icon}
    </div>
    <div className="relative z-10 min-w-0">
      <div className="text-sm font-bold text-white leading-none truncate">{value}</div>
      <div className="text-xs text-white/60 mt-0.5 truncate">{label}</div>
    </div>
  </div>
);

// ── Circular progress ring ────────────────────────────────────────────────────
const Ring = ({ value, color, label, sub }) => (
  <div className="flex items-center gap-2">
    <div className="relative w-9 h-9 flex-shrink-0">
      <svg viewBox="0 0 44 44" className="w-full h-full -rotate-90">
        <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="4" />
        <circle cx="22" cy="22" r="18" fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${(value / 100) * 113} 113`} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 3px ${color}88)`, transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span style={{ fontSize: 9 }} className="font-bold text-white">{value}</span>
      </div>
    </div>
    <div className="min-w-0">
      <div className="text-xs font-semibold text-white leading-tight truncate">{label}</div>
      <div className="truncate" style={{ color: "rgba(200,221,245,0.8)", fontSize: 10 }}>{sub}</div>
      <div className="mt-1 h-0.5 rounded-full w-12" style={{ background: "rgba(255,255,255,0.14)" }}>
        <div className="h-0.5 rounded-full transition-all duration-700"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
export default function GermGrowthChart() {
  const [activeDay, setActiveDay] = useState(null);

  const active = activeDay
    ? germData.find(d => d.day === activeDay) || germData[6]
    : germData[6];

  const dayIndex = germData.findIndex(d => d.day === active.day);

  const pieData = [
    { name: "Bacteria",   value: active.bacteria,  fill: "#3b82f6" },
    { name: "Fungi",      value: active.fungi,      fill: "#8b5cf6" },
    { name: "Allergens",  value: active.allergens,  fill: "#06b6d4" },
    { name: "Dust Mites", value: active.dustMites,  fill: "#f59e0b" },
    { name: "Skin Cells", value: active.skinCells,  fill: "#c8ddf5" },
  ].filter(d => d.value > 0);

  const miteDisplay = active.miteCount === 0 ? "None yet" : `~${active.miteCount}/sq in`;

  const growthMultiplier = dayIndex === 0
    ? "Baseline"
    : `${(active.germs / germData[0].germs).toLocaleString()}×`;

  const rings = [
    { label: "Bacteria",   sub: "CFU risk",          value: active.riskLevel,                                                    color: "#3b82f6" },
    { label: "Allergens",  sub: `${active.allergenUg}μg/g`, value: Math.min(Math.round((active.allergenUg / 10) * 100), 99),    color: "#06b6d4" },
    { label: "Dust Mites", sub: active.miteCount === 0 ? "Not present" : `${active.miteCount}/sq in`,
      value: active.miteCount === 0 ? 0 : Math.min(Math.round((active.miteCount / 0.3) * 85), 99),                               color: "#f59e0b" },
    { label: "Skin Cells", sub: `${active.skinMg}mg shed`, value: Math.min(Math.round((active.skinMg / 210) * 99), 99),          color: "#8b5cf6" },
  ];

  const cfu = active.germs >= 1e6
    ? `${(active.germs / 1e6).toFixed(1)}M`
    : active.germs >= 1000 ? `${(active.germs / 1000).toFixed(0)}K` : String(active.germs);

  return (
    <div className="w-full rounded-2xl sm:rounded-3xl overflow-hidden relative"
      style={{
        background: "linear-gradient(160deg, #0d2d6b 0%, #1040a0 35%, #0e3580 65%, #0a2560 100%)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 16px 48px rgba(0,0,0,0.4)"
      }}
    >
      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(168,196,240,0.18) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }}
      />

      {/* ── Header ── */}
      <div className="relative flex items-center justify-between gap-2 px-4 py-2.5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-1 h-4 rounded-full bg-gradient-to-b from-cyan-400 to-blue-600 flex-shrink-0" />
          <div className="min-w-0">
            <h2 className="text-xs font-bold text-white truncate">What Happens to Your Bedsheets?</h2>
            <p className="text-xs truncate" style={{ color: "rgba(200,221,245,0.75)", fontSize: 10 }}>
              Tap/hover a bar · Amerisleep + NIH
            </p>
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={active.day}
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0"
            style={{ background: `${riskColor(active.riskLevel)}18`, border: `1px solid ${riskColor(active.riskLevel)}44` }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0" style={{ background: riskColor(active.riskLevel) }} />
            <span className="text-xs font-semibold whitespace-nowrap" style={{ color: riskColor(active.riskLevel) }}>
              {active.day} · {active.riskLevel}/100
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative p-2.5 sm:p-3">

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-2.5">
          <AnimatePresence mode="wait">
            <motion.div key={`s-${active.day}`} className="contents"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
            >
              <StatCard icon="🦠" value={cfu}              label="Bacteria"      sub={`${active.day} · CFU/sq in`}       color="#3b82f6" />
              <StatCard icon="📈" value={growthMultiplier} label="vs Day 1"      sub="Times more bacteria"               color="#06b6d4" />
              <StatCard icon="🪲" value={miteDisplay}      label="Dust Mites"    sub="Per sq inch (sheet)"               color="#f59e0b" />
              <StatCard icon="💧" value={`${active.sweatMg}ml`} label="Sweat"   sub="Cumulative absorbed"               color="#8b5cf6" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Charts: stacked on mobile, side-by-side on desktop ── */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-2 flex-1 min-h-0">

          {/* Main bar chart */}
          <div className="lg:col-span-7 rounded-xl p-2.5 flex flex-col"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <div className="flex items-center justify-between mb-1.5 flex-shrink-0">
              <p className="text-xs font-semibold text-white/80">Bacterial Count by Day</p>
              <div className="flex gap-2">
                {[["Low","#2dd4bf"],["Med","#06b6d4"],["High","#3b82f6"]].map(([l,c]) => (
                  <div key={l} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-sm" style={{ background: c }} />
                    <span className="text-xs" style={{ color: "rgba(200,221,245,0.85)" }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* flex-1 + min-h-0 makes the chart fill remaining panel height */}
            <div className="flex-1 min-h-0" style={{ minHeight: 160, height: 160 }}>
              <ResponsiveContainer width="100%" height={160} minWidth={0}>
                <BarChart data={germData} barCategoryGap="10%"
                  barSize={28}
                  onMouseMove={d => d?.activeLabel && setActiveDay(d.activeLabel)}
                  onMouseLeave={() => setActiveDay(null)}
                >
                  <defs>
                    <linearGradient id="safeG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#5eead4" /><stop offset="100%" stopColor="#2dd4bf" stopOpacity={0.7} />
                    </linearGradient>
                    <linearGradient id="midG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" /><stop offset="100%" stopColor="#0891b2" stopOpacity={0.7} />
                    </linearGradient>
                    <linearGradient id="highG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#60a5fa" /><stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.85} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 6" stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: "#c8ddf5", fontSize: 10 }} axisLine={false} tickLine={false}
                    tickFormatter={v => v.replace("Day ", "D")} />
                  {/* Log scale so D1–D3 are visible alongside D7 */}
                  <YAxis
                    scale="log" domain={[100, 'auto']}
                    tick={{ fill: "#c8ddf5", fontSize: 10 }} axisLine={false} tickLine={false} width={36}
                    tickFormatter={v => v >= 1e6 ? `${(v/1e6).toFixed(0)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}
                    allowDataOverflow
                  />
                  <Tooltip
                    content={<BarTip />}
                    cursor={{ fill: "rgba(255,255,255,0.06)", radius: 6 }}
                    position={{ y: 0 }}
                  />
                  <Bar dataKey="germs" radius={[4,4,0,0]} animationDuration={900} minPointSize={4}>
                    {germData.map((e, i) => (
                      <Cell key={i} fill={barColor(e.day)}
                        opacity={activeDay && activeDay !== e.day ? 0.35 : 1}
                        stroke={activeDay === e.day ? "rgba(255,255,255,0.5)" : "transparent"}
                        strokeWidth={activeDay === e.day ? 1.5 : 0}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right column: side-by-side on mobile (2-col grid), stacked on desktop */}
          <div className="lg:col-span-5 grid grid-cols-2 lg:grid-cols-1 gap-2">

            {/* Daily multiplier */}
            <div className="rounded-xl p-2.5"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-white/80">Growth Multiplier</p>
                <span className="text-xs" style={{ color: "rgba(200,221,245,0.8)" }}>× prev day</span>
              </div>
              <ResponsiveContainer width="100%" height={70} minWidth={0}>
                <BarChart data={dailyMultiplierData} barCategoryGap="25%">
                  <defs>
                    <linearGradient id="multG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#0891b2" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 6" stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: "#c8ddf5", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#c8ddf5", fontSize: 9 }} axisLine={false} tickLine={false} width={24}
                    tickFormatter={v => `${v}×`} domain={[0, 'auto']} />
                  <Tooltip content={<MultiplierTip />} cursor={{ fill: "rgba(255,255,255,0.06)", radius: 4 }} />
                  <Bar dataKey="multiplier" radius={[3,3,0,0]} animationDuration={800}>
                    {dailyMultiplierData.map((e, i) => (
                      <Cell key={i}
                        fill={e.multiplier >= 50 ? "#3b82f6" : e.multiplier >= 4 ? "#06b6d4" : "#2dd4bf"}
                        opacity={activeDay && activeDay !== germData[i]?.day ? 0.4 : 1}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Contaminant breakdown */}
            <div className="rounded-xl p-2.5"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <p className="text-xs font-semibold text-white/80 mb-1.5">
                Contaminants — <span style={{ color: "#06b6d4" }}>{active.day}</span>
              </p>
              <div className="flex items-center gap-2">
                <AnimatePresence mode="wait">
                  <motion.div key={`pie-${active.day}`}
                    initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }} transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <ResponsiveContainer width={64} height={64} minWidth={0}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={18} outerRadius={30}
                          dataKey="value" strokeWidth={0} animationDuration={500}>
                          {pieData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </motion.div>
                </AnimatePresence>
                <AnimatePresence mode="wait">
                  <motion.div key={`legend-${active.day}`}
                    className="flex flex-col gap-1 flex-1 min-w-0"
                    initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }} transition={{ duration: 0.3 }}
                  >
                    {pieData.map((e, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: e.fill }} />
                          <span className="text-xs truncate" style={{ color: "rgba(147,180,216,0.8)" }}>{e.name}</span>
                        </div>
                        <span className="text-xs font-semibold text-white ml-1">{e.value}%</span>
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Risk rings */}
          <div className="lg:col-span-12 rounded-xl p-2.5"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="text-xs font-semibold text-white/80 flex-shrink-0">
                Risk —{" "}
                <AnimatePresence mode="wait">
                  <motion.span key={active.day} className="inline-block"
                    initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 3 }} transition={{ duration: 0.2 }}
                    style={{ color: riskColor(active.riskLevel) }}
                  >
                    {active.day}
                  </motion.span>
                </AnimatePresence>
              </p>
              <AnimatePresence mode="wait">
                <motion.p key={`note-${active.day}`}
                  className="text-xs text-right truncate"
                  style={{ color: "rgba(200,221,245,0.75)", fontSize: 10 }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {active.healthNote}
                </motion.p>
              </AnimatePresence>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <AnimatePresence mode="wait">
                <motion.div key={`rings-${active.day}`} className="contents"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}
                >
                  {rings.map((r, i) => <Ring key={i} {...r} />)}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
