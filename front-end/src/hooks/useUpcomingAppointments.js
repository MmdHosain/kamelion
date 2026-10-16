// src/hooks/useUpcomingAppointments.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { reservationService } from '../api/reservationService';
import { formatJalaliDisplay } from '../utils/jalaliDateUtils';

export const toYMD = (d) => {
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const fromYMD = (str) => {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (d, count) => {
  const result = new Date(d);
  result.setDate(result.getDate() + count);
  return result;
};

export const getPresetDates = (presetKey) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (presetKey) {
    case 'today':
      return { start: toYMD(today), end: toYMD(today) };
    case 'tomorrow': {
      const tomorrow = addDays(today, 1);
      return { start: toYMD(tomorrow), end: toYMD(tomorrow) };
    }
    case 'next3': {
      const end3 = addDays(today, 2);
      return { start: toYMD(today), end: toYMD(end3) };
    }
    case 'next7': {
      const end7 = addDays(today, 6);
      return { start: toYMD(today), end: toYMD(end7) };
    }
    case 'next30': {
      const end30 = addDays(today, 29);
      return { start: toYMD(today), end: toYMD(end30) };
    }
    default:
      return null;
  }
};

const getFullName = (item) => {
  if (item.full_name) return item.full_name;
  if (item.fullName) return item.fullName;
  if (item.user_full_name) return item.user_full_name;
  if (item.patient_full_name) return item.patient_full_name;
  if (item.user?.full_name) return item.user.full_name;
  if (item.user?.name) return item.user.name;

  const firstName = item.user?.first_name || '';
  const lastName = item.user?.last_name || '';
  const combined = `${firstName} ${lastName}`.trim();
  return combined || '-';
};

const normalizeAppointment = (item) => {
  const rawDate = item.appointment_date || item.date || '';
  let dateObj = null;
  if (rawDate) {
    const parts = rawDate.split('-').map(Number);
    if (parts.length === 3) {
      dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    }
  }

  return {
    id: item.id,
    userId: item.user_id || item.userId || item.user?.id || null,
    nationalId: item.national_id || item.nationalId || item.user?.national_id || null,
    phoneNumber:
      item.phone_number ||
      item.phoneNumber ||
      item.patient_phone_number ||
      item.user?.phone_number ||
      '-',
    fullName: getFullName(item),
    rawDate,
    dateObj,
    displayDate: dateObj ? formatJalaliDisplay(dateObj, true) : rawDate || '-',
    time: (item.appointment_time || item.time || '').slice(0, 5),
    reason: item.reason || item.description || '-',
    status: item.status || 'scheduled',
    createdAt: item.created_at || null,
  };
};

export function useUpcomingAppointments() {
  const initialPreset = 'next7';
  const initialDates = getPresetDates(initialPreset);

  const [activePreset, setActivePreset] = useState(initialPreset);
  const [startDate, setStartDate] = useState(initialDates.start);
  const [endDate, setEndDate] = useState(initialDates.end);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'scheduled' | 'pending'
  const [searchQuery, setSearchQuery] = useState('');

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUpcoming = useCallback(async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    setError('');

    try {
      const params = {
        date_from: startDate,
        date_to: endDate,
      };

      const rawItems = await reservationService.getAdminReservations(params);
      const normalized = rawItems.map(normalizeAppointment);

      // Sort by date ascending, then by time ascending
      normalized.sort((a, b) => {
        if (a.rawDate !== b.rawDate) {
          return a.rawDate.localeCompare(b.rawDate);
        }
        return a.time.localeCompare(b.time);
      });

      setAppointments(normalized);
    } catch (err) {
      console.error('[useUpcomingAppointments] Failed to fetch:', err);
      setError('بارگذاری نوبت‌های آتی با خطا مواجه شد. لطفاً دوباره تلاش نمایید.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchUpcoming();
  }, [fetchUpcoming]);

  const selectPreset = useCallback((presetKey) => {
    setActivePreset(presetKey);
    const dates = getPresetDates(presetKey);
    if (dates) {
      setStartDate(dates.start);
      setEndDate(dates.end);
    }
  }, []);

  const setCustomRange = useCallback((start, end) => {
    setActivePreset('custom');
    setStartDate(start);
    setEndDate(end);
  }, []);

  // Filter appointments by status and search query
  const filteredAppointments = useMemo(() => {
    return appointments.filter((item) => {
      // Status filter
      if (statusFilter === 'scheduled' && item.status !== 'scheduled') {
        return false;
      }
      if (statusFilter === 'pending' && item.status !== 'pending') {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesName = item.fullName.toLowerCase().includes(query);
        const matchesPhone = item.phoneNumber.includes(query);
        const matchesNational = item.nationalId ? item.nationalId.includes(query) : false;
        if (!matchesName && !matchesPhone && !matchesNational) {
          return false;
        }
      }

      return true;
    });
  }, [appointments, statusFilter, searchQuery]);

  // Group by date YYYY-MM-DD
  const groupedByDay = useMemo(() => {
    const groups = {};

    filteredAppointments.forEach((item) => {
      if (!groups[item.rawDate]) {
        groups[item.rawDate] = {
          dateKey: item.rawDate,
          dateObj: item.dateObj,
          displayDate: item.displayDate,
          items: [],
          scheduledCount: 0,
          pendingCount: 0,
        };
      }

      groups[item.rawDate].items.push(item);
      if (item.status === 'scheduled') {
        groups[item.rawDate].scheduledCount += 1;
      } else if (item.status === 'pending') {
        groups[item.rawDate].pendingCount += 1;
      }
    });

    return Object.values(groups).sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  }, [filteredAppointments]);

  // Summary counts
  const summary = useMemo(() => {
    let total = appointments.length;
    let scheduled = 0;
    let pending = 0;

    appointments.forEach((item) => {
      if (item.status === 'scheduled') scheduled++;
      if (item.status === 'pending') pending++;
    });

    return { total, scheduled, pending };
  }, [appointments]);

  return {
    startDate,
    endDate,
    activePreset,
    selectPreset,
    setCustomRange,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    groupedByDay,
    totalCount: filteredAppointments.length,
    summary,
    loading,
    error,
    refresh: fetchUpcoming,
  };
}
