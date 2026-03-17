// src/hooks/useOfflineSync.ts

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import { syncOfflineChanges, setOffline } from '../store/slices/offlineSlice';
import { fetchDocument } from '../store/slices/documentSlice';

export function useOfflineSync() {
  const dispatch = useAppDispatch();
  const isOffline = useAppSelector((s) => s.offline.isOffline);
  const pendingChanges = useAppSelector((s) => s.offline.pendingChanges);

  // When coming back online, trigger sync
  useEffect(() => {
    if (!isOffline && pendingChanges.length > 0) {
      dispatch(syncOfflineChanges())
        .unwrap()
        .then(() => {
          // Refresh document state after sync
          dispatch(fetchDocument());
        })
        .catch(() => {
          // Sync failed — stay with queued changes
        });
    }
  }, [isOffline, dispatch]);

  // Listen to browser online/offline events as a secondary signal
  useEffect(() => {
    const handleOnline = () => {
      // Only auto-go-online if not manually set to offline
      // In this app the toggle is manual, so we just listen as an FYI
    };
    const handleOffline = () => {
      dispatch(setOffline(true));
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [dispatch]);
}
