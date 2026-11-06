// Synthetic demonstration purchases. Prices, BV, payments and addresses are not production data.
export const ORDER_AS_OF='2026-11-06';
const item=(id,productId,name,quantity,unitCents,bv,extra={})=>({id,productId,name,description:'Демонстрационная покупка',quantity,unitCents,discountCents:0,bv,...extra});
export function orderTotals(order){
 const goodsCents=order.items.reduce((s,i)=>s+i.quantity*i.unitCents,0);
 const discountCents=order.items.reduce((s,i)=>s+i.discountCents,0);
 const bv=order.items.reduce((s,i)=>s+i.bv,0);
 const refunded=order.items.filter(i=>i.returnedAt);
 const refundCents=refunded.reduce((s,i)=>s+i.quantity*i.unitCents-i.discountCents,0);
 const refundBV=refunded.reduce((s,i)=>s+i.bv,0);
 return {goodsCents,discountCents,paidCents:goodsCents-discountCents+order.deliveryCents+order.taxCents,bv,refundCents,refundBV,netGoodsCents:goodsCents-discountCents-refundCents,netBV:bv-refundBV};
}
const delivery={recipient:'Анна Демонстрационная',address:'Демо-адрес: Екатеринбург, ул. Примерная, д. 12, кв. 7'};
const make=(id,date,status,partnerLabel,items,extra={})=>{const o={id,date,status,partnerLabel,items,deliveryCents:0,taxCents:0,receiptId:id,...extra};o.payments??=[{label:'Банковская карта •• 4242 · демо',amountCents:orderTotals(o).paidCents}];return o;};
const base=[
 make('100245','2026-11-06T10:35:00+03:00','paid','Статус Стандарт',[
 item('1','expert','Virena Expert',1,180000,255,{description:'Устройство · белый',discountCents:10000}),
 item('2','bio-life','Bio Life',2,15000,45,{description:'Питание · 30 саше'}),
 item('3','balance','Balance',1,54000,81,{description:'Прибор Virena · базовый комплект'}),
 item('4','beauty','Beauty',1,8500,12,{description:'Прибор Virena · базовый комплект'}),
 item('5',null,'Подарок: дорожная косметичка',1,0,0,{gift:true,description:'Подарок к заказу'})
 ],{deliveryCents:1200,taxCents:0,delivery,payments:[{label:'Банковская карта •• 5555 · демо',amountCents:50000},{label:'Банковская карта •• 4242 · демо',amountCents:213700}]}),
 make('100244','2026-11-04T09:10:00+03:00','paid','',[
 item('1','pulse','Virena Pulse',1,4000,0,{noStatus:true,description:'Подписка · 04.11–03.12.2026'})
 ]),
 make('100231','2026-10-28T16:45:00+03:00','partial','',[
 item('1','bio-life','Bio Life',2,15000,45,{returnedAt:'2026-11-03T14:00:00+03:00',description:'Питание · 30 саше'}),
 item('2','balance','Balance',1,54000,75,{description:'Прибор Virena · базовый комплект',discountCents:4000})
 ],{deliveryCents:900,delivery}),
 make('100198','2026-09-15T12:20:00+03:00','paid','Апгрейд до Профи',[
 item('1',null,'Доплата до пакета Профи',1,190000,0,{description:'Апгрейд партнёрского пакета · демо'})
 ]),
 make('98007','2025-12-01T11:05:00+03:00','returned','Статус снят возвратом',[
 item('1','expert','Virena Expert',1,180000,270,{returnedAt:'2025-12-10T15:00:00+03:00',description:'Устройство · белый'})
 ],{delivery:{...delivery}}),
 make('97001','2025-06-18T18:00:00+03:00','paid','',[
 item('1','bio-life','Bio Life',1,15000,22.5,{description:'Питание · 30 саше'})
 ],{deliveryCents:700,delivery})
];
const clone=value=>JSON.parse(JSON.stringify(value));
export function ordersFor(scenario='ready'){
 if(scenario==='empty')return [];
 if(scenario==='single')return clone(base.slice(0,1));
 if(scenario==='many')return Array.from({length:25},(_,i)=>{const o=clone(base[i%base.length]);o.id=String(200025-i);o.receiptId=o.id;o.date=`2026-${i<6?'11':'10'}-${String(i<6?6-i:31-(i-6)).padStart(2,'0')}T10:00:00+03:00`;for(const line of o.items)if(line.returnedAt)line.returnedAt=o.date;return o;});
 if(scenario==='long'){const o=clone(base[0]);o.id='100246';o.receiptId=o.id;o.items[0].name='Virena Expert · профессиональный комплект для домашнего использования с расширенным набором аксессуаров';o.items[0].description='Демонстрация длинного названия, описания и адреса: комплект устройства с дополнительными принадлежностями, инструкция и защитный футляр';o.delivery.recipient='Александра Константиновна Демонстрационная';o.delivery.address='Демо-адрес: Свердловская область, Екатеринбург, улица Примерная с очень длинным названием, дом 123, корпус 4, квартира 567';return [o,...clone(base.slice(1))];}
 return clone(base);
}
// Calendar periods use the date recorded in the order timezone, inclusive at both ends.
export function periodOrders(orders,period='all',range={}){
 const year=Number(ORDER_AS_OF.slice(0,4));
 const from=period==='year'?`${year}-01-01`:period==='previous'?`${year-1}-01-01`:period==='custom'?(range.from||range.start||'0000-01-01'):'0000-01-01';
 const to=period==='year'?`${year}-12-31`:period==='previous'?`${year-1}-12-31`:period==='custom'?(range.to||range.end||'9999-12-31'):'9999-12-31';
 return orders.filter(o=>o.date.slice(0,10)>=from&&o.date.slice(0,10)<=to);
}
export function filterOrders(orders,{query='',status='all'}={}){
 const needle=query.trim().toLocaleLowerCase('ru-RU');
 return orders.filter(o=>(status==='all'||(status==='refund'?['partial','returned'].includes(o.status):o.status===status))&&(!needle||[o.id,...o.items.map(i=>i.name)].join(' ').toLocaleLowerCase('ru-RU').includes(needle)));
}
export function summarizeOrders(orders){return orders.filter(o=>!o.demo).reduce((s,o)=>{const t=orderTotals(o);return {count:s.count+(o.items.some(i=>!i.returnedAt)?1:0),goodsCents:s.goodsCents+t.netGoodsCents,bv:s.bv+t.netBV};},{count:0,goodsCents:0,bv:0});}
export const orderDate=iso=>new Date(iso).toLocaleString('ru-RU',{timeZone:'Europe/Moscow',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})+' МСК';
