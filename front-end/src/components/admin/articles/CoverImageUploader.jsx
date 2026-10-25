// src/components/admin/articles/CoverImageUploader.jsx
import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, X, AlertCircle, Crop, Sparkles, CheckCircle2 } from 'lucide-react';
import { formatMediaUrl } from '../../../utils/mediaUtils';
import ImageCropModal from './ImageCropModal';

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const CoverImageUploader = ({ value = null, onChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(null);
  const fileInputRef = useRef(null);

  // Synchronize previewUrl with value prop
  useEffect(() => {
    if (!value) {
      setPreviewUrl('');
      setAspectRatio(null);
    } else if (value instanceof File) {
      const objectUrl = URL.createObjectURL(value);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (typeof value === 'string') {
      setPreviewUrl(formatMediaUrl(value));
    }
  }, [value]);

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalWidth && naturalHeight) {
      setAspectRatio(naturalWidth / naturalHeight);
    }
  };

  const processFile = (file) => {
    setErrorMessage('');

    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMessage('فرمت فایل مجاز نیست. لطفاً فرمت‌های JPG, PNG یا WebP انتخاب کنید.');
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrorMessage(`حجم تصویر نباید بیشتر از ${MAX_SIZE_MB} مگابایت باشد.`);
      return;
    }

    onChange(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange(null);
    setAspectRatio(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isIdealRatio = aspectRatio && Math.abs(aspectRatio - 16 / 9) < 0.25;
  const isVertical = aspectRatio && aspectRatio < 0.95;

  return (
    <div className="flex flex-col gap-2">
      {previewUrl ? (
        <div className="space-y-2">
          {/* Preview Container with Ambient Blur */}
          <div className="relative group rounded-2xl overflow-hidden border border-primary/20 bg-slate-900/5 aspect-video max-h-64 shadow-xs">
            {/* Ambient Blurred Background */}
            <img
              src={previewUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-110 pointer-events-none select-none"
            />

            {/* Main Preview Image */}
            <img
              src={previewUrl}
              alt="تصویر شاخص مقاله"
              onLoad={handleImageLoad}
              className="relative z-10 w-full h-full object-contain transition-transform duration-300 group-hover:scale-102"
            />

            {/* Overlay Action Buttons */}
            <div className="absolute inset-0 z-20 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
              <button
                type="button"
                onClick={() => setCropModalOpen(true)}
                className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md hover:bg-primary/90 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="برش و تنظیم کادر ۱۶:۹"
              >
                <Crop className="w-3.5 h-3.5" />
                تنظیم کادر (۱۶:۹)
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-white text-slate-800 text-xs font-bold rounded-xl shadow-md hover:bg-slate-100 transition-colors cursor-pointer"
              >
                تغییر تصویر
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-2 bg-rose-600 text-white rounded-xl shadow-md hover:bg-rose-700 transition-colors cursor-pointer"
                title="حذف تصویر"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Ratio Information & Helper */}
          {aspectRatio && (
            <div className="flex items-center justify-between text-xs px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1.5 font-medium">
                {isIdealRatio ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-700">نسبت تصویر استاندارد و ایده‌آل (۱۶:۹)</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-slate-700">
                      {isVertical ? 'تصویر عمودی' : 'نسبت تصویر غیر ۱۶:۹'} (نمایش با کادر هوشمند بلور)
                    </span>
                  </>
                )}
              </div>

              {!isIdealRatio && (
                <button
                  type="button"
                  onClick={() => setCropModalOpen(true)}
                  className="text-primary hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <Crop className="w-3 h-3" />
                  برش به ۱۶:۹
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[160px] ${
            isDragging
              ? 'border-primary bg-primary/10 scale-99'
              : 'border-slate-300 hover:border-primary/50 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
            <ImageIcon className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-700 mb-1">
            تصویر شاخص را بکشید و رها کنید یا کلیک نمایید
          </p>
          <p className="text-xs text-slate-400 font-medium">
            فرمت‌های مجاز: JPG, PNG, WebP (حداکثر ۵ مگابایت — نسبت بهینه: ۱۶:۹ افقی)
          </p>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processFile(file);
        }}
      />

      {/* Crop Modal */}
      {previewUrl && (
        <ImageCropModal
          isOpen={cropModalOpen}
          imageSrc={previewUrl}
          onClose={() => setCropModalOpen(false)}
          onCropComplete={(croppedFile) => {
            onChange(croppedFile);
          }}
        />
      )}

      {errorMessage && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl mt-1">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

export default CoverImageUploader;
