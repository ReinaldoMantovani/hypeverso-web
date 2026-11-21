// Conteúdo jurídico centralizado (Privacidade, Termos e Cookies).
// É usado tanto pelas páginas indexáveis (/politica-de-privacidade etc.) quanto
// pelos popups. O Google AdSense exige que a Política de Privacidade seja uma
// página pública e rastreável; os popups são um atalho de leitura, não um substituto.
//
// Personalize pelas variáveis de ambiente públicas:
//   NEXT_PUBLIC_LEGAL_ENTITY   Razão social / nome do responsável (controlador LGPD)
//   NEXT_PUBLIC_CONTACT_EMAIL  E-mail de contato geral
//   NEXT_PUBLIC_DPO_EMAIL      E-mail do Encarregado (DPO) — se vazio, usa o de contato
//   NEXT_PUBLIC_SITE_URL       URL pública do site

import type { Locale } from './i18n';

export type LegalKind = 'privacy' | 'terms' | 'cookies';
export type LegalBlock = { h: string; p?: string[]; list?: string[]; table?: { head: string[]; rows: string[][] } };
export type LegalDoc = { title: string; updated: string; intro: string; sections: LegalBlock[] };

export const LEGAL_VERSION = '2026-10-15';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
const host = (() => {
  try {
    return new URL(siteUrl).hostname.replace(/^www\./, '');
  } catch {
    return 'hypeverso.com';
  }
})();
export const legalConfig = {
  siteName: 'Hypeverso',
  siteUrl,
  entity: process.env.NEXT_PUBLIC_LEGAL_ENTITY || 'Hypeverso',
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || `contato@${host}`,
  dpoEmail: process.env.NEXT_PUBLIC_DPO_EMAIL || process.env.NEXT_PUBLIC_CONTACT_EMAIL || `privacidade@${host}`,
};

const { siteName: S, entity: E, contactEmail: C, dpoEmail: D } = legalConfig;

const GOOGLE_LINKS = {
  adsSettings: 'https://adssettings.google.com',
  partnerSites: 'https://policies.google.com/technologies/partner-sites',
  googlePrivacy: 'https://policies.google.com/privacy',
  aboutAds: 'https://optout.aboutads.info',
  yourChoices: 'https://www.youronlinechoices.eu',
};

const cookieRowsPt: string[][] = [
  [
    'nv_refresh',
    'Necessário',
    `${S} (1ª parte)`,
    'Mantém a sessão autenticada com segurança (HttpOnly).',
    'Até 30 dias',
  ],
  [
    'nv_access',
    'Necessário',
    `${S} (1ª parte)`,
    'Token de acesso de curta duração da conta (HttpOnly, inacessível a scripts).',
    '15 minutos (renovado)',
  ],
  ['nv_csrf', 'Necessário', `${S} (1ª parte)`, 'Proteção contra falsificação de requisições (CSRF).', 'Até 30 dias'],
  [
    'Cache do app (service worker) e hv-favorites-snapshot',
    'Necessário',
    `${S} (1ª parte)`,
    'Funcionamento offline do app e leitura offline dos favoritos que você salvar.',
    'Até você limpar os dados do site',
  ],
  [
    'hv_cookie_consent / hyperverso_cookie_consent_v2',
    'Necessário',
    `${S} (1ª parte)`,
    'Registra suas escolhas de cookies.',
    '12 meses',
  ],
  ['hv_locale / hypeverso_locale', 'Necessário', `${S} (1ª parte)`, 'Lembra o idioma escolhido.', '12 meses'],
  [
    'nexverse-auth (armazenamento local)',
    'Necessário',
    `${S} (1ª parte)`,
    'Guarda dados básicos do perfil para exibir a interface.',
    'Até o logout',
  ],
  [
    '__gads, __gpi, __eoi',
    'Publicidade',
    'Google (3ª parte)',
    'Veiculação, limitação de frequência e medição de anúncios do Google AdSense.',
    'Até 13 meses',
  ],
  [
    'IDE, DSID, test_cookie (doubleclick.net)',
    'Publicidade',
    'Google (3ª parte)',
    'Anúncios personalizados e medição, somente com consentimento.',
    'Até 13 meses',
  ],
  [
    '_ga, _ga_* (se o Google Analytics for ativado)',
    'Análise',
    'Google (3ª parte)',
    'Estatísticas agregadas de uso, somente com consentimento.',
    'Até 2 anos',
  ],
];

const pt: Record<LegalKind, LegalDoc> = {
  privacy: {
    title: 'Política de Privacidade',
    updated: 'Última atualização: 15 de outubro de 2026',
    intro: `Esta Política de Privacidade explica como o ${S} (“nós”), operado por ${E}, coleta, usa, compartilha e protege dados pessoais de quem acessa ${siteUrl}, nossos aplicativos e serviços relacionados. Ela foi elaborada de acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD), o Marco Civil da Internet (Lei nº 12.965/2014) e, quando aplicável, o Regulamento Geral de Proteção de Dados europeu (GDPR) e as políticas de publicidade do Google.`,
    sections: [
      {
        h: '1. Quem é o controlador dos dados',
        p: [
          `O controlador dos dados pessoais tratados nesta plataforma é ${E}. Para qualquer assunto relacionado a privacidade, fale com nosso Encarregado pelo Tratamento de Dados Pessoais (DPO) pelo e-mail ${D}. Contato geral: ${C}.`,
        ],
      },
      {
        h: '2. Dados que coletamos',
        list: [
          'Dados de cadastro: nome, nome de usuário, e-mail, senha (armazenada apenas como hash criptográfico Argon2id) e, opcionalmente, foto de perfil e biografia.',
          'Conteúdo que você publica: comentários, publicações na comunidade, curtidas, reações, denúncias, favoritos, itens da biblioteca, avaliações e lembretes de lançamentos.',
          'Preferências: categorias de notícias seguidas, idioma, configurações de notificação, inscrição na newsletter, inscrições de notificações push do navegador (endereço técnico do serviço de push) e escolhas de cookies.',
          'Conteúdo público opcional: avaliações de filmes/séries/jogos, listas públicas, mensagens em discussões e watch parties e votos na triagem comunitária de denúncias.',
          'Segurança: dados da verificação em duas etapas (segredo TOTP cifrado e códigos de recuperação armazenados apenas como hash) e verificação anti-robô do Cloudflare Turnstile em cadastro, recuperação de senha e newsletter.',
          'Dados de navegação e técnicos: endereço IP, data e hora de acesso, páginas visitadas, artigos lidos, termos pesquisados, tipo de navegador e dispositivo, identificadores de sessão e registros de segurança. A guarda de registros de acesso por 6 meses é exigida pelo art. 15 do Marco Civil da Internet.',
          'Dados de pagamento (somente assinantes Premium): processados diretamente pela Stripe. Não armazenamos o número do seu cartão; recebemos apenas o status da assinatura e identificadores do cliente.',
          'Dados coletados por terceiros via cookies, como o Google, quando você autoriza (veja a seção 6 e a Política de Cookies).',
        ],
      },
      {
        h: '3. Para que usamos os dados e bases legais',
        table: {
          head: ['Finalidade', 'Base legal (LGPD)'],
          rows: [
            [
              'Criar e manter sua conta, autenticar o acesso e prestar os serviços solicitados',
              'Execução de contrato (art. 7º, V)',
            ],
            [
              'Segurança, prevenção a fraudes, spam e abuso; moderação de conteúdo e de imagens',
              'Legítimo interesse (art. 7º, IX) e proteção ao crédito/segurança',
            ],
            ['Guardar registros de acesso pelo prazo legal', 'Cumprimento de obrigação legal (art. 7º, II)'],
            [
              'Recomendações de notícias, histórico de leitura, ranking e conquistas',
              'Execução de contrato e legítimo interesse',
            ],
            [
              'Notificações e e-mails transacionais (confirmação de conta, redefinição de senha)',
              'Execução de contrato',
            ],
            ['Estatísticas de audiência por cookies de análise', 'Consentimento (art. 7º, I)'],
            ['Anúncios personalizados do Google AdSense', 'Consentimento (art. 7º, I)'],
            ['Anúncios não personalizados/contextuais', 'Legítimo interesse, respeitando suas escolhas de cookies'],
            ['Cobrança da assinatura Premium', 'Execução de contrato'],
          ],
        },
      },
      {
        h: '4. Compartilhamento de dados',
        p: ['Não vendemos dados pessoais. Compartilhamos dados apenas quando necessário com:'],
        list: [
          'Provedores de infraestrutura e hospedagem, banco de dados, e-mail transacional e armazenamento de mídia, sob contrato e obrigação de confidencialidade.',
          'Stripe, para processamento de pagamentos da assinatura Premium.',
          'Google (AdSense e, se ativado, Google Analytics), conforme as suas escolhas de cookies.',
          'Provedores de catálogo de mídia (TMDB, IGDB, AniList, Metron e Google Books), que recebem apenas os termos de busca de filmes, séries, jogos, animes e HQs — nunca seus dados de conta.',
          'Cloudflare (Turnstile), para verificar que formulários são enviados por pessoas; Google, Mozilla, Apple ou Microsoft, como serviços de push do seu navegador, apenas quando você ativa notificações; e o provedor de e-mail transacional para a newsletter.',
          'Lojas parceiras do programa de afiliados (ex.: Amazon), somente se você clicar em um link de compra: a partir daí vale a política da loja. Registramos apenas a contagem agregada de cliques.',
          'Autoridades públicas, mediante ordem judicial ou requisição legal válida.',
          'Em caso de reorganização societária, ao sucessor, que ficará obrigado a esta Política.',
        ],
      },
      {
        h: '5. Inteligência artificial',
        p: [
          `O ${S} usa modelos de IA executados em nossa própria infraestrutura para auxiliar a redação de notícias (sempre com revisão humana), gerar recomendações e moderar imagens enviadas. Imagens de perfil e da biblioteca passam por moderação automática antes de serem publicadas. Seus dados pessoais não são usados para treinar modelos de terceiros.`,
        ],
      },
      {
        h: '5.1 Newsletter e notificações push',
        list: [
          'A newsletter semanal usa confirmação dupla (double opt-in): só enviamos depois que você confirma pelo link recebido. Todo e-mail tem link de cancelamento em um clique.',
          'Notificações push só são ativadas com a permissão do navegador e podem ser desativadas a qualquer momento em Conta › Notificações ou nas configurações do navegador.',
          'Assinantes Premium navegam sem anúncios: para eles o script do Google AdSense nem é carregado.',
        ],
      },
      {
        h: '6. Publicidade do Google (AdSense)',
        p: ['Usamos o Google AdSense para exibir anúncios. Sobre isso, você deve saber que:'],
        list: [
          'Fornecedores terceiros, incluindo o Google, usam cookies para veicular anúncios com base em visitas anteriores do usuário a este site ou a outros sites.',
          'O uso de cookies de publicidade pelo Google permite que ele e seus parceiros veiculem anúncios com base nas suas visitas a este e/ou a outros sites na Internet.',
          `Você pode desativar a publicidade personalizada nas Configurações de anúncios do Google (${GOOGLE_LINKS.adsSettings}). Também é possível desativar cookies de fornecedores terceiros em ${GOOGLE_LINKS.aboutAds} ou, na Europa, em ${GOOGLE_LINKS.yourChoices}.`,
          `Para entender como o Google usa as informações de sites que utilizam seus serviços, acesse ${GOOGLE_LINKS.partnerSites}. A Política de Privacidade do Google está em ${GOOGLE_LINKS.googlePrivacy}.`,
          'Anúncios personalizados só são ativados depois que você aceita a categoria “Publicidade” no aviso de cookies. Se você recusar, o Google poderá exibir anúncios não personalizados, que usam apenas informações contextuais (como o conteúdo da página) e cookies estritamente necessários para controle de frequência, fraude e medição agregada.',
          'Implementamos o Modo de Consentimento do Google (Consent Mode v2): os sinais ad_storage, ad_user_data, ad_personalization e analytics_storage começam negados e só mudam conforme as suas escolhas.',
          'Para visitantes do Espaço Econômico Europeu, Reino Unido e Suíça, os anúncios personalizados só serão veiculados com uma plataforma de gestão de consentimento (CMP) certificada pelo Google e integrada ao IAB TCF, conforme exige a Política de Consentimento de Usuários da UE do Google.',
        ],
      },
      {
        h: '7. Cookies e tecnologias semelhantes',
        p: [
          'Usamos cookies e armazenamento local para manter você conectado, lembrar preferências, medir audiência (com consentimento) e exibir anúncios. Detalhes, a lista de cookies e como gerenciá-los estão na nossa Política de Cookies. Você pode alterar suas escolhas a qualquer momento pelo link “Configurar cookies” no rodapé.',
        ],
      },
      {
        h: '8. Por quanto tempo guardamos os dados',
        list: [
          'Dados da conta: enquanto a conta estiver ativa. Após a exclusão, os dados são apagados ou anonimizados em até 30 dias, salvo obrigação legal.',
          'Registros de acesso (IP, data e hora): 6 meses, conforme o Marco Civil da Internet.',
          'Dados de cobrança: pelo prazo exigido pela legislação fiscal (em regra, 5 anos).',
          'Eventos de análise: até 14 meses, de forma agregada sempre que possível.',
          'Escolhas de cookies: 12 meses; depois disso pediremos seu consentimento novamente.',
        ],
      },
      {
        h: '9. Seus direitos como titular',
        p: ['Nos termos do art. 18 da LGPD (e dos arts. 15 a 22 do GDPR, quando aplicável), você pode, gratuitamente:'],
        list: [
          'Confirmar a existência de tratamento e acessar seus dados — disponível também pelo botão “Exportar meus dados” em Conta › Privacidade.',
          'Corrigir dados incompletos, inexatos ou desatualizados, editando seu perfil.',
          'Solicitar anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade.',
          'Solicitar a portabilidade dos dados em formato estruturado (JSON).',
          'Excluir sua conta e os dados tratados com base em consentimento — disponível em Conta › Privacidade.',
          'Obter informações sobre com quem compartilhamos seus dados.',
          'Revogar o consentimento a qualquer momento (por exemplo, em “Configurar cookies”), sem afetar o tratamento já realizado.',
          'Opor-se a tratamentos realizados com base em legítimo interesse.',
          `Peticionar à Autoridade Nacional de Proteção de Dados (ANPD — gov.br/anpd). Antes, se preferir, fale conosco em ${D}; respondemos em até 15 dias.`,
        ],
      },
      {
        h: '10. Segurança',
        p: [
          'Adotamos medidas técnicas e organizacionais proporcionais ao risco, incluindo criptografia em trânsito (HTTPS), senhas com hash Argon2id, tokens de sessão rotativos, limitação de tentativas, controle de acesso por perfil, sanitização de conteúdo, moderação de imagens e registros de auditoria. Nenhum sistema é 100% seguro; em caso de incidente que possa gerar risco ou dano relevante, comunicaremos os titulares afetados e a ANPD, conforme o art. 48 da LGPD.',
        ],
      },
      {
        h: '11. Crianças e adolescentes',
        p: [
          `O ${S} não é direcionado a menores de 13 anos e não coletamos intencionalmente dados de crianças. Adolescentes entre 13 e 18 anos devem usar a plataforma com autorização e acompanhamento dos responsáveis. Não exibimos anúncios personalizados para usuários identificados como menores de idade. Se você acredita que coletamos dados de uma criança, escreva para ${D} para que possamos excluí-los.`,
        ],
      },
      {
        h: '12. Transferência internacional',
        p: [
          'Alguns fornecedores (como Google e Stripe) podem processar dados fora do Brasil. Nesses casos, a transferência ocorre com as garantias previstas nos arts. 33 a 36 da LGPD, como cláusulas contratuais padrão e países com nível adequado de proteção.',
        ],
      },
      {
        h: '13. Links externos',
        p: [
          'Nossos artigos podem conter links e conteúdos incorporados (vídeos, publicações de redes sociais) de outros sites, que têm suas próprias políticas. Não nos responsabilizamos pelas práticas de privacidade desses terceiros.',
        ],
      },
      {
        h: '14. Alterações nesta Política',
        p: [
          'Podemos atualizar esta Política para refletir mudanças no serviço, na lei ou nos fornecedores. A data da última atualização aparece no topo. Mudanças relevantes serão comunicadas no site ou por e-mail e, quando exigido, pediremos um novo consentimento.',
        ],
      },
      { h: '15. Contato', p: [`Encarregado (DPO): ${D}. Contato geral: ${C}. Controlador: ${E}.`] },
    ],
  },
  terms: {
    title: 'Termos de Uso',
    updated: 'Última atualização: 15 de outubro de 2026',
    intro: `Estes Termos de Uso regulam o acesso e o uso do ${S}, incluindo o site ${siteUrl}, o aplicativo e os serviços relacionados, oferecidos por ${E}. Ao criar uma conta ou utilizar a plataforma, você declara que leu, entendeu e concorda com estes Termos e com a Política de Privacidade. Se não concordar, não utilize o serviço.`,
    sections: [
      {
        h: '1. O serviço',
        p: [
          `O ${S} é uma plataforma de notícias, catálogo e comunidade sobre cinema, séries, games, animes, mangás, HQs e tecnologia. Parte do conteúdo é gratuita e financiada por publicidade; parte é exclusiva da assinatura Premium.`,
        ],
      },
      {
        h: '2. Cadastro e conta',
        list: [
          'Você deve ter pelo menos 13 anos. Menores de 18 anos precisam de autorização dos pais ou responsáveis.',
          'As informações fornecidas devem ser verdadeiras e atualizadas. É proibido se passar por outra pessoa.',
          'Você é responsável por manter a confidencialidade da sua senha e por toda atividade realizada na sua conta. Avise-nos imediatamente em caso de uso não autorizado.',
          'Cada pessoa pode manter apenas uma conta, salvo autorização expressa.',
        ],
      },
      {
        h: '3. Regras de conduta',
        p: ['Ao usar a plataforma, você concorda em não:'],
        list: [
          'Publicar conteúdo ilegal, difamatório, discriminatório, violento, sexualmente explícito, que incite ódio ou que envolva menores de forma imprópria.',
          'Assediar, ameaçar, perseguir ou expor dados pessoais de terceiros (doxxing).',
          'Publicar spam, correntes, golpes, links maliciosos, malware ou promoções não autorizadas.',
          'Violar direitos autorais, marcas ou outros direitos de propriedade intelectual — inclusive publicando spoilers vazados ou material pirateado.',
          'Burlar mecanismos de segurança, limites de uso, moderação ou paywall; fazer engenharia reversa, scraping massivo ou ataques à infraestrutura.',
          'Criar contas falsas, automatizadas ou manipular rankings, curtidas, XP e conquistas.',
          'Clicar ou incentivar cliques em anúncios de forma artificial, o que viola as políticas do Google AdSense.',
        ],
      },
      {
        h: '4. Conteúdo do usuário',
        p: [
          'Você mantém a titularidade do conteúdo que publica (comentários, publicações, imagens, avaliações). Ao publicá-lo, concede ao ' +
            S +
            ' uma licença não exclusiva, gratuita, mundial e pelo tempo em que o conteúdo permanecer na plataforma, para hospedar, reproduzir, exibir, adaptar ao formato técnico e distribuir esse conteúdo dentro do serviço.',
          'Você declara ter os direitos necessários sobre o que publica. Podemos remover, ocultar ou restringir conteúdos que violem estes Termos ou a lei, com ou sem aviso prévio, e responder a ordens judiciais nos termos do Marco Civil da Internet.',
        ],
      },
      {
        h: '5. Denúncias e moderação',
        p: [
          'Qualquer usuário pode denunciar comentários e publicações. Denúncias são analisadas pela equipe de moderação. Violações podem resultar em advertência, remoção de conteúdo, suspensão temporária ou banimento definitivo, conforme a gravidade e a reincidência.',
        ],
      },
      {
        h: '6. Conteúdo editorial e uso de IA',
        p: [
          `As notícias do ${S} podem ser produzidas com auxílio de inteligência artificial e sempre passam por revisão editorial humana antes da publicação, com indicação das fontes consultadas. Apesar do cuidado, o conteúdo tem caráter informativo e pode conter imprecisões; verifique informações importantes nas fontes originais. Encontrou um erro? Escreva para ${C}.`,
        ],
      },
      {
        h: '7. Propriedade intelectual',
        p: [
          `A marca ${S}, o logotipo, o layout, o código e os textos editoriais pertencem a ${E} ou aos respectivos licenciantes. Imagens de terceiros são usadas com licença compatível (ex.: Creative Commons) ou para fins jornalísticos, com os devidos créditos. Pôsteres, capas e metadados de catálogo pertencem aos seus titulares e são fornecidos por TMDB, IGDB, AniList, Metron e Google Books. Este produto usa a API do TMDB, mas não é endossado ou certificado pelo TMDB.`,
        ],
      },
      {
        h: '8. Assinatura Premium',
        list: [
          'A assinatura Premium dá acesso a conteúdos exclusivos e é cobrada de forma recorrente pela Stripe, no valor e periodicidade informados na página de contratação.',
          'Você pode cancelar a qualquer momento; o acesso permanece até o fim do período já pago.',
          'Nos termos do art. 49 do Código de Defesa do Consumidor, você pode desistir da contratação em até 7 dias após a primeira cobrança, com reembolso integral.',
          'Preços podem ser reajustados mediante aviso prévio de pelo menos 30 dias.',
        ],
      },
      {
        h: '8.1 Avaliações, listas e discussões',
        p: [
          'Avaliações, listas públicas e mensagens em discussões são conteúdo do usuário e seguem as regras de conduta. Marque spoilers (||assim|| ou a opção “contém spoiler”). Usuários experientes podem participar da triagem comunitária de denúncias; votos de má-fé reduzem a reputação de moderação e podem levar à perda do acesso à triagem.',
        ],
      },
      {
        h: '8.2 Links de afiliados',
        p: [
          `Algumas fichas do catálogo exibem links de compra de lojas parceiras. Se você comprar por eles, o ${S} pode receber uma comissão, sem custo extra para você. Os links são identificados como de afiliado; preço, entrega e atendimento são de responsabilidade da loja.`,
        ],
      },
      {
        h: '9. Publicidade',
        p: [
          'O serviço gratuito é mantido por anúncios, inclusive do Google AdSense. Os anunciantes são os únicos responsáveis pelos produtos e serviços anunciados. A exibição de anúncios personalizados depende do seu consentimento, conforme a Política de Cookies.',
        ],
      },
      {
        h: '10. Serviços e links de terceiros',
        p: [
          'A plataforma integra serviços de terceiros (Google, Stripe, YouTube, provedores de catálogo, entre outros), sujeitos aos próprios termos e políticas. Não controlamos e não nos responsabilizamos por conteúdos ou práticas desses serviços.',
        ],
      },
      {
        h: '11. Disponibilidade e limitação de responsabilidade',
        p: [
          'Empregamos esforços razoáveis para manter o serviço disponível e seguro, mas ele é oferecido “no estado em que se encontra”, podendo passar por interrupções para manutenção, atualizações ou por fatores fora do nosso controle. Na máxima extensão permitida pela lei, não respondemos por danos indiretos, lucros cessantes ou perda de dados decorrentes do uso ou da impossibilidade de uso da plataforma, nem por conteúdo publicado por usuários. Nada nestes Termos limita direitos garantidos pelo Código de Defesa do Consumidor.',
        ],
      },
      {
        h: '12. Encerramento da conta',
        p: [
          'Você pode excluir sua conta a qualquer momento em Conta › Privacidade. Podemos suspender ou encerrar contas que violem estes Termos ou a lei. Após o encerramento, alguns dados podem ser mantidos pelos prazos legais descritos na Política de Privacidade.',
        ],
      },
      {
        h: '13. Alterações dos Termos',
        p: [
          'Podemos alterar estes Termos a qualquer tempo. A versão vigente estará sempre nesta página, com a data de atualização. Mudanças relevantes serão comunicadas com antecedência razoável; o uso continuado após a vigência significa concordância.',
        ],
      },
      {
        h: '14. Lei aplicável e foro',
        p: [
          'Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro do domicílio do consumidor para dirimir eventuais controvérsias, conforme o Código de Defesa do Consumidor.',
        ],
      },
      { h: '15. Contato', p: [`Dúvidas sobre estes Termos: ${C}.`] },
    ],
  },
  cookies: {
    title: 'Política de Cookies',
    updated: 'Última atualização: 15 de outubro de 2026',
    intro: `Esta Política explica o que são cookies, quais usamos no ${S}, para que servem e como você pode controlá-los. Ela complementa a nossa Política de Privacidade.`,
    sections: [
      {
        h: '1. O que são cookies',
        p: [
          'Cookies são pequenos arquivos de texto gravados no seu navegador quando você visita um site. Tecnologias semelhantes incluem o armazenamento local (localStorage), pixels e identificadores de dispositivo. Cookies “de primeira parte” são definidos pelo próprio ' +
            S +
            '; cookies “de terceiros” são definidos por outros domínios, como os do Google.',
        ],
      },
      {
        h: '2. Categorias que usamos',
        list: [
          'Necessários (sempre ativos): essenciais para login, segurança, prevenção a fraudes, idioma e para lembrar suas escolhas de cookies. Sem eles o site não funciona corretamente, por isso não dependem de consentimento.',
          'Análise (opcional): ajudam a entender como o site é usado — páginas mais vistas, tempo de carregamento e erros — de forma agregada.',
          'Personalização (opcional): lembram interesses para recomendar conteúdos mais relevantes.',
          'Publicidade (opcional): permitem que o Google e parceiros exibam anúncios personalizados com base em visitas anteriores a este e a outros sites, além de medir o desempenho dos anúncios.',
        ],
      },
      {
        h: '3. Lista de cookies',
        table: { head: ['Nome', 'Categoria', 'Fornecedor', 'Finalidade', 'Duração'], rows: cookieRowsPt },
      },
      {
        h: '4. Cookies do Google e Modo de Consentimento',
        p: [
          `Usamos o Google AdSense. Fornecedores terceiros, incluindo o Google, usam cookies para veicular anúncios com base em visitas anteriores a este site ou a outros sites. O cookie de publicidade do Google permite que ele e seus parceiros veiculem anúncios com base nas suas visitas a este e/ou a outros sites na Internet.`,
          'Seguimos o Modo de Consentimento do Google v2: até que você escolha, os sinais de armazenamento de anúncios, dados de usuário para anúncios, personalização de anúncios e análise ficam negados. Se você recusar a publicidade, o Google pode exibir anúncios não personalizados, que não usam seu histórico de navegação.',
          `Você pode desativar anúncios personalizados em ${GOOGLE_LINKS.adsSettings} e cookies de outros fornecedores em ${GOOGLE_LINKS.aboutAds}. Saiba mais em ${GOOGLE_LINKS.partnerSites}.`,
        ],
      },
      {
        h: '5. Como gerenciar suas escolhas',
        list: [
          'Pelo aviso de cookies: “Aceitar todos”, “Recusar opcionais” ou “Personalizar” por categoria. Fechar o aviso equivale a recusar os opcionais.',
          'A qualquer momento, pelo link “Configurar cookies” no rodapé de todas as páginas.',
          'Pelo navegador, bloqueando ou apagando cookies (Chrome, Firefox, Safari e Edge têm essa opção nas configurações de privacidade). Bloquear cookies necessários pode impedir o login.',
          'Suas escolhas valem por 12 meses ou até você alterá-las; quando esta Política mudar de forma relevante, pediremos o consentimento novamente.',
        ],
      },
      { h: '6. Contato', p: [`Dúvidas sobre cookies: ${D}.`] },
    ],
  },
};

const cookieRowsEn: string[][] = cookieRowsPt.map(([n, c, v, f, d]) => [
  n,
  ({ Necessário: 'Necessary', Publicidade: 'Advertising', Análise: 'Analytics' } as Record<string, string>)[c] || c,
  v.replace('1ª parte', 'first party').replace('3ª parte', 'third party'),
  (
    {
      'Mantém a sessão autenticada com segurança (HttpOnly).': 'Keeps your authenticated session secure (HttpOnly).',
      'Token de acesso de curta duração da conta (HttpOnly, inacessível a scripts).':
        'Short-lived account access token (HttpOnly, not readable by scripts).',
      'Proteção contra falsificação de requisições (CSRF).': 'Protection against cross-site request forgery (CSRF).',
      'Funcionamento offline do app e leitura offline dos favoritos que você salvar.':
        'Offline app support and offline reading of saved favourites.',
      'Token de acesso de curta duração da conta.': 'Short-lived account access token.',
      'Registra suas escolhas de cookies.': 'Stores your cookie choices.',
      'Lembra o idioma escolhido.': 'Remembers your language.',
      'Guarda dados básicos do perfil para exibir a interface.': 'Stores basic profile data to render the interface.',
      'Veiculação, limitação de frequência e medição de anúncios do Google AdSense.':
        'Google AdSense ad delivery, frequency capping and measurement.',
      'Anúncios personalizados e medição, somente com consentimento.':
        'Personalised ads and measurement, only with consent.',
      'Estatísticas agregadas de uso, somente com consentimento.': 'Aggregated usage statistics, only with consent.',
    } as Record<string, string>
  )[f] || f,
  d
    .replace('Até', 'Up to')
    .replace('dias', 'days')
    .replace('meses', 'months')
    .replace('anos', 'years')
    .replace('minutos (renovado)', 'minutes (renewed)')
    .replace('Até o logout', 'Until logout')
    .replace('Up to você limpar os dados do site', 'Until you clear site data')
    .replace('Up to o logout', 'Until logout'),
]);

const en: Record<LegalKind, LegalDoc> = {
  privacy: {
    title: 'Privacy Policy',
    updated: 'Last updated: October 15, 2026',
    intro: `This Privacy Policy explains how ${S} (“we”), operated by ${E}, collects, uses, shares and protects personal data of people who access ${siteUrl}, our apps and related services. It follows the Brazilian General Data Protection Law (LGPD), the Brazilian Internet Civil Framework and, where applicable, the EU GDPR and Google’s advertising policies.`,
    sections: [
      {
        h: '1. Data controller',
        p: [
          `The controller is ${E}. For privacy matters contact our Data Protection Officer at ${D}. General contact: ${C}.`,
        ],
      },
      {
        h: '2. Data we collect',
        list: [
          'Account data: name, username, e-mail, password (stored only as an Argon2id hash) and, optionally, avatar and bio.',
          'Content you publish: comments, community posts, likes, reactions, reports, favourites, library items, ratings and release reminders.',
          'Preferences: followed news categories, language, notification settings and cookie choices.',
          'Technical data: IP address, date and time, pages visited, articles read, searches, browser and device type, session identifiers and security logs (access logs are kept for 6 months as required by Brazilian law).',
          'Payment data (Premium only): processed directly by Stripe. We never store your card number.',
          'Data collected by third parties through cookies, such as Google, when you allow it (see section 6).',
        ],
      },
      {
        h: '3. Purposes and legal bases',
        table: {
          head: ['Purpose', 'Legal basis'],
          rows: [
            ['Account, authentication and requested services', 'Performance of contract'],
            ['Security, fraud/spam prevention, content and image moderation', 'Legitimate interest'],
            ['Keeping access logs for the legal period', 'Legal obligation'],
            ['Recommendations, reading history, rankings and achievements', 'Contract and legitimate interest'],
            ['Transactional e-mails and notifications', 'Performance of contract'],
            ['Analytics cookies', 'Consent'],
            ['Personalised Google AdSense ads', 'Consent'],
            ['Non-personalised/contextual ads', 'Legitimate interest, respecting your cookie choices'],
            ['Premium billing', 'Performance of contract'],
          ],
        },
      },
      {
        h: '4. Sharing',
        p: [
          'We do not sell personal data. We share it only when necessary with hosting/infrastructure and e-mail providers, Stripe (payments), Google (AdSense/Analytics, according to your choices), catalogue providers (TMDB, IGDB, AniList, Metron, Google Books — search terms only), public authorities under a valid legal order, and a successor in case of corporate reorganisation.',
        ],
      },
      {
        h: '5. Artificial intelligence',
        p: [
          `${S} uses AI models running on our own infrastructure to assist news writing (always reviewed by humans), recommendations and image moderation. Your personal data is not used to train third-party models.`,
        ],
      },
      {
        h: '6. Google advertising (AdSense)',
        list: [
          'Third-party vendors, including Google, use cookies to serve ads based on a user’s prior visits to this website or other websites.',
          'Google’s use of advertising cookies enables it and its partners to serve ads to users based on their visit to this site and/or other sites on the Internet.',
          `You may opt out of personalised advertising by visiting Google Ads Settings (${GOOGLE_LINKS.adsSettings}), or opt out of third-party vendors’ cookies at ${GOOGLE_LINKS.aboutAds} or ${GOOGLE_LINKS.yourChoices}.`,
          `Learn how Google uses information from sites that use its services at ${GOOGLE_LINKS.partnerSites}.`,
          'Personalised ads are only enabled after you accept the “Advertising” category. If you decline, Google may show non-personalised ads based on context only.',
          'We implement Google Consent Mode v2: ad_storage, ad_user_data, ad_personalization and analytics_storage start as denied.',
          'For visitors in the EEA, the UK and Switzerland, personalised ads are only served through a Google-certified CMP integrated with the IAB TCF, as required by Google’s EU User Consent Policy.',
        ],
      },
      {
        h: '7. Cookies',
        p: [
          'See our Cookie Policy for the full list and how to manage them. You can change your choices at any time via “Cookie settings” in the footer.',
        ],
      },
      {
        h: '8. Retention',
        list: [
          'Account data: while the account is active; deleted or anonymised within 30 days after deletion, unless required by law.',
          'Access logs: 6 months. Billing data: as required by tax law (usually 5 years).',
          'Analytics events: up to 14 months. Cookie choices: 12 months.',
        ],
      },
      {
        h: '9. Your rights',
        list: [
          'Access and portability — use “Export my data” in Account › Privacy.',
          'Correction, anonymisation, blocking or deletion — including deleting your account in Account › Privacy.',
          'Information about sharing, withdrawal of consent at any time, and objection to legitimate-interest processing.',
          `Complaint to the Brazilian authority (ANPD) or your local data protection authority. Contact us first at ${D}; we reply within 15 days.`,
        ],
      },
      {
        h: '10. Security',
        p: [
          'We use HTTPS, Argon2id password hashing, rotating session tokens, rate limiting, role-based access control, content sanitisation, image moderation and audit logs. Relevant incidents will be notified to affected users and authorities as required by law.',
        ],
      },
      {
        h: '11. Children',
        p: [
          `${S} is not directed to children under 13. Teenagers must use it with parental consent. We do not show personalised ads to users identified as minors. Contact ${D} to delete data collected from a child.`,
        ],
      },
      {
        h: '12. International transfers',
        p: [
          'Some providers (e.g. Google, Stripe) may process data outside Brazil, with safeguards such as standard contractual clauses.',
        ],
      },
      {
        h: '13. Changes',
        p: [
          'We may update this Policy; the date at the top shows the latest version. Relevant changes will be announced and, where required, consent will be requested again.',
        ],
      },
      { h: '14. Contact', p: [`DPO: ${D}. General: ${C}. Controller: ${E}.`] },
    ],
  },
  terms: {
    title: 'Terms of Use',
    updated: 'Last updated: October 15, 2026',
    intro: `These Terms govern access to and use of ${S} (${siteUrl}), its app and related services, provided by ${E}. By creating an account or using the platform you agree to these Terms and to the Privacy Policy.`,
    sections: [
      {
        h: '1. The service',
        p: [
          `${S} is a news, catalogue and community platform about movies, series, games, anime, manga, comics and technology. Part of the content is free and ad-supported; part is exclusive to Premium.`,
        ],
      },
      {
        h: '2. Account',
        list: [
          'You must be at least 13; minors need parental consent.',
          'Provide accurate information and do not impersonate others.',
          'Keep your password confidential; you are responsible for activity in your account.',
          'One account per person unless expressly authorised.',
        ],
      },
      {
        h: '3. Conduct',
        list: [
          'No illegal, defamatory, hateful, violent or sexually explicit content.',
          'No harassment, threats or doxxing.',
          'No spam, scams, malware or unauthorised promotion.',
          'No copyright infringement, piracy or leaked material.',
          'No bypassing security, rate limits, moderation or paywall; no mass scraping or attacks.',
          'No fake/automated accounts or manipulation of rankings, likes, XP or achievements.',
          'No artificial clicks on ads, which violates Google AdSense policies.',
        ],
      },
      {
        h: '4. User content',
        p: [
          `You keep ownership of what you publish and grant ${S} a non-exclusive, royalty-free, worldwide licence to host, display, adapt and distribute it within the service while it remains published. We may remove content that violates these Terms or the law.`,
        ],
      },
      {
        h: '5. Reports and moderation',
        p: [
          'Reports are reviewed by moderators. Violations may lead to warnings, removal, suspension or permanent bans.',
        ],
      },
      {
        h: '6. Editorial content and AI',
        p: [
          `News may be produced with AI assistance and is always reviewed by humans, with sources cited. Content is informational and may contain inaccuracies. Report errors to ${C}.`,
        ],
      },
      {
        h: '7. Intellectual property',
        p: [
          `The ${S} brand, logo, layout, code and editorial texts belong to ${E} or its licensors. Third-party images are used under compatible licences or for journalistic purposes, with credits. Catalogue data is provided by TMDB, IGDB, AniList, Metron and Google Books. This product uses the TMDB API but is not endorsed or certified by TMDB.`,
        ],
      },
      {
        h: '8. Premium',
        list: [
          'Recurring billing through Stripe at the price shown at checkout.',
          'Cancel anytime; access remains until the end of the paid period.',
          'Brazilian consumers may withdraw within 7 days of the first charge for a full refund (CDC art. 49).',
          'Price changes are notified at least 30 days in advance.',
        ],
      },
      {
        h: '9. Advertising',
        p: [
          'The free service is supported by ads, including Google AdSense. Advertisers are solely responsible for what they advertise. Personalised ads depend on your consent.',
        ],
      },
      {
        h: '10. Liability',
        p: [
          'The service is provided “as is”. To the extent permitted by law we are not liable for indirect damages, lost profits or data loss, nor for user-generated content. Nothing here limits mandatory consumer rights.',
        ],
      },
      {
        h: '11. Termination',
        p: [
          'You may delete your account anytime in Account › Privacy. We may suspend or terminate accounts that violate these Terms.',
        ],
      },
      {
        h: '12. Changes, law and venue',
        p: [
          'We may update these Terms; the current version is always on this page. These Terms are governed by Brazilian law, with venue at the consumer’s domicile.',
        ],
      },
      { h: '13. Contact', p: [`${C}`] },
    ],
  },
  cookies: {
    title: 'Cookie Policy',
    updated: 'Last updated: October 15, 2026',
    intro: `This Policy explains which cookies ${S} uses, why, and how you can control them.`,
    sections: [
      {
        h: '1. What cookies are',
        p: [
          'Cookies are small text files stored by your browser. Similar technologies include localStorage, pixels and device identifiers. First-party cookies are set by us; third-party cookies are set by other domains such as Google.',
        ],
      },
      {
        h: '2. Categories',
        list: [
          'Necessary (always on): sign-in, security, fraud prevention, language and storing your consent.',
          'Analytics (optional): aggregated usage and performance statistics.',
          'Personalisation (optional): remembers interests to recommend content.',
          'Advertising (optional): lets Google and partners show personalised ads based on prior visits and measure ad performance.',
        ],
      },
      {
        h: '3. Cookie list',
        table: { head: ['Name', 'Category', 'Provider', 'Purpose', 'Duration'], rows: cookieRowsEn },
      },
      {
        h: '4. Google cookies and Consent Mode',
        p: [
          'Third-party vendors, including Google, use cookies to serve ads based on prior visits to this or other websites. Google’s advertising cookies enable it and its partners to serve ads based on visits to this and/or other sites.',
          'We follow Google Consent Mode v2: all ad and analytics signals are denied until you choose. If you decline advertising, Google may still show non-personalised ads.',
          `Opt out of personalised ads at ${GOOGLE_LINKS.adsSettings} and of other vendors at ${GOOGLE_LINKS.aboutAds}. More at ${GOOGLE_LINKS.partnerSites}.`,
        ],
      },
      {
        h: '5. Managing your choices',
        list: [
          'Use the cookie banner (“Accept all”, “Reject optional” or “Customise”). Closing the banner equals rejecting optional cookies.',
          'Change anytime via “Cookie settings” in the footer.',
          'Block or delete cookies in your browser settings (blocking necessary cookies may break sign-in).',
          'Choices last 12 months or until changed; we ask again when this Policy changes materially.',
        ],
      },
      { h: '6. Contact', p: [`${D}`] },
    ],
  },
};

const es: Record<LegalKind, LegalDoc> = {
  privacy: {
    title: 'Política de Privacidad',
    updated: 'Última actualización: 15 de octubre de 2026',
    intro: `Esta Política explica cómo ${S}, operado por ${E}, recopila, usa, comparte y protege los datos personales de quienes acceden a ${siteUrl} y servicios relacionados, conforme a la LGPD brasileña y, cuando corresponda, al RGPD europeo y las políticas publicitarias de Google.`,
    sections: [
      { h: '1. Responsable', p: [`Responsable: ${E}. Delegado de Protección de Datos: ${D}. Contacto general: ${C}.`] },
      {
        h: '2. Datos que recopilamos',
        list: [
          'Datos de cuenta: nombre, usuario, e-mail, contraseña (solo como hash Argon2id), avatar y biografía opcionales.',
          'Contenido publicado: comentarios, publicaciones, reacciones, denuncias, favoritos, biblioteca y recordatorios.',
          'Preferencias: categorías, idioma, notificaciones y elecciones de cookies.',
          'Datos técnicos: IP, fecha y hora, páginas, búsquedas, navegador, dispositivo y registros de seguridad (registros de acceso por 6 meses).',
          'Pagos Premium: procesados por Stripe; no guardamos tu tarjeta.',
          'Datos recogidos por terceros mediante cookies, como Google, si lo autorizas.',
        ],
      },
      {
        h: '3. Finalidades y bases legales',
        table: {
          head: ['Finalidad', 'Base legal'],
          rows: [
            ['Cuenta y servicios solicitados', 'Ejecución de contrato'],
            ['Seguridad, fraude, moderación', 'Interés legítimo'],
            ['Registros de acceso', 'Obligación legal'],
            ['Recomendaciones y ranking', 'Contrato e interés legítimo'],
            ['Cookies de analítica', 'Consentimiento'],
            ['Anuncios personalizados de Google AdSense', 'Consentimiento'],
            ['Anuncios no personalizados', 'Interés legítimo'],
            ['Cobro Premium', 'Ejecución de contrato'],
          ],
        },
      },
      {
        h: '4. Compartición',
        p: [
          'No vendemos datos. Solo compartimos con proveedores de infraestructura, Stripe, Google (según tus elecciones), proveedores de catálogo (solo términos de búsqueda) y autoridades con orden legal válida.',
        ],
      },
      {
        h: '5. Inteligencia artificial',
        p: [
          'Usamos IA en infraestructura propia para asistir la redacción (con revisión humana), recomendaciones y moderación de imágenes. No usamos tus datos para entrenar modelos de terceros.',
        ],
      },
      {
        h: '6. Publicidad de Google (AdSense)',
        list: [
          'Proveedores externos, incluido Google, utilizan cookies para mostrar anuncios basados en las visitas anteriores del usuario a este u otros sitios web.',
          'El uso de cookies publicitarias por parte de Google le permite a él y a sus socios mostrar anuncios basados en las visitas a este y/u otros sitios de Internet.',
          `Puedes inhabilitar la publicidad personalizada en ${GOOGLE_LINKS.adsSettings} o las cookies de otros proveedores en ${GOOGLE_LINKS.aboutAds} / ${GOOGLE_LINKS.yourChoices}.`,
          `Cómo usa Google la información: ${GOOGLE_LINKS.partnerSites}.`,
          'Los anuncios personalizados solo se activan si aceptas la categoría “Publicidad”. Aplicamos Google Consent Mode v2 con todas las señales denegadas por defecto.',
          'En el EEE, Reino Unido y Suiza solo se mostrarán anuncios personalizados mediante una CMP certificada por Google e integrada con el TCF de IAB.',
        ],
      },
      {
        h: '7. Cookies',
        p: [
          'Consulta la Política de Cookies. Puedes cambiar tus elecciones en “Configurar cookies” en el pie de página.',
        ],
      },
      {
        h: '8. Conservación',
        list: [
          'Cuenta: mientras esté activa; se elimina o anonimiza en 30 días tras la baja.',
          'Registros de acceso: 6 meses. Facturación: según la ley fiscal.',
          'Analítica: hasta 14 meses. Elecciones de cookies: 12 meses.',
        ],
      },
      {
        h: '9. Tus derechos',
        list: [
          'Acceso y portabilidad: “Exportar mis datos” en Cuenta › Privacidad.',
          'Rectificación, supresión (incluida la eliminación de la cuenta), oposición y revocación del consentimiento.',
          `Reclamación ante la autoridad de protección de datos. Escríbenos antes a ${D}; respondemos en 15 días.`,
        ],
      },
      {
        h: '10. Seguridad',
        p: [
          'HTTPS, hash Argon2id, tokens rotativos, límites de uso, control de acceso por roles, sanitización y moderación.',
        ],
      },
      {
        h: '11. Menores',
        p: [
          `No dirigido a menores de 13 años. No mostramos anuncios personalizados a menores identificados. Contacto: ${D}.`,
        ],
      },
      { h: '12. Cambios y contacto', p: [`Podemos actualizar esta Política. DPO: ${D}. Contacto: ${C}.`] },
    ],
  },
  terms: {
    title: 'Términos de Uso',
    updated: 'Última actualización: 15 de octubre de 2026',
    intro: `Estos Términos regulan el uso de ${S} (${siteUrl}), ofrecido por ${E}. Al usar la plataforma aceptas estos Términos y la Política de Privacidad.`,
    sections: [
      {
        h: '1. Servicio',
        p: ['Plataforma de noticias, catálogo y comunidad geek, gratuita con publicidad y con contenido Premium.'],
      },
      {
        h: '2. Cuenta',
        list: [
          'Edad mínima: 13 años; menores con autorización de sus padres.',
          'Datos veraces; prohibido suplantar a otros.',
          'Eres responsable de tu contraseña y de la actividad de tu cuenta.',
        ],
      },
      {
        h: '3. Conducta',
        list: [
          'Nada ilegal, difamatorio, de odio, violento o sexualmente explícito.',
          'Sin acoso, amenazas ni doxxing.',
          'Sin spam, estafas ni malware.',
          'Sin infringir derechos de autor ni piratería.',
          'Sin eludir seguridad, moderación o paywall; sin scraping masivo.',
          'Sin cuentas falsas ni manipulación de rankings.',
          'Sin clics artificiales en anuncios (viola las políticas de Google AdSense).',
        ],
      },
      {
        h: '4. Contenido del usuario',
        p: [
          `Conservas tus derechos y otorgas a ${S} una licencia no exclusiva y gratuita para alojar, mostrar y distribuir el contenido dentro del servicio. Podemos retirar contenido que infrinja estos Términos.`,
        ],
      },
      {
        h: '5. Contenido editorial e IA',
        p: [
          'Las noticias pueden producirse con ayuda de IA y siempre se revisan por humanos. Verifica información importante en las fuentes.',
        ],
      },
      {
        h: '6. Propiedad intelectual',
        p: [
          `Marca, código y textos pertenecen a ${E}. Datos de catálogo de TMDB, IGDB, AniList, Metron y Google Books. Este producto usa la API de TMDB pero no está respaldado por TMDB.`,
        ],
      },
      {
        h: '7. Premium',
        list: [
          'Cobro recurrente vía Stripe.',
          'Cancela cuando quieras; el acceso sigue hasta el final del período pagado.',
          'Derecho de desistimiento de 7 días (CDC art. 49).',
        ],
      },
      {
        h: '8. Publicidad y terceros',
        p: [
          'El servicio gratuito se financia con anuncios, incluido Google AdSense. Los servicios de terceros tienen sus propios términos.',
        ],
      },
      {
        h: '9. Responsabilidad',
        p: [
          'Servicio “tal cual”; no respondemos por daños indirectos ni por contenido de usuarios, salvo lo que exija la ley del consumidor.',
        ],
      },
      {
        h: '10. Baja, cambios y ley aplicable',
        p: [
          'Puedes eliminar tu cuenta en Cuenta › Privacidad. Podemos actualizar estos Términos. Rige la ley brasileña, con fuero en el domicilio del consumidor.',
        ],
      },
      { h: '11. Contacto', p: [`${C}`] },
    ],
  },
  cookies: {
    title: 'Política de Cookies',
    updated: 'Última actualización: 15 de octubre de 2026',
    intro: `Esta Política explica qué cookies usa ${S}, para qué y cómo controlarlas.`,
    sections: [
      {
        h: '1. Qué son',
        p: ['Pequeños archivos de texto guardados por el navegador. También usamos almacenamiento local.'],
      },
      {
        h: '2. Categorías',
        list: [
          'Necesarias (siempre activas): inicio de sesión, seguridad, idioma y registro del consentimiento.',
          'Analítica (opcional): estadísticas agregadas.',
          'Personalización (opcional): recomendaciones.',
          'Publicidad (opcional): anuncios personalizados de Google y medición.',
        ],
      },
      {
        h: '3. Lista de cookies',
        table: { head: ['Nombre', 'Categoría', 'Proveedor', 'Finalidad', 'Duración'], rows: cookieRowsEn },
      },
      {
        h: '4. Google y Consent Mode',
        p: [
          'Proveedores externos, incluido Google, utilizan cookies para mostrar anuncios basados en visitas anteriores a este u otros sitios. Aplicamos Google Consent Mode v2: todas las señales comienzan denegadas.',
          `Desactiva anuncios personalizados en ${GOOGLE_LINKS.adsSettings} y cookies de otros proveedores en ${GOOGLE_LINKS.aboutAds}.`,
        ],
      },
      {
        h: '5. Gestión',
        list: [
          'Usa el aviso (“Aceptar todo”, “Rechazar opcionales”, “Personalizar”). Cerrarlo equivale a rechazar.',
          'Cambia tus elecciones en “Configurar cookies” en el pie de página.',
          'Bloquea o borra cookies en el navegador.',
          'Las elecciones valen 12 meses.',
        ],
      },
      { h: '6. Contacto', p: [`${D}`] },
    ],
  },
};

const docs: Record<Locale, Record<LegalKind, LegalDoc>> = { 'pt-BR': pt, en, es };

export function getLegalDoc(kind: LegalKind, locale: Locale = 'pt-BR'): LegalDoc {
  return (docs[locale] || pt)[kind];
}

export const legalRoutes: Record<LegalKind, string> = {
  privacy: '/politica-de-privacidade',
  terms: '/termos-de-uso',
  cookies: '/politica-de-cookies',
};
