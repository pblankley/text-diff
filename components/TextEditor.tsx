'use client';

import React, { useRef, useCallback } from 'react';
import { DiffLine } from '@/lib/types';
import { DiffHighlight } from './DiffHighlight';

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  diffLines: DiffLine[];
  label: string;
  side: 'left' | 'right';
}

export const TextEditor: React.FC<TextEditorProps> = ({
  value,
  onChange,
  diffLines,
  label,
  side
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const diffLayerRef = useRef<HTMLDivElement>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  // Sync scroll between textarea and diff layer
  const handleScroll = useCallback((e: React.UIEvent<HTMLTextAreaElement>) => {
    const lineNumbers = document.getElementById(`line-numbers-${side}`);
    const diffLayer = diffLayerRef.current;

    if (lineNumbers) {
      lineNumbers.scrollTop = e.currentTarget.scrollTop;
    }
    if (diffLayer) {
      diffLayer.scrollTop = e.currentTarget.scrollTop;
      diffLayer.scrollLeft = e.currentTarget.scrollLeft;
    }
  }, [side]);

  return (
    <div className="flex flex-col h-full border-r border-gray-300 last:border-r-0">
      {/* Header */}
      <div className="px-4 py-2 bg-gray-100 border-b border-gray-300 font-semibold text-gray-700">
        {label}
      </div>

      {/* Editor Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Line Numbers */}
        <div
          id={`line-numbers-${side}`}
          className="flex-shrink-0 w-12 bg-gray-50 border-r border-gray-300 overflow-hidden text-right pr-2 py-3 text-sm text-gray-500 select-none font-mono"
          style={{ overflowY: 'hidden' }}
        >
          {diffLines.map((line) => (
            <div
              key={line.lineNumber}
              className={`leading-6 ${
                line.type === 'added' ? 'bg-diff-added' :
                line.type === 'removed' ? 'bg-diff-removed' : ''
              }`}
            >
              {line.lineNumber}
            </div>
          ))}
        </div>

        {/* Text Content with Diff Overlay */}
        <div className="flex-1 relative overflow-hidden">
          {/* Visible diff layer (absolute positioned) */}
          <div
            ref={diffLayerRef}
            className="absolute inset-0 pointer-events-none overflow-auto py-3 px-3 font-mono text-sm leading-6"
          >
            {diffLines.map((line) => (
              <div
                key={line.lineNumber}
                className={`leading-6 ${
                  line.type === 'added' ? 'bg-diff-added' :
                  line.type === 'removed' ? 'bg-diff-removed' : ''
                }`}
              >
                <DiffHighlight segments={line.segments} side={side} />
              </div>
            ))}
          </div>

          {/* Actual textarea (transparent text for editing) */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onScroll={handleScroll}
            className="absolute inset-0 w-full h-full resize-none outline-none py-3 px-3 font-mono text-sm leading-6 bg-transparent"
            style={{
              color: 'transparent',
              caretColor: 'black'
            }}
            spellCheck={false}
            placeholder={`Paste ${label.toLowerCase()} text here...`}
          />
        </div>
      </div>
    </div>
  );
};
