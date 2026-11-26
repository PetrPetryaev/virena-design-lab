import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.env.VIRENA_QA_URL||'http://127.0.0.1:5174/';

try {
 for(const [width,colorScheme] of [[1440,'light'],[375,'dark']]){
  const page=await browser.newPage({viewport:{width,height:1000},colorScheme,reducedMotion:'reduce',hasTouch:width===375});
  page.setDefaultTimeout(15000);
  try {
   const hold=async pattern=>{
    let release;
    const pending=new Promise(resolve=>{release=resolve;});
    await page.route(pattern,async route=>{
     await pending;
     await route.continue();
    });
    return release;
   };
   const release=await hold('**/balance-v2-studio-1.png');
   const releaseLate=await hold('**/balance-v2-lifestyle-2.jpg');
   await page.route('**/balance-v2-studio-2.png',route=>route.abort());
   await page.goto(base+'?tab=store&page=shop&product=balance',{waitUntil:'domcontentloaded'});
   const gallery=page.locator('.store-detail-art');
   const active=gallery.locator('.store-gallery-layer[data-visible=true]');
   await active.waitFor();
   await page.locator('.has-page-skeleton').waitFor({state:'detached'});
   const waitForImage=part=>page.waitForFunction(part=>{
    const img=document.querySelector('.store-detail-art .store-gallery-layer[data-visible=true]');
    return img?.currentSrc.includes(part)&&img.complete&&img.naturalWidth>0;
   },part);
   const assertPainted=async(locator,selector,name)=>{
    const shown=await locator.screenshot();
    const hidden=await locator.screenshot({style:`${selector}{visibility:hidden!important}`});
    assert.ok(!shown.equals(hidden),`${name} must paint visible pixels`);
   };
   const paintPhoto=()=>assertPainted(gallery,'.store-detail-art .store-gallery-layer[data-visible=true]','Product photo');
   await waitForImage('balance-v2-lifestyle-1');
   await paintPhoto();
   const arrows=page.locator('.store-gallery-controls');
   await gallery.hover();
   await assertPainted(arrows,'.store-gallery-arrow svg','Gallery arrow icons');

   const angle=name=>page.locator('.store-thumbnails').getByRole('button',{name,exact:true});
   await angle('Предметный кадр').click();
   const beforeLoad=await active.getAttribute('src');
   assert.match(beforeLoad,/balance-v2-lifestyle-1/,'Keep the previous photo while the next response is pending');
   await paintPhoto();
   release();
   await waitForImage('balance-v2-studio-1');
   await paintPhoto();

   await angle('В интерьере').click();
   await angle('С аксессуарами').click();
   releaseLate();
   await page.waitForFunction(()=>document.querySelector('.store-detail-art img[src*="balance-v2-lifestyle-2"]')?.naturalWidth>0);
   assert.match(await active.getAttribute('src'),/balance-v2-lifestyle-1/,'A late response must not override the latest selection');

   await page.waitForFunction(()=>{
    const failed=document.querySelector('.store-detail-art img[src*="balance-v2-studio-2"]');
    return failed?.complete&&!failed.naturalWidth;
   });
   await angle('Ракурс').click();
   assert.match(await active.getAttribute('src'),/balance-v2-lifestyle-1/,'A failed response must leave the current photo visible');
   await paintPhoto();
   console.log(`PASS ${width}px ${colorScheme}: photo persists during a blocked response, replaces on load, ignores stale or failed responses, gallery icons paint`);
  } finally {await page.close();}
 }
} finally {await browser.close();}
