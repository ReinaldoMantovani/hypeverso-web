'use client';
import React from 'react';
import { getLegalDoc, legalConfig, type LegalKind } from '@/lib/legal-content';
import { useI18n } from '@/lib/i18n';

// Converte URLs e e-mails do texto jurídico em links clicáveis.
function Linkify({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s,;)]+|[\w.+-]+@[\w-]+\.[\w.-]+)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (/^https?:\/\//.test(part)) {
          const clean = part.replace(/[.]$/, '');
          return (
            <React.Fragment key={i}>
              <a
                href={clean}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-300 underline-offset-2 hover:underline"
              >
                {clean.replace(/^https?:\/\//, '')}
              </a>
              {part.endsWith('.') ? '.' : ''}
            </React.Fragment>
          );
        }
        if (/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(part)) {
          const clean = part.replace(/[.]$/, '');
          return (
            <React.Fragment key={i}>
              <a href={`mailto:${clean}`} className="text-cyan-300 underline-offset-2 hover:underline">
                {clean}
              </a>
              {part.endsWith('.') ? '.' : ''}
            </React.Fragment>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
}

export function LegalDocument({
  kind,
  compact = false,
  headingLevel = 1,
}: {
  kind: LegalKind;
  compact?: boolean;
  headingLevel?: 1 | 2;
}) {
  const { locale } = useI18n();
  const doc = getLegalDoc(kind, locale);
  const H = headingLevel === 1 ? 'h1' : 'h2';
  const S = headingLevel === 1 ? 'h2' : 'h3';
  return (
    <div data-no-i18n className="legal-doc">
      {!compact && (
        <p className="text-xs font-black uppercase tracking-[.25em] text-cyan-300">{legalConfig.siteName}</p>
      )}
      <H className={compact ? 'sr-only' : 'mt-2 text-3xl font-black sm:text-4xl'}>{doc.title}</H>
      <p className="mt-2 text-xs text-white/40">{doc.updated}</p>
      <p className="mt-4 leading-7 text-white/65">
        <Linkify text={doc.intro} />
      </p>
      <div className="mt-8 space-y-7">
        {doc.sections.map(section => (
          <section key={section.h}>
            <S className="text-lg font-bold text-white/90">{section.h}</S>
            {section.p?.map((p, i) => (
              <p key={i} className="mt-2 leading-7 text-white/60">
                <Linkify text={p} />
              </p>
            ))}
            {section.list && (
              <ul className="mt-3 list-disc space-y-2 pl-5 leading-7 text-white/60">
                {section.list.map((item, i) => (
                  <li key={i}>
                    <Linkify text={item} />
                  </li>
                ))}
              </ul>
            )}
            {section.table && (
              <div className="mt-3 overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead className="bg-white/[0.04] text-white/75">
                    <tr>
                      {section.table.head.map(h => (
                        <th key={h} scope="col" className="px-3 py-2 font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.table.rows.map((row, i) => (
                      <tr key={i} className="border-t border-white/5 align-top">
                        {row.map((cell, j) => (
                          <td
                            key={j}
                            className={`px-3 py-2 ${j === 0 ? 'font-medium text-white/80' : 'text-white/55'}`}
                          >
                            <Linkify text={cell} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
