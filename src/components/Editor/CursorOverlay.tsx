// src/components/Editor/CursorOverlay.tsx

import React, { RefObject } from 'react';
import { useAppSelector } from '../../hooks/redux';

interface Props {
  textareaRef: RefObject<HTMLTextAreaElement>;
}

const CursorOverlay: React.FC<Props> = ({ textareaRef }) => {
  const cursors = useAppSelector((s) => s.presence.cursors);
  const selections = useAppSelector((s) => s.presence.selections);

  if (!textareaRef.current) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-[4] pt-8 pr-11 pb-8 pl-16 overflow-hidden" aria-hidden="true">
      {cursors.map((cursor) => {
        const lineHeight = 24;
        const top = cursor.line * lineHeight + 12;
        const leftPercent = (cursor.offset % 80) / 80;

        return (
          <div
            key={cursor.userId}
            className="absolute flex flex-col items-start pointer-events-none animate-cursor-appear"
            style={{
              top: `${top}px`,
              left: `${leftPercent * 100}%`,
              '--cursor-color': cursor.color,
            } as React.CSSProperties}
          >
            <div className="w-[2px] h-[18px] bg-[var(--cursor-color)] rounded-[1px] animate-cursor-blink" />
            <div className="bg-[var(--cursor-color)] text-black/80 text-[10px] font-bold py-[1px] px-[5px] rounded-[0_3px_3px_3px] whitespace-nowrap mt-[1px]">
              {cursor.name}
            </div>
          </div>
        );
      })}

      {selections.map((sel) => {
        const content = textareaRef.current?.value ?? '';
        const selectedText = content.slice(sel.start, sel.end);
        const lineStart = (content.slice(0, sel.start).match(/\n/g) || []).length;
        const lineHeight = 24;
        const top = lineStart * lineHeight;
        const height = (selectedText.match(/\n/g) || []).length * lineHeight + lineHeight;

        return (
          <div
            key={`sel-${sel.userId}`}
            className="absolute pointer-events-none rounded-[2px]"
            style={{
              top: `${top}px`,
              height: `${height}px`,
              background: `${sel.color}22`,
              borderLeft: `2px solid ${sel.color}`,
              left: 0,
              right: 0,
            }}
          />
        );
      })}
    </div>
  );
};

export default CursorOverlay;
