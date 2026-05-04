import React, { useState, useEffect, useRef } from 'react';
import { Layout, Spin, Row, Col, ConfigProvider } from 'antd';
import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import api from '../../services/api';

const { Content } = Layout;

// ─── SAVINGS CALCULATOR ──────────────────────────────────────────────────────
const DURATIONS = [
  { months: 1,  label: '1 Month',   discount: 0  },
  { months: 3,  label: '3 Months',  discount: 5  },
  { months: 6,  label: '6 Months',  discount: 10 },
  { months: 12, label: '12 Months', discount: 20 },
];

const DIY_RATES = {
  electricityPerLoad: 8.5,
  waterPerLoad: 12,
  fabricWearPct: 0.03,
  washesPerMonth: 4,
};

const EXCLUDED_CATEGORIES = ['pillow cover', 'pillow covers', 'pillowcover'];

const ProfessionalSavingsCalculator = () => {
  const [bundles,     setBundles]     = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [selCategory, setSelCategory] = useState(null);
  const [selBundle,   setSelBundle]   = useState(null);
  const [selDuration, setSelDuration] = useState(2);
  const [itemCost,    setItemCost]    = useState(800);
  const [detergent,   setDetergent]   = useState(20);
  const [machine,     setMachine]     = useState('automatic');
  const [tab,         setTab]         = useState('compare');
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/bundles');
        const activeBundles = (res.data.bundles || []).filter(b => b.active !== false);
        setBundles(activeBundles);
        const catMap = {};
        activeBundles.forEach(bundle => {
          (bundle.items || []).forEach(item => {
            const cat = item.category;
            if (cat && cat._id && !EXCLUDED_CATEGORIES.includes((cat.name || '').toLowerCase())) {
              catMap[cat._id] = cat;
            }
          });
        });
        const cats = Object.values(catMap);
        setCategories(cats);
        if (cats.length > 0) setSelCategory(cats[0]._id);
      } catch (e) {
        console.error('Failed to load bundles', e);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => { setSelBundle(null); }, [selCategory]);

  const filteredBundles = React.useMemo(() => {
    if (!selCategory) return bundles;
    return bundles.filter(b =>
      (b.items || []).some(item => item.category && item.category._id === selCategory)
    );
  }, [bundles, selCategory]);

  useEffect(() => {
    if (filteredBundles.length > 0 && !selBundle) {
      setSelBundle(filteredBundles[0]._id);
    }
  }, [filteredBundles, selBundle]);

  const bundle      = bundles.find(b => b._id === selBundle) || filteredBundles[0] || null;
  const duration    = DURATIONS[selDuration];
  const months      = duration.months;
  const selectedCat = categories.find(c => c._id === selCategory);

  const catItemCount = bundle
    ? (bundle.items || [])
        .filter(item => item.category && item.category._id === selCategory)
        .reduce((sum, item) => sum + (item.quantity || 1), 0)
    : 1;

  const loadsPerMonth = DIY_RATES.washesPerMonth * Math.ceil(catItemCount / 2);
  const totalLoads    = loadsPerMonth * months;
  const costPerLoad   = detergent + DIY_RATES.electricityPerLoad + DIY_RATES.waterPerLoad;
  const consumables   = Math.round(totalLoads * costPerLoad);
  const assetValue    = itemCost * catItemCount;
  const depreciation  = Math.round(assetValue * DIY_RATES.fabricWearPct * months);
  const timeHours     = Math.round(totalLoads * (machine === 'automatic' ? 0.75 : 2.5));
  const totalDIY      = assetValue + consumables + depreciation;

  const crMonthly  = bundle ? bundle.price : 0;
  const crSubtotal = crMonthly * months;
  const crDiscount = Math.round(crSubtotal * duration.discount / 100);
  const crTotal    = crSubtotal - crDiscount;

  const netSavings = totalDIY - crTotal;
  const savingsPct = totalDIY > 0 ? Math.round((netSavings / totalDIY) * 100) : 0;
  const fmt = (n) => Math.max(0, Math.round(n)).toLocaleString('en-IN');

  return (
    <div className="w-full bg-[#09090b] text-zinc-100 rounded-2xl border border-zinc-800 overflow-hidden">

      {/* Header */}
      <div className="p-6 md:p-8 border-b border-zinc-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-light text-white mb-1">
              Cost &amp; Hygiene <span className="font-bold">Analyzer</span>
            </h2>
            <p className="text-zinc-500 text-xs max-w-sm">
              Pick a category, choose a bundle and duration, then enter your own costs to see what you save.
            </p>
          </div>
          <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 shrink-0">
            {[['compare','Compare'],['breakdown','Breakdown']].map(([t,l]) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab===t ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Category tabs */}
        <div className="mt-5 flex flex-wrap gap-2 min-h-[36px] items-center">
          {loadingData ? (
            <span className="text-zinc-600 text-xs animate-pulse">Loading categories...</span>
          ) : categories.length === 0 ? (
            <span className="text-zinc-600 text-xs">No categories found</span>
          ) : (
            categories.map(cat => (
              <button key={cat._id} onClick={() => setSelCategory(cat._id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                  selCategory === cat._id
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
                }`}>
                {cat.name}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left: Inputs */}
          <div className="lg:col-span-4 space-y-6">

            {/* Bundle selector */}
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-3">
                {selectedCat ? `${selectedCat.name} Bundles` : 'Select Bundle'}
              </p>
              {loadingData ? (
                <div className="space-y-2">
                  {[1,2].map(i => <div key={i} className="h-14 bg-zinc-800/50 rounded-xl animate-pulse" />)}
                </div>
              ) : filteredBundles.length === 0 ? (
                <p className="text-zinc-600 text-xs">No bundles for this category.</p>
              ) : (
                <div className="space-y-2">
                  {filteredBundles.map(b => {
                    const catItems = (b.items || []).filter(item => item.category && item.category._id === selCategory);
                    const itemSummary = catItems.map(i => `${i.quantity}x ${i.category.name}`).join(', ');
                    return (
                      <button key={b._id} onClick={() => setSelBundle(b._id)}
                        className={`w-full py-3 px-4 rounded-xl border text-left transition-all ${selBundle===b._id ? 'border-emerald-500/60 bg-emerald-950/40' : 'border-zinc-800 hover:border-zinc-600'}`}>
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <div className={`text-xs font-bold truncate ${selBundle===b._id ? 'text-emerald-300' : 'text-zinc-300'}`}>{b.name}</div>
                            <div className="text-[10px] text-zinc-500 mt-0.5 truncate">{itemSummary || b.description || ''}</div>
                          </div>
                          <div className={`text-sm font-mono font-bold shrink-0 ${selBundle===b._id ? 'text-emerald-400' : 'text-zinc-400'}`}>
                            ₹{b.price}/mo
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Duration */}
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-3">Subscription Duration</p>
              <div className="grid grid-cols-2 gap-2">
                {DURATIONS.map((d,i) => (
                  <button key={i} onClick={() => setSelDuration(i)}
                    className={`py-2.5 px-3 rounded-xl border text-center transition-all ${selDuration===i ? 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'}`}>
                    <div className="text-xs font-bold">{d.label}</div>
                    {d.discount > 0
                      ? <div className="text-[9px] text-emerald-400 mt-0.5">{d.discount}% off</div>
                      : <div className="text-[9px] text-zinc-600 mt-0.5">Standard</div>}
                  </button>
                ))}
              </div>
            </div>

            {/* Item cost */}
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-zinc-400">Your {selectedCat ? selectedCat.name : 'Item'} Cost (₹ each)</span>
                <span className="text-white font-mono font-bold">₹{itemCost}</span>
              </div>
              <input type="range" min="200" max="5000" step="100" value={itemCost}
                onChange={(e) => setItemCost(parseInt(e.target.value))}
                className="w-full accent-emerald-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer" />
              <div className="flex justify-between text-[10px] text-zinc-700 mt-1"><span>₹200</span><span>₹5000</span></div>
              <p className="text-[10px] text-zinc-600 mt-1">
                Buying {catItemCount} item{catItemCount > 1 ? 's' : ''}: <span className="text-zinc-400 font-mono">₹{fmt(assetValue)}</span>
              </p>
            </div>

            {/* Detergent */}
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-zinc-400">Detergent per Load (₹)</span>
                <span className="text-white font-mono font-bold">₹{detergent}</span>
              </div>
              <input type="range" min="5" max="60" value={detergent}
                onChange={(e) => setDetergent(parseInt(e.target.value))}
                className="w-full accent-emerald-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer" />
            </div>

            {/* Machine */}
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2">Washing Machine</p>
              <div className="grid grid-cols-2 gap-2">
                {[['automatic','Automatic','45 min/load'],['semi','Semi-Auto','2.5 hrs/load']].map(([v,l,t]) => (
                  <button key={v} onClick={() => setMachine(v)}
                    className={`py-2.5 rounded-xl border text-center transition-all ${machine===v ? 'border-blue-500/50 bg-blue-950/40 text-blue-300' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}>
                    <div className="text-[10px] font-bold uppercase">{l}</div>
                    <div className="text-[9px] text-zinc-600 mt-0.5">{t}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-8 space-y-4">
            {!bundle ? (
              <div className="h-full flex items-center justify-center text-zinc-600 text-sm py-16">
                {loadingData ? 'Loading...' : 'Select a bundle to see the comparison'}
              </div>
            ) : tab === 'compare' ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* DIY card */}
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">DIY Laundry</span>
                        <p className="text-xs text-zinc-500 mt-0.5">Buying + washing for {months} mo</p>
                      </div>
                      <span className="text-2xl">🧺</span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-xs border-b border-zinc-800 pb-2">
                        <span className="text-zinc-500">Buy {catItemCount} {selectedCat ? selectedCat.name : 'items'} @ ₹{itemCost}</span>
                        <span className="font-mono text-zinc-300">₹{fmt(assetValue)}</span>
                      </div>
                      <div className="flex justify-between text-xs border-b border-zinc-800 pb-2">
                        <span className="text-zinc-500">Detergent + Water + Power ({totalLoads} loads)</span>
                        <span className="font-mono text-zinc-300">₹{fmt(consumables)}</span>
                      </div>
                      <div className="flex justify-between text-xs border-b border-zinc-800 pb-2">
                        <span className="text-zinc-500">Fabric wear &amp; tear ({months} mo)</span>
                        <span className="font-mono text-zinc-300">₹{fmt(depreciation)}</span>
                      </div>
                      <div className="flex justify-between text-xs pt-1">
                        <span className="text-zinc-400 font-semibold">Total Cost</span>
                        <span className="font-mono font-bold text-rose-400 text-sm">₹{fmt(totalDIY)}</span>
                      </div>
                    </div>
                    <div className="bg-zinc-800/60 rounded-xl p-3 flex items-center gap-3">
                      <span className="text-xl">⏱</span>
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase">Time spent washing</p>
                        <p className="text-sm font-bold text-rose-300">{timeHours} hours</p>
                      </div>
                    </div>
                  </div>

                  {/* ClosetRush card */}
                  <div className="bg-emerald-950/30 border border-emerald-500/25 rounded-2xl p-5 relative overflow-hidden">
                    <div className="absolute top-3 right-3 text-3xl opacity-10">✨</div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">ClosetRush</span>
                        <p className="text-xs text-zinc-500 mt-0.5">{bundle.name} — {duration.label}</p>
                      </div>
                      <span className="text-2xl">🛏️</span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-xs border-b border-zinc-800 pb-2">
                        <span className="text-zinc-500">₹{crMonthly}/mo × {months} months</span>
                        <span className="font-mono text-zinc-300">₹{fmt(crSubtotal)}</span>
                      </div>
                      {crDiscount > 0 && (
                        <div className="flex justify-between text-xs border-b border-zinc-800 pb-2">
                          <span className="text-emerald-500">{duration.discount}% discount</span>
                          <span className="font-mono text-emerald-400">−₹{fmt(crDiscount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs border-b border-zinc-800 pb-2">
                        <span className="text-zinc-500">Buy items yourself</span>
                        <span className="font-mono text-emerald-400">₹0</span>
                      </div>
                      <div className="flex justify-between text-xs border-b border-zinc-800 pb-2">
                        <span className="text-zinc-500">Washing / laundry</span>
                        <span className="font-mono text-emerald-400">₹0 (included)</span>
                      </div>
                      <div className="flex justify-between text-xs pt-1">
                        <span className="text-zinc-400 font-semibold">Total Cost</span>
                        <span className="font-mono font-bold text-emerald-400 text-sm">₹{fmt(crTotal)}</span>
                      </div>
                    </div>
                    <div className="bg-emerald-500/10 rounded-xl p-3 flex items-center gap-3">
                      <span className="text-xl">⚡</span>
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase">Time spent</p>
                        <p className="text-sm font-bold text-emerald-300">0 hours</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Savings banner */}
                <div className={`rounded-2xl p-5 border ${netSavings >= 0 ? 'bg-emerald-950/20 border-emerald-500/20' : 'bg-rose-950/20 border-rose-500/20'}`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
                        {netSavings >= 0 ? 'You save with ClosetRush' : 'DIY is cheaper by'}
                      </p>
                      <p className={`text-3xl md:text-4xl font-black ${netSavings >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        ₹{fmt(Math.abs(netSavings))}
                      </p>
                      {netSavings >= 0 && (
                        <p className="text-xs text-zinc-500 mt-1">
                          That's <span className="text-emerald-400 font-bold">{savingsPct}%</span> less than DIY
                          {' '}+ <span className="text-blue-400 font-bold">{timeHours} hrs</span> of your time back
                        </p>
                      )}
                    </div>
                    <a href="/subscriptions/individual"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold text-xs transition-all shadow-lg shadow-emerald-900/30 whitespace-nowrap">
                      START SAVING →
                    </a>
                  </div>
                  {totalDIY > 0 && (
                    <div className="mt-4 space-y-1.5">
                      <div className="flex justify-between text-[10px] text-zinc-600">
                        <span>DIY ₹{fmt(totalDIY)}</span>
                        <span>ClosetRush ₹{fmt(crTotal)}</span>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full" style={{ width: '100%' }} />
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(100, (crTotal / totalDIY) * 100)}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Breakdown tab */
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Total Washes', value: String(totalLoads), sub: `${loadsPerMonth}/mo × ${months} mo`, icon: '🔄' },
                    { label: 'Time Lost',    value: `${timeHours} hrs`, sub: `${Math.round(timeHours / months)} hrs/month`, icon: '⏱' },
                    { label: 'Cost/Wash',    value: `₹${fmt(costPerLoad)}`, sub: 'detergent + water + power', icon: '💧' },
                  ].map((s, i) => (
                    <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
                      <div className="text-2xl mb-2">{s.icon}</div>
                      <p className="text-lg font-bold text-white">{s.value}</p>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wide mt-0.5">{s.label}</p>
                      <p className="text-[10px] text-zinc-600 mt-1">{s.sub}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-4">Monthly Cost — DIY vs ClosetRush</p>
                  {[
                    { label: 'Item Purchase', diy: Math.round(assetValue / months), cr: 0 },
                    { label: 'Detergent',     diy: Math.round(loadsPerMonth * detergent), cr: 0 },
                    { label: 'Electricity',   diy: Math.round(loadsPerMonth * DIY_RATES.electricityPerLoad), cr: 0 },
                    { label: 'Water',         diy: Math.round(loadsPerMonth * DIY_RATES.waterPerLoad), cr: 0 },
                    { label: 'Fabric Wear',   diy: Math.round(assetValue * DIY_RATES.fabricWearPct), cr: 0 },
                    { label: 'Service Fee',   diy: 0, cr: crMonthly },
                  ].map((row, i) => {
                    const maxVal = Math.max(crMonthly, row.diy, row.cr, 1);
                    return (
                      <div key={i} className="flex items-center gap-3 mb-3">
                        <span className="text-xs text-zinc-500 w-24 shrink-0">{row.label}</span>
                        <div className="flex-1 flex gap-2 items-center">
                          <div className="flex-1 h-5 bg-zinc-800 rounded overflow-hidden">
                            {row.diy > 0 ? (
                              <div className="h-full bg-rose-500/60 rounded flex items-center justify-end pr-1.5 transition-all duration-500"
                                style={{ width: `${Math.min(100, (row.diy / maxVal) * 100)}%` }}>
                                <span className="text-[9px] text-white font-mono">₹{row.diy}</span>
                              </div>
                            ) : (
                              <div className="h-full flex items-center pl-2">
                                <span className="text-[9px] text-zinc-600">—</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 h-5 bg-zinc-800 rounded overflow-hidden">
                            {row.cr > 0 ? (
                              <div className="h-full bg-emerald-500/60 rounded flex items-center justify-end pr-1.5 transition-all duration-500"
                                style={{ width: `${Math.min(100, (row.cr / maxVal) * 100)}%` }}>
                                <span className="text-[9px] text-white font-mono">₹{row.cr}</span>
                              </div>
                            ) : (
                              <div className="h-full flex items-center pl-2">
                                <span className="text-[9px] text-emerald-500 font-mono">₹0</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex gap-4 mt-3 pt-3 border-t border-zinc-800">
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-rose-500/60" /><span className="text-[10px] text-zinc-500">DIY</span></div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/60" /><span className="text-[10px] text-zinc-500">ClosetRush</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const IMAGE_CONFIG = {
  heroBg: "https://images.unsplash.com/photo-1532187863486-abf9d39d99c5?q=80&w=2070",
  health: [
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1400",
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800"
  ],
  hygiene: [
    "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=1400",
    "https://images.unsplash.com/photo-1583947215259-38e31be8751f?q=80&w=800"
  ],
  energy: [
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1400",
    "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=800"
  ],
  mental: [
    "https://images.unsplash.com/photo-1493839523149-2864fca44919?q=80&w=1400",
    "https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?q=80&w=800"
  ]
};

const TRANSITION = { duration: 1.2, ease: [0.16, 1, 0.3, 1] };

const ScienceHero = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  return (
    <section className="relative h-[90vh] flex items-center px-8 overflow-hidden bg-[#050b14]">
      <div className="max-w-7xl mx-auto w-full z-10">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={TRANSITION}>
          <span className="text-blue-400 font-black tracking-[0.6em] text-[10px] uppercase mb-6 block">
            Research &amp; Development
          </span>
          <motion.h1 style={{ y }} className="text-[9vw] md:text-[7vw] font-bold text-white leading-[0.8] tracking-tighter mb-8">
            The Benefits of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-white">Clean Bedding.</span>
          </motion.h1>
          <p className="text-xl md:text-2xl text-blue-100/30 max-w-2xl font-light leading-relaxed">
            Eliminating microscopic disruptions to optimize your well being.
          </p>
        </motion.div>
      </div>
      <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
        <img src={IMAGE_CONFIG.heroBg} className="w-full h-full object-cover" alt="background" />
      </div>
    </section>
  );
};

const ScienceSection = ({ section, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-15%" });
  const isEven = index % 2 === 0;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yImage = useTransform(scrollYProgress, [0, 1], [-60, 60]);

  const getImages = () => {
    if (section.title.toLowerCase().includes('health')) return IMAGE_CONFIG.health;
    if (section.title.toLowerCase().includes('hygiene')) return IMAGE_CONFIG.hygiene;
    if (section.title.toLowerCase().includes('energy')) return IMAGE_CONFIG.energy;
    if (section.title.toLowerCase().includes('mental')) return IMAGE_CONFIG.mental;
    return IMAGE_CONFIG.health;
  };
  const images = section.images?.length > 0 ? section.images.map(img => img.url) : getImages();

  return (
    <section ref={ref} className={`py-20 md:py-32 relative overflow-hidden ${section.dark ? 'bg-[#050b14] text-white' : 'bg-white text-[#050b14]'}`}>
      <div className="max-w-[1400px] mx-auto px-8">
        <Row gutter={[100, 40]} align="middle" className={isEven ? '' : 'flex-row-reverse'}>
          <Col xs={24} lg={12}>
            <motion.div initial={{ opacity: 0, x: isEven ? -60 : 60 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={TRANSITION}>
              <div className="flex items-center gap-6 mb-12">
                <span className="text-8xl font-black opacity-10 leading-none">0{index + 1}</span>
                <div className="h-[2px] flex-grow bg-current opacity-10" />
              </div>
              <h2 className="text-5xl md:text-[80px] font-bold mb-10 tracking-tighter leading-[0.9]">{section.title}</h2>
              <div className="mb-14">
                <div className="flex items-baseline gap-4 mb-6">
                  <span className="text-7xl font-black tracking-tighter text-blue-500">{section.stat}</span>
                  <span className="text-[10px] uppercase tracking-[0.3em] font-black opacity-30">{section.statLabel}</span>
                </div>
                <p className="text-xl md:text-2xl font-light leading-relaxed opacity-60">{section.content?.mainText}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {section.content?.bulletPoints?.map((point, i) => (
                  <motion.div key={i} whileHover={{ x: 12 }} className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center border border-current opacity-20 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      <span className="text-[10px] font-bold">{i + 1}</span>
                    </div>
                    <span className="text-[14px] font-bold opacity-40 group-hover:opacity-100 transition-opacity pt-2">{point}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </Col>
          <Col xs={24} lg={12}>
            <div className="relative pt-0">
              <motion.div style={{ y: yImage }} className="aspect-[4/5] rounded-[60px] overflow-hidden shadow-2xl relative z-10">
                <img src={images[0]} className="w-full h-full object-cover transition-transform duration-1000 hover:scale-110" alt="Main" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                transition={{ delay: 0.5, ...TRANSITION }}
                className={`absolute -bottom-6 ${isEven ? '-right-8' : '-left-8'} z-30 p-1 w-64 h-64 rounded-[40px] shadow-2xl hidden md:block overflow-hidden ${section.dark ? 'bg-[#050b14]' : 'bg-white'}`}
              >
                <div className="relative w-full h-full rounded-[38px] overflow-hidden">
                  <img src={images[1]} className="w-full h-full object-cover" alt="Detail View" />
                  <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                    <span className="text-white text-[9px] font-black uppercase tracking-widest">Detail View</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </Col>
        </Row>
      </div>
    </section>
  );
};

const ScienceBehindPage = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const CATEGORIES = [
    { key: 'health', title: 'Health Benefits', emoji: '🫀', stat: '82%', label: 'Allergen Reduction' },
    { key: 'hygiene', title: 'Hospital Hygiene', emoji: '🌡️', stat: '60°C', label: 'Sanitation' },
    { key: 'energy', title: 'Energy & Balance', emoji: '⚡', stat: '94%', label: 'Grounding Index' },
    { key: 'mental', title: 'Mental Well-being', emoji: '🧠', stat: '40%', label: 'Cortisol Drop' }
  ];

  useEffect(() => {
    const formatted = CATEGORIES.map((cat, i) => ({
      title: cat.title,
      emoji: cat.emoji,
      stat: cat.stat,
      statLabel: cat.label,
      order: i + 1,
      dark: i % 2 === 0,
      content: {
        mainText: "Our biological research proves that clinical environments influence cellular regeneration.",
        bulletPoints: ["Molecular Cleanliness", "Hypoallergenic Sealing", "Fiber Restoration"],
        additionalText: "Clinical Grade Verification"
      },
      images: []
    }));
    setSections(formatted);
    setLoading(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#050b14]"><Spin size="large" /></div>;

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#2a5fc7', borderRadius: 24 } }}>
      <Layout className="bg-[#050b14] antialiased">
        <Navbar />
        <Content>
          <ScienceHero />
          <AnimatePresence>
            {sections.map((section, index) => (
              <ScienceSection key={index} section={section} index={index} />
            ))}
          </AnimatePresence>

          {/* ── COST ANALYZER SECTION ── */}
          <section className="py-16 md:py-24 px-4 md:px-8 bg-[#09090b]">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8 md:mb-10">
                <span className="text-blue-400 font-black tracking-[0.4em] text-[10px] uppercase block mb-3">Financial Analysis</span>
                <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tighter">
                  The Real Cost of <span className="text-emerald-400">DIY Laundry.</span>
                </h2>
                <p className="text-zinc-500 mt-3 text-sm md:text-base max-w-xl">
                  Select a category and bundle, choose your duration, then enter your own costs to see exactly what you save.
                </p>
              </div>
              <ProfessionalSavingsCalculator />
            </div>
          </section>

          <section className="py-32 px-8 bg-white text-center relative overflow-hidden">
            <h2 className="text-7xl md:text-[10vw] font-black tracking-tighter leading-none mb-16 text-[#050b14]">
              Start <br /> <span className="text-blue-600 italic">Today.</span>
            </h2>
            <motion.a href="/subscriptions" whileHover={{ scale: 1.05 }} className="px-20 py-10 rounded-full bg-[#050b14] text-white font-black text-2xl inline-block shadow-2xl">
              Subscribe Here
            </motion.a>
          </section>
        </Content>
        <Footer />
      </Layout>
    </ConfigProvider>
  );
};

export default ScienceBehindPage;
