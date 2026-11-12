import test from 'node:test';
import assert from 'node:assert/strict';
import handle from '../netlify/edge-functions/visitor-country.js';
import { countryGroups, languageForRegion, supportedLanguages } from '../netlify/edge-functions/lib/language-policy.mjs';

function context(country = '', cookies = {}, subdivision = '') {
  const written = [];
  return {geo:{country:{code:country},subdivision:{code:subdivision}},cookies:{get:name=>cookies[name],set:cookie=>written.push(cookie)},written};
}
const request = (route, headers = {}, method='GET') => new Request('https://lfclothing.com'+route,{method,headers:{'User-Agent':'Mozilla/5.0',...headers}});
test('all country groups select their configured language; unsupported regions always use English', () => {
  for(const [lang,countries] of Object.entries(countryGroups)) for(const country of countries) assert.equal(languageForRegion(country),lang,country);
  for(const country of ['US','GB','AU','CN','IN','IT','RU','NL','SG','HK','TW','TH','VN','XX','']) assert.equal(languageForRegion(country,'','de-DE,fr;q=0.9'),'en',country);
  assert.equal(languageForRegion('BR'),'pt');
});
test('multilingual countries use subdivisions and only locally applicable language preferences', () => {
  assert.equal(languageForRegion('CA','QC'),'fr');
  assert.equal(languageForRegion('CA','CA-QC'),'fr');
  assert.equal(languageForRegion('CA','ON','fr'),'en');
  assert.equal(languageForRegion('CH','GE'),'fr');
  assert.equal(languageForRegion('CH','TI'),'en');
  assert.equal(languageForRegion('CH','','fr-CH,de;q=0.8'),'fr');
  assert.equal(languageForRegion('CH','','de-CH;q=0.2,fr-CH;q=0.9'),'fr');
  assert.equal(languageForRegion('BE','VLG'),'en');
  assert.equal(languageForRegion('BE','WAL'),'fr');
});
test('first visit redirects to localized current page and retains query parameters',async()=>{
  const ctx=context('DE');
  const response=await handle(request('/inquiry/?sku=GAR-WJ-001&utm_source=test'),ctx);
  assert.equal(response.status,302);
  assert.equal(response.headers.get('location'),'https://lfclothing.com/de/inquiry/?sku=GAR-WJ-001&utm_source=test');
  assert.match(response.headers.get('cache-control'),/private.*no-store/);
  assert.equal(response.headers.get('netlify-cdn-cache-control'),'no-store');
  assert.equal(ctx.written[0].name,'lf_country');
});
test('saved language wins over location and manual English remains accessible',async()=>{
  assert.equal(await handle(request('/'),context('DE',{lf_language:'en'})),undefined);
  const response=await handle(request('/about/'),context('US',{lf_language:'ja'}));
  assert.equal(new URL(response.headers.get('location')).pathname,'/ja/about/');
  const invalid=await handle(request('/'),context('US',{lf_language:'invalid'}));
  assert.equal(invalid,undefined);
});
test('each language selection sets a safe functional preference and strips only lang',async()=>{
  for(const language of supportedLanguages){
    const ctx=context('DE');
    const response=await handle(request(`/fr/inquiry/?lang=${language}&sku=GAR-WJ-001&request=Product`),ctx);
    const target=new URL(response.headers.get('location'));
    assert.equal(target.pathname,language==='en'?'/inquiry/':`/${language}/inquiry/`);
    assert.equal(target.search,'?sku=GAR-WJ-001&request=Product');
    assert.deepEqual(ctx.written.find(item=>item.name==='lf_language'),{name:'lf_language',value:language,path:'/',maxAge:31536000,sameSite:'Lax',secure:true});
  }
});
test('explicit language links and crawlers stay stable',async()=>{
  assert.equal(await handle(request('/fr/about/'),context('DE',{lf_language:'ja'})),undefined);
  assert.equal(await handle(request('/about/',{'User-Agent':'Googlebot'}),context('DE')),undefined);
  assert.equal(await handle(request('/about/',{'User-Agent':'bingbot'}),context('FR')),undefined);
});
test('assets, missing pages, legacy redirects and submission endpoints bypass routing',async()=>{
  for(const route of ['/assets/editorial/range-workwear-stock-v4.webp','/site.js','/sitemap.xml','/missing-page/','/.netlify/functions/rfq','/products/mens-professional-suit/']) assert.equal(await handle(request(route),context('DE')),undefined,route);
  assert.equal(await handle(request('/inquiry/',{},'POST'),context('DE')),undefined);
  assert.equal(await handle(request('/de/missing-page/?lang=fr'),context('DE')),undefined);
});
test('no redirect loops after any automatic regional choice',async()=>{
  for(const country of ['DE','FR','SA','ES','BR','JP','KR']){
    const ctx=context(country);
    const first=await handle(request('/products/'),ctx);
    assert.equal(first.status,302);
    const next=await handle(new Request(first.headers.get('location')),ctx);
    assert.equal(next,undefined,country);
  }
});
