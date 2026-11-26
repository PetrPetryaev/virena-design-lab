import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.env.VIRENA_QA_URL||'http://127.0.0.1:5174/';
const screenshots=process.env.VIRENA_QA_SCREENSHOTS;
try{
 for(const width of [1440,390,320]){
  const page=await browser.newPage({viewport:{width,height:950},reducedMotion:width===390?'reduce':'no-preference'});
  const requests=[];
  page.on('request',request=>requests.push([request.url(),request.postData()]));
  await page.addInitScript(()=>sessionStorage.setItem('virena-checkout-cart',JSON.stringify([{productId:'a-scan',quantity:1}])));
  try{
   await page.goto(base+'?tab=store&page=checkout');
   const apply=page.locator('.checkout-stage-actions').getByRole('button',{name:'Применить',exact:true});
   await apply.click();
   const cardOption=page.getByRole('radio',{name:/Банковская карта/});
   const next=page.getByRole('button',{name:'Перейти к оплате',exact:true});
   await cardOption.check();
   await next.click();
   const form=page.locator('.checkout-pay-card');
   const pan=form.getByRole('textbox',{name:'Номер карты',exact:true});
   const expiry=form.getByRole('textbox',{name:'Срок действия',exact:true});
   const cvv=form.getByLabel('Код безопасности',{exact:true});
   const pay=form.getByRole('button',{name:/^Проверить оплату на /});
   const filler=form.getByRole('button',{name:'Заполнить тестовой картой'});
   const shot=async name=>{if(screenshots)await form.screenshot({path:`${screenshots}/card-${name}-${width}.png`});};
   const fits=()=>form.evaluate(el=>el.scrollWidth<=el.clientWidth);
   for(const field of [pan,expiry,cvv]){
    assert.ok(await field.isEditable());
    assert.equal(await field.getAttribute('inputmode'),'numeric');
   }
   assert.equal(await cvv.getAttribute('type'),'password');
   assert.ok(await fits());
   assert.equal((await expiry.boundingBox()).y,(await cvv.boundingBox()).y);
   await pay.click();
   assert.equal(await form.getByRole('alert').count(),3);
   await pan.and(page.locator(':focus')).waitFor();
   await pan.fill('4000000000000002');
   await expiry.fill('0120');
   await expiry.blur();
   assert.equal(await expiry.inputValue(),'01 / 20');
   await form.getByRole('alert').getByText('Срок действия карты истёк',{exact:true}).waitFor();
   await form.getByRole('alert').getByText(/Для проверки используйте тестовый номер/).waitFor();
   await cvv.fill('71');
   await cvv.blur();
   await form.getByRole('alert').getByText('Введите 3 или 4 цифры',{exact:true}).waitFor();
   await form.getByRole('button',{name:'Где найти код безопасности'}).click();
   await form.getByText(/Для проверки введите 123/).waitFor();
   await form.getByRole('button',{name:'Где найти код безопасности'}).click();
   await filler.click();
   assert.equal(await pan.inputValue(),'4242 4242 4242 4242');
   assert.match(await expiry.inputValue(),/^\d{2} \/ \d{2}$/);
   assert.equal(await cvv.inputValue(),'123');
   await cvv.fill('7431');
   await shot('editable');
   const formHeight=await form.evaluate(el=>el.offsetHeight);
   await pay.evaluate(el=>{el.click();el.click();});
   await pay.and(form.locator('button[aria-busy=true]')).waitFor();
   assert.ok(await pay.isDisabled());
   assert.ok(await pan.isDisabled());
   assert.equal(await form.evaluate(el=>el.offsetHeight),formHeight);
   await shot('loading');
   await form.getByRole('heading',{name:'Проверка формы завершена'}).waitFor();
   await form.getByText('Деньги не списаны. Товары остались в корзине.',{exact:true}).waitFor();
   assert.deepEqual(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('virena-checkout-cart'))),[{productId:'a-scan',quantity:1}]);
   assert.ok(await fits());
   await shot('result');
   await form.getByRole('button',{name:'Вернуться к оформлению'}).click();
   await next.click();
   await pan.waitFor();
   assert.equal(await pan.inputValue(),'');
   assert.equal(await expiry.inputValue(),'');
   assert.equal(await cvv.inputValue(),'');
   await filler.click();
   await pay.click();
   await pay.and(form.locator('button[aria-busy=true]')).waitFor();
   await page.getByRole('button',{name:'Назад',exact:true}).click();
   await page.waitForTimeout(650);
   assert.equal(await form.count(),0);
   assert.equal(await page.getByRole('heading',{name:'Проверка формы завершена'}).count(),0);
   const storage=await page.evaluate(()=>JSON.stringify([localStorage,sessionStorage,history.state,location.href]));
   const external=JSON.stringify(requests);
   for(const sample of ['4242424242424242','4242 4242 4242 4242','4000000000000002','4000 0000 0000 0002','7431']){
    assert.ok(!storage.includes(sample), 'Card input must not enter lasting browser state');
    assert.ok(!external.includes(sample), 'Card input must not enter requests');
   }
   console.log(`PASS ${width}: editable masked card, local allowlist/errors, pending geometry, cart retained, cancel and no credential persistence/network.`);
  }finally{await page.close();}
 }
}finally{await browser.close();}
