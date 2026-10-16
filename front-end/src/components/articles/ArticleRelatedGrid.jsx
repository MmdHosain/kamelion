// src/components/articles/ArticleRelatedGrid.jsx
import React from 'react';
import ArticleCard from './ArticleCard';
import { BookOpen } from 'lucide-react';

const ArticleRelatedGrid = ({ articles = [] }) => {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="mt-16 pt-12 border-t border-primary/15">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xl font-black text-textDark">مقالات مرتبط و پیشنهادی</h3>
          <p className="text-xs text-textDark/60 font-medium">
            مطالعه سایر مباحث علمی پیرامون سلامت و درمان
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.slice(0, 3).map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
};

export default ArticleRelatedGrid;
