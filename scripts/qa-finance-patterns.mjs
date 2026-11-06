import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const base=process.env.TEST_URL||'http://127.0.0.1:5174';
const url=view=>{const u=new URL(base);u.searchParams.set('tab','cabinet');u.searchParams.set('page','finances');u.searchParams.set('financeView',view);return u.href;};
// Evaluate the actual source expressions for states that fixtures cannot select directly.
const source=await readFile(new URL('../src/cabinet/components/FinanceIncome.jsx',import.meta.url),'utf8');
const expression=name=>source.match(new RegExp('const '+name+'=([^;]+);'))?.[1];
const tone=new Function('comparison','return '+expression('trendTone'));
const label=new Function('comparison','return '+expression('comparisonLabel'));
for(const [value,expectedTone,expectedLabel] of [[null,'','Нет данных для сравнения'],[0,'','Без изменений'],[12,'is-up','+12%'],[-8,'is-down','−8%']]){assert.equal(tone(value),expectedTone);assert.equal(label(value),expectedLabel);}
assert.match(source,/trendTone&&<Shared.Icon/);
assert.match(source,/comparison===0\?'finance-muted'/);
const browser=await chromium.launch({channel:'chrome',headless:true});
const results=[];
try{
 for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
  const page=await browser.newPage({viewport});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(url('history'));await page.getByRole('tab',{name:'Баллы',exact:true}).click();
  const rows=page.locator('#finance-history-results .ds-table-body>.ds-table-row');await rows.first().waitFor();const initialRows=await rows.count();assert.ok(initialRows>0);
  await page.getByRole('button',{name:'Фильтры',exact:true}).click();
  await page.getByRole('combobox',{name:'Нога',exact:true}).click();await page.getByRole('option',{name:'Правая нога',exact:true}).click();
  await page.getByRole('checkbox',{name:'Сгорает за 30 дней',exact:true}).click();await page.getByRole('button',{name:'Закрыть фильтры',exact:true}).click();
  await page.getByRole('heading',{name:'Баллов по этим условиям нет',exact:true}).waitFor();assert.equal(await rows.count(),0);
  await page.locator('#finance-history-results').getByRole('button',{name:'Сбросить фильтры',exact:true}).click();await rows.first().waitFor();assert.equal(await rows.count(),initialRows);
  assert.equal(await page.getByRole('button',{name:/^Фильтры ·/}).count(),0);
  await page.goto(url('overview'));
  const change=page.locator('.finance-income-change');assert.equal(await change.count(),0);await page.getByRole('tab',{name:'М',exact:true}).click();await change.waitFor();assert.match(await change.innerText(),/[+−]\d+%/);
  await page.getByRole('tab',{name:'Все',exact:true}).click();assert.equal(await change.count(),0);
  await page.getByRole('button',{name:'Заявка на вывод',exact:true}).first().click();const dialog=page.getByRole('dialog',{name:'Заявка на вывод',exact:true});await dialog.waitFor();
  // Padding belongs to the modal, not the backdrop.
  const box=await dialog.boundingBox();await page.mouse.click(box.x+box.width-5,box.y+box.height/2);assert.equal(await dialog.isVisible(),true);
  const point=box.y>1?{x:viewport.width/2,y:Math.max(0,box.y/2)}:box.x>1?{x:box.x/2,y:viewport.height/2}:null;
  assert.ok(point,'Modal must leave a backdrop area for outside-dismiss test');await page.mouse.click(point.x,point.y);await dialog.waitFor({state:'hidden'});
  // Reopen and verify explicit close too.
  await page.getByRole('button',{name:'Заявка на вывод',exact:true}).first().click();await dialog.getByRole('button',{name:'Закрыть окно',exact:true}).click();await dialog.waitFor({state:'hidden'});
  assert.deepEqual(errors,[]);results.push({viewport,pointsReset:true,withdrawInsideStable:true,withdrawOutsideDismiss:true,errors});await page.close();
 }
 console.log(JSON.stringify({comparisonStates:4,results},null,2));
}finally{await browser.close();}
