import React,{useId,useLayoutEffect,useRef,useState} from 'react';
import Button from './CabinetButton.jsx';
import {ProfileField as Field,ProfileCard as Card} from './Profile.jsx';
import CheckoutRecipient from './CheckoutRecipient.jsx';
import CheckoutFulfillment,{FulfillmentDetails,CheckoutRegion,changeCheckoutRegion} from './CheckoutFulfillment.jsx';
import GuestCheckout from './GuestCheckout.jsx';
import EmptyIllustration from './EmptyIllustration.jsx';
import {products,AssetImage} from '../../Storefront.jsx';
import {formatCents as euro} from '../../numberFormat.js';
import {addressErrors,checkoutQuote,checkoutErrors,checkoutPayerCell,fulfillmentDetails,orderCell} from './commerceData.js';
import {profileInitialData} from './profileData.js';
import cardIcon from '../../assets/navigation/card-linear.svg';
import walletIcon from '../../assets/navigation/wallet-linear.svg';
import './checkout.css';
import './checkout-success.css';

export const paymentLabels={external:'Банковская карта','external-bonus':'Внешняя оплата + бонусный счёт',balance:'Балансовый счёт','saved-card':'Сохранённая карта'};
const paymentMethods=[
 {value:'external',title:paymentLabels.external,description:'Введите данные карты на странице оплаты',icon:cardIcon},
 {value:'balance',title:paymentLabels.balance,description:'Средства на вашем счёте Virena',icon:walletIcon},
];
const savedCardFixture={value:'saved-card',title:paymentLabels['saved-card'],description:'•••• 4242',icon:cardIcon};
const checkoutBalance=scenario=>{
 if(scenario==='payment-balance-insufficient')return 1000;
 if(['ready','single','many','physical','digital','recipient-ready','cells-two','cells-three','payment-balance'].includes(scenario))return 100000;
 return null;
};
const paymentMethod=draft=>draft.payment==='external-bonus'?'external':draft.payment;
const bonusSelected=draft=>draft.useBonus??draft.payment==='external-bonus';
const checkoutAccount=(draft,scenario)=>{
 if(draft.buyerContact)return null;
 const payer=checkoutPayerCell(draft,scenario);
 return draft.forOther?draft.recipientCell&&{id:draft.recipientCell.id,login:draft.recipientCell.login,payer}:payer;
};

export function CheckoutPaymentOptions({Shared,db,draft,setDraft,onChange,error,scenario='ready',quote}){
 const id=useId(),money=paymentMethod(draft),bonus=bonusSelected(draft);
 const balance=checkoutBalance(scenario),shortfall=balance==null?0:Math.max(0,(quote?.payableCents??0)-balance);
 const options=scenario==='payment-saved-card'?[paymentMethods[0],savedCardFixture,paymentMethods[1]]:paymentMethods;
 const update=changes=>{setDraft(d=>({...d,...changes}));onChange?.();};
 return <>
  <fieldset className="checkout-payment-options" aria-describedby={error?id+'error':undefined}>
   <legend>Как вам удобнее оплатить?</legend>
   {options.map(option=>{
    const balanceOption=option.value==='balance';
    const description=balanceOption?(balance==null?'Остаток пока недоступен':`Доступно ${euro(balance)}`):option.description;
    return <label key={option.value} className="checkout-payment-option checkout-choice">
    <input type="radio" name={id} value={option.value} checked={money===option.value} disabled={balanceOption&&(balance==null||shortfall>0)} aria-invalid={error?true:undefined}
     onChange={()=>update({payment:option.value,useBonus:bonus})}/>
    <span className="checkout-payment-icon" aria-hidden="true" style={{maskImage:`url("${option.icon}")`,WebkitMaskImage:`url("${option.icon}")`}}/>
    <span><strong>{option.title}</strong><small>{description}</small>
     {balanceOption&&shortfall>0&&<small>Не хватает {euro(shortfall)}</small>}
    </span>
   </label>;
   })}
  </fieldset>
  {error&&<p className="profile-error" id={id+'error'} role="alert">{error}</p>}
  <div className="checkout-check checkout-switch checkout-switch-panel checkout-bonus-panel" onClick={event=>{if(!event.target.closest('button'))update({useBonus:!bonus});}}>
   <div className="checkout-switch-copy">
    <strong>Использовать бонусный счёт</strong>
    {quote&&<small>{bonus?`К оплате бонусами ${euro(quote.bonusCents)}`:`Доступно для этого заказа ${euro(quote.bonusCapCents)}`}</small>}
   </div>
   <Shared.Toggle group={db.components.find(c=>c.name==='Boris / Switch')} value={bonus} ariaLabel="Использовать бонусный счёт" onChange={value=>update({useBonus:value})}/>
  </div>
 </>;
}

function summaryFulfillment(draft,physical,available){
 if(!physical||!available)return;
 const pickup=draft.fulfillment==='showroom';
 const savedAddress=pickup||draft.addressMode!=='edit'?draft:draft.addressSnapshot&&{...draft,...draft.addressSnapshot};
 if(!savedAddress||!pickup&&Object.keys(addressErrors(savedAddress)).length)return;
 const invalid=checkoutErrors(savedAddress,true,'delivery');
 if(invalid.showroom)return;
 const prefix=pickup?'pickup':'delivery';
 const clean={...savedAddress};
 if(invalid.deliveryDate||invalid.deliverySlot)clean.deliveryDate='';
 const details=fulfillmentDetails(clean);
 if(invalid[prefix+'Name']||invalid[prefix+'Phone']||draft.buyerContact&&!clean[prefix+'Other'])details.name='';
 return details;
}

function CheckoutTotals({quote,itemCount,pickup,awaitingFulfillment=false,totalLabel='К оплате'}){
 return <div className="checkout-order-totals">
  <dl className="checkout-costs">
   <div><dt>Товары{itemCount!=null&&` · ${itemCount} шт.`}</dt><dd>{euro(quote.goodsCents)}</dd></div>
   {quote.physical&&<div><dt>{pickup?'Самовывоз':'Доставка'}</dt><dd>{awaitingFulfillment?'После выбора получения':euro(quote.deliveryCents)}</dd></div>}
   <div><dt>В том числе налог</dt><dd>{euro(quote.taxCents)}</dd></div>
   {quote.bonusCents>0&&<div><dt>Бонусами</dt><dd>{euro(-quote.bonusCents)}</dd></div>}
  </dl>
  <dl className="checkout-subtotal"><dt>{awaitingFulfillment?'Без доставки':totalLabel}</dt><dd>{euro(awaitingFulfillment?quote.goodsCents:quote.payableCents)}</dd></dl>
 </div>;
}

function CheckoutItems({lines}){
 return <div className="checkout-items">{lines.map(line=>{
   const product=products.find(item=>item.id===line.productId);
   const unit=Math.round(product.price*100);
   return <div className="checkout-item" key={line.productId}>
    <AssetImage asset={product.image} alt=""/>
    <div><strong>{product.name}</strong><span>{line.quantity} шт. × {euro(unit)}</span></div>
    <strong>{euro(unit*line.quantity)}</strong>
   </div>;
  })}</div>;
}

export function CheckoutOrderSummary({lines,draft,guest=false,available=true,scenario,snapshot,quote=checkoutQuote(lines,products,draft),children}){
 const account=!guest&&(snapshot?snapshot.buyer:checkoutAccount(draft,scenario));
 const receiving=!guest&&(snapshot?snapshot.fulfillment:summaryFulfillment(draft,quote.physical,available));
 return <aside className="profile-card checkout-summary" aria-label="Итоги оформления">
  <h2>Ваш заказ</h2>
  <CheckoutItems lines={lines}/>
  {(account||receiving)&&<div className="checkout-summary-details">
   {account&&<p className="checkout-summary-account">
    <strong>Заказ на {account.payer?account.login+' · ':account.name?account.name+' · ':''}<span className="checkout-account-id">{account.id}</span></strong>
    {account.payer&&<span>Оплачивает {account.payer.name?account.payer.name+' · ':''}<span className="checkout-account-id">{account.payer.id}</span></span>}
   </p>}
   {receiving&&<section className="checkout-summary-fulfillment" aria-label="Получение">
    <h3>Получение</h3><FulfillmentDetails details={receiving}/>
   </section>}
  </div>}
  <CheckoutTotals quote={quote} awaitingFulfillment={Boolean(snapshot && quote.physical && !receiving)} pickup={snapshot?snapshot.fulfillment?.pickup:draft.fulfillment==='showroom'} itemCount={lines.reduce((count,line)=>count+line.quantity,0)}/>
  {children}
 </aside>;
}

function CheckoutBuyer({ui,draft,setDraft,scenario,error,payerError,onLoadingChange,deliveryProfile}){
 const buyer=draft.buyerContact||{name:orderCell().name,...profileInitialData.contacts};
 const identity=<div className="checkout-buyer-header">
  {buyer.name&&<strong className="checkout-buyer-name">{buyer.name}</strong>}
  <div className="checkout-buyer-contacts">
   {buyer.phone&&<span>{buyer.phone}</span>}{buyer.email&&<span>{buyer.email}</span>}
  </div>
 </div>;
 return draft.buyerContact?<>{identity}<p className="checkout-caption" role="status">Не удалось загрузить ваш аккаунт. Повторите попытку.</p></>:
  <CheckoutRecipient {...ui} {...{draft,setDraft,scenario}} deliveryProfile={deliveryProfile} buyer={identity} validationError={error} payerError={payerError} onLoadingChange={onLoadingChange}/>;
}

const testCardNumber='4242424242424242';
const emptyCard={number:'',expiry:'',security:''};
const numberDigits=value=>value.replace(/\D/g,'');
const formatCardNumber=value=>numberDigits(value).slice(0,19).match(/.{1,4}/g)?.join(' ')||'';
const formatCardExpiry=value=>{
 const digits=numberDigits(value).slice(0,4);
 return digits.length>2?digits.slice(0,2)+' / '+digits.slice(2):digits;
};
const formatCardSecurity=value=>numberDigits(value).slice(0,4);
function testCard(){
 const date=new Date();
 return {
  number:formatCardNumber(testCardNumber),
  expiry:formatCardExpiry(String(date.getMonth()+1).padStart(2,'0')+String(date.getFullYear()+1).slice(-2)),
  security:'123',
 };
}
function cardErrors(card){
 const errors={},number=numberDigits(card.number),expiry=numberDigits(card.expiry);
 const month=Number(expiry.slice(0,2)),year=2000+Number(expiry.slice(2));
 const now=new Date();
 if(!number)errors.number='Введите номер карты';
 else if(number!==testCardNumber)errors.number='Для проверки используйте тестовый номер 4242 4242 4242 4242';
 if(expiry.length!==4||month<1||month>12)errors.expiry='Укажите срок в формате ММ / ГГ';
 else if(year*12+month<now.getFullYear()*12+now.getMonth()+1)errors.expiry='Срок действия карты истёк';
 if(!/^\d{3,4}$/.test(card.security))errors.security='Введите 3 или 4 цифры';
 return errors;
}

function CheckoutPaymentPage({ui,draft,scenario,quote,navigate,back,onFixturePaid,heading}){
 const savedCard=paymentMethod(draft)==='saved-card',account=draft.committedRecipient||checkoutAccount(draft,scenario);
 const [card,setCard]=useState(emptyCard),[visited,setVisited]=useState({}),[result,setResult]=useState('');
 const [pending,setPending]=useState(false),[showSecurityHelp,setShowSecurityHelp]=useState(false);
 const timer=useRef(null),form=useRef(null);
 const errors=cardErrors(card);
 useLayoutEffect(()=>()=>clearTimeout(timer.current),[]);

 const pay=()=>{
  if(savedCard||timer.current!==null)return;
  setVisited({number:true,expiry:true,security:true});
  if(Object.keys(errors).length){
   requestAnimationFrame(()=>form.current?.querySelector('input[aria-invalid=true]')?.focus());
   return;
  }
  setPending(true);
  timer.current=setTimeout(()=>{
   timer.current=null;
   setPending(false);
   setCard(emptyCard);
   setVisited({});
   if(scenario==='payment-paid'&&onFixturePaid){onFixturePaid();return;}
   setResult(scenario==='payment-failed'?'failed':scenario==='payment-pending'?'pending':'checked');
  },600);
 };

 const field=(name,label,placeholder,format,extras={})=><div className="profile-field" onBlur={()=>setVisited(state=>({...state,[name]:true}))}>
  <label className="profile-field-label">{label}</label>
  <ui.Shared.Field group={ui.db.components.find(c=>c.name==='Auth / Input')} embedded label={label}
   placeholder={placeholder} value={card[name]} inputMode="numeric" autoComplete="off"
   readOnly={pending} clearable={false} validateOnBlur={false} error={visited[name]?errors[name]:undefined}
   onChange={value=>setCard(state=>({...state,[name]:format(value)}))} {...extras}/>
  {visited[name]&&errors[name]&&<p className="profile-error" role="alert">{errors[name]}</p>}
 </div>;

 const resultTitle={checked:'Проверка формы завершена',failed:'Тестовый платёж отклонён',pending:'Тестовый платёж проверяется'};
 return <div className="checkout-pay-layout">
  <div className="checkout-top"><Button {...ui} label="Назад" leadingIconContent={<ui.Shared.Icon name="return-to-list"/>} onClick={back}/></div>
  <section className="profile-card checkout-pay-card" aria-labelledby="checkout-pay-title">
   <h1 id="checkout-pay-title" ref={heading} tabIndex={-1}>Оплата банковской картой</h1>
   {account&&<p className="checkout-caption">Заказ на {account.payer?account.login:account.name} · {account.id}{!account.payer&&account.login&&' · '+account.login}{account.payer&&<> · Оплачивает {account.payer.name} · {account.payer.id}</>}</p>}
   {result?<div className="checkout-payment-result" role="status">
    <h2>{resultTitle[result]}</h2>
    <p>Деньги не списаны. Товары остались в корзине.</p>
    {result==='failed'?<>
     <Button {...ui} label="Попробовать ещё раз" tone="Primary" onClick={()=>setResult('')}/>
     <Button {...ui} label="Выбрать другой способ" onClick={back}/>
    </>:<>
     <Button {...ui} label="Вернуться к оформлению" tone="Primary" onClick={back}/>
     <Button {...ui} label="Продолжить покупки" onClick={()=>navigate('shop')}/>
    </>}
   </div>:<form className="checkout-card-form" ref={form} autoComplete="off" aria-busy={pending}
    onSubmit={event=>{event.preventDefault();pay();}}
    onKeyDown={event=>{if(event.key==='Enter'&&event.target.tagName==='INPUT'){event.preventDefault();pay();}}}>
    {savedCard?<p className="checkout-caption">Сохранённая карта {savedCardFixture.description}. Для проверки выберите новую карту.</p>:<>
     <div className="checkout-card-hint">
      <p>Для проверки формы используйте тестовую карту. Не вводите реальные реквизиты. Деньги не списываются.</p>
      <Button {...ui} label="Заполнить тестовой картой" size="40" disabled={pending}
       onClick={()=>{setCard(testCard());setVisited({});}}/>
     </div>
     <fieldset className="checkout-provider-fields" aria-label="Реквизиты карты" disabled={pending}>
      <div className="checkout-wide">{field('number','Номер карты','0000 0000 0000 0000',formatCardNumber,{leadingIcon:<span className="checkout-payment-icon" aria-hidden="true" style={{maskImage:`url("${cardIcon}")`,WebkitMaskImage:`url("${cardIcon}")`}}/>})}</div>
      {field('expiry','Срок действия','ММ / ГГ',formatCardExpiry)}
      {field('security','Код безопасности','•••',formatCardSecurity,{masked:true,trailingContent:
       <button type="button" className="field-tool" aria-label="Где найти код безопасности" aria-expanded={showSecurityHelp} onClick={()=>setShowSecurityHelp(open=>!open)}><ui.Shared.Icon name="Auth / Icon / Info"/></button>})}
      {showSecurityHelp&&<p className="checkout-wide checkout-caption">Код находится на карте. Для проверки введите 123.</p>}
     </fieldset>
    </>}
    <CheckoutTotals quote={quote} pickup={draft.fulfillment==='showroom'}/>
    <ui.Shared.Button group={ui.db.components.find(c=>c.name==='Boris / Button')} choice={{Tone:'Primary',Size:'48'}}
     label={`Проверить оплату на ${euro(quote.payableCents)}`} disabled={savedCard} loading={pending} onClick={pay}/>
    <p className="checkout-caption">При реальной оплате реквизиты принимает платёжный сервис.</p>
   </form>}
  </section>
 </div>;
}

function CheckoutStage({ui,stage,title,active,complete,summary,headerAction,edit,apply,busy,applyDisabled,action,children}){
 const id='checkout-'+stage+'-title';
 return <div className="checkout-stage">
  <section className={'profile-card checkout-panel'+(stage==='buyer'?' checkout-buyer-panel':'')}
   data-checkout-stage={stage} data-open={active} aria-labelledby={id}>
   <div className="checkout-section-heading">
    <h2 id={id} tabIndex={-1}>{title}</h2>
    {active&&headerAction}
    {complete&&<ui.Shared.Button group={ui.db.components.find(component=>component.name==='Boris / Button')}
     choice={{Tone:'Soft',Size:'40'}} label="Изменить" ariaLabel={'Изменить: '+title} disabled={busy} onClick={edit}/>}
   </div>
   {complete&&<div className="checkout-stage-summary">{summary}</div>}
   <div className="checkout-stage-content" hidden={!active}>{children}</div>
  </section>
  {active&&<div className="checkout-stage-actions">{action??<Button {...ui} tone="Primary" label="Применить" disabled={busy||applyDisabled} onClick={apply}/>}</div>}
 </div>;
}

function CheckoutSuccess({ui,order,navigate}){
 const heading=useRef(null);
 useLayoutEffect(()=>heading.current?.focus(),[order.id]);
 const delivery=order.delivery;
 const payment=paymentLabels[order.paymentChoice==='external-bonus'?'external':order.paymentChoice];
 return <div className="profile checkout checkout-confirmation">
  <section className="profile-card checkout-success" aria-labelledby="checkout-success-title">
   <span className="checkout-success-mark" aria-hidden="true"><ui.Shared.Icon name="Auth / Icon / Success"/></span>
   <h2 id="checkout-success-title" ref={heading} tabIndex={-1}>Тестовый заказ № {order.id}</h2>
   <p>Проверка оплаты завершена. Деньги не списаны.</p>
   <div className="checkout-receipt">
    <div className="checkout-receipt-heading">
     <h3>Состав заказа</h3>
     <ui.Shared.Status tone="Neutral" label="Без оплаты"/>
    </div>
    <ul className="checkout-success-products">{order.items.map(item=>{
     const product=products.find(product=>product.id===item.productId);
     return <li key={item.id}>
      {product?.image&&<AssetImage asset={product.image} alt=""/>}
      <div><strong>{item.name}</strong><small>{item.quantity} шт.</small></div>
     </li>;
    })}</ul>
    <div className="checkout-receipt-details">
     <section>
      <h3>Получение</h3>
      {delivery?<FulfillmentDetails details={{...delivery,name:delivery.recipient}}/>:<p>Онлайн-продукты · доставка не нужна</p>}
     </section>
     {order.recipient&&<section><h3>Аккаунт получателя</h3><p>{order.recipient.name||order.recipient.login}</p><p>{order.recipient.id}</p></section>}
     {payment&&<section><h3>Способ оплаты</h3><p>{payment}</p></section>}
    </div>
    <CheckoutTotals quote={order.quote} pickup={delivery?.method==='Самовывоз'} totalLabel="Сумма проверки"/>
   </div>
   <div className="checkout-actions">
    <Button {...ui} label="Мои покупки" tone="Primary" onClick={()=>navigate('orders','order:'+order.id)}/>
    <Button {...ui} label="Продолжить покупки" onClick={()=>navigate('shop')}/>
   </div>
  </section>
 </div>;
}

export default function Checkout({Shared,db,lines,draft,setDraft,navigate,onFixturePaid,order,confirmation=false,scenario='ready',guest=false,onSignIn,onGuestVerified,deliveryProfile}){
 const [errors,setErrors]=useState({}),[submitError,setSubmitError]=useState(false),[balanceReview,setBalanceReview]=useState(false);
 const [recipientLoading,setRecipientLoading]=useState(false),[fulfillmentLoading,setFulfillmentLoading]=useState(false);
 const [stage,setStage]=useState('buyer'),[applied,setApplied]=useState({});
 const form=useRef(null),heading=useRef(null),focusHeading=useRef(false);
 const ui={Shared,db},quote=checkoutQuote(lines,products,draft);
 const {physical,payableCents}=quote;
 const fulfillmentAvailable=scenario!=='fulfillment-error',pickup=draft.fulfillment==='showroom';
 const method=paymentMethod(draft);
 const paying=!guest&&draft.step==='pay'&&['external','saved-card'].includes(method);
 const balance=checkoutBalance(scenario);
 const stages=physical?['buyer','fulfillment','payment']:['buyer','payment'];
 const current=stage==='fulfillment'&&!physical?'payment':stage;
 const summaryQuote=checkoutQuote(lines,products,{...draft,fulfillment:applied.fulfillment?.pickup?'showroom':'delivery',useBonus:current==='payment'&&bonusSelected(draft)});
 const busy=recipientLoading||physical&&fulfillmentLoading;
 const reviewingBalance=current==='payment'&&balanceReview&&method==='balance'&&balance!==null&&balance>=payableCents;
 useLayoutEffect(()=>{
  setStage('buyer');
  setApplied({});
  setErrors({});
  setBalanceReview(false);
  setSubmitError(false);
 },[scenario,physical]);
 useLayoutEffect(()=>{
  if(!focusHeading.current)return;
  focusHeading.current=false;
  const target=paying?heading.current:form.current?.querySelector('[data-checkout-stage="'+current+'"] h2');
  target?.focus({preventScroll:paying});
  if(paying)target?.closest('.cab-main')?.scrollTo({top:0,behavior:'instant'});
 },[current,paying]);
 const clearError=key=>{setErrors(previous=>({...previous,[key]:''}));setSubmitError(false);setBalanceReview(false);};
 const update=(key,value)=>{setDraft(d=>({...d,[key]:value}));clearError(key);};
 const openStage=next=>{
  focusHeading.current=true;
  setStage(next);
  setErrors({});
  setSubmitError(false);
  setBalanceReview(false);
 };
 const focusInvalid=stage=>{
  requestAnimationFrame(()=>{
   const panel=form.current?.querySelector('[data-checkout-stage="'+stage+'"]');
   const invalid=panel?.querySelector('[aria-invalid="true"]:not([disabled])');
   (invalid||panel?.querySelector('.checkout-address-actions button')||panel?.querySelector('h2'))?.focus();
  });
 };
 const validate=key=>{
  if(key==='buyer'){
   const found={};
   if(draft.forOther&&!draft.recipientCell)found.account='Найдите и подтвердите ячейку получателя';
   if(!checkoutPayerCell(draft,scenario))found.payerCell='Выберите свою ячейку';
   return found;
  }
  if(key==='fulfillment'){
   const found=checkoutErrors(draft,true,'delivery');
   if(!pickup){
    if(draft.addressMode==='edit')found.addressMode='Сохраните адрес доставки';
    if(found.country||found.city||found.address){
     setDraft(d=>({...d,addressMode:'edit',addressSnapshot:d.addressMode==='edit'?d.addressSnapshot:null}));
    }
   }
   return found;
  }
  const found=checkoutErrors(draft,physical,'payment');
  if(method==='balance'&&(balance===null||balance<payableCents)||method==='saved-card'&&scenario!=='payment-saved-card'){
   found.payment='Выберите доступный способ оплаты';
  }
  return found;
 };
 const applyStage=()=>{
  if(busy)return;
  const found=validate(current);
  if(Object.keys(found).length){setErrors(found);focusInvalid(current);return;}
  const value=current==='buyer'?checkoutAccount(draft,scenario):fulfillmentDetails(draft);
  const next={...applied,[current]:value};
  const later=stages.slice(stages.indexOf(current)+1);
  if(JSON.stringify(value)!==JSON.stringify(applied[current])){
   for(const key of later)delete next[key];
  }
  setApplied(next);
  openStage(later.find(key=>!next[key])||'payment');
 };
 const stageProps=key=>({
  ui,stage:key,active:current===key,complete:!!applied[key]&&stages.indexOf(key)<stages.indexOf(current),
  busy,edit:()=>openStage(key),apply:applyStage,
 });
 const showForm=()=>{
  openStage('payment');
  setDraft(d=>({...d,step:'recipient'}));
 };
 const continueToPayment=()=>{
  if(current!=='payment'||guest||draft.buyerContact||busy||physical&&!fulfillmentAvailable)return;
  for(const key of stages){
   const found=validate(key);
   if(Object.keys(found).length){
    setStage(key);
    setErrors(found);
    focusInvalid(key);
    return;
   }
  }
  if(scenario==='submit-error'&&!submitError){setSubmitError(true);return;}
  if(method==='balance'){setBalanceReview(true);return;}
  focusHeading.current=true;
  const account=checkoutAccount(draft,scenario);
  setDraft(d=>({...d,step:'pay',committedRecipient:account,committedFulfillment:physical?fulfillmentDetails(draft):null}));
 };
 const account=applied.buyer,receiving=applied.fulfillment;
 const back=(label,page)=><Button {...ui} label={label} leadingIconContent={<Shared.Icon name="return-to-list"/>} onClick={()=>navigate(page)}/>;
 if(confirmation&&order&&!guest)return <CheckoutSuccess {...{ui,order,navigate}}/>;
 if(!lines.length||confirmation)return <div className="profile checkout"><section className="profile-card profile-empty"><EmptyIllustration kind="cart"/><h2>{confirmation?'Нет подтверждённого заказа':'Корзина пуста'}</h2><p>{confirmation?'Проверьте список в «Моих покупках».':'Добавьте товары, чтобы перейти к оформлению.'}</p>{back('Вернуться к магазину','shop')}</section></div>;
 if(paying)return <div className="profile checkout"><CheckoutPaymentPage {...{ui,draft,scenario,quote,navigate,onFixturePaid,heading}} back={showForm}/></div>;
 return <div className="profile checkout checkout-one-page" ref={form}>
  <div className="checkout-top">{back('Вернуться к каталогу','shop')}</div>
  <h1 className="checkout-title" ref={heading} tabIndex={-1}>Оформление заказа</h1>
  <div className="checkout-layout">
   <div className="checkout-sections">
    {guest?<Card className="checkout-panel" title="Войдите, чтобы оформить заказ">
     <GuestCheckout {...ui} scenario={scenario} onSignIn={onSignIn} onVerified={contacts=>{
      setDraft(d=>({...d,buyerContact:contacts}));
      onGuestVerified?.();
     }}/>
    </Card>:<>
     <CheckoutStage {...stageProps('buyer')} title="Покупатель" applyDisabled={!!draft.buyerContact}
      summary={account&&<>
       <strong>{account.payer?account.login:account.name} · <span className="checkout-account-id">{account.id}</span></strong>
       {account.payer&&<span>Оплачивает {account.payer.name} · {account.payer.id}</span>}
      </>}>
      <CheckoutBuyer {...{ui,draft,scenario,deliveryProfile}} setDraft={action=>{setDraft(action);clearError('account');clearError('payerCell');}}
       error={errors.account} payerError={errors.payerCell} onLoadingChange={setRecipientLoading}/>
     </CheckoutStage>
     {physical&&<CheckoutStage {...stageProps('fulfillment')} title="Получение" applyDisabled={!fulfillmentAvailable}
      summary={receiving&&<FulfillmentDetails details={receiving}/>}
      headerAction={<CheckoutRegion {...ui} draft={draft} disabled={fulfillmentLoading}
       onApply={(country,city)=>{setDraft(d=>changeCheckoutRegion(d,country,city));setErrors({});setBalanceReview(false);setSubmitError(false);}}/>}>
      <CheckoutFulfillment {...ui} {...{draft,setDraft,update,errors,setErrors}} available={fulfillmentAvailable}
       hideRegion showPrice onLoadingChange={setFulfillmentLoading}/>
      {errors.addressMode&&<p className="profile-error" role="alert">{errors.addressMode}</p>}
     </CheckoutStage>}
     <CheckoutStage {...stageProps('payment')} title="Способ оплаты" action={<>
     {submitError&&<p className="profile-error" role="alert">Не удалось создать заказ. Корзина и данные сохранены. Попробуйте ещё раз.</p>}
     {reviewingBalance?<section className="checkout-balance-review" aria-label="Оплата с балансового счёта" role="status">
      <h3>Оплата с балансового счёта</h3>
      <p className="checkout-caption">Списание со счёта сейчас недоступно.</p>
      <Button {...ui} label={`Оплатить ${euro(quote.payableCents)}`} tone="Primary" disabled/>
     </section>:<Button {...ui} label={submitError?'Повторить оформление':'Перейти к оплате'} tone="Primary" disabled={busy||!!draft.buyerContact||physical&&!fulfillmentAvailable} onClick={continueToPayment}/>}
      </>}>
      <CheckoutPaymentOptions {...ui} {...{draft,setDraft}} scenario={scenario} quote={quote} onChange={()=>clearError('payment')} error={errors.payment}/>
     </CheckoutStage>
    </>}
   </div>
   <CheckoutOrderSummary {...{lines,draft,guest,scenario}} snapshot={applied} quote={summaryQuote} available={fulfillmentAvailable}/>
  </div>
 </div>;
}
