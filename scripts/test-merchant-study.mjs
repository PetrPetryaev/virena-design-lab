import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const browser=await chromium.launch({channel:'chrome'});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const base=process.env.VIRENA_QA_URL||'http://127.0.0.1:5174/';
const screenshots=process.env.VIRENA_QA_SCREENSHOTS;
const seeded=[{productId:'deep-sleep',quantity:2}];
const variants=[['virena','Наша'],['megafon','МегаФон'],['mts','МТС'],['restore','restore:'],['dns','DNS'],['mvideo','М.Видео']];
const errors=[];
page.setDefaultTimeout(5000);
page.on('pageerror',error=>errors.push(error.message));
await page.addInitScript(lines=>{
 if(!sessionStorage.getItem('merchant-test-seeded')){
  sessionStorage.setItem('virena-checkout-cart',JSON.stringify(lines));
  sessionStorage.setItem('merchant-test-seeded','1');
 }
},seeded);
const study=page.locator('.merchant-study');
const nav=study.getByRole('navigation',{name:'Версия магазина'});
const byName=(within,name)=>within.getByRole('button',{name,exact:true});
const originalCart=()=>page.evaluate(()=>JSON.parse(sessionStorage.getItem('virena-checkout-cart')));
const select=async(brand,name)=>{
 const button=byName(nav,name);
 await button.click();
 assert.equal(await button.getAttribute('aria-pressed'),'true');
 const screen=study.locator(brand==='virena'?'.merchant-current':'[data-merchant="'+brand+'"]');
 await screen.waitFor();
 return screen;
};
const capture=async name=>{if(screenshots)await page.screenshot({path:screenshots+'/'+name+'.png',animations:'disabled'});};
const fits=async element=>assert.ok(await element.evaluate(node=>node.scrollWidth<=node.clientWidth+1),'Horizontal overflow in '+await element.getAttribute('data-merchant'));

try{
 await page.goto(base+'?tab=store&page=checkout&checkoutStudy=1');
 await study.getByRole('heading',{level:1}).waitFor();
 assert.deepEqual(await originalCart(),seeded);
 assert.equal(await nav.getByRole('button').count(),6);
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:1000});
  for(const [brand,name] of variants){
   const screen=await select(brand,name);
   await fits(study);
   await fits(screen);
   await screen.evaluate(node=>node.closest('.cab-main')?.scrollTo(0,0));
   await capture(brand+'-'+width);
  }
 }
 await page.setViewportSize({width:1440,height:1000});
 const mega=await select('megafon','МегаФон');
 await byName(mega,'Увеличить количество').click();
 await mega.locator('.merchant-total').getByText('1380 €',{exact:true}).first().waitFor();
 await byName(mega,'Уменьшить количество').click();
 await mega.locator('.merchant-total').getByText('690 €',{exact:true}).first().waitFor();
 const clearTrigger=byName(mega,'Очистить корзину');
 await clearTrigger.click();
 const clear=page.getByRole('dialog',{name:'Удалить товары из корзины?'});
 await byName(clear,'Отмена').click();
 await clear.waitFor({state:'hidden'});
 await mega.getByText('Expert',{exact:true}).waitFor();
 await clearTrigger.click();
 await page.keyboard.press('Escape');
 await clear.waitFor({state:'hidden'});
 await mega.getByText('Expert',{exact:true}).waitFor();
 await clearTrigger.click();
 await byName(clear,'Удалить').click();
 await clear.waitFor({state:'hidden'});
 await mega.getByText('Корзина пуста',{exact:true}).waitFor();
 assert.deepEqual(await originalCart(),seeded);

 const dns=await select('dns','DNS');
 await byName(dns,'Корзина').click();
 const displayModels=dns.getByRole('switch',{name:'Скрыть витринные образцы'});
 await displayModels.check();
 assert.ok(await displayModels.isChecked());
 await byName(dns,'Перейти к оформлению').click();
 await dns.getByRole('heading',{name:'Данные покупателя'}).waitFor();

 const mvideo=await select('mvideo','М.Видео');
 const other=mvideo.getByRole('switch',{name:'Получит другой человек'});
 const receiver=mvideo.getByPlaceholder('Имя',{exact:true});
 await other.check();
 await receiver.fill('Тест');
 await other.uncheck();
 await receiver.waitFor({state:'hidden'});
 await other.check();
 await receiver.waitFor();
 await mvideo.getByText('Тестовый покупатель',{exact:true}).waitFor();
 await capture('mvideo-receiver');

 const mts=await select('mts','МТС');
 const card=title=>mts.locator('.merchant-box').filter({has:page.getByRole('heading',{name:new RegExp('^'+title)})});
 await byName(card('Способ получения'),'Изменить').click();
 await card('Способ получения').getByRole('group',{name:'Способ получения'}).waitFor();
 assert.equal(await card('Получатель').getByRole('textbox').count(),0);
 await byName(card('Способ получения'),'Продолжить').click();
 await card('Способ оплаты').getByRole('radio',{name:'Сейчас онлайн'}).check();
 await byName(card('Способ оплаты'),'Продолжить').click();
 await card('Получатель').getByPlaceholder('Имя',{exact:true}).waitFor();

 await page.setViewportSize({width:390,height:900});
 const restore=await select('restore','restore:');
 const edit=byName(restore,'Изменить');
 const delivery=page.getByRole('dialog',{name:'Способ получения',exact:true});
 await edit.click();
 await delivery.waitFor();
 await fits(delivery);
 await page.keyboard.press('Escape');
 await delivery.waitFor({state:'hidden'});
 await edit.and(page.locator(':focus')).waitFor();
 await edit.click();
 await byName(delivery,'Доставка').click();
 await delivery.getByPlaceholder('Укажите адрес',{exact:true}).fill('Тестовая улица, 5');
 const date=delivery.getByRole('button',{name:/1 декабря/});
 await date.click();
 assert.equal(await date.getAttribute('aria-pressed'),'true');
 await byName(delivery,'14:00–18:00').click();
 await capture('restore-date-390');
 await byName(delivery,'Выбрать').click();
 await delivery.waitFor({state:'hidden'});
 await restore.getByText('Тестовая улица, 5',{exact:false}).waitFor();
 await restore.getByText('1 декабря, 14:00–18:00',{exact:false}).waitFor();
 await edit.click();
 assert.equal(await delivery.getByPlaceholder('Укажите адрес',{exact:true}).inputValue(),'Тестовая улица, 5');
 assert.equal(await date.getAttribute('aria-pressed'),'true');
 assert.equal(await byName(delivery,'14:00–18:00').getAttribute('aria-pressed'),'true');
 await byName(delivery,'В магазине').click();
 await page.keyboard.press('Escape');
 await delivery.waitFor({state:'hidden'});
 await edit.and(page.locator(':focus')).waitFor();
 await restore.getByText('Тестовая улица, 5',{exact:false}).waitFor();
 const megaAgain=await select('megafon','МегаФон');
 const method=megaAgain.getByRole('group',{name:'Способ получения',exact:true});
 await byName(method,'Доставка').click();
 await page.keyboard.press('Escape');
 await page.getByRole('dialog',{name:'Выберите способ получения'}).waitFor({state:'hidden'});
 assert.equal(await byName(method,'Самовывоз').getAttribute('aria-pressed'),'true');
 assert.deepEqual(await originalCart(),seeded);
 await byName(study,'Сравнение по блокам →').click();
 await page.getByRole('heading',{name:'Сравнение оформления заказа'}).waitFor();
 await byName(page,'← Версии магазинов').click();
 await study.getByRole('heading',{level:1}).waitFor();

 await page.goto(base+'?tab=store&page=checkout');
 await page.getByRole('heading',{name:'Покупатель',exact:true}).waitFor();
 await page.getByText('Deep Sleep',{exact:true}).waitFor();
 assert.deepEqual(await originalCart(),seeded);
 assert.deepEqual(errors,[]);
 console.log('PASS six merchant versions at 1440 and 390; cart isolation; M.Video receiver; restore modal and date; MTS accordion; block routing');
}finally{await browser.close();}
