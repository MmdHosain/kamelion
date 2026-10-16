// src/components/articles/ArticleMediaEmbed.jsx
import React from 'react';
import { Film } from 'lucide-react';
import { formatVideoEmbedUrl } from '../../utils/mediaUtils';

const ArticleMediaEmbed = ({ videoUrl, title = 'ویدیوی آموزشی' }) => {
  if (!videoUrl) return null;

  const embedSrc = formatVideoEmbedUrl(videoUrl);
  if (!embedSrc) return null;

  return (
    <div className="my-8 rounded-3xl overflow-hidden border border-primary/20 bg-slate-900 shadow-md">
      <div className="bg-slate-800/80 px-4 py-2.5 flex items-center gap-2 text-xs font-bold text-slate-300 border-b border-slate-700/60">
        <Film className="w-4 h-4 text-primary" />
        <span>{title}</span>
      </div>

      <div className="relative aspect-video w-full bg-black">
        <iframe
          src={embedSrc}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
    </div>
  );
};

export default ArticleMediaEmbed;
