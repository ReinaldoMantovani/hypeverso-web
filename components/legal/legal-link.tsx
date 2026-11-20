'use client';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { legalRoutes, type LegalKind } from '@/lib/legal-content';
import { openLegalModal } from './legal-modal';

/**
 * Link real e rastreável (bom para o crawler do AdSense/SEO) que, num clique
 * normal, abre o popup em vez de sair da página. Ctrl/Cmd/clique do meio abrem a página.
 */
export function LegalLink({ kind, children, className }: { kind: LegalKind; children: ReactNode; className?: string }) {
  return (
    <Link
      href={legalRoutes[kind]}
      className={className}
      onClick={e => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        openLegalModal(kind);
      }}
    >
      {children}
    </Link>
  );
}
