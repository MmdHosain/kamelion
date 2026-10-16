// src/components/admin/articles/CategoryManagerModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Plus, Layers, Trash2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import adminArticleService from '../../../api/adminArticleService';

const generateSlug = (text) => {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\s\u200c]+/g, '-')
    .replace(/[^\w\u0600-\u06FF\-]/g, '')
    .slice(0, 80);
};

const CategoryManagerModal = ({ open, onClose, onCategoryAdded }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchCats = async () => {
    setLoading(true);
    try {
      const data = await adminArticleService.getCategories();
      setCategories(data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchCats();
      setNewCatName('');
      setNewCatDesc('');
      setFeedback(null);
    }
  }, [open]);

  if (!open) return null;

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      setFeedback({ type: 'error', text: 'لطفاً نام دسته‌بندی را وارد کنید.' });
      return;
    }

    // Check duplicate
    const exists = categories.some(
      (c) => c.name.trim().toLowerCase() === newCatName.trim().toLowerCase()
    );
    if (exists) {
      setFeedback({ type: 'error', text: 'دسته‌بندی با این عنوان از قبل وجود دارد.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    const payload = {
      name: newCatName.trim(),
      slug: generateSlug(newCatName),
      description: newCatDesc.trim(),
    };

    try {
      const created = await adminArticleService.createCategory(payload);
      setNewCatName('');
      setNewCatDesc('');
      setFeedback({
        type: 'success',
        text: `دسته‌بندی «${created.name}» با موفقیت افزوده شد.`,
      });

      await fetchCats();

      if (onCategoryAdded) {
        onCategoryAdded(created);
      }
    } catch (err) {
      console.error('Error creating category:', err);
      setFeedback({ type: 'error', text: 'خطا در ثبت دسته‌بندی جدید.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`آیا از حذف دسته‌بندی «${name}» اطمینان دارید؟`)) return;

    try {
      await adminArticleService.deleteCategory(id);
      await fetchCats();
      setFeedback({
        type: 'success',
        text: `دسته‌بندی «${name}» حذف گردید.`,
      });
    } catch (err) {
      console.error('Failed to delete category:', err);
      setFeedback({ type: 'error', text: 'خطا در حذف دسته‌بندی.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-primary/20 max-w-lg w-full overflow-hidden animate-scaleIn">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">مدیریت دسته‌بندی‌های مقالات</h3>
              <p className="text-xs text-slate-400 font-medium">افزودن دسته‌های جدید برای مقالات تخصصی</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5">
          {/* Feedback message */}
          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 border animate-fadeIn ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* New Category Form */}
          <form onSubmit={handleCreateCategory} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Plus className="w-3.5 h-3.5 text-primary" />
              افزودن دسته‌بندی جدید
            </h4>

            <div>
              <input
                type="text"
                placeholder="عنوان دسته‌بندی (مثال: غربالگری ژنتیک، تغذیه بیماران)..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary bg-white text-slate-800 font-medium"
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="توضیح کوتاه (اختیاری)..."
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary bg-white text-slate-600 font-medium"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                {submitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                ثبت و ایجاد دسته
              </button>
            </div>
          </form>

          {/* Existing Categories List */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 mb-2">دسته‌بندی‌های فعلی</h4>
            {loading ? (
              <div className="py-6 flex justify-center text-primary">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : categories.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">دسته‌بندی‌ای یافت نشد.</p>
            ) : (
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-2xl">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="p-3 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <span className="font-bold text-slate-800">{cat.name}</span>
                      <span className="text-[11px] text-slate-400 mr-2 font-mono">
                        ({cat.slug})
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="حذف دسته‌بندی"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryManagerModal;
