import { useState, useEffect, useCallback, useRef } from 'react';
import { urgentPatientsService } from '../api/urgentPatientsService';
import { useUrgentPatientsStore } from '../store/urgentPatientsStore';

const AUTO_REFRESH_INTERVAL_MS = 60 * 1000; // 1 minute as requested

export const useUrgentPatients = (initialPageSize = 10) => {
  const [patients, setPatients] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const setUrgentCount = useUrgentPatientsStore((state) => state.setUrgentCount);
  const abortControllerRef = useRef(null);

  const fetchPatients = useCallback(
    async (isBackground = false) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      if (isBackground) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const data = await urgentPatientsService.list({
          page,
          pageSize,
          signal: abortControllerRef.current.signal,
        });

        const safeResults = Array.isArray(data?.results) ? data.results : [];
        const safeCount = typeof data?.count === 'number' ? data.count : safeResults.length;

        setPatients(safeResults);
        setCount(safeCount);
        setUrgentCount(safeCount);
      } catch (err) {
        if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') {
          return;
        }
        setError(
          err?.response?.data?.detail ||
            'خطا در دریافت لیست بیماران اورژانسی. لطفاً مجدداً تلاش نمایید.'
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [page, pageSize, setUrgentCount]
  );

  // Initial and on dependency change fetch
  useEffect(() => {
    fetchPatients(false);
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchPatients]);

  // 1-minute auto-refresh interval
  useEffect(() => {
    const timer = setInterval(() => {
      fetchPatients(true);
    }, AUTO_REFRESH_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [fetchPatients]);

  // Window focus listener to refresh when admin returns to tab
  useEffect(() => {
    const handleFocus = () => {
      fetchPatients(true);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchPatients]);

  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  return {
    patients,
    count,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    isLoading,
    isRefreshing,
    error,
    refetch: () => fetchPatients(false),
  };
};

export default useUrgentPatients;

