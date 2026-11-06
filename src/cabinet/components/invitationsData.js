import {formatMoney} from '../../numberFormat.js';
import {genealogyCells} from './genealogyData.js';
// Fixed API-shaped demo snapshot, 05.11.2026. Not a marketing-plan calculation engine.
export const invitationAsOf='05.11.2026, 14:05 МСК';
export const invitationStates={registered:'Ждёт оплаты',client:'Клиент',partner:'Партнёр',grace:'Льготное окно',frozen:'Заморожен',deactivated:'Неактивна'};
export const packs=['Начальный','Стандарт','Профи','ВИП','Супер ВИП','Без пакета'];
export const reasons={1:'Удалится через 2 дн., если не оплатит активность или покупку',2:'Осталось 2 дн., чтобы продлить за 240 € и сохранить баллы',3:'До окончательной деактивации – 68 дн. Вернуться – 240 €',4:'Зарегистрировался 03.11, оплаты пока нет',5:'Активность до 12.11',6:'ВЗР с его приглашённых уходит компании, ваш наставнический с них тоже не начисляется',7:'Апгрейд без потерь ещё 7 дн.',8:'Покупок на 600 €: при оплате активности получит пакет «Начальный»'};
const base=(id,name,state,extra={})=>({id,login:id,name,state,personal:true,sponsor:{login:'alexandra92',path:''},pack:null,rank:0,path:null,own:false,country:'Россия',city:'Москва',email:id+'@example.com',phone:'',messenger:'',language:'Русский',birthday:'02.10',registered:'2026-10-14',lastLogin:'04.11.2026, 18:20 МСК',loginDays:1,placed:'15.10.2026',invited:0,partners:0,counts:[0,0],points:[0,0],steps:0,purchases:0,purchaseSum:0,lastPurchase:'Покупок нет',vzr:0,monthVzr:0,annual:0,attention:[],deadline:'',deadlineOrder:999,days:0,note:'',history:['14.10.2026 – регистрация'],...extra});
export const invitationFixtures=[
 ...genealogyCells.filter(c=>c.path&&c.personal).map((c,i)=>base(c.login,c.name,c.state,{...c,id:c.login,phone:i===0?'+7 000 000-00-01':'',registered:i===0?'2026-11-02':'2026-10-14',new:i===0,invited:i===0?4:1,partners:i===0?2:0,attention:!c.pack?[6]:i===1?[5,7]:[],deadline:i===1?'Активна до 12.11.2026 · 7 дн.':'Активна до 02.03.2027 · 117 дн.',deadlineOrder:i===1?7:117,purchases:3,purchaseSum:1840,lastPurchase:'12.09.2026',vzr:612.30,monthVzr:124.74,annual:300,note:i===0?'Обсудить первые шаги в кабинете.':'',history:['02.11.2026 – оплата активности','14.10.2026 – регистрация']})),
 base('irina_demo','Ирина Васильева','registered',{registered:'2026-11-01',new:true,attention:[1],deadline:'Удалится через 2 дн. · 07.11',deadlineOrder:2,plannedLeg:'L',lastLogin:'Не входил',loginDays:99,placed:null}),
 base('pavel_demo','Павел Лебедев','registered',{registered:'2026-11-03',new:true,attention:[4],deadline:'Удалится через 5 дн. · 10.11',deadlineOrder:5,plannedLeg:'R',placed:null}),
 base('olga_demo','Ольга Новикова','client',{path:'LLR',country:'Казахстан',city:'Алматы',attention:[8],deadline:'Покупка 12.09.2026',purchases:2,purchaseSum:600,lastPurchase:'12.09.2026',activationPack:'Начальный'}),
 base('denis_demo','Денис Орлов','grace',{path:'RLR',pack:'ВИП',rank:2,attention:[2],deadline:'Продлить за 240 € · 2 дн.',deadlineOrder:2,history:['04.11.2026 – льготное окно','04.11.2025 – оплата активности']}),
 base('natalia_demo','Наталья Белова','frozen',{path:'RRL',pack:'Стандарт',attention:[3],deadline:'Заморожен с 04.10 · до деактивации 68 дн.',deadlineOrder:68,lastLogin:'29.09.2026, 09:12 МСК',loginDays:37}),
 base('roman_demo','Роман Павлов','deactivated',{path:'LLLR',deadline:'Неактивна с 14.08.2026',lastLogin:'12.08.2026, 10:00 МСК',loginDays:85}),
 base('alexandra92_extra','Александра Петрова','partner',{path:'RRRL',own:true,pack:'Начальный',deadline:'Активна до 02.03.2027 · 117 дн.'}),
];
export const funnel=[['all','Все'],['attention','Требуют внимания'],['registered','Ждут оплаты'],['client','Клиенты'],['no-package','Без пакета'],['package','С пакетом'],['grace','Льготное окно'],['frozen','Заморожены'],['deactivated','Неактивны']];
export const inFunnel=(c,key)=>key==='all'||(!c.own&&(key==='attention'?c.attention.length>0:key==='no-package'?c.state==='partner'&&!c.pack:key==='package'?c.state==='partner'&&!!c.pack:c.state===key));
export const money=formatMoney;
export const date=s=>s?new Date(s+'T12:00:00+03:00').toLocaleDateString('ru-RU',{timeZone:'Europe/Moscow'}):'—';
export const reminderReason=c=>c.attention.find(x=>[1,2,4,5].includes(x));
export const sortOptions={urgency:'По срочности',name:'По имени: А–Я',state:'По этапу',pack:'По пакету и рангу',deadline:'Ближайший срок',invited:'Больше приглашённых',vzr:'Больше ВЗР',registered:'Сначала новые',login:'Давно не входили'};
export function sortInvitations(list,key='urgency',direction=1){return [...list].sort((a,b)=>direction*(key==='name'?a.name.localeCompare(b.name,'ru'):key==='state'?Object.keys(invitationStates).indexOf(a.state)-Object.keys(invitationStates).indexOf(b.state):key==='pack'?(packs.indexOf(a.pack)-packs.indexOf(b.pack)||b.rank-a.rank):key==='deadline'?a.deadlineOrder-b.deadlineOrder:key==='invited'?b.invited-a.invited:key==='vzr'?b.vzr-a.vzr:key==='login'?b.loginDays-a.loginDays:key==='registered'?b.registered.localeCompare(a.registered):(a.own||!a.attention.length?2:a.attention.some(x=>[1,2,3,4,5].includes(x))?0:1)-(b.own||!b.attention.length?2:b.attention.some(x=>[1,2,3,4,5].includes(x))?0:1)||a.deadlineOrder-b.deadlineOrder||b.registered.localeCompare(a.registered)));}
export function initialInvitationView(){let preferences={};try{preferences=JSON.parse(localStorage.getItem('virena-invitations-prefs')||'{}');}catch{}return {query:'',funnel:'all',filters:{},page:1,pageSize:[10,25,50,100].includes(preferences.pageSize)?preferences.pageSize:25,sort:Object.hasOwn(sortOptions,preferences.sort)?preferences.sort:'urgency',direction:preferences.direction===-1?-1:1};}

// Owner response fields supplied by the API in production; fixed for this snapshot.
export const invitationOwnerSnapshot={lostVzr:124.74,graceDays:2,deactivatedAt:'01.10.2026'};
