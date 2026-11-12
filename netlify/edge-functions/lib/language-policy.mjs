export const supportedLanguages = ['en', 'de', 'fr', 'ar', 'es', 'pt', 'ja', 'ko'];
export const countryGroups = {
  de: ['DE', 'AT', 'LI'],
  fr: ['FR', 'MC', 'LU', 'BJ', 'BF', 'BI', 'CD', 'CG', 'CI', 'CM', 'GA', 'GN', 'MG', 'ML', 'NE', 'SN', 'TG', 'GF', 'GP', 'MQ', 'RE', 'YT', 'NC', 'PF', 'PM', 'BL', 'MF', 'WF'],
  ar: ['AE', 'SA', 'BH', 'KW', 'OM', 'QA', 'YE', 'IQ', 'JO', 'LB', 'SY', 'PS', 'EG', 'SD', 'LY', 'TN', 'DZ', 'MA', 'MR', 'SO', 'DJ', 'KM', 'TD', 'EH'],
  es: ['ES', 'MX', 'GT', 'HN', 'SV', 'NI', 'CR', 'PA', 'CU', 'DO', 'PR', 'CO', 'VE', 'EC', 'PE', 'BO', 'PY', 'CL', 'AR', 'UY', 'GQ'],
  pt: ['PT', 'BR', 'AO', 'MZ', 'CV', 'GW', 'ST', 'TL'],
  ja: ['JP'],
  ko: ['KR', 'KP'],
};
const byCountry = new Map(Object.entries(countryGroups).flatMap(([language, countries]) => countries.map(country => [country, language])));
export function preferredBrowserLanguage(header = '') {
  return header.split(',').map((item,index) => {
    const [tag,...params] = item.trim().split(';');
    const quality = params.find(value => value.trim().startsWith('q='));
    return {language:tag.split('-')[0].toLowerCase(), q:quality ? Number(quality.trim().slice(2)) : 1, index};
  }).filter(item => item.q > 0).sort((a,b) => b.q-a.q || a.index-b.index).map(item => item.language);
}
export function languageForRegion(country = '', subdivision = '', acceptLanguage = '') {
  country = country.toUpperCase();
  subdivision = subdivision.toUpperCase().replace(/^[A-Z]{2}-/, '');
  const browser = preferredBrowserLanguage(acceptLanguage)[0];
  if (country === 'CA') return subdivision === 'QC' ? 'fr' : 'en';
  if (country === 'BE') {
    if (['VLG','VAN','VBR','VLI','VOV','VWV'].includes(subdivision)) return 'en';
    if (['WAL','WBR','WHT','WLG','WLX','WNA','BRU'].includes(subdivision)) return 'fr';
    return browser === 'nl' ? 'en' : browser === 'de' ? 'de' : 'fr';
  }
  if (country === 'CH') {
    if (['TI'].includes(subdivision)) return 'en';
    if (['GE','VD','NE','JU'].includes(subdivision)) return 'fr';
    if (browser === 'fr') return 'fr';
    if (browser === 'it' || browser === 'rm') return 'en';
    return 'de';
  }
  if (country === 'LU' && browser === 'de') return 'de';
  return byCountry.get(country) || 'en';
}
export function splitLanguagePath(pathname) {
  const match = pathname.match(/^\/(de|fr|ar|es|pt|ja|ko)(\/|$)/);
  return match ? {language:match[1], base:pathname.slice(match[1].length+1) || '/'} : {language:'en', base:pathname};
}
export function languagePath(base, language) {
  return language === 'en' ? base : `/${language}${base}`;
}
