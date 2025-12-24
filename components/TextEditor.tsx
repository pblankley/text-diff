'use client';

import React, { useRef, useCallback, useEffect, useState } from 'react';
import { DiffLine } from '@/lib/types';

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  diffLines: DiffLine[];
  side: 'left' | 'right';
  placeholder?: string;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  value,
  onChange,
  diffLines,
  side,
  placeholder = 'Enter text...'
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

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

  // Apply diff highlights ONLY when diffLines changes (after debounce completes)
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    
    if (diffLines.length === 0) return;

    isUpdatingRef.current = true;

    const selection = window.getSelection();
    let cursorOffset = 0;
    
    const isActiveElement = document.activeElement === editor;
    const selectionInEditor = selection && selection.rangeCount > 0 && editor.contains(selection.anchorNode);
    const shouldRestoreFocus = isActiveElement || selectionInEditor;

    if (selectionInEditor) {
      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(editor);
      preCaretRange.setEnd(range.startContainer, range.startOffset);
      cursorOffset = preCaretRange.toString().length;
    }

    editor.innerHTML = '';
    const fragment = document.createDocumentFragment();

    diffLines.forEach((diffLine, lineIndex) => {
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

      if (lineIndex < diffLines.length - 1) {
        fragment.appendChild(document.createTextNode('\n'));
      }
    });

    editor.appendChild(fragment);
    editor.normalize();

    try {
      if (shouldRestoreFocus) {
        editor.focus();
      }

      const newSelection = window.getSelection();
      const newRange = document.createRange();

      let charCount = 0;
      let foundPosition = false;

      const findPosition = (node: Node): boolean => {
        if (node.nodeType === Node.TEXT_NODE) {
          const textLength = node.textContent?.length || 0;
          if (charCount + textLength >= cursorOffset) {
            newRange.setStart(node, Math.min(cursorOffset - charCount, textLength));
            newRange.collapse(true);
            foundPosition = true;
            return true;
          }
          charCount += textLength;
        } else {
          for (let i = 0; i < node.childNodes.length; i++) {
            if (findPosition(node.childNodes[i])) {
              return true;
            }
          }
        }
        return false;
      };

      if (editor.childNodes.length > 0) {
        findPosition(editor);
      }

      if (!foundPosition) {
        newRange.selectNodeContents(editor);
        newRange.collapse(cursorOffset === 0);
      }

      newSelection?.removeAllRanges();
      newSelection?.addRange(newRange);
    } catch (e) {
      console.error('Cursor restoration error:', e);
      if (shouldRestoreFocus) {
        editor.focus();
      }
    }

    isUpdatingRef.current = false;
  }, [diffLines]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const lineNumbers = document.getElementById(`line-numbers-${side}`);
    if (lineNumbers) {
      lineNumbers.scrollTop = e.currentTarget.scrollTop;
    }
  }, [side]);

  const lines = value.split('\n');
  const lineCount = Math.max(lines.length, 1);

  const lineDiffMap = new Map<number, 'added' | 'removed' | 'unchanged'>();
  diffLines.forEach(dl => {
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
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
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
