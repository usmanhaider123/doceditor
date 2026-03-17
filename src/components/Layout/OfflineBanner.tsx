// src/components/Layout/OfflineBanner.tsx

import React from 'react';
import { useAppSelector } from '../../hooks/redux';

const OfflineBanner: React.FC = () => {
  const { isOffline, pendingChanges, isSyncing, lastSyncedAt } =
    useAppSelector((s) => s.offline);

  if (!isOffline && !isSyncing) return null;

  return (
    <div
      className={`h-10 flex items-center justify-center flex-shrink-0 z-[90] border-b ${
        isSyncing
          ? 'bg-[#60a5fa18] border-[#60a5fa30]'
          : 'bg-[#fbbf2418] border-[#fbbf2430]'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2.5">
        <span className={`text-sm ${isSyncing ? 'text-info animate-spin inline-block' : 'text-warning'}`}>
          {isSyncing ? '↻' : '⚡'}
        </span>
        <span className={`text-[13px] font-medium ${isSyncing ? 'text-info' : 'text-warning'}`}>
          {isSyncing
            ? `Syncing ${pendingChanges.length} change${pendingChanges.length !== 1 ? 's' : ''}…`
            : `Offline Mode — ${pendingChanges.length} change${pendingChanges.length !== 1 ? 's' : ''} queued`}
        </span>
        {lastSyncedAt && !isOffline && !isSyncing && (
          <span className="text-[11px] text-text-tertiary ml-2">
            Last synced {new Date(lastSyncedAt).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
};

export default OfflineBanner;
