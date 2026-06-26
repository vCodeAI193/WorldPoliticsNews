import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata(
  'Preise - WorldPoliticsNews Plus',
  'Unbegrenzte Beobachtungsliste, keine Werbung und schnellere Updates mit WorldPoliticsNews Plus.',
  { url: '/preise' }
);

export default function PreisLayout({ children }: { children: React.ReactNode }) {
  return children;
}
