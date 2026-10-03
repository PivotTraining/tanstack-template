import type { Metadata } from 'next';
import { Inter, Newsreader } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', weight: ['400', '500'] });
const news = Newsreader({ subsets: ['latin'], variable: '--font-display', weight: ['400'] });

export const metadata: Metadata = {
  title: 'Black Ledger',
  description: 'Guided trading education, practice, and market intelligence.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${news.variable}`}>
      <body>{children}</body>
    </html>
  );
}
