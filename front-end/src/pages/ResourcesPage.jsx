// src/pages/ResourcesPage.jsx
import React, { useState, useEffect } from 'react';
import { Search, Heart, Loader2, FileQuestion } from 'lucide-react';
import articleService from '../api/articleService';
import ArticleCard from '../components/articles/ArticleCard';

const ResourcesPage = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Load categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const cats = await articleService.getCategories();
        setCategories(cats || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch articles with debounced search
  useEffect(() => {
    let isCancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await articleService.getArticles({
          category: activeCategory,
          search: searchQuery,
        });
        if (!isCancelled) {
          setArticles(data?.results || []);
        }
      } catch (err) {
        console.error('Error fetching articles:', err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }, 300);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [activeCategory, searchQuery]);

  return (
    <main className="flex-grow flex flex-col items-center w-full pt-28 md:pt-32 pb-20">
      <div className="glass-panel fade-section is-visible max-w-6xl w-full mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-xs md:text-sm text-primary font-bold tracking-wider mb-2 uppercase">
            مرکز آموزش و آگاهی پزشکی
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-l from-primary to-primary-dark mb-4">
            مطالب و مقالات آموزشی
          </h1>
          <p className="text-textDark/75 max-w-xl mx-auto font-medium text-sm md:text-base leading-relaxed">
            مجموعه مقالات علمی و معتبر تدوین‌شده توسط دکتر نگار معشوری جهت ارتقای سطح آگاهی، پیشگیری و درمان به موقع.
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 bg-white/50 backdrop-blur-md p-4 rounded-3xl border border-primary/15 shadow-xs">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-primary text-white shadow-md shadow-primary/20 scale-102'
                  : 'bg-white/80 text-textDark/70 hover:bg-white hover:text-primary'
              }`}
            >
              همه مقالات
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.slug || cat.name)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeCategory === (cat.slug || cat.name)
                    ? 'bg-primary text-white shadow-md shadow-primary/20 scale-102'
                    : 'bg-white/80 text-textDark/70 hover:bg-white hover:text-primary'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-textDark/40 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="جستجو در عنوان یا موضوع..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-10 py-2.5 text-xs bg-white/90 border border-primary/20 rounded-2xl focus:outline-none focus:border-primary text-textDark placeholder:text-textDark/40 font-medium shadow-2xs"
            />
          </div>
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="text-xs text-textDark/60 font-medium">در حال دریافت مقالات آموزشی...</span>
          </div>
        ) : articles.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-3 bg-white/40 rounded-3xl border border-primary/10 mb-12">
            <div className="w-14 h-14 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-2">
              <FileQuestion className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-textDark">مقاله‌ای با این مشخصات یافت نشد</h3>
            <p className="text-xs text-textDark/60 font-medium max-w-sm leading-relaxed">
              لطفاً کلمات کلیدی دیگری را جستجو کنید یا دسته‌بندی دیگری را انتخاب فرمایید.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {/* Self Exam Box */}
        <div className="bg-gradient-to-br from-primary/15 to-primary-dark/15 border border-primary/30 p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-center gap-6 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-primary text-white flex items-center justify-center shrink-0 shadow-lg">
            <Heart className="w-8 h-8 animate-pulse" />
          </div>
          <div className="flex-1 text-center md:text-right">
            <h4 className="text-lg md:text-xl font-bold text-textDark mb-1">
              یادآور معاینه ماهانه بانوان
            </h4>
            <p className="text-textDark/80 text-sm font-medium leading-relaxed">
              بهترین زمان برای خودآزمایی ماهانه، ۲ تا ۳ روز پس از اتمام سیکل قاعدگی است. هرگونه تغییر لمس‌شده را جدی بگیرید و با پزشک متخصص مشورت نمایید.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ResourcesPage;
