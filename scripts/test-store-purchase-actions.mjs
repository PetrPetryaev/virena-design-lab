import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const browser = await chromium.launch({channel:'chrome', headless:true});
const base = process.env.VIRENA_QA_URL || 'http://127.0.0.1:5174/';
const screenshotDir = process.env.VIRENA_QA_SCREENSHOTS;
try {
 for (const width of [1440,375,320]) {
  const page = await browser.newPage({viewport:{width,height:950},reducedMotion:width===375?'reduce':'no-preference'});
  page.setDefaultTimeout(10000);
  try {
   await page.goto(base+'?tab=store&page=shop&product=expert');
   await page.locator('.has-page-skeleton').waitFor({state:'detached'});
   const purchase = page.locator('.store-purchase-area');
   const cart = page.getByRole('dialog',{name:'Корзина',exact:true});
   const action = (scope, name) => scope.getByRole('button',{name,exact:true});
   const count = (scope,quantity) => scope.getByLabel(`Количество Expert: ${quantity}`,{exact:true});
   const open = action(purchase,'В корзину');
   const inCart = action(purchase,'В корзине');
   const minus = action(purchase,'Уменьшить: Количество Expert');
   const plus = action(purchase,'Увеличить: Количество Expert');
   const shot = async suffix => {if(screenshotDir)await purchase.screenshot({path:`${screenshotDir}/pdp-${width}-${suffix}.png`,animations:'disabled'});};
   await open.waitFor();
   if(width===1440){
    await open.click();
    await open.and(purchase.locator('button[aria-busy=true]')).waitFor();
    await page.locator('.store-related').getByRole('link',{name:'Подробнее: Balance',exact:true}).evaluate(link=>link.click());
    await page.getByRole('heading',{name:'Balance',exact:true}).waitFor();
    await page.waitForTimeout(650);
    assert.equal(await page.getByRole('button',{name:'Корзина',exact:true}).isVisible(),true);
    await page.goBack();
    await page.getByRole('heading',{name:'Expert',exact:true}).waitFor();
    await page.locator('.has-page-skeleton').waitFor({state:'detached'});
   }
   assert.equal(await purchase.locator('.quantity-control').count(),0);
   assert.equal(await open.evaluate(el=>el.offsetWidth),await purchase.evaluate(el=>el.clientWidth));
   const purchaseHeight=await purchase.evaluate(el=>el.offsetHeight);
   await shot('before');
   await open.evaluate(button=>{button.click();button.click();});
   await open.and(purchase.locator('button[aria-busy=true]')).waitFor();
   assert.equal(await open.isDisabled(),true);
   assert.equal(await open.evaluate(el=>el.offsetWidth),await purchase.evaluate(el=>el.clientWidth));
   assert.equal(await purchase.evaluate(el=>el.offsetHeight),purchaseHeight,'Loading must not change purchase row height');
   await shot('loading');
   const pendingCart=await page.evaluate(async()=>{
    await new Promise(resolve=>setTimeout(resolve,200));
    return JSON.parse(sessionStorage.getItem('virena-checkout-cart')||'[]');
   });
   assert.deepEqual(pendingCart,[]);
   assert.equal(await purchase.locator('.quantity-control').count(),0);
   await page.getByRole('button',{name:'Корзина',exact:true}).waitFor();
   const frames=await purchase.evaluate(async row=>{
    const button=row.querySelector('button');
    for(let frame=0;frame<60&&row.dataset.inCart!=='true';frame++)await new Promise(requestAnimationFrame);
    const positions=[];
    for(let i=0;i<12;i++){
     await new Promise(requestAnimationFrame);
     const cta=button.getBoundingClientRect();
     const clip=row.querySelector('.store-purchase-quantity').getBoundingClientRect();
     const right=row.getBoundingClientRect().right;
     positions.push([cta.right,clip.left,clip.right,right]);
    }
    return positions;
   });
   assert.ok(frames.every(([cta,clipStart,clipEnd,right])=>cta<=clipStart+1&&clipEnd<=right+1));
   await count(purchase,1).waitFor();
   assert.equal(await cart.count(),0);
   await plus.evaluate(button=>{button.click();button.click();});
   await inCart.and(purchase.locator('button[aria-busy=true]')).waitFor();
   assert.equal(await inCart.isDisabled(),true);
   assert.equal(await plus.getAttribute('aria-busy'),'false');
   assert.equal(await purchase.locator('.motion-loader').count(),1);
   assert.equal(await plus.isDisabled(),true);
   assert.equal(await minus.isDisabled(),true);
   assert.equal(await minus.getAttribute('aria-busy'),'false');
   assert.equal(await purchase.evaluate(el=>el.offsetHeight),purchaseHeight);
   await count(purchase,1).waitFor();
   if(screenshotDir)await shot('quantity-loading');
   const stillOne=await page.evaluate(async()=>{
    await new Promise(resolve=>setTimeout(resolve,200));
    return JSON.parse(sessionStorage.getItem('virena-checkout-cart')||'[]');
   });
   assert.deepEqual(stillOne,[{productId:'expert',quantity:1}]);
   await count(purchase,2).waitFor();
   await page.getByText('Сумма за 2 шт.',{exact:true}).waitFor();
   assert.equal(await purchase.evaluate(el=>el.offsetHeight),purchaseHeight,'Quantity control must not change purchase row height');
   const insets=await purchase.locator('.quantity-control').evaluate(el=>{
    const outer=el.getBoundingClientRect();
    return [...el.querySelectorAll('[data-ui=Button]>.motion-surface')].map(button=>{
     const box=button.getBoundingClientRect();
     return {top:box.top-outer.top,bottom:outer.bottom-box.bottom,width:box.width,height:box.height};
    });
   });
   assert.ok(insets.every(box=>box.top===4&&box.bottom===4&&box.width===box.height),'Counter circles must have equal 4px vertical insets');
   await shot('after');
   const [ctaBox,stepperBox]=await Promise.all([inCart.boundingBox(),purchase.locator('.quantity-control').boundingBox()]);
   const gap=await purchase.evaluate(el=>parseFloat(getComputedStyle(el).columnGap));
   const actionGap=stepperBox.x-ctaBox.x-ctaBox.width;
   assert.ok(actionGap>=0&&actionGap<=gap+1);
   assert.ok(Math.abs(ctaBox.y+ctaBox.height/2-stepperBox.y-stepperBox.height/2)<=1);
   assert.equal(await inCart.getAttribute('data-tone'),'Primary');
   await inCart.click();
   await count(cart,2).waitFor();
   if(width===1440){
    const cartPlus=action(cart,'Увеличить: Количество Expert');
    await cartPlus.click();
    await cartPlus.and(cart.locator('button[aria-busy=true]')).waitFor();
    await action(cart,'Закрыть окно').click();
    await cart.waitFor({state:'detached'});
    await page.waitForTimeout(650);
    await count(purchase,2).waitFor();
    await inCart.click();
    await count(cart,2).waitFor();
   }
   const cartMinus=action(cart,'Уменьшить: Количество Expert');
   await cartMinus.click();
   await cartMinus.and(cart.locator('button[aria-busy=true]')).waitFor();
   assert.equal(await action(cart,'Увеличить: Количество Expert').isDisabled(),true);
   await count(cart,2).waitFor();
   await count(cart,1).waitFor();
   await action(cart,'Закрыть окно').click();
   await cart.waitFor({state:'detached'});
   await count(purchase,1).waitFor();
   await minus.focus();
   await minus.press('Enter');
   await inCart.and(purchase.locator('button[aria-busy=true]')).waitFor();
   assert.equal(await minus.getAttribute('aria-busy'),'false');
   await count(purchase,1).waitFor();
   await open.and(purchase.locator('button:enabled')).waitFor();
   assert.equal(await open.evaluate(el=>document.activeElement===el),true);
   assert.equal(await purchase.locator('.quantity-control').count(),0);
   await open.dblclick();
   await count(purchase,1).waitFor();
   assert.equal(await cart.count(),0);
   if(width===320){
    for(let quantity=2;quantity<=10;quantity++){
     await plus.click();
     await count(purchase,quantity).waitFor();
    }
    const atTen=await purchase.evaluate(el=>{
     const cta=el.querySelector('button').getBoundingClientRect();
     const counter=el.querySelector('.quantity-control').getBoundingClientRect();
     const row=el.getBoundingClientRect();
     return cta.right<=counter.left&&counter.right<=row.right+1;
    });
    assert.ok(atTen,'The two-digit count fits beside the action at 320px');
    await inCart.click();
    await count(cart,10).waitFor();
    await action(cart,'Удалить Expert').click();
    await action(cart,'Закрыть окно').click();
    await open.waitFor();
    await open.evaluate(button=>button.click());
    await count(purchase,1).waitFor();
   }
   const logo=page.locator('.marketplace-brand');
   assert.equal(await logo.getAttribute('href'),'?tab=store&page=shop');
   if(width===1440){
    await plus.click();
    await inCart.and(purchase.locator('button[aria-busy=true]')).waitFor();
   }
   await logo.click();
   await page.waitForURL(url=>url.searchParams.get('tab')==='store'&&url.searchParams.get('page')==='shop'&&!url.searchParams.has('product'));
   await page.locator('.has-page-skeleton').waitFor({state:'detached'});
   const card = name => page.locator('.store-grid article').filter({has:page.getByRole('link',{name:`Подробнее: ${name}`,exact:true})});
   const expert = card('Expert');
   if(width===1440){
    await page.waitForTimeout(650);
    assert.equal(await page.getByRole('button',{name:'Корзина · 1 товаров',exact:true}).isVisible(),true);
   }
   const balance = card('Balance');
   await action(expert,'В корзине: Expert').waitFor();
   const balanceAdd = action(balance,'В корзину: Balance');
   assert.equal(await balanceAdd.getAttribute('data-button-kind'),'icon');
   const iconSize=button=>button.evaluate(el=>[el.offsetWidth,el.offsetHeight]);
   assert.deepEqual(await iconSize(balanceAdd),[48,48]);
   if(width===1440){
    await balanceAdd.click();
    await balanceAdd.and(balance.locator('button[aria-busy=true]')).waitFor();
    await balance.getByRole('link',{name:'Подробнее: Balance'}).evaluate(el=>el.click());
    await purchase.waitFor();
    await page.getByRole('heading',{name:'Balance',exact:true}).waitFor();
    await page.waitForTimeout(650);
    assert.equal(await action(purchase,'В корзину').isVisible(),true);
    assert.equal(await page.getByRole('button',{name:'Корзина · 1 товаров',exact:true}).isVisible(),true);
    await action(page,'Вернуться в каталог').click();
   }
   await balanceAdd.dblclick();
   await balanceAdd.and(balance.locator('button[aria-busy=true]')).waitFor();
   assert.equal(await balanceAdd.isDisabled(),true);
   assert.deepEqual(await iconSize(balanceAdd),[48,48]);
   assert.equal(await page.getByRole('button',{name:'Корзина · 1 товаров',exact:true}).isVisible(),true);
   const catalogPendingCart=await page.evaluate(async()=>{
    await new Promise(resolve=>setTimeout(resolve,200));
    return JSON.parse(sessionStorage.getItem('virena-checkout-cart')||'[]');
   });
   assert.deepEqual(catalogPendingCart,[{productId:'expert',quantity:1}]);
   const balanceInCart = action(balance,'В корзине: Balance');
   await balanceInCart.waitFor();
   assert.equal(await balanceInCart.getAttribute('data-tone'),'Soft');
   assert.equal(await balanceInCart.getAttribute('data-button-kind'),'icon');
   assert.equal(await balanceInCart.locator('.cab-solar-icon').count(),1);
   assert.deepEqual(await iconSize(balanceInCart),[48,48]);
   assert.equal(await cart.count(),0);
   assert.equal(new URL(page.url()).searchParams.has('product'),false);
   assert.equal(await page.locator('.store-grid .quantity-control').count(),0);
   assert.equal(await balanceInCart.evaluate(el=>el.getBoundingClientRect().right<=el.closest('article').getBoundingClientRect().right),true);
   if(screenshotDir)await balance.screenshot({path:`${screenshotDir}/catalog-card-${width}.png`,animations:'disabled'});
   await balanceInCart.click();
   await cart.getByLabel('Количество Balance: 1',{exact:true}).waitFor();
   await count(cart,1).waitFor();
   await action(cart,'Удалить Balance').click();
   await action(cart,'Закрыть окно').click();
   await balanceAdd.waitFor();
   await page.getByRole('button',{name:/^Корзина · 1 товаров$/}).waitFor();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   console.log(`PASS ${width}px: pending add and quantity, fixed geometry, cart sync, keyboard removal, catalog icons and logo navigation.`);
  } finally {await page.close();}
 }
} finally {await browser.close();}
