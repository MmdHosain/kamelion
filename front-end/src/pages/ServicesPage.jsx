import React from 'react';
import { Activity, Sparkles, Shield, HeartPulse, Check, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ServicesPage = ({ onOpenAppointment }) => {
  return (
    <main className="flex-grow flex flex-col items-center w-full pt-28 md:pt-32 pb-20">
      <div className="glass-panel fade-section is-visible">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-xs md:text-sm text-primary font-bold tracking-wider mb-2 uppercase">
            خدمات تخصصی
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-l from-primary to-primary-dark mb-4">
            خدمات درمانی، انکولوژی و زیبایی پستان
          </h1>
          <p className="text-textDark/75 max-w-2xl mx-auto font-medium text-sm md:text-base">
            ارائه کلیه خدمات تشخیصی، درمان بیماری‌های خوش‌خیم و بدخیم، جراحی‌های انکوپلاستی و جراحی‌های زیبایی با بهره‌گیری از جدیدترین متدهای روز جهان.
          </p>
        </div>

        {/* Section 1: درمان و انکولوژی */}
        <div id="treatment" className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-md">
              <Activity className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-textDark">
              ۱. جراحی‌ها و درمان‌های انکولوژی و بیماری‌ها
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/60 border border-primary/20 p-6 rounded-3xl shadow-sm hover:border-primary/40 transition-all">
              <h3 className="text-lg font-bold text-primary mb-2">جراحی‌های حفظ پستان (انکوپلاستی)</h3>
              <p className="text-sm text-textDark/80 leading-relaxed font-medium">
                تخلیه ضایعات و تومورهای سرطانی همراه با حفظ ظاهر طبیعی و زیباسازی بافت پستان با تکنیک‌های پیشرفته جراحی پلاستیک و انکولوژی.
              </p>
            </div>

            <div className="bg-white/60 border border-primary/20 p-6 rounded-3xl shadow-sm hover:border-primary/40 transition-all">
              <h3 className="text-lg font-bold text-primary mb-2">بیوپسی و نمونه‌برداری‌های تخصصی</h3>
              <p className="text-sm text-textDark/80 leading-relaxed font-medium">
                نمونه‌برداری با سوزن ضخیم (Core Needle Biopsy) تحت هدایت سونوگرافی با کمترین درد و بالاترین دقت تشخیصی.
              </p>
            </div>

            <div className="bg-white/60 border border-primary/20 p-6 rounded-3xl shadow-sm hover:border-primary/40 transition-all">
              <h3 className="text-lg font-bold text-primary mb-2">جراحی غده لنفاوی نگهبان (Sentinel Node)</h3>
              <p className="text-sm text-textDark/80 leading-relaxed font-medium">
                بررسی لنف‌نودهای پیشاهنگ جهت جلوگیری از تخلیه غیرضروری زیربغل و پیشگیری از تورم دست (لنف‌ادم).
              </p>
            </div>

            <div className="bg-white/60 border border-primary/20 p-6 rounded-3xl shadow-sm hover:border-primary/40 transition-all">
              <h3 className="text-lg font-bold text-primary mb-2">درمان توده‌های خوش‌خیم و فیبروآدنوم</h3>
              <p className="text-sm text-textDark/80 leading-relaxed font-medium">
                بررسی و جراحی کیست‌ها، ترشحات نوک پستان، فیبروکیستیک و توده‌های خوش‌خیم با کمترین اسکار پوستی.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: زیبایی و بازسازی */}
        <div id="beauty" className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-textDark">
              ۲. جراحی‌های زیبایی و بازسازی (ترمیمی)
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
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-8 rounded-3xl text-center shadow-xl">
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
      </div>
    </main>
  );
};

export default ServicesPage;
