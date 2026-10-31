import React, { useState, useEffect, useMemo } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { toPersianDigits } from '../../../../utils/jalaliDateUtils';

export const UrgentExpiryBadge = ({ expiresAt, onExpired }) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    // Tick every minute to keep remaining time updated
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 60 * 1000);

    return () => clearInterval(timer);
  }, []);

  const expiryState = useMemo(() => {
    if (!expiresAt) return { text: '—', isExpired: false, isNearExpiry: false };

    const expTime = new Date(expiresAt).getTime();
    if (isNaN(expTime)) return { text: '—', isExpired: false, isNearExpiry: false };

    const diffMs = expTime - now;

    if (diffMs <= 0) {
      return { text: 'منقضی شده', isExpired: true, isNearExpiry: false };
    }

    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const remHours = totalHours % 24;
    const isNearExpiry = totalHours <= 24;

    let text = '';
    if (days > 0) {
      text = `${toPersianDigits(days)} روز و ${toPersianDigits(remHours)} ساعت`;
    } else {
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      text = `${toPersianDigits(totalHours)} ساعت و ${toPersianDigits(minutes)} دقیقه`;
    }

    return { text, isExpired: false, isNearExpiry };
  }, [expiresAt, now]);

  useEffect(() => {
    if (expiryState.isExpired && onExpired) {
      onExpired();
    }
  }, [expiryState.isExpired, onExpired]);

  if (expiryState.isExpired) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gray-100 border border-gray-200 text-gray-500 text-xs font-bold">
        <Clock size={13} />
        <span>منقضی شده</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition-colors ${
        expiryState.isNearExpiry
          ? 'bg-amber-50 border-amber-200 text-amber-800'
          : 'bg-rose-50 border-rose-200 text-rose-700'
      }`}
      title="زمان باقی‌مانده تا انقضای اعتبار کد ارجاع اورژانسی"
    >
      {expiryState.isNearExpiry ? (
        <AlertTriangle size={13} className="text-amber-600 animate-pulse" />
      ) : (
        <Clock size={13} className="text-rose-600" />
      )}
      <span>اعتبار: {expiryState.text}</span>
    </span>
  );
};

export default UrgentExpiryBadge;

