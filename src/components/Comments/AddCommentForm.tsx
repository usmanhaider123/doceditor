// src/components/Comments/AddCommentForm.tsx

import React, { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { addComment, setPendingSelection } from '../../store/slices/commentsSlice';
import { setIsAddingComment } from '../../store/slices/uiSlice';
import { CURRENT_USER } from '../../mocks/mockData';

const AddCommentForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const pendingSelection = useAppSelector((s) => s.comments.pendingSelection);
  const currentRole = useAppSelector((s) => s.ui.currentRole);
  const isAddingComment = useAppSelector((s) => s.ui.isAddingComment);
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canComment = currentRole === 'editor' || currentRole === 'reviewer';

  useEffect(() => {
    if (isAddingComment && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isAddingComment]);

  if (!canComment || !pendingSelection || !isAddingComment) return null;

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    await dispatch(
      addComment({
        text: text.trim(),
        selectedText: pendingSelection.text,
        selectionStart: pendingSelection.start,
        selectionEnd: pendingSelection.end,
        authorId: CURRENT_USER.id,
        authorName: CURRENT_USER.name,
        authorColor: CURRENT_USER.color,
      })
    );

    setText('');
    dispatch(setIsAddingComment(false));
  };

  const handleCancel = () => {
    setText('');
    dispatch(setPendingSelection(null));
    dispatch(setIsAddingComment(false));
  };

  return (
    <div className="mx-3 mb-1 p-3 bg-bg-elevated border border-border-soft rounded-xl animate-slide-down" role="dialog" aria-label="Add comment">
      <div className="flex items-start gap-1.5 mb-2.5 text-text-tertiary text-[11px]">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </svg>
        <span className="font-mono text-[11px] text-text-secondary italic leading-[1.5]">
          "{pendingSelection.text.slice(0, 60)}
          {pendingSelection.text.length > 60 ? '…' : ''}"
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 mb-2 text-xs font-medium text-text-secondary">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-black/70 flex-shrink-0"
            style={{ background: CURRENT_USER.color }}
          >
            {CURRENT_USER.avatar}
          </div>
          <span>{CURRENT_USER.name}</span>
        </div>

        <textarea
          ref={textareaRef}
          className="w-full bg-bg-surface border border-border-soft rounded-lg px-2.5 py-2 text-text-primary text-[13px] leading-[1.5] transition-colors focus:border-accent focus:outline-none placeholder:text-text-tertiary"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment…"
          rows={3}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e);
            if (e.key === 'Escape') handleCancel();
          }}
          data-testid="comment-input"
        />

        <div className="flex justify-end gap-1.5 mt-2">
          <button
            type="button"
            className="inline-flex items-center justify-center text-xs font-medium rounded-lg py-[5px] px-2.5 transition-all text-text-secondary hover:bg-bg-active hover:text-text-primary"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center justify-center text-xs font-medium rounded-lg py-[5px] px-2.5 transition-all bg-accent text-white hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={!text.trim()}
          >
            Comment
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCommentForm;
