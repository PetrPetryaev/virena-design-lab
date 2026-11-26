import {validatePhoneNumber} from '../../phone-utils.js';
import {profileInitialData} from './profileData.js';
// In-memory prototype only. Never produces a payment or a binary event.
export const profileDelivery=(location=profileInitialData.personal)=>{
 const {firstName,lastName}=profileInitialData.personal;
 return {recipient:location?firstName+' '+lastName:'',country:location?.country||'',city:location?.city||'',
  address:location?.address||'',postal:location?.postalCode||''};
};
export const emptyCheckout=location=>({forOther:false,account:'',payerCell:orderCell().id,recipientCell:null,fulfillment:'delivery',showroom:'',deliveryRate:exampleDeliveryRates[0],deliveryDate:'',deliverySlot:'',deliveryOther:false,deliveryName:'',deliveryPhone:'',pickupOther:false,pickupName:'',pickupPhone:'',...profileDelivery(location),addressMode:'profile',payment:'',bonus:'',useBonus:false,saveCard:false});
export const orderCell=()=>{const p=profileInitialData.personal;return {id:p.partnerId,name:p.firstName+' '+p.lastName,login:p.login};};
export function ownedOrderCells(scenario){
 const main={...orderCell(),position:'Основная'};
 const left={...main,id:'VR-100025',login:main.login+'l',position:'Слева'};
 const right={...main,id:'VR-100026',login:main.login+'r',position:'Справа'};
 return scenario==='cells-three'?[main,left,right]:scenario==='cells-two'?[main,right]:[main];
}
export function checkoutPayerCell(draft,scenario){
 const cells=ownedOrderCells(scenario);
 return draft.payerCell?cells.find(cell=>cell.id===draft.payerCell):cells.length===1?cells[0]:undefined;
}
export const exampleRecipient={id:'VR-100081',login:'anna.volkova'};
export const exampleShowrooms=['Москва · ул. Садовая, 5','Москва · просп. Мира, 48'];
export const exampleDeliveryRates=['Курьером · 2–4 рабочих дня'];
export const exampleDeliverySlots=['10:00–14:00','14:00–18:00','18:00–22:00'];
// The fixture rate uses the second through fourth working days.
const dayKey=date=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export function deliveryDates(now=new Date()){
 const date=new Date(now.getFullYear(),now.getMonth(),now.getDate());
 const days=[];
 while(days.length<4){
  date.setDate(date.getDate()+1);
  if(date.getDay()%6!==0)days.push({key:dayKey(date),date:new Date(date)});
 }
 return days.slice(1);
}
export function deliverySlotsForDate(value,now=new Date()){
 const index=deliveryDates(now).findIndex(day=>day.key===value);
 const [morning,afternoon,evening]=exampleDeliverySlots;
 return [[morning,afternoon],[afternoon,evening],[morning,evening]][index]||[];
}
export const deliveryDateLabel=value=>new Intl.DateTimeFormat('ru-RU',{weekday:'short',day:'numeric',month:'long'}).format(new Date(value+'T12:00:00'));
export const deliveryAddress=draft=>[draft.country,draft.city,draft.address,draft.postal].map(part=>part?.trim()).filter(Boolean).join(', ');
export function deliveryMapAddress({country,city,address}){
 // The address field uses the order street, building, apartment. Only the building belongs on the map.
 const [street,building,extra]=(address||'').split(',').map(part=>part.trim());
 const buildingOnly=part=>part?.replace(/(?:^|\s+)(?:кв(?:артира)?|оф(?:ис)?|подъезд|этаж|apartment|apt|unit)\.?(?=\s|\d|$).*$/i,'');
 return [country,city,buildingOnly(street),buildingOnly(building),/^(?:стр(?:оение)?|корп(?:ус)?)\.?\s*\d+[а-яa-z]?$/i.test(extra||'')?extra:''].filter(Boolean).join(', ');
}
export function fulfillmentDetails(draft){
 const pickup=draft.fulfillment==='showroom';
 const prefix=pickup?'pickup':'delivery';
 const explicitReceiver=draft.forOther||draft[prefix+'Other'];
 return {
  pickup,
  method:pickup?'Самовывоз':'Курьером',
  address:pickup?draft.showroom:deliveryAddress(draft),
  schedule:!pickup&&draft.deliveryDate&&draft.deliverySlot?`${deliveryDateLabel(draft.deliveryDate)}, ${draft.deliverySlot}`:'',
  name:explicitReceiver?draft[prefix+'Name']?.trim():orderCell().name,
  phone:explicitReceiver?draft[prefix+'Phone']?.trim():'',
  ...(!pickup&&draft.addressDetails?{addressDetails:draft.addressDetails}:{}),
 };
}
export function addressErrors(draft){
 const errors={};
 for(const [key,label] of Object.entries({country:'Укажите страну',city:'Укажите город',address:'Укажите адрес'})){
  if(!draft[key]?.trim())errors[key]=label;
 }
 return errors;
}
export function recipientError(value,scenario){
 const id=value.trim();
 if(!/^VR-\d{6}$/.test(id))return 'Введите полный ID ячейки';
 if(ownedOrderCells(scenario).some(cell=>cell.id===id)||scenario==='recipient-own')return 'Это ваша ячейка. Выберите её в заказе на себя.';
 if(id!==exampleRecipient.id)return 'Ячейка с таким ID не найдена. Проверьте ID.';
 return ({
  'recipient-missing':'Ячейка с таким ID не найдена. Проверьте ID.',
  'recipient-unverified':'Получатель ещё не подтвердил email.',
  'recipient-blocked':'На этот аккаунт оформить заказ нельзя.',
  'recipient-rate-limit':'Слишком много попыток. Попробуйте через час.',
 })[scenario]||(scenario==='recipient-error'?'Не удалось проверить получателя. Попробуйте ещё раз.':'');
}
export function changeQuantity(lines,productId,quantity){
 if(!Number.isSafeInteger(quantity)||quantity<1)return lines;
 return lines.some(l=>l.productId===productId)?lines.map(l=>l.productId===productId?{...l,quantity}:l):[...lines,{productId,quantity}];
}
export const goodsTotal=(lines,products)=>lines.reduce((total,line)=>total+Math.round((products.find(p=>p.id===line.productId)?.price||0)*100)*line.quantity,0);
export const needsDelivery=(lines,products)=>lines.some(line=>products.find(p=>p.id===line.productId)?.category!=='online');
// Fictional checkout quote, in euro cents, used only by local storefront fixtures.
export const fixtureCourierCents=990;
const fixtureBonusCents=2500;
export function checkoutQuote(lines,products,draft){
 const goodsCents=goodsTotal(lines,products);
 const physical=needsDelivery(lines,products);
 const deliveryCents=physical&&draft.fulfillment!=='showroom'?fixtureCourierCents:0;
 const taxCents=Math.round(goodsCents/6);
 const bonusCapCents=Math.min(fixtureBonusCents,Math.floor((goodsCents-taxCents)/2));
 const bonusCents=(draft.useBonus??draft.payment==='external-bonus')?bonusCapCents:0;
 return {goodsCents,physical,deliveryCents,taxCents,bonusCapCents,bonusCents,payableCents:goodsCents+deliveryCents-bonusCents};
}
export function checkoutErrors(draft,physical,stage='all',now=new Date()){
 const errors={};
 if((stage==='payment'||stage==='all')&&!['external','external-bonus','balance','saved-card'].includes(draft.payment))errors.payment='Выберите способ оплаты';
 if(!physical||stage==='payment')return errors;
 const pickup=draft.fulfillment==='showroom';
 if(pickup){
  if(!exampleShowrooms.includes(draft.showroom))errors.showroom='Выберите шоу-рум';
 }else{
  Object.assign(errors,addressErrors(draft));
  if(!exampleDeliveryRates.includes(draft.deliveryRate))errors.deliveryRate='Выберите вариант доставки';
  if(!deliveryDates(now).some(day=>day.key===draft.deliveryDate))errors.deliveryDate='Выберите дату доставки';
  if(!deliverySlotsForDate(draft.deliveryDate,now).includes(draft.deliverySlot))errors.deliverySlot='Выберите время доставки';
 }
 const prefix=pickup?'pickup':'delivery';
 if(draft.forOther||draft[prefix+'Other']){
  if(!draft[prefix+'Name']?.trim())errors[prefix+'Name']='Укажите имя и фамилию';
  if(!validatePhoneNumber(draft[prefix+'Phone']))errors[prefix+'Phone']='Укажите телефон получателя';
 }
 return errors;
}
export function createDemoOrder(lines,products,draft,id){
 const quote=checkoutQuote(lines,products,draft);
 const receiving=quote.physical?(draft.committedFulfillment||fulfillmentDetails(draft)):null;
 return {id,date:new Date().toISOString(),status:'demo',demo:true,partnerLabel:'Без оплаты',receiptId:null,
 items:lines.map(line=>{const product=products.find(p=>p.id===line.productId);return {id:line.productId,productId:line.productId,name:product.name,quantity:line.quantity,unitCents:Math.round(product.price*100),discountCents:0,bv:0,description:product.description};}),
 quote,recipient:draft.committedRecipient??null,deliveryCents:quote.deliveryCents,taxCents:0,includedTaxCents:quote.taxCents,bonusCents:quote.bonusCents,delivery:receiving?{recipient:receiving.name,address:receiving.address,method:receiving.method,schedule:receiving.schedule,phone:receiving.phone,...(receiving.addressDetails?{addressDetails:receiving.addressDetails}:{})}:null,
 payments:[],paymentChoice:draft.payment!=='balance'&&(draft.useBonus??draft.payment==='external-bonus')?'external-bonus':draft.payment==='external-bonus'?'external':draft.payment,useBonus:draft.useBonus??draft.payment==='external-bonus',saveCard:draft.payment!=='balance'&&!!draft.saveCard,unknownBV:true};
}
