import {chromium} from 'playwright';import assert from 'node:assert/strict';
const b=await chromium.launch({channel:'chrome'}),p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
const base=process.env.TEST_URL||'http://localhost:5174/';
for(const width of [1440,390]){
 await p.setViewportSize({width,height:1000});await p.goto(base+'?tab=cabinet&page=participants');await p.locator('.cabinet').waitFor();
 const box=()=>p.locator('.cabinet').evaluate(e=>{const r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height]});
 const before=await box();await p.getByRole('button',{name:'Настройки витрины',exact:true}).click();assert.deepEqual(await box(),before);
 const panel=p.locator('#lab-settings-panel');assert.ok(await panel.evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight}));
 const select=panel.locator('select[aria-label="Состояние участников"]');if(await select.count()){await select.selectOption('empty');await p.keyboard.press('Escape');await p.getByRole('button',{name:'Настройки витрины',exact:true}).click();assert.equal(await select.inputValue(),'empty');}
 await p.keyboard.press('Escape');assert.equal(await p.getByRole('button',{name:'Настройки витрины',exact:true}).evaluate(e=>e===document.activeElement),true);assert.deepEqual(await box(),before);
 await p.getByRole('button',{name:'Настройки витрины',exact:true}).click();await p.mouse.click(10,10);assert.equal(await panel.isVisible(),false);
}
assert.deepEqual(errors,[]);console.log('PASS overlay has no layout shift, desktop/mobile, Escape and outside dismissal');await b.close();
