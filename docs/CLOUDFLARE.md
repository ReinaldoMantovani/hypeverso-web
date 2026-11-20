# Cloudflare (plano grátis) na frente do Hypeverso

Deixa o site mais rápido (imagens e arquivos do Next em cache no Brasil inteiro), protege contra ataques e alivia o plano Business.

## 1. Ativar

1. Crie uma conta em cloudflare.com e adicione `seudominio.com.br` (plano **Free**).
2. A Cloudflare importa os registros DNS. Confira:
   - `seudominio.com.br` e `www` → **Proxied** (nuvem laranja);
   - `api` → **DNS only** (nuvem cinza). O site e o CMS já falam com a API pelo servidor, com o IP real assinado pelo `GATEWAY_SHARED_SECRET`. Deixar a API fora do proxy evita confusão de IP e de cache em respostas com login.
3. Na Hostinger, troque os **nameservers** do domínio pelos dois que a Cloudflare indicar (hPanel › Domínios › DNS/Nameservers). A propagação leva de minutos a algumas horas.

## 2. Ajustes recomendados

| Onde | Configuração |
|---|---|
| SSL/TLS › Overview | **Full (strict)** (a Hostinger já tem certificado) |
| SSL/TLS › Edge Certificates | Always Use HTTPS: **On** · Automatic HTTPS Rewrites: **On** |
| Speed › Optimization | Brotli **On**. **Não** ligue Rocket Loader: ele quebra a CSP com nonce do site. |
| Caching › Configuration | Browser Cache TTL: **Respect Existing Headers** |
| Rules › Cache Rules | Regra 1: *URI Path starts with* `/uploads/` → **Eligible for cache**, Edge TTL **1 mês** (as imagens nunca mudam de nome) |
| | Regra 2: *URI Path starts with* `/_next/static/` → **Eligible for cache**, Edge TTL **1 ano** |
| | Regra 3: *URI Path starts with* `/api/` → **Bypass cache** |
| Security › Bots | Bot Fight Mode **On** (opcional; se algum parceiro de anúncios reclamar, desligue) |

Não crie regras de cache para as páginas HTML: elas mostram dados de login (avatar, notificações) e o Next já controla o cache delas.

## 3. Variável no site (Hostinger)

No Web App do **site**, adicione e faça novo deploy:

```
CLIENT_IP_HEADER=cf-connecting-ip
```

Assim o site manda para a API o IP real de cada visitante (rate limit, contagem de cliques da Shop e de views por pessoa), e não o IP da Cloudflare.

## 4. Conferir

- `curl -I https://seudominio.com.br/uploads/<alguma-imagem>.webp` deve mostrar `cf-cache-status: HIT` na segunda chamada.
- Faça login no site e no CMS e publique um produto na Shop: tudo deve funcionar igual.
