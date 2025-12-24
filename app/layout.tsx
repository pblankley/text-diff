import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Diff',
  description: 'Beautiful side-by-side text comparison',
  icons: {
    icon: [
      {
        url: '/diff-logo-dark.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/diff-logo-light.png',
        media: '(prefers-color-scheme: dark)',
      },
    ],
    apple: [
      {
        url: '/diff-logo-dark.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/diff-logo-light.png',
        media: '(prefers-color-scheme: dark)',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
