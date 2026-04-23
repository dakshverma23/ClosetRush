import React from 'react';
import { Layout } from 'antd';
import Navbar from '../../components/layout/Navbar';
import HeroSection from '../../components/sections/HeroSection';
import SalesBannerStrip from '../../components/sections/SalesBannerStrip';
import WhatHappensSection from '../../components/sections/WhatHappensSection';
import WhatWeOfferSection from '../../components/sections/WhatWeOfferSection';
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
        <CTASection />
        <NewsletterSection />
      </Content>
    </Layout>
  );
};

export default HomePage;
