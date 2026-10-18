import React from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AestheticServicesPage = ({ onOpenAppointment }) => {
  return (
    <main 
      className="flex-grow flex flex-col items-center w-full pt-28 md:pt-32 pb-20"
      style={{ animation: 'fadeIn 0.6s ease-out forwards' }}
    >
      <div className="glass-panel is-visible w-full max-w-5xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-xs md:text-sm text-primary font-bold tracking-wider mb-2 uppercase">
            خدمات زیبایی
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-l from-primary to-primary-dark mb-4">
            جراحی‌های زیبایی و بازسازی (ترمیمی)
          </h1>
          <p className="text-textDark/75 max-w-2xl mx-auto font-medium text-sm md:text-base">
            ارائه کلیه جراحی‌های زیبایی، فرم‌دهی و بازسازی بافت پستان با بهره‌گیری از جدیدترین متدهای روز جهان.
          </p>
        </div>

        {/* Section: زیبایی و بازسازی */}
        <div id="beauty" className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-textDark">
              فهرست جراحی‌های زیبایی و ترمیمی
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/60 border border-primary/20 p-6 rounded-3xl shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-primary mb-2">ماموپلاستی (کاهش و فرم‌دهی)</h3>
                <p className="text-sm text-textDark/80 leading-relaxed font-medium">
                  کوچک کردن سینه‌های سنگین و برطرف کردن دردهای گردن و شانه همراه با متقارن‌سازی و فرم‌دهی زیبا.
                </p>
              </div>
            </div>

            <div className="bg-white/60 border border-primary/20 p-6 rounded-3xl shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-primary mb-2">ماستوپکسی (لیفت پستان)</h3>
                <p className="text-sm text-textDark/80 leading-relaxed font-medium">
                  رفع افتادگی ناشی از بارداری، شیردهی یا کاهش وزن و بازگرداندن استحکام و جوانی به بافت سینه.
                </p>
              </div>
            </div>

            <div className="bg-white/60 border border-primary/20 p-6 rounded-3xl shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-primary mb-2">پروتز و بازسازی پس از درمان</h3>
                <p className="text-sm text-textDark/80 leading-relaxed font-medium">
                  افزایش حجم با معتبرترین برندهای پروتز سیلیکونی دنیا و بازسازی کامل پستان پس از ماستکتومی.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Box */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-8 rounded-3xl text-center shadow-xl mb-12">
          <h3 className="text-2xl font-black mb-3">نیاز به مشاوره اختصاصی با پزشک دارید؟</h3>
          <p className="text-white/90 text-sm md:text-base max-w-lg mx-auto mb-6">
            شما می‌توانید مدارک و سوابق پزشکی خود را در جلسه ویزیت همراه بیاورید تا بهترین مسیر درمانی برای شما برنامه‌ریزی شود.
          </p>
          <button
            onClick={onOpenAppointment}
            className="bg-white text-primary font-black py-3 px-8 rounded-full shadow-lg hover:bg-gray-50 transition-all hover:scale-105"
          >
            دریافت نوبت ویزیت حضوری
          </button>
        </div>

        {/* Back to Home Button */}
        <div className="flex justify-center mt-8 pb-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-primary hover:text-primary-dark font-bold bg-white/70 px-6 py-3 rounded-full border border-primary/30 hover:border-primary/60 transition-all shadow-sm hover:shadow-md"
          >
            بازگشت به صفحه اصلی
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </main>
  );
};

export default AestheticServicesPage;
