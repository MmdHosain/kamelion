// src/components/admin/patients/PatientTriageSection.jsx
import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Shield,
  Loader2,
  Calendar,
  Copy,
  Check,
} from 'lucide-react';
import { adminApi } from '../../../api/admin';
import TriageLevelBadge from './TriageLevelBadge';

const formatPersianTime = (isoString) => {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
};

export const PatientTriageSection = ({ patientId }) => {
  const [triageInfo, setTriageInfo] = useState(null);
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedChatId, setExpandedChatId] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (!patientId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    Promise.allSettled([
      adminApi.getPatientTriageLevel(patientId),
      adminApi.getPatientChats(patientId),
    ]).then(([triageRes, chatsRes]) => {
      if (!isMounted) return;

      if (triageRes.status === 'fulfilled' && triageRes.value) {
        setTriageInfo(triageRes.value);
      }

      if (chatsRes.status === 'fulfilled' && chatsRes.value) {
        const results = Array.isArray(chatsRes.value)
          ? chatsRes.value
          : chatsRes.value?.results || [];
        setChats(results);
        if (results.length > 0) {
          setExpandedChatId(results[0].id);
        }
      }

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [patientId]);

  const copyEmergencyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50/50 border border-gray-200/80 rounded-2xl flex flex-col p-6 items-center justify-center gap-3 min-h-[300px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="text-xs text-gray-500 font-medium">در حال دریافت داده‌های تریاژ...</span>
      </div>
    );
  }

  const hasTriage = Boolean(triageInfo?.triage_level);

  return (
    <div className="bg-gray-50/50 border border-gray-200/80 rounded-2xl flex flex-col p-4 gap-3 shadow-inner w-full min-w-0 overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
        <h3 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
          <Activity size={15} className="text-primary" />
          ارزیابی و تریاژ هوشمند بالینی
        </h3>
        {hasTriage && <TriageLevelBadge level={triageInfo.triage_level} />}
      </div>

      <div className="flex-1 overflow-y-auto chat-scroll space-y-3 max-h-[340px] min-h-[140px] pr-1">
        {/* Latest Triage Summary Card */}
        {hasTriage ? (
          <div className="p-3 bg-white border border-gray-100 rounded-xl flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold text-gray-700">
              <span>سطح اولویت بالینی:</span>
              <TriageLevelBadge level={triageInfo.triage_level} size="lg" />
            </div>

            {triageInfo.emergency_code && (
              <div className="flex items-center justify-between p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs">
                <span className="font-bold text-red-700 flex items-center gap-1">
                  <AlertTriangle size={14} />
                  کد ارجاع اورژانسی:
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-red-700 text-sm">
                    {triageInfo.emergency_code}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyEmergencyCode(triageInfo.emergency_code)}
                    className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors cursor-pointer"
                    title="کپی کد"
                  >
                    {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            )}

            {triageInfo.triage_summary ? (
              <div className="flex flex-col gap-1 text-xs">
                <span className="text-[11px] text-gray-400 font-medium">
                  خلاصه بالینی ویژه پزشک / پرسنل:
                </span>
                <p className="text-gray-800 leading-relaxed bg-gray-50/80 p-2.5 rounded-lg border border-gray-100 font-medium">
                  {triageInfo.triage_summary}
                </p>
              </div>
            ) : null}

            {triageInfo.updated_at && (
              <span className="text-[10px] text-gray-400">
                آخرین ارزیابی: {formatPersianTime(triageInfo.updated_at)}
              </span>
            )}
          </div>
        ) : (
          <div className="p-4 bg-white border border-gray-100 rounded-xl text-center text-gray-400 text-xs">
            هنوز ارزیابی تریاژی برای این بیمار ثبت نشده است.
          </div>
        )}

        {/* Chat Conversations Accordion */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-gray-700 pt-1">
            <span className="flex items-center gap-1.5">
              <MessageSquare size={13} className="text-primary" />
              سوابق گفتگوهای چت بیمار ({chats.length})
            </span>
          </div>

          {chats.length === 0 ? (
            <div className="text-[11px] text-gray-400 text-center py-3 bg-white/60 rounded-xl border border-gray-100">
              هیچ گفتگویی در چت ثبت نشده است.
            </div>
          ) : (
            chats.map((chat) => {
              const isExpanded = expandedChatId === chat.id;
              const messages = Array.isArray(chat.messages) ? chat.messages : [];

              return (
                <div
                  key={chat.id}
                  className="bg-white border border-gray-100 rounded-xl shadow-xs overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedChatId(isExpanded ? null : chat.id)}
                    className="w-full flex items-center justify-between p-2.5 text-right hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <TriageLevelBadge level={chat.triage_level} />
                      <span className="text-xs font-medium text-gray-700 font-mono">
                        {chat.message_count} پیام
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400">
                        {formatPersianTime(chat.last_message_at || chat.updated_at)}
                      </span>
                      {isExpanded ? (
                        <ChevronUp size={14} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={14} className="text-gray-400" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-3 border-t border-gray-100 bg-gray-50/50 space-y-2 max-h-[220px] overflow-y-auto chat-scroll">
                      {messages.length === 0 ? (
                        <span className="text-[10px] text-gray-400">متنی برای این نشست یافت نشد.</span>
                      ) : (
                        messages.map((m) => {
                          const isUser = m.role === 'user';
                          const isBackend = m.role === 'backend';

                          return (
                            <div
                              key={m.id}
                              className={`flex flex-col text-xs leading-relaxed p-2 rounded-lg ${
                                isUser
                                  ? 'bg-primary/10 text-primary-dark self-start mr-4'
                                  : isBackend
                                  ? 'bg-amber-50 border border-amber-200 text-amber-900'
                                  : 'bg-white border border-gray-100 text-gray-800 ml-4 shadow-2xs'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[10px] opacity-70 mb-1">
                                <span className="font-bold">
                                  {isUser
                                    ? 'بیمار'
                                    : isBackend
                                    ? 'سیستم کلینیک'
                                    : 'پاسخ هوش مصنوعی'}
                                </span>
                                <span>{formatPersianTime(m.created_at)}</span>
                              </div>
                              <p className="whitespace-pre-line">{m.content}</p>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="p-2.5 bg-primary/5 border border-primary/15 rounded-xl text-[11px] text-primary-dark font-medium flex items-center gap-2">
          <Shield size={14} className="shrink-0 text-primary" />
          <span>تریاژ هوشمند صرفاً نقش غربالگری اولیه را دارد و جایگزین تشخیص پزشک نیست.</span>
        </div>
      </div>
    </div>
  );
};

export default PatientTriageSection;
