// src/components/admin/articles/ImageCropModal.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Check, ZoomIn, ZoomOut, RotateCcw, Crop, Move } from 'lucide-react';

const CROP_ASPECT = 16 / 9;
const OUTPUT_WIDTH = 1280;
const OUTPUT_HEIGHT = Math.round(OUTPUT_WIDTH / CROP_ASPECT); // 720

const ImageCropModal = ({ isOpen, imageSrc, onClose, onCropComplete }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgNaturalSize, setImgNaturalSize] = useState({ width: 0, height: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  const containerRef = useRef(null);
  const imageRef = useRef(null);

  // Reset state when modal opens or imageSrc changes
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setIsDragging(false);
    }
  }, [isOpen, imageSrc]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const onImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    setImgNaturalSize({ width: naturalWidth, height: naturalHeight });
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture was already released
    }
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleCrop = useCallback(() => {
    if (!imageRef.current || !containerRef.current) return;
    setIsProcessing(true);

    try {
      const containerRect = containerRef.current.getBoundingClientRect();
      const imgRect = imageRef.current.getBoundingClientRect();

      const canvas = document.createElement('canvas');
      canvas.width = OUTPUT_WIDTH;
      canvas.height = OUTPUT_HEIGHT;
      const ctx = canvas.getContext('2d');

      // Calculate how the image maps onto the 16:9 crop box
      const ratioX = OUTPUT_WIDTH / containerRect.width;
      const ratioY = OUTPUT_HEIGHT / containerRect.height;

      const drawX = (imgRect.left - containerRect.left) * ratioX;
      const drawY = (imgRect.top - containerRect.top) * ratioY;
      const drawWidth = imgRect.width * ratioX;
      const drawHeight = imgRect.height * ratioY;

      // Fill with smooth background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(imageRef.current, drawX, drawY, drawWidth, drawHeight);

      canvas.toBlob(
        (blob) => {
          setIsProcessing(false);
          if (blob) {
            const croppedFile = new File([blob], 'cropped-cover.webp', {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            onCropComplete(croppedFile);
            onClose();
          }
        },
        'image/webp',
        0.88
      );
    } catch (err) {
      console.error('Failed to crop image:', err);
      setIsProcessing(false);
    }
  }, [onCropComplete, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-primary/20 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-textDark">
                تنظیم کادر و برش تصویر شاخص (۱۶:۹)
              </h3>
              <p className="text-[11px] text-slate-500">
                تصویر را جابجا کنید یا بزرگ‌نمایی را تنظیم نمایید تا کادر دلخواه به دست آید.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Area */}
        <div className="p-4 sm:p-6 bg-slate-950 flex flex-col items-center justify-center select-none overflow-hidden">
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="relative w-full aspect-video max-w-lg rounded-2xl overflow-hidden border-2 border-primary shadow-2xl cursor-grab active:cursor-grabbing bg-slate-900 flex items-center justify-center touch-none"
          >
            {/* Draggable & Scalable Image */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop Preview"
              onLoad={onImageLoad}
              draggable={false}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                maxWidth: '100%',
                maxHeight: '100%',
              }}
              className="pointer-events-none select-none origin-center"
            />

            {/* Rule of Thirds Grid Overlay */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none border border-white/20">
              <div className="border-r border-b border-white/15" />
              <div className="border-r border-b border-white/15" />
              <div className="border-b border-white/15" />
              <div className="border-r border-b border-white/15" />
              <div className="border-r border-b border-white/15" />
              <div className="border-b border-white/15" />
              <div className="border-r border-white/15" />
              <div className="border-r border-white/15" />
              <div />
            </div>

            {/* Hint Badge */}
            <div className="absolute bottom-2 right-2 bg-black/65 backdrop-blur-xs text-white/90 text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 pointer-events-none">
              <Move className="w-3 h-3 text-primary" />
              برای جابجایی بکشید
            </div>
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          {/* Zoom Controls */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-[200px]">
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(1, +(s - 0.15).toFixed(2)))}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-primary transition-colors cursor-pointer"
              title="کوچک‌نمایی"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="flex-1 accent-primary cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
            <button
              type="button"
              onClick={() => setScale((s) => Math.min(3, +(s + 0.15).toFixed(2)))}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-primary transition-colors cursor-pointer"
              title="بزرگ‌نمایی"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-600 min-w-[38px] text-left">
              {Math.round(scale * 100)}%
            </span>
          </div>

          {/* Reset Button */}
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            بازنشانی
          </button>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-end gap-3 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 text-xs sm:text-sm font-bold hover:bg-slate-50 transition-colors cursor-pointer"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={handleCrop}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-2xl bg-primary text-white text-xs sm:text-sm font-bold hover:bg-primary/90 shadow-md shadow-primary/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <span>در حال برش...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                تایید و برش تصویر (۱۶:۹)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal;
