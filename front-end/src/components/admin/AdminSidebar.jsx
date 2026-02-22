import React from 'react';
import { NavLink } from 'react-router-dom';
import { ADMIN_NAV_ITEMS } from './AdminNavConfig';

const AdminSidebar = ({ open, onToggle }) => {
  return (
    <aside
      className={`bg-[#2F5D50] text-white transition-all duration-300
      ${open ? 'w-64' : 'w-20'} hidden md:flex flex-col`}
    >
      <div className="h-16 flex items-center justify-center font-bold text-lg border-b border-white/10">
        Admin
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {ADMIN_NAV_ITEMS.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition
               ${isActive
                ? 'bg-[#E6C5CC] text-[#2F5D50]'
                : 'hover:bg-white/10'}`
            }
          >
            <Icon size={20} />
            {open && <span className="text-sm">{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
