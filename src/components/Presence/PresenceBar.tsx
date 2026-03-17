// src/components/Presence/PresenceBar.tsx

import React from 'react';
import { useAppSelector } from '../../hooks/redux';
import { CURRENT_USER } from '../../mocks/mockData';

const roleColorClass: Record<string, string> = {
  editor:   'text-[#9488ff]',
  reviewer: 'text-[#4ecdc4]',
  viewer:   'text-[#fbbf24]',
};

const PresenceBar: React.FC = () => {
  const { collaborators, cursors } = useAppSelector((s) => s.presence);
  const currentRole = useAppSelector((s) => s.ui.currentRole);

  const isActive = (userId: string) =>
    cursors.some((c) => c.userId === userId);

  return (
    <div className="w-[220px] bg-bg-surface border-r border-border-subtle overflow-y-auto py-4 flex-shrink-0 max-[900px]:hidden">
      <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-text-tertiary px-4 pb-3">
        Active Now
      </div>
      <div className="flex flex-col gap-0.5">
        {/* Current user */}
        <div className="flex items-center gap-2.5 px-4 py-2 border-b border-border-subtle mb-1 pb-4">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-black/70 flex-shrink-0 relative"
            style={{ background: CURRENT_USER.color }}
            title={`${CURRENT_USER.name} (You)`}
          >
            {CURRENT_USER.avatar}
            <span className="absolute -bottom-px -right-px w-2.5 h-2.5 rounded-full border-2 border-bg-surface bg-success" />
          </div>
          <div className="min-w-0 flex flex-col gap-px">
            <span className="text-[13px] font-medium text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">You</span>
            <span className={`text-[10px] font-semibold uppercase tracking-[0.06em] ${roleColorClass[currentRole]}`}>
              {currentRole}
            </span>
          </div>
        </div>

        {/* Collaborators */}
        {collaborators.map((user) => (
          <div key={user.id} className="flex items-center gap-2.5 px-4 py-2 transition-colors hover:bg-bg-elevated">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-black/70 flex-shrink-0 relative"
              style={{ background: user.color }}
              title={`${user.name} — ${user.role}`}
            >
              {user.avatar}
              <span
                className={`absolute -bottom-px -right-px w-2.5 h-2.5 rounded-full border-2 border-bg-surface ${
                  isActive(user.id) ? 'bg-success' : 'bg-text-tertiary'
                }`}
              />
            </div>
            <div className="min-w-0 flex flex-col gap-px">
              <span className="text-[13px] font-medium text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">{user.name}</span>
              <span className={`text-[10px] font-semibold uppercase tracking-[0.06em] ${roleColorClass[user.role]}`}>
                {user.role}
              </span>
              {isActive(user.id) && (
                <span className="text-[10px] text-success italic">editing…</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PresenceBar;
