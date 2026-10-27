// src/components/admin/ai/AdminAiInspector.jsx
import React, { useState } from 'react';
import {
  Terminal,
  Activity,
  Copy,
  Check,
  ShieldAlert,
  Sparkles,
  Database,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Layers,
} from 'lucide-react';
import { toPersianDigits } from '../../../utils/jalaliDateUtils';

const TRIAGE_META = {
  urgent: { text: 'اورژانسی (Urgent)', bg: 'bg-red-500/10 text-red-600 border-red-500/20' },
  high_priority: { text: 'اولویت بالا (High Priority)', bg: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  low_priority: { text: 'اولویت عادی (Low Priority)', bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  out_of_scope: { text: 'خارج از حیطه (Out of Scope)', bg: 'bg-gray-500/10 text-gray-600 border-gray-500/20' },
  unknown: { text: 'نامشخص (Unknown)', bg: 'bg-slate-500/10 text-slate-600 border-slate-500/20' },
};

export const AdminAiInspector = ({ inspectorData }) => {
  const [activeTab, setActiveTab] = useState('triage'); // 'triage' | 'outbound' | 'ai_response' | 'client_http'
  const [copiedKey, setCopiedKey] = useState(null);

  const {
    triageLevel = 'unknown',
    triageSummary,
    fallback,
    bookingOffer,
    emergencyCode,
    latencyMs = 0,
    historyCount = 0,
    aiSessionId,
    outboundPayload,
    aiResponse,
    clientPayload,
    appliedToggles,
    lastUpdatedTime,
  } = inspectorData || {};

  const handleCopy = async (key, data) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // Ignore
    }
  };

  const levelInfo = TRIAGE_META[triageLevel] || TRIAGE_META.unknown;

  return (
    <div className="bg-white rounded-3xl border border-border/80 p-5 shadow-sm h-full flex flex-col">
      {/* Inspector Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-border/60 mb-3.5">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-black text-textDark">
            بازرس جامع ورودی و خروجی (AI Inspector)
          </h2>
        </div>
        {lastUpdatedTime && (
          <span className="text-[10px] text-mutedText font-mono">
            {lastUpdatedTime}
          </span>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 p-1 rounded-2xl bg-surface border border-border/60 text-xs font-bold mb-4">
        <button
          onClick={() => setActiveTab('triage')}
          className={`flex-1 min-w-[75px] py-1.5 px-2 rounded-xl transition-all text-center ${
            activeTab === 'triage'
              ? 'bg-white text-primary shadow-xs'
              : 'text-mutedText hover:text-textDark'
          }`}
        >
          خلاصه تریاژ
        </button>
        <button
          onClick={() => setActiveTab('outbound')}
          className={`flex-1 min-w-[75px] py-1.5 px-2 rounded-xl transition-all text-center flex items-center justify-center gap-1 ${
            activeTab === 'outbound'
              ? 'bg-white text-primary shadow-xs'
              : 'text-mutedText hover:text-textDark'
          }`}
          title="پیلود خامی که به مدل هوش مصنوعی ارسال شد"
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-blue-500" />
          <span>ورودی مدل</span>
        </button>
        <button
          onClick={() => setActiveTab('ai_response')}
          className={`flex-1 min-w-[75px] py-1.5 px-2 rounded-xl transition-all text-center flex items-center justify-center gap-1 ${
            activeTab === 'ai_response'
              ? 'bg-white text-primary shadow-xs'
              : 'text-mutedText hover:text-textDark'
          }`}
          title="پاسخ مستقیم دریافتی از مدل هوش مصنوعی"
        >
          <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />
          <span>خروجی مدل</span>
        </button>
        <button
          onClick={() => setActiveTab('client_http')}
          className={`flex-1 min-w-[75px] py-1.5 px-2 rounded-xl transition-all text-center flex items-center justify-center gap-1 ${
            activeTab === 'client_http'
              ? 'bg-white text-primary shadow-xs'
              : 'text-mutedText hover:text-textDark'
          }`}
          title="درخواست و پاسخ کلاینت به سرور"
        >
          <Layers className="w-3.5 h-3.5 text-purple-500" />
          <span>کلاینت HTTP</span>
        </button>
      </div>

      {/* Tab 1: Triage Overview */}
      {activeTab === 'triage' && (
        <div className="space-y-4 flex-1 overflow-y-auto pr-1">
          {/* Triage Level Card */}
          <div className="p-3.5 rounded-2xl bg-surface/70 border border-border/60">
            <div className="text-[11px] font-bold text-mutedText mb-1.5">
              سطح تریاژ استخراج‌شده (Triage Level):
            </div>
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-xl text-xs font-black border ${levelInfo.bg}`}>
                {levelInfo.text}
              </span>
              <span className="font-mono text-xs text-mutedText">
                {triageLevel}
              </span>
            </div>
          </div>

          {/* Internal Clinical Summary */}
          <div className="p-3.5 rounded-2xl bg-surface/70 border border-border/60">
            <div className="text-[11px] font-bold text-mutedText mb-1.5 flex items-center justify-between">
              <span>خلاصه ارزیابی بالینی هوش مصنوعی (Staff Summary):</span>
              <span className="text-[10px] text-mutedText/70">مختص کادر درمان</span>
            </div>
            {triageSummary ? (
              <p className="text-xs text-textDark leading-relaxed bg-white p-3 rounded-xl border border-border/50">
                {triageSummary}
              </p>
            ) : (
              <div className="text-xs text-mutedText/60 italic py-2">
                هنوز خلاصه‌ای تولید نشده است. پیام تستی ارسال کنید تا ارزیابی صورت گیرد.
              </div>
            )}
          </div>

          {/* Diagnostic Flags Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Fallback Flag */}
            <div className="p-3 rounded-2xl bg-surface/70 border border-border/60">
              <div className="text-[11px] font-bold text-mutedText mb-1">
                وضعیت پاسخ‌دهی:
              </div>
              <div>
                {fallback ? (
                  <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    مکانیسم فال‌بک
                  </span>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    مدل هوش مصنوعی
                  </span>
                )}
              </div>
            </div>

            {/* Response Time */}
            <div className="p-3 rounded-2xl bg-surface/70 border border-border/60">
              <div className="text-[11px] font-bold text-mutedText mb-1">
                زمان پاسخ (Latency):
              </div>
              <div className="text-xs font-bold text-textDark flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-primary" />
                {toPersianDigits(latencyMs)} ms
              </div>
            </div>

            {/* Booking Offer */}
            <div className="p-3 rounded-2xl bg-surface/70 border border-border/60">
              <div className="text-[11px] font-bold text-mutedText mb-1">
                پیشنهاد نوبت:
              </div>
              <div className="text-xs font-bold">
                {bookingOffer ? (
                  <span className="text-primary font-black">فعال (Booking Offer)</span>
                ) : (
                  <span className="text-mutedText">غیرفعال</span>
                )}
              </div>
            </div>

            {/* Emergency Code */}
            <div className="p-3 rounded-2xl bg-surface/70 border border-border/60">
              <div className="text-[11px] font-bold text-mutedText mb-1">
                کد ارجاع اورژانسی:
              </div>
              <div className="text-xs font-bold">
                {emergencyCode ? (
                  <span className="font-mono text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    {emergencyCode}
                  </span>
                ) : (
                  <span className="text-mutedText">ندارد</span>
                )}
              </div>
            </div>
          </div>

          {/* Context Toggles State */}
          <div className="p-3 rounded-2xl bg-surface/70 border border-border/60 text-xs">
            <div className="text-[11px] font-bold text-mutedText mb-2">
              وضعیت کانتکست در آخرین درخواست:
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px]">
              <span className={`px-2 py-0.5 rounded-lg border ${appliedToggles?.include_history !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                حافظه گفتگو: {appliedToggles?.include_history !== false ? 'ارسال شد' : 'حذف شد'}
              </span>
              <span className={`px-2 py-0.5 rounded-lg border ${appliedToggles?.include_patient !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                مشخصات بیمار: {appliedToggles?.include_patient !== false ? 'ارسال شد' : 'حذف شد'}
              </span>
              <span className={`px-2 py-0.5 rounded-lg border ${appliedToggles?.include_triage !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                تریاژ قبلی: {appliedToggles?.include_triage !== false ? 'ارسال شد' : 'حذف شد'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Outbound Payload to AI Service */}
      {activeTab === 'outbound' && (
        <div className="space-y-3 flex-1 overflow-y-auto pr-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-textDark">
              داده‌های ارسال‌شده به سرویس هوش مصنوعی (POST /v1/chat):
            </span>
            {outboundPayload && (
              <button
                onClick={() => handleCopy('outbound', outboundPayload)}
                className="flex items-center gap-1 text-[11px] text-mutedText hover:text-primary transition-colors"
              >
                {copiedKey === 'outbound' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500 font-bold">کپی شد</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>کپی JSON</span>
                  </>
                )}
              </button>
            )}
          </div>
          <p className="text-[11px] text-mutedText leading-relaxed">
            این داده‌ها دقیقاً همان مقادیری هستند که توسط بک‌اند استخراج، سوابق قبلی اضافه و به اندپوینت مدل هوش مصنوعی فرستاده شده‌اند:
          </p>
          <pre className="p-3.5 rounded-2xl bg-slate-900 text-cyan-300 font-mono text-[11px] overflow-x-auto max-h-[340px] dir-ltr text-left border border-slate-800">
            {outboundPayload
              ? JSON.stringify(outboundPayload, null, 2)
              : '// هنوز درخواستی ارسال نشده است.'}
          </pre>
        </div>
      )}

      {/* Tab 3: Raw AI Service Response */}
      {activeTab === 'ai_response' && (
        <div className="space-y-3 flex-1 overflow-y-auto pr-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-textDark">
              پاسخ مستقیم دریافتی از مدل هوش مصنوعی:
            </span>
            {aiResponse && (
              <button
                onClick={() => handleCopy('ai_resp', aiResponse)}
                className="flex items-center gap-1 text-[11px] text-mutedText hover:text-primary transition-colors"
              >
                {copiedKey === 'ai_resp' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500 font-bold">کپی شد</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>کپی JSON</span>
                  </>
                )}
              </button>
            )}
          </div>
          <p className="text-[11px] text-mutedText leading-relaxed">
            ساختار خام بازگشتی از مدل AI شامل پاسخ متن (reply) و آبجکت تریاژ (level و summary):
          </p>
          <pre className="p-3.5 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-[340px] dir-ltr text-left border border-slate-800">
            {aiResponse
              ? JSON.stringify(aiResponse, null, 2)
              : fallback
              ? '// پاسخ فال‌بک داخلی سرور استفاده شد (مدل خارجی خاموشی داشته است).'
              : '// پاسخی ثبت نشده است.'}
          </pre>
        </div>
      )}

      {/* Tab 4: Client HTTP Payload */}
      {activeTab === 'client_http' && (
        <div className="space-y-3 flex-1 overflow-y-auto pr-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-textDark">
              درخواست مرورگر به اندپوینت تست (/admin/chat/test/message/):
            </span>
            {clientPayload && (
              <button
                onClick={() => handleCopy('client', clientPayload)}
                className="flex items-center gap-1 text-[11px] text-mutedText hover:text-primary transition-colors"
              >
                {copiedKey === 'client' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500 font-bold">کپی شد</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>کپی JSON</span>
                  </>
                )}
              </button>
            )}
          </div>
          <pre className="p-3 rounded-2xl bg-slate-900 text-amber-300 font-mono text-[11px] overflow-x-auto max-h-[160px] dir-ltr text-left border border-slate-800">
            {clientPayload
              ? JSON.stringify(clientPayload, null, 2)
              : '// درخواستی ثبت نشده است.'}
          </pre>

          <div className="pt-2 border-t border-border/50 text-[11px] text-mutedText space-y-1">
            <div className="flex justify-between">
              <span>شناسه نشست کلاینت:</span>
              <span className="font-mono text-textDark">{clientPayload?.session_id || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span>طول کاراکتر پیام:</span>
              <span className="font-mono text-textDark">
                {toPersianDigits(clientPayload?.message?.length || 0)} کاراکتر
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAiInspector;
