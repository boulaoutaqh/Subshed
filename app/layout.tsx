import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Subshed – Find Forgotten Subscriptions',
  description: 'Scan your Gmail to find and cancel forgotten subscriptions. No bank required.',
  verification: {
    google: '-qXKOFcswIhyW2YB0yYYRAOsiEhsFlWHYQlf-0yWHcU',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body><Providers>{children}</Providers></body>
    </html>
  );
}