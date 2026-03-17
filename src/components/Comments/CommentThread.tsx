// src/components/Comments/CommentThread.tsx

import React, { useState } from 'react';
import { Comment } from '../../types';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { resolveComment, addReply, setActiveComment } from '../../store/slices/commentsSlice';
import { CURRENT_USER } from '../../mocks/mockData';

interface Props {
  comment: Comment;
}

const CommentThread: React.FC<Props> = ({ comment }) => {
  const dispatch = useAppDispatch();
  const activeCommentId = useAppSelector((s) => s.comments.activeCommentId);
  const currentRole = useAppSelector((s) => s.ui.currentRole);
  const [replyText, setReplyText] = useState('');
  const [showReply, setShowReply] = useState(false);

  const isActive = activeCommentId === comment.id;
  const canComment = currentRole === 'editor' || currentRole === 'reviewer';

  const handleResolve = () => {
    dispatch(resolveComment(comment.id));
  };

  const handleReply = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    dispatch(
      addReply({
        commentId: comment.id,
        text: replyText.trim(),
        authorId: CURRENT_USER.id,
        authorName: CURRENT_USER.name,
      })
    );
    setReplyText('');
    setShowReply(false);
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div
      className={`mx-3 mb-2 p-3 bg-bg-elevated border rounded-xl cursor-pointer transition-all ${
        isActive
          ? 'border-accent [box-shadow:0_0_0_1px_#7c6fff30]'
          : 'border-border-subtle hover:border-border-soft'
      } ${comment.resolved ? 'opacity-50' : ''}`}
      onClick={() => dispatch(setActiveComment(isActive ? null : comment.id))}
      data-testid="comment-thread"
    >
      {/* Selection excerpt */}
      <div className="mb-2">
        <span
          className="block px-2 py-1 rounded font-mono text-[11px] italic text-text-secondary leading-[1.5]"
          style={{ background: `${comment.authorColor}33`, borderLeft: `3px solid ${comment.authorColor}` }}
        >
          "{comment.selectedText.slice(0, 50)}{comment.selectedText.length > 50 ? '…' : ''}"
        </span>
      </div>

      {/* Main comment */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-black/70 flex-shrink-0"
              style={{ background: comment.authorColor }}
            >
              {comment.authorName.split(' ').map((n) => n[0]).join('')}
            </div>
            <span className="text-xs font-semibold text-text-primary">{comment.authorName}</span>
          </div>
          <span className="text-[10px] text-text-tertiary font-mono">{formatTime(comment.createdAt)}</span>
        </div>
        <p className="text-[13px] text-text-secondary leading-[1.55]">{comment.text}</p>
      </div>

      {/* Replies */}
      {comment.replies.length > 0 && (
        <div className="mt-2.5 pt-2.5 border-t border-border-subtle flex flex-col gap-2">
          {comment.replies.map((reply) => (
            <div key={reply.id}>
              <div className="flex items-center gap-2 mb-[3px]">
                <span className="text-xs font-semibold text-text-primary">{reply.authorName}</span>
                <span className="text-[10px] text-text-tertiary font-mono">{formatTime(reply.createdAt)}</span>
              </div>
              <p className="text-xs text-text-secondary leading-[1.5]">{reply.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {!comment.resolved && isActive && canComment && (
        <div
          className="mt-2.5 pt-2 border-t border-border-subtle flex gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          {!showReply && (
            <>
              <button
                className="inline-flex items-center justify-center text-[11px] font-medium rounded-lg py-[3px] px-2 transition-all text-text-secondary hover:bg-bg-active hover:text-text-primary"
                onClick={() => setShowReply(true)}
              >
                Reply
              </button>
              <button
                className="inline-flex items-center justify-center text-[11px] font-medium rounded-lg py-[3px] px-2 transition-all text-text-secondary hover:bg-bg-active hover:text-success"
                onClick={handleResolve}
              >
                Resolve ✓
              </button>
            </>
          )}

          {showReply && (
            <form onSubmit={handleReply} className="w-full">
              <textarea
                className="w-full bg-bg-surface border border-border-soft rounded-lg px-2 py-1.5 text-text-primary text-xs leading-[1.5] focus:border-accent focus:outline-none placeholder:text-text-tertiary"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply…"
                rows={2}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setShowReply(false);
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleReply(e);
                }}
              />
              <div className="flex justify-end gap-1.5 mt-1.5">
                <button
                  type="button"
                  className="inline-flex items-center justify-center text-[11px] font-medium rounded-lg py-[3px] px-2 transition-all text-text-secondary hover:bg-bg-active hover:text-text-primary"
                  onClick={() => setShowReply(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center text-[11px] font-medium rounded-lg py-[3px] px-2 transition-all bg-accent text-white hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={!replyText.trim()}
                >
                  Reply
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {comment.resolved && (
        <div className="flex items-center gap-[5px] text-[11px] text-success mt-2 font-medium">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Resolved
        </div>
      )}
    </div>
  );
};

export default CommentThread;
