import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';

const url=new URL(process.env.TEST_URL||'http://127.0.0.1:5187/');
url.searchParams.set('tab','cabinet');
url.searchParams.set('page','invitations');
const browser=await chromium.launch({channel:'chrome'});
const out='temp-outputs/invitations';
await mkdir(out,{recursive:true});
try {
 for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:width===390?844:1000},reducedMotion:'reduce'});
  const p=await context.newPage(),errors=[];
  p.setDefaultTimeout(5000);
  p.on('pageerror',e=>errors.push(e.message));
  const btn=(root,name)=>root.getByRole('button',{name,exact:true});
  const rows=p.locator('#invitations-results .ds-table-row').filter({has:p.locator('.member-table-person')});
  const person=login=>btn(p,'Подробная информация: '+login);
  const card=p.getByRole('dialog',{name:'Карточка приглашённого',exact:true});
  const close=async dialog=>{await btn(dialog,'Закрыть окно').click();await dialog.waitFor({state:'hidden'});};
  const tabs=p.getByRole('tablist',{name:'Приглашённые'});
  const setCase=async(label,value)=>{
   const settings=btn(p,'Настройки витрины');
   await settings.click();
   await p.getByLabel(label,{exact:true}).selectOption(value);
   await settings.click();
  };
  const scenario=value=>setCase('Состояние приглашений',value);
  const owner=value=>setCase('Владелец приглашений',value);
  await p.goto(url.href);await rows.first().waitFor();
  assert.equal(await tabs.getByRole('tab').count(),2);
  assert.equal(await rows.count(),13);
  assert.equal(await p.locator('#invitations-tab-all .segmented-count').innerText(),'12');
  await p.locator('#invitations-tab-attention').click();assert.equal(await rows.count(),7);
  assert.match(await rows.first().innerText(),/irina_demo/);
  const reasons=await rows.locator('[data-column=status] small').allTextContents();
  assert.equal(reasons.length,7);assert.ok(reasons.every(Boolean));assert.match(reasons[0],/Удалится через 2 дн/);
  await person('irina_demo').click();await btn(card,'Напомнить').click();
  const reminder=p.getByRole('dialog',{name:'Напомнить от компании',exact:true});
  await btn(reminder,'Просмотреть').click();
  const preview=p.getByRole('dialog',{name:'Текст напоминания'});assert.match(await preview.innerText(),/Письмо не отправлено/);
  await close(preview);assert.ok(await btn(card,'Напомнить').isEnabled());await close(card);
  await person('pavel_demo').click();assert.ok(await card.getByRole('button',{name:/^Отправлено/}).isDisabled());
  assert.match(await card.innerText(),/Следующее напоминание/);await close(card);
  await p.locator('#invitations-tab-all').click();
  await btn(p,'Найти приглашённого').click();const search=p.getByRole('searchbox',{name:'Найти приглашённого'});
  await search.fill('anna_m');assert.equal(await rows.count(),1);
  await person('anna_m').click();const note=card.getByLabel('Личная заметка');
  await note.fill('Проверочная заметка');await note.press('Tab');await close(card);
  await person('anna_m').click();assert.equal(await note.inputValue(),'Проверочная заметка');
  await btn(card,'Показать в дереве').click();await p.locator('.genealogy-root').waitFor();
  assert.match(await p.locator('.genealogy-root').innerText(),/anna_m/);
  await btn(p,'В таблицу').click();await person('anna_m').waitFor();assert.equal(await search.inputValue(),'anna_m');
  await search.fill('');await search.press('Escape');
  await btn(p,'Фильтры').click();const filters=p.getByRole('dialog',{name:'Фильтры приглашений'});
  for(const [group,value] of [['Нога','Левая нога'],['Пакет','Профи']]){
   await btn(filters,group).click();
   await filters.getByRole('checkbox',{name:group+': '+value,exact:true}).click();
  }
  await btn(filters,'Показать результаты · 2').click();assert.equal(await rows.count(),2);
  await btn(p,'Сбросить фильтры').click();
  for(const value of ['newcomer','client']){
   await owner(value);assert.equal(await rows.count(),0);assert.ok(await p.locator('.inv-empty').isVisible());
  }
  for(const [value,title] of [['partner-no-package','Без пакета ВЗР уходит компании'],['grace','Продлите активность'],['frozen','Аккаунт заморожен'],['deactivated','Ячейка деактивирована']]){
   await owner(value);assert.ok((await p.locator('.inv-shared-banner').innerText()).includes(title));
   if(['frozen','deactivated'].includes(value))assert.ok(await btn(p,'Пригласить').isDisabled());
   if(value==='deactivated'){await person('anna_m').click();assert.equal(await note.getAttribute('readonly'),'');await close(card);}
  }
  await owner('partner');
  await scenario('error');await p.getByRole('alert').waitFor();await btn(p,'Обновить').click();assert.equal(await rows.count(),13);
  await scenario('loading');await p.locator('.cab-main.has-page-skeleton[aria-busy=true] .page-skeleton-layer').waitFor();
  await scenario('empty');await p.getByRole('heading',{name:'Пока нет лично приглашённых'}).waitFor();
  await scenario('single');assert.equal(await rows.count(),1);
  await scenario('deleted');await person('irina_demo').click();await btn(card,'Обновить список').click();assert.equal(await rows.count(),12);
  await scenario('action-error');await person('denis_demo').click();await btn(card,'Напомнить').click();await btn(reminder,'Просмотреть').click();
  assert.match(await reminder.getByRole('alert').innerText(),/Не удалось/);await close(reminder);await close(card);
  await scenario('long');assert.ok(await p.locator('.cab-main').evaluate(e=>e.scrollWidth<=e.clientWidth+1));
  await rows.first().locator('.member-table-person').click();assert.ok(await card.evaluate(e=>e.scrollWidth<=e.clientWidth+1));
  await p.screenshot({path:out+'/drawer-'+width+'.png'});await close(card);
  await scenario('ready');await p.screenshot({path:out+'/list-'+width+'.png'});
  await scenario('many');if(width===390){await p.locator('.inv-pagination').scrollIntoViewIfNeeded();await p.waitForFunction(()=>document.querySelectorAll('.member-table-person').length>25);}else{assert.equal(await rows.count(),25);await btn(p,'Следующая страница').click();assert.equal(await rows.count(),25);}
  assert.deepEqual(errors,[]);console.log('PASS TES-342',width);await context.close();
 }
} finally {await browser.close();}
