import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/legal-page';
export const metadata: Metadata = {
  title: 'Política de Cookies',
  description:
    'Quais cookies o Hypeverso usa, incluindo cookies do Google AdSense, e como gerenciar seu consentimento.',
  alternates: { canonical: '/politica-de-cookies' },
};
export default function Page() {
  return <LegalPage kind="cookies" />;
}
