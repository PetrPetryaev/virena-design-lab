import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const b=await chromium.launch({channel:'chrome'}),p=await b.newPage({viewport:{width:1600,height:1100}});
const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto(process.env.TEST_URL||'http://localhost:5174/');
for(const name of ['Media','Banner','Profile','Sponsor']){
 await p.getByRole('button',{name:`Virena / ${name} card`,exact:false}).click();
 await p.getByRole('heading',{name:`Virena / ${name} card`}).waitFor();
 for(const tone of ['white','soft']){
  await p.getByLabel('Фон',{exact:true}).selectOption(tone);
  assert.equal(await p.locator('.card-demo-stage>[data-surface]').getAttribute('data-surface'),tone);
 }
 const card=p.locator('.card-demo-stage>[data-surface]');
 const ready=await card.boundingBox();
 await p.getByLabel('Состояние',{exact:true}).selectOption('loading');
 const loading=await card.boundingBox();
 assert(Math.abs(ready.height-loading.height)<1,`${name}: loading changed height`);
 assert.equal(await card.getAttribute('aria-busy'),'true');
 await p.getByLabel('Состояние',{exact:true}).selectOption('ready');
 if(['Profile','Sponsor'].includes(name)){
  await p.getByLabel('Состояние',{exact:true}).selectOption('loading');
  const fill=await p.locator('.overview-loading span').first().evaluate(e=>({bg:getComputedStyle(e).backgroundColor,line:getComputedStyle(e).getPropertyValue('--lab-line')}));
  assert(!fill.bg.includes('221, 221, 221'),JSON.stringify(fill));
  await p.getByLabel('Состояние',{exact:true}).selectOption('error');
  await p.getByRole('button',{name:'Повторить',exact:true}).click();
  assert.equal(await p.getByLabel('Состояние',{exact:true}).inputValue(),'ready');
 }else{
  const select=p.getByLabel('Содержимое',{exact:true});
  const values=await select.locator('option').evaluateAll(es=>es.map(e=>e.value));
  for(const value of values){await select.selectOption(value);await p.locator('.card-demo-stage button').first().click();assert.match(await p.locator('.card-demo-status').innerText(),/Демо-переход/);}
 }
}
await p.getByRole('switch',{name:'Тёмная тема'}).click();
await p.getByLabel('Состояние',{exact:true}).selectOption('loading');
await p.screenshot({path:'artifacts/card-catalog-dark.png'});
assert.deepEqual(errors,[]);await b.close();console.log('Card catalog: families, surfaces, content, loading/error/retry, actions and dark passed');
