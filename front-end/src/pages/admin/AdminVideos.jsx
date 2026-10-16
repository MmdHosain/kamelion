// src/pages/admin/AdminVideos.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Video,
  Plus,
  Trash2,
  Play,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Film,
  Sparkles,
  Link2,
} from 'lucide-react';
import { videoService } from '../../api/videoService';
import { getApiErrorMessage } from '../../utils/errorUtils';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';

const DEFAULT_FALLBACK_VIDEOS = [
  {
    id: 1,
    type: 'iframe',
    src: 'https://www.youtube.com/embed/VIDEO_ID',
    title: 'ویدیو معرفی خدمات کلینیک',
  },
  {
    id: 2,
    type: 'video',
    src: '/videos/-3071497865228685730.mp4',
    title: 'خطرات ماموگرافی چیست؟',
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
    title: 'پروتز و بازسازی پستان',
  },
];

export default function AdminVideos() {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  useBodyScrollLock(isModalOpen);
  const [formData, setFormData] = useState({
    title: '',
    src: '',
    type: 'video',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [previewVideo, setPreviewVideo] = useState(null);

  const loadVideos = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const data = await videoService.getVideos();
      if (Array.isArray(data) && data.length > 0) {
        const formatted = data.map(v => {
          let currentSrc = v.src || '';
          if (currentSrc.includes('aparat.com/v/')) {
            const hash = currentSrc.split('aparat.com/v/')[1].split('/')[0].split('?')[0];
            currentSrc = `https://www.aparat.com/video/video/embed/videohash/${hash}/vt/frame`;
          }
          return { ...v, src: currentSrc };
        });
        setVideos(formatted);
      } else {
        setVideos(DEFAULT_FALLBACK_VIDEOS);
      }
    } catch (err) {
      console.warn('Failed to load videos from server, using fallbacks:', err);
      setVideos(DEFAULT_FALLBACK_VIDEOS);
      setLoadError(getApiErrorMessage(err, 'امکان دریافت ویدیوها از سرور وجود ندارد (حالت آفلاین فعال شد).'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  const openAddModal = () => {
    setFormData({ title: '', src: '', type: 'video' });
    setFormError('');
    setIsModalOpen(true);
  };

  const closeAddModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setFormError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    const title = formData.title.trim();
    let src = formData.src.trim();

    if (!title || !src) {
      setFormError('عنوان و آدرس ویدیو الزامی هستند.');
      return;
    }

    if (src.includes('aparat.com/v/')) {
      const hash = src.split('aparat.com/v/')[1].split('/')[0].split('?')[0];
      src = `https://www.aparat.com/video/video/embed/videohash/${hash}/vt/frame`;
    }

    // Auto-detect iframe if user selected video but entered youtube/aparat embed url
    let videoType = formData.type;
    if (src.includes('youtube.com') || src.includes('aparat.com') || src.includes('embed')) {
      videoType = 'iframe';
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const payload = {
        title,
        src,
        type: videoType,
      };

      const created = await videoService.createVideo(payload);
      setVideos((prev) => [created, ...prev]);
      closeAddModal();
    } catch (err) {
      console.error('Failed to create video:', err);
      setFormError(getApiErrorMessage(err, 'خطا در افزودن ویدیوی جدید به سرور.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVideo = async (id) => {
    if (!window.confirm('آیا از حذف این ویدیو از گالری اطمینان دارید؟')) return;

    try {
      await videoService.deleteVideo(id);
      setVideos((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      console.error('Failed to delete video:', err);
      alert(getApiErrorMessage(err, 'خطا در حذف ویدیو از سرور.'));
    }
  };

  const inputCls = `
    w-full px-4 py-2.5 text-sm border border-gray-200 rounded-2xl
    focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
    placeholder:text-gray-400 bg-white transition-all
  `;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary/15 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-primary flex items-center gap-2.5">
            <Film className="w-6 h-6" />
            مدیریت ویدیوهای آموزشی و بالینی
          </h1>
          <p className="text-xs md:text-sm text-textDark/70 font-medium mt-0.5">
            افزودن ویدیوهای آموزشی، مصاحبه‌ها و نکات مراقبتی جهت نمایش در گالری ویدیویی سایت
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-md shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer whitespace-nowrap"
        >
          <Plus size={18} />
          <span>افزودن ویدیوی جدید</span>
        </button>
      </div>

      {loadError && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 text-xs md:text-sm font-bold flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0 text-amber-600" />
          <span>{loadError}</span>
        </div>
      )}

      {/* Videos Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="text-xs text-textDark/60 font-medium">در حال بارگذاری ویدیوها...</span>
        </div>
      ) : videos.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200 flex flex-col items-center gap-3">
          <Video className="w-12 h-12 text-gray-300" />
          <p className="text-sm font-bold text-gray-700">هنوز هیچ ویدیویی ثبت نشده است</p>
          <button
            type="button"
            onClick={openAddModal}
            className="text-xs font-bold text-primary hover:underline mt-1"
          >
            برای افزودن اولین ویدیو کلیک کنید
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video, idx) => {
            const isIframe =
              video.type === 'iframe' ||
              (video.src && (video.src.includes('embed') || video.src.includes('youtube') || video.src.includes('aparat')));

            return (
              <div
                key={video.id || idx}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-md hover:border-primary/30 transition-all duration-300"
              >
                {/* Media Preview Box */}
                <div className="relative aspect-video bg-black/90 overflow-hidden">
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
                  <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {isIframe ? 'آی‌فریم / لینک' : 'فایل ویدیو MP4'}
                  </div>
                </div>

                {/* Content info & actions */}
                <div className="p-4 flex flex-col gap-3">
                  <h3 className="font-bold text-sm text-gray-900 line-clamp-2 min-h-[40px] leading-relaxed">
                    {video.title || 'ویدیو آموزشی'}
                  </h3>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                    <span className="text-gray-400 text-[11px] truncate max-w-[170px]" dir="ltr">
                      {video.src}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDeleteVideo(video.id)}
                      className="inline-flex items-center gap-1 text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors cursor-pointer font-bold"
                      title="حذف ویدیو"
                    >
                      <Trash2 size={15} />
                      <span>حذف</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Video Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeSlide"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAddModal();
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 md:p-8 flex flex-col gap-6 relative border border-primary/20">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Video size={20} />
                </div>
                <div>
                  <h2 className="text-base font-black text-gray-900">افزودن ویدیوی آموزشی جدید</h2>
                  <p className="text-xs text-gray-500 font-medium">
                    مشخصات ویدیو را جهت قرارگیری در گالری وارد نمایید
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeAddModal}
                disabled={isSubmitting}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddVideo} className="flex flex-col gap-4">
              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">
                  عنوان ویدیو <span className="text-red-500">*</span>
                </label>
                <input
                  name="title"
                  type="text"
                  placeholder="مثال: روش صحیح معاینه بالینی پستان"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={inputCls}
                  required
                />
              </div>

              {/* Type selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">نوع منبع ویدیو</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, type: 'video' }))}
                    className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      formData.type === 'video'
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    فایل مستقیم ویدیو (MP4)
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, type: 'iframe' }))}
                    className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      formData.type === 'iframe'
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    آی‌فریم (آپارات / یوتیوب)
                  </button>
                </div>
              </div>

              {/* Src / URL */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                  <Link2 size={14} className="text-primary" />
                  آدرس اینترنتی ویدیو (URL) <span className="text-red-500">*</span>
                </label>
                <input
                  name="src"
                  type="text"
                  placeholder={
                    formData.type === 'video'
                      ? 'https://domain.com/videos/sample.mp4 یا /videos/1.mp4'
                      : 'https://www.aparat.com/video/video/embed/videohash/...'
                  }
                  value={formData.src}
                  onChange={handleInputChange}
                  className={inputCls}
                  dir="ltr"
                  required
                />
              </div>

              {formError && (
                <div className="rounded-2xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeAddModal}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-xs font-bold text-gray-600 border border-gray-200 rounded-2xl hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  انصراف
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-2xl shadow-md shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>در حال ذخیره...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>افزودن ویدیو</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
