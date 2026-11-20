# Hypeverso Web (site público)

Site público do Hypeverso em Next.js 16. Este projeto não tem CMS nem banco: tudo vem da **hypeverso-api** por um proxy na mesma origem (`/api/*` e `/uploads/*`). Os cookies de login continuam seguros, porque o navegador só conversa com o seu domínio.

O que mudou nesta versão:

- Os textos da Shop (título, subtítulo, mensagem do modal com `{nome}`, botão e aviso de afiliado) e a tag da Amazon do catálogo vêm de **CMS › Configurações**.
- **/shop** substitui a página Premium (`/premium` redireciona para `/shop` com 308). Mostra os produtos de afiliados em cards, com filtros por categoria e loja, busca, preços com desconto e cupom.
- Ao clicar em **Comprar**, abre um modal: *"Quando você adquire um produto pelo Hypeverso, você ajuda o nosso projeto e o mundo nerd a seguirem em frente. Obrigado, {nome}!"* e o botão **Comprar** abre a loja em nova aba. O clique é contado pela API.
- **Coleções** em `/shop/c/<slug>` (com atalhos no topo da Shop e no sitemap).
- **Produtos dentro dos artigos:** o código `[[produto:slug]]` inserido pelo CMS vira um card de compra.
- Cada clique registra a página de origem (`?src=`), que alimenta o relatório do CMS.
- Para usar Cloudflare na frente do site, veja `docs/CLOUDFLARE.md`.
- O painel `/admin` saiu do site e foi para o projeto **hypeverso-cms**, que roda no seu PC.

## Rodar localmente

```bash
cp .env.example .env.local     # API_INTERNAL_URL=http://localhost:4000
npm install
npm run dev                    # http://localhost:3000
```

## Publicar na Hostinger (Node.js Web App)

Planos com Node.js Web App: Business ou Cloud.

1. Suba este projeto para um repositório no GitHub (ou envie o .zip sem `node_modules` e `.next`).
2. hPanel → **Sites → Adicionar site → Node.js Web App** → importe o repositório.
3. Configurações de build:

   | Campo | Valor |
   |---|---|
   | Framework | Next.js |
   | Node.js | 22.x |
   | Comando de build | `npm run build` |
   | Diretório de saída | `.next` |

4. **Variáveis de ambiente** (veja `.env.example`). As obrigatórias são:

   ```
   NEXT_PUBLIC_SITE_URL=https://seudominio.com.br
   API_INTERNAL_URL=https://api.seudominio.com.br     # a API é outro Node.js Web App no mesmo plano Business
   GATEWAY_SHARED_SECRET=<mesmo valor do .env da API>
   ```

   Variáveis `NEXT_PUBLIC_*` entram no build. Se mudar alguma, faça um novo deploy.
5. Deploy. Teste `https://seudominio.com.br/shop` e `https://seudominio.com.br/api/shop/products`.

Se o build falhar com erro do Turbopack em `globals.css`, troque o comando de build para `npm run build:webpack`. A Hostinger documenta esse contorno para Next.js 16.

## Testes

```bash
npm run typecheck
npm run lint
npm test          # inclui testes do card e do modal da Shop
npm run test:e2e  # Playwright (precisa do site rodando)
```
