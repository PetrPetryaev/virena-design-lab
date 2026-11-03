import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://localhost:5174/?tab=cabinet&page=overview');
await page.getByRole('heading',{name:'Стать партнёром'}).waitFor();
await page.getByRole('heading',{name:'Александра Соколова'}).waitFor();
await page.screenshot({path:'artifacts/overview-desktop.png',fullPage:true});
for(const [label,intent] of [['Посмотреть пакеты','packages'],['Оплатить активность','activity']]){
 await page.getByRole('button',{name:label,exact:true}).last().click();
 assert(new URL(page.url()).searchParams.get('intent')===intent);
 await page.goBack();await page.getByRole('heading',{name:'Александра Соколова'}).waitFor();
}
await page.getByLabel('Состояние',{exact:true}).selectOption('sponsor-error');
await page.getByRole('heading',{name:'Не удалось загрузить спонсора'}).waitFor();
assert(await page.getByRole('heading',{name:'Александра Соколова'}).isVisible());
await page.getByRole('button',{name:'Повторить',exact:true}).click();
await page.getByRole('heading',{name:'Компания Virena'}).waitFor();
await page.getByLabel('Состояние',{exact:true}).selectOption('loading');
await page.getByRole('status',{name:'Загрузка: профиль'}).waitFor({state:'visible'});
await page.getByLabel('Состояние',{exact:true}).selectOption('ready');
await page.getByRole('heading',{name:'Александра Соколова'}).waitFor();
// Loading must reserve the ready layout, including downstream card positions.
for(const width of [375,1440,2064]){
 await page.setViewportSize({width,height:1000});
 const geometry=()=>page.locator('.overview-profile,.overview-sponsor,.overview-notice,.overview-package').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {height:r.height,top:r.top};}));
 const ready=await geometry();
 await page.getByLabel('Состояние',{exact:true}).selectOption('loading');
 await page.getByRole('status',{name:'Загрузка: профиль'}).waitFor();
 assert.deepEqual(await geometry(),ready,`loading layout shift at ${width}`);
 assert.equal(await page.getByRole('button',{name:'Мой профиль',exact:true}).count(),0);
 await page.getByLabel('Состояние',{exact:true}).selectOption('ready');
 await page.getByRole('heading',{name:'Александра Соколова'}).waitFor();
}
for(const width of [375,720,1024,1440,2064]){
 await page.setViewportSize({width,height:1000});
 const overflow=await page.evaluate(()=>[...document.querySelectorAll('.overview,.overview-card,.overview-option')].filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.className));
 assert.deepEqual(overflow,[],`overflow at ${width}`);
 if(width===375)await page.screenshot({path:'artifacts/overview-mobile.png',fullPage:true});
}
await page.setViewportSize({width:1440,height:1000});
await page.getByRole('switch',{name:'Тёмная тема'}).click();
await page.waitForTimeout(350);
await page.screenshot({path:'artifacts/overview-dark.png',fullPage:true});
await page.getByRole('button',{name:'Полный экран',exact:true}).click();
assert(!(await page.locator('.cab-overview-toolbar').isVisible()));
assert.equal(await page.locator('.overview button').first().evaluate(e=>getComputedStyle(e).fontFamily.includes('Inter')),true);
assert.deepEqual(errors,[]);
await browser.close();console.log('Overview: routes, independent error/retry, loading, 375–2064px, dark, fullscreen passed');
