import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public pages
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import OAuthCallback from './pages/auth/OAuthCallback';
import ScienceBehind from './pages/public/ScienceBehind';
import WhatWeOffer from './pages/public/WhatWeOfferNew';
import AboutPage from './pages/public/AboutPage';
import GetQuotePage from './pages/public/GetQuotePage';

// Subscription pages
import IndividualSubscriptionPage from './pages/subscriptions/IndividualSubscriptionPage';
import BusinessSubscriptionPage from './pages/subscriptions/BusinessSubscriptionPage';
import CheckoutPage from './pages/subscriptions/CheckoutPage';

// Import placeholders for remaining pages
import {
  PropertyList,
  PropertyDetail,
  SubscriptionList,
  SupportTickets
} from './pages/CreatePlaceholders';

// Import real dashboards
import IndividualDashboard from './pages/dashboards/IndividualDashboard';
import BusinessDashboard from './pages/dashboards/BusinessDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import MyQuotesPage from './pages/dashboards/MyQuotesPage';

// Import admin pages
import CategoriesPage from './pages/admin/CategoriesPage';
import SupportTicketsPage from './pages/admin/SupportTicketsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminQuotesPage from './pages/admin/AdminQuotesPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import BrandSettingsPage from './pages/admin/BrandSettingsPage';
import InventoryManagementPage from './pages/admin/InventoryManagementPage';
import BundlesManagementPage from './pages/admin/BundlesManagementPage';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.userType)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated()) {
    // Redirect based on user type
    if (user?.userType === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user?.userType === 'business') {
      return <Navigate to="/business/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/science-behind" element={<ScienceBehind />} />
      <Route path="/what-we-offer" element={<WhatWeOffer />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/get-quote" element={<GetQuotePage />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/auth/callback" element={<OAuthCallback />} />

      {/* Individual User Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['individual']}>
            <IndividualDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/subscriptions" 
        element={
          <ProtectedRoute allowedRoles={['individual']}>
            <IndividualSubscriptionPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/checkout/:requestId" 
        element={
          <ProtectedRoute allowedRoles={['individual']}>
            <CheckoutPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/support" 
        element={
          <ProtectedRoute allowedRoles={['individual']}>
            <SupportTickets />
          </ProtectedRoute>
        } 
      />

      {/* Business User Routes */}
      <Route 
        path="/business/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['business']}>
            <BusinessDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/business/quotes" 
        element={
          <ProtectedRoute allowedRoles={['business']}>
            <MyQuotesPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/business/subscriptions" 
        element={
          <ProtectedRoute allowedRoles={['business']}>
            <BusinessSubscriptionPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/business/support" 
        element={
          <ProtectedRoute allowedRoles={['business']}>
            <SupportTickets />
          </ProtectedRoute>
        } 
      />

      {/* Admin Routes */}
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/analytics" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminAnalyticsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/categories" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <CategoriesPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/quotes" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminQuotesPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/support-tickets" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <SupportTicketsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/users" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminUsersPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/brand-settings" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <BrandSettingsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/inventory" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <InventoryManagementPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/bundles" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <BundlesManagementPage />
          </ProtectedRoute>
        } 
      />

      {/* 404 Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          // Primary Colors
          colorPrimary: '#2563EB',
          colorPrimaryHover: '#1D4ED8',
          colorPrimaryActive: '#1E3A8A',
          
          // Success/Secondary Colors  
          colorSuccess: '#14B8A6',
          colorSuccessHover: '#0F766E',
          
          // Background Colors
          colorBgContainer: '#FFFFFF',
          colorBgElevated: '#F1F5F9',
          colorBgLayout: '#F8FAFC',
          
          // Text Colors
          colorText: '#0F172A',
          colorTextSecondary: '#475569',
          colorTextTertiary: '#94A3B8',
          
          // Border & Radius
          borderRadius: 12,
          borderRadiusLG: 16,
          borderRadiusXS: 8,
          
          // Shadows
          boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -1px rgba(15, 23, 42, 0.06)',
          boxShadowSecondary: '0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -2px rgba(15, 23, 42, 0.05)',
          
          // Typography
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: 14,
          fontSizeLG: 16,
          fontSizeXL: 20,
          
          // Spacing
          padding: 16,
          paddingLG: 24,
          paddingXL: 32,
          
          // Motion
          motionDurationSlow: '0.3s',
          motionEaseInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        },
        components: {
          Button: {
            borderRadius: 12,
            fontWeight: 600,
            paddingInline: 24,
            paddingBlock: 12,
            boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.3)',
          },
          Card: {
            borderRadius: 16,
            boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.1)',
            paddingLG: 24,
          },
          Table: {
            borderRadius: 12,
            headerBg: '#F1F5F9',
            headerColor: '#0F172A',
            rowHoverBg: 'rgba(37, 99, 235, 0.05)',
          },
          Input: {
            borderRadius: 12,
            paddingInline: 16,
            paddingBlock: 12,
          },
          Select: {
            borderRadius: 12,
          },
          Modal: {
            borderRadius: 20,
            paddingLG: 32,
          },
          Drawer: {
            borderRadius: 16,
          },
          Layout: {
            bodyBg: '#F8FAFC',
            siderBg: '#FFFFFF',
            headerBg: '#FFFFFF',
          }
        }
      }}
    >
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AntdApp>
            <AppRoutes />
          </AntdApp>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
