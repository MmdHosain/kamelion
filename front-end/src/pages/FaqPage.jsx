import React, { useState } from 'react';
import { HelpCircle, ChevronDown, MessageSquare } from 'lucide-react';

const FAQS = [
  {
    q: 'چه زمانی باید برای معاینه و بررسی توده‌های پستان به پزشک مراجعه کنیم؟',
    a: 'در صورت احساس هرگونه توده سفت، فرورفتگی پوست یا نوک سینه، ترشحات خونی یا شفاف خودبه‌خودی، تغییر سایز ناگهانی یا تغییر رنگ و قرمزی پوست، باید بلافاصله جهت معاینه دقیق و سونوگرافی/ماموگرافی مراجعه نمایید.',
  },
  {
    q: 'تفاوت ماموگرافی و سونوگرافی پستان در چیست؟',
    a: 'ماموگرافی استاندارد طلایی برای غربالگری و کشف رسوبات کلسیمی (میکروکلسیفیکاسیون) در افراد بالای ۴۰ سال است، در حالی که سونوگرافی برای تفکیک توده‌های کیستیک (حاوی مایع) از توده‌های توپر (سالید) به‌ویژه در بافت‌های متراکم و سنین زیر ۴۰ سال کاربرد دارد.',
  },
  {
    q: 'آیا پروتز سینه مانع از شیردهی یا غربالگری سرطان می‌شود؟',
    a: 'خیر، پروتزهای مدرن معمولاً زیر عضله یا زیر فاشیا قرار داده می‌شوند و آسیبی به مجاری شیردهی نمی‌زنند. همچنین با تکنیک‌های خاص جابجایی پروتز در ماموگرافی (مانند روش Eklund)، غربالگری به راحتی و با دقت کامل انجام می‌شود.',
  },
  {
    q: 'دوران نقاهت پس از جراحی ماموپلاستی یا لیفت چقدر است؟',
    a: 'اغلب بیماران پس از ۳ الی ۵ روز قادر به انجام کارهای روزمره سبک هستند. استفاده از سوتین طبی مخصوص به مدت ۶ هفته توصیه می‌شود و فعالیت‌های سنگین ورزشی معمولاً پس از ۴ تا ۶ هفته قابل از سرگیری است.',
  },
  {
    q: 'جراحی انکوپلاستی چیست و چه مزایایی دارد؟',
    a: 'انکوپلاستی تلفیق جراحی تومور سرطانی با تکنیک‌های جراحی پلاستیک است؛ به گونه‌ای که بیمار علاوه بر درمان کامل سرطان، پستان خود را حفظ کرده و شکل ظاهری قرینه و زیبایی به دست می‌آورد.',
  },
];

const FaqPage = ({ onOpenChat }) => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <main className="flex-grow flex flex-col items-center w-full pt-28 md:pt-32 pb-20">
      <div className="glass-panel fade-section is-visible">
        <div className="text-center mb-12">
          <div className="text-xs md:text-sm text-primary font-bold tracking-wider mb-2 uppercase">
            پاسخ به ابهامات
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-l from-primary to-primary-dark mb-4">
            سوالات متداول مراجعین
          </h1>
          <p className="text-textDark/75 max-w-xl mx-auto font-medium text-sm md:text-base">
            پرتکرارترین پرسش‌های بیماران در خصوص بیماری‌ها، چکاپ‌های دوره‌ای و جراحی‌های پستان.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="flex flex-col gap-4 mb-12">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white/65 border border-primary/20 rounded-3xl overflow-hidden shadow-sm transition-all duration-300"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="w-full text-right p-5 md:p-6 font-bold text-base md:text-lg text-textDark flex justify-between items-center gap-4 hover:text-primary transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-primary shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-primary shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-textDark/85 text-sm md:text-base leading-relaxed border-t border-primary/10 font-medium">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Ask Question Card */}
        <div className="bg-white/50 border border-primary/20 p-8 rounded-3xl text-center shadow-sm backdrop-blur-sm">
          <h3 className="text-xl font-bold text-textDark mb-2">سوال خود را پیدا نکردید؟</h3>
          <p className="text-textDark/70 text-sm mb-6 max-w-md mx-auto">
            می‌توانید با دستیار هوشمند تریاژ مطب به صورت آنلاین گفتگو کرده یا با کارشناسان مطب تماس بگیرید.
          </p>
          <button
            onClick={() => onOpenChat && onOpenChat()}
            className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-full shadow-md transition-all flex items-center gap-2 mx-auto"
          >
            <MessageSquare className="w-4 h-4" />
            گفتگو با دستیار هوشمند
          </button>
        </div>
      </div>
    </main>
  );
};

export default FaqPage;
