'use client';
import { Fragment, useState } from 'react';

/**
 * Texto de usuário com spoilers marcados como ||assim||. Cada trecho fica
 * borrado até ser clicado. Quando `whole` é true, o texto inteiro é spoiler.
 */
export function SpoilerText({ text, whole = false, className }: { text: string; whole?: boolean; className?: string }) {
  if (whole) return <Spoiler className={className}>{text}</Spoiler>;
  const parts = text.split(/(\|\|[\s\S]+?\|\|)/g);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.startsWith('||') && part.endsWith('||') && part.length > 4 ? (
          <Spoiler key={i}>{part.slice(2, -2)}</Spoiler>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </span>
  );
}

function Spoiler({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      role={open ? undefined : 'button'}
      tabIndex={open ? undefined : 0}
      aria-label={open ? undefined : 'Spoiler oculto. Ative para revelar.'}
      onClick={() => setOpen(true)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setOpen(true);
        }
      }}
      className={`spoiler ${open ? 'revealed' : ''} ${className}`}
    >
      {children}
    </span>
  );
}
