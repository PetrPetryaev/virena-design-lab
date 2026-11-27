import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const browser = await chromium.launch({channel:'chrome'});
try {
 const page = await browser.newPage();
 const url = new URL('?tab=cabinet&page=overview&member=partner', process.env.TEST_URL || 'http://localhost:5174/').href;
 const errors = [];
 page.on('pageerror',error => errors.push(error.message));
 let available = true;
 await page.route(url, route => route.request().method() === 'HEAD'
  ? route.fulfill({status:available ? 200 : 503,headers:{date:'Thu, 01 Jan 2037 12:34:00 GMT'}})
  : route.continue());
 for (const width of [375,768,1440]) {
  await page.setViewportSize({width,height:900});
  await page.goto(url);
  await page.waitForFunction(() => document.querySelector('.cab-footer')?.textContent.includes('15:34:'));
  await page.locator('.pd-event').first().waitFor();
  const events = page.locator('.pd-event:visible');
  const initial = await events.count();
  const expand = page.getByRole('button',{name:'Показать все',exact:true});
  if (await expand.count()) {
   assert.equal(initial,10);
   await expand.click();
   assert.ok(await events.count()>10);
  } else assert.ok(initial>0 && initial<=10);
  await page.getByRole('tab',{name:'Карьера',exact:true}).click();
  assert.equal(await events.count(),1);
  assert.equal(await expand.count(),0);
  console.log(width,initial);
 }
 available = false;
 await page.reload();
 await page.locator('.pd-event').first().waitFor();
 assert.match(await page.locator('.cab-footer').innerText(),/Время МСК: —/);
 assert.deepEqual(errors,[]);
} finally { await browser.close(); }
