import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, ShieldCheck, Newspaper, Megaphone } from 'lucide-react';
import { legalConfig } from '@/lib/legal-content';
export const metadata: Metadata = {
  title: 'Contato',
  description: 'Fale com a equipe do Hypeverso: dúvidas, correções editoriais, privacidade e parcerias.',
  alternates: { canonical: '/contato' },
};
const items = [
  {
    icon: Mail,
    title: 'Contato geral',
    text: 'Dúvidas, sugestões e suporte à conta.',
    email: legalConfig.contactEmail,
  },
  {
    icon: Newspaper,
    title: 'Correções editoriais',
    text: 'Encontrou um erro em uma notícia? Envie o link e a correção.',
    email: legalConfig.contactEmail,
  },
  {
    icon: ShieldCheck,
    title: 'Privacidade e LGPD (Encarregado/DPO)',
    text: 'Acesso, correção, exclusão e portabilidade de dados. Respondemos em até 15 dias.',
    email: legalConfig.dpoEmail,
  },
  {
    icon: Megaphone,
    title: 'Parcerias e publicidade',
    text: 'Propostas comerciais e imprensa.',
    email: legalConfig.contactEmail,
  },
];
export default function Page() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-14" data-no-i18n>
      <p className="text-xs font-black uppercase tracking-[.25em] text-cyan-300">Hypeverso</p>
      <h1 className="mt-2 text-4xl font-black">Contato</h1>
      <p className="mt-4 leading-7 text-white/60">
        Escolha o canal mais adequado. Responsável pelo site: {legalConfig.entity}.
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {items.map(({ icon: Icon, title, text, email }) => (
          <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <Icon size={20} className="text-violet-300" />
            <h2 className="mt-3 font-bold">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-white/55">{text}</p>
            <a href={`mailto:${email}`} className="mt-3 inline-block text-sm text-cyan-300 hover:underline">
              {email}
            </a>
          </div>
        ))}
      </div>
      <p className="mt-8 text-sm text-white/45">
        Para exportar ou excluir seus dados diretamente, acesse{' '}
        <Link href="/conta/privacidade" className="text-cyan-300 hover:underline">
          Conta › Privacidade
        </Link>
        .
      </p>
    </section>
  );
}
