import React from 'react';
import { DiffSegment } from '@/lib/types';

interface DiffHighlightProps {
  segments: DiffSegment[];
  side: 'left' | 'right';
}

export const DiffHighlight: React.FC<DiffHighlightProps> = ({ segments, side }) => {
  return (
    <>
      {segments.map((segment, idx) => {
        let className = '';

        if (segment.type === 'added') {
          className = 'bg-diff-added text-green-900';
        } else if (segment.type === 'removed') {
          className = 'bg-diff-removed text-red-900';
        }

        return (
          <span key={idx} className={className}>
            {segment.text}
          </span>
        );
      })}
    </>
  );
};
