'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Locale = 'pt-BR' | 'en' | 'es';
const STORAGE_KEY = 'hypeverso_locale';
const COOKIE_KEY = 'hv_locale';

const messages = {
  'pt-BR': {
    news: 'Notícias',
    community: 'Comunidade',
    explore: 'Explorar',
    calendar: 'Calendário',
    library: 'Biblioteca',
    ranking: 'Ranking',
    shop: 'Shop',
    search: 'Buscar',
    favorites: 'Favoritos',
    admin: 'Admin',
    logout: 'Sair',
    login: 'Entrar',
    language: 'Idioma',
    menu: 'Menu',
    myProfile: 'Meu perfil',
    footerTagline: 'Universo geek em uma só plataforma.',
    privacy: 'Política de Privacidade',
    terms: 'Termos de Uso',
    cookies: 'Política de Cookies',
    cookieSettings: 'Configurar cookies',
    portal: 'Portal',
    newsTitle: 'Notícias e conteúdos',
    newsDesc: 'Cinema, séries, games, anime, HQs, tecnologia e cultura pop.',
    emptyNews: 'Nenhum conteúdo publicado ainda.',
    loadingNews: 'Atualizando notícias...',
    lists: 'Listas',
    discussions: 'Discussões',
    newsletter: 'Newsletter',
    triage: 'Triagem',
    cookieGoogleHow: 'Como o Google usa dados',
    cookieCloseReject: 'Fechar e recusar opcionais',
    cookieNecessaryDesc: 'Login, segurança, idioma e registro das suas escolhas.',
    cookieAnalyticsDesc: 'Estatísticas agregadas de uso e desempenho.',
    cookiePersonalizationDesc: 'Recomendações com base nos seus interesses.',
    cookieAdsDesc:
      'Anúncios personalizados do Google AdSense e medição. Sem isso, os anúncios podem continuar aparecendo, mas não personalizados.',
    legalOpenPage: 'Abrir página completa',
    legalUnderstood: 'Entendi',
    contact: 'Contato',
    about: 'Sobre',
    acceptTermsPrefix: 'Li e aceito os',
    acceptTermsAnd: 'e a',
    acceptTermsRequired: 'Você precisa aceitar os Termos de Uso e a Política de Privacidade.',
    privacyCenter: 'Privacidade e dados',
    cookieTitle: 'Sua privacidade importa',
    cookieText:
      'Usamos cookies necessários para login, segurança e preferências. Com a sua permissão, também usamos cookies de análise, personalização e publicidade — inclusive do Google AdSense, que pode exibir anúncios com base em visitas anteriores a este e a outros sites. Você pode mudar de ideia quando quiser em “Configurar cookies”.',
    cookieAccept: 'Aceitar todos',
    cookieReject: 'Recusar opcionais',
    cookieCustomize: 'Personalizar',
    cookieSave: 'Salvar preferências',
    necessary: 'Necessários',
    analytics: 'Análise',
    personalization: 'Personalização',
    ads: 'Publicidade',
    alwaysOn: 'Sempre ativos',
    close: 'Fechar',
  },
  en: {
    news: 'News',
    community: 'Community',
    explore: 'Explore',
    calendar: 'Calendar',
    library: 'Library',
    ranking: 'Ranking',
    shop: 'Shop',
    search: 'Search',
    favorites: 'Favorites',
    admin: 'Admin',
    logout: 'Sign out',
    login: 'Sign in',
    language: 'Language',
    menu: 'Menu',
    myProfile: 'My profile',
    footerTagline: 'The geek universe in one platform.',
    privacy: 'Privacy Policy',
    terms: 'Terms of Use',
    cookies: 'Cookie Policy',
    cookieSettings: 'Cookie settings',
    portal: 'Portal',
    newsTitle: 'News and content',
    newsDesc: 'Movies, TV, games, anime, comics, technology and pop culture.',
    emptyNews: 'No published content yet.',
    loadingNews: 'Updating news...',
    lists: 'Lists',
    discussions: 'Discussions',
    newsletter: 'Newsletter',
    triage: 'Triage',
    cookieGoogleHow: 'How Google uses data',
    cookieCloseReject: 'Close and reject optional',
    cookieNecessaryDesc: 'Sign-in, security, language and storing your choices.',
    cookieAnalyticsDesc: 'Aggregated usage and performance statistics.',
    cookiePersonalizationDesc: 'Recommendations based on your interests.',
    cookieAdsDesc:
      'Personalised Google AdSense ads and measurement. Without it, ads may still appear but not personalised.',
    legalOpenPage: 'Open full page',
    legalUnderstood: 'Got it',
    contact: 'Contact',
    about: 'About',
    acceptTermsPrefix: 'I have read and accept the',
    acceptTermsAnd: 'and the',
    acceptTermsRequired: 'You must accept the Terms of Use and the Privacy Policy.',
    privacyCenter: 'Privacy & data',
    cookieTitle: 'Your privacy matters',
    cookieText:
      'We use necessary cookies for sign-in, security and preferences. With your permission we also use analytics, personalisation and advertising cookies — including Google AdSense, which may show ads based on prior visits to this and other sites. You can change your mind anytime in “Cookie settings”.',
    cookieAccept: 'Accept all',
    cookieReject: 'Reject optional',
    cookieCustomize: 'Customize',
    cookieSave: 'Save preferences',
    necessary: 'Necessary',
    analytics: 'Analytics',
    personalization: 'Personalization',
    ads: 'Advertising',
    alwaysOn: 'Always on',
    close: 'Close',
  },
  es: {
    news: 'Noticias',
    community: 'Comunidad',
    explore: 'Explorar',
    calendar: 'Calendario',
    library: 'Biblioteca',
    ranking: 'Ranking',
    shop: 'Shop',
    search: 'Buscar',
    favorites: 'Favoritos',
    admin: 'Admin',
    logout: 'Salir',
    login: 'Entrar',
    language: 'Idioma',
    menu: 'Menú',
    myProfile: 'Mi perfil',
    footerTagline: 'El universo geek en una sola plataforma.',
    privacy: 'Política de Privacidad',
    terms: 'Términos de Uso',
    cookies: 'Política de Cookies',
    cookieSettings: 'Configurar cookies',
    portal: 'Portal',
    newsTitle: 'Noticias y contenidos',
    newsDesc: 'Cine, series, videojuegos, anime, cómics, tecnología y cultura pop.',
    emptyNews: 'Todavía no hay contenido publicado.',
    loadingNews: 'Actualizando noticias...',
    lists: 'Listas',
    discussions: 'Discusiones',
    newsletter: 'Boletín',
    triage: 'Moderación',
    cookieGoogleHow: 'Cómo usa Google los datos',
    cookieCloseReject: 'Cerrar y rechazar opcionales',
    cookieNecessaryDesc: 'Inicio de sesión, seguridad, idioma y registro de tus elecciones.',
    cookieAnalyticsDesc: 'Estadísticas agregadas de uso y rendimiento.',
    cookiePersonalizationDesc: 'Recomendaciones según tus intereses.',
    cookieAdsDesc:
      'Anuncios personalizados de Google AdSense y medición. Sin esto, los anuncios pueden seguir apareciendo, pero no personalizados.',
    legalOpenPage: 'Abrir página completa',
    legalUnderstood: 'Entendido',
    contact: 'Contacto',
    about: 'Acerca de',
    acceptTermsPrefix: 'He leído y acepto los',
    acceptTermsAnd: 'y la',
    acceptTermsRequired: 'Debes aceptar los Términos de Uso y la Política de Privacidad.',
    privacyCenter: 'Privacidad y datos',
    cookieTitle: 'Tu privacidad importa',
    cookieText:
      'Usamos cookies necesarias para inicio de sesión, seguridad y preferencias. Con tu permiso también usamos cookies de analítica, personalización y publicidad — incluido Google AdSense, que puede mostrar anuncios basados en visitas anteriores a este y otros sitios. Puedes cambiar de opinión en “Configurar cookies”.',
    cookieAccept: 'Aceptar todo',
    cookieReject: 'Rechazar opcionales',
    cookieCustomize: 'Personalizar',
    cookieSave: 'Guardar preferencias',
    necessary: 'Necesarias',
    analytics: 'Analítica',
    personalization: 'Personalización',
    ads: 'Publicidad',
    alwaysOn: 'Siempre activas',
    close: 'Cerrar',
  },
} as const;

type MessageKey = keyof (typeof messages)['pt-BR'];
type I18nContextValue = { locale: Locale; setLocale: (locale: Locale) => void; t: (key: MessageKey) => string };
const I18nContext = createContext<I18nContextValue | null>(null);

// Cobertura global da UI legada. Mantemos o texto-base em pt-BR e traduzimos
// qualquer texto/placeholder/title conhecido, inclusive componentes que ainda
// não foram migrados para useI18n(). Conteúdo editorial/dinâmico não é alterado.
const uiTranslations: Record<string, { en: string; es: string }> = {
  Notificações: { en: 'Notifications', es: 'Notificaciones' },
  'Verificando acesso...': { en: 'Checking access...', es: 'Verificando acceso...' },
  'Sua identidade dentro do universo geek.': {
    en: 'Your identity in the geek universe.',
    es: 'Tu identidad dentro del universo geek.',
  },
  Nome: { en: 'Name', es: 'Nombre' },
  Usuário: { en: 'Username', es: 'Usuario' },
  Email: { en: 'Email', es: 'Correo electrónico' },
  Senha: { en: 'Password', es: 'Contraseña' },
  'Validando seu acesso Premium...': { en: 'Validating your Premium access...', es: 'Validando tu acceso Premium...' },
  'Conteúdo Hypeverso Premium': { en: 'Hypeverso Premium content', es: 'Contenido Premium de Hypeverso' },
  'Este artigo está disponível para assinantes Premium.': {
    en: 'This article is available to Premium subscribers.',
    es: 'Este artículo está disponible para suscriptores Premium.',
  },
  'Apoiar o Hypeverso': { en: 'Support Hypeverso', es: 'Apoyar a Hypeverso' },
  Remover: { en: 'Remove', es: 'Eliminar' },
  'A imagem é verificada automaticamente antes de ser usada no perfil.': {
    en: 'The image is automatically checked before being used on the profile.',
    es: 'La imagen se verifica automáticamente antes de usarse en el perfil.',
  },
  'Digite pelo menos 2 letras. O Hypeverso busca capa, descrição, lançamento e gêneros automaticamente.': {
    en: 'Type at least 2 letters. Hypeverso automatically finds cover art, description, release date and genres.',
    es: 'Escribe al menos 2 letras. Hypeverso busca automáticamente portada, descripción, estreno y géneros.',
  },
  'Buscando catálogo...': { en: 'Searching catalog...', es: 'Buscando catálogo...' },
  'Nenhum resultado encontrado com os provedores configurados.': {
    en: 'No results found with the configured providers.',
    es: 'No se encontraron resultados con los proveedores configurados.',
  },
  Adicionando: { en: 'Adding', es: 'Añadiendo' },
  'Na biblioteca': { en: 'In library', es: 'En la biblioteca' },
  Adicionar: { en: 'Add', es: 'Añadir' },
  Detalhes: { en: 'Details', es: 'Detalles' },
  Enviar: { en: 'Send', es: 'Enviar' },
  'Comente nesta publicação...': { en: 'Comment on this post...', es: 'Comenta en esta publicación...' },
  'Editor editorial, SEO e publicação.': {
    en: 'Editorial, SEO and publishing editor.',
    es: 'Editor editorial, SEO y publicación.',
  },
  'Rascunho criado pelo AI News Studio': {
    en: 'Draft created by AI News Studio',
    es: 'Borrador creado por AI News Studio',
  },
  'Revise texto, título, datas, nomes, imagens e contexto antes de alterar o status para PUBLISHED.': {
    en: 'Review text, title, dates, names, images and context before changing the status to PUBLISHED.',
    es: 'Revisa texto, título, fechas, nombres, imágenes y contexto antes de cambiar el estado a PUBLISHED.',
  },
  'Fontes usadas': { en: 'Sources used', es: 'Fuentes utilizadas' },
  'Capa:': { en: 'Cover:', es: 'Portada:' },
  'Imagem interna:': { en: 'Inline image:', es: 'Imagen interna:' },
  Conteúdo: { en: 'Content', es: 'Contenido' },
  Recarregar: { en: 'Reload', es: 'Recargar' },
  'Conteúdo Premium': { en: 'Premium content', es: 'Contenido Premium' },
  'Use Ctrl+S para salvar sem sair do ponto onde está escrevendo.': {
    en: 'Use Ctrl+S to save without losing your editing position.',
    es: 'Usa Ctrl+S para guardar sin perder la posición de edición.',
  },
  'Salvando...': { en: 'Saving...', es: 'Guardando...' },
  'Salvar conteúdo': { en: 'Save content', es: 'Guardar contenido' },
  Título: { en: 'Title', es: 'Título' },
  'Slug (opcional)': { en: 'Slug (optional)', es: 'Slug (opcional)' },
  Descrição: { en: 'Description', es: 'Descripción' },
  'URL da capa': { en: 'Cover URL', es: 'URL de portada' },
  'Tags separadas por vírgula': { en: 'Comma-separated tags', es: 'Etiquetas separadas por comas' },
  'Meta description': { en: 'Meta description', es: 'Meta descripción' },
  Comentários: { en: 'Comments', es: 'Comentarios' },
  Comentar: { en: 'Comment', es: 'Comentar' },
  Responder: { en: 'Reply', es: 'Responder' },
  Denunciar: { en: 'Report', es: 'Denunciar' },
  'Entre na conversa...': { en: 'Join the conversation...', es: 'Únete a la conversación...' },
  'Escreva sua resposta...': { en: 'Write your reply...', es: 'Escribe tu respuesta...' },
  'Notificações de notícias': { en: 'News notifications', es: 'Notificaciones de noticias' },
  'Escolha as categorias que deseja acompanhar. Sem categorias selecionadas, você não receberá alertas de novas notícias.':
    {
      en: 'Choose the categories you want to follow. With no categories selected, you will not receive new-news alerts.',
      es: 'Elige las categorías que quieres seguir. Sin categorías seleccionadas, no recibirás alertas de noticias nuevas.',
    },
  'Selecionar todas': { en: 'Select all', es: 'Seleccionar todas' },
  Limpar: { en: 'Clear', es: 'Limpiar' },
  'Carregando categorias...': { en: 'Loading categories...', es: 'Cargando categorías...' },
  'Não foi possível carregar as categorias.': {
    en: 'Could not load categories.',
    es: 'No se pudieron cargar las categorías.',
  },
  Negrito: { en: 'Bold', es: 'Negrita' },
  Itálico: { en: 'Italic', es: 'Cursiva' },
  'Título H2': { en: 'Heading H2', es: 'Título H2' },
  'Título H3': { en: 'Heading H3', es: 'Título H3' },
  Lista: { en: 'List', es: 'Lista' },
  'Lista numerada': { en: 'Numbered list', es: 'Lista numerada' },
  Citação: { en: 'Quote', es: 'Cita' },
  'Adicionar/editar link': { en: 'Add/edit link', es: 'Añadir/editar enlace' },
  'Remover link': { en: 'Remove link', es: 'Eliminar enlace' },
  'Enviar imagem do computador': { en: 'Upload image from computer', es: 'Subir imagen desde el ordenador' },
  'Inserir imagem por URL': { en: 'Insert image by URL', es: 'Insertar imagen por URL' },
  Desfazer: { en: 'Undo', es: 'Deshacer' },
  Refazer: { en: 'Redo', es: 'Rehacer' },
  'Para você': { en: 'For you', es: 'Para ti' },
  'Recomendações inteligentes': { en: 'Smart recommendations', es: 'Recomendaciones inteligentes' },
  Fechar: { en: 'Close', es: 'Cerrar' },
  'O multiverso geek começa aqui': { en: 'The geek multiverse starts here', es: 'El multiverso geek empieza aquí' },
  'Explore. Conecte.': { en: 'Explore. Connect.', es: 'Explora. Conecta.' },
  'Viva o Hypeverso.': { en: 'Live the Hypeverso.', es: 'Vive Hypeverso.' },
  'Notícias, comunidade, biblioteca pessoal, recomendações e tudo que move cinema, games, anime, HQs e tecnologia.': {
    en: 'News, community, personal library, recommendations and everything driving movies, games, anime, comics and technology.',
    es: 'Noticias, comunidad, biblioteca personal, recomendaciones y todo lo que mueve el cine, los videojuegos, el anime, los cómics y la tecnología.',
  },
  'Explorar conteúdos': { en: 'Explore content', es: 'Explorar contenidos' },
  'Entrar na comunidade': { en: 'Join the community', es: 'Entrar en la comunidad' },
  'Radar Hypeverso': { en: 'Hypeverso Radar', es: 'Radar Hypeverso' },
  'Últimas publicações': { en: 'Latest posts', es: 'Últimas publicaciones' },
  'Ver tudo →': { en: 'View all →', es: 'Ver todo →' },
  'O portal está pronto. Publique o primeiro conteúdo pelo CMS administrativo.': {
    en: 'The portal is ready. Publish the first content from the admin CMS.',
    es: 'El portal está listo. Publica el primer contenido desde el CMS administrativo.',
  },
  'Explore por universo': { en: 'Explore by universe', es: 'Explora por universo' },
  'Recuperar senha': { en: 'Recover password', es: 'Recuperar contraseña' },
  'Se o email estiver cadastrado, enviamos as instruções.': {
    en: 'If the email is registered, we sent the instructions.',
    es: 'Si el correo está registrado, enviamos las instrucciones.',
  },
  'Enviar instruções': { en: 'Send instructions', es: 'Enviar instrucciones' },
  'Seu email': { en: 'Your email', es: 'Tu correo' },
  'Hypeverso Premium': { en: 'Hypeverso Premium', es: 'Hypeverso Premium' },
  'Uma camada extra para quem quer explorar o universo sem limites.': {
    en: 'An extra layer for those who want to explore the universe without limits.',
    es: 'Una capa extra para quienes quieren explorar el universo sin límites.',
  },
  'Plano Premium': { en: 'Premium plan', es: 'Plan Premium' },
  'Assinar com Stripe': { en: 'Subscribe with Stripe', es: 'Suscribirse con Stripe' },
  'A cobrança só é ativada após configurar as chaves Stripe no ambiente.': {
    en: 'Billing is only enabled after Stripe keys are configured in the environment.',
    es: 'El cobro solo se activa después de configurar las claves de Stripe en el entorno.',
  },
  Favoritos: { en: 'Favorites', es: 'Favoritos' },
  'Conteúdos salvos para ler depois.': {
    en: 'Content saved to read later.',
    es: 'Contenidos guardados para leer más tarde.',
  },
  'Entre na sua conta para ver seus favoritos.': {
    en: 'Sign in to see your favorites.',
    es: 'Inicia sesión para ver tus favoritos.',
  },
  Dashboard: { en: 'Dashboard', es: 'Panel' },
  'Visão operacional da plataforma.': { en: 'Platform operational overview.', es: 'Vista operativa de la plataforma.' },
  Comunidade: { en: 'Community', es: 'Comunidad' },
  'Feed Hypeverso': { en: 'Hypeverso Feed', es: 'Feed Hypeverso' },
  Publicar: { en: 'Publish', es: 'Publicar' },
  'Carregar mais': { en: 'Load more', es: 'Cargar más' },
  'Compartilhe algo com a comunidade...': {
    en: 'Share something with the community...',
    es: 'Comparte algo con la comunidad...',
  },
  'Ainda não tem conta?': { en: "Don't have an account yet?", es: '¿Aún no tienes cuenta?' },
  'Cadastre-se': { en: 'Sign up', es: 'Regístrate' },
  'Esqueci minha senha': { en: 'Forgot my password', es: 'Olvidé mi contraseña' },
  'Busca inteligente': { en: 'Smart search', es: 'Búsqueda inteligente' },
  'Tolerância a erros de digitação, filtros e resultados instantâneos.': {
    en: 'Typo tolerance, filters and instant results.',
    es: 'Tolerancia a errores de escritura, filtros y resultados instantáneos.',
  },
  'Motor:': { en: 'Engine:', es: 'Motor:' },
  'Buscando...': { en: 'Searching...', es: 'Buscando...' },
  'Nenhuma notícia encontrada.': { en: 'No news found.', es: 'No se encontraron noticias.' },
  'Sem capa': { en: 'No cover', es: 'Sin portada' },
  Tipo: { en: 'Type', es: 'Tipo' },
  Tudo: { en: 'All', es: 'Todo' },
  Pessoas: { en: 'People', es: 'Personas' },
  Categorias: { en: 'Categories', es: 'Categorías' },
  Tags: { en: 'Tags', es: 'Etiquetas' },
  Categoria: { en: 'Category', es: 'Categoría' },
  Todas: { en: 'All', es: 'Todas' },
  Ordenação: { en: 'Sort', es: 'Orden' },
  'Mais relevantes': { en: 'Most relevant', es: 'Más relevantes' },
  'Mais recentes': { en: 'Newest', es: 'Más recientes' },
  'Mais antigas': { en: 'Oldest', es: 'Más antiguas' },
  'Título A–Z': { en: 'Title A–Z', es: 'Título A–Z' },
  Acesso: { en: 'Access', es: 'Acceso' },
  Todos: { en: 'All', es: 'Todos' },
  Grátis: { en: 'Free', es: 'Gratis' },
  Conteúdos: { en: 'Content', es: 'Contenidos' },
  'Nenhum conteúdo encontrado com estes filtros.': {
    en: 'No content found with these filters.',
    es: 'No se encontró contenido con estos filtros.',
  },
  Anterior: { en: 'Previous', es: 'Anterior' },
  Próxima: { en: 'Next', es: 'Siguiente' },
  'Atividades de pessoas que você segue e novidades das suas categorias.': {
    en: 'Activity from people you follow and updates from your categories.',
    es: 'Actividad de personas que sigues y novedades de tus categorías.',
  },
  'Marcar como lidas': { en: 'Mark as read', es: 'Marcar como leídas' },
  'Entre na sua conta para acessar as notificações.': {
    en: 'Sign in to access notifications.',
    es: 'Inicia sesión para acceder a las notificaciones.',
  },
  'Hypeverso Media Hub': { en: 'Hypeverso Media Hub', es: 'Hypeverso Media Hub' },
  'Explore entretenimento': { en: 'Explore entertainment', es: 'Explora entretenimiento' },
  'Lançamentos do mês': { en: 'Releases this month', es: 'Estrenos del mes' },
  'Nenhum lançamento encontrado para este período com os provedores atualmente configurados.': {
    en: 'No releases found for this period with the currently configured providers.',
    es: 'No se encontraron estrenos para este período con los proveedores configurados actualmente.',
  },
  'Mês anterior': { en: 'Previous month', es: 'Mes anterior' },
  'Próximo mês': { en: 'Next month', es: 'Mes siguiente' },
  'Minha biblioteca': { en: 'My library', es: 'Mi biblioteca' },
  'Acompanhe filmes, séries, games, anime, mangás e HQs.': {
    en: 'Track movies, series, games, anime, manga and comics.',
    es: 'Sigue películas, series, videojuegos, anime, manga y cómics.',
  },
  'Adicionar item': { en: 'Add item', es: 'Añadir elemento' },
  'Catálogo automático': { en: 'Automatic catalog', es: 'Catálogo automático' },
  'Cadastro manual': { en: 'Manual entry', es: 'Registro manual' },
  Filme: { en: 'Movie', es: 'Película' },
  Série: { en: 'Series', es: 'Serie' },
  Game: { en: 'Game', es: 'Videojuego' },
  Anime: { en: 'Anime', es: 'Anime' },
  Mangá: { en: 'Manga', es: 'Manga' },
  HQ: { en: 'Comic', es: 'Cómic' },
  Assistindo: { en: 'Watching', es: 'Viendo' },
  'Quero assistir': { en: 'Want to watch', es: 'Quiero ver' },
  Concluído: { en: 'Completed', es: 'Completado' },
  Abandonado: { en: 'Dropped', es: 'Abandonado' },
  Lendo: { en: 'Reading', es: 'Leyendo' },
  'Quero ler': { en: 'Want to read', es: 'Quiero leer' },
  Jogando: { en: 'Playing', es: 'Jugando' },
  'Quero jogar': { en: 'Want to play', es: 'Quiero jugar' },
  'Imagem da biblioteca': { en: 'Library image', es: 'Imagen de biblioteca' },
  'Entre na sua conta para acessar a biblioteca.': {
    en: 'Sign in to access the library.',
    es: 'Inicia sesión para acceder a la biblioteca.',
  },
  Imagem: { en: 'Image', es: 'Imagen' },
  Fonte: { en: 'Source', es: 'Fuente' },
  'Sua biblioteca ainda está vazia. Use': {
    en: 'Your library is still empty. Use',
    es: 'Tu biblioteca aún está vacía. Usa',
  },
  'para começar.': { en: 'to get started.', es: 'para comenzar.' },
  'Já possui conta?': { en: 'Already have an account?', es: '¿Ya tienes cuenta?' },
  Gamificação: { en: 'Gamification', es: 'Gamificación' },
  'Ranking Hypeverso': { en: 'Hypeverso Ranking', es: 'Ranking Hypeverso' },
  'Experiência conquistada por participação real na plataforma.': {
    en: 'Experience earned through real participation on the platform.',
    es: 'Experiencia obtenida mediante participación real en la plataforma.',
  },
  Histórico: { en: 'History', es: 'Historial' },
  'Conteúdos que você acessou recentemente.': {
    en: 'Content you accessed recently.',
    es: 'Contenidos a los que accediste recientemente.',
  },
  'Entre na sua conta para ver o histórico.': {
    en: 'Sign in to see your history.',
    es: 'Inicia sesión para ver el historial.',
  },
  'Nova senha': { en: 'New password', es: 'Nueva contraseña' },
  'Senha atualizada. Você já pode entrar.': {
    en: 'Password updated. You can now sign in.',
    es: 'Contraseña actualizada. Ya puedes iniciar sesión.',
  },
  'Atualizar senha': { en: 'Update password', es: 'Actualizar contraseña' },
  'Carregando detalhes...': { en: 'Loading details...', es: 'Cargando detalles...' },
  'Voltar ao catálogo': { en: 'Back to catalog', es: 'Volver al catálogo' },
  'Adicionar à biblioteca': { en: 'Add to library', es: 'Añadir a la biblioteca' },
  Trailer: { en: 'Trailer', es: 'Tráiler' },
  'Avisar no dia': { en: 'Remind me on release day', es: 'Avisarme el día del estreno' },
  Sobre: { en: 'About', es: 'Acerca de' },
  Elenco: { en: 'Cast', es: 'Reparto' },
  Produção: { en: 'Production', es: 'Producción' },
  Estúdio: { en: 'Studio', es: 'Estudio' },
  Temas: { en: 'Themes', es: 'Temas' },
  Informações: { en: 'Information', es: 'Información' },
  'Hypeverso Editorial': { en: 'Hypeverso Editorial', es: 'Hypeverso Editorial' },
  'Notícias relacionadas': { en: 'Related news', es: 'Noticias relacionadas' },
  'Ver busca completa': { en: 'View full search', es: 'Ver búsqueda completa' },
  'Buscando notícias...': { en: 'Searching news...', es: 'Buscando noticias...' },
  Usuários: { en: 'Users', es: 'Usuarios' },
  'Notícias com IA': { en: 'AI News', es: 'Noticias con IA' },
  'Não foi possível alcançar a API': { en: 'Could not reach the API', es: 'No se pudo acceder a la API' },
  'Reconectando à API — mantendo os últimos dados válidos': {
    en: 'Reconnecting to API — keeping the latest valid data',
    es: 'Reconectando a la API — manteniendo los últimos datos válidos',
  },
  'A IA está se recuperando automaticamente': {
    en: 'AI is recovering automatically',
    es: 'La IA se está recuperando automáticamente',
  },
  Modelo: { en: 'Model', es: 'Modelo' },
  'Extrator Python': { en: 'Python extractor', es: 'Extractor Python' },
  'Worker IA': { en: 'AI Worker', es: 'Worker IA' },
  'Estado geral': { en: 'Overall status', es: 'Estado general' },
  'Criar novos rascunhos': { en: 'Create new drafts', es: 'Crear nuevos borradores' },
  'Último dia': { en: 'Last day', es: 'Último día' },
  'Última semana': { en: 'Last week', es: 'Última semana' },
  'Último mês': { en: 'Last month', es: 'Último mes' },
  Processamentos: { en: 'Processing jobs', es: 'Procesamientos' },
  Atualizar: { en: 'Refresh', es: 'Actualizar' },
  'Nenhuma busca executada ainda.': {
    en: 'No search has been run yet.',
    es: 'Aún no se ha ejecutado ninguna búsqueda.',
  },
  'Progresso do processamento': { en: 'Processing progress', es: 'Progreso del procesamiento' },
  'Tentar novamente': { en: 'Try again', es: 'Intentar de nuevo' },
  'Revisar artigo': { en: 'Review article', es: 'Revisar artículo' },
  'Transparência editorial': { en: 'Editorial transparency', es: 'Transparencia editorial' },
  'Filas e workers': { en: 'Queues and workers', es: 'Colas y workers' },
  'Monitoramento das filas gratuitas/self-hosted do Hypeverso.': {
    en: 'Monitoring Hypeverso free/self-hosted queues.',
    es: 'Monitoreo de las colas gratuitas/autohospedadas de Hypeverso.',
  },
  'BullMQ está desativado': { en: 'BullMQ is disabled', es: 'BullMQ está desactivado' },
  Retomar: { en: 'Resume', es: 'Reanudar' },
  Pausar: { en: 'Pause', es: 'Pausar' },
  'Limpar falhas': { en: 'Clear failures', es: 'Limpiar fallos' },
  'Nenhum job falho recente.': { en: 'No recent failed jobs.', es: 'No hay jobs fallidos recientes.' },
  'Falhas recentes': { en: 'Recent failures', es: 'Fallos recientes' },
  Excluir: { en: 'Delete', es: 'Eliminar' },
  Moderação: { en: 'Moderation', es: 'Moderación' },
  'Denúncias de comentários.': { en: 'Comment reports.', es: 'Denuncias de comentarios.' },
  Resolver: { en: 'Resolve', es: 'Resolver' },
  Dispensar: { en: 'Dismiss', es: 'Descartar' },
  'Criar, editar, publicar e agendar.': {
    en: 'Create, edit, publish and schedule.',
    es: 'Crear, editar, publicar y programar.',
  },
  'Novo artigo': { en: 'New article', es: 'Nuevo artículo' },
  'Não foi possível carregar os artigos do banco.': {
    en: 'Could not load articles from the database.',
    es: 'No se pudieron cargar los artículos de la base de datos.',
  },
  'Carregando artigos diretamente do PostgreSQL...': {
    en: 'Loading articles directly from PostgreSQL...',
    es: 'Cargando artículos directamente desde PostgreSQL...',
  },
  'Nenhum artigo encontrado.': { en: 'No articles found.', es: 'No se encontraron artículos.' },
  'Carregando artigo...': { en: 'Loading article...', es: 'Cargando artículo...' },
  'Artigo não encontrado.': { en: 'Article not found.', es: 'Artículo no encontrado.' },
  Nível: { en: 'Level', es: 'Nivel' },
  seguidores: { en: 'followers', es: 'seguidores' },
  seguindo: { en: 'following', es: 'siguiendo' },
  Conquistas: { en: 'Achievements', es: 'Logros' },
  'Atividade recente': { en: 'Recent activity', es: 'Actividad reciente' },
  Por: { en: 'By', es: 'Por' },

  'Explorar catálogo': { en: 'Explore catalog', es: 'Explorar catálogo' },
  'Pesquise uma obra e o Hypeverso preenche automaticamente capa, sinopse, ano, gêneros e metadados. Anime e mangá funcionam sem chave externa; filmes/séries e games dependem das credenciais dos respectivos provedores configuradas no backend.':
    {
      en: 'Search for a title and Hypeverso automatically fills in cover art, synopsis, year, genres and metadata. Anime and manga work without an external key; movies/series and games depend on the credentials of their respective providers configured in the backend.',
      es: 'Busca una obra y Hypeverso completa automáticamente portada, sinopsis, año, géneros y metadatos. Anime y manga funcionan sin clave externa; películas/series y videojuegos dependen de las credenciales de sus respectivos proveedores configuradas en el backend.',
    },
  'JPG, PNG, WebP, GIF estático ou AVIF, até 15 MB. A imagem passa por moderação automática antes de ser aceita.': {
    en: 'JPG, PNG, WebP, static GIF or AVIF, up to 15 MB. The image goes through automatic moderation before being accepted.',
    es: 'JPG, PNG, WebP, GIF estático o AVIF, hasta 15 MB. La imagen pasa por moderación automática antes de ser aceptada.',
  },
  'Calendário de lançamentos': { en: 'Release calendar', es: 'Calendario de estrenos' },
  'Acompanhe estreias de filmes, séries, games, anime e mangás e crie lembretes pessoais.': {
    en: 'Track movie, series, game, anime and manga releases and create personal reminders.',
    es: 'Sigue estrenos de películas, series, videojuegos, anime y manga y crea recordatorios personales.',
  },
  'Carregando lançamentos...': { en: 'Loading releases...', es: 'Cargando estrenos...' },
  'Encontre filmes, séries, games, anime e mangás, acompanhe lançamentos e adicione tudo à sua biblioteca sem preencher dados manualmente.':
    {
      en: 'Find movies, series, games, anime and manga, track releases and add everything to your library without entering data manually.',
      es: 'Encuentra películas, series, videojuegos, anime y manga, sigue estrenos y añade todo a tu biblioteca sin completar datos manualmente.',
    },
  'Ainda não há notícias relacionadas a esta obra. Quando o CMS ou AI News Studio publicar conteúdo relacionado, ele aparecerá aqui automaticamente.':
    {
      en: 'There is no related news for this title yet. When the CMS or AI News Studio publishes related content, it will appear here automatically.',
      es: 'Todavía no hay noticias relacionadas con esta obra. Cuando el CMS o AI News Studio publique contenido relacionado, aparecerá aquí automáticamente.',
    },
  'Pesquisa notícias recentes, cruza fontes, cria um artigo original com SEO e imagens licenciáveis e salva tudo como':
    {
      en: 'Searches recent news, cross-checks sources, creates an original SEO article with licensable images and saves everything as',
      es: 'Busca noticias recientes, cruza fuentes, crea un artículo original con SEO e imágenes licenciables y guarda todo como',
    },
  'para sua revisão.': { en: 'for your review.', es: 'para tu revisión.' },
  'As consultas automáticas já estão tentando reconectar. Se persistir por mais de alguns segundos, confira': {
    en: 'Automatic queries are already trying to reconnect. If it persists for more than a few seconds, check',
    es: 'Las consultas automáticas ya están intentando reconectar. Si persiste durante más de unos segundos, revisa',
  },
  'O processo é assíncrono e executado fora da API web. Cada artigo é criado obrigatoriamente como DRAFT, com fontes e créditos de imagem para revisão humana.':
    {
      en: 'The process is asynchronous and runs outside the web API. Every article is created as DRAFT with sources and image credits for human review.',
      es: 'El proceso es asíncrono y se ejecuta fuera de la API web. Cada artículo se crea obligatoriamente como DRAFT, con fuentes y créditos de imagen para revisión humana.',
    },
  'Fila persistente com recuperação automática de jobs interrompidos.': {
    en: 'Persistent queue with automatic recovery of interrupted jobs.',
    es: 'Cola persistente con recuperación automática de jobs interrumpidos.',
  },
  'Os rascunhos guardam os links de origem. A IA usa essas fontes como evidência e o artigo inclui uma seção “Fontes consultadas”.':
    {
      en: 'Drafts keep the source links. AI uses those sources as evidence and the article includes a “Sources consulted” section.',
      es: 'Los borradores guardan los enlaces de origen. La IA usa esas fuentes como evidencia y el artículo incluye una sección “Fuentes consultadas”.',
    },
  'Tema opcional, ex.: novo filme da Marvel': {
    en: 'Optional topic, e.g. new Marvel movie',
    es: 'Tema opcional, ej.: nueva película de Marvel',
  },
  'Defina BULLMQ_ENABLED=true para usar a arquitetura de filas.': {
    en: 'Set BULLMQ_ENABLED=true to use the queue architecture.',
    es: 'Define BULLMQ_ENABLED=true para usar la arquitectura de colas.',
  },
  'Revise texto, título, datas, nomes, imagens e contexto antes de alterar o status para PUBLISHED. O modelo usado foi':
    {
      en: 'Review text, title, dates, names, images and context before changing the status to PUBLISHED. The model used was',
      es: 'Revisa texto, título, fechas, nombres, imágenes y contexto antes de cambiar el estado a PUBLISHED. El modelo utilizado fue',
    },
  'Capa: JPG, PNG, WebP, GIF ou AVIF · até 15 MB.': {
    en: 'Cover: JPG, PNG, WebP, GIF or AVIF · up to 15 MB.',
    es: 'Portada: JPG, PNG, WebP, GIF o AVIF · hasta 15 MB.',
  },
  Privacidade: { en: 'Privacy', es: 'Privacidad' },
  Termos: { en: 'Terms', es: 'Términos' },
  Cookies: { en: 'Cookies', es: 'Cookies' },
  'quando serviços Google forem usados, consulte também': {
    en: 'when Google services are used, also see',
    es: 'cuando se utilicen servicios de Google, consulta también',
  },
  'Como o Google usa dados de sites parceiros': {
    en: 'How Google uses data from partner sites',
    es: 'Cómo usa Google los datos de sitios asociados',
  },
  'Configurações de anúncios': { en: 'Ad settings', es: 'Configuración de anuncios' },
};

const textOriginals = new WeakMap<Text, string>();
const attrOriginals = new WeakMap<Element, Map<string, string>>();
// Último valor aplicado pelo tradutor: se o React alterar o texto depois, o novo
// valor passa a ser o "original" (antes o tradutor revertia textos dinâmicos).
const textApplied = new WeakMap<Text, string>();
const attrApplied = new WeakMap<Element, Map<string, string>>();

function localizedText(base: string, locale: Locale) {
  if (locale === 'pt-BR') return base;
  const direct = uiTranslations[base]?.[locale];
  if (direct) return direct;
  // A marca é sempre Hypeverso em qualquer idioma.
  return base.replace(/Hypeverso|Hypeverso/g, 'Hypeverso');
}
function preserveWhitespace(source: string, value: string) {
  const lead = source.match(/^\s*/)?.[0] || '';
  const tail = source.match(/\s*$/)?.[0] || '';
  return `${lead}${value}${tail}`;
}
function translateNode(root: Node, locale: Locale) {
  if (root instanceof Text) {
    const parent = root.parentElement;
    if (!parent || parent.closest('[data-no-i18n]') || ['SCRIPT', 'STYLE', 'CODE', 'PRE'].includes(parent.tagName))
      return;
    const currentText = root.nodeValue || '';
    if (!textOriginals.has(root) || (currentText !== textApplied.get(root) && currentText !== textOriginals.get(root)))
      textOriginals.set(root, currentText);
    const original = textOriginals.get(root) || '';
    const key = original.trim();
    if (!key) return;
    const next = locale === 'pt-BR' ? original : preserveWhitespace(original, localizedText(key, locale));
    if (root.nodeValue !== next) root.nodeValue = next;
    textApplied.set(root, next);
    return;
  }
  if (!(root instanceof Element)) return;
  if (root.matches('[data-no-i18n],script,style,code,pre')) return;
  const attrs = ['placeholder', 'title', 'aria-label'];
  let saved = attrOriginals.get(root);
  if (!saved) {
    saved = new Map();
    attrOriginals.set(root, saved);
  }
  let applied = attrApplied.get(root);
  if (!applied) {
    applied = new Map();
    attrApplied.set(root, applied);
  }
  for (const attr of attrs) {
    const current = root.getAttribute(attr);
    if (current != null && (!saved.has(attr) || (current !== applied.get(attr) && current !== saved.get(attr))))
      saved.set(attr, current);
    const original = saved.get(attr);
    if (original != null) {
      const next = locale === 'pt-BR' ? original : localizedText(original.trim(), locale);
      if (current !== next) root.setAttribute(attr, next);
      applied.set(attr, next);
    }
  }
  for (const child of Array.from(root.childNodes)) translateNode(child, locale);
}

function normalizeLocale(value: string | null | undefined): Locale {
  const v = (value || '').toLowerCase();
  if (v.startsWith('en')) return 'en';
  if (v.startsWith('es')) return 'es';
  return 'pt-BR';
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('pt-BR');
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    setLocaleState(normalizeLocale(saved || navigator.language));
  }, []);
  const setLocale = (next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
    document.cookie = `${COOKIE_KEY}=${encodeURIComponent(next)}; path=/; max-age=31536000; SameSite=Lax`;
  };
  useEffect(() => {
    document.documentElement.lang = locale;
    translateNode(document.body, locale);
    const seo = {
      'pt-BR': {
        title: 'Hypeverso — Universo Geek',
        description: 'Cinema, séries, games, anime, mangás, HQs, tecnologia e comunidade geek.',
      },
      en: {
        title: 'Hypeverso — Geek Universe',
        description: 'Movies, series, games, anime, manga, comics, technology and geek community.',
      },
      es: {
        title: 'Hypeverso — Universo Geek',
        description: 'Cine, series, videojuegos, anime, manga, cómics, tecnología y comunidad geek.',
      },
    }[locale];
    if (/^Hypeverso — /.test(document.title) || document.title === '') document.title = seo.title;
    const observer = new MutationObserver(records => {
      for (const record of records) {
        if (record.type === 'characterData') translateNode(record.target, locale);
        for (const node of Array.from(record.addedNodes)) translateNode(node, locale);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [locale]);
  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t: (key: MessageKey) => messages[locale][key] ?? messages['pt-BR'][key] }),
    [locale],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n deve ser usado dentro de I18nProvider');
  return ctx;
}
