import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
process.chdir(new URL('..',import.meta.url).pathname);
await mkdir('temp-outputs/shared-ui',{recursive:true});
const base=process.env.TEST_URL||'http://localhost:5174/';
const b=await chromium.launch({channel:'chrome'}),p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
const routes=[['participants','Найти участника'],['invitations','Найти приглашённого'],['orders','Номер заказа или продукт'],['finances&financeView=history','Логин или номер заказа'],['shop','Найти продукт']];
const results=[];
for(const width of [1440,768,375]){await p.setViewportSize({width,height:1000});for(const [route,label] of routes){
 console.log('checking',width,route);await p.goto(base+'?tab=cabinet&page='+route);const search=p.locator('.expanding-search');await search.waitFor();assert.ok(Math.abs(await search.evaluate(e=>e.getBoundingClientRect().height)-48)<.1);assert.equal(await search.getAttribute('data-open'),'false');
 await p.getByRole('button',{name:label,exact:true}).click();const input=p.getByRole('searchbox',{name:label});await input.fill('zzzz');assert.equal(await p.getByRole('button',{name:'Очистить поиск',exact:true}).count(),1);assert.equal(await p.getByRole('button',{name:'Сбросить фильтры',exact:true}).count()>=1,true);
 const styles=await search.evaluate(e=>({height:e.getBoundingClientRect().height,width:e.getBoundingClientRect().width,transition:getComputedStyle(e).transitionDuration,animation:getComputedStyle(e.querySelector('.expanding-search-field')).animationName,font:getComputedStyle(e.querySelector('input')).fontFamily}));assert.ok(Math.abs(styles.height-48)<.1);assert.equal(styles.transition,'0s');assert.equal(styles.animation,'toolbar-search-reveal');assert.ok(styles.font.includes('Inter'));
 await p.getByRole('button',{name:'Очистить поиск',exact:true}).click();assert.equal(await input.inputValue(),'');assert.equal(await input.evaluate(e=>e===document.activeElement),true);
 await input.fill('zzzz');await p.locator('.catalog-toolbar-filters').getByRole('button',{name:'Сбросить фильтры',exact:true}).click();assert.equal(await input.inputValue(),'');
 await input.focus();await input.fill('test');await input.press('Escape');assert.equal(await input.inputValue(),'');await input.press('Escape');assert.equal(await search.getAttribute('data-open'),'false');await p.waitForFunction(label=>document.activeElement?.getAttribute('aria-label')===label,label);
 await p.getByRole('button',{name:label,exact:true}).click();await p.locator('.cab-title').click();assert.equal(await search.getAttribute('data-open'),'false');
 assert.ok(await p.locator('.cab-main').evaluate(e=>e.scrollWidth<=e.clientWidth));results.push({viewport:width,route,...styles});
 if(route==='shop'&&width===1440){await p.getByRole('tab',{name:'Питание',exact:false}).click();await p.screenshot({path:'temp-outputs/shared-ui/catalog-light.png'});console.log('cards',await p.locator('.store-product.has-fullbleed-art').first().evaluate(e=>({shadow:getComputedStyle(e).boxShadow,border:getComputedStyle(e).borderWidth})));}
}}
await p.setViewportSize({width:1440,height:1000});await p.goto(base+'?tab=cabinet&page=shop&category=nutrition');await p.getByRole('button',{name:'Тёмная тема',exact:true}).last().click();await p.screenshot({path:'temp-outputs/shared-ui/catalog-dark.png'});await p.emulateMedia({reducedMotion:'reduce'});await p.getByRole('button',{name:'Найти продукт',exact:true}).click();assert.equal(await p.locator('.expanding-search-field').evaluate(e=>getComputedStyle(e).animationName),'none');
assert.deepEqual(errors,[]);console.log(JSON.stringify({status:'PASS',results,errors},null,2));await b.close();
