// src/hooks/useAutoSave.ts

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import { saveDocument } from '../store/slices/documentSlice';
import { queueEditChange } from '../store/slices/offlineSlice';

const AUTO_SAVE_DELAY = 2000;

export function useAutoSave() {
  const dispatch = useAppDispatch();
  const document = useAppSelector((s) => s.document.document);
  const isDirty = useAppSelector((s) => s.document.isDirty);
  const isOffline = useAppSelector((s) => s.offline.isOffline);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isDirty || !document) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      if (isOffline) {
        // Queue for later sync
        dispatch(
          queueEditChange({
            content: document.content,
            cursorOffset: 0,
          })
        );
      } else {
        dispatch(saveDocument({ content: document.content, title: document.title }));
      }
    }, AUTO_SAVE_DELAY);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [document?.content, document?.title, isDirty, isOffline, dispatch]);
}
