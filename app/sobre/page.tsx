import type { Metadata } from 'next';
import Link from 'next/link';
import { legalConfig } from '@/lib/legal-content';
export const metadata: Metadata = {
  title: 'Sobre o Hypeverso',
  description:
    'Conheça o Hypeverso: notícias, catálogo e comunidade sobre cinema, séries, games, animes, mangás, HQs e tecnologia.',
  alternates: { canonical: '/sobre' },
};
// Página "Sobre" — o AdSense avalia transparência sobre quem publica o conteúdo.
export default function Page() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-14" data-no-i18n>
      <p className="text-xs font-black uppercase tracking-[.25em] text-cyan-300">Hypeverso</p>
      <h1 className="mt-2 text-4xl font-black">Sobre o Hypeverso</h1>
      <div className="mt-6 space-y-5 leading-7 text-white/65">
        <p>
          O Hypeverso é uma plataforma brasileira dedicada ao universo geek: notícias de cinema, séries, games, animes,
          mangás, HQs e tecnologia, um catálogo para organizar o que você assiste, lê e joga, um calendário de
          lançamentos e uma comunidade para conversar sobre tudo isso.
        </p>
        <h2 className="pt-2 text-xl font-bold text-white/90">Nosso compromisso editorial</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Toda notícia passa por revisão humana antes de ser publicada.</li>
          <li>
            Usamos inteligência artificial como ferramenta de apoio à pesquisa e redação, sempre citando as fontes
            consultadas.
          </li>
          <li>
            Imagens de terceiros são usadas com licença compatível ou para fins jornalísticos, com os devidos créditos.
          </li>
          <li>
            Erros são corrigidos assim que identificados. Encontrou algo errado?{' '}
            <Link href="/contato" className="text-cyan-300 hover:underline">
              Fale com a gente
            </Link>
            .
          </li>
        </ul>
        <h2 className="pt-2 text-xl font-bold text-white/90">Como o site se mantém</h2>
        <p>
          O conteúdo gratuito é financiado por publicidade, incluindo anúncios do Google AdSense, e pelas compras feitas
          nos links de afiliados da{' '}
          <Link href="/shop" className="text-cyan-300 hover:underline">
            Hypeverso Shop
          </Link>
          : você paga o mesmo preço e a loja repassa uma pequena comissão ao projeto. Anúncios e parcerias nunca
          influenciam a nossa cobertura. Saiba como tratamos seus dados na{' '}
          <Link href="/politica-de-privacidade" className="text-cyan-300 hover:underline">
            Política de Privacidade
          </Link>
          .
        </p>
        <h2 className="pt-2 text-xl font-bold text-white/90">Responsável</h2>
        <p>
          {legalConfig.entity} ·{' '}
          <a href={`mailto:${legalConfig.contactEmail}`} className="text-cyan-300 hover:underline">
            {legalConfig.contactEmail}
          </a>
        </p>
      </div>
    </section>
  );
}
