import React from 'react';
import { BookOpen, Calendar, Clock, ArrowLeft, ShieldCheck, Heart } from 'lucide-react';

const ARTICLES = [
  {
    id: 1,
    title: 'راهنمای جامع خودآزمایی ماهانه پستان در منزل',
    summary: 'چگونگی لمس صحیح، زمان مناسب خودآزمایی در سیکل ماهانه و نشانه‌هایی که باید به آنها توجه کنید.',
    category: 'پیشگیری و غربالگری',
    readTime: '۵ دقیقه',
    date: 'اردیبهشت ۱۴۰۳',
  },
  {
    id: 2,
    title: 'تفاوت‌های کیست، فیبروآدنوم و توده‌های بدخیم',
    summary: 'آشنایی با انواع ضایعات پستان، روش‌های تشخیص قطعی با سونوگرافی و درمان‌های لازم برای هر گروه.',
    category: 'دانستنی‌های پزشکی',
    readTime: '۷ دقیقه',
    date: 'فروردین ۱۴۰۳',
  },
  {
    id: 3,
    title: 'مراقبت‌های ضروری قبل و بعد از جراحی ماموپلاستی',
    summary: 'نکات کلیدی برای دوره نقاهت آسان، تغذیه مناسب، استفاده از سوتین طبی و کاهش تورم پس از عمل.',
    category: 'زیبایی و مراقبت',
    readTime: '۶ دقیقه',
    date: 'اسفند ۱۴۰۲',
  },
  {
    id: 4,
    title: 'تغذیه و سبک زندگی در پیشگیری از بیماری‌های پستان',
    summary: 'نقش ورزش، وزن متناسب، رژیم غذایی سرشار از آنتی‌اکسیدان‌ها و کاهش استرس در حفظ سلامت سینه.',
    category: 'سلامت عمومی',
    readTime: '۴ دقیقه',
    date: 'بهمن ۱۴۰۲',
  },
];

const ResourcesPage = () => {
  return (
    <main className="flex-grow flex flex-col items-center w-full pt-28 md:pt-32 pb-20">
      <div className="glass-panel fade-section is-visible">
        <div className="text-center mb-12">
          <div className="text-xs md:text-sm text-primary font-bold tracking-wider mb-2 uppercase">
            مرکز آموزش و آگاهی
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-l from-primary to-primary-dark mb-4">
            مطالب و مقالات آموزشی
          </h1>
          <p className="text-textDark/75 max-w-xl mx-auto font-medium text-sm md:text-base">
            مجموعه مقالات علمی و معتبر تدوین‌شده جهت ارتقای سطح آگاهی عمومی، پیشگیری و درمان به موقع.
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {ARTICLES.map((article) => (
            <article
              key={article.id}
              className="bg-white/60 border border-primary/20 hover:border-primary/40 rounded-3xl p-6 md:p-8 shadow-sm transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 group"
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-primary/10 text-primary border border-primary/20 text-xs px-3 py-1 rounded-full font-bold">
                    {article.category}
                  </span>
                  <span className="text-xs text-textDark/50 flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {article.readTime}
                  </span>
                </div>

                <h3 className="text-lg md:text-xl font-bold text-textDark mb-3 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-textDark/75 leading-relaxed font-medium mb-6">
                  {article.summary}
                </p>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-primary/10">
                <span className="text-xs text-textDark/50 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {article.date}
                </span>

                <button className="text-primary font-bold text-xs md:text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  مطالعه مقاله
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Self Exam Box */}
        <div className="bg-gradient-to-br from-primary/15 to-primary-dark/15 border border-primary/30 p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-center gap-6 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-primary text-white flex items-center justify-center shrink-0 shadow-lg">
            <Heart className="w-8 h-8 animate-pulse" />
          </div>
          <div className="flex-1 text-center md:text-right">
            <h4 className="text-lg md:text-xl font-bold text-textDark mb-1">
              یادآور معاینه ماهانه بانوان
            </h4>
            <p className="text-textDark/80 text-sm font-medium leading-relaxed">
              بهترین زمان برای خودآزمایی ماهانه، ۲ تا ۳ روز پس از اتمام سیکل قاعدگی است. هرگونه تغییر لمس‌شده را جدی بگیرید و با پزشک مشورت کنید.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ResourcesPage;
