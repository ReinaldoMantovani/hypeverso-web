import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/legal-page';
export const metadata: Metadata = {
  title: 'Termos de Uso',
  description: 'Regras de uso do Hypeverso: conta, conduta, conteúdo do usuário, assinatura Premium e publicidade.',
  alternates: { canonical: '/termos-de-uso' },
};
export default function Page() {
  return <LegalPage kind="terms" />;
}
