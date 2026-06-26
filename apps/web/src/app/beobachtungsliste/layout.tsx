import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata(
  'Beobachtungsliste - WorldPoliticsNews',
  'Deine persönliche Beobachtungsliste mit deinen favorisierten Politikern und Parteien.',
  { url: '/beobachtungsliste' }
);

export default function BeobachtungslisteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
