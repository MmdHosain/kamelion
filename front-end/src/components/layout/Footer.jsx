// src/components/layout/Footer.jsx
import React from 'react';
import { CONTACT_DATA } from '../../data/contact'; // Ensure path is correct

const Footer = () => {
  return (
    <footer className="bg-[#2F5D50] text-[#FAFAF8] py-10 pb-40">
      <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8 text-sm">
        <div className="space-y-4">
          <div className="font-bold text-xl text-[#E6C5CC]">دکتر نگار معشوری</div>
          <p className="opacity-90">متخصص جراحی پستان و زیبایی سینه</p>
          <div className="flex gap-3 pt-2">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-[#E6C5CC]">★</span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-bold mb-3 text-[#E6C5CC]">دسترسی سریع</h4>
          <ul className="space-y-2 opacity-90">
            <li>صفحه اصلی</li>
            <li>خدمات تخصصی</li>
            <li>سوابق پزشکی</li>
            <li>مقالات تخصصی</li>
          </ul>
        </div>
        <div className="col-span-2">
          <h4 className="font-bold mb-3 text-[#E6C5CC]">تماس</h4>
          <p className="opacity-90 mb-3">{CONTACT_DATA.address}</p>
          <div className="flex flex-col gap-1.5">
            {CONTACT_DATA.phones.map((p, i) => (
              <div key={i} className="flex items-center gap-2 opacity-90">
                <span>📱</span>
                <span>{p}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[#E6C5CC]/30 flex gap-4">
            {/* Adjust these links as needed */}
            <a href={`tel:${CONTACT_DATA.phones[0].replace(/[^0-9+]/g, '')}`} className="hover:text-[#E6C5CC] transition">
               📞 {/* Or use a phone icon */}
            </a>
             <a href="mailto:info@drhamidahmadi.ir" className="hover:text-[#E6C5CC] transition">
               📧 {/* Or use an email icon */}
            </a>
             <a href="#" className="hover:text-[#E6C5CC] transition"> {/* Replace # with actual map link if available */}
               📍 {/* Or use a map icon */}
            </a>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 pt-8 border-t border-[#E6C5CC]/30 text-center text-xs opacity-80">
        © {new Date().getFullYear()} کلیه حقوق محفوظ است. طراحی و توسعه با رعایت اصول پزشکی و اخلاق حرفه‌ای
      </div>
    </footer>
  );
};

export default Footer;