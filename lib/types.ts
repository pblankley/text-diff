export interface DiffResult {
  leftLines: DiffLine[];
  rightLines: DiffLine[];
}

export interface DiffLine {
  lineNumber: number;
  content: string;
  type: 'added' | 'removed' | 'unchanged';
  segments: DiffSegment[];
}

export interface DiffSegment {
  text: string;
  type: 'added' | 'removed' | 'unchanged';
}

export interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  diffLines: DiffLine[];
  label: string;
  side: 'left' | 'right';
}
