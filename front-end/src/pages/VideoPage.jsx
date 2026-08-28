// src/pages/VideoPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Film,
  Search,
  Loader2,
  Video as VideoIcon,
  PlayCircle,
  Sparkles,
  HelpCircle,
  ArrowLeft,
  Calendar,
} from 'lucide-react';
import { videoService } from '../api/videoService';

const DEFAULT_VIDEOS = [
  {
    id: 1,
    type: 'iframe',
    src: 'https://www.youtube.com/embed/VIDEO_ID',
    title: 'ویدیو معرفی خدمات کلینیک و تجهیزات تشخیصی',
  },
  {
    id: 2,
    type: 'video',
    src: '/videos/-3071497865228685730.mp4',
    title: 'خطرات ماموگرافی چیست و چه زمانی توصیه می‌شود؟',
  },
  {
    id: 3,
    type: 'video',
    src: '/videos/7537779331744502783.mp4',
    title: 'آیا افراد با سابقه سرطان پستان می‌توانند باردار شوند؟',
  },
  {
    id: 4,
    type: 'video',
    src: '/videos/-9054488578247146232.mp4',
    title: 'پروتز و بازسازی پستان پس از جراحی‌های درمانی',
  },
];

export default function VideoPage() {
  const [videos, setVideos] = useState(DEFAULT_VIDEOS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    videoService
      .getVideos()
      .then((data) => {
        if (!isMounted) return;
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((v, i) => ({
            id: v.id || i,
            type:
              v.type ||
              (v.src && (v.src.includes('embed') || v.src.includes('youtube') || v.src.includes('aparat'))
                ? 'iframe'
                : 'video'),
            src: v.src || v.url || v.video_url || '',
            title: v.title || 'ویدیو آموزشی',
          }));
          setVideos(formatted);
        }
      })
      .catch((err) => {
        console.warn('Failed to load videos, falling back to local dataset:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredVideos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return videos;
    return videos.filter((v) => v.title.toLowerCase().includes(q));
  }, [videos, searchQuery]);

  return (
    <main className="flex-grow flex flex-col items-center w-full pt-28 md:pt-32 pb-20">
      <div className="glass-panel fade-section is-visible w-full max-w-6xl">
        
        {/* Page Header */}
        <div className="text-center mb-10">
          <div className="text-xs md:text-sm text-primary font-bold tracking-wider mb-2 uppercase flex items-center justify-center gap-1.5">
            <Film className="w-4 h-4" />
            مرکز رسانه و آموزش چندرسانه‌ای
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-l from-primary to-primary-dark mb-4">
            گالری ویدیوهای آموزشی و بالینی
          </h1>
          <p className="text-textDark/75 max-w-2xl mx-auto font-medium text-sm md:text-base leading-relaxed">
            مجموعه ویدیوهای تخصصی دکتر نگار معشوری پیرامون سلامت پستان، روش‌های نوین جراحی، مراقبت‌های قبل و بعد از عمل و پاسخ به سوالات متداول مراجعین.
          </p>
        </div>

        {/* Search & Stats Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white/50 border border-primary/15 rounded-3xl p-3 sm:p-4 shadow-sm">
          <div className="relative w-full max-w-md">
            <Search size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="جستجو در عنوان ویدیوها..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 text-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-gray-400 bg-white"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-primary-dark bg-primary/10 px-4 py-2 rounded-2xl">
            <Sparkles size={14} className="text-primary" />
            <span>تعداد ویدیوها: {filteredVideos.length} مورد</span>
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="text-xs text-textDark/60 font-medium">در حال بارگذاری گالری ویدیوها...</span>
          </div>
        )}

        {/* Video Grid */}
        {!isLoading && filteredVideos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredVideos.map((video, index) => {
              const isIframe =
                video.type === 'iframe' ||
                (video.src && (video.src.includes('embed') || video.src.includes('youtube') || video.src.includes('aparat')));

              return (
                <article
                  key={video.id || index}
                  className="bg-white/70 border border-primary/20 hover:border-primary/40 rounded-3xl p-4 sm:p-5 shadow-sm transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 group"
                >
                  <div>
                    {/* Media Container */}
                    <div className="relative aspect-video bg-black/90 rounded-2xl overflow-hidden shadow-inner mb-4">
                      {isIframe ? (
                        <iframe
                          src={video.src}
                          title={video.title}
                          className="w-full h-full object-cover"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={video.src}
                          controls
                          preload="metadata"
                          className="w-full h-full object-cover"
                        />
                      )}

                      <div className="absolute top-2.5 left-2.5 bg-black/65 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <PlayCircle size={12} className="text-primary" />
                        <span>{isIframe ? 'آی‌فریم' : 'ویدیو'}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-textDark mb-2 group-hover:text-primary transition-colors leading-relaxed line-clamp-2 min-h-[44px]">
                      {video.title}
                    </h3>
                  </div>

                  {/* Footer Tag */}
                  <div className="pt-3 mt-2 border-t border-primary/10 flex items-center justify-between text-xs text-textDark/60 font-medium">
                    <span className="flex items-center gap-1">
                      <VideoIcon size={14} className="text-primary" />
                      محتوای تخصصی بالینی
                    </span>
                    <span className="text-[11px] bg-primary/10 text-primary-dark font-bold px-2 py-0.5 rounded-md">
                      HD
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredVideos.length === 0 && (
          <div className="bg-white/50 border border-dashed border-primary/30 rounded-3xl p-12 text-center my-8 flex flex-col items-center gap-3">
            <Film className="w-12 h-12 text-primary/40" />
            <h4 className="text-base font-bold text-textDark">ویدیویی مطابق با عبارت جستجوی شما یافت نشد</h4>
            <p className="text-xs text-textDark/60">لطفاً عبارت دیگری را جستجو نمایید یا فیلتر را پاک کنید.</p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-bold text-primary hover:underline mt-2 cursor-pointer"
            >
              نمایش همه ویدیوها
            </button>
          </div>
        )}

        {/* Bottom Banner */}
        <div className="bg-gradient-to-br from-primary/15 to-primary-dark/15 border border-primary/30 p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-center gap-6 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-primary text-white flex items-center justify-center shrink-0 shadow-lg shadow-primary/30">
            <HelpCircle className="w-8 h-8" />
          </div>
          <div className="flex-1 text-center md:text-right">
            <h4 className="text-lg md:text-xl font-bold text-textDark mb-1">
              پرسش و پاسخ پیرامون ویدیوها
            </h4>
            <p className="text-textDark/80 text-sm font-medium leading-relaxed">
              در صورتی که پیرامون هر یک از موضوعات مطرح‌شده در ویدیوها سوالی دارید، می‌توانید از دستیار هوشمند تریاژ استفاده نمایید یا جهت دریافت وقت مشاوره حضوری اقدام فرمایید.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
