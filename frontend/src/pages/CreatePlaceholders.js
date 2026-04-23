// This file creates all placeholder pages
import React from 'react';
import { Layout, Typography } from 'antd';
import Navbar from '../components/layout/Navbar';

const { Content } = Layout;
const { Title } = Typography;

export const createPlaceholderPage = (title) => {
  return () => (
    <Layout className="min-h-screen">
      <Navbar />
      <Content className="p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <Title level={2}>{title}</Title>
          <p>This page is under construction.</p>
        </div>
      </Content>
    </Layout>
  );
};

// Export all placeholder pages
export const ScienceBehind = createPlaceholderPage('The Science Behind Clean Bedding');
export const WhatWeOffer = createPlaceholderPage('What We Offer');
export const PricingPage = createPlaceholderPage('Pricing');
export const GetQuotePage = createPlaceholderPage('Get a Quote');
export const IndividualDashboard = createPlaceholderPage('My Dashboard');
export const BusinessDashboard = createPlaceholderPage('Business Dashboard');
export const PropertyList = createPlaceholderPage('My Properties');
export const PropertyDetail = createPlaceholderPage('Property Details');
export const AdminDashboard = createPlaceholderPage('Admin Dashboard');
export const SubscriptionList = createPlaceholderPage('My Subscriptions');
export const SupportTickets = createPlaceholderPage('Support Tickets');
