import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function SliderCard({
  title = 'بدون عنوان',
  desc = '',
  img_path = '',
  price = ''
}) {
  return (
    <div className="group relative min-w-[240px] h-[340px] rounded-3xl overflow-hidden cursor-pointer shadow-lg mx-1 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
      
      {/* تصویر پس‌زمینه */}
      <img
        src={img_path || 'https://via.placeholder.com/240x340?text=No+Image'}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
      />

      {/* گرادینت تیره روی عکس */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

      {/* محتوا */}
      <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col items-start text-white">
        
        {price && (
          <span className="mb-2 px-2 py-1 bg-yellow-500/90 text-[10px] font-bold rounded-md backdrop-blur-sm text-black shadow-[0_0_10px_rgba(234,179,8,0.5)]">
            {price}
          </span>
        )}

        <h4 className="font-bold text-lg leading-tight mb-1 group-hover:text-yellow-400 transition-colors">
          {title}
        </h4>
        
        {desc && (
          <p className="text-xs text-gray-300 line-clamp-2 mb-3 opacity-90">
            {desc}
          </p>
        )}

        <div className="flex items-center gap-2 text-xs font-medium text-yellow-400 opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
          مشاهده جزئیات <ArrowLeft size={14} />
        </div>
      </div>
    </div>
  );
}
