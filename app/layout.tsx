import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Text Diff Viewer',
  description: 'Beautiful side-by-side text diff viewer with GitHub-style colors',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
