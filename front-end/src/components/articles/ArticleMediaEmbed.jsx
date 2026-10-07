// src/components/articles/ArticleMediaEmbed.jsx
import React from 'react';
import { Film } from 'lucide-react';

const formatEmbedUrl = (rawUrl) => {
  if (!rawUrl) return null;

  // Aparat URL handling
  if (rawUrl.includes('aparat.com')) {
    if (rawUrl.includes('/embed/')) return rawUrl;
    const match = rawUrl.match(/aparat\.com\/v\/([a-zA-Z0-9]+)/);
    if (match && match[1]) {
      return `https://www.aparat.com/video/video/embed/videohash/${match[1]}/vt/frame`;
    }
  }

  // YouTube URL handling
  if (rawUrl.includes('youtube.com') || rawUrl.includes('youtu.be')) {
    if (rawUrl.includes('/embed/')) return rawUrl;
    const match = rawUrl.match(/(?:youtu\.be\/|watch\?v=)([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }

  return rawUrl;
};

const ArticleMediaEmbed = ({ videoUrl, title = 'ویدیوی آموزشی' }) => {
  if (!videoUrl) return null;

  const embedSrc = formatEmbedUrl(videoUrl);

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
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
    </div>
  );
};

export default ArticleMediaEmbed;
