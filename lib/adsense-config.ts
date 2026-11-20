// Configuração do AdSense compartilhada entre Server e Client Components.
// ID do editor no formato "ca-pub-XXXXXXXXXXXXXXXX". Sem ele nada é carregado.
export const ADSENSE_CLIENT = (process.env.NEXT_PUBLIC_ADSENSE_CLIENT || '').trim();
export const ADSENSE_ENABLED = /^ca-pub-\d{10,20}$/.test(ADSENSE_CLIENT);
