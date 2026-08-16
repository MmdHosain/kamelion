import React from 'react';
import { Award, GraduationCap, BookOpen, Stethoscope, CheckCircle2, ShieldCheck, HeartPulse } from 'lucide-react';

const AboutPage = () => {
  return (
    <main className="flex-grow flex flex-col items-center w-full pt-28 md:pt-32 pb-20">
      <div className="glass-panel fade-section is-visible">
        {/* Top Header */}
        <div className="text-center mb-10">
          <div className="text-xs md:text-sm text-primary font-bold tracking-wider mb-2 uppercase">
            درباره پزشک
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-l from-primary to-primary-dark mb-4">
            دکتر نگار معشوری
          </h1>
          <p className="text-primary font-bold text-lg md:text-xl">
            متخصص جراحی عمومی و فلوشیپ فوق‌تخصصی بیماری‌ها و جراحی پستان
          </p>
        </div>

        {/* Bio & Intro Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center mb-12">
          <div className="md:col-span-1 flex justify-center">
            <div className="relative w-56 h-56 md:w-64 md:h-64 rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-primary-dark/20 border border-primary/30 flex items-center justify-center shadow-xl p-4">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                className="w-32 h-32 text-primary"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
              </svg>
            </div>
          </div>

          <div className="md:col-span-2 text-textDark/85 text-base md:text-lg leading-relaxed font-medium">
            <p className="mb-4">
              دکتر نگار معشوری با بیش از یک دهه تجربه ارزشمند در حوزه جراحی‌های درمانی، انکولوژی و جراحی‌های زیبایی و ترمیمی پستان، همواره تلاش نموده تا مدرن‌ترین تکنیک‌های علمی دنیا را با ظرافت و دلسوزی در خدمت سلامت بانوان قرار دهد.
            </p>
            <p>
              رویکرد درمانی ایشان بر پایه تشخیص زودهنگام، تکنیک‌های انکوپلاستی (حفظ حداکثری زیبایی در جراحی‌های سرطانی) و همراهی پیوسته بیمار در تمامی مراحل درمان تا بهبودی کامل استوار است.
            </p>
          </div>
        </div>

        {/* Credentials & Education */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white/60 border border-primary/20 p-6 md:p-8 rounded-3xl shadow-sm">
            <h3 className="text-lg font-bold text-textDark mb-5 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-primary" />
              سوابق تحصیلی و دانشگاهی
            </h3>
            <ul className="flex flex-col gap-3.5 text-sm md:text-base text-textDark/80 font-medium">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>فلوشیپ فوق‌تخصصی جراحی پستان از دانشگاه علوم پزشکی تهران</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>دارای بورد تخصصی جراحی عمومی با رتبه ممتاز کشوری</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>فارغ‌التحصیل دوره دکترای پزشکی عمومی از دانشگاه علوم پزشکی تهران</span>
              </li>
            </ul>
          </div>

          <div className="bg-white/60 border border-primary/20 p-6 md:p-8 rounded-3xl shadow-sm">
            <h3 className="text-lg font-bold text-textDark mb-5 flex items-center gap-2">
              <Award className="w-6 h-6 text-primary" />
              عضویت‌های علمی و بین‌المللی
            </h3>
            <ul className="flex flex-col gap-3.5 text-sm md:text-base text-textDark/80 font-medium">
              <li className="flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>عضو انجمن جراحان پستان ایران</span>
              </li>
              <li className="flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>عضو جامعه جراحان عمومی و بین‌المللی</span>
              </li>
              <li className="flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>مولف مقالات متعدد پژوهشی در ژورنال‌های معتبر ISI</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Philosophy */}
        <div className="bg-gradient-to-r from-primary/15 to-primary-dark/15 border border-primary/30 p-6 md:p-8 rounded-3xl text-center">
          <HeartPulse className="w-10 h-10 text-primary mx-auto mb-3" />
          <h4 className="text-xl font-bold text-textDark mb-2">تعهد به آرامش و سلامت شما</h4>
          <p className="text-textDark/80 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            «هدف ما تنها درمان بیماری نیست، بلکه حفظ کیفیت زندگی، اعتماد به نفس و آرامش خاطر هر یک از مراجعین در محیطی حرفه‌ای و امن است.»
          </p>
        </div>
      </div>
    </main>
  );
};

export default AboutPage;
