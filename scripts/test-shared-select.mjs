import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const browser = await chromium.launch({channel:'chrome', headless:true});
const base = process.env.VIRENA_QA_URL || 'http://127.0.0.1:5174/';
try {
 const page = await browser.newPage({reducedMotion:'reduce'});
 page.setDefaultTimeout(15000);
 await page.route('**/src/main.jsx*', async route => {
  const response = await route.fetch();
  const fixture = `
const group= db.components.find(c=>c.name==='Auth / Select');
const mount=document.body.appendChild(document.createElement('div'));
document.getElementById('root').hidden=true;
function SelectFixture(){
 const [chosen,setChosen]=useState('');
 const [count,setCount]=useState(0);
 const [pending,enable]=useState(false);
 const select=(label,props)=>React.createElement(Shared.Select,{key:label,label,group,embedded:true,...props});
 return React.createElement(React.Fragment,null,
  select('Способ',{items:['Курьер','Самовывоз']}),
  select('Страна',{items:['Россия','Германия','США'],searchable:true}),
  select('Один вариант',{items:['Шоу-рум'],value:chosen,onChange:value=>{setChosen(value);setCount(n=>n+1);}}),
  select('Явное значение',{items:['Шоу-рум'],value:'Другой выбор',onChange:()=>setCount(n=>n+100)}),
  select('Недоступный вариант',{items:pending?['Получен']:[],source:{props:{State:{value:'Disabled'}}},onChange:()=>setCount(n=>n+1000)}),
  select('Ожидаемый вариант',{items:pending?['Получен']:[],onChange:()=>setCount(n=>n+10)}),
  React.createElement('button',{onClick:()=>enable(true)},'Загрузить варианты'),
  React.createElement('output',{'aria-label':'События выбора'},String(count)));
}
createRoot(mount).render(React.createElement(SelectFixture));
`;
  await route.fulfill({response, body: `${await response.text()}\n${fixture}`});
 });
 await page.goto(base, {waitUntil:'domcontentloaded'});
 const select = name => page.getByRole('combobox', {name,exact:true});
 const changes = page.getByLabel('События выбора');
 await page.waitForFunction(() => document.querySelector('output[aria-label="События выбора"]')?.textContent==='1');
 assert.equal(await select('Один вариант').textContent(), 'Шоу-рум');
 assert.equal(await select('Явное значение').textContent(), 'Другой выбор');
 assert.equal(await select('Недоступный вариант').isDisabled(), true);
 const small = select('Способ');
 assert.deepEqual(await small.evaluate(el => [el.tagName,getComputedStyle(el).cursor]), ['BUTTON','pointer']);
 await small.focus();
 await small.dispatchEvent('keydown',{key:'с'});
 await page.getByRole('option',{name:'Самовывоз'}).waitFor();
 await small.press('Enter');
 assert.equal(await small.textContent(), 'Самовывоз');
 await small.press('Space');
 await small.press('ArrowUp');
 await small.press('Enter');
 assert.equal(await small.textContent(), 'Курьер');
 const country = select('Страна');
 assert.deepEqual(await country.evaluate(el => [el.readOnly,getComputedStyle(el).caretColor]), [true,'rgba(0, 0, 0, 0)']);
 await country.click();
 await country.fill('гер');
 assert.equal(await page.getByRole('option').count(),1);
 await country.press('ArrowDown');
 await country.press('Enter');
 assert.equal(await country.inputValue(),'Германия');
 await country.dispatchEvent('keydown',{key:'р'});
 await page.getByRole('option',{name:'Россия'}).waitFor();
 await country.press('Escape');
 assert.equal(await country.getAttribute('aria-expanded'),'false');
 await page.getByRole('button',{name:'Загрузить варианты'}).click();
 await page.waitForFunction(() => document.querySelector('output[aria-label="События выбора"]')?.textContent==='11');
 assert.equal(await select('Ожидаемый вариант').textContent(),'Получен');
 assert.equal(await changes.textContent(),'11');
 console.log('PASS shared Select: button cursor, arrows and typeahead, searchable country, one-option defaults, explicit values and disabled options');
} finally {await browser.close();}
