// src/pages/admin/AdminAiPlayground.jsx
import React, { useState } from 'react';
import useAdminAiPlayground from '../../hooks/useAdminAiPlayground';
import AdminAiHeader from '../../components/admin/ai/AdminAiHeader';
import AdminAiContextToggles from '../../components/admin/ai/AdminAiContextToggles';
import AdminAiQuickPrompts from '../../components/admin/ai/AdminAiQuickPrompts';
import AdminAiChatStream from '../../components/admin/ai/AdminAiChatStream';
import AdminAiChatInput from '../../components/admin/ai/AdminAiChatInput';
import AdminAiInspector from '../../components/admin/ai/AdminAiInspector';
import AdminAiResetConfirmModal from '../../components/admin/ai/AdminAiResetConfirmModal';
import { AlertCircle, CheckCircle2, MessageSquare, Terminal } from 'lucide-react';

export const AdminAiPlayground = () => {
  const {
    sessionId,
    messages,
    isSending,
    errorNotice,
    resetNotice,
    inspectorData,
    includeHistory,
    setIncludeHistory,
    includePatient,
    setIncludePatient,
    includeTriage,
    setIncludeTriage,
    simulatedPatient,
    setSimulatedPatient,
    sendPrompt,
    resetMemory,
    clearErrorNotice,
    clearResetNotice,
  } = useAdminAiPlayground();

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState('chat'); // 'chat' | 'inspector'

  return (
    <div className="space-y-4">
      {/* Top Header & Actions */}
      <AdminAiHeader
        sessionId={sessionId}
        onOpenResetModal={() => setResetModalOpen(true)}
        historyCount={inspectorData.historyCount}
      />

      {/* Success / Reset Toast Banner */}
      {resetNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-medium">{resetNotice}</span>
          </div>
          <button
            onClick={clearResetNotice}
            className="text-[11px] font-bold text-emerald-800 hover:underline"
          >
            بستن
          </button>
        </div>
      )}

      {/* Error Toast Banner */}
      {errorNotice && (
        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{errorNotice}</span>
          </div>
          <button
            onClick={clearErrorNotice}
            className="text-[11px] font-bold text-red-700 hover:underline"
          >
            بستن
          </button>
        </div>
      )}

      {/* Context & Feature Toggles Bar */}
      <AdminAiContextToggles
        includeHistory={includeHistory}
        setIncludeHistory={setIncludeHistory}
        includePatient={includePatient}
        setIncludePatient={setIncludePatient}
        includeTriage={includeTriage}
        setIncludeTriage={setIncludeTriage}
        simulatedPatient={simulatedPatient}
        setSimulatedPatient={setSimulatedPatient}
        disabled={isSending}
      />

      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden p-1 rounded-2xl bg-surface border border-border text-xs font-bold">
        <button
          onClick={() => setMobileTab('chat')}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === 'chat'
              ? 'bg-white text-primary shadow-xs'
              : 'text-mutedText hover:text-textDark'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>محیط گفتگو</span>
        </button>
        <button
          onClick={() => setMobileTab('inspector')}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === 'inspector'
              ? 'bg-white text-primary shadow-xs'
              : 'text-mutedText hover:text-textDark'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>بازرس جامع (Inspector)</span>
        </button>
      </div>

      {/* Main 2-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Chat Stream & Interactive Input */}
        <div
          className={`lg:col-span-7 xl:col-span-8 flex flex-col bg-white rounded-3xl border border-border/80 p-5 shadow-sm ${
            mobileTab === 'inspector' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Clinical Quick Test Scenarios */}
          <AdminAiQuickPrompts
            onSelectPrompt={sendPrompt}
            disabled={isSending}
          />

          {/* Conversation Stream */}
          <AdminAiChatStream
            messages={messages}
            isSending={isSending}
          />

          {/* Chat Input */}
          <AdminAiChatInput
            onSend={sendPrompt}
            disabled={isSending}
          />
        </div>

        {/* Right Column: AI Inspector & Diagnostic Metadata */}
        <div
          className={`lg:col-span-5 xl:col-span-4 ${
            mobileTab === 'chat' ? 'hidden lg:block' : 'block'
          }`}
        >
          <AdminAiInspector inspectorData={inspectorData} />
        </div>
      </div>

      {/* Comprehensive Multi-Mode Reset Confirmation Modal */}
      <AdminAiResetConfirmModal
        open={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        onConfirm={resetMemory}
        sessionId={sessionId}
      />
    </div>
  );
};

export default AdminAiPlayground;
