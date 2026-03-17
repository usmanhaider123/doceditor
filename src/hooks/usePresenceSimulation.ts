// src/hooks/usePresenceSimulation.ts

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import { updateCursor, clearSelection, updateSelection } from '../store/slices/presenceSlice';
import { MOCK_COLLABORATORS } from '../mocks/mockData';

const SIMULATION_INTERVAL = 10000; // 10 seconds

export function usePresenceSimulation(contentLength: number) {
  const dispatch = useAppDispatch();
  const isOffline = useAppSelector((s) => s.offline.isOffline);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOffline || contentLength === 0) return;

    const simulate = () => {
      const collaborator =
        MOCK_COLLABORATORS[Math.floor(Math.random() * MOCK_COLLABORATORS.length)];
      const maxOffset = Math.max(1, contentLength - 1);
      const offset = Math.floor(Math.random() * maxOffset);
      const line = Math.floor(offset / 80); // approximate line

      // Simulate cursor movement
      dispatch(
        updateCursor({
          userId: collaborator.id,
          offset,
          line,
          color: collaborator.color,
          name: collaborator.name,
        })
      );

      // Randomly also simulate a selection
      if (Math.random() > 0.5) {
        const selStart = Math.max(0, offset - 30);
        const selEnd = Math.min(contentLength, offset + 30);
        dispatch(
          updateSelection({
            userId: collaborator.id,
            start: selStart,
            end: selEnd,
            color: collaborator.color,
          })
        );
        // Clear selection after 3 seconds
        setTimeout(() => {
          dispatch(clearSelection(collaborator.id));
        }, 3000);
      }
    };

    // Initial simulation
    setTimeout(simulate, 2000);

    intervalRef.current = setInterval(simulate, SIMULATION_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [dispatch, isOffline, contentLength]);
}
