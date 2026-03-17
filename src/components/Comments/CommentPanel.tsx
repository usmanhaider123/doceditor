// src/components/Comments/CommentPanel.tsx

import React, { useState } from 'react';
import { useAppSelector } from '../../hooks/redux';
import CommentThread from './CommentThread';
import AddCommentForm from './AddCommentForm';

type Filter = 'open' | 'resolved' | 'all';

const CommentPanel: React.FC = () => {
  const comments = useAppSelector((s) => s.comments.comments);
  const showCommentPanel = useAppSelector((s) => s.ui.showCommentPanel);
  const currentRole = useAppSelector((s) => s.ui.currentRole);
  const [filter, setFilter] = useState<Filter>('open');

  if (!showCommentPanel) return null;

  const filtered = comments.filter((c) => {
    if (filter === 'open') return !c.resolved;
    if (filter === 'resolved') return c.resolved;
    return true;
  });

  const openCount = comments.filter((c) => !c.resolved).length;

  return (
    <aside
      className="w-[300px] max-[900px]:w-[260px] max-[680px]:hidden bg-bg-surface border-l border-border-subtle flex flex-col overflow-hidden flex-shrink-0"
      aria-label="Comments"
    >
      <div className="p-4 border-b border-border-subtle flex-shrink-0">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-text-primary mb-2.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Comments
          {openCount > 0 && (
            <span className="min-w-[18px] h-[18px] bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 ml-auto">
              {openCount}
            </span>
          )}
        </div>

        <div className="flex gap-1">
          {(['open', 'resolved', 'all'] as Filter[]).map((f) => (
            <button
              key={f}
              className={`py-[3px] px-2.5 rounded-full text-[11px] font-medium transition-all ${
                filter === f
                  ? 'bg-[#7c6fff30] text-accent'
                  : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
              }`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Inline add-comment form */}
      <AddCommentForm />

      <div className="flex-1 overflow-y-auto py-2">
        {filtered.length === 0 ? (
          <div className="px-4 py-8 text-center text-xs text-text-tertiary leading-[1.8]">
            {filter === 'open'
              ? currentRole === 'viewer'
                ? 'No open comments'
                : 'Select text in the document to add a comment'
              : `No ${filter} comments`}
          </div>
        ) : (
          filtered.map((comment) => (
            <CommentThread key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </aside>
  );
};

export default CommentPanel;
