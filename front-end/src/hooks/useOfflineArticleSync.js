// src/hooks/useOfflineArticleSync.js
import { useState, useEffect, useCallback } from 'react';
import adminArticleService from '../api/adminArticleService';

const OFFLINE_QUEUE_KEY = 'kamelion_offline_sync_queue';
const OFFLINE_DRAFT_KEY_PREFIX = 'kamelion_offline_draft_';

export const useOfflineArticleSync = ({ onSyncSuccess, onSyncError } = {}) => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastOfflineSavedAt, setLastOfflineSavedAt] = useState(null);

  // Monitor network connectivity
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerQueueSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync queued items when network returns
  const triggerQueueSync = useCallback(async () => {
    const rawQueue = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!rawQueue) return;

    let queue = [];
    try {
      queue = JSON.parse(rawQueue);
    } catch {
      localStorage.removeItem(OFFLINE_QUEUE_KEY);
      return;
    }

    if (!queue.length) return;

    setIsSyncing(true);
    const remainingQueue = [];

    for (const item of queue) {
      try {
        if (item.action === 'create') {
          await adminArticleService.createArticle(item.data);
        } else if (item.action === 'update' && item.id) {
          await adminArticleService.updateArticle(item.id, item.data);
        }
        // Remove individual offline draft if matched
        localStorage.removeItem(`${OFFLINE_DRAFT_KEY_PREFIX}${item.tempId || item.id}`);
      } catch (err) {
        console.error('Failed to sync offline item to server:', err);
        remainingQueue.push(item);
      }
    }

    if (remainingQueue.length > 0) {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remainingQueue));
      if (onSyncError) {
        onSyncError('برخی از مقالات آفلاین با خطا مواجه شدند و در صف باقی ماندند.');
      }
    } else {
      localStorage.removeItem(OFFLINE_QUEUE_KEY);
      if (onSyncSuccess) {
        onSyncSuccess('اتصال اینترنت برقرار شد؛ تمامی مقالات ذخیره‌شده در سیستم با موفقیت به سرور منتقل شدند.');
      }
    }

    setIsSyncing(false);
  }, [onSyncSuccess, onSyncError]);

  // Save article draft to user's system disk
  const saveOfflineDraft = useCallback((articleKey, articleData, action = 'create') => {
    try {
      const now = new Date();
      const payload = {
        ...articleData,
        _offlineSavedAt: now.toISOString(),
      };

      // 1. Save specific draft locally
      localStorage.setItem(
        `${OFFLINE_DRAFT_KEY_PREFIX}${articleKey}`,
        JSON.stringify(payload)
      );

      // 2. Add to sync queue
      const rawQueue = localStorage.getItem(OFFLINE_QUEUE_KEY);
      let queue = rawQueue ? JSON.parse(rawQueue) : [];
      // Remove existing queued version of same item
      queue = queue.filter((q) => q.tempId !== articleKey && q.id !== articleKey);
      queue.push({
        tempId: articleKey,
        id: typeof articleKey === 'number' ? articleKey : null,
        action,
        data: articleData,
        queuedAt: now.toISOString(),
      });
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));

      setLastOfflineSavedAt(now);

      return {
        success: true,
        message: 'اینترنت قطع است؛ مقاله با موفقیت در حافظه سیستم شما ذخیره شد و پس از اتصال اینترنت خودکار ارسال خواهد شد.',
        savedAt: now,
      };
    } catch (err) {
      console.error('Failed to save offline draft to disk:', err);
      return {
        success: false,
        message: 'خطا در ذخیره‌سازی محلی روی سیستم.',
      };
    }
  }, []);

  // Retrieve saved offline draft if any
  const getOfflineDraft = useCallback((articleKey) => {
    try {
      const raw = localStorage.getItem(`${OFFLINE_DRAFT_KEY_PREFIX}${articleKey}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  // Clear draft
  const clearOfflineDraft = useCallback((articleKey) => {
    localStorage.removeItem(`${OFFLINE_DRAFT_KEY_PREFIX}${articleKey}`);
  }, []);

  return {
    isOnline,
    isSyncing,
    lastOfflineSavedAt,
    saveOfflineDraft,
    getOfflineDraft,
    clearOfflineDraft,
    triggerQueueSync,
  };
};

export default useOfflineArticleSync;
