import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'TradePulse — AI Trading Journal',
  description: 'The most advanced AI-powered trading journal for forex, crypto, futures and stocks traders.',
  keywords: 'trading journal, AI trading coach, forex journal, crypto trading, SMC, ICT',
  openGraph: {
    title: 'TradePulse — AI Trading Journal',
    description: 'Track, analyze and improve every trade with AI coaching.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
