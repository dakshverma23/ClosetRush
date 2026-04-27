import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Avatar, Dropdown } from 'antd';
import {
  HomeOutlined,
  InfoCircleOutlined,
  ShoppingOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  CloseOutlined,
  MenuOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { key: 'home',    label: 'Home',           to: '/',               icon: <HomeOutlined /> },
  { key: 'science', label: "This Ain't Optional", to: '/science-behind', icon: <InfoCircleOutlined /> },
  { key: 'offers',  label: 'What We Offer',  to: '/what-we-offer',  icon: <ShoppingOutlined /> },
  { key: 'about',   label: 'About',          to: '/about',          icon: <InfoCircleOutlined /> },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [brandLogo] = useState(localStorage.getItem('brandLogo') || '');
  const [brandName] = useState(localStorage.getItem('brandName') || 'ClosetRush');
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);

  // ── Scroll Animations for Desktop Capsule Effect ──
  const { scrollY } = useScroll();
  
  const navWidth = useTransform(scrollY, [0, 100], ['100%', '92%']);
  const navTop = useTransform(scrollY, [0, 100], ['0px', '24px']);
  const navRadius = useTransform(scrollY, [0, 100], ['0px', '40px']);
  const navBgOpacity = useTransform(scrollY, [0, 100], [0.9, 1]);
  const navShadow = useTransform(
    scrollY, 
    [0, 100], 
    ['0px 0px 0px rgba(0,0,0,0)', '0px 25px 50px -12px rgba(0,0,0,0.15)']
  );

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const signUpPath = () => {
    if (!isAuthenticated()) return '/register';
    return user?.userType === 'business' ? '/business/subscriptions' : '/subscriptions';
  };

  const dashboardPath = () => {
    if (user?.userType === 'admin') return '/admin/dashboard';
    if (user?.userType === 'business') return '/business/dashboard';
    return '/dashboard';
  };

  const isActive = (to) => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  const userDropdownItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard', onClick: () => navigate(dashboardPath()) },
    { key: 'subscriptions', icon: <ShoppingOutlined />, label: 'My Subscriptions', onClick: () => navigate(signUpPath()) },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true, onClick: logout },
  ];

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <motion.header
          className="bg-white border border-slate-100 flex items-center pointer-events-auto"
          style={{
            height: 80,
            width: navWidth,
            marginTop: navTop,
            borderRadius: navRadius,
            backgroundColor: `rgba(255, 255, 255, ${navBgOpacity})`,
            backdropFilter: 'blur(16px)',
            boxShadow: navShadow,
            transition: 'width 0.4s cubic-bezier(0.25, 1, 0.5, 1)' 
          }}
        >
          <div className="w-full max-w-7xl mx-auto px-8 flex items-center justify-between">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm transition-transform duration-500 group-hover:rotate-6 ${
                !brandLogo ? 'bg-gradient-to-br from-slate-900 to-blue-800' : ''
              }`}>
                {brandLogo 
                  ? <img src={brandLogo} alt={brandName} className="w-full h-full object-contain rounded-2xl" />
                  : <span className="text-white font-black text-lg">{brandName.slice(0, 2).toUpperCase()}</span>
                }
              </div>
              <span className="text-2xl font-black tracking-tighter text-slate-900 hidden sm:block">
                {brandName}
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100/50 p-1.5 rounded-[22px] border border-slate-200/50">
              {navLinks.map(({ key, label, to }) => {
                const active = isActive(to);
                return (
                  <Link
                    key={key}
                    to={to}
                    className={`px-6 py-2.5 rounded-[18px] text-sm font-bold transition-all duration-300 ${
                      active
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-white/80'
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Right Action */}
            <div className="hidden lg:flex items-center gap-5">
              {isAuthenticated() ? (
                <Dropdown menu={{ items: userDropdownItems }} placement="bottomRight" trigger={['click']}>
                  <button className="flex items-center gap-3 p-1 pr-4 rounded-full hover:bg-slate-50 transition-all border border-slate-100 bg-white">
                    <Avatar size={36} icon={<UserOutlined />} className="bg-slate-900" />
                    <span className="text-sm font-black text-slate-800 tracking-tight">{user?.name?.split(' ')[0]}</span>
                    <DownOutlined className="text-slate-400 text-[10px]" />
                  </button>
                </Dropdown>
              ) : (
                <button
                  onClick={() => navigate('/register')}
                  className="px-8 py-3 rounded-full text-sm font-black text-white transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95"
                  style={{ 
                    background: 'linear-gradient(135deg, #0F172A 0%, #2563EB 100%)',
                  }}
                >
                  Sign up
                </button>
              )}
            </div>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              className="lg:hidden w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-900"
              onClick={() => setOpen(v => !v)}
            >
              <AnimatePresence mode="wait">
                {open ? (
                  <motion.div key="close" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <CloseOutlined />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <MenuOutlined />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </motion.header>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed inset-x-0 top-[90px] z-[49] mx-5 lg:hidden"
          >
            <div className="bg-white/90 backdrop-blur-2xl rounded-[32px] p-6 shadow-2xl border border-slate-100">
              <div className="flex flex-col gap-3">
                {navLinks.map(({ key, label, to, icon }) => (
                  <Link
                    key={key}
                    to={to}
                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-lg font-black transition-colors ${
                      isActive(to) ? 'bg-blue-600 text-white' : 'text-slate-800 bg-slate-50'
                    }`}
                  >
                    <span className="text-xl">{icon}</span> {label}
                  </Link>
                ))}
                <div className="h-px bg-slate-200 my-2" />
                <button
                  onClick={() => navigate('/register')}
                  className="w-full py-5 rounded-2xl text-white font-black text-lg bg-slate-900 shadow-xl"
                >
                  Sign up
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-28" /> {/* Fixed Spacer to prevent content overlap */}
    </>
  );
};

export default Navbar;