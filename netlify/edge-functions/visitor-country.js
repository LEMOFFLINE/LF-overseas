import { supportedLanguages, languageForRegion, splitLanguagePath, languagePath } from './lib/language-policy.mjs';
import { pagePaths } from './lib/page-paths.mjs';

export default async (request, context) => {
  if (!['GET', 'HEAD'].includes(request.method)) return;
  const url = new URL(request.url);
  const {language, base} = splitLanguagePath(url.pathname);
  const canonicalBase = base.endsWith('/') ? base : `${base}/`;
  // Exclude assets, API calls, historical redirects and missing pages.
  if (!pagePaths.includes(canonicalBase)) return;
  const country = String(context.geo?.country?.code || '').trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(country) && !context.cookies.get('lf_country')) {
    context.cookies.set({name:'lf_country',value:country,path:'/',maxAge:31536000,sameSite:'Lax',secure:true});
  }
  const manual = url.searchParams.get('lang');
  const redirect = target => new Response(null, {status:302, headers:{Location:target.href,'Cache-Control':'private, no-store','Netlify-CDN-Cache-Control':'no-store','Vary':'Cookie, Accept-Language'}});
  if (supportedLanguages.includes(manual)) {
    context.cookies.set({name:'lf_language',value:manual,path:'/',maxAge:31536000,sameSite:'Lax',secure:true});
    url.searchParams.delete('lang');
    url.pathname = languagePath(canonicalBase, manual);
    return redirect(url);
  }
  // Explicit translated URLs remain stable for shared links and search engines.
  if (language !== 'en') return;
  if (/bot|crawler|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegrambot|google-inspectiontool/i.test(request.headers.get('user-agent') || '')) return;
  const preference = context.cookies.get('lf_language');
  const target = supportedLanguages.includes(preference) ? preference : languageForRegion(country, context.geo?.subdivision?.code || '', request.headers.get('accept-language') || '');
  if (target === 'en') return;
  url.pathname = languagePath(canonicalBase, target);
  return redirect(url);
};
