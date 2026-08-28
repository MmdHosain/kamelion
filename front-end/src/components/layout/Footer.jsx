import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer
      id="site-footer"
      className="glass-panel !py-8 !mb-0 fade-section flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-textDark/70 font-medium border-t border-primary/20 !rounded-t-[32px] !rounded-b-none mt-16 shadow-lg"
    >
      <div className="flex items-center gap-2">
        <svg
          className="w-5 h-5 text-primary"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M8 9.5a4 4 0 1 0 8 0c0-2-1.5-4-2.5-4.5-1-.5-2.5-1-3-1s-2 .5-3 1-2.5 2.5-2.5 4.5z" />
          <path d="M8 9.5c0 2 1.5 4.5 3 6.5l-3 6.5" />
          <path d="M16 9.5c0 2-1.5 4.5-3 6.5l3 6.5" />
        </svg>
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
