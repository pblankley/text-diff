import DiffMatchPatch from 'diff-match-patch';
import { DiffResult, DiffLine, DiffSegment } from './types';

const dmp = new DiffMatchPatch();

export function computeDiff(leftText: string, rightText: string): DiffResult {
  if (!leftText && !rightText) {
    return { leftLines: [], rightLines: [] };
  }

  const leftLines = leftText ? leftText.split('\n') : [];
  const rightLines = rightText ? rightText.split('\n') : [];

  // If one side is empty, return all lines as added or removed
  if (!leftText) {
    return {
      leftLines: [],
      rightLines: rightLines.map((line, idx) => ({
        lineNumber: idx + 1,
        content: line,
        type: 'added' as const,
        segments: [{ text: line, type: 'added' as const }]
      }))
    };
  }

  if (!rightText) {
    return {
      leftLines: leftLines.map((line, idx) => ({
        lineNumber: idx + 1,
        content: line,
        type: 'removed' as const,
        segments: [{ text: line, type: 'removed' as const }]
      })),
      rightLines: []
    };
  }

  // Compute line-level diff
  const diffs = dmp.diff_main(leftText, rightText);
  dmp.diff_cleanupSemantic(diffs);

  // Process diffs into line-by-line structure
  const result = processDiffs(diffs, leftLines, rightLines);

  return result;
}

function processDiffs(
  diffs: Array<[number, string]>,
  leftLines: string[],
  rightLines: string[]
): DiffResult {
  const leftResult: DiffLine[] = [];
  const rightResult: DiffLine[] = [];

  let leftLineNum = 1;
  let rightLineNum = 1;
  
  // Track current line segments for both sides
  let leftCurrentSegments: DiffSegment[] = [];
  let rightCurrentSegments: DiffSegment[] = [];

  // Helper to finalize a line
  const finalizeLeftLine = () => {
    if (leftCurrentSegments.length > 0) {
      const content = leftCurrentSegments.map(s => s.text).join('');
      const hasChanges = leftCurrentSegments.some(s => s.type !== 'unchanged');
      leftResult.push({
        lineNumber: leftLineNum++,
        content,
        type: hasChanges ? 'removed' : 'unchanged',
        segments: [...leftCurrentSegments]
      });
      leftCurrentSegments = [];
    }
  };

  const finalizeRightLine = () => {
    if (rightCurrentSegments.length > 0) {
      const content = rightCurrentSegments.map(s => s.text).join('');
      const hasChanges = rightCurrentSegments.some(s => s.type !== 'unchanged');
      rightResult.push({
        lineNumber: rightLineNum++,
        content,
        type: hasChanges ? 'added' : 'unchanged',
        segments: [...rightCurrentSegments]
      });
      rightCurrentSegments = [];
    }
  };

  for (const [operation, text] of diffs) {
    if (!text) continue;

    // Split by newlines but keep track of them
    const parts = text.split('\n');

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLastPart = i === parts.length - 1;

      if (operation === 0) {
        // EQUAL - add to both sides
        if (part) {
          leftCurrentSegments.push({ text: part, type: 'unchanged' });
          rightCurrentSegments.push({ text: part, type: 'unchanged' });
        }
        // If not the last part, we hit a newline - finalize both lines
        if (!isLastPart) {
          finalizeLeftLine();
          finalizeRightLine();
        }
      } else if (operation === -1) {
        // DELETE - add to left side only
        if (part) {
          leftCurrentSegments.push({ text: part, type: 'removed' });
        }
        // If not the last part, we hit a newline - finalize left line only
        if (!isLastPart) {
          finalizeLeftLine();
        }
      } else if (operation === 1) {
        // INSERT - add to right side only
        if (part) {
          rightCurrentSegments.push({ text: part, type: 'added' });
        }
        // If not the last part, we hit a newline - finalize right line only
        if (!isLastPart) {
          finalizeRightLine();
        }
      }
    }
  }

  // Finalize any remaining content
  finalizeLeftLine();
  finalizeRightLine();

  return { leftLines: leftResult, rightLines: rightResult };
}

// For character-level diffs within lines (optional enhancement)
export function computeInlineDiff(line1: string, line2: string): {
  left: DiffSegment[];
  right: DiffSegment[];
} {
  const diffs = dmp.diff_main(line1, line2);
  dmp.diff_cleanupSemantic(diffs);

  const left: DiffSegment[] = [];
  const right: DiffSegment[] = [];

  for (const [op, text] of diffs) {
    if (op === 0) {
      left.push({ text, type: 'unchanged' });
      right.push({ text, type: 'unchanged' });
    } else if (op === -1) {
      left.push({ text, type: 'removed' });
    } else {
      right.push({ text, type: 'added' });
    }
  }

  return { left, right };
}
