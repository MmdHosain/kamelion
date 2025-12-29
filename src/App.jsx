  import React, { useState } from 'react';
import { Phone, MapPin, Menu, X, ChevronDown, Instagram } from 'lucide-react';



// Data parsed directly from your source content
const DATA = {
  logo: "https://mehrafrouzclinic.com/wp-content/uploads/2023/10/Logo-mehrafrouz-new.webp",
  contact: {
    address: "تهران، نیاوران، روبروی جماران، جنب بانک سامان، پلاک 148، طبقه دوم",
    phones: ["۰۲۱۹۱۲۰۰۷۰۰", "۰۹۱۲۳۳۳۶۷۵۳"]
  },
  nav: [
    { title: "صفحه نخست", link: "#" },
    {
      title: "خدمات زیبایی",
      items: [
        { name: "رفع موهای زائد", link: "#" },
        { name: "تزریقات زیبایی (بوتاکس، ژل)", link: "#" },
        { name: "جوانسازی (هایفو، فیشیال)", link: "#" },
        { name: "جراحی های زیبایی (ساکشن)", link: "#" },
        { name: "کاشت (مو، ابرو، ریش)", link: "#" }
      ]
    },
    {
      title: "خدمات درمانی",
      items: [
        { name: "درمان لک صورت", link: "#" },
        { name: "درمان پیسی", link: "#" },
        { name: "درمان منافذ باز", link: "#" },
        { name: "درمان جوش و آکنه", link: "#" }
      ]
    }
  ]
};

const App = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [appState, setAppState] = useState('closed');
const [tabs, setTabs] = useState([
  {
    id: Date.now(),
    title: 'چت ۱',
    messages: [],
    input: '',
  },
]);

const [activeTabId, setActiveTabId] = useState(tabs[0].id);
const activeTab = tabs.find(t => t.id === activeTabId);


  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Top Bar - Contact Info */}
      <div className="bg-dark text-white text-xs py-2 px-4 hidden md:block">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex gap-4 items-center">
            {DATA.contact.phones.map((phone, idx) => (
              <a key={idx} href={`tel:${phone}`} className="flex items-center gap-1 hover:text-gold transition">
                <Phone size={14} />
                <span>{phone}</span>
              </a>
            ))}
          </div>
          <div className="flex items-center gap-1 opacity-80">
            <MapPin size={14} />
            <span>{DATA.contact.address}</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-100">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          {/* Logo */}
          <div className="w-32 md:w-40">
            <img src={DATA.logo} alt="Mehr Afrouz Clinic" className="w-full h-auto object-contain" />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-700">
            {DATA.nav.map((item, index) => (
              <div key={index} className="group relative cursor-pointer">
                <div className="flex items-center gap-1 hover:text-gold py-4">
                  {item.title}
                  {item.items && <ChevronDown size={14} />}
                </div>
                
                {/* Dropdown */}
                {item.items && (
                  <div className="absolute top-full right-0 bg-white shadow-lg rounded-b-lg w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border-t-2 border-gold transform translate-y-2 group-hover:translate-y-0">
                    <ul className="py-2">
                      {item.items.map((subItem, subIndex) => (
                        <li key={subIndex}>
                          <a href={subItem.link} className="block px-4 py-2 hover:bg-gray-50 hover:text-gold text-right">
                            {subItem.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-4">
            {DATA.nav.map((item, index) => (
              <div key={index} className="border-b border-gray-100 pb-2">
                <div className="font-bold text-gray-800 mb-2">{item.title}</div>
                {item.items && (
                  <ul className="pr-4 space-y-2 text-sm text-gray-600">
                    {item.items.map((sub, idx) => (
                      <li key={idx}>{sub.name}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            <div className="pt-4 text-sm text-center">
              <p>{DATA.contact.address}</p>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section (Mock) */}
      <main className="flex-grow">
        <section className="bg-gray-100 py-20 text-center px-4">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-6">
            کلینیک جوانه
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            بهترین کلینیک زیبایی در تهران
          </p>
          <div className="flex gap-4 justify-center">
             <button className="bg-gold hover:bg-yellow-600 text-white px-8 py-3 rounded-md transition shadow-lg">
                دریافت نوبت
             </button>
             <button className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-md hover:bg-gray-50 transition">
                خدمات ما
             </button>
          </div>
        </section>

        {/* Services Grid Mock */}
        <section className="py-16 container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10 text-gray-800">خدمات محبوب</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['لیزر موهای زائد', 'تزریق ژل و بوتاکس', 'کاشت مو و ابرو'].map((svc, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition border border-gray-100 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center text-gold">
                   <div className="w-8 h-8 bg-gold rounded-full opacity-50"></div>
                </div>
                <h3 className="font-bold text-lg mb-2">{svc}</h3>
                <p className="text-sm text-gray-500">ارائه جدیدترین متدهای روز دنیا در کلینیک مهرافروز</p>
              </div>
            ))}
          </div>
        </section>
      </main>
{/* Premium ChatGPT Style Input */}
{/* Fixed AI Input */}
<section
  className="fixed bottom-4 left-0 right-0 z-[9999] px-4 pointer-events-none"
>
  <div className="max-w-5xl mx-auto pointer-events-auto">
    <div
      className="bg-[#1f1f1f] rounded-2xl border border-[#2a2a2a]
                 shadow-[0_20px_60px_rgba(0,0,0,0.9)]
                 overflow-hidden"
    >

      {/* Input Row */}
      <div className="flex items-center gap-3 px-5 py-4">

        {/* Plus */}
        <button
          className="w-9 h-9 flex items-center justify-center rounded-full 
                     border border-gray-600 text-gray-400 
                     hover:border-gold hover:text-gold transition"
        >
          +
        </button>

        {/* Input */}
        <input
          type="text"
          placeholder="سوالت رو بپرس؛ مثلاً «هزینه لیزر چقدره؟»"
          className="flex-1 bg-transparent text-gray-200 
                     placeholder-gray-400 focus:outline-none text-sm"
        />

        {/* Send */}
        <button
          onClick={() => setAppState('maximized')} // <--- تغییر اینجا
          className="bg-gold hover:bg-yellow-600 text-black 
                    rounded-full px-5 py-2 text-sm font-medium transition"
        >
          ارسال
        </button>
      </div>

      {/* Guidance */}
      <div className="bg-[#181818] border-t border-[#2a2a2a] px-5 py-2">
        <p className="text-xs text-gray-400">
          💬 مشاوره رایگان • پاسخ انسانی • بدون تماس تبلیغاتی
        </p>
      </div>

    </div>
  </div>
</section>



      {/* Footer */}
      <footer className="bg-dark text-white py-12 px-4 mt-auto">
        <div className="container mx-auto grid md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-gold font-bold text-lg mb-4">تماس با ما</h4>
            <p className="opacity-80 leading-7">{DATA.contact.address}</p>
            <div className="mt-4 flex flex-col gap-2">
               {DATA.contact.phones.map(p => <span key={p} className="dir-ltr text-right">{p}</span>)}
            </div>
          </div>
          <div>
            <h4 className="text-gold font-bold text-lg mb-4">دسترسی سریع</h4>
            <ul className="space-y-2 text-sm opacity-70">
                <li><a href="#">درباره ما</a></li>
                <li><a href="#">تماس با ما</a></li>
                <li><a href="#">گالری تصاویر</a></li>
            </ul>
          </div>
          <div>
             <img src={DATA.logo} alt="Logo" className="w-32 brightness-0 invert opacity-80 mb-4" />
             <p className="text-xs opacity-50">
               تمامی حقوق برای کلینیک مهرافروز محفوظ است.
             </p>
          </div>
        </div>
      </footer>
      {/* Telegram Style Full-Screen Webview/Mini App Overlay */}
<div
  // کانتینر اصلی: Fixed، تمام صفحه، با Transform حالت‌ها هندل می‌شن
  className={`fixed top-0 left-0 w-full h-full bg-black z-[10000] 
              transform transition-transform duration-300 ease-in-out
              ${appState === 'closed' ? 'translate-y-full' : 
               appState === 'minimized' ? 'translate-y-[calc(100vh-6rem)]' : // 6rem = 96px (ارتفاع نوار مینی‌مایز)
               'translate-y-0'}
            `}
>
  {/* فقط وقتی باز یا مینی‌مایز هست نمایش داده بشه */}
  {appState !== 'closed' && (
    <div className="w-full h-full relative overflow-hidden flex flex-col">
      
      {appState === 'maximized' && (
  <div className="bg-gray-900 border-b border-gray-700 flex items-center px-3 h-16 gap-2 overflow-x-auto">
    
    {/* Tabs */}
    {tabs.map((tab) => (
      <div
        key={tab.id}
        onClick={() => setActiveTabId(tab.id)}
        className={`group flex items-center gap-2 px-4 py-2 rounded-t-md cursor-pointer text-sm
          ${activeTabId === tab.id
            ? 'bg-black text-gold'
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}
        `}
      >
        <span>{tab.title}</span>

        {/* Close tab */}
        {tabs.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setTabs((prev) => {
                const filtered = prev.filter(t => t.id !== tab.id);
                if (activeTabId === tab.id) {
                  setActiveTabId(filtered[0].id);
                }
                return filtered;
              });
            }}
            className="opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>
    ))}

    {/* Add New Tab */}
    <button
      onClick={() => {
        const newTab = {
      id: Date.now(),
      title: `چت ${tabs.length + 1}`,
      messages: [],
        input: '',
      };
        setTabs([...tabs, newTab]);
        setActiveTabId(newTab.id);
      }}
      className="ml-2 w-8 h-8 flex items-center justify-center
                 rounded-full bg-gray-800 text-gold hover:bg-gray-700"
      title="چت جدید"
    >
      +
    </button>

    {/* Close Mini App */}
    <button
      onClick={() => setAppState('closed')}
      className="ml-auto text-gray-400 hover:text-white"
    >
      <X size={22} />
    </button>
  </div>
)}


      {/* 2. Main Content Area (Tabs Chat) */}
{appState === 'maximized' && activeTab && (
  <div className="flex-1 bg-black text-white flex flex-col overflow-hidden">

    {/* Messages Area */}
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {activeTab.messages.length === 0 ? (
        <p className="text-gray-500 text-sm text-center mt-10">
          گفت‌وگو را شروع کنید…
        </p>
      ) : (
        activeTab.messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-md px-4 py-2 rounded-xl text-sm
              ${msg.role === 'user'
                ? 'bg-gold text-black mr-auto'
                : 'bg-gray-800 text-white ml-auto'}`}
          >
            {msg.text}
          </div>
        ))
      )}
    </div>

    {/* Input Bar */}
    <div className="border-t border-gray-800 p-4 bg-[#111]">
      <div className="flex items-center gap-3">

        <input
          value={activeTab.input}
          onChange={(e) => {
            setTabs(prev =>
              prev.map(tab =>
                tab.id === activeTabId
                  ? { ...tab, input: e.target.value }
                  : tab
              )
            );
          }}
          placeholder="پیامت رو بنویس…"
          className="flex-1 bg-gray-900 text-white text-sm
                     px-4 py-2 rounded-full
                     border border-gray-700
                     focus:outline-none focus:border-gold"
        />

        <button
          onClick={() => {
            if (!activeTab.input.trim()) return;

            setTabs(prev =>
              prev.map(tab =>
                tab.id === activeTabId
                  ? {
                      ...tab,
                      messages: [
                        ...tab.messages,
                        { role: 'user', text: tab.input },
                      ],
                      input: '',
                    }
                  : tab
              )
            );
          }}
          className="bg-gold text-black
                     px-4 py-2 rounded-full text-sm
                     hover:bg-yellow-600 transition"
        >
          ارسال
        </button>

      </div>
    </div>

  </div>
)}

      
      {/* 3. Minimized Drawer (مثل نوار X Instagram) */}
      {appState === 'minimized' && (
        <div 
            className="absolute bottom-0 left-0 right-0 h-24 bg-gray-900 border-t border-gray-700 
                       flex items-center justify-between px-6 flex-shrink-0"
        >
          <div className="flex items-center gap-4 text-white font-medium">
            <button 
                onClick={() => setAppState('maximized')} 
                className="p-1 rounded-full bg-gray-700 hover:bg-gray-600 text-gold"
                title="باز کردن"
            >
              <ChevronUp size={20} />
            </button>
            <span className="text-lg">Mini App: رزرو وقت</span>
          </div>
          <button 
              onClick={() => setAppState('closed')} 
              className="text-gray-400 hover:text-white p-1 rounded-full"
              title="بستن کامل"
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  )}
</div>

    </div>
  );
};

export default App;
