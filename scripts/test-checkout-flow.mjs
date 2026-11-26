import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const browser=await chromium.launch({channel:'chrome'});
const base=(process.env.VIRENA_QA_URL||'http://127.0.0.1:5174/')+'?tab=store&page=';
const screenshots=process.env.VIRENA_QA_SCREENSHOTS;
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
page.setDefaultTimeout(12000);
const stage=name=>page.locator(`[data-checkout-stage="${name}"]`);
const button=(name,parent=page)=>parent.getByRole('button',{name,exact:true});
const heading=(name,parent=page)=>parent.getByRole('heading',{name,exact:true});
const summary=page.getByRole('complementary',{name:'Итоги оформления'});
const apply=()=>button('Применить',page.locator('.checkout-stage-actions'));
const edit=name=>button('Изменить: '+name);
const next=()=>button('Перейти к оплате',page.locator('.checkout-stage-actions'));
const goPay=async()=>{
 await stage('payment').getByRole('radio',{name:/Банковская карта/}).check();
 await next().click();
 await heading('Оплата банковской картой',page.locator('.checkout-pay-card')).waitFor();
};
const shot=async name=>{if(screenshots)await page.screenshot({path:`${screenshots}/${name}.png`,animations:'disabled'});};
const chooseShowroom=async()=>{
 await stage('fulfillment').getByRole('tab',{name:'Забрать в шоу-руме'}).click();
 await stage('fulfillment').getByRole('radio',{name:/Садовая/}).click();
 assert.ok(await stage('fulfillment').getByRole('radio',{name:/Садовая/}).isChecked());
};
try{
 for(const width of [1440,390,320]){
  if(width===390)await page.getByRole('button',{name:'Тёмная тема',exact:true}).click();
  await page.setViewportSize({width,height:1000});
  await page.goto(base+'checkout&checkoutScenario=recipient-ready');
  await stage('buyer').getByRole('tab',{name:'Себе',exact:true}).waitFor();
  assert.equal(await stage('fulfillment').getByRole('tab').count(),0);
  assert.equal(await stage('payment').getByRole('radio').count(),0);
  assert.equal(await stage('buyer').getByRole('button',{name:'Применить'}).count(),0);
  assert.equal(await summary.locator('.checkout-item').count(),1);
  assert.equal(await summary.getByRole('button').count(),0);
  assert.equal(await next().count(),0);
  assert.equal(await summary.getByText(/Заказ на/).count(),0);
  const asideWidth=await summary.evaluate(el=>el.clientWidth);
  assert.equal(await summary.evaluate(el=>getComputedStyle(el).position),width===1440?'sticky':'static');
  await shot(`buyer-${width}`);
  if(width===390){
   assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'dark');
   await stage('buyer').getByRole('tab',{name:'На другой аккаунт'}).click();
   await apply().click();
   await stage('buyer').getByRole('alert').getByText('Найдите и подтвердите ячейку получателя',{exact:true}).waitFor();
   const recipient=stage('buyer').getByRole('textbox',{name:'ID ячейки получателя'});
   await recipient.and(page.locator(':focus')).waitFor();
   await recipient.fill('VR-100081');
   await stage('buyer').getByRole('radio',{name:/anna\.volkova/}).click();
  }
  await apply().click();
  await stage('fulfillment').locator('h2').and(page.locator(':focus')).waitFor();
  assert.equal(await stage('buyer').getByRole('tab').count(),0);
  await summary.getByText(width===390?/Заказ на anna\.volkova/:/Заказ на Александра Соколова/).waitFor();
  await apply().click();
  await stage('fulfillment').getByRole('alert').getByText('Выберите дату доставки',{exact:true}).waitFor();
  await chooseShowroom();
  assert.equal(await summary.getByRole('region',{name:'Получение'}).count(),0);
  if(width===390){
   await apply().click();
   await stage('fulfillment').getByRole('alert').getByText('Укажите телефон получателя',{exact:true}).waitFor();
   await stage('fulfillment').getByRole('textbox',{name:'Имя и фамилия получателя'}).fill('Оченьдлинноеимя'.repeat(10));
   await stage('fulfillment').getByRole('textbox',{name:'Телефон получателя'}).fill('9991234567');
  }
  await shot(`pickup-${width}`);
  await apply().click();
  await summary.getByRole('region',{name:'Получение'}).getByText(/Садовая/).waitFor();
  assert.equal(await summary.evaluate(el=>el.clientWidth),asideWidth);
  assert.equal(await page.locator('.checkout').evaluate(el=>el.scrollWidth<=el.clientWidth+1),true);
  assert.ok(await next().isEnabled());
  await next().click();
  await stage('payment').getByRole('alert').getByText('Выберите способ оплаты',{exact:true}).waitFor();
  const card=stage('payment').getByRole('radio',{name:/Банковская карта/});
  if(width===1440){
   const cards=stage('payment').locator('.checkout-payment-option');
   assert.ok(await cards.evaluateAll(([first,second])=>Math.abs(first.getBoundingClientRect().y-second.getBoundingClientRect().y)<1));
   const bonus=stage('payment').getByRole('switch',{name:'Использовать бонусный счёт'});
   await bonus.click();
   assert.equal(await bonus.getAttribute('aria-checked'),'true');
   await summary.getByText('Бонусами',{exact:true}).waitFor();
   await card.check();
   await edit('Покупатель').click();
   assert.equal(await next().count(),0);
   await apply().click();
   assert.ok(await next().isEnabled());
   await edit('Получение').click();
   await stage('fulfillment').getByRole('tab',{name:'Доставка на адрес'}).click();
   await stage('fulfillment').getByRole('group',{name:'Дата доставки'}).getByRole('radio').first().check();
   await stage('fulfillment').getByRole('group',{name:'Время доставки'}).getByRole('radio').first().check();
   assert.match(await summary.getByRole('region',{name:'Получение'}).innerText(),/Садовая/);
   await shot('delivery-1440');
   await apply().click();
   await summary.getByRole('region',{name:'Получение'}).getByText('Курьером',{exact:true}).waitFor();
   assert.match(await summary.locator('.checkout-subtotal dd').innerText(),/674,90/);
   assert.ok(await next().isEnabled());
   assert.ok(await card.isChecked());
   await bonus.click();
  }
  await shot(`payment-${width}`);
  await goPay();
  assert.ok(await page.getByRole('textbox',{name:'Номер карты',exact:true}).isEditable());
  await button('Назад').click();
  await stage('payment').locator('h2').and(page.locator(':focus')).waitFor();
  assert.ok(await card.isChecked());
  assert.match(await summary.getByRole('region',{name:'Получение'}).innerText(),width===1440?/Курьером/:/Садовая/);
  if(width===1440){
   await edit('Покупатель').click();
   await stage('buyer').getByRole('tab',{name:'На другой аккаунт'}).click();
   await stage('buyer').getByRole('textbox',{name:'ID ячейки получателя'}).fill('VR-100081');
   await stage('buyer').getByRole('radio',{name:/anna\.volkova/}).click();
   await summary.getByText(/Заказ на Александра Соколова/).waitFor();
   await summary.getByRole('region',{name:'Получение'}).getByText('Курьером',{exact:true}).waitFor();
   await apply().click();
   await summary.getByText(/Заказ на anna\.volkova/).waitFor();
   await stage('fulfillment').getByRole('tab',{name:'Доставка на адрес'}).waitFor();
   assert.equal(await summary.getByRole('region',{name:'Получение'}).count(),0);
   assert.equal(await stage('payment').getByRole('radio').count(),0);
   assert.equal(await next().count(),0);
  }
  console.log(`PASS ${width} px: step locks, applied summaries, editing, long text and card back.`);
 }

 await page.evaluate(()=>sessionStorage.setItem('virena-checkout-cart',JSON.stringify([{productId:'a-scan',quantity:1}])));
 await page.goto(base+'checkout');
 assert.equal(await stage('fulfillment').count(),0);
 await apply().click();
 await goPay();
 await button('Заполнить тестовой картой').click();
 await page.getByRole('button',{name:/Проверить оплату на/}).click();
 await heading('Проверка формы завершена').waitFor();
 assert.equal(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('virena-checkout-cart')).length),1);

 await page.goto(base+'checkout');
 await stage('buyer').getByRole('tab',{name:'Себе'}).waitFor();
 await apply().click();
 if(await stage('fulfillment').count()){
  await chooseShowroom();
  await apply().click();
 }
 const balanceOption=stage('payment').getByRole('radio',{name:/Балансовый счёт/});
 assert.match(await balanceOption.evaluate(el=>el.closest('label').innerText),/Доступно 1\s?000,00\s€/);
 await balanceOption.check();
 await next().click();
 const balanceActions=page.locator('.checkout-stage-actions');
 await balanceActions.getByRole('heading',{name:'Оплата с балансового счёта'}).waitFor();
 assert.equal(await page.locator('.checkout-pay-card').count(),0);
 assert.ok(await balanceActions.getByRole('button',{name:/^Оплатить /}).isDisabled());

 await page.goto(base+'shop');
 await button('Настройки витрины').click();
 await page.getByLabel('Состояние корзины').selectOption('payment-balance-insufficient');
 await page.keyboard.press('Escape');
 await page.getByRole('button',{name:/^Корзина/}).first().click();
 await button('Перейти к оформлению',page.getByRole('dialog',{name:'Корзина'})).click();
 await apply().click();
 if(await stage('fulfillment').count()){
  await chooseShowroom();
  await apply().click();
 }
 assert.ok(await stage('payment').getByRole('radio',{name:/Балансовый счёт.*Не хватает/}).isDisabled());

 await page.goto(base+'shop');
 await button('Настройки витрины').click();
 await page.getByLabel('Состояние корзины').selectOption('submit-error');
 await page.keyboard.press('Escape');
 await page.getByRole('button',{name:/^Корзина/}).first().click();
 await button('Перейти к оформлению',page.getByRole('dialog',{name:'Корзина'})).click();
 await apply().click();
 if(await stage('fulfillment').count()){
  await chooseShowroom();
  await apply().click();
 }
 assert.ok(await stage('payment').getByRole('radio',{name:/Балансовый счёт.*Остаток пока недоступен/}).isDisabled());
 await stage('payment').getByRole('radio',{name:/Банковская карта/}).check();
 await next().click();
 await balanceActions.getByRole('alert').getByText(/Не удалось создать заказ/).waitFor();
 assert.equal(await summary.getByRole('button').count(),0);
 await button('Повторить оформление',balanceActions).click();
 await heading('Оплата банковской картой',page.locator('.checkout-pay-card')).waitFor();

 await page.goto(base+'checkout&visitor=guest');
 await heading('Войдите, чтобы оформить заказ').waitFor();
 assert.equal(await stage('buyer').count(),0);
 assert.equal(await next().count(),0);
 assert.deepEqual(errors,[]);
 console.log('PASS digital skip, balance, retry, retained cart and guest gate.');
}finally{await browser.close();}
