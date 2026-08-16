import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, UserCheck, Activity, Stethoscope, HelpCircle, BookOpen, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';

const CARDS_DATA = [
  {
    id: '01',
    index: '۰۱',
    title: 'خانه و معرفی مطب',
    desc: 'نمای کلی مطب، معرفی سریع خدمات و مسیر دسترسی به همه بخش‌های سایت.',
    link: '#hero',
    isExternal: false,
    icon: Home,
    c1: '#e75480',
    c2: '#ba2d63',
    pattern: 'dots',
  },
  {
    id: '02',
    index: '۰۲',
    title: 'آشنایی با پزشک',
    desc: 'سابقه تحصیلی، تخصص‌ها، عضویت‌های علمی و تجربه بالینی در یک نگاه.',
    link: '/about',
    isExternal: false,
    icon: UserCheck,
    c1: '#b685c2',
    c2: '#9a68a6',
    pattern: 'lines',
  },
  {
    id: '03',
    index: '۰۳',
    title: 'خدمات درمانی و انکولوژی',
    desc: 'روش‌های درمان تخصصی بیماری‌های پستان، از تشخیص اولیه تا مراقبت‌های کامل.',
    link: '/services',
    isExternal: false,
    icon: Activity,
    c1: '#e885a5',
    c2: '#cc6386',
    pattern: 'dots',
  },
  {
    id: '04',
    index: '۰۴',
    title: 'جراحی‌های زیبایی و ترمیمی',
    desc: 'ماموپلاستی، لیفت، پروتز و بازسازی پستان با مدرن‌ترین متدهای روز.',
    link: '/services',
    isExternal: false,
    icon: Stethoscope,
    c1: '#d0a0d6',
    c2: '#ad76b5',
    pattern: 'cross',
  },
  {
    id: '05',
    index: '۰۵',
    title: 'سوالات متداول مراجعین',
    desc: 'پاسخ کوتاه و شفاف به پرتکرارترین پرسش‌های بیماران پیش از مراجعه و جراحی.',
    link: '/faq',
    isExternal: false,
    icon: HelpCircle,
    c1: '#7d4a99',
    c2: '#5c3373',
    pattern: 'dots',
  },
  {
    id: '06',
    index: '۰۶',
    title: 'مطالب و مقالات آموزشی',
    desc: 'مقاله‌های علمی، خودآزمایی ماهانه و راهنماهای کاربردی برای آگاهی و پیشگیری.',
    link: '/resources',
    isExternal: false,
    icon: BookOpen,
    c1: '#a3365a',
    c2: '#7a2441',
    pattern: 'lines',
  },
];

const QuickNavSlider = () => {
  const sliderRef = useRef(null);

  const getCardWidth = () => {
    if (!sliderRef.current) return 320;
    const card = sliderRef.current.querySelector('.card');
    return card ? card.offsetWidth + 24 : 320;
  };

  const handleNext = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -getCardWidth(), behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: getCardWidth(), behavior: 'smooth' });
    }
  };

  useEffect(() => {
    let isHovered = false;
    const slider = sliderRef.current;
    if (!slider) return;

    const interval = setInterval(() => {
      if (!isHovered && slider) {
        slider.scrollBy({ left: -getCardWidth(), behavior: 'smooth' });
        if (Math.abs(slider.scrollLeft) >= slider.scrollWidth - slider.clientWidth - 15) {
          setTimeout(() => {
            if (slider) slider.scrollTo({ left: 0, behavior: 'smooth' });
          }, 600);
        }
      }
    }, 4500);

    const onEnter = () => (isHovered = true);
    const onLeave = () => (isHovered = false);

    slider.addEventListener('mouseenter', onEnter);
    slider.addEventListener('mouseleave', onLeave);

    return () => {
      clearInterval(interval);
      if (slider) {
        slider.removeEventListener('mouseenter', onEnter);
        slider.removeEventListener('mouseleave', onLeave);
      }
    };
  }, []);

  return (
    <section id="services-slider" className="glass-panel !px-3 md:!px-8 fade-section">
      <div className="text-center mb-8">
        <div className="text-xs md:text-sm text-primary font-bold tracking-wider mb-1.5 uppercase">
          خدمات و بخش‌ها
        </div>
        <h2 className="text-2xl md:text-4xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-l from-primary to-primary-dark">
          دسترسی سریع به امکانات مطب
        </h2>
        <p className="text-textDark/70 font-medium text-sm md:text-base">
          برای ورود به هر بخش، روی کارت مربوطه کلیک کنید
        </p>
      </div>

      {/* SVG Patterns */}
      <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
        <defs>
          <pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.6" fill="rgba(255,255,255,.55)" />
          </pattern>
          <pattern id="lines" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <line x1="0" y1="0" x2="0" y2="18" stroke="rgba(255,255,255,.4)" strokeWidth="1.4" />
          </pattern>
          <pattern id="cross" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M10 6v8M6 10h8" stroke="rgba(255,255,255,.4)" strokeWidth="1.5" strokeLinecap="round" />
          </pattern>
        </defs>
      </svg>

      <div className="relative flex items-center">
        <button
          onClick={handlePrev}
          aria-label="Previous"
          className="slider-btn prev absolute right-1 md:-right-5 w-11 h-11 rounded-full bg-white/90 backdrop-blur-xl border border-primary/25 text-primary flex justify-center items-center z-10 hover:bg-white hover:scale-110 transition-all shadow-xl"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="slider-container w-full" ref={sliderRef} id="slider">
          {CARDS_DATA.map((card) => {
            const Icon = card.icon;
            const isHash = card.link.startsWith('#');

            const CardContent = (
              <article
                className="card"
                style={{ '--c1': card.c1, '--c2': card.c2 }}
              >
                <div className="visual">
                  <span className="glow"></span>
                  <svg className="pattern" aria-hidden="true">
                    <rect width="100%" height="100%" fill={`url(#${card.pattern})`} />
                  </svg>
                  <span className="index">{card.index}</span>
                </div>

                <div className="badge">
                  <Icon className="w-7 h-7" />
                </div>

                <div className="body">
                  <h2>{card.title}</h2>
                  <p>{card.desc}</p>
                  <span className="more">
                    ورود به صفحه
                    <ArrowLeft className="w-4 h-4 mr-1" />
                  </span>
                </div>
              </article>
            );

            return isHash ? (
              <a key={card.id} href={card.link} className="no-underline text-inherit block shrink-0">
                {CardContent}
              </a>
            ) : (
              <Link key={card.id} to={card.link} className="no-underline text-inherit block shrink-0">
                {CardContent}
              </Link>
            );
          })}
        </div>

        <button
          onClick={handleNext}
          aria-label="Next"
          className="slider-btn next absolute left-1 md:-left-5 w-11 h-11 rounded-full bg-white/90 backdrop-blur-xl border border-primary/25 text-primary flex justify-center items-center z-10 hover:bg-white hover:scale-110 transition-all shadow-xl"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>
    </section>
  );
};

export default QuickNavSlider;
