// src/pages/ArticleDetailPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft,
  Calendar,
  Clock,
  Eye,
  Share2,
  Check,
  Send,
  MessageCircle,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Loader2,
  FileQuestion,
  CheckCircle2,
  Bot,
  MessageSquare,
} from 'lucide-react';
import articleService from '../api/articleService';
import ArticleSidebar from '../components/articles/ArticleSidebar';
import ArticleMediaEmbed from '../components/articles/ArticleMediaEmbed';
import ArticleRelatedGrid from '../components/articles/ArticleRelatedGrid';
import { formatMediaUrl, formatMediaHtml } from '../utils/mediaUtils';
import { toPersianDigits } from '../utils/jalaliDateUtils';
import SEO, { SITE_URL } from '../components/seo/SEO';

const sanitizeAndAddIdsToHeadings = (rawHtml) => {
  if (!rawHtml) return { processedHtml: '', headings: [] };

  const html = formatMediaHtml(rawHtml);
  const headings = [];
  let index = 0;

  // Replace <h2> tags with id
  const processedHtml = html.replace(/<h2(.*?)>(.*?)<\/h2>/gi, (match, attrs, text) => {
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    const id = `section-${index++}`;
    headings.push({ id, text: cleanText });
    return `<h2 id="${id}" ${attrs} class="scroll-mt-32 text-xl md:text-2xl font-black text-slate-800 mt-8 mb-4 border-b border-primary/10 pb-2">${text}</h2>`;
  });

  return { processedHtml, headings };
};

const ArticleDetailPage = ({ onOpenAppointment, onOpenChat }) => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await articleService.getArticleBySlug(slug);
        setArticle(data);

        // Fetch related articles
        const all = await articleService.getArticles();
        const related = (all?.results || []).filter(
          (a) => String(a.slug || a.id) !== String(slug)
        );
        setRelatedArticles(related);
      } catch (err) {
        console.error('Failed to load article detail:', err);
        setError('مقاله مورد نظر یافت نشد یا در دسترس نمی‌باشد.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
    window.scrollTo(0, 0);
  }, [slug]);

  const { processedHtml, headings } = useMemo(() => {
    return sanitizeAndAddIdsToHeadings(article?.content || '');
  }, [article?.content]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareOnTelegram = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(article?.title || '');
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`${article?.title}\n${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  if (loading) {
    return (
      <main className="flex-grow flex items-center justify-center min-h-[60vh] pt-32 pb-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="text-xs text-textDark/60 font-medium">در حال بارگذاری مقاله...</span>
        </div>
      </main>
    );
  }

  if (error || !article) {
    return (
      <main className="flex-grow flex items-center justify-center min-h-[60vh] pt-32 pb-20 px-4">
        <SEO title="مقاله یافت نشد" noindex={true} />
        <div className="bg-white/80 backdrop-blur-md p-8 md:p-12 rounded-3xl border border-primary/20 text-center max-w-md w-full shadow-lg">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <FileQuestion className="w-8 h-8" />
          </div>
          <h2 className="text-lg md:text-xl font-bold text-textDark mb-2">مقاله یافت نشد</h2>
          <p className="text-xs text-textDark/60 mb-6 leading-relaxed font-medium">
            متاسفانه مقاله مورد نظر حذف شده یا آدرس وارد شده صحیح نمی‌باشد.
          </p>
          <Link
            to="/resources"
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md shadow-primary/20"
          >
            <ArrowRight className="w-4 h-4" />
            بازگشت به آرشیو مقالات
          </Link>
        </div>
      </main>
    );
  }

  const categoryName = article.category?.name || article.category_detail?.name || 'آموزش پزشکی';
  const authorName = article.author?.full_name || article.author_name || 'دکتر نگار معشوری';
  const authorDegree = article.author?.medical_degree || 'جراح متخصص پستان و انکوپلاستی';

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: article.title,
    description: article.excerpt || article.title,
    image: article.cover_image ? formatMediaUrl(article.cover_image) : `${SITE_URL}/pink-ribbon.svg`,
    url: `${SITE_URL}/resources/${article.slug}`,
    author: {
      '@type': 'Physician',
      name: authorName,
      jobTitle: authorDegree,
    },
    publisher: {
      '@type': 'MedicalClinic',
      name: 'کلینیک تخصصی پستان دکتر نگار معشوری',
      url: SITE_URL,
      logo: `${SITE_URL}/pink-ribbon.svg`,
    },
    datePublished: article.published_at || article.created_at,
    dateModified: article.updated_at || article.published_at || article.created_at,
  };

  return (
    <main className="flex-grow flex flex-col items-center w-full pt-28 md:pt-32 pb-20">
      <SEO
        title={article.title}
        description={article.excerpt || 'مقاله آموزشی و تخصصی پیرامون سلامت، غربالگری و جراحی‌های پستان.'}
        url={`/resources/${article.slug}`}
        image={article.cover_image ? formatMediaUrl(article.cover_image) : undefined}
        type="article"
        schema={articleSchema}
      />
      <article className="glass-panel fade-section is-visible max-w-6xl w-full mx-auto px-4 md:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex flex-wrap items-center gap-2 text-xs text-textDark/60 mb-8 font-medium">
          <Link to="/" className="hover:text-primary transition-colors shrink-0">
            خانه
          </Link>
          <ChevronLeft className="w-3.5 h-3.5 text-textDark/30 shrink-0" />
          <Link to="/resources" className="hover:text-primary transition-colors shrink-0">
            مقالات و آموزش
          </Link>
          <ChevronLeft className="w-3.5 h-3.5 text-textDark/30 shrink-0" />
          <span className="text-primary font-bold shrink-0">{categoryName}</span>
          <ChevronLeft className="w-3.5 h-3.5 text-textDark/30 shrink-0" />
          <span className="text-textDark/80 truncate max-w-[180px] sm:max-w-xs">{article.title}</span>
        </nav>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-block bg-primary/10 text-primary border border-primary/20 text-xs px-3.5 py-1 rounded-full font-bold shadow-2xs">
              {categoryName}
            </span>
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-3 py-1 rounded-full text-[11px] md:text-xs font-bold shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>بررسی و تایید بالینی توسط {authorName}</span>
            </div>
          </div>

          <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-800 leading-tight mb-6">
            {article.title}
          </h1>

          {/* Metadata & Author Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/60 border border-primary/15 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-base shadow-md shadow-primary/20 shrink-0">
                د
              </div>
              <div>
                <div className="text-xs md:text-sm font-bold text-slate-800">{authorName}</div>
                <div className="text-[11px] text-slate-500 font-medium">{authorDegree}</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                {article.created_at
                  ? toPersianDigits(
                      new Date(article.created_at).toLocaleDateString('fa-IR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    )
                  : 'امروز'}
              </span>

              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                {toPersianDigits(article.reading_time_minutes || 5)} دقیقه مطالعه
              </span>

              {article.views_count > 0 && (
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  {toPersianDigits(article.views_count)} بازدید
                </span>
              )}
            </div>

            {/* Quick Share Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start pt-2 sm:pt-0 border-t sm:border-t-0 border-primary/10">
              <span className="text-xs text-slate-500 font-medium sm:hidden ml-auto">اشتراک‌گذاری:</span>
              <button
                type="button"
                onClick={handleCopyLink}
                title="کپی لینک مقاله"
                className="p-2 rounded-xl bg-white hover:bg-primary/10 hover:text-primary border border-slate-200 text-slate-600 transition-all cursor-pointer shadow-2xs"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={shareOnTelegram}
                title="اشتراک در تلگرام"
                className="p-2 rounded-xl bg-white hover:bg-sky-50 hover:text-sky-600 border border-slate-200 text-slate-600 transition-all cursor-pointer shadow-2xs"
              >
                <Send className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={shareOnWhatsApp}
                title="اشتراک در واتس‌اپ"
                className="p-2 rounded-xl bg-white hover:bg-emerald-50 hover:text-emerald-600 border border-slate-200 text-slate-600 transition-all cursor-pointer shadow-2xs"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {article.cover_image && (
          <div className="relative mb-10 rounded-3xl overflow-hidden max-h-[520px] w-full border border-primary/20 shadow-md bg-slate-900/5 backdrop-blur-xs flex items-center justify-center min-h-[220px] sm:min-h-[340px]">
            {/* Ambient blurred background */}
            <img
              src={formatMediaUrl(article.cover_image)}
              alt=""
              aria-hidden="true"
              tabIndex="-1"
              className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-35 scale-110 pointer-events-none select-none"
            />
            {/* Main crisp cover image */}
            <img
              src={formatMediaUrl(article.cover_image)}
              alt={article.title}
              className="relative z-10 max-h-[520px] w-auto max-w-full object-contain mx-auto"
            />
          </div>
        )}

        {/* Optional Embedded Video */}
        {article.video_embed_url && (
          <ArticleMediaEmbed videoUrl={article.video_embed_url} title={article.title} />
        )}

        {/* Main Content & Sticky Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Article Text Content (2 Cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Excerpt Lead */}
            {article.excerpt && (
              <div className="p-5 md:p-6 rounded-3xl bg-primary/10 border-r-4 border-primary text-textDark/85 font-medium text-sm md:text-base leading-relaxed">
                {article.excerpt}
              </div>
            )}

            {/* Sanitized HTML Content */}
            <div
              dir="auto"
              className="article-rich-content text-slate-800 text-sm md:text-base leading-loose font-sans space-y-4"
              dangerouslySetInnerHTML={{ __html: processedHtml }}
            />

            {/* Interactive AI Triage CTA Card (Chatbot-to-Content Flywheel) */}
            {onOpenChat && (
              <div className="bg-gradient-to-l from-primary/15 via-primary/5 to-white border border-primary/25 p-5 md:p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-5 shadow-sm mt-8">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-primary text-white flex items-center justify-center font-bold shadow-md shadow-primary/20 shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm md:text-base font-bold text-slate-800 mb-1">
                      درباره این موضوع یا علائم خود سوالی دارید؟
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      می‌توانید به رایگان با دستیار هوشمند تریاژ کلینیک مشورت کرده و راهنمایی اولیه دریافت کنید.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenChat}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md shadow-primary/20 shrink-0 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>گفت‌وگو با دستیار</span>
                </button>
              </div>
            )}

            {/* Clinical Disclaimer Box */}
            <div className="bg-amber-50/80 border border-amber-200/80 p-5 rounded-3xl flex items-start gap-3 text-amber-900 text-xs md:text-sm leading-relaxed mt-10">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-1">یادآوری حقوقی و سلب مسئولیت پزشکی:</span>
                اطلاعات و محتوای ارائه شده در این مقاله صرفاً با هدف ارتقای سطح آگاهی عمومی نگارش یافته و به هیچ عنوان جایگزین معاینه، تشخیص قطعی یا دستورات دارویی جراح متخصص محسوب نمی‌گردد.
              </div>
            </div>
          </div>

          {/* Sticky Sidebar (1 Col) */}
          <div className="lg:col-span-1">
            <ArticleSidebar
              headings={headings}
              onOpenAppointment={onOpenAppointment}
            />
          </div>
        </div>

        {/* Related Articles Grid */}
        <ArticleRelatedGrid articles={relatedArticles} />
      </article>
    </main>
  );
};

export default ArticleDetailPage;
