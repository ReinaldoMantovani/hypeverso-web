'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, KeyRound, ListChecks, ShieldCheck } from 'lucide-react';

const items = [
  { href: '/conta/privacidade', label: 'Privacidade e dados', icon: ShieldCheck },
  { href: '/conta/seguranca', label: 'Segurança', icon: KeyRound },
  { href: '/conta/notificacoes', label: 'Notificações e newsletter', icon: Bell },
  { href: '/listas/minhas', label: 'Minhas listas', icon: ListChecks },
];

export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Conta"
      className="flex gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] p-1"
    >
      {items.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={pathname === href ? 'page' : undefined}
          className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${pathname === href ? 'bg-violet-500/20 text-violet-100' : 'text-white/55 hover:bg-white/5 hover:text-white'}`}
        >
          <Icon size={15} />
          {label}
        </Link>
      ))}
    </nav>
  );
}
