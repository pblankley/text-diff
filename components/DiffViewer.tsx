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
      className="h-screen flex flex-col"
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    >
      {/* Header */}
      <header 
        className="flex-shrink-0 px-6 py-4 glass-effect border-b"
        style={{ 
          backgroundColor: isDark ? 'rgba(28, 28, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          borderColor: 'var(--border-color)'
        }}
      >
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo - switches based on color scheme */}
            <Image
              src={isDark ? '/diff-logo-light-wide.png' : '/diff-logo-dark-wide.png'}
              alt="Diff"
              width={100}
              height={32}
              className="h-8 w-auto"
              priority
            />
          </div>
          
          <div className="flex items-center gap-3">
            {/* Computing indicator */}
            {isComputing && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{ backgroundColor: 'var(--bg-tertiary)' }}
              >
                <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                <span 
                  className="text-xs font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Analyzing
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-hidden">
        <div 
          className="h-full rounded-apple-lg overflow-hidden flex"
          style={{ 
            backgroundColor: 'var(--bg-primary)',
            boxShadow: isDark 
              ? '0 4px 24px rgba(0, 0, 0, 0.4), inset 0 0 0 0.5px rgba(255, 255, 255, 0.05)' 
              : '0 4px 24px rgba(0, 0, 0, 0.08), inset 0 0 0 0.5px rgba(0, 0, 0, 0.04)'
          }}
        >
          {/* Left Editor */}
          <div className="w-1/2 flex flex-col border-r" style={{ borderColor: 'var(--border-color)' }}>
            <TextEditor
              value={leftText}
              onChange={setLeftText}
              diffLines={diffResult.leftLines}
              label="Original"
              side="left"
              placeholder="Paste or type original text here..."
            />
          </div>

          {/* Right Editor */}
          <div className="w-1/2 flex flex-col">
            <TextEditor
              value={rightText}
              onChange={setRightText}
              diffLines={diffResult.rightLines}
              label="Modified"
              side="right"
              placeholder="Paste or type modified text here..."
            />
          </div>
        </div>
      </main>

      {/* Footer hint */}
      <footer 
        className="flex-shrink-0 px-6 py-3 text-center"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <p className="text-xs">
          Differences are highlighted automatically after you stop typing
        </p>
      </footer>
    </div>
  );
};
