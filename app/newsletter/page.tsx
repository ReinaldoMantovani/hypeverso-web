import type { Metadata } from 'next';
import { NewsletterSignup } from '@/components/engagement/newsletter-signup';

export const metadata: Metadata = {
  title: 'Newsletter semanal',
  description: 'Receba toda sexta-feira o melhor do universo geek selecionado pelo Hypeverso.',
  alternates: { canonical: '/newsletter' },
};

export default function NewsletterPage() {
  return (
    <section className="mx-auto max-w-xl px-4 py-16">
      <p className="text-xs font-black uppercase tracking-[.25em] text-cyan-300">Hypeverso</p>
      <h1 className="mt-2 text-4xl font-black">Newsletter semanal</h1>
      <p className="mt-3 leading-7 text-white/60">
        Uma vez por semana, as notícias mais lidas de cinema, séries, games, animes e HQs. Sem spam: você confirma a
        inscrição por e-mail e pode cancelar com um clique em qualquer edição.
      </p>
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <NewsletterSignup />
      </div>
      <p className="mt-4 text-xs text-white/40">
        Quer escolher categorias? Entre na sua conta e acesse Conta › Notificações.
      </p>
    </section>
  );
}
