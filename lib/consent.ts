// Consentimento de cookies + Google Consent Mode v2.
// Fonte única de verdade usada pelo banner, pelo script inline do <head> e pelo AdSense.
import { LEGAL_VERSION } from './legal-content';

export const CONSENT_STORAGE_KEY = 'hyperverso_cookie_consent_v2';
export const CONSENT_COOKIE = 'hv_cookie_consent';
export const CONSENT_CHANGED_EVENT = 'hyperverso:cookie-consent-changed';
export const CONSENT_MAX_AGE_DAYS = 365;

export type ConsentChoices = { analytics: boolean; personalization: boolean; ads: boolean };
export type Consent = ConsentChoices & {
  version: 2;
  policyVersion: string;
  necessary: true;
  updatedAt: string;
  expiresAt: string;
  id: string;
};

type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
    adsbygoogle?: any;
  }
}

export function googleConsentState(c: ConsentChoices) {
  const g = (v: boolean) => (v ? 'granted' : 'denied');
  return {
    ad_storage: g(c.ads),
    ad_user_data: g(c.ads),
    ad_personalization: g(c.ads),
    analytics_storage: g(c.analytics),
    personalization_storage: g(c.personalization),
    functionality_storage: 'granted',
    security_storage: 'granted',
  };
}

export function readConsent(): Consent | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Consent;
    // Nova versão das políticas ou consentimento expirado => perguntar de novo.
    if (c?.version !== 2 || c.policyVersion !== LEGAL_VERSION || !c.expiresAt || new Date(c.expiresAt) <= new Date())
      return null;
    return c;
  } catch {
    return null;
  }
}

function randomId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }
}

export function saveConsent(choices: ConsentChoices): Consent {
  const now = new Date();
  const previous = readConsent();
  const consent: Consent = {
    version: 2,
    policyVersion: LEGAL_VERSION,
    necessary: true,
    ...choices,
    updatedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + CONSENT_MAX_AGE_DAYS * 86400000).toISOString(),
    id: previous?.id || randomId(),
  };
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
  } catch {}
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  const compact = `v2|${LEGAL_VERSION}|a${+choices.analytics}p${+choices.personalization}d${+choices.ads}`;
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(compact)}; path=/; max-age=${CONSENT_MAX_AGE_DAYS * 86400}; SameSite=Lax${secure}`;
  try {
    localStorage.removeItem('hyperverso_cookie_consent_v1');
  } catch {}
  applyGoogleConsent(choices);
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT, { detail: consent }));
  return consent;
}

export function applyGoogleConsent(choices: ConsentChoices) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  // O gtag exige o objeto `arguments` original (não um array).
  if (!window.gtag)
    window.gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
  window.gtag('consent', 'update', googleConsentState(choices));
  // AdSense: anúncios não personalizados quando "Publicidade" é recusada e
  // libera as requisições que estavam pausadas até a decisão do usuário.
  window.adsbygoogle = window.adsbygoogle || [];
  window.adsbygoogle.requestNonPersonalizedAds = choices.ads ? 0 : 1;
  window.adsbygoogle.pauseAdRequests = 0;
}

/** Script inline executado no <head> ANTES de qualquer tag do Google. */
export function consentBootstrapScript() {
  const deniedDefaults = JSON.stringify(googleConsentState({ analytics: false, personalization: false, ads: false }));
  return `(function(){try{
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=window.gtag||gtag;
var d=${deniedDefaults};d.wait_for_update=500;
window.gtag('consent','default',d);
window.gtag('set','ads_data_redaction',true);
window.adsbygoogle=window.adsbygoogle||[];window.adsbygoogle.pauseAdRequests=1;window.adsbygoogle.requestNonPersonalizedAds=1;
var raw=localStorage.getItem(${JSON.stringify(CONSENT_STORAGE_KEY)});if(!raw)return;
var c=JSON.parse(raw);
if(!c||c.version!==2||c.policyVersion!==${JSON.stringify(LEGAL_VERSION)}||!c.expiresAt||new Date(c.expiresAt)<=new Date())return;
var g=function(v){return v?'granted':'denied'};
window.gtag('consent','update',{ad_storage:g(c.ads),ad_user_data:g(c.ads),ad_personalization:g(c.ads),analytics_storage:g(c.analytics),personalization_storage:g(c.personalization)});
window.adsbygoogle.requestNonPersonalizedAds=c.ads?0:1;window.adsbygoogle.pauseAdRequests=0;
}catch(e){}})();`;
}
