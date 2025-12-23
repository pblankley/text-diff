'use client';

import React, { useRef, useCallback, useEffect } from 'react';
import { DiffLine } from '@/lib/types';

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
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);

  // Handle content changes from contentEditable
  const handleInput = useCallback(() => {
    if (isUpdatingRef.current) return;

    const editor = editorRef.current;
    if (!editor) return;

    const newValue = editor.innerText;
    onChange(newValue);
  }, [onChange]);

  // Update contentEditable with diff highlights
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || isUpdatingRef.current) return;

    isUpdatingRef.current = true;

    // Save cursor position
    const selection = window.getSelection();
    let cursorOffset = 0;
    let cursorNode: Node | null = null;

    if (selection && selection.rangeCount > 0 && editor.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0);
      cursorNode = range.startContainer;
      cursorOffset = range.startOffset;

      // Calculate absolute cursor position in the text
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(editor);
      preCaretRange.setEnd(range.startContainer, range.startOffset);
      cursorOffset = preCaretRange.toString().length;
    }

    // Update content with highlights
    editor.innerHTML = '';
    const fragment = document.createDocumentFragment();

    if (diffLines.length === 0 && value) {
      // No diff lines yet, just show plain text
      fragment.appendChild(document.createTextNode(value));
    } else {
      diffLines.forEach((diffLine, lineIndex) => {
        diffLine.segments.forEach((segment) => {
          const span = document.createElement('span');

          if (segment.type === 'added') {
            span.className = 'bg-diff-added text-green-900';
          } else if (segment.type === 'removed') {
            span.className = 'bg-diff-removed text-red-900';
          }

          span.textContent = segment.text;
          fragment.appendChild(span);
        });

        // Add newline between lines (except for the last line)
        if (lineIndex < diffLines.length - 1) {
          fragment.appendChild(document.createTextNode('\n'));
        }
      });
    }

    editor.appendChild(fragment);

    // Restore cursor position
    try {
      const newSelection = window.getSelection();
      const newRange = document.createRange();

      // Find the position in the new DOM
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

      if (cursorOffset > 0 && editor.childNodes.length > 0) {
        findPosition(editor);
      }

      if (!foundPosition) {
        // Default to end of content
        newRange.selectNodeContents(editor);
        newRange.collapse(false);
      }

      newSelection?.removeAllRanges();
      newSelection?.addRange(newRange);
    } catch (e) {
      // Cursor restoration failed, ignore
      console.error('Cursor restoration error:', e);
    }

    isUpdatingRef.current = false;
  }, [diffLines, value]);

  // Sync scroll with line numbers
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const lineNumbers = document.getElementById(`line-numbers-${side}`);
    if (lineNumbers) {
      lineNumbers.scrollTop = e.currentTarget.scrollTop;
    }
  }, [side]);

  // Generate line number display based on actual text content
  const lines = value.split('\n');
  const lineCount = Math.max(lines.length, 1);

  // Build a map of line numbers to diff types for coloring
  const lineDiffMap = new Map<number, 'added' | 'removed' | 'unchanged'>();
  diffLines.forEach(dl => {
    lineDiffMap.set(dl.lineNumber, dl.type);
  });

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
          {Array.from({ length: lineCount }, (_, i) => {
            const lineNum = i + 1;
            const diffType = lineDiffMap.get(lineNum);
            return (
              <div
                key={lineNum}
                className={`leading-6 ${
                  diffType === 'added' ? 'bg-diff-added' :
                  diffType === 'removed' ? 'bg-diff-removed' : ''
                }`}
              >
                {lineNum}
              </div>
            );
          })}
        </div>

        {/* ContentEditable Editor with Inline Diff Highlighting */}
        <div className="flex-1 overflow-auto">
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onScroll={handleScroll}
            className="w-full h-full outline-none py-3 px-3 font-mono text-sm leading-6 whitespace-pre-wrap break-words"
            style={{
              minHeight: '100%',
              wordBreak: 'break-word'
            }}
            spellCheck={false}
            suppressContentEditableWarning
          />
        </div>
      </div>
    </div>
  );
};
