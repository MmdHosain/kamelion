import React from 'react';
import { MapPin, Phone, AlertCircle, Clock, CalendarDays } from 'lucide-react';

const ContactHoursSection = () => {
  return (
    <section id="contact" className="glass-panel fade-section">
      <div className="text-xs md:text-sm text-primary font-bold tracking-wider mb-1.5 uppercase">
        مسیرهای ارتباطی
      </div>
      <h2 className="text-2xl md:text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-l from-primary to-primary-dark">
        تماس و ساعات کاری مطب
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Info Cards */}
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-4 p-4 md:p-5 rounded-3xl bg-gradient-to-br from-white/70 to-white/30 border border-primary/20 hover:bg-white shadow-sm transition-all">
            <div className="bg-white/80 border border-primary/15 p-3 rounded-2xl text-primary shrink-0 shadow-sm">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1 mt-0.5">
              <strong className="text-textDark font-bold text-base">آدرس مطب</strong>
              <span className="text-sm text-textDark/80 font-medium leading-relaxed">
                تهران، میدان ونک، خیابان ولیعصر، نرسیده به توانیر، کلینیک فوق‌تخصصی جراحی پستان
              </span>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 md:p-5 rounded-3xl bg-gradient-to-br from-white/70 to-white/30 border border-primary/20 hover:bg-white shadow-sm transition-all">
            <div className="bg-white/80 border border-primary/15 p-3 rounded-2xl text-primary shrink-0 shadow-sm">
              <Phone className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1 mt-0.5">
              <strong className="text-textDark font-bold text-base">تلفن نوبت‌دهی و پشتیبانی</strong>
              <a
                href="tel:02112345678"
                className="text-primary hover:text-primary-dark font-bold text-base tracking-wider transition-colors inline-block text-right"
                dir="ltr"
              >
                021 - 1234 5678
              </a>
            </div>
          </div>

          {/* 24-Hour Emergency Box (Red Accent) */}
          <div className="flex items-start gap-4 p-4 md:p-5 rounded-3xl bg-gradient-to-r from-red-500/15 via-red-500/10 to-transparent border border-red-500/30 hover:bg-red-500/20 transition-all shadow-sm">
            <div className="bg-white/90 border border-red-200 p-3 rounded-2xl text-red-600 shrink-0 shadow-sm">
              <AlertCircle className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex flex-col gap-1 mt-0.5">
              <strong className="text-red-700 font-black text-base flex items-center gap-2">
                شماره اورژانس ۲۴ ساعته (موارد حاد)
              </strong>
              <span className="text-xs text-textDark/70 mb-1">
                ویژه بیماران عمل‌شده و موارد فوریتی خونریزی یا درد غیرقابل کنترل
              </span>
              <a
                href="tel:09121234567"
                className="text-red-600 hover:text-red-700 font-black text-lg tracking-wider transition-colors inline-block text-right"
                dir="ltr"
              >
                0912 123 4567
              </a>
            </div>
          </div>
        </div>

        {/* Working Hours Card */}
        <div className="bg-white/50 border border-primary/20 shadow-sm rounded-3xl p-6 md:p-8 flex flex-col justify-center backdrop-blur-md">
          <h3 className="text-lg md:text-xl font-bold mb-6 flex items-center gap-3 text-textDark">
            <Clock className="w-6 h-6 text-primary" />
            برنامه حضور پزشک در مطب
          </h3>

          <ul className="flex flex-col gap-4 text-sm text-textDark/85">
            <li className="flex justify-between items-center border-b border-primary/15 pb-3.5">
              <span className="font-bold text-textDark flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" />
                شنبه تا چهارشنبه
              </span>
              <span className="bg-white/90 text-primary-dark border border-primary/15 px-3.5 py-1 rounded-xl font-bold text-xs md:text-sm shadow-sm">
                ۹:۰۰ الی ۱۸:۰۰
              </span>
            </li>

            <li className="flex justify-between items-center border-b border-primary/15 pb-3.5">
              <span className="font-bold text-textDark flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" />
                پنجشنبه
              </span>
              <span className="bg-white/90 text-primary-dark border border-primary/15 px-3.5 py-1 rounded-xl font-bold text-xs md:text-sm shadow-sm">
                ۹:۰۰ الی ۱۳:۰۰
              </span>
            </li>

            <li className="flex justify-between items-center text-textDark/60 pt-1">
              <span className="font-medium">جمعه و ایام تعطیل رسمی</span>
              <span className="text-xs font-bold text-red-600/80">
                تعطیل (فقط خط اورژانس فعال است)
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default ContactHoursSection;
