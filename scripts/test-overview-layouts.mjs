import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const b=await chromium.launch({channel:'chrome'});const p=await b.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
for(const layout of ['literal']){
 await p.setViewportSize({width:1600,height:1200});await p.goto('http://localhost:5174/?tab=cabinet&page=overview&layout='+layout);
 await p.getByRole('heading',{name:'Александра Соколова'}).waitFor();
 assert.equal(await p.getByLabel('Компоновка',{exact:true}).count(),0);
 assert.equal(await p.locator('.overview-option').count(),3);
 await p.screenshot({path:`artifacts/overview-${layout}.png`});
 for(const width of [375,720,1024,1600,2560]){
 await p.setViewportSize({width,height:1200});
 const bad=await p.locator('.overview,.overview-card,.overview-option').evaluateAll(es=>es.filter(e=>getComputedStyle(e).display!=='contents'&&e.scrollWidth>e.clientWidth+2).map(e=>e.className));assert.deepEqual(bad,[],layout+' '+width);
 }
 await p.getByRole('button',{name:'Посмотреть пакеты',exact:true}).click();assert(new URL(p.url()).searchParams.get('intent')==='packages');
}
assert.deepEqual(errors,[]);await b.close();console.log('Literal layout: responsive 375–2560, 3 actions each, routes and runtime passed');
