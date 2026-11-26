import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const base=process.env.VIRENA_QA_URL||'http://127.0.0.1:5174/';
const screenshots=process.env.VIRENA_QA_SCREENSHOTS;
const browser=await chromium.launch({channel:'chrome'});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const failures=[];
page.on('pageerror',error=>failures.push(error.message));
page.setDefaultTimeout(5000);
const original=[{productId:'deep-sleep',quantity:2}];
await page.addInitScript(value=>{
 if(!sessionStorage.getItem('study-seeded')){
  sessionStorage.setItem('virena-checkout-cart',JSON.stringify(value));
  sessionStorage.setItem('study-seeded','true');
 }
},original);
const shot=async name=>{if(screenshots)await page.screenshot({path:screenshots+'/'+name+'.png',animations:'disabled'});};
const left=page.getByRole('region',{name:'Текущая Virena'});
const right=page.getByRole('region',{name:'Альтернатива',exact:true});
const tab=name=>page.getByRole('tab',{name,exact:true});
const button=(scope,name)=>scope.getByRole('button',{name,exact:true});
try{
 await page.goto(base+'?tab=store&page=checkout&checkoutStudy=1&studyMode=blocks');
 await page.getByRole('heading',{name:'Сравнение оформления заказа'}).waitFor();
 const before=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('virena-checkout-cart')));
 assert.deepEqual(before,original);
 const [leftBox,rightBox]=await Promise.all([left.boundingBox(),right.boundingBox()]);
 assert.ok(leftBox.x+leftBox.width<=rightBox.x);
 await shot('desktop-flow');
 await left.getByRole('heading',{name:'Покупатель',exact:true}).waitFor();
 await left.getByRole('heading',{name:'Получение',exact:true,level:2}).waitFor();
 await button(right,'Подтвердить аккаунт').click();
 const account=right.getByRole('button',{name:/Аккаунт заказа/});
 const fulfillment=right.getByRole('button',{name:/^2 Получение/});
 assert.equal(await account.getAttribute('aria-expanded'),'false');
 assert.equal(await fulfillment.getAttribute('aria-expanded'),'true');
 const dialog=page.getByRole('dialog',{name:'Как получить заказ'});
 await button(right,'Подтвердить получение').click();
 await right.getByRole('alert').getByText('Выберите дату доставки').waitFor();
 await right.getByRole('tab',{name:'Забрать в шоу-руме'}).click();
 await right.getByRole('radio',{name:/Мира/}).click();
 await button(right,'Подтвердить получение').click();
 assert.equal(await fulfillment.getAttribute('aria-expanded'),'false');
 await right.getByText(/Мира/).waitFor();
 assert.equal(await right.locator('.checkout-fulfillment-details').evaluate(node=>getComputedStyle(node).display),'grid');
 const masks=await right.locator('.checkout-payment-icon').evaluateAll(nodes=>nodes.map(node=>getComputedStyle(node).maskImage));
 assert.ok(masks.length===2&&masks.every(mask=>mask.startsWith('url(')));
 await shot('desktop-flow-payment');
 await right.getByRole('radio',{name:/Банковская карта/}).check();
 await button(right,'Подтвердить способ оплаты').click();
 await right.getByRole('button',{name:/^4 Проверка заказа/}).waitFor();
 await button(right,'Перейти к оплате картой').click();
 await right.getByRole('status').getByText('Платёжная форма недоступна.').waitFor();
 await button(right,'Изменить получение').click();
 assert.equal(await fulfillment.getAttribute('aria-expanded'),'true');
 assert.ok(await right.getByRole('radio',{name:/Мира/}).isChecked());
 await shot('desktop-flow-edited');

 await tab('Корзина').click();
 await left.getByRole('heading',{name:'Ваш заказ'}).waitFor();
 await button(right,'Добавить в корзину').click();
 const added=page.getByRole('dialog',{name:'Товар в корзине'});
 await button(added,'Продолжить покупки').click();
 await added.waitFor({state:'hidden'});
 await button(right,'Добавить в корзину').click();
 await button(added,'В корзину').click();
 await right.getByRole('heading',{name:'Ваш заказ'}).waitFor();

 await tab('Аккаунт').click();
 await right.getByRole('tab',{name:'На другой аккаунт'}).click();
 await right.getByRole('textbox',{name:'ID ячейки получателя'}).fill('VR-100081');
 await right.getByRole('radio',{name:/anna\.volkova/}).click();
 await button(right,'Подтвердить аккаунт').click();
 await right.getByText(/anna\.volkova/).waitFor();
 await right.getByText(/Оплачивает Александра Соколова/).waitFor();

 await tab('Кто получит').click();
 await right.getByRole('switch',{name:'Получит другой человек'}).click();
 await right.getByRole('textbox',{name:'Имя и фамилия получателя'}).fill('Ирина Волкова');
 assert.equal(await left.getByRole('textbox',{name:'Имя и фамилия получателя'}).count(),0);
 await right.getByText('Покупатель',{exact:true}).waitFor();

 await tab('Дата и время').click();
 const leftDays=left.getByRole('group',{name:'Дата доставки'});
 const rightDays=right.getByRole('group',{name:'Дата доставки'});
 await leftDays.getByRole('radio').first().check();
 await rightDays.getByRole('radio').nth(1).check();
 assert.ok(await leftDays.getByRole('radio').first().isChecked());
 await right.getByRole('group',{name:'Время доставки'}).getByRole('radio').first().check();
 await right.getByRole('status').waitFor();
 await shot('desktop-dates');

 await tab('Получение').click();
 await button(right,'Изменить получение').click();
 await dialog.getByRole('tab',{name:'Забрать в шоу-руме'}).click();
 await dialog.getByRole('radio',{name:/Мира/}).click();
 await button(dialog,'Сохранить получение').click();
 await right.getByText(/Мира/).waitFor();

 await tab('Оплата').click();
 await right.getByRole('radio',{name:/Балансовый счёт/}).check();
 await button(right,'Продолжить с балансовым счётом').click();
 await right.getByRole('status').waitFor();
 await tab('Сводка').click();
 await button(right,'Изменить оплату').click();
 const payDialog=page.getByRole('dialog',{name:'Способ оплаты'});
 await payDialog.getByRole('radio',{name:/Балансовый счёт/}).check();
 await button(payDialog,'Сохранить').click();
 await right.getByText('Балансовый счёт',{exact:true}).waitFor();
 await shot('desktop-summary');

 await page.setViewportSize({width:390,height:920});
 await tab('Весь сценарий').click();
 const [mobileLeft,mobileRight]=await Promise.all([left.boundingBox(),right.boundingBox()]);
 assert.ok(mobileLeft.y+mobileLeft.height<=mobileRight.y);
 assert.ok(await page.locator('.checkout-study').evaluate(node=>node.scrollWidth<=node.clientWidth));
 await shot('mobile-flow');
 await right.getByRole('button',{name:'Подтвердить аккаунт',exact:true}).click();
 await right.getByRole('tab',{name:'Доставка на адрес'}).waitFor();
 assert.ok(await right.evaluate(node=>node.scrollWidth<=node.clientWidth));
 await shot('mobile-receiving');
 assert.deepEqual(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('virena-checkout-cart'))),before);
 await page.goto(base+'?tab=store&page=checkout');
 assert.equal(await page.getByRole('heading',{name:'Сравнение оформления заказа'}).count(),0);
 await page.getByRole('heading',{name:'Покупатель',exact:true}).waitFor();
 await page.getByText('Deep Sleep',{exact:true}).waitFor();
 assert.deepEqual(failures,[]);
 console.log('PASS isolated checkout study, 8 views, accordion and edit, cart, branch isolation, and 390 px');
}finally{await browser.close();}
