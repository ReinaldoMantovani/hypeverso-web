import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { discountPercent, formatPrice, ProductCard } from '@/components/shop/product-card';
import { firstName, PurchaseModal } from '@/components/shop/purchase-modal';

const product = {
  id: 'p1',
  slug: 'funko-vader',
  title: 'Funko Pop Darth Vader',
  store: 'Amazon',
  imageUrl: 'https://m.media-amazon.com/vader.jpg',
  priceCents: 12990,
  originalPriceCents: 17990,
  currency: 'BRL',
  featured: true,
};

describe('Shop · card', () => {
  it('formata preço e desconto', () => {
    expect(formatPrice(12990)?.replace(/\s/g, ' ')).toBe('R$ 129,90');
    expect(discountPercent(product)).toBe(28);
  });

  it('chama onBuy ao clicar em Comprar', () => {
    const onBuy = vi.fn();
    render(<ProductCard product={product} onBuy={onBuy} />);
    fireEvent.click(screen.getByRole('button', { name: /comprar/i }));
    expect(onBuy).toHaveBeenCalledWith(product);
    expect(screen.getByText('-28% OFF')).toBeTruthy();
  });
});

describe('Shop · modal de compra', () => {
  it('agradece pelo nome e leva ao link rastreado', () => {
    render(<PurchaseModal product={product} userName={firstName('Lucas Andrade')} locale="pt-BR" onClose={() => {}} />);
    expect(
      screen.getByText(/ajuda o nosso projeto e o mundo nerd a seguirem em frente\. Obrigado, Lucas!/),
    ).toBeTruthy();
    const buy = screen.getByRole('link', { name: /comprar/i });
    expect(buy.getAttribute('href')).toBe('/api/shop/go/p1?src=%2F');
    expect(buy.getAttribute('target')).toBe('_blank');
    expect(buy.getAttribute('rel')).toContain('sponsored');
  });

  it('funciona para visitantes sem login', () => {
    render(<PurchaseModal product={product} userName={null} locale="pt-BR" onClose={() => {}} />);
    expect(screen.getByText(/seguirem em frente\. Obrigado!/)).toBeTruthy();
  });
});

describe('Shop · textos do CMS', () => {
  it('usa a mensagem configurada com {nome} e mostra os destaques', async () => {
    const { copyFor } = await import('@/components/shop/purchase-modal');
    const copy = copyFor('pt-BR', { modalMessage: 'Valeu, {nome}! Você fortalece o Hypeverso.', modalMessageGuest: 'Valeu!' });
    expect(copy.message('Ana')).toBe('Valeu, Ana! Você fortalece o Hypeverso.');
    expect(copy.message(null)).toBe('Valeu!');
    // Em inglês continua a tradução pronta.
    expect(copyFor('en', { modalMessage: 'Valeu, {nome}!' }).message('Ana')).toMatch(/Thank you, Ana/);
    render(
      <PurchaseModal
        product={{ ...product, highlights: ['Pintura detalhada', 'Caixa janela'] }}
        userName="Ana"
        locale="pt-BR"
        onClose={() => {}}
        texts={{ modalMessage: 'Valeu, {nome}!' }}
      />,
    );
    expect(screen.getByText('Valeu, Ana!')).toBeTruthy();
    expect(screen.getByText('Caixa janela')).toBeTruthy();
  });
});

describe('Shop · produtos dentro do artigo', async () => {
  const { productKeys, splitPostHtml, stripLeftoverCodes } = await import('@/lib/shop-embeds');
  const html = '<h2>Intro</h2><p>Texto.</p><p>[[produto:funko-vader]]</p><p>Mais texto.</p><p> [[produto:dualsense-ps5]] </p>';
  it('acha os códigos e divide o HTML', () => {
    expect(productKeys(html)).toEqual(['funko-vader', 'dualsense-ps5']);
    const segs = splitPostHtml(html);
    expect(segs.map(s => s.type)).toEqual(['html', 'product', 'html', 'product']);
    expect(segs[1]).toEqual({ type: 'product', key: 'funko-vader' });
  });
  it('remove códigos que sobraram', () => {
    expect(stripLeftoverCodes('<p>Veja [[produto:x]] aqui</p>')).toBe('<p>Veja  aqui</p>');
  });
});
