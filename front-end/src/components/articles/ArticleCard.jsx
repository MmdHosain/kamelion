// src/components/articles/ArticleCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, ArrowLeft, Eye } from 'lucide-react';
import { formatMediaUrl } from '../../utils/mediaUtils';
import { toPersianDigits } from '../../utils/jalaliDateUtils';

const ArticleCard = ({ article }) => {
  if (!article) return null;

  const detailUrl = `/resources/${encodeURIComponent(article.slug || article.id)}`;
  const categoryName = article.category?.name || article.category_detail?.name || 'آموزش پزشکی';
  const readingTime = article.reading_time_minutes || 5;

  return (
    <article className="bg-white/70 backdrop-blur-md border border-primary/20 hover:border-primary/40 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 group">
      <div>
        {/* Cover Image with 16:9 Aspect Ratio (Zero CLS) */}
        <Link to={detailUrl} className="block relative aspect-video overflow-hidden bg-slate-900/5 group/img">
          {article.cover_image ? (
            <>
              {/* Ambient blurred background for non-16:9 / vertical images */}
              <img
                src={formatMediaUrl(article.cover_image)}
                alt=""
                aria-hidden="true"
                tabIndex="-1"
                className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-110 pointer-events-none select-none"
              />
              {/* Main crisp image */}
              <img
                src={formatMediaUrl(article.cover_image)}
                alt={`${article.title} — دکتر نگار معشوری`}
                loading="lazy"
                className="relative z-10 w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 text-primary/60 font-bold text-xs text-center p-3">
              کلینیک تخصصی پستان دکتر نگار معشوری
            </div>
          )}

          {/* Category Badge */}
          <span className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-xs text-primary border border-primary/20 text-xs px-3 py-1 rounded-full font-bold shadow-xs">
            {categoryName}
          </span>
        </Link>

        {/* Card Body */}
        <div className="p-5 md:p-6">
          <div className="flex items-center gap-3 text-xs text-textDark/60 mb-3 font-medium">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-primary" />
              {toPersianDigits(readingTime)} دقیقه مطالعه
            </span>
            {article.views_count > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                {toPersianDigits(article.views_count)} بازدید
              </span>
            )}
          </div>

          <Link to={detailUrl}>
            <h3 className="text-base md:text-lg font-bold text-textDark mb-2.5 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
              {article.title}
            </h3>
          </Link>

          <p className="text-xs md:text-sm text-textDark/75 leading-relaxed font-medium line-clamp-2 mb-4">
            {article.excerpt || 'برای مطالعه توضیحات کامل و نکات پزشکی وارد صفحه مقاله شوید.'}
          </p>
        </div>
      </div>

      {/* Footer Info & Read Link */}
      <div className="px-5 md:px-6 pb-5 pt-3 border-t border-primary/10 flex items-center justify-between text-xs font-medium">
        <span className="text-textDark/50 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {article.created_at
            ? toPersianDigits(
                new Date(article.created_at).toLocaleDateString('fa-IR', {
                  year: 'numeric',
                  month: 'long',
                })
              )
            : 'اخیر'}
        </span>

        <Link
          to={detailUrl}
          className="text-primary font-bold inline-flex items-center gap-1 group-hover:gap-2 transition-all hover:text-primary-dark"
        >
          مطالعه مقاله
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
};

export default ArticleCard;
