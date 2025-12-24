'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useDiff } from '@/hooks/useDiff';
import { TextEditor } from './TextEditor';
import { ThemeToggle } from './ThemeToggle';

type Theme = 'light' | 'dark' | 'system';

export const DiffViewer: React.FC = () => {
  const [leftText, setLeftText] = useState('');
  const [rightText, setRightText] = useState('');
  const [theme, setTheme] = useState<Theme>('system');
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { diffResult, isComputing, triggerImmediateDiff } = useDiff(leftText, rightText);

  // Initialize theme from localStorage and system preference
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored && (stored === 'light' || stored === 'dark')) {
      setTheme(stored);
    }
  }, []);

  // Apply theme to document and compute isDark
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const applyTheme = () => {
      let dark: boolean;
      if (theme === 'system') {
        dark = mediaQuery.matches;
      } else {
        dark = theme === 'dark';
      }
      
      setIsDark(dark);
      
      // Apply class to html element
      if (dark) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();

    // Listen for system preference changes (only matters if theme is 'system')
    const handler = () => {
      if (theme === 'system') {
        applyTheme();
      }
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme, mounted]);

  const toggleTheme = useCallback(() => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  }, [isDark]);

  return (
    <div 
      className="h-screen flex flex-col overflow-hidden"
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

          {/* Status indicator and theme toggle */}
          <div className="flex items-center gap-4">
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
            {mounted && <ThemeToggle isDark={isDark} onToggle={toggleTheme} />}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 min-h-0">
        <div 
          className="h-full rounded-xl overflow-hidden flex flex-col"
          style={{ 
            backgroundColor: 'var(--bg-primary)',
            boxShadow: isDark 
              ? '0 0 0 1px rgba(255, 255, 255, 0.06), 0 4px 24px rgba(0, 0, 0, 0.4)' 
              : '0 0 0 1px rgba(0, 0, 0, 0.04), 0 4px 24px rgba(0, 0, 0, 0.06)',
          }}
        >
          {/* Panel Headers */}
          <div 
            className="flex-shrink-0 grid grid-cols-2 border-b"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <div 
              className="px-4 py-2 border-r flex items-center justify-between"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <span 
                className="text-[11px] font-medium uppercase tracking-wider"
                style={{ color: 'var(--text-secondary)' }}
              >
                Original
              </span>
              {leftText && (
                <span 
                  className="text-[11px] tabular-nums"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {leftText.split('\n').length} lines
                </span>
              )}
            </div>
            <div className="px-4 py-2 flex items-center justify-between">
              <span 
                className="text-[11px] font-medium uppercase tracking-wider"
                style={{ color: 'var(--text-secondary)' }}
              >
                Modified
              </span>
              {rightText && (
                <span 
                  className="text-[11px] tabular-nums"
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
                onPaste={triggerImmediateDiff}
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
                onPaste={triggerImmediateDiff}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Keyboard hint */}
      <footer className="flex-shrink-0 py-4">
        <p 
          className="text-center text-[11px]"
          style={{ color: 'var(--text-tertiary)', opacity: 0.6 }}
        >
          Differences are highlighted when you click outside the editor
        </p>
      </footer>
    </div>
  );
};
