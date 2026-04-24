import React from 'react';
import { Layout } from 'antd';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import HeroSection from '../../components/sections/HeroSection';
import SalesBannerStrip from '../../components/sections/SalesBannerStrip';
import WhatHappensSection from '../../components/sections/WhatHappensSection';
import WhatWeOfferSection from '../../components/sections/WhatWeOfferSection';
import PricingSection from '../../components/sections/PricingSection';
import CTASection from '../../components/sections/CTASection';
import NewsletterSection from '../../components/sections/NewsletterSection';

const { Content } = Layout;

const HomePage = () => {
  return (
    <Layout className="min-h-screen">
      <Navbar />
      <Content>
        <HeroSection />
        <SalesBannerStrip />
        <WhatHappensSection />
        <WhatWeOfferSection />
        <PricingSection />
        <CTASection />
        <NewsletterSection />
      </Content>
      <Footer />
    </Layout>
  );
};

export default HomePage;
