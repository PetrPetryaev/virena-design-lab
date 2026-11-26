import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const browser = await chromium.launch({channel:'chrome', headless:true});
const base = process.env.VIRENA_QA_URL || 'http://127.0.0.1:5174/';
const paragraph = 'Длинное описание для проверки переноса текста. '.repeat(15);
const paragraphs = Array.from({length:12}, (_, i) => `Абзац ${i + 1}. ${paragraph.trimEnd()}`);
const body = paragraphs.join('\n\n');
const longValue = 'ДлинноеЗначениеБезПробелов'.repeat(16);
const specifications = Array.from({length:20}, (_, i) => [`Характеристика ${i + 1}`, longValue]);

try {
 for (const [width, reducedMotion] of [[1440,'no-preference'], [375,'reduce']]) {
  const page = await browser.newPage({viewport:{width,height:900}, reducedMotion});
  page.setDefaultTimeout(15000);
  try {
   await page.route('**/src/storeProductDescriptions.js*', async route => {
    const response = await route.fetch();
    await route.fulfill({response, body:`${await response.text()}\nObject.assign(productDescriptions.expert, ${JSON.stringify({body, specifications})});`});
   });
   await page.goto(base + '?tab=store&page=shop&product=expert', {waitUntil:'domcontentloaded'});
   await page.locator('.has-page-skeleton').waitFor({state:'detached'});
   const card = page.locator('.store-detail');
   const action = card.getByRole('button', {name:'В корзину'});
   const gallery = card.locator('.store-expert-gallery');
   const copy = card.locator('.store-detail-copy');
   const details = copy.locator('.store-product-details details');
   await details.first().waitFor();
   assert.equal(await details.count(), 2);
   assert.equal(await details.first().getAttribute('open'), '');
   assert.deepEqual(await details.first().locator('p').allTextContents(), paragraphs);
   const size = target => target.evaluate(el => [el.offsetWidth, el.offsetHeight]);
   const galleryBefore = await size(gallery);
   const copyBefore = await size(copy);
   const galleryBox = await gallery.boundingBox();
   const copyBox = await copy.boundingBox();
   if (width === 1440) {
    assert.equal(galleryBox.y, copyBox.y);
    assert.ok(galleryBox.x + galleryBox.width < copyBox.x);
   } else {
    assert.ok(galleryBox.y + galleryBox.height < copyBox.y);
   }
   const description = details.nth(0);
   await description.locator('summary').focus();
   await page.keyboard.press('Enter');
   await description.locator('p').first().waitFor({state:'hidden'});
   assert.ok((await size(copy))[1] < copyBefore[1]);
   const shortCopy = await size(copy);
   const specs = details.nth(1);
   const sizes=await specs.evaluate(async details=>{
    const summary=details.querySelector('summary');
    const height=()=>details.getBoundingClientRect().height;
    const frame=()=>new Promise(requestAnimationFrame);
    const finish=async()=>{
     await frame();
     await Promise.allSettled(details.getAnimations({subtree:true}).map(animation=>animation.finished));
    };
    const closed=height();
    summary.click();
    await frame();
    await frame();
    const opening=height();
    await finish();
    const full=height();
    summary.click();
    await frame();
    await frame();
    const closing=height();
    summary.click();
    await finish();
    return {closed,opening,full,closing,reopened:height(),open:details.open};
   });
   if(reducedMotion==='reduce'){
    assert.equal(sizes.opening,sizes.full);
    assert.equal(sizes.closing,sizes.closed);
   }else{
    assert.ok(sizes.opening>sizes.closed&&sizes.opening<sizes.full,JSON.stringify(sizes));
    assert.ok(sizes.closing>sizes.closed&&sizes.closing<sizes.full,JSON.stringify(sizes));
   }
   assert.equal(sizes.reopened,sizes.full);
   assert.equal(sizes.open,true);
   assert.equal(await specs.locator('dt:visible').count(), 20);
   assert.equal(await specs.locator('dd').last().textContent(), longValue);
   assert.ok((await size(copy))[1] > shortCopy[1]);
   assert.deepEqual(await size(gallery), galleryBefore, 'Long content must not resize the gallery');
   const overflow = await specs.locator('dd').last().evaluate(el => el.scrollWidth > el.clientWidth);
   assert.equal(overflow, false);
   assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
   await action.click();
   const cartAction = card.getByRole('button', {name:'В корзине'}).and(card.locator('button:enabled'));
   await cartAction.waitFor();
   await card.getByRole('button', {name:'Уменьшить: Количество Expert'}).waitFor();
   assert.equal(await cartAction.getAttribute('data-tone'), 'Primary');
   await cartAction.click();
   await page.getByRole('dialog', {name:'Корзина'}).waitFor();
   console.log(`PASS ${width}px (${reducedMotion}): 12 paragraphs and 20 specs disclose with correct motion and natural height, cart action retains Primary and opens the cart`);
  } finally {await page.close();}
 }
} finally {await browser.close();}
