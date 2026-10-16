import React from 'react';
import { Activity, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TherapeuticServicesPage = ({ onOpenAppointment }) => {
  return (
    <main 
      className="flex-grow flex flex-col items-center w-full pt-28 md:pt-32 pb-20"
      style={{ animation: 'fadeIn 0.6s ease-out forwards' }}
    >
      <div className="glass-panel is-visible w-full max-w-5xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-xs md:text-sm text-primary font-bold tracking-wider mb-2 uppercase">
            خدمات درمانی
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-l from-primary to-primary-dark mb-4">
            جراحی‌ها و درمان‌های انکولوژی و بیماری‌ها
          </h1>
          <p className="text-textDark/75 max-w-2xl mx-auto font-medium text-sm md:text-base">
            ارائه کلیه خدمات تشخیصی، درمان بیماری‌های خوش‌خیم و بدخیم و جراحی‌های انکوپلاستی با بهره‌گیری از جدیدترین متدهای روز جهان.
          </p>
        </div>

        {/* Section: درمان و انکولوژی */}
        <div id="treatment" className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-md">
              <Activity className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-textDark">
               فهرست خدمات درمانی و انکولوژی
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

export default TherapeuticServicesPage;
