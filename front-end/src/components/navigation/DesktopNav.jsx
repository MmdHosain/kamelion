import React from 'react';

const DesktopNav = ({ onNavigate }) => {
  const navItems = [
    { label: 'صفحه نخست', onClick: () => onNavigate('home') },
    { label: 'ویدیو', onClick: () => onNavigate('video') },
    { label: 'درباره', onClick: () => {} },
    { label: 'تماس', onClick: () => {} },
    { label: 'نظرات', onClick: () => onNavigate('comments') },
  ];

  return (
    <nav className="hidden md:flex gap-8 items-center text-sm font-semibold text-[#3B3D3B] relative">
      {navItems.map((item, i) => (
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
  );
};

export default DesktopNav;