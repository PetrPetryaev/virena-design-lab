import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome'});
try {
 for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:width===390?844:1000},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const base=process.env.TEST_URL||'http://127.0.0.1:5174/';
  await page.goto(base+'?tab=cabinet&page=invitations');
  const opener=page.locator('.member-table-person').first();await opener.click();
  const dialog=page.getByRole('dialog',{name:'Карточка приглашённого'}),scroll=dialog.locator('.participant-scroll');
  const previous=dialog.getByRole('button',{name:'Предыдущий приглашённый'}),next=dialog.getByRole('button',{name:'Следующий приглашённый'});
  assert.ok(await previous.isDisabled());assert.ok(await next.isEnabled());
  const first=await dialog.locator('.inv-detail-person h3').innerText();
  assert.ok(await scroll.evaluate(e=>e.scrollHeight>e.clientHeight));await scroll.evaluate(e=>e.scrollTop=e.scrollHeight);assert.ok(await scroll.evaluate(e=>e.scrollTop>0));
  await next.focus();await page.keyboard.press('Enter');
  assert.notEqual(await dialog.locator('.inv-detail-person h3').innerText(),first);assert.equal(await scroll.evaluate(e=>e.scrollTop),0);assert.ok(await next.evaluate(e=>document.activeElement===e));
  await previous.click();assert.equal(await dialog.locator('.inv-detail-person h3').innerText(),first);assert.equal(await scroll.evaluate(e=>e.scrollTop),0);
  await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});assert.ok(await opener.evaluate(e=>e.contains(document.activeElement)||document.activeElement===e));
  await page.goto(base+'?tab=cabinet&page=participants');await page.locator('.member-table-person').first().click();
  let participant=page.getByRole('dialog');await participant.getByRole('button',{name:'Закрыть информацию об участнике'}).click();await participant.waitFor({state:'hidden'});
  await page.goto(base+'?tab=cabinet&page=genealogy');await page.locator('.genealogy-root').getByRole('button',{name:/Подробная информация/}).click();
  participant=page.getByRole('dialog');await participant.getByRole('button',{name:'Закрыть информацию об участнике'}).click();await participant.waitFor({state:'hidden'});
  assert.deepEqual(errors,[]);console.log('PASS drawer navigation and participant entry',width);await page.close();
 }
}finally{await browser.close();}
