// src/components/Editor/CommentHighlights.tsx

import React from 'react';
import { Comment } from '../../types';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { setActiveComment } from '../../store/slices/commentsSlice';

interface Props {
  content: string;
  comments: Comment[];
}

const CommentHighlights: React.FC<Props> = ({ content, comments }) => {
  const dispatch = useAppDispatch();
  const activeCommentId = useAppSelector((s) => s.comments.activeCommentId);

  return (
    <div className="absolute top-8 left-4 bottom-8 w-8 pointer-events-none z-[3]" aria-hidden="true">
      {comments.map((comment) => {
        const textBefore = content.slice(0, comment.selectionStart);
        const lineNumber = (textBefore.match(/\n/g) || []).length;
        const lineHeight = 24;
        const top = lineNumber * lineHeight + 4;
        const isActive = activeCommentId === comment.id;

        return (
          <button
            key={comment.id}
            className={`absolute left-1 w-4 h-4 rounded-full border-2 cursor-pointer pointer-events-auto transition-all hover:scale-[1.3] ${
              isActive ? 'scale-[1.2] [box-shadow:0_0_8px_currentColor]' : ''
            }`}
            style={{
              top: `${top}px`,
              borderColor: comment.authorColor,
              background: isActive ? comment.authorColor : `${comment.authorColor}22`,
            }}
            onClick={() =>
              dispatch(setActiveComment(isActive ? null : comment.id))
            }
            title={`Comment by ${comment.authorName}: ${comment.text.slice(0, 60)}…`}
          />
        );
      })}
    </div>
  );
};

export default CommentHighlights;
