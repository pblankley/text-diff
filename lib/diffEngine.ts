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

  for (const [operation, text] of diffs) {
    if (!text) continue;

    const lines = text.split('\n');
    // Remove empty last element if text doesn't end with newline
    if (lines[lines.length - 1] === '' && !text.endsWith('\n')) {
      lines.pop();
    }

    if (operation === 0) {
      // EQUAL
      lines.forEach(line => {
        leftResult.push({
          lineNumber: leftLineNum++,
          content: line,
          type: 'unchanged',
          segments: [{ text: line, type: 'unchanged' }]
        });
        rightResult.push({
          lineNumber: rightLineNum++,
          content: line,
          type: 'unchanged',
          segments: [{ text: line, type: 'unchanged' }]
        });
      });
    } else if (operation === -1) {
      // DELETE
      lines.forEach(line => {
        leftResult.push({
          lineNumber: leftLineNum++,
          content: line,
          type: 'removed',
          segments: [{ text: line, type: 'removed' }]
        });
      });
    } else if (operation === 1) {
      // INSERT
      lines.forEach(line => {
        rightResult.push({
          lineNumber: rightLineNum++,
          content: line,
          type: 'added',
          segments: [{ text: line, type: 'added' }]
        });
      });
    }
  }

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
