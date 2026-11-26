import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const browser=await chromium.launch({channel:'chrome'});
const base=process.env.VIRENA_QA_URL||'http://127.0.0.1:5174/';
const page=await browser.newPage({viewport:{width:1440,height:1000}});
page.setDefaultTimeout(12000);
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
const button=(name,region=page)=>region.getByRole('button',{name,exact:true});
const dialog=id=>page.getByRole('dialog',{name:'Заказ № '+id});
async function confirmOrder(physical=false){
 await page.goto(base+'?tab=store&page=checkout&checkoutScenario=payment-paid');
 const apply=()=>button('Применить',page.locator('.checkout-stage-actions')).click();
 await apply();
 if(physical){
  await page.getByRole('tab',{name:'Забрать в шоу-руме'}).click();
  await page.getByRole('radio',{name:/Садовая/}).click();
  await apply();
 }
 await page.getByRole('radio',{name:/Банковская карта/}).check();
 await button('Перейти к оплате',page.locator('.checkout-stage-actions')).click();
 await button('Заполнить тестовой картой').click();
 await page.getByRole('button',{name:/Проверить оплату на/}).click();
 const heading=page.getByRole('heading',{name:/^Тестовый заказ № \d+$/});
 await heading.waitFor();
 return (await heading.textContent()).match(/\d+$/)[0];
}

try{
 const first=await confirmOrder();
 const firstConfirmation=page.url();
 await page.reload();
 await page.getByRole('heading',{name:'Тестовый заказ № '+first}).waitFor();
 await page.getByText('Проверка оплаты завершена. Деньги не списаны.').waitFor();
 await page.getByText('Онлайн-продукты · доставка не нужна',{exact:true}).waitFor();
 await page.getByRole('heading',{name:'Аккаунт получателя'}).waitFor();
 const firstTotal=await page.locator('.checkout-subtotal dd').innerText();
 assert.ok(await page.locator('.checkout-success-products li img').count()>0);
 assert.equal(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('virena-checkout-cart')).length),0);
 await button('Мои покупки').click();
 const firstPurchases=page.url();
 await dialog(first).waitFor();
 await page.reload();
 await dialog(first).getByText('Без оплаты',{exact:true}).waitFor();
 assert.equal(await dialog(first).locator('.order-total dd').innerText(),firstTotal);
 await page.keyboard.press('Escape');
 await dialog(first).waitFor({state:'hidden'});
 assert.equal(new URL(page.url()).searchParams.has('intent'),false);

 await page.setViewportSize({width:320,height:900});
 await page.goto(base+'?tab=store&page=shop&product=expert');
 await button('В корзину',page.locator('.store-purchase-area')).click();
 await button('В корзине',page.locator('.store-purchase-area')).waitFor();
 const second=await confirmOrder(true);
 const secondConfirmation=page.url();
 await page.locator('.checkout-receipt').getByText(/Садовая/).waitFor();
 assert.notEqual(second,first);
 assert.ok(await page.locator('.checkout-confirmation').evaluate(el=>el.scrollWidth<=el.clientWidth+1));
 await button('Мои покупки').click();
 await dialog(second).getByText(/Садовая/).waitFor();
 await page.keyboard.press('Escape');
 await dialog(second).waitFor({state:'hidden'});
 await button('Открыть заказ '+first).waitFor();
 await button('Открыть заказ '+second).waitFor();
 await page.goto(base+'?tab=store&page=shop');
 await button('Меню профиля').click();
 await page.getByRole('menuitem',{name:'Мои покупки'}).click();
 await button('Открыть заказ '+second).waitFor();

 await page.goto(firstPurchases);
 await dialog(first).waitFor();
 await page.goto(firstConfirmation);
 await page.getByRole('heading',{name:'Тестовый заказ № '+first}).waitFor();
 await page.goto(base+'?tab=store&page=confirmation&intent=order:909090');
 await page.getByRole('heading',{name:'Нет подтверждённого заказа'}).waitFor();
 await page.goto(secondConfirmation);
 await button('Меню профиля').click();
 await page.getByRole('menuitem',{name:'Выйти'}).click();
 assert.equal(await page.evaluate(()=>sessionStorage.getItem('virena-checkout-orders')),null);
 await page.goto(firstConfirmation);
 await page.getByRole('heading',{name:'Нет подтверждённого заказа'}).waitFor();
 assert.deepEqual(errors,[]);
 console.log('PASS two unique orders, refresh and direct links, drawer dismissal, mobile geometry, missing order and sign-out cleanup.');
}finally{await browser.close();}
