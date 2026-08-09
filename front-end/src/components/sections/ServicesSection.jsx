import React from 'react';
import { SERVICES_DATA } from '../../data/services';

const ServicesSection = () => {
  return (
    <section className="container mx-auto px-4 py-20">
      <h2 className="text-3xl font-bold text-center mb-4 text-primary">
        خدمات تخصصی جراحی پستان
      </h2>
      <p className="text-center max-w-2xl mx-auto mb-12">
        تمامی خدمات بر پایه تصمیم‌گیری علمی، ایمنی بیمار و مشاوره آگاهانه ارائه می‌شوند.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {SERVICES_DATA.map((item, idx) => (
          <div
            key={idx}
            className="bg-white p-8 rounded-2xl border border-secondary/30 hover:shadow-md transition group"
          >
            <div className="text-3xl mb-5 w-14 h-14 flex items-center justify-center rounded-full bg-secondary/20 text-primary">
              {item.icon}
            </div>
            <h3 className="font-semibold text-xl mb-3 text-primary">
              {item.title}
            </h3>
            <p className="leading-relaxed text-sm mb-4">
              {item.desc}
            </p>
            <button className="mt-4 text-sm font-medium text-primary hover:text-primaryLight flex items-center gap-1 transition">
              اطلاعات بیشتر <span>→</span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ServicesSection;
