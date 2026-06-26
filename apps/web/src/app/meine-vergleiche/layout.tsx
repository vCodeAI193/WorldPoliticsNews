import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata(
  'Meine Vergleiche - WorldPoliticsNews',
  'Vergleiche mehrere Politiker und Parteien nebeneinander nach ihrem Medientenor.',
  { url: '/meine-vergleiche' }
);

export default function MeineVergleicheLayout({ children }: { children: React.ReactNode }) {
  return children;
}
