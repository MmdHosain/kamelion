import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { Menu, X, ArrowLeft, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col md:flex-row bg-gradient-to-br from-bgLight to-bgDark text-textDark overflow-hidden">
      {/* Mobile Top Navbar */}
      <div className="md:hidden flex justify-between items-center px-5 py-3.5 bg-white/90 backdrop-blur-xl border-b border-primary/20 sticky top-0 z-40 shrink-0 h-[57px]">
        <div className="flex items-center gap-2 font-black text-primary text-lg">
          <Shield className="w-5 h-5" />
          پنل مدیریت مطب
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="text-xs font-bold text-textDark/70 hover:text-primary p-2 flex items-center gap-1"
          >
            مشاهده سایت
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl bg-primary/10 text-primary"
            aria-label="Toggle Sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Desktop Header */}
        <header className="hidden md:flex justify-between items-center px-8 py-4 bg-white/60 backdrop-blur-xl border-b border-primary/15 shrink-0 z-40 h-[69px]">
          <div className="flex items-center gap-2 font-black text-primary text-xl">
            <Shield className="w-6 h-6" />
            داشبورد مدیریت کلینیک دکتر نگار معشوری
          </div>
          <Link
            to="/"
            className="text-xs font-bold bg-white/80 hover:bg-white text-primary border border-primary/25 px-4 py-2 rounded-full transition-all shadow-sm flex items-center gap-1.5"
          >
            مشاهده سایت اصلی
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </header>

        <main className="p-4 md:p-8 flex-1 overflow-y-auto chat-scroll min-w-0">
          <div className="bg-white/85 border border-primary/20 rounded-[2rem] shadow-xl p-5 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
