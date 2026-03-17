// src/components/Editor/DocumentEditor.tsx

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { updateContent } from '../../store/slices/documentSlice';
import { setPendingSelection } from '../../store/slices/commentsSlice';
import { setIsAddingComment } from '../../store/slices/uiSlice';
import { usePresenceSimulation } from '../../hooks/usePresenceSimulation';
import CursorOverlay from './CursorOverlay';
import CommentHighlights from './CommentHighlights';

const DocumentEditor: React.FC = () => {
  const dispatch = useAppDispatch();
  const document = useAppSelector((s) => s.document.document);
  const currentRole = useAppSelector((s) => s.ui.currentRole);
  const isOffline = useAppSelector((s) => s.offline.isOffline);
  const comments = useAppSelector((s) => s.comments.comments);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [localContent, setLocalContent] = useState('');

  useEffect(() => {
    if (document?.content && localContent === '') {
      setLocalContent(document.content);
    }
  }, [document?.content]);

  usePresenceSimulation(localContent.length);

  const isReadOnly = currentRole === 'viewer';
  const canComment = currentRole === 'editor' || currentRole === 'reviewer';

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (isReadOnly) return;
      const value = e.target.value;
      setLocalContent(value);
      dispatch(updateContent(value));
    },
    [dispatch, isReadOnly]
  );

  const handleMouseUp = useCallback(() => {
    if (!canComment) return;
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start !== end) {
      const selectedText = localContent.substring(start, end).trim();
      if (selectedText.length > 0) {
        dispatch(setPendingSelection({ start, end, text: selectedText }));
        dispatch(setIsAddingComment(true));
      }
    } else {
      dispatch(setPendingSelection(null));
    }
  }, [dispatch, localContent, canComment]);

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 h-[300px] text-text-tertiary text-[13px]">
        <div className="w-6 h-6 border-2 border-border-soft border-t-accent rounded-full animate-spin" />
        <span>Loading document…</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[720px] flex flex-col gap-3">
      <div className="relative bg-bg-surface border border-border-subtle rounded-2xl overflow-hidden shadow-lg transition-[border-color,box-shadow] duration-200 focus-within:border-border-default focus-within:[box-shadow:0_8px_32px_#00000060,0_0_0_1px_#7c6fff30]">
        <CommentHighlights comments={comments} content={localContent} />
        <CursorOverlay textareaRef={textareaRef} />
        <textarea
          ref={textareaRef}
          className={`w-full min-h-[480px] pt-8 pb-8 pr-11 pl-16 bg-transparent font-mono text-sm leading-6 caret-accent relative z-[2] overflow-hidden focus:outline-none placeholder:text-text-tertiary max-[680px]:pt-5 max-[680px]:pb-5 max-[680px]:pr-5 max-[680px]:pl-10 ${
            isReadOnly ? 'text-text-secondary cursor-default' : 'text-text-primary'
          } ${isOffline ? 'border border-warning' : ''}`}
          value={localContent}
          onChange={handleChange}
          onMouseUp={handleMouseUp}
          readOnly={isReadOnly}
          spellCheck
          aria-label="Document editor"
          aria-readonly={isReadOnly}
          aria-multiline="true"
          data-testid="document-textarea"
        />
        {isReadOnly && (
          <div className="absolute bottom-4 right-4 pointer-events-none z-10" aria-hidden="true">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-warning bg-[#fbbf2414] border border-[#fbbf2430] rounded-full py-1 px-2.5 font-mono tracking-[0.04em]">
              View only
            </span>
          </div>
        )}
      </div>
      {canComment && (
        <div className="flex items-center gap-1.5 text-[11px] text-text-tertiary px-1">
          <kbd className="font-mono text-[10px] bg-bg-elevated border border-border-default rounded-[4px] py-[1px] px-1.5 text-text-secondary">
            Select text
          </kbd>
          {' '}to add a comment
        </div>
      )}
    </div>
  );
};

export default DocumentEditor;
