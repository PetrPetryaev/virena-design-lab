import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.setDefaultTimeout(10000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
 const base=process.env.TEST_URL||'http://localhost:5174/';
 await page.goto(new URL('?tab=components',base).href);
 await page.locator('aside').waitFor();
 assert.ok((await page.locator('h1').innerText()).includes('Virena'));
 await page.getByRole('button',{name:'Настройки витрины'}).click();
 await page.getByLabel('Тема витрины').selectOption('dark');
 await page.waitForFunction(()=>document.documentElement.dataset.theme==='dark');
 await page.goto(new URL('?tab=flows&screen=onboard-1',base).href);
 await page.locator('.auth-skeleton').waitFor({state:'detached'});
 await page.locator('.virena-date [data-type=year]').click();
 assert.ok(await page.locator('.virena-date [data-type=day]').evaluate(e=>e===document.activeElement));
 await page.keyboard.type('12031990');
 assert.equal(await page.locator('.virena-date [data-type=year]').getAttribute('aria-valuenow'),'1990');
 assert.deepEqual(errors,[]);
 console.log('PASS catalog, assets, dark theme, auth, date segments');
} finally { await browser.close(); }
