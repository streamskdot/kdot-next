import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from './components/ThemeProvider'
import { DMCAFooter } from './components/DMCAFooter'
import { TelegramDialog } from './components/TelegramDialog'
import { ExoclickInterstitialAd } from './components/exoclick/ExoclickInterstitialAd'
import { LeaderboardAdSection } from './components/exoclick/LeaderboardAdSection'
import { MobileLeaderboardAdSection } from './components/exoclick/MobileLeaderboardAdSection'
import { SkyscraperAdSection } from './components/exoclick/SkyscraperAdSection'
import { ExoclickVideoSliderAd } from './components/exoclick/ExoclickVideoSliderAd'
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
  title: "kdoTV - Live Football & Cricket Matches in HD",
  description: "Watch upcoming and live football matches & Highlights",
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
        <meta httpEquiv="Delegate-CH" content="Sec-CH-UA https://s.magsrv.com; Sec-CH-UA-Mobile https://s.magsrv.com; Sec-CH-UA-Arch https://s.magsrv.com; Sec-CH-UA-Model https://s.magsrv.com; Sec-CH-UA-Platform https://s.magsrv.com; Sec-CH-UA-Platform-Version https://s.magsrv.com; Sec-CH-UA-Bitness https://s.magsrv.com; Sec-CH-UA-Full-Version-List https://s.magsrv.com; Sec-CH-UA-Full-Version https://s.magsrv.com;" />
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
          <MobileLeaderboardAdSection />
          <SkyscraperAdSection />
          <LeaderboardAdSection />
          {children}
          <ExoclickVideoSliderAd />
          <TelegramDialog />
          <ExoclickInterstitialAd />
          <div className="mx-auto max-w-5xl w-full px-4 pb-6 sm:px-6">
            <DMCAFooter />
          </div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
