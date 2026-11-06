import {profileInitialData} from './profileData.js';
// In-memory prototype only. Never produces a payment or a binary event.
export const profileDelivery=()=>{const p=profileInitialData.personal;return {recipient:p.firstName+' '+p.lastName,country:p.country,city:p.city,address:p.address,postal:p.postalCode};};
export const emptyCheckout=()=>({forOther:false,account:'',...profileDelivery(),addressMode:'profile',payment:'external',bonus:''});
export function changeQuantity(lines,productId,quantity){
 if(!Number.isSafeInteger(quantity)||quantity<1)return lines;
 return lines.some(l=>l.productId===productId)?lines.map(l=>l.productId===productId?{...l,quantity}:l):[...lines,{productId,quantity}];
}
export const goodsTotal=(lines,products)=>lines.reduce((total,line)=>total+Math.round((products.find(p=>p.id===line.productId)?.price||0)*100)*line.quantity,0);
export const needsDelivery=(lines,products)=>lines.some(line=>products.find(p=>p.id===line.productId)?.category!=='online');
export function checkoutErrors(draft,physical){
 const errors={};
 if(!['external','external-bonus','balance'].includes(draft.payment))errors.payment='Выберите способ оплаты';
 if(physical)for(const [key,label] of Object.entries({recipient:'Укажите получателя',country:'Укажите страну',city:'Укажите город',address:'Укажите адрес'}))if(!draft[key]?.trim())errors[key]=label;
 return errors;
}
export function createDemoOrder(lines,products,draft,id){
 const physical=needsDelivery(lines,products);
 return {id,date:new Date().toISOString(),status:'demo',demo:true,partnerLabel:'Без оплаты',receiptId:null,
 items:lines.map(line=>{const product=products.find(p=>p.id===line.productId);return {id:line.productId,productId:line.productId,name:product.name,quantity:line.quantity,unitCents:Math.round(product.price*100),discountCents:0,bv:0,description:product.description};}),
 deliveryCents:0,taxCents:0,delivery:physical?{recipient:draft.recipient.trim(),address:[draft.country,draft.city,draft.address,draft.postal].map(v=>v.trim()).filter(Boolean).join(', ')}:null,
 payments:[],paymentChoice:draft.payment,unknownBV:true,unquotedDelivery:physical};
}
