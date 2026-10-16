import React from 'react';
import { Link } from 'react-router-dom';
import RibbonLogo from '../ui/RibbonLogo';

const Footer = () => {
  return (
    <footer
      id="site-footer"
      className="glass-panel !py-8 !mb-0 fade-section flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-textDark/70 font-medium border-t border-primary/20 !rounded-t-[32px] !rounded-b-none mt-16 shadow-lg"
    >
      <div className="flex items-center gap-2.5">
        <RibbonLogo className="w-5 h-5" />
        <p>© ۱۴۰۳ دکتر نگار معشوری — متخصص جراحی پستان. تمامی حقوق محفوظ است.</p>
      </div>
      <div className="flex gap-4">
        <Link to="/faq" className="hover:text-primary transition-colors">
          قوانین و مقررات
        </Link>
        <span>|</span>
        <Link to="/faq" className="hover:text-primary transition-colors">
          حریم خصوصی
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
