// src/components/admin/articles/ArticleStatusBadge.jsx
import React from 'react';
import { CheckCircle2, FileEdit } from 'lucide-react';

const ArticleStatusBadge = ({ status = 'draft', className = '' }) => {
  const isPublished = status === 'published';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
        isPublished
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
          : 'bg-amber-50 text-amber-700 border border-amber-200/70'
      } ${className}`}
    >
      {isPublished ? (
        <>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          منتشرشده
        </>
      ) : (
        <>
          <FileEdit className="w-3.5 h-3.5 text-amber-600" />
          پیش‌نویس
        </>
      )}
    </span>
  );
};

export default ArticleStatusBadge;
