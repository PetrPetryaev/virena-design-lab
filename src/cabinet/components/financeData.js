import {formatCents,formatValue} from '../../numberFormat.js';
// Synthetic ledger. Snapshot 05.11.2026, Moscow time. Integer cents throughout.
export const AS_OF='2026-11-05';
export const financeSnapshot={available:128460,lowBalance:3240,longBalance:123456789012,debt:5400,repaidDebt:1800,steps:33,cycles:1,cycleNeeded:140,expiryBV:210,expiryDate:'2026-12-01',upgradeDaysLeft:41,demoPassword:'Virena123',statusThreshold:693,statusBV:104,targetThresholds:[1100,3000,6000]};
export const sources=['Бинарный бонус','ВЗР','Наставнический','Премия за скорость','ВЗР с подписок'];
export const operationTypes=[...sources,'Годовой бонус','Сторно','Корректировка','Вывод'];
export const financeScenarios={ready:'Готово',empty:'Пусто',single:'Одна операция',many:'Много операций',long:'Длинные данные',loading:'Загрузка блоков',error:'Ошибка истории','action-error':'Ошибка отправки','low-balance':'Меньше 50 €',window:'Ограничение подачи',verification:'Нужна проверка',processing:'Заявка в работе','no-requisites':'Нет реквизитов',debt:'Задолженность',expiring:'Скоро продление',supervip:'Супер ВИП','upgrade-150':'Апгрейд: 91–180 дней','upgrade-300':'Апгрейд: после 180 дней'};
export const euro=formatCents;
export const bv=formatValue;
export const displayDate=value=>value?new Date(value+'T12:00:00Z').toLocaleDateString('ru-RU',{timeZone:'Europe/Moscow'}):'—';
const op=(id,date,source,amount,basis,detail,extra={})=>({id,date,time:'09:40',source,kind:source,amount,basis,detail,state:'Доступно к выводу',...extra});
const base=[
 op('F-annual','2026-11-05','Годовой бонус',1200,'Расчётный год 25.10.2026–24.10.2027','Бонус копится. В итог начислений попадёт после закрытия расчётного года.',{accruing:true,state:'Начислено',unlock:'2027-10-25'}),
 op('F-mentor','2026-11-05','Наставнический',2600,'Неделя 02.11–08.11','anna_m: ВЗР 260 € × 10% = 26 € · первая ступень.',{login:'anna_m',state:'Начислено',unlock:'2026-11-09'}),
 op('F-1105','2026-11-05','ВЗР',12474,'anna_m · Expert · №100245','1 800 € → засчитано 693 € (пакет Стандарт) × 18% = 124,74 €. Недополучено 199,26 €.',{login:'anna_m',capped:true,lost:19926,order:'100245'}),
 op('F-1104','2026-11-05','Бинарный бонус',10000,'За 04.11 · 1 цикл','1 × 600/300: списано 600 BV из левой ноги и 300 BV из правой.',{state:'Начислено',unlock:'2026-12-01'}),
 op('F-1103','2026-11-04','ВЗР с подписок',720,'anna_m · Virena Pulse · №100244','Платёж 40 € × 18% = 7,20 €.',{login:'anna_m',order:'100244'}),
 op('F-1102','2026-11-03','ВЗР',-5400,'Возврат · №100231','Сторно операции F-1028: возврат 300 €. Отменены ВЗР 54 € и 45 BV покупки.',{kind:'Сторно',state:'Сторно',order:'100231',login:'denis_demo',original:'F-1028'}),
 op('F-1101','2026-11-02','Наставнический',1860,'Неделя 26.10–01.11','anna_m: ВЗР 186 € × 10% = 18,60 € · первая ступень.',{login:'anna_m'}),
 op('F-1100','2026-11-02','Премия за скорость',5000,'Ранг ★ · 01.10–02.11','Бинарный чек 1 000 € × 5% = 50 €.',{state:'Начислено',unlock:'2026-12-01'}),
 op('F-1099','2026-11-05','Бинарный бонус',-1500,'По правилам маркетинг-плана','Корректировка начисления F-1104 по правилам маркетинг-плана.',{kind:'Корректировка',state:'Начислено',unlock:'2026-12-01'}),
 op('F-1031','2026-10-31','Бинарный бонус',20000,'За 30.10 · 2 цикла','2 × 450/450: списано 900 BV из каждой ноги.'),
 op('F-1028','2026-10-28','ВЗР',5400,'denis_demo · Bio Life · №100231','Покупка 300 € × 18% = 54 €. Возврат отражён отдельной операцией F-1102.',{login:'denis_demo',order:'100231'}),
 op('F-1025','2026-10-25','Годовой бонус',41200,'Расчётный год 25.10.2025–24.10.2026','Годовой бонус после закрытия расчётного года.'),
 op('F-1020','2026-10-20','Вывод',-30000,'Заявка №1024 · счёт ••4821','Выплачено 300 € по заявке №1024.',{state:'Выведено'}),
 op('F-1015','2026-10-15','ВЗР',9720,'irina_demo · Balance · №100198','Покупка 540 € × 18% = 97,20 €.',{login:'irina_demo',order:'100198'}),
];
export function ledgerFor(scenario,member){
 if(scenario==='empty'||['newcomer','client','partner-no-package','deactivated'].includes(member))return [];
 if(scenario==='single')return [base[0]];
 if(scenario==='many')return [...base,...Array.from({length:35},(_,i)=>op('F-extra-'+i,`2026-10-${String(1+i%14).padStart(2,'0')}`,'ВЗР',1800,`partner_${i+1} · Bio Life · №${200000+i}`,'Покупка 100 € × 18% = 18 €.',{login:`partner_${i+1}`}))];
 if(scenario==='long')return [{...base[0],id:'F-long',amount:123456789012,basis:'alexandra_very_long_partner_login · Комплект продуктов и оборудования Virena · №100245',detail:'Демонстрация длинного значения: 1 234 567 890,12 €.'},...base.slice(1)];
 return base.map(r=>({...r}));
}
export const pointBatches=[
 {id:'BV-5',date:'2026-11-05',login:'anna_m',order:'100245',leg:'Правая',purchase:270,credited:104,remainder:104,expires:'2027-11-05',note:'Потолок пакета Стандарт на момент покупки: 104 BV.'},
 {id:'BV-4',date:'2026-11-04',login:'partner_4',order:'100240',leg:'Левая',purchase:390,credited:390,remainder:390,expires:'2027-11-04',note:'Полностью засчитано в объём левой ноги.'},
 {id:'BV-3',date:'2026-11-03',login:'partner_3',order:'100239',leg:'Правая',purchase:56,credited:56,remainder:56,expires:'2027-11-03',note:'Полностью засчитано в объём правой ноги.'},
 {id:'BV-cycle',date:'2026-11-02',login:'Закрытие цикла',leg:'Обе',purchase:0,credited:0,remainder:0,expires:'',note:'Цикл 600/300: −600 BV левая, −300 BV правая.'},
 {id:'BV-old',date:'2025-12-01',login:'partner_2',order:'98007',leg:'Левая',purchase:210,credited:210,remainder:210,expires:'2026-12-01',note:'Сгорает в ближайшие 30 дней.'},
 {id:'BV-burned',date:'2025-11-01',login:'partner_1',order:'97001',leg:'Правая',purchase:45,credited:45,remainder:0,expires:'2026-11-01',note:'Сгорело 01.11.2026.',burned:true},
];
export const initialRequests=[{id:'1024',date:'2026-10-15',amount:30000,requisite:'Банковский счёт ••4821',status:'Выплачена',paid:'2026-10-20'},{id:'1023',date:'2026-10-10',amount:10000,requisite:'Банковский счёт ••4821',status:'Отклонена',paid:'',reason:'Получатель не совпадает с владельцем счёта. Сумма возвращена в доступный остаток.'}];
export function makeFinanceSession(scenario='ready') {return {requests:scenario==='empty'?[]:scenario==='processing'?[{id:'1042',date:AS_OF,amount:50000,requisite:'Банковский счёт ••4821',status:'В обработке',paid:''},...initialRequests]:initialRequests.map(r=>({...r})),reserved:scenario==='processing'?50000:0};}
const iso=d=>d.toISOString().slice(0,10);
export function periodBounds(kind,offset=0){
 const d=new Date(AS_OF+'T12:00:00Z');let end;
 if(kind==='all')return {from:'0000-01-01',to:'9999-12-31',label:'Всё время'};
 if(kind==='month'){d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+offset);end=new Date(d);end.setUTCMonth(end.getUTCMonth()+1);}
 else if(kind==='year'){d.setUTCMonth(0,1);d.setUTCFullYear(d.getUTCFullYear()+offset);end=new Date(d);end.setUTCFullYear(end.getUTCFullYear()+1);}
 else{d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+6)%7)+offset*7);end=new Date(d);end.setUTCDate(end.getUTCDate()+7);}
 end.setUTCDate(end.getUTCDate()-1);
 return {from:iso(d),to:iso(end),label:kind==='month'?d.toLocaleDateString('ru-RU',{month:'long',year:'numeric',timeZone:'UTC'}):kind==='year'?String(d.getUTCFullYear()):`${displayDate(iso(d))} – ${displayDate(iso(end))}`};
}
export const inPeriod=(r,period)=>r.date>=period.from&&r.date<=period.to;
export function incomeFor(ledger,period){const entries=ledger.filter(r=>r.kind!=='Вывод'&&!r.accruing&&inPeriod(r,period));const keys=[...sources,...(entries.some(r=>r.source==='Годовой бонус')?['Годовой бонус']:[])];return keys.map((source,index)=>({source,index,amount:entries.filter(r=>r.source===source).reduce((s,r)=>s+r.amount,0),count:entries.filter(r=>r.source===source&&r.amount>0).length})).sort((a,b)=>b.amount-a.amount);}
export function pendingFor(ledger){const grouped=new Map();for(const r of ledger.filter(r=>r.state==='Начислено'&&r.unlock)){const key=r.source+'|'+r.unlock;const prev=grouped.get(key)||{source:r.source,date:r.unlock,amount:0};prev.amount+=r.amount;prev.accruing=prev.accruing||r.accruing;grouped.set(key,prev);}return [...grouped.values()].filter(r=>r.amount>0).sort((a,b)=>a.date.localeCompare(b.date));}
export function parseAmount(value){if(!/^\d+(?:[.,]\d{1,2})?$/.test(value.trim()))return null;const [whole,fraction='']=value.trim().replace(',','.').split('.');const cents=Number(whole)*100+Number(fraction.padEnd(2,'0'));return Number.isSafeInteger(cents)?cents:null;}
export function validateAmount(value,available){const amount=parseAmount(value);return amount===null?'Введите сумму в евро, не больше двух знаков после запятой':amount<5000?'Минимальная сумма вывода – 50 €':amount>available?'Сумма превышает доступный остаток':'';}
export function filterOperations(ledger,{query='',types=[],state='',period,cap=false}){const q=query.trim().toLowerCase();return ledger.filter(r=>(!q||[r.login,r.order,r.basis,r.id].some(v=>v?.toLowerCase().includes(q)))&&(!types.length||types.includes(r.kind))&&(!state||r.state===state)&&(!period||inPeriod(r,period))&&(!cap||r.capped)).sort((a,b)=>b.date.localeCompare(a.date)||b.id.localeCompare(a.id));}
export function csvFor(rows){const quote=v=>'"'+String(v??'').replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"';return '\ufeff'+[['Дата (МСК)','Операция','Основание','Сумма EUR','Состояние'],...rows.map(r=>[r.date,r.kind,r.basis,(r.amount/100).toFixed(2),r.state])].map(r=>r.map(quote).join(';')).join('\r\n');}
