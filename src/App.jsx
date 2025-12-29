import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Menu, X, Sparkles, ArrowLeft, ChevronDown, Plus, Minus, MessageSquare, Instagram } from 'lucide-react';
import MessageRenderer from './components/MessageRenderer';

// --- DATA (شبیه سازی محتوای سایت شما برای اسکرول) ---
const DATA = {
  logo: "https://mehrafrouzclinic.com/wp-content/uploads/2023/10/Logo-mehrafrouz-new.webp",
  contact: {
    address: "تهران، نیاوران، روبروی جماران، جنب بانک سامان، پلاک 148، طبقه دوم",
    phones: ["۰۲۱۹۱۲۰۰۷۰۰", "۰۹۱۲۳۳۳۶۷۵۳"]
  },
  services: [
    { title: "لیزر موهای زائد", icon: "✨", desc: "با پیشرفته‌ترین دستگاه‌های 2024" },
    { title: "تزریق ژل و بوتاکس", icon: "💉", desc: "زاویه‌سازی و رفع چین و چروک" },
    { title: "کاشت مو و ابرو", icon: "💇‍♂️", desc: "تراکم بالا و خط رویش طبیعی" },
    { title: "جوانسازی پوست", icon: "🧖‍♀️", desc: "هایفوتراپی، مزوتراپی و فیشیال" },
    { title: "جراحی‌های زیبایی", icon: "🏥", desc: "بلفاروپلاستی و ساکشن غبغب" },
    { title: "درمان لک و آکنه", icon: "💊", desc: "پروتکل‌های درمانی اختصاصی" },
  ]
};

const App = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [appState, setAppState] = useState('closed'); // closed | minimized | maximized
  const [heroInput, setHeroInput] = useState('');
  
  // استیت برای تشخیص اسکرول جهت افکت‌های بصری (اختیاری)
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
    
    // شبیه‌سازی پاسخ هوشمند
    let aiMessage = {
      role: 'ai', type: 'text',
      content: 'درخواست شما دریافت شد. همکاران ما به زودی پاسخ می‌دهند.'
    };

    if (text.includes('form')) {
      aiMessage = { role: 'ai', type: 'form', payload: { fields: [{type:'text', name:'نام'}, {type:'text', name:'شماره'}], submitLabel: 'ثبت' }};
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
    <div className="min-h-screen flex flex-col font-sans bg-gray-50 text-gray-800 dir-rtl">
      
      {/* 1. Header (Navigation) */}
      <header className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur shadow-md py-2' : 'bg-white py-4'}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
             <div className="flex items-center gap-2">
                <img src={DATA.logo} alt="Logo" className="h-10 w-auto" />
                <div className="font-bold text-lg hidden md:block">کلینیک <span className="text-yellow-600">مهرافروز</span></div>
             </div>
             
             <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
                <a href="#" className="hover:text-yellow-600 transition">صفحه نخست</a>
                <a href="#" className="hover:text-yellow-600 transition">خدمات زیبایی</a>
                <a href="#" className="hover:text-yellow-600 transition">پزشکان</a>
                <a href="#" className="hover:text-yellow-600 transition">تماس با ما</a>
             </nav>

             <div className="flex gap-2">
               <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm transition">
                 دریافت نوبت
               </button>
               <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                 {mobileMenuOpen ? <X/> : <Menu/>}
               </button>
             </div>
        </div>
      </header>

      {/* 2. Scrollable Content Sections */}
      <main className="flex-grow flex flex-col items-center w-full pb-40"> {/* pb-40 creates space for fixed box */}
        
        {/* Hero Banner Section */}
        <section className="w-full relative h-[500px] flex items-center justify-center bg-gray-900 overflow-hidden">
          {/* Background Image Placeholder */}
          <div className="absolute inset-0 opacity-40 bg-[url('https://mehrafrouzclinic.com/wp-content/uploads/2023/07/IMG_8778-scaled.jpg')] bg-cover bg-center"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/10"></div>
          
          <div className="z-10 text-center px-4 max-w-2xl mt-[-100px]"> {/* Moved text up slightly */}
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
              زیبایی شما، تخصص ماست
            </h1>
            <p className="text-gray-200 text-lg mb-8 drop-shadow-md">
              با بهره‌گیری از جدیدترین تکنولوژی‌های روز دنیا در محیطی آرام
            </p>
          </div>
        </section>

        {/* Services Section (To enable scrolling) */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">خدمات کلینیک مهرافروز</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DATA.services.map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition border border-gray-100 group">
                <div className="text-4xl mb-4 bg-yellow-50 w-16 h-16 flex items-center justify-center rounded-full group-hover:scale-110 transition">{item.icon}</div>
                <h3 className="font-bold text-xl mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
                <button className="mt-4 text-yellow-600 text-sm font-medium hover:underline">مشاهده جزئیات &larr;</button>
              </div>
            ))}
          </div>
        </section>

        {/* About / Text Section */}
        <section className="w-full bg-white py-16 border-t border-gray-100">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <img src="https://mehrafrouzclinic.com/wp-content/uploads/2023/10/About-us-new.webp" alt="About" className="rounded-2xl shadow-xl w-full"/>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-4">چرا مهرافروز؟</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                کلینیک تخصصی پوست، مو و لیزر مهرافروز با بهره‌گیری از جدیدترین و پیشرفته‌ترین دستگاه‌های روز دنیا و با همکاری تیم درخشانی از اساتید، پزشکان و متخصصین پوست و مو، فعالیت خود را آغاز نموده است.
              </p>
              <ul className="space-y-2">
                {['کادر پزشکی مجرب', 'مشاوره رایگان قبل از درمان', 'محیط کاملاً بهداشتی'].map((item, i)=>(
                  <li key={i} className="flex items-center gap-2 text-gray-700">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-white py-10 pb-40"> {/* pb-40 extra padding so content isn't hidden by fixed box */}
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8 text-sm">
          <div className="space-y-4">
             <div className="font-bold text-lg text-yellow-500">مهرافروز</div>
             <p className="opacity-70">ارائه دهنده خدمات نوین زیبایی</p>
          </div>
          <div>
            <h4 className="font-bold mb-3">دسترسی سریع</h4>
            <ul className="space-y-2 opacity-70">
              <li>صفحه اصلی</li>
              <li>درباره ما</li>
              <li>تماس با ما</li>
            </ul>
          </div>
          <div className="col-span-2">
            <h4 className="font-bold mb-3">تماس</h4>
            <p className="opacity-70 mb-2">{DATA.contact.address}</p>
            <div className="flex gap-4">
              {DATA.contact.phones.map(p => <span key={p}>{p}</span>)}
            </div>
          </div>
        </div>
      </footer>


      {/* =========================================================================
          FIXED AI INPUT BOX (The specific request)
          This stays fixed at the bottom while scrolling.
         ========================================================================= */}
      <div className={`fixed z-30 left-0 right-0 px-4 transition-all duration-500 ease-out
          ${appState === 'closed' ? 'bottom-8 opacity-100 translate-y-0' : 'bottom-[-100px] opacity-0 translate-y-10 pointer-events-none'}
      `}>
        <div className="max-w-xl mx-auto w-full relative group"> {/* max-w-xl makes it smaller/compact */}
          
          {/* Glowing Effect Behind */}
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/50 to-orange-500/50 rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition duration-500"></div>
          
          {/* The Box Itself */}
          <div className="relative bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] flex items-center p-2 pr-4 transition-transform duration-300 transform hover:-translate-y-1">
            
            <div className="text-yellow-600 animate-pulse">
              <Sparkles size={20} />
            </div>

            <input 
              type="text"
              value={heroInput}
              onChange={(e) => setHeroInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleHeroSubmit()}
              placeholder="هر سوالی دارید از هوش مصنوعی بپرسید..."
              className="flex-1 py-3 px-3 bg-transparent outline-none text-gray-800 placeholder-gray-500 text-base"
            />

            <button 
              onClick={handleHeroSubmit}
              className={`p-2.5 rounded-xl transition-all duration-300 shadow-md flex items-center justify-center
                ${heroInput ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white translate-x-0' : 'bg-gray-100 text-gray-400'}
              `}
            >
              {heroInput ? <ArrowLeft size={18} /> : <MessageSquare size={18} />}
            </button>
          </div>

          {/* Optional: Small Helper Text below box */}
          <div className="absolute -bottom-6 left-0 right-0 text-center text-[10px] text-gray-500 font-medium">
             پاسخگویی آنی • مشاوره رایگان • رزرو نوبت
          </div>

        </div>
      </div>


      {/* =========================================================================
          CHAT OVERLAY (TAB SYSTEM) - Remains same logic
         ========================================================================= */}
      <div
        className={`fixed inset-0 z-[9999] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] 
          ${appState === 'closed' ? 'pointer-events-none bg-black/0' : 'bg-black/40 backdrop-blur-sm'}
        `}
      >
        <div className={`fixed bottom-0 left-0 right-0 bg-[#0f0f0f] shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col
            ${appState === 'maximized' ? 'h-[85vh] translate-y-0 rounded-t-3xl' : 
              appState === 'minimized' ? 'h-16 translate-y-0 rounded-t-xl' : 
              'translate-y-full'}
        `}>
          
          {/* Minimized Header */}
          {appState === 'minimized' && (
             <div onClick={() => setAppState('maximized')} className="flex-1 flex items-center justify-between px-6 cursor-pointer hover:bg-[#1a1a1a] rounded-t-xl border-t border-white/10">
                <div className="flex items-center gap-3 text-white text-sm">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  ادامه گفتگو با دستیار هوشمند...
                </div>
                <button onClick={(e)=>{e.stopPropagation(); setAppState('closed')}}><X className="text-gray-400 hover:text-white"/></button>
             </div>
          )}

          {/* Maximized Content */}
          {appState === 'maximized' && (
            <>
              {/* Header */}
              <div className="bg-[#1a1a1a] px-4 py-3 border-b border-white/5 rounded-t-3xl flex flex-col gap-3">
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-white font-medium text-sm">
                      <Sparkles size={16} className="text-yellow-500"/>
                      دستیار هوشمند کلینیک
                    </div>
                    <div className="flex gap-3 text-gray-400">
                      <button onClick={() => setAppState('minimized')} className="hover:text-white"><Minus size={18}/></button>
                      <button onClick={() => setAppState('closed')} className="hover:text-red-400"><X size={18}/></button>
                    </div>
                 </div>
                 {/* Tabs */}
                 <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {tabs.map(tab => (
                      <div key={tab.id} onClick={() => setActiveTabId(tab.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer flex items-center gap-2 transition border
                          ${activeTabId === tab.id ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}
                        `}
                      >
                        {tab.title}
                        {tabs.length > 1 && <X size={12} onClick={(e)=>closeTab(e, tab.id)} className="hover:text-red-400"/>}
                      </div>
                    ))}
                    <button onClick={addNewTab} className="p-1.5 bg-white/5 rounded-lg text-gray-400 hover:text-white"><Plus size={14}/></button>
                 </div>
              </div>

              {/* Chat Body */}
              <div className="flex-1 bg-black overflow-hidden relative flex flex-col">
                 {activeTab && (
                   <>
                     <div className="flex-1 overflow-y-auto p-4 space-y-4">
                       {activeTab.messages.length === 0 ? (
                         <div className="h-full flex flex-col items-center justify-center text-gray-600 text-sm">
                           <MessageSquare size={40} className="mb-3 opacity-20"/>
                           <p>هنوز پیامی ارسال نشده است.</p>
                         </div>
                       ) : (
                         activeTab.messages.map((msg, i) => <MessageRenderer key={i} message={msg} />)
                       )}
                     </div>
                     <div className="p-4 bg-[#111] border-t border-white/10">
                        <div className="relative flex items-center gap-2">
                           <input 
                             value={activeTab.input}
                             onChange={(e) => setTabs(prev => prev.map(t => t.id === activeTabId ? {...t, input: e.target.value} : t))}
                             onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(activeTab.input)}
                             placeholder="اینجا بنویسید..."
                             className="flex-1 bg-[#222] text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-yellow-500/50"
                           />
                           <button onClick={() => handleSendMessage(activeTab.input)} className="bg-yellow-600 text-white p-3 rounded-xl hover:bg-yellow-500 transition">
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

    </div>
  );
};

export default App;
