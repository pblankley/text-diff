'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useDiff } from '@/hooks/useDiff';
import { TextEditor } from './TextEditor';

export const DiffViewer: React.FC = () => {
  const [leftText, setLeftText] = useState('');
  const [rightText, setRightText] = useState('');
  const [isDark, setIsDark] = useState(false);

  const { diffResult, isComputing } = useDiff(leftText, rightText);

  // Detect system color scheme
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    >
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Logo and Description */}
          <div className="flex items-center gap-4">
            <Image
              src={isDark ? '/diff-logo-light.png' : '/diff-logo-dark.png'}
              alt="Diff"
              width={32}
              height={32}
              className="w-8 h-8"
              priority
            />
            <div className="flex flex-col">
              <h1 
                className="text-sm font-semibold tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                Diff
              </h1>
              <p 
                className="text-xs"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Compare text and see changes instantly
              </p>
            </div>
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-2">
            {isComputing && (
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: 'var(--accent)' }}
                />
                <span 
                  className="text-xs"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Analyzing...
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pb-6">
        <div 
          className="h-full rounded-2xl overflow-hidden flex flex-col"
          style={{ 
            backgroundColor: 'var(--bg-primary)',
            boxShadow: isDark 
              ? '0 0 0 1px rgba(255, 255, 255, 0.06), 0 8px 40px rgba(0, 0, 0, 0.5)' 
              : '0 0 0 1px rgba(0, 0, 0, 0.04), 0 8px 40px rgba(0, 0, 0, 0.08)',
            minHeight: 'calc(100vh - 120px)'
          }}
        >
          {/* Panel Headers */}
          <div 
            className="flex-shrink-0 grid grid-cols-2 border-b"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <div 
              className="px-5 py-3 border-r flex items-center justify-between"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <span 
                className="text-xs font-medium uppercase tracking-wide"
                style={{ color: 'var(--text-secondary)' }}
              >
                Original
              </span>
              {leftText && (
                <span 
                  className="text-xs tabular-nums"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {leftText.split('\n').length} lines
                </span>
              )}
            </div>
            <div className="px-5 py-3 flex items-center justify-between">
              <span 
                className="text-xs font-medium uppercase tracking-wide"
                style={{ color: 'var(--text-secondary)' }}
              >
                Modified
              </span>
              {rightText && (
                <span 
                  className="text-xs tabular-nums"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {rightText.split('\n').length} lines
                </span>
              )}
            </div>
          </div>

          {/* Editor Panels */}
          <div className="flex-1 grid grid-cols-2 min-h-0">
            {/* Left Editor */}
            <div 
              className="border-r overflow-hidden"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <TextEditor
                value={leftText}
                onChange={setLeftText}
                diffLines={diffResult.leftLines}
                side="left"
                placeholder="Paste or type the original text here..."
              />
            </div>

            {/* Right Editor */}
            <div className="overflow-hidden">
              <TextEditor
                value={rightText}
                onChange={setRightText}
                diffLines={diffResult.rightLines}
                side="right"
                placeholder="Paste or type the modified text here..."
              />
            </div>
          </div>
        </div>
      </main>

      {/* Keyboard hint */}
      <footer className="flex-shrink-0 px-6 pb-4">
        <p 
          className="text-center text-xs"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <span style={{ opacity: 0.7 }}>
            Changes are highlighted after you stop typing
          </span>
        </p>
      </footer>
    </div>
  );
};
