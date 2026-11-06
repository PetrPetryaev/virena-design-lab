import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome'}),page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
const base=process.env.TEST_URL||'http://localhost:5174/';
const go=async query=>{await page.goto(base+'?'+query);await page.locator('#root>header').waitFor();};
const missing=[];
for(const route of ['overview','participants','invitations','genealogy','finances','orders','shop','profile','cart']){
 await go('tab=cabinet&page='+route+'&member=partner');await page.locator('.cabinet').waitFor();
 const names=await page.locator('.cabinet button').evaluateAll(buttons=>buttons.filter(b=>!b.disabled&&b.getClientRects().length&&!b.closest('summary')).filter(b=>{for(let e=b;e&&e!==document.body;e=e.parentElement){const key=Object.keys(e).find(k=>k.startsWith('__reactProps'));const p=key&&e[key];if(p&&(p.onClick||p.onChange))return false;}return !b.popoverTargetElement;}).map(b=>b.getAttribute('aria-label')||b.textContent));
 if(names.length)missing.push({route,names});
}
assert.deepEqual(missing,[],'Buttons without any activation handler');
await go('tab=components');
for(const name of ['Secondary action','Search','Toolbar','Filters','Dialog','Drawer','Product card','Member row','Cabinet header','Cabinet sidebar']){
 await page.locator('.workspace>aside').getByRole('button',{name:'Virena / '+name,exact:false}).click();
 await page.getByRole('heading',{name:'Virena / '+name,exact:true}).waitFor();
 if(['Dialog','Drawer'].includes(name)){await page.getByRole('button',{name:name==='Dialog'?'Открыть окно':'Открыть боковую панель',exact:true}).click();await page.locator('dialog[open]').waitFor();await page.mouse.click(10,100);await page.locator('dialog[open]').waitFor({state:'hidden'});}
 if(name==='Search'){await page.getByRole('button',{name:'Найти участника',exact:true}).click();await page.getByRole('searchbox').fill('Анна');assert.match(await page.locator('.preview-status').innerText(),/Анна/);}
 if(name.startsWith('Cabinet'))await page.frameLocator('.application-shell-preview iframe').locator('.cabinet').waitFor();
}
await go('tab=cabinet&page=overview&member=partner');
await page.getByRole('button',{name:'Посмотреть апгрейд',exact:true}).click();assert.match(page.url(),/intent=upgrade/);
assert.deepEqual(errors,[]);console.log(JSON.stringify({status:'PASS',missingHandlers:missing,errors,galleryFamilies:10}));await browser.close();
