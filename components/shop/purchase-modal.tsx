'use client';
import { useEffect, useRef } from 'react';
import { CheckCircle2, ExternalLink, Heart, ShieldCheck, X } from 'lucide-react';
import { assetUrl } from '@/lib/asset-url';
import { formatPrice, type ShopProduct } from './product-card';

export type PurchaseCopy = {
  title: string;
  message: (name: string | null) => string;
  buy: string;
  close: string;
  redirect: (store: string) => string;
};

export const PURCHASE_COPY: Record<'pt-BR' | 'en' | 'es', PurchaseCopy> = {
  'pt-BR': {
    title: 'Obrigado pelo apoio!',
    message: name =>
      `Quando você adquire um produto pelo Hypeverso, você ajuda o nosso projeto e o mundo nerd a seguirem em frente. Obrigado${name ? `, ${name}` : ''}!`,
    buy: 'Comprar',
    close: 'Fechar',
    redirect: store => `Você será levado à ${store} em uma nova aba. O preço é o mesmo para você.`,
  },
  en: {
    title: 'Thanks for the support!',
    message: name =>
      `When you buy a product through Hypeverso, you help our project and the geek world keep moving forward. Thank you${name ? `, ${name}` : ''}!`,
    buy: 'Buy now',
    close: 'Close',
    redirect: store => `You'll be taken to ${store} in a new tab. The price is the same for you.`,
  },
  es: {
    title: '¡Gracias por el apoyo!',
    message: name =>
      `Cuando compras un producto a través de Hypeverso, ayudas a nuestro proyecto y al mundo nerd a seguir adelante. ¡Gracias${name ? `, ${name}` : ''}!`,
    buy: 'Comprar',
    close: 'Cerrar',
    redirect: store => `Te llevaremos a ${store} en una nueva pestaña. El precio es el mismo para ti.`,
  },
};

/** Textos editados no CMS (Configurações › Textos da Shop). Valem para o português. */
export type ShopTexts = {
  modalTitle?: string;
  modalMessage?: string;
  modalMessageGuest?: string;
  buyLabel?: string;
};

export function copyFor(locale: 'pt-BR' | 'en' | 'es', texts?: ShopTexts | null): PurchaseCopy {
  const base = PURCHASE_COPY[locale] || PURCHASE_COPY['pt-BR'];
  if (locale !== 'pt-BR' || !texts) return base;
  return {
    ...base,
    title: texts.modalTitle || base.title,
    buy: texts.buyLabel || base.buy,
    message: name =>
      name
        ? texts.modalMessage
          ? texts.modalMessage.replaceAll('{nome}', name)
          : base.message(name)
        : texts.modalMessageGuest || base.message(null),
  };
}

/** Primeiro nome do usuário logado (ou null para visitantes). */
export function firstName(name?: string | null) {
  const first = (name || '').trim().split(/\s+/)[0];
  return first ? first.slice(0, 40) : null;
}

export function PurchaseModal({
  product,
  userName,
  locale,
  onClose,
  texts,
}: {
  product: ShopProduct | null;
  userName: string | null;
  locale: 'pt-BR' | 'en' | 'es';
  onClose: () => void;
  texts?: ShopTexts | null;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const copy = copyFor(locale, texts);

  useEffect(() => {
    if (!product) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const nodes = [...dialogRef.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled])')];
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [product, onClose]);

  if (!product) return null;
  const price = formatPrice(product.priceCents, product.currency || 'BRL', locale);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shop-purchase-title"
        className="relative w-full max-w-md overflow-hidden rounded-t-3xl border border-white/10 bg-[#0c0818] shadow-2xl sm:rounded-3xl"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-violet-600/30 to-transparent" />
        <button
          type="button"
          onClick={onClose}
          aria-label={copy.close}
          className="absolute right-3 top-3 z-10 rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white"
        >
          <X size={18} />
        </button>

        <div className="relative px-6 pb-6 pt-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-900/40">
            <Heart className="fill-white text-white" size={26} />
          </div>
          <h2 id="shop-purchase-title" className="mt-4 text-2xl font-black">
            {copy.title}
          </h2>

          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white">
              {product.imageUrl ? (
                <img
                  src={assetUrl(product.imageUrl)}
                  alt=""
                  referrerPolicy="no-referrer"
                  onError={e => {
                    // Foto removida pela loja: esconde o ícone de imagem quebrada.
                    e.currentTarget.style.visibility = 'hidden';
                  }}
                  className="h-full w-full object-contain p-1.5"
                />
              ) : null}
            </div>
            <div className="min-w-0">
              <div className="line-clamp-2 text-sm font-bold">{product.title}</div>
              <div className="mt-1 text-xs text-white/50">
                {product.store}
                {price ? (
                  <>
                    {' '}
                    · <span className="font-semibold text-white/80">{price}</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          {product.highlights?.length ? (
            <ul className="mt-4 space-y-1.5 text-left text-sm text-white/70">
              {product.highlights.slice(0, 5).map(h => (
                <li key={h} className="flex gap-2">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-300" /> {h}
                </li>
              ))}
            </ul>
          ) : null}

          <p className="mt-5 text-[15px] leading-relaxed text-white/80">{copy.message(userName)}</p>

          <a
            data-autofocus
            // src = página do clique (Shop, coleção ou artigo) para o relatório por origem.
            href={`/api/shop/go/${encodeURIComponent(product.id)}?src=${encodeURIComponent(
              typeof window === 'undefined' ? '/shop' : window.location.pathname,
            )}`}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
            onClick={() => setTimeout(onClose, 150)}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3.5 text-base font-black text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-500 hover:to-fuchsia-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
          >
            {copy.buy} <ExternalLink size={17} />
          </a>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-white/40">
            <ShieldCheck size={13} /> {copy.redirect(product.store)}
          </p>
        </div>
      </div>
    </div>
  );
}
