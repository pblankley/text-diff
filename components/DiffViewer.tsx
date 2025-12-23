'use client';

import React, { useState } from 'react';
import { useDiff } from '@/hooks/useDiff';
import { TextEditor } from './TextEditor';

export const DiffViewer: React.FC = () => {
  const [leftText, setLeftText] = useState('');
  const [rightText, setRightText] = useState('');

  const { diffResult, isComputing } = useDiff(leftText, rightText);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-4 bg-white border-b border-gray-300">
        <h1 className="text-2xl font-bold text-gray-800">Text Diff Viewer</h1>
        <p className="text-sm text-gray-600 mt-1">
          Edit text on either side - differences are highlighted in real-time
          {isComputing && <span className="ml-2 text-blue-600">(Computing...)</span>}
        </p>
      </header>

      {/* Main Content - Two Panes */}
      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2">
          <TextEditor
            value={leftText}
            onChange={setLeftText}
            diffLines={diffResult.leftLines}
            label="Text 1"
            side="left"
          />
        </div>

        <div className="w-1/2">
          <TextEditor
            value={rightText}
            onChange={setRightText}
            diffLines={diffResult.rightLines}
            label="Text 2"
            side="right"
          />
        </div>
      </div>
    </div>
  );
};
