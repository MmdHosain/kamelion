// src/components/admin/articles/CoverImageUploader.jsx
import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, AlertCircle } from 'lucide-react';
import adminArticleService from '../../../api/adminArticleService';

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const CoverImageUploader = ({ value = '', onChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const processFile = async (file) => {
    setErrorMessage('');

    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMessage('فرمت فایل مجاز نیست. لطفاً فرمت‌های JPG, PNG یا WebP انتخاب کنید.');
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrorMessage(`حجم تصویر نباید بیشتر از ${MAX_SIZE_MB} مگابایت باشد.`);
      return;
    }

    setIsUploading(true);
    try {
      const res = await adminArticleService.uploadImage(file);
      if (res?.url) {
        onChange(res.url);
      }
    } catch (err) {
      console.error('Error uploading cover image:', err);
      // Fallback: local object URL
      onChange(URL.createObjectURL(file));
    } finally {
      setIsUploading(false);
    }
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
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {value ? (
        <div className="relative group rounded-2xl overflow-hidden border border-primary/20 bg-slate-50 aspect-video max-h-64 shadow-xs">
          <img
            src={value}
            alt="تصویر شاخص مقاله"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white text-slate-800 text-xs font-bold rounded-xl shadow-md hover:bg-slate-100 transition-colors"
            >
              تغییر تصویر
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 bg-rose-600 text-white rounded-xl shadow-md hover:bg-rose-700 transition-colors"
              title="حذف تصویر"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
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
            {isUploading ? (
              <UploadCloud className="w-6 h-6 animate-bounce" />
            ) : (
              <ImageIcon className="w-6 h-6" />
            )}
          </div>
          <p className="text-sm font-bold text-slate-700 mb-1">
            {isUploading
              ? 'در حال بارگذاری تصویر...'
              : 'تصویر شاخص را بکشید و رها کنید یا کلیک نمایید'}
          </p>
          <p className="text-xs text-slate-400 font-medium">
            فرمت‌های مجاز: JPG, PNG, WebP (حداکثر ۵ مگابایت)
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

      {/* Manual URL input fallback */}
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs text-slate-500 shrink-0 font-medium">یا درج مستقیم آدرس تصویر:</span>
        <input
          type="url"
          dir="ltr"
          placeholder="https://example.com/cover.webp"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:border-primary bg-white text-slate-700"
        />
      </div>

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
