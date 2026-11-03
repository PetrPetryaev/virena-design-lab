import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome'});
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base=process.env.TEST_URL||'http://localhost:5174/';
 await page.goto(base);
 await page.evaluate(()=>sessionStorage.setItem('virena-auth-draft-v1',JSON.stringify({step:'destination',values:{}})));
 await page.goto(base+'?tab=cabinet&page=overview');
 await page.getByRole('button',{name:'Флоу',exact:true}).click();
 await page.getByLabel('Экран',{exact:true}).waitFor();
 assert.equal(await page.getByLabel('Экран',{exact:true}).inputValue(),'login');
 await page.getByLabel('Экран',{exact:true}).selectOption('onboard-1');
 await page.getByRole('button',{name:'Кабинет',exact:true}).click();
 await page.getByRole('button',{name:'Флоу',exact:true}).click();
 assert.equal(await page.getByLabel('Экран',{exact:true}).inputValue(),'onboard-1');
 assert.deepEqual(errors,[]);console.log('PASS flow re-entry after completed login and unfinished draft');
}finally{await browser.close()}
