// src/pages/admin/AdminContentCms.jsx
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, Film } from 'lucide-react';
import AdminArticles from './AdminArticles';
import AdminVideos from './AdminVideos';

const CMS_TABS = [
  { id: 'articles', label: 'مدیریت مقالات', icon: BookOpen },
  { id: 'videos', label: 'مدیریت ویدیوها', icon: Film },
];

export const AdminContentCms = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'articles';
  const activeTab = CMS_TABS.some((t) => t.id === currentTab) ? currentTab : 'articles';

  const handleTabSelect = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Tab Switcher */}
      <div className="bg-white/80 backdrop-blur-xl border border-primary/20 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-l from-primary to-primary-dark">
            مدیریت محتوا و رسانه (CMS)
          </h1>
          <p className="text-xs text-textDark/60 font-medium mt-1">
            مدیریت یکپارچه مقالات آموزشی و محتواهای ویدیویی کلینیک
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-2 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 shrink-0 self-start sm:self-auto">
          {CMS_TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleTabSelect(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-primary shadow-sm shadow-black/5 scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'articles' && <AdminArticles />}
        {activeTab === 'videos' && <AdminVideos />}
      </div>
    </div>
  );
};

export default AdminContentCms;
