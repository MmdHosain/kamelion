import React, { useState } from 'react';
import { Palette, CheckCircle2, Sparkles, Shield, Loader2 } from 'lucide-react';
import { useThemeStore, THEMES } from '../../store/themeStore';

const AdminSettings = () => {
  const { activeTheme, saveTheme, isLoading } = useThemeStore();
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSelectTheme = async (key) => {
    const ok = await saveTheme(key);
    if (ok) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-primary/20 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-2xl font-black text-primary flex items-center gap-2.5">
            <Palette className="w-7 h-7" />
            تنظیمات تم و ظاهر سراسری سایت
          </h1>
          <p className="text-sm text-textDark/70 mt-1 font-medium">
            تم انتخاب‌شده در این بخش، بلافاصله برای تمامی کاربران و بازدیدکنندگان وب‌سایت اعمال خواهد شد.
          </p>
        </div>
        {saveSuccess && (
          <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>تم سراسری در سرور با موفقیت ذخیره شد</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(THEMES).map(([key, theme]) => {
          const isSelected = activeTheme === key;

          return (
            <div
              key={key}
              onClick={() => handleSelectTheme(key)}
              className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between shadow-sm ${
                isSelected
                  ? 'border-primary bg-primary/10 shadow-lg scale-102 ring-2 ring-primary/30'
                  : 'border-primary/20 bg-white/70 hover:border-primary/50 hover:bg-white'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-black text-lg text-textDark">{theme.name}</h3>
                  {isSelected && (
                    <CheckCircle2 className="w-6 h-6 text-primary animate-pulse" />
                  )}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span
                    className="w-8 h-8 rounded-full shadow-md border-2 border-white"
                    style={{ backgroundColor: theme.primary }}
                    title="رنگ اصلی"
                  />
                  <span
                    className="w-8 h-8 rounded-full shadow-md border-2 border-white"
                    style={{ backgroundColor: theme.primaryDark }}
                    title="رنگ فرعی"
                  />
                  <span
                    className="w-8 h-8 rounded-full shadow-md border-2 border-white"
                    style={{ backgroundColor: theme.bgLight }}
                    title="پس‌زمینه روشن"
                  />
                  <span
                    className="w-8 h-8 rounded-full shadow-md border-2 border-white"
                    style={{ backgroundColor: theme.bgDark }}
                    title="پس‌زمینه تیره"
                  />
                </div>

                <p className="text-xs text-textDark/70 leading-relaxed font-medium">
                  {key === 'pink' && 'طراحی لطیف و ارگونومیک با صورتی و سرخابی اختصاصی جراحی پستان.'}
                  {key === 'lilac' && 'طراحی آرامش‌بخش با تناژ یاسی ملایم و بنفش ملایم پزشکی.'}
                  {key === 'purple' && 'طراحی لوکس و تمایزیافته با ارغوانی و بنفش سلطنتی.'}
                </p>
              </div>

              <button
                type="button"
                disabled={isLoading}
                className={`mt-6 w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                  isSelected
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white/80 text-primary border border-primary/20 hover:bg-primary hover:text-white'
                }`}
              >
                {isLoading && isSelected ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>در حال ذخیره...</span>
                  </>
                ) : isSelected ? (
                  'تم فعال فعلی'
                ) : (
                  'انتخاب و فعال‌سازی این تم'
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-white/60 border border-primary/20 rounded-3xl p-6 flex items-start gap-4">
        <Shield className="w-6 h-6 text-primary shrink-0 mt-1" />
        <div>
          <h4 className="font-bold text-textDark text-sm mb-1">کنترل امنیتی دسترسی به تم</h4>
          <p className="text-xs text-textDark/70 font-medium leading-relaxed">
            سوئیچر تم عمومی از دید بازدیدکنندگان عادی در بخش کلاینت حذف شده و تغییر پالت رنگی منحصراً از این پنل و توسط مدیر سیستم کنترل می‌شود.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
