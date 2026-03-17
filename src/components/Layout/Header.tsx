// src/components/Layout/Header.tsx

import React from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { setRole, toggleCommentPanel } from '../../store/slices/uiSlice';
import { setOffline, syncOfflineChanges } from '../../store/slices/offlineSlice';
import { fetchDocument } from '../../store/slices/documentSlice';
import { UserRole } from '../../types';

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentRole, showCommentPanel } = useAppSelector((s) => s.ui);
  const { isOffline, pendingChanges, isSyncing } = useAppSelector(
    (s) => s.offline
  );
  const { status, isDirty } = useAppSelector((s) => s.document);
  const document = useAppSelector((s) => s.document.document);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setRole(e.target.value as UserRole));
  };

  const handleOfflineToggle = async () => {
    const goingOnline = isOffline;
    dispatch(setOffline(!isOffline));
    if (goingOnline && pendingChanges.length > 0) {
      await dispatch(syncOfflineChanges()).unwrap();
      dispatch(fetchDocument());
    }
  };

  const getSaveLabel = () => {
    if (isOffline) return `${pendingChanges.length} queued`;
    if (status === 'saving') return 'Saving…';
    if (isDirty) return 'Unsaved';
    return 'Saved ✓';
  };

  const roleConfig: Record<UserRole, { label: string; badge: string }> = {
    editor:   { label: 'Editor',   badge: 'edit'   },
    reviewer: { label: 'Reviewer', badge: 'review' },
    viewer:   { label: 'Viewer',   badge: 'view'   },
  };

  const saveStatusClass =
    status === 'saving'
      ? 'text-info bg-[#60a5fa15]'
      : isDirty
      ? 'text-warning bg-[#fbbf2415]'
      : 'text-success bg-[#4ade8015]';

  const roleBadgeClass: Record<UserRole, string> = {
    editor:   'bg-[#7c6fff22] text-[#9488ff]',
    reviewer: 'bg-[#4ecdc422] text-[#4ecdc4]',
    viewer:   'bg-[#fbbf2422] text-[#fbbf24]',
  };

  return (
    <header className="h-14 bg-bg-surface border-b border-border-subtle flex items-center justify-between px-5 flex-shrink-0 gap-4 z-[100]">
      <div className="flex items-center gap-5 min-w-0">
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-lg text-accent leading-none [filter:drop-shadow(0_0_8px_#7c6fff)]">◈</span>
          <span className="font-serif text-base text-text-primary tracking-[0.01em]">Cowrite</span>
        </div>
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[13px] font-medium text-text-secondary whitespace-nowrap overflow-hidden text-ellipsis max-w-[320px] max-[680px]:max-w-[160px]">
            {document?.title ?? 'Loading…'}
          </span>
          <span className={`text-[11px] font-medium font-mono px-2 py-[2px] rounded-full flex-shrink-0 transition-all ${saveStatusClass}`}>
            {getSaveLabel()}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Offline Toggle */}
        <label className="flex items-center gap-2 cursor-pointer select-none" title="Toggle offline mode">
          <span className="text-xs font-medium text-text-secondary min-w-[40px] text-right">
            {isOffline ? 'Offline' : 'Online'}
          </span>
          <div
            className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors outline-none ${
              isOffline ? 'bg-bg-active border border-border-default' : 'bg-accent'
            }`}
            onClick={handleOfflineToggle}
            role="switch"
            aria-checked={!isOffline}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleOfflineToggle()}
          >
            <div
              className={`absolute top-[2px] w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${
                isOffline ? 'left-[2px]' : 'left-[18px]'
              }`}
            />
          </div>
        </label>

        {/* Role Selector */}
        <div className="flex items-center gap-1.5 bg-bg-elevated border border-border-soft rounded-lg py-1 pr-2.5 pl-2">
          <span className={`text-[10px] font-semibold font-mono uppercase tracking-[0.05em] py-[2px] px-1.5 rounded-[4px] ${roleBadgeClass[currentRole]}`}>
            {roleConfig[currentRole].badge}
          </span>
          <select
            value={currentRole}
            onChange={handleRoleChange}
            className="bg-transparent text-text-primary border-none outline-none text-[13px] font-medium cursor-pointer pr-1"
            aria-label="Select your role"
          >
            <option value="editor">Editor</option>
            <option value="reviewer">Reviewer</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>

        {/* Comment Panel Toggle */}
        <button
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all relative ${
            showCommentPanel
              ? 'bg-[#7c6fff30] text-accent'
              : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
          }`}
          onClick={() => dispatch(toggleCommentPanel())}
          title="Toggle comment panel"
          aria-label="Toggle comment panel"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {pendingChanges.length > 0 && isOffline && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 bg-warning text-text-inverse text-[9px] font-bold rounded-full flex items-center justify-center px-[3px]">
              {pendingChanges.length}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
