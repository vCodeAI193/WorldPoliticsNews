import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://worldpoliticsnews.com';

export function getMetadata(
  title: string,
  description: string,
  options?: {
    image?: string;
    url?: string;
    type?: 'website' | 'article';
  }
): Metadata {
  const url = options?.url ? `${BASE_URL}${options.url}` : BASE_URL;
  const image = options?.image || `${BASE_URL}/og-default.png`;

  return {
    title,
    description,
    metadataBase: new URL(BASE_URL),
    openGraph: {
      title,
      description,
      url,
      siteName: 'WorldPoliticsNews',
      images: [{ url: image, width: 1200, height: 630 }],
      type: options?.type || 'website',
      locale: 'de_DE',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-snippet': -1,
        'max-image-preview': 'large',
        'max-video-preview': -1,
      },
    },
  };
}
