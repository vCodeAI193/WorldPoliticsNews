import type { Metadata } from 'next';
import Script from 'next/script';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { StoreHydration } from '@/components/StoreHydration';
import { CookieConsent } from '@/components/ui/CookieConsent';
import { createMetadata } from '@/lib/metadata';
import { getOrganizationSchema } from '@/lib/structured-data';
import { SentryProvider } from '@/components/SentryProvider';
import './globals.css';

export const metadata = createMetadata(
  'WorldPoliticsNews - KI-Analyse zu Politikern weltweit',
  'Automatische Analyse von Nachrichtentenor zu Politikern und Parteien. Sentiment-Score basierend auf globalen Nachrichtenquellen.',
  { url: '/' }
);

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getOrganizationSchema()),
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-gray-50">
        <SentryProvider>
          <StoreHydration />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CookieConsent />
        </SentryProvider>
      </body>
    </html>
  );
}
