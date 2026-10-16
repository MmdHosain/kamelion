import { useState, useRef, useCallback } from 'react';
import { reservationService } from '../api/reservationService';
import { jalaliToDate, getDaysInJalaliMonth, formatDateForApi } from '../utils/jalaliDateUtils';

export function useUnavailableDates() {
  const [unavailableDates, setUnavailableDates] = useState(new Set());
  const fetchedMonths = useRef(new Set());

  const fetchMonthDates = useCallback(async (jYear, jMonth) => {
    const firstDay = jalaliToDate(jYear, jMonth, 1);
    const daysInMonth = getDaysInJalaliMonth(jYear, jMonth);
    const lastDay = jalaliToDate(jYear, jMonth, daysInMonth);

    const startYear = firstDay.getFullYear();
    const startMonth = firstDay.getMonth() + 1;
    const endYear = lastDay.getFullYear();
    const endMonth = lastDay.getMonth() + 1;

    const fetchMonth = async (y, m) => {
      const monthKey = `${y}-${String(m).padStart(2, '0')}`;
      if (fetchedMonths.current.has(monthKey)) return [];
      
      try {
        // Optimistically mark as fetched to prevent concurrent duplicate calls
        fetchedMonths.current.add(monthKey);
        const res = await reservationService.getUnavailableDates(y, m);
        if (res && res.unavailable_dates) {
          return res.unavailable_dates;
        }
      } catch (e) {
        console.error("Error fetching unavailable dates", e);
        // Remove on failure so it can be retried later
        fetchedMonths.current.delete(monthKey);
      }
      return [];
    };

    const dates1 = await fetchMonth(startYear, startMonth);
    let dates2 = [];
    if (startYear !== endYear || startMonth !== endMonth) {
      dates2 = await fetchMonth(endYear, endMonth);
    }

    if (dates1.length > 0 || dates2.length > 0) {
      setUnavailableDates(prev => {
        const next = new Set(prev);
        dates1.forEach(d => next.add(typeof d === 'string' ? d : d.date || d));
        dates2.forEach(d => next.add(typeof d === 'string' ? d : d.date || d));
        return next;
      });
    }
  }, []);

  const isDateAvailable = useCallback((date) => {
    const dateStr = formatDateForApi(date);
    return !unavailableDates.has(dateStr);
  }, [unavailableDates]);

  const clearCache = useCallback(() => {
    setUnavailableDates(new Set());
    fetchedMonths.current.clear();
  }, []);

  return { isDateAvailable, fetchMonthDates, clearCache };
}
