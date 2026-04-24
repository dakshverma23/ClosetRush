import React from 'react';
import { Link } from 'react-router-dom';
import { 
  InstagramOutlined,
  YoutubeOutlined,
  PhoneOutlined,
  MailOutlined
} from '@ant-design/icons';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] text-white">
      {/* Mobile Footer - Compact */}
      <div className="block md:hidden">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-[#2563EB] to-[#14B8A6] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CR</span>
            </div>
            <span className="text-lg font-bold">ClosetRush</span>
          </div>

          {/* Quick Links */}
          <div className="flex justify-center gap-4 mb-4">
            <Link 
              to="/about" 
              className="text-white/80 hover:text-white transition-colors text-sm font-medium"
            >
              About Us
            </Link>
            <span className="text-white/40">|</span>
            <Link 
              to="/what-we-offer" 
              className="text-white/80 hover:text-white transition-colors text-sm font-medium"
            >
              Services
            </Link>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col items-center gap-2 mb-4">
            <a 
              href="tel:+1234567890" 
              className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-2"
            >
              <PhoneOutlined className="text-[#14B8A6]" />
              +1 (234) 567-890
            </a>
            <a 
              href="mailto:support@closetrush.com" 
              className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-2"
            >
              <MailOutlined className="text-[#14B8A6]" />
              support@closetrush.com
            </a>
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-3 mb-4">
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300"
            >
              <InstagramOutlined className="text-base" />
            </a>
            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300"
            >
              <YoutubeOutlined className="text-base" />
            </a>
          </div>

          {/* Copyright */}
          <p className="text-white/50 text-xs text-center">
            © {currentYear} ClosetRush. All Rights Reserved.
          </p>
        </div>
      </div>

      {/* Desktop Footer - Full */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#2563EB] to-[#14B8A6] rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">CR</span>
                </div>
                <span className="text-xl font-bold">ClosetRush</span>
              </div>
              <p className="text-white/80 text-sm leading-relaxed mb-4">
                ClosetRush is a fresh bedding subscription service who care about your sleep comfort.
              </p>
              <div className="flex gap-3">
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <InstagramOutlined className="text-lg" />
                </a>
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <YoutubeOutlined className="text-lg" />
                </a>
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="font-display text-lg font-bold mb-4">SERVICES</h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/subscriptions" 
                    className="text-white/80 hover:text-white transition-colors duration-200 text-sm"
                  >
                    Individual Subscription
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/business/subscriptions" 
                    className="text-white/80 hover:text-white transition-colors duration-200 text-sm"
                  >
                    Business Subscription
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/what-we-offer" 
                    className="text-white/80 hover:text-white transition-colors duration-200 text-sm"
                  >
                    What We Offer
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/get-quote" 
                    className="text-white/80 hover:text-white transition-colors duration-200 text-sm"
                  >
                    Get a Quote
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-display text-lg font-bold mb-4">COMPANY</h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/science-behind" 
                    className="text-white/80 hover:text-white transition-colors duration-200 text-sm"
                  >
                    Science Behind
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/about" 
                    className="text-white/80 hover:text-white transition-colors duration-200 text-sm"
                  >
                    Our Story
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/about#team" 
                    className="text-white/80 hover:text-white transition-colors duration-200 text-sm"
                  >
                    Leadership & Team
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/about#careers" 
                    className="text-white/80 hover:text-white transition-colors duration-200 text-sm"
                  >
                    Careers
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Us */}
            <div>
              <h3 className="font-display text-lg font-bold mb-4">CONTACT US</h3>
              <ul className="space-y-3">
                <li>
                  <a 
                    href="mailto:business@closetrush.com" 
                    className="text-white/80 hover:text-white transition-colors duration-200 text-sm flex items-center gap-2"
                  >
                    <MailOutlined className="text-[#14B8A6]" />
                    Business Inquiry
                  </a>
                </li>
                <li>
                  <a 
                    href="mailto:support@closetrush.com" 
                    className="text-white/80 hover:text-white transition-colors duration-200 text-sm flex items-center gap-2"
                  >
                    <MailOutlined className="text-[#14B8A6]" />
                    Customer Support
                  </a>
                </li>
                <li>
                  <a 
                    href="tel:+1234567890" 
                    className="text-white/80 hover:text-white transition-colors duration-200 text-sm flex items-center gap-2"
                  >
                    <PhoneOutlined className="text-[#14B8A6]" />
                    +1 (234) 567-890
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-white/60 text-sm text-center md:text-left">
                © {currentYear} All Rights Reserved - ClosetRush — Fresh Bedding Subscription Service
              </p>
              <div className="flex gap-6">
                <Link 
                  to="/privacy-policy" 
                  className="text-white/60 hover:text-white text-sm transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
                <Link 
                  to="/terms-of-service" 
                  className="text-white/60 hover:text-white text-sm transition-colors duration-200"
                >
                  Terms Of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
