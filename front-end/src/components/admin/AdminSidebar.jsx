import React from 'react';
import { NavLink } from 'react-router-dom';
import { ADMIN_NAV_ITEMS } from './AdminNavConfig';
import { Shield, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const AdminSidebar = ({ open, onClose }) => {
  const { logout } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      <aside
        className={`fixed md:sticky inset-y-0 right-0 top-0 z-40 w-72 h-screen bg-gradient-to-b from-primary to-primary-dark text-white flex flex-col transition-all duration-300 shadow-2xl md:shadow-none shrink-0 ${
          open ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-white/15 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white shadow-inner">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-black text-base text-white">پنل مدیریت</h2>
            <p className="text-xs text-white/70 font-medium">دکتر نگار معشوری</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {ADMIN_NAV_ITEMS.map(({ label, icon: Icon, path }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-primary shadow-lg shadow-black/10 scale-[1.02]'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/15 shrink-0">
          <button
            onClick={() => {
              if (logout) logout();
              window.location.href = '/';
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-white/10 hover:bg-red-500 hover:text-white text-white/90 text-sm font-bold transition-all shadow-sm"
          >
            <LogOut size={18} />
            <span>خروج از حساب</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
