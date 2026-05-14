import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from './components/ThemeProvider'
import { DMCAFooter } from './components/DMCAFooter'
import { TelegramDialog } from './components/TelegramDialog'
import { ExoclickInterstitialAd } from './components/exoclick/ExoclickInterstitialAd'
import {
  AdLeaderboardSection,
  AdMobileLeaderboardSection,
  AdSkyscraperSection,
} from './components/AdSlot'
import { Analytics } from '@vercel/analytics/react'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://kdotv.com'),
  title: {
    default: 'kdotTV - Watch Live Football & Cricket Matches Free in HD',
    template: '%s | kdotTV',
  },
  description:
    'Watch live football and cricket matches in HD for free on kdotTV. Stream Premier League, Champions League, La Liga, Bundesliga, IPL, and more. Get real-time scores, match schedules, and highlights.',
  keywords: [
    'live football stream',
    'live cricket stream',
    'watch football free',
    'live sports hd',
    'match streaming',
    'premier league live',
    'champions league stream',
    'la liga live',
    'bundesliga stream',
    'ipl live',
    't20 cricket',
    'live match today',
    'free sports streaming',
  ],
  applicationName: 'kdotTV',
  authors: [{ name: 'kdotTV' }],
  creator: 'kdotTV',
  publisher: 'kdotTV',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'kdotTV',
    url: '/',
    images: [
      {
        url: '/ground.png',
        width: 1200,
        height: 630,
        alt: 'kdotTV - Live Sports Streaming in HD',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'kdotTV - Watch Live Football & Cricket Matches Free in HD',
    description:
      'Watch live football and cricket matches in HD for free. Premier League, Champions League, IPL & more.',
    images: ['/ground.png'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/logo.png',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta name="adstuff-verify-tag" content="xAbjTYLNTXsX8LH24G7-E" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 'light';
                  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const isDark = theme === 'dark' || (theme === 'system' && systemDark);
                  if (isDark) document.documentElement.classList.add('dark');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {/* <AdMobileLeaderboardSection /> */}
          {/* <AdSkyscraperSection /> */}
          {/* <AdLeaderboardSection /> */}
          {children}
          {/* <ExoclickVideoSliderAd /> */}
          {/* <AdsterraSocialBar /> */}
          <TelegramDialog />
          {/* <ExoclickInterstitialAd /> */}
          <div className="mx-auto max-w-5xl w-full px-4 pb-6 sm:px-6">
            <DMCAFooter />
          </div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
