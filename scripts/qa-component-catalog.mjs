import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome'}),page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.goto((process.env.TEST_URL||'http://localhost:5174/')+'?tab=components');
const sidebar=page.locator('.workspace>aside');await sidebar.waitFor();
const labels=await sidebar.locator('button').evaluateAll(es=>es.map(e=>e.childNodes[0].textContent));
assert.equal(new Set(labels).size,labels.length,'Duplicate navigation labels');
for(const old of ['Call component','Virena / Call action','Virena / Panel state','Virena / Color swatch','Virena / Stat card','Virena / Member row','Virena / Cabinet header','Virena / Cabinet sidebar'])assert.ok(!labels.includes(old),old);
for(let i=0;i<labels.length;i++){
 await sidebar.locator('button').nth(i).click();
 await page.locator('.workspace>main h1').waitFor();
 assert.ok((await page.locator('.workspace>main').innerText()).trim().length>10,labels[i]);
 assert.deepEqual(errors,[],labels[i]);
}
await sidebar.getByRole('button',{name:/^Иконки/}).click();
const iconNames=await page.locator('.current-icon-grid a').allTextContents();assert.equal(new Set(iconNames).size,iconNames.length);assert.ok(iconNames.includes('cart-linear'));assert.ok(iconNames.includes('cart-large-2-linear'));
await page.getByRole('textbox',{name:'Найти иконку'}).fill('cart-linear');assert.equal(await page.locator('.current-icon-grid section').count(),1);
await sidebar.getByRole('button',{name:/^Virena \/ Product card/}).click();assert.equal(await page.locator('.application-product-grid article').count(),3);await page.waitForFunction(()=>[...document.querySelectorAll('.application-product-grid [data-visible=true]')].every(img=>img.complete&&img.naturalWidth>0));
for(const width of [1440,390]){await page.setViewportSize({width,height:1000});const sizes=await page.locator('.application-product-grid [data-visible=true]').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().width));assert.ok(sizes.every(w=>w>100),String(sizes));}
await sidebar.getByRole('button',{name:/^Virena \/ Banner card/}).click();
await page.getByLabel('Содержимое',{exact:true}).selectOption('partner-notice');
for(const [member,title] of [['partner-no-package','Начисления не идут'],['grace','Продлите активность'],['frozen','Аккаунт заморожен']]){await page.getByLabel('Участник',{exact:true}).selectOption(member);assert.ok(await page.getByRole('heading',{name:title}).isVisible());assert.equal(await page.locator('.overview-notice button').count(),1);}
await sidebar.getByRole('button',{name:/^Virena \/ Rank progress/}).click();await page.getByLabel('Участник',{exact:true}).selectOption('partner-no-package');assert.ok(await page.getByText('Нужен пакет').isVisible());assert.equal(await page.getByRole('progressbar').getAttribute('aria-valuenow'),'0');
await sidebar.getByRole('button',{name:/^Virena \/ Package card/}).click();await page.getByLabel('Участник',{exact:true}).selectOption('partner-no-package');assert.ok(await page.getByText('Без пакета',{exact:true}).isVisible());assert.ok(await page.getByRole('button',{name:'Выбрать пакет'}).isVisible());await page.getByLabel('Участник',{exact:true}).selectOption('frozen');assert.ok(await page.getByText('Апгрейд доступен после восстановления.').isVisible());assert.equal(await page.getByRole('button',{name:'Сделать апгрейд'}).count(),0);
await sidebar.getByRole('button',{name:/^Virena \/ Wallet/}).click();await page.getByLabel('Состояние',{exact:true}).selectOption('frozen');assert.ok(await page.getByText('Заблокировано').isVisible());
await sidebar.getByRole('button',{name:/^Virena \/ Achievement badge/}).click();assert.equal(await page.locator('.achievement-catalog img').count(),8);
assert.deepEqual(errors,[]);console.log(JSON.stringify({status:'PASS',families:labels.length,icons:iconNames.length,errors}));await browser.close();
