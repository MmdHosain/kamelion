// src/components/admin/ai/AdminAiQuickPrompts.jsx
import React from 'react';
import { AlertTriangle, Stethoscope, Sparkles, HelpCircle, FileText } from 'lucide-react';

const CLINICAL_SCENARIOS = [
  {
    id: 'urgent',
    label: 'خونریزی و درد حاد (اورژانسی)',
    icon: AlertTriangle,
    color: 'text-red-500 bg-red-500/10 border-red-500/20 hover:border-red-500/50',
    prompt: 'سلام خانم دکتر، درد بسیار شدید، تب و ترشح خونی ناگهانی از سینه دارم، وضعیتم خطرناکه؟',
  },
  {
    id: 'high',
    label: 'لمس توده پستان (اولویت بالا)',
    icon: Stethoscope,
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20 hover:border-amber-500/50',
    prompt: 'توده سفت و بدون دردی به تازگی در سینه راستم لمس کرده‌ام، چه اقدامی باید انجام بدم؟',
  },
  {
    id: 'cosmetic',
    label: 'ماموپلاستی و زیبایی (اولویت عادی)',
    icon: Sparkles,
    color: 'text-primary bg-primary/10 border-primary/20 hover:border-primary/50',
    prompt: 'برای جراحی ماموپلاستی کاهشی و لیفت می‌خواستم شرایط و طول دوره نقاهت را بپرسم.',
  },
  {
    id: 'records',
    label: 'بررسی جواب سونوگرافی',
    icon: FileText,
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20 hover:border-blue-500/50',
    prompt: 'جواب سونوگرافی و ماموگرافی دوره‌ای من آماده شده، برای ویزیت باید چه مدارکی همراه داشته باشم؟',
  },
  {
    id: 'oos',
    label: 'سوال متفرقه (تست Out of Scope)',
    icon: HelpCircle,
    color: 'text-gray-500 bg-gray-500/10 border-gray-500/20 hover:border-gray-500/50',
    prompt: 'بهترین رژیم غذایی برای کاهش وزن سریع و درمان ریزش مو چیست؟',
  },
];

export const AdminAiQuickPrompts = ({ onSelectPrompt, disabled }) => {
  return (
    <div className="mb-4">
      <div className="text-xs font-bold text-mutedText mb-2 flex items-center justify-between">
        <span>سناریوهای تستی بالینی (پرامپت سریع):</span>
        <span className="text-[11px] text-mutedText/70">کلیک جهت بارگذاری مستقیم</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {CLINICAL_SCENARIOS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              disabled={disabled}
              onClick={() => onSelectPrompt(item.prompt)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${item.color} disabled:opacity-50 disabled:cursor-not-allowed active:scale-95`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AdminAiQuickPrompts;
