import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/legal-page';
export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description:
    'Como o Hypeverso coleta, usa e protege seus dados pessoais, incluindo cookies e publicidade do Google AdSense, conforme a LGPD.',
  alternates: { canonical: '/politica-de-privacidade' },
};
export default function Page() {
  return <LegalPage kind="privacy" />;
}
