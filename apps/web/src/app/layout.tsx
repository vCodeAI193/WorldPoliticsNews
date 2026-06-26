import type { Metadata } from 'next';
import Script from 'next/script';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { StoreHydration } from '@/components/StoreHydration';
import { CookieConsent } from '@/components/ui/CookieConsent';
import './globals.css';

export const metadata: Metadata = {
  title: 'WorldPoliticsNews – Globale Politikanalyse',
  description:
    'KI-gestützte Analyse von Kritiken und Bewertungen zu Politikern und Parteien weltweit. Automatische Nachrichtenauswertung für informierte Bürger.',
  openGraph: {
    locale: 'de_DE',
    siteName: 'WorldPoliticsNews',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  return (
    <html lang="de">
      <head>
        {adsenseId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
            strategy="lazyOnload"
          />
        )}
      </head>
      <body className="min-h-screen flex flex-col bg-gray-50">
        <StoreHydration />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
