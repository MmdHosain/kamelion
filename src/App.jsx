import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Menu, X, Sparkles, ArrowLeft, ChevronDown, Plus, Minus, MessageSquare, Instagram } from 'lucide-react';
import MessageRenderer from './components/MessageRenderer';
import AppointmentModal from './components/AppointmentModal';
import VideoPage from "./pages/VideoPage";

// --- DATA
const DATA = {
  logo: "/images/logo.png", 
  contact: {
    address: "تهران - خیابان ولیعصر - بالاتر از توانیر - روبروی بیمارستان دی-کوچه دوم-پلاک ۱-طبقه اول ",
    phones: ["۰۲۱xxxxxxx", "۰۹۱۲xxxxxxx"]
  },
  services: [
    {
      title: "مشاوره تخصصی جراحی پستان",
      icon: "🩺",
      desc: "بررسی علمی شرایط بیمار، توضیح گزینه‌های درمانی و تصمیم‌گیری آگاهانه"
    },
    {
      title: "جراحی زیبایی پستان",
      icon: "⚕️",
      desc: "شامل پروتز، لیفت و اصلاح فرم با اولویت ایمنی و تناسب فردی"
    },
    {
      title: "جراحی ترمیمی پستان",
      icon: "🔬",
      desc: "اصلاح جراحی‌های قبلی یا ناهنجاری‌های مادرزادی با رویکرد تخصصی"
    },
    {
      title: "جراحی سینه پس از بارداری یا کاهش وزن",
      icon: "🧠",
      desc: "بازگرداندن فرم طبیعی سینه با در نظر گرفتن سلامت بافت"
    },
    {
      title: "پیگیری و مراقبت پس از جراحی",
      icon: "🧾",
      desc: "برنامه‌ریزی دقیق و همراهی مرحله‌به‌مرحله تا بهبودی کامل"
    },
    {
      title: "ارزیابی و تصمیم‌گیری درمانی",
      icon: "📋",
      desc: "بررسی اینکه آیا جراحی بهترین انتخاب برای شما هست یا خیر"
    }
  ]
};


const App = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [appState, setAppState] = useState('closed'); // closed | minimized | maximized
  const [heroInput, setHeroInput] = useState('');
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState("home"); 


  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [tabs, setTabs] = useState([
    { id: Date.now(), title: 'چت ۱', messages: [], input: '' },
  ]);
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const activeTab = tabs.find(t => t.id === activeTabId);

  // --- Tab & Chat Functions ---
  const addNewTab = () => {
    const newId = Date.now();
    setTabs([...tabs, { id: newId, title: `چت ${tabs.length + 1}`, messages: [], input: '' }]);
    setActiveTabId(newId);
  };

  const closeTab = (e, tabId) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);
    if (activeTabId === tabId) setActiveTabId(newTabs[newTabs.length - 1].id);
  };

   const handleSendMessage = (text) => {
    if (!text.trim()) return;
    const userMessage = { role: 'user', type: 'text', content: text };
    
    // شبیه‌سازی منطق پاسخ‌دهی برای نمایش اسلایدر
    let aiMessage;

    // سناریو 1: اگر کاربر کلمه "خدمات" یا "نمونه" یا "service" را تایپ کرد
    if (text.includes('خدمات') || text.includes('نمونه') || text.includes('service') || text.includes('slider')) {
        aiMessage = { 
            role: 'ai', 
            type: 'slider', // <--- نوع پیام اسلایدر
            content: 'این‌ها برخی از محبوب‌ترین خدمات تخصصی ما هستند که با جدیدترین متدهای روز دنیا ارائه می‌شوند:',
            payload: [
                {
                    title: 'تزریق ژل لب روسی',
                    desc: 'فرم‌دهی طبیعی و حجم‌دهی با بهترین برندهای اروپایی',
                    img_path: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=2070&auto=format&fit=crop',
                    price: 'تخفیف ویژه'
                },
                {
                    title: 'هایفوتراپی صورت',
                    desc: 'لیفتینگ و جوانسازی بدون جراحی در یک جلسه',
                    img_path: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=2070&auto=format&fit=crop',
                    price: 'محبوب'
                },
                {
                    title: 'لیزر موهای زائد',
                    desc: 'دستگاه الکساندرایت کندلا 2024 بدون درد',
                    img_path: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=2070&auto=format&fit=crop',
                    price: 'جشنواره'
                },
                {
                    title: 'کاشت مو طبیعی',
                    desc: 'تراکم بالا با خط رویش طبیعی و ضمانت نامه',
                    img_path: 'https://images.unsplash.com/photo-1552693673-1bf958298935?q=80&w=2073&auto=format&fit=crop',
                    price: 'مشاوره رایگان'
                }
            ]
        };
    } 
    // سناریو 2: فرم
    else if (text.includes('form') || text.includes('نوبت')) {
      aiMessage = { role: 'ai', type: 'form', payload: { fields: [{type:'text', name:'نام و نام خانوادگی'}, {type:'text', name:'شماره تماس'}], submitLabel: 'درخواست مشاوره' }};
    } 
    // سناریو 3: متن عادی
    else {
      aiMessage = {
        role: 'ai', type: 'text',
        content: 'درخواست شما دریافت شد. برای مشاهده خدمات ما کلمه "خدمات" را تایپ کنید.'
      };
    }

    setTabs(prev => prev.map(tab => 
      tab.id === activeTabId 
        ? { ...tab, messages: [...tab.messages, userMessage, aiMessage], input: '' }
        : tab
    ));
  };

  const handleHeroSubmit = () => {
    if (!heroInput.trim()) return;
    handleSendMessage(heroInput);
    setAppState('maximized');
    setHeroInput('');
  };

return (
  <div className="min-h-screen flex flex-col font-sans bg-[#FAFAF8] text-[#6B6E6C] dir-rtl">
    
    {/* 1. Header (Navigation) - Brand-Aligned */}
    <header
      className={`sticky top-0 z-50 flex items-center backdrop-blur-xl transition-all duration-700 ease-in-out ${
        scrolled
          ? 'bg-white/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.2)] py-2'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">

        {/* LOGO + Title */}
        <div className="flex items-center gap-3 cursor-pointer select-none">
          <img
            src={DATA.logo}
            alt="Logo"
            className={`transition-all duration-500 ${scrolled ? 'h-9' : 'h-10'}`}
          />
          <h1 className="hidden md:flex text-[#2F5D50] text-lg font-bold tracking-tight">
            دکتر <span className="font-normal ml-1">نگار معشوری</span>
          </h1>
        </div>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex gap-8 items-center text-sm font-semibold text-[#3B3D3B] relative">
          {[
            { label: 'صفحه نخست', onClick: () => setPage('home') },
            { label: 'ویدیو', onClick: () => setPage('video') },
            { label: 'درباره', onClick: () => {} },
            { label: 'تماس', onClick: () => {} },
          ].map((item, i) => (
            <button
              key={i}
              onClick={item.onClick}
              className="relative transition-all duration-300 hover:text-[#2F5D50] group"
            >
              {item.label}
              <span
                className="absolute left-0 right-0 mx-auto -bottom-1 w-0 group-hover:w-full h-[2px] rounded-full bg-[#2F5D50] transition-all duration-300 ease-in-out"
              />
            </button>
          ))}
        </nav>

        {/* CTA + Mobile Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="bg-gradient-to-r from-[#2F5D50] to-[#264C42] hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm shadow-md hover:shadow-lg transition-all"
          >
            دریافت نوبت
          </button>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-md hover:bg-[#2F5D50]/10 transition-all duration-300"
          >
            <Menu className="text-[#2F5D50]" size={24} />
          </button>

        </div>
      </div>

      {/* ===== MOBILE MENU OVERLAY (FIXED) ===== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50">
          
          {/* BACKDROP */}
          <div
            className="absolute inset-0 bg-[#FAFAF8]/90 backdrop-blur-md"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* MENU CONTENT */}
          <div className="relative w-full h-screen flex flex-col items-center justify-center gap-8 text-lg font-medium text-[#2F5D50]">

            {/* CLOSE BUTTON */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-6 left-6 w-10 h-10 flex items-center justify-center rounded-full bg-[#2F5D50]/10 hover:bg-[#2F5D50]/20 transition"
            >
              <X size={20} />
            </button>

            {[
              { label: 'صفحه نخست', action: () => setPage('home') },
              { label: 'ویدیو', action: () => setPage('video') },
              { label: 'درباره', action: () => {} },
              { label: 'تماس', action: () => {} },
            ].map((m, i) => (
              <button
                key={i}
                onClick={() => {
                  m.action();
                  setMobileMenuOpen(false);
                }}
                className="w-48 py-3 rounded-xl bg-[#E6C5CC]/20 hover:bg-[#E6C5CC]/40 transition shadow-sm hover:shadow-md"
              >
                {m.label}
              </button>
            ))}

            <button
              onClick={() => {
                setOpen(true);
                setMobileMenuOpen(false);
              }}
              className="bg-gradient-to-r from-[#2F5D50] to-[#264C42] text-white py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition"
            >
              دریافت نوبت
            </button>

          </div>
        </div>
      )}
    </header>

    {/* 2. Scrollable Content Sections */}
    {page === "home" && (
    <main className="flex-grow flex flex-col items-center w-full pb-40">
    
      {/* Hero Section - Medical Elegance */}
      <section className="relative w-full h-[420px] md:h-[456px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/fac624df-a6d0-4eea-a6ac-26782fd1ba69.png')" }}
        />
        <div className="absolute inset-0 bg-[#2F5D50]/60"></div>

        <div className="relative z-10 h-full max-w-6xl mx-auto px-4">
          <div className="h-full flex flex-col justify-center items-center md:items-start text-center md:text-right gap-3">
            <h1 className="text-white font-bold text-[28px] sm:text-[32px] md:text-[46px] drop-shadow-lg">
              دکتر نگار معشوری
            </h1>
            <p className="text-white font-light text-[18px] sm:text-[20px] md:text-[26px] drop-shadow-md">
              فلوشیپ جراحی پستان
            </p>
            <p className="text-white/90 font-light text-[16px] sm:text-[18px] md:text-[22px]">
              تخصص، دقت، آرامش در درمان
            </p>
            <div className="flex gap-4 mt-6 flex-wrap justify-center md:justify-start">
              <a
                href="https://drhamidahmadi.ir/contact/"
                className="bg-[#2F5D50] hover:bg-[#264C42] text-white font-medium text-[15px] md:text-[16px] px-6 md:px-8 py-3 rounded-md shadow-lg hover:shadow-xl transition-all"
              >
                ویزیت حضوری
              </a>
              <a
                href="https://web.whatsapp.com/send?phone=989212129902"
                className="bg-[#E6C5CC] hover:bg-[#d9b2bb] text-[#2F5D50] font-medium text-[15px] md:text-[16px] px-6 md:px-8 py-3 rounded-md shadow-lg hover:shadow-xl transition-all border border-[#2F5D50]/10"
              >
                ویزیت آنلاین
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section - Professional & Calm */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-4 text-[#2F5D50]">
          خدمات تخصصی جراحی پستان
        </h2>
        <p className="text-center max-w-2xl mx-auto mb-12">
          تمامی خدمات بر پایه تصمیم‌گیری علمی، ایمنی بیمار و مشاوره آگاهانه ارائه می‌شوند.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {DATA.services.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-8 rounded-2xl border border-[#E6C5CC]/30 hover:shadow-md transition group"
            >
              <div className="text-3xl mb-5 w-14 h-14 flex items-center justify-center rounded-full bg-[#E6C5CC]/20 text-[#2F5D50]">
                {item.icon}
              </div>
              <h3 className="font-semibold text-xl mb-3 text-[#2F5D50]">
                {item.title}
              </h3>
              <p className="leading-relaxed text-sm mb-4">
                {item.desc}
              </p>
              <button className="mt-4 text-sm font-medium text-[#2F5D50] hover:text-[#264C42] flex items-center gap-1 transition">
                اطلاعات بیشتر <span>→</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* About Section - Trust & Professionalism */}
      <section className="w-full bg-white py-20 border-t border-[#E6C5CC]/30">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src="/images/IMG_2923.jpeg"
              alt="دکتر نگار معشوری"
              className="rounded-2xl shadow-xl w-full object-cover border-2 border-[#E6C5CC]/20"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-5 text-[#2F5D50]">
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
                  <span className="mt-2 w-2 h-2 bg-[#2F5D50] rounded-full flex-shrink-0"></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
    )}

    {page === "video" && (
      <VideoPage onBack={() => setPage("home")} />
      )}

    {/* Footer - Professional Medical Branding */}
    <footer className="bg-[#2F5D50] text-[#FAFAF8] py-10 pb-40">
      <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8 text-sm">
        <div className="space-y-4">
          <div className="font-bold text-xl text-[#E6C5CC]">دکتر نگار معشوری</div>
          <p className="opacity-90">متخصص جراحی پستان و زیبایی سینه</p>
          <div className="flex gap-3 pt-2">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-[#E6C5CC]">★</span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-bold mb-3 text-[#E6C5CC]">دسترسی سریع</h4>
          <ul className="space-y-2 opacity-90">
            <li>صفحه اصلی</li>
            <li>خدمات تخصصی</li>
            <li>سوابق پزشکی</li>
            <li>مقالات تخصصی</li>
          </ul>
        </div>
        <div className="col-span-2">
          <h4 className="font-bold mb-3 text-[#E6C5CC]">تماس</h4>
          <p className="opacity-90 mb-3">{DATA.contact.address}</p>
          <div className="flex flex-col gap-1.5">
            {DATA.contact.phones.map((p, i) => (
              <div key={i} className="flex items-center gap-2 opacity-90">
                <span>📱</span>
                <span>{p}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[#E6C5CC]/30 flex gap-4">
            {[{icon: '📱', link: '#'}, {icon: '📧', link: '#'}, {icon: '📍', link: '#'}].map((item, i) => (
              <a key={i} href={item.link} className="hover:text-[#E6C5CC] transition">
                {item.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 pt-8 border-t border-[#E6C5CC]/30 text-center text-xs opacity-80">
        © {new Date().getFullYear()} کلیه حقوق محفوظ است. طراحی و توسعه با رعایت اصول پزشکی و اخلاق حرفه‌ای
      </div>
    </footer>

    {/* FIXED AI INPUT BOX - Medical Assistant Vibe */}
    <div className={`fixed z-30 left-0 right-0 px-4 transition-all duration-500 ease-out
      ${appState === 'closed' ? 'bottom-8 opacity-100 translate-y-0' : 'bottom-[-100px] opacity-0 translate-y-10 pointer-events-none'}
    `}>
      <div className="max-w-xl mx-auto w-full relative group">
        {/* Subtle Medical Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#2F5D50]/30 to-[#E6C5CC]/30 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
        
        <div className="relative bg-white/95 backdrop-blur-sm border border-[#E6C5CC]/20 rounded-2xl shadow-lg flex items-center p-2 pr-4 transition-all hover:shadow-xl">
          <div className="text-[#2F5D50] animate-pulse mr-2">
            <Sparkles size={20} />
          </div>
          <input 
            type="text"
            value={heroInput}
            onChange={(e) => setHeroInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleHeroSubmit()}
            placeholder="سوال خود را از دستیار پزشکی بپرسید..."
            className="flex-1 py-3 px-3 bg-transparent outline-none text-[#2F5D50] placeholder-[#6B6E6C]/60 text-base font-medium"
          />
          <button 
            onClick={handleHeroSubmit}
            className={`p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center shadow-sm
              ${heroInput 
                ? 'bg-[#2F5D50] hover:bg-[#264C42] text-white scale-105' 
                : 'bg-[#E6C5CC]/30 text-[#2F5D50]/70 hover:bg-[#E6C5CC]/40'
              }`}
          >
            {heroInput ? <ArrowLeft size={18} /> : <MessageSquare size={18} />}
          </button>
        </div>
        <div className="absolute -bottom-6 left-0 right-0 text-center text-[11px] text-[#6B6E6C] font-medium">
          پاسخگویی تخصصی • مشاوره رایگان • رزرو نوبت آنلاین
        </div>
      </div>
    </div>

    {/* CHAT OVERLAY - Medical Professional Theme */}
    <div
      className={`fixed inset-0 z-[9999] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] 
        ${appState === 'closed' ? 'pointer-events-none bg-black/0' : 'bg-black/30 backdrop-blur-sm'}
      `}
    >
      <div className={`fixed bottom-0 left-0 right-0 bg-[#0f1715] border-t border-[#2F5D50]/30 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col
        ${appState === 'maximized' ? 'h-[85vh] translate-y-0 rounded-t-3xl' : 
          appState === 'minimized' ? 'h-16 translate-y-0 rounded-t-xl' : 
          'translate-y-full'}
      `}>
        
        {appState === 'minimized' && (
          <div onClick={() => setAppState('maximized')} className="flex-1 flex items-center justify-between px-6 cursor-pointer hover:bg-[#1a2522] rounded-t-xl">
            <div className="flex items-center gap-3 text-white text-sm">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2F5D50] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#E6C5CC]"></span>
              </span>
              ادامه گفتگو با دستیار پزشکی...
            </div>
            <button onClick={(e)=>{e.stopPropagation(); setAppState('closed')}}>
              <X className="text-[#6B6E6C] hover:text-[#E6C5CC]"/>
            </button>
          </div>
        )}

        {appState === 'maximized' && (
          <>
            <div className="bg-[#1a2522] px-4 py-3 border-b border-[#2F5D50]/40 rounded-t-3xl flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-white font-medium text-sm">
                  <Sparkles size={16} className="text-[#E6C5CC]"/>
                  دستیار پزشکی دکتر معشوری
                </div>
                <div className="flex gap-3 text-[#6B6E6C]">
                  <button onClick={() => setAppState('minimized')} className="hover:text-[#E6C5CC]"><Minus size={18}/></button>
                  <button onClick={() => setAppState('closed')} className="hover:text-[#E6C5CC]"><X size={18}/></button>
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {tabs.map(tab => (
                  <div key={tab.id} onClick={() => setActiveTabId(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer flex items-center gap-2 transition border
                      ${activeTabId === tab.id 
                        ? 'bg-[#2F5D50]/20 border-[#2F5D50] text-white' 
                        : 'bg-white/5 border-transparent text-[#6B6E6C] hover:bg-white/10 hover:text-[#E6C5CC]'
                      }`}
                  >
                    {tab.title}
                    {tabs.length > 1 && <X size={12} onClick={(e)=>closeTab(e, tab.id)} className="hover:text-[#E6C5CC]"/>}
                  </div>
                ))}
                <button onClick={addNewTab} className="p-1.5 bg-white/5 rounded-lg text-[#6B6E6C] hover:text-[#E6C5CC] hover:bg-white/10">
                  <Plus size={14}/>
                </button>
              </div>
            </div>

            <div className="flex-1 bg-[#0a110f] overflow-hidden relative flex flex-col">
              {activeTab && (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-scroll">
                    {activeTab.messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-[#6B6E6C] text-sm">
                        <div className="bg-[#2F5D50]/10 p-4 rounded-2xl mb-3">
                          <MessageSquare size={36} className="text-[#2F5D50] opacity-80"/>
                        </div>
                        <p>با دستیار پزشکی خود گفتگو کنید</p>
                        <p className="text-xs mt-1 opacity-70">سوالات تخصصی خود را درباره جراحی پستان بپرسید</p>
                      </div>
                    ) : (
                      activeTab.messages.map((msg, i) => <MessageRenderer key={i} message={msg} />)
                    )}
                  </div>
                  <div className="p-4 bg-[#111c18] border-t border-[#2F5D50]/30">
                    <div className="relative flex items-center gap-2">
                      <input 
                        value={activeTab.input}
                        onChange={(e) => setTabs(prev => prev.map(t => t.id === activeTabId ? {...t, input: e.target.value} : t))}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(activeTab.input)}
                        placeholder="سوال خود را بنویسید..."
                        className="flex-1 bg-[#1a2522] text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#2F5D50]/50 border border-[#2F5D50]/20"
                      />
                      <button 
                        onClick={() => handleSendMessage(activeTab.input)} 
                        className="bg-[#2F5D50] hover:bg-[#264C42] text-white p-3 rounded-xl hover:scale-105 transition-transform shadow-lg"
                      >
                        <ArrowLeft size={18}/>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
    <AppointmentModal open={open} onClose={() => setOpen(false)} />
  </div>
);
};

export default App;
