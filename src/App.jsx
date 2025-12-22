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
    </div>
  );
};

export default App;
