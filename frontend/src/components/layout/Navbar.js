import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Avatar, Dropdown } from 'antd';
import {
  HomeOutlined,
  InfoCircleOutlined,
  ShoppingOutlined,
  DollarOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  CloseOutlined,
  MenuOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { key: 'home',    label: 'Home',          to: '/',               icon: <HomeOutlined /> },
  { key: 'science', label: 'This Ain"t" Optional',        to: '/science-behind', icon: <InfoCircleOutlined /> },
  { key: 'offers',  label: 'What We Offer',  to: '/what-we-offer',  icon: <ShoppingOutlined /> },
  { key: 'about',   label: 'About',          to: '/about',          icon: <InfoCircleOutlined /> },
];

const Navbar = () => {
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [brandLogo]             = useState(localStorage.getItem('brandLogo') || '');
  const [brandName]             = useState(localStorage.getItem('brandName') || 'ClosetRush');
  const { isAuthenticated, user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const menuRef   = useRef(null);

  /* ── scroll shadow ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── close mobile menu on route change ── */
  useEffect(() => { setOpen(false); }, [location.pathname]);

  /* ── close on outside click ── */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  /* ── lock body scroll when mobile menu open ── */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const subscriptionPath = () => {
    if (!isAuthenticated()) return '/register';
    if (user?.userType === 'business') return '/business/subscriptions';
    return '/subscriptions';
  };

  const dashboardPath = () => {
    if (user?.userType === 'admin')    return '/admin/dashboard';
    if (user?.userType === 'business') return '/business/dashboard';
    return '/dashboard';
  };

  const isActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  const userDropdownItems = [
    {
      key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard',
      onClick: () => navigate(dashboardPath()),
    },
    {
      key: 'subscriptions', icon: <ShoppingOutlined />, label: 'My Subscriptions',
      onClick: () => navigate(subscriptionPath()),
    },
    { type: 'divider' },
    {
      key: 'logout', icon: <LogoutOutlined />, label: 'Logout',
      danger: true, onClick: logout,
    },
  ];

  return (
    <>
      {/* ── NAVBAR BAR ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-slate-100'
            : 'bg-white/80 backdrop-blur-sm'
        }`}
        style={{ height: 64 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow transition-all duration-300 group-hover:shadow-md ${
              !brandLogo ? 'bg-gradient-to-br from-blue-600 to-cyan-500' : ''
            }`}>
              {brandLogo
                ? <img src={brandLogo} alt={brandName} className="w-full h-full object-contain rounded-xl" />
                : <span className="text-white font-bold text-base">{brandName.slice(0, 2).toUpperCase()}</span>
              }
            </div>
            <span className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-200">
              {brandName}
            </span>
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(({ key, label, to }) => (
              <Link
                key={key}
                to={to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(to)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* ── Desktop right actions ── */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Subscribe CTA */}
            <button
              onClick={() => navigate(subscriptionPath())}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#2563eb,#0ea5e9)' }}
            >
              {isAuthenticated()
                ? user?.userType === 'business' ? 'Get a Quote' : 'Subscribe Now'
                : 'Subscribe Now'}
            </button>

            {isAuthenticated() ? (
              <Dropdown menu={{ items: userDropdownItems }} placement="bottomRight" trigger={['click']}>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-all duration-200 border border-slate-200">
                  <Avatar size={28} icon={<UserOutlined />} className="bg-blue-600" />
                  <span className="text-sm font-medium text-slate-700 max-w-[100px] truncate">{user?.name}</span>
                  <DownOutlined className="text-slate-400 text-xs" />
                </button>
              </Dropdown>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 border border-slate-200 transition-all duration-200"
                >
                  Log in
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all duration-200"
                >
                  Sign up
                </button>
              </div>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all duration-200"
            onClick={() => setOpen(v => !v)}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              {open
                ? <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <CloseOutlined className="text-slate-700 text-base" />
                  </motion.span>
                : <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <MenuOutlined className="text-slate-700 text-base" />
                  </motion.span>
              }
            </AnimatePresence>
          </button>
        </div>
      </header>

      {/* ── MOBILE MENU OVERLAY ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
            />

            {/* Slide-down panel */}
            <motion.div
              key="panel"
              ref={menuRef}
              className="fixed top-16 left-0 right-0 z-50 lg:hidden bg-white border-b border-slate-100 shadow-xl"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">

                {/* Nav links */}
                {navLinks.map(({ key, label, to, icon }) => (
                  <Link
                    key={key}
                    to={to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive(to)
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base">{icon}</span>
                    {label}
                  </Link>
                ))}

                {/* Divider */}
                <div className="h-px bg-slate-100 my-2" />

                {/* Subscribe CTA */}
                <button
                  onClick={() => navigate(subscriptionPath())}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200"
                  style={{ background: 'linear-gradient(135deg,#2563eb,#0ea5e9)' }}
                >
                  {isAuthenticated()
                    ? user?.userType === 'business' ? 'Get a Quote' : 'Subscribe Now'
                    : 'Subscribe Now'}
                </button>

                {isAuthenticated() ? (
                  <>
                    {/* User info */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl mt-1">
                      <Avatar size={36} icon={<UserOutlined />} className="bg-blue-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-800 truncate">{user?.name}</div>
                        <div className="text-xs text-slate-500 truncate">{user?.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(dashboardPath())}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all duration-200"
                    >
                      <DashboardOutlined /> Dashboard
                    </button>
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-200"
                    >
                      <LogoutOutlined /> Log out
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => navigate('/login')}
                      className="flex-1 py-3 rounded-xl text-sm font-medium text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all duration-200"
                    >
                      Log in
                    </button>
                    <button
                      onClick={() => navigate('/register')}
                      className="flex-1 py-3 rounded-xl text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all duration-200"
                    >
                      Sign up
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer so content doesn't hide under fixed navbar */}
      <div style={{ height: 64 }} />
    </>
  );
};

export default Navbar;
