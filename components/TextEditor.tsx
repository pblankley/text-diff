'use client';

import React, { useRef, useCallback, useEffect, useState } from 'react';
import { DiffLine } from '@/lib/types';

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  diffLines: DiffLine[];
  side: 'left' | 'right';
  placeholder?: string;
  onPaste?: () => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  value,
  onChange,
  diffLines,
  side,
  placeholder = 'Enter text...',
  onPaste
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  
  // Track when we should apply highlights
  // This is set to true on blur or paste, then reset after applying
  const [applyHighlightsTrigger, setApplyHighlightsTrigger] = useState(0);
  const pendingDiffLinesRef = useRef<DiffLine[]>([]);

  // Handle content changes from contentEditable
  const handleInput = useCallback(() => {
    if (isUpdatingRef.current) return;

    const editor = editorRef.current;
    if (!editor) return;

    const newValue = editor.innerText;
    setIsEmpty(!newValue || newValue === '\n');
    onChange(newValue);
  }, [onChange]);

  // Track empty state
  useEffect(() => {
    setIsEmpty(!value);
  }, [value]);

  // Store diffLines when they update (but don't apply if focused)
  useEffect(() => {
    pendingDiffLinesRef.current = diffLines;
    
    // If not focused, apply highlights immediately when diffLines changes
    if (!isFocused && diffLines.length > 0) {
      setApplyHighlightsTrigger(t => t + 1);
    }
  }, [diffLines, isFocused]);

  // Apply highlights when triggered (by blur or paste)
  useEffect(() => {
    if (applyHighlightsTrigger === 0) return;
    
    const editor = editorRef.current;
    if (!editor) return;
    
    const currentDiffLines = pendingDiffLinesRef.current;
    if (currentDiffLines.length === 0) return;

    isUpdatingRef.current = true;

    // Rebuild DOM with highlights
    editor.innerHTML = '';
    const fragment = document.createDocumentFragment();

    currentDiffLines.forEach((diffLine, lineIndex) => {
      diffLine.segments.forEach((segment) => {
        if (segment.type === 'added' || segment.type === 'removed') {
          const span = document.createElement('span');
          span.className = segment.type === 'added' ? 'diff-added' : 'diff-removed';
          span.textContent = segment.text;
          fragment.appendChild(span);
        } else {
          fragment.appendChild(document.createTextNode(segment.text));
        }
      });

      if (lineIndex < currentDiffLines.length - 1) {
        fragment.appendChild(document.createTextNode('\n'));
      }
    });

    editor.appendChild(fragment);
    editor.normalize();

    isUpdatingRef.current = false;
  }, [applyHighlightsTrigger]);

  // Handle focus
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  // Handle blur - trigger highlight application
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // Apply highlights when losing focus
    if (pendingDiffLinesRef.current.length > 0) {
      setApplyHighlightsTrigger(t => t + 1);
    }
  }, []);

  // Handle paste - trigger highlight application after paste completes
  const handlePaste = useCallback(() => {
    // Notify parent (for immediate diff computation)
    onPaste?.();
    
    // Apply highlights after a short delay to let paste and diff complete
    setTimeout(() => {
      if (pendingDiffLinesRef.current.length > 0) {
        setApplyHighlightsTrigger(t => t + 1);
      }
    }, 150);
  }, [onPaste]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const lineNumbers = document.getElementById(`line-numbers-${side}`);
    if (lineNumbers) {
      lineNumbers.scrollTop = e.currentTarget.scrollTop;
    }
  }, [side]);

  const lines = value.split('\n');
  const lineCount = Math.max(lines.length, 1);

  const lineDiffMap = new Map<number, 'added' | 'removed' | 'unchanged'>();
  pendingDiffLinesRef.current.forEach(dl => {
    lineDiffMap.set(dl.lineNumber, dl.type);
  });

  return (
    <div className="flex h-full">
      {/* Line Numbers */}
      <div
        id={`line-numbers-${side}`}
        className="flex-shrink-0 w-12 overflow-hidden text-right select-none font-mono text-xs"
        style={{ 
          backgroundColor: 'var(--line-number-bg)',
          overflowY: 'hidden',
        }}
      >
        <div className="py-4 pr-3">
          {Array.from({ length: lineCount }, (_, i) => {
            const lineNum = i + 1;
            const diffType = lineDiffMap.get(lineNum);
            return (
              <div
                key={lineNum}
                className={`leading-6 rounded-sm ${
                  diffType === 'added' ? 'line-added' :
                  diffType === 'removed' ? 'line-removed' : ''
                }`}
                style={{ color: 'var(--line-number-text)' }}
              >
                {lineNum}
              </div>
            );
          })}
        </div>
      </div>

      {/* Subtle separator */}
      <div 
        className="w-px flex-shrink-0"
        style={{ backgroundColor: 'var(--border-color)' }}
      />

      {/* Editor Container */}
      <div 
        className="flex-1 overflow-auto editor-scroll relative"
        style={{ backgroundColor: 'var(--bg-editor)' }}
      >
        {/* Placeholder */}
        {isEmpty && !isFocused && (
          <div 
            className="absolute top-4 left-4 pointer-events-none font-mono text-sm select-none"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {placeholder}
          </div>
        )}
        
        {/* ContentEditable Editor */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onPaste={handlePaste}
          onScroll={handleScroll}
          className="w-full h-full outline-none py-4 px-4 font-mono text-sm leading-6 whitespace-pre-wrap"
          style={{
            minHeight: '100%',
            wordBreak: 'break-word',
            color: 'var(--text-primary)',
            caretColor: 'var(--accent)'
          }}
          spellCheck={false}
          suppressContentEditableWarning
        />
      </div>
    </div>
  );
};
