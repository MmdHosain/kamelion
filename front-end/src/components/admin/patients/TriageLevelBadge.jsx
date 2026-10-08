// src/components/admin/patients/TriageLevelBadge.jsx
import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, HelpCircle, ShieldAlert } from 'lucide-react';

const TRIAGE_CONFIG = {
  urgent: {
    label: 'اورژانسی (فوری)',
    bg: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-500 animate-pulse',
    icon: AlertTriangle,
  },
  high_priority: {
    label: 'اولویت بالا',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    icon: AlertCircle,
  },
  low_priority: {
    label: 'اولویت عادی',
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
    icon: CheckCircle,
  },
  out_of_scope: {
    label: 'خارج از حیطه',
    bg: 'bg-gray-100 text-gray-600 border-gray-200',
    dot: 'bg-gray-400',
    icon: HelpCircle,
  },
  unknown: {
    label: 'نامشخص',
    bg: 'bg-gray-100 text-gray-600 border-gray-200',
    dot: 'bg-gray-400',
    icon: HelpCircle,
  },
};

export const TriageLevelBadge = ({ level, size = 'sm' }) => {
  if (!level) {
    return <span className="text-gray-400 text-xs">—</span>;
  }

  const config = TRIAGE_CONFIG[level] || {
    label: level,
    bg: 'bg-gray-50 text-gray-600 border-gray-200',
    dot: 'bg-gray-400',
    icon: ShieldAlert,
  };

  const Icon = config.icon;

  const sizeClasses =
    size === 'lg'
      ? 'text-xs px-3 py-1.5 gap-1.5'
      : 'text-[11px] px-2 py-0.5 gap-1';

  return (
    <span
      className={`inline-flex items-center font-bold border rounded-full ${config.bg} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <Icon size={size === 'lg' ? 14 : 12} />
      <span>{config.label}</span>
    </span>
  );
};

export default TriageLevelBadge;
