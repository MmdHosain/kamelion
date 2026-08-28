import React from 'react';

const AboutSection = () => {
  return (
    <section className="w-full bg-white py-20 border-t border-secondary/30">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <img
            src="/images/IMG_2923.jpeg"
            alt="دکتر نگار معشوری"
            className="rounded-2xl shadow-xl w-full object-cover border-2 border-secondary/20"
          />
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-5 text-primary">
            رویکرد درمانی دکتر نگار معشوری
          </h2>
          <p className="leading-relaxed mb-6">
            در جراحی سینه، تصمیم درست مهم‌تر از انجام جراحی است.
            رویکرد درمانی دکتر نگار معشوری بر پایه ارزیابی علمی،
            درک شرایط فردی هر بیمار و انتخاب آگاهانه مسیر درمان شکل گرفته است.
          </p>
          <p className="leading-relaxed mb-8">
            هدف، دستیابی به نتیجه‌ای ایمن، متناسب با بدن بیمار و
            همراه با آرامش خاطر در تمام مراحل درمان است؛
            نه صرفاً تغییر ظاهری سریع.
          </p>
          <ul className="space-y-3">
            {[
              "تصمیم‌گیری درمانی بر اساس شواهد علمی",
              "اولویت ایمنی و سلامت بیمار",
              "مشاوره شفاف و صادقانه پیش از هر اقدام",
              "پیگیری دقیق پس از جراحی"
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-2 w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
