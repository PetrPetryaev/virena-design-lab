import React,{useId,useRef,useState} from 'react';
import {SegmentedTabs} from '../../AuthPrimitives.jsx';
import {products,AssetImage} from '../../Storefront.jsx';
import {formatCents} from '../../numberFormat.js';
import Button from './CabinetButton.jsx';
import Dialog from './CabinetDialog.jsx';
import Cart from './Cart.jsx';
import Checkout,{CheckoutOrderSummary,CheckoutPaymentOptions,paymentLabels} from './Checkout.jsx';
import CheckoutRecipient from './CheckoutRecipient.jsx';
import CheckoutFulfillment,{CheckoutPhysicalReceiver,DeliverySchedule,FulfillmentDetails} from './CheckoutFulfillment.jsx';
import {ProfileCard as Card} from './Profile.jsx';
import {changeQuantity,checkoutErrors,deliveryDates,deliveryDateLabel,emptyCheckout,exampleDeliverySlots,fulfillmentDetails,goodsTotal,orderCell} from './commerceData.js';
import cardIcon from '../../assets/navigation/card-linear.svg';
import walletIcon from '../../assets/navigation/wallet-linear.svg';
import './checkout-comparison.css';
import MerchantCheckoutStudy from './MerchantCheckoutStudy.jsx';

const sites={
 mts:['МТС','https://shop.mts.ru/personal/checkout'],
 megafon:['МегаФон','https://shop.megafon.ru/checkout'],
 restore:['restore:','https://re-store.ru/order/delivery/'],
 mvideo:['М.Видео','https://www.mvideo.ru/checkout'],
 dns:['DNS','https://www.dns-shop.ru/checkout-main/'],
};
const views=[
 {value:'flow',label:'Весь сценарий',title:'Оформление на одной странице',sources:['mts','restore'],difference:'В МТС завершённые секции сворачиваются, а следующая открывается. У restore: контакт, получение и оплата видны на одной странице.',choice:'Проверить вертикальный сценарий на длинном заказе. Сохранять введённое и держать «Изменить» рядом со сводкой.'},
 {value:'cart',label:'Корзина',title:'Два действия после добавления',sources:['mts'],difference:'МТС показывает подтверждение добавления и даёт сразу перейти в корзину или продолжить покупки.',choice:'Оставить корзину редактируемой. В подтверждении добавления предложить оба действия.'},
 {value:'account',label:'Аккаунт',title:'Подтверждение аккаунта заказа',sources:[],difference:'Ячейка заказа и ячейка плательщика относятся к Virena. У магазинов в сравнении отдельного выбора ячейки нет.',choice:'Сохранить обе роли. После подтверждения свернуть выбор в строку с именем и ID.'},
 {value:'receiver',label:'Кто получит',title:'Другой получатель в блоке получения',sources:['mvideo'],difference:'М.Видео раскрывает контакты другого получателя по переключателю и сохраняет контакты покупателя отдельно.',choice:'Раскрывать имя и телефон на месте, сохраняя аккаунт заказа и плательщика.'},
 {value:'delivery',label:'Получение',title:'Компактная сводка и окно выбора',sources:['megafon','restore','dns'],difference:'МегаФон объединяет доставку и самовывоз в одном окне с картой. DNS даёт выбрать точку из списка. У restore: выбранный адрес свёрнут в строку.',choice:'Показывать адрес в сводке и открывать форму выбора по кнопке «Изменить».'},
 {value:'schedule',label:'Дата и время',title:'Окна доставки рядом с датой',sources:['restore','mvideo','dns'],difference:'restore: и М.Видео дают выбрать день и интервал кнопками. У DNS цена может зависеть от дня.',choice:'Показывать доступные окна после выбора дня. Стоимость выводить после расчёта.'},
 {value:'payment',label:'Оплата',title:'Одно действие для выбранного способа',sources:['megafon','mvideo'],difference:'МегаФон использует карточки способов оплаты с иконками. М.Видео меняет основное действие под выбранный способ.',choice:'Оставить бонусный счёт отдельным переключателем. Текст кнопки привязать к способу оплаты.'},
 {value:'review',label:'Сводка',title:'Сводка рядом с редактируемыми блоками',sources:['mts','restore'],difference:'Заполненная секция показывает выбранные параметры и действие изменения. В сводке получения restore: показывает адрес и время.',choice:'Показывать выбранное получение, способ оплаты и сумму товаров. Держать редактирование рядом.'},
];
const exampleLines=[{productId:'expert',quantity:1}];
const exampleProduct=products.find(product=>product.id===exampleLines[0].productId);
const startDraft=()=>({...emptyCheckout(),address:'ул. Тестовая, 5',postal:''});
const clearError=(setErrors,key)=>setErrors(previous=>({...previous,[key]:''}));

function getAccount(draft){
 const owner=orderCell();
 return draft.forOther?{...draft.recipientCell,payer:owner}:{...owner};
}
function savedDraft(){
 const draft={...startDraft(),deliveryDate:deliveryDates()[0].key,deliverySlot:exampleDeliverySlots[0],payment:'external'};
 return {...draft,committedRecipient:getAccount(draft),committedFulfillment:fulfillmentDetails(draft)};
}
function focusError(ref){
 requestAnimationFrame(()=>ref.current?.querySelector('[aria-invalid="true"]')?.focus());
}

function AccountDetails({account}){
 return <>{account.payer?account.login:account.name} · {account.id}{account.payer&&<small>Оплачивает {account.payer.name} · {account.payer.id}</small>}</>;
}

function DeliveryEditor({ui,draft,setDraft,errors,setErrors,fieldRef}){
 const update=(key,value)=>{setDraft(d=>({...d,[key]:value}));clearError(setErrors,key);};
 return <div ref={fieldRef}><CheckoutFulfillment {...ui} {...{draft,setDraft,update,errors,setErrors}} focusInvalid={()=>focusError(fieldRef)} available/></div>;
}

function DeliveryDialog({ui,draft,onSave,onClose}){
 const [next,setNext]=useState(draft),[errors,setErrors]=useState({});
 const ref=useRef(null);
 const save=()=>{
  const found=checkoutErrors(next,true,'delivery');
  setErrors(found);
  if(Object.keys(found).length){focusError(ref);return;}
  onSave(next);
 };
 return <Dialog {...ui} title="Как получить заказ" className="profile checkout-study-dialog" onClose={onClose}
  footer={<Button {...ui} label="Сохранить получение" tone="Primary" disabled={next.fulfillment==='delivery'&&next.addressMode==='edit'} onClick={save}/>}>
  <DeliveryEditor {...{ui,errors,setErrors}} draft={next} setDraft={setNext} fieldRef={ref}/>
 </Dialog>;
}

function PaymentOptions({ui,draft,setDraft}){
 const id=useId();
 return <>
  <fieldset className="checkout-payment-options study-payment-options">
   <legend>Способ оплаты</legend>
   {[['external',cardIcon,'Введите данные карты на следующем экране'],['balance',walletIcon,'Средства на вашем балансовом счёте']].map(([key,icon,description])=><label className="checkout-payment-option" key={key}>
    <input type="radio" name={id} checked={draft.payment===key} onChange={()=>setDraft(d=>({...d,payment:key}))}/>
    <span className="checkout-payment-icon" aria-hidden="true" style={{maskImage:`url("${icon}")`,WebkitMaskImage:`url("${icon}")`}}/><span className="study-payment-copy"><strong>{paymentLabels[key]}</strong><small>{description}</small></span>
   </label>)}
  </fieldset>
  <div className="checkout-check" onClick={event=>{if(!event.target.closest('button'))setDraft(d=>({...d,useBonus:!d.useBonus}));}}>
   <ui.Shared.Toggle group={ui.db.components.find(component=>component.name==='Boris / Checkbox')} value={draft.useBonus}
    ariaLabel="Использовать бонусный счёт" onChange={value=>setDraft(d=>({...d,useBonus:value}))}/>
   <span>Использовать бонусный счёт</span>
  </div>
 </>;
}

function PaymentAction({ui,payment,onClick}){
 return <Button {...ui} tone="Primary" disabled={!payment} label={payment==='balance'?'Продолжить с балансовым счётом':'Перейти к оплате картой'} onClick={onClick}/>;
}

function OrderTotal({ui,account,delivery,payment,useBonus,onEdit,onPay}){
 return <div className="study-order">
  <div className="study-product">
   <AssetImage asset={exampleProduct.image} alt=""/>
   <div><strong>{exampleProduct.name}</strong><small>1 шт.</small></div>
   <strong>{formatCents(goodsTotal(exampleLines,products))}</strong>
  </div>
  {account&&<div className="study-order-row"><div><small>Аккаунт</small><AccountDetails account={account}/></div>{onEdit&&<Button {...ui} label="Изменить аккаунт" size="40" onClick={()=>onEdit('account')}/>}</div>}
  {delivery&&<div className="study-order-row"><div><small>Получение</small><FulfillmentDetails details={delivery}/></div>{onEdit&&<Button {...ui} label="Изменить получение" size="40" onClick={()=>onEdit('delivery')}/>}</div>}
  {payment&&<div className="study-order-row"><div><small>Оплата</small><strong>{paymentLabels[payment]}</strong>{useBonus&&<small>Бонусный счёт запрошен</small>}</div>{onEdit&&<Button {...ui} label="Изменить оплату" size="40" onClick={()=>onEdit('payment')}/>}</div>}
  <div className="study-order-row"><span>Сумма товаров</span><strong>{formatCents(goodsTotal(exampleLines,products))}</strong></div>
  {(!delivery||!delivery.pickup)&&<small>Стоимость доставки требует расчёта.</small>}
  {onPay&&<PaymentAction {...{ui,payment}} onClick={onPay}/>}
 </div>;
}

function Accordion({ui}){
 const id=useId();
 const [open,setOpen]=useState('account'),[draft,setDraft]=useState(startDraft),[committed,setCommitted]=useState({}),[errors,setErrors]=useState({}),[payNotice,setPayNotice]=useState(false);
 const deliveryRef=useRef(null);
 const sections=[['account','Аккаунт заказа'],['delivery','Получение'],['payment','Способ оплаты'],['review','Проверка заказа']];
 const openBlock=key=>{
  setOpen(key);setPayNotice(false);
  requestAnimationFrame(()=>document.getElementById(id+'-trigger-'+key)?.focus({preventScroll:true}));
 };
 const confirm=(key,value,next)=>{setCommitted(previous=>({...previous,[key]:value}));openBlock(next);};
 const confirmReceiving=()=>{
  const found=checkoutErrors(draft,true,'delivery');
  setErrors(found);
  if(Object.keys(found).length){focusError(deliveryRef);return;}
  confirm('delivery',fulfillmentDetails(draft),'payment');
 };
 return <>
  <div className="study-accordion">{sections.map(([key,label],index)=>{
   const expanded=open===key;
   const ready=key==='account'||!!committed[sections[index-1][0]];
   const trigger=id+'-trigger-'+key,panel=id+'-panel-'+key;
   return <section className="study-accordion-block" key={key}>
    <h3><button type="button" id={trigger} className="study-accordion-trigger" aria-expanded={expanded} aria-controls={panel} disabled={!ready} onClick={()=>openBlock(expanded?'':key)}>
     <span className="checkout-step-number">{index+1}</span><span>{label}</span>{committed[key]&&!expanded&&<small>Изменить</small>}
    </button></h3>
    {!expanded&&committed[key]&&<div className="study-accordion-summary">
     {key==='account'?<AccountDetails account={committed.account}/>:key==='delivery'?<FulfillmentDetails details={committed.delivery}/>:paymentLabels[committed.payment.method]}
    </div>}
    <div id={panel} hidden={!expanded} className="study-accordion-body" role="region" aria-labelledby={trigger}>
     {expanded&&key==='account'&&<>
      <CheckoutRecipient {...ui} draft={draft} setDraft={setDraft} scenario="recipient-ready"/>
      <Button {...ui} label="Подтвердить аккаунт" tone="Primary" disabled={draft.forOther&&!draft.recipientCell} onClick={()=>confirm('account',getAccount(draft),'delivery')}/>
     </>}
     {expanded&&key==='delivery'&&<>
      <DeliveryEditor {...{ui,draft,setDraft,errors,setErrors}} fieldRef={deliveryRef}/>
      <Button {...ui} label="Подтвердить получение" tone="Primary" disabled={draft.fulfillment==='delivery'&&draft.addressMode==='edit'} onClick={confirmReceiving}/>
     </>}
     {expanded&&key==='payment'&&<>
      <PaymentOptions {...{ui,draft,setDraft}}/>
      <Button {...ui} label="Подтвердить способ оплаты" tone="Primary" disabled={!draft.payment} onClick={()=>confirm('payment',{method:draft.payment,useBonus:draft.useBonus},'review')}/>
     </>}
     {expanded&&key==='review'&&<>
      <OrderTotal ui={ui} account={committed.account} delivery={committed.delivery} payment={committed.payment.method} useBonus={committed.payment.useBonus} onEdit={openBlock} onPay={()=>setPayNotice(true)}/>
      {payNotice&&<p className="checkout-caption" role="status">Платёжная форма недоступна.</p>}
     </>}
    </div>
   </section>;
  })}</div>
 </>;
}

function CartVersion({ui,alternative=false}){
 const [lines,setLines]=useState(alternative?[]:exampleLines),[draft,setDraft]=useState(startDraft),[screen,setScreen]=useState(alternative?'product':'cart'),[dialog,setDialog]=useState(false);
 const openCart=()=>{setScreen('cart');setDialog(false);};
 const onQuantity=(id,value)=>setLines(current=>changeQuantity(current,id,value));
 const onRemove=id=>setLines(current=>current.filter(line=>line.productId!==id));
 return <>
  {screen==='cart'?<Cart {...ui} {...{lines,onQuantity,onRemove}} modal onCheckout={()=>setScreen('checkout')} navigate={()=>setScreen('product')}/>
   :screen==='checkout'?<Checkout {...ui} {...{draft,setDraft}} lines={lines} navigate={()=>setScreen('cart')}/>
   :<div className="study-cart-add">
    <div className="study-product"><AssetImage asset={exampleProduct.image} alt=""/><div><strong>{exampleProduct.name}</strong><small>{formatCents(goodsTotal(exampleLines,products))}</small></div></div>
    <Button {...ui} label="Добавить в корзину" tone="Primary" onClick={()=>{setLines(exampleLines);if(alternative)setDialog(true);else openCart();}}/>
    {alternative&&lines.length>0&&<Button {...ui} label="Открыть корзину" onClick={openCart}/>}
   </div>}
  {dialog&&<Dialog {...ui} title="Товар в корзине" className="profile checkout-study-dialog" onClose={()=>setDialog(false)}
   footer={<>
    <Button {...ui} label="Продолжить покупки" onClick={()=>setDialog(false)}/>
    <Button {...ui} label="В корзину" tone="Primary" onClick={openCart}/>
   </>}>
   <div className="study-product"><AssetImage asset={exampleProduct.image} alt=""/><div><strong>{exampleProduct.name}</strong><small>1 шт.</small></div><strong>{formatCents(goodsTotal(exampleLines,products))}</strong></div>
  </Dialog>}
 </>;
}

function CurrentView({ui,stage}){
 const [draft,setDraft]=useState(stage==='review'?savedDraft:startDraft),[errors,setErrors]=useState({});
 const ref=useRef(null);
 const update=(key,value)=>setDraft(d=>({...d,[key]:value}));
 if(stage==='cart')return <CartVersion {...{ui}}/>;
 if(stage==='account')return <Card title="На кого оформить заказ"><CheckoutRecipient {...ui} {...{draft,setDraft}} scenario="recipient-ready"/></Card>;
 if(stage==='receiver')return <Card title="Кто получит заказ"><CheckoutPhysicalReceiver {...ui} {...{draft,update,errors}}/></Card>;
 if(stage==='delivery')return <Card title="Получение"><DeliveryEditor {...{ui,draft,setDraft,errors,setErrors}} fieldRef={ref}/></Card>;
 if(stage==='schedule')return <Card title="Дата и время доставки"><DeliverySchedule {...{draft,update,errors}}/></Card>;
 if(stage==='payment')return <Card title="Способ оплаты"><CheckoutPaymentOptions {...ui} {...{draft,setDraft}}/></Card>;
 if(stage==='review')return <CheckoutOrderSummary lines={exampleLines} draft={draft}/>;
 return <Checkout {...ui} {...{draft,setDraft}} lines={exampleLines} scenario="recipient-ready" navigate={()=>setDraft(startDraft())}/>;
}

function AlternateView({ui,stage}){
 const [draft,setDraft]=useState(()=>stage==='delivery'||stage==='review'?savedDraft():startDraft());
 const [editing,setEditing]=useState(stage==='account'),[notice,setNotice]=useState(false);
 const editTarget=useRef(null),id=useId();
 const update=(key,value)=>{setDraft(d=>({...d,[key]:value}));setNotice(false);};
 if(stage==='flow')return <Accordion {...{ui}}/>;
 if(stage==='cart')return <CartVersion {...{ui}} alternative/>;
 if(stage==='account')return <Card title="Аккаунт заказа">
  {editing?<><CheckoutRecipient {...ui} {...{draft,setDraft}} scenario="recipient-ready"/><Button {...ui} label="Подтвердить аккаунт" tone="Primary" disabled={draft.forOther&&!draft.recipientCell} onClick={()=>setEditing(false)}/></>:<>
   <p className="study-account-summary"><AccountDetails account={getAccount(draft)}/></p><Button {...ui} label="Изменить аккаунт" onClick={()=>setEditing(true)}/>
  </>}
 </Card>;
 if(stage==='receiver')return <Card title="Контакты получателя">
  <div className="study-account-summary"><small>Покупатель</small><strong>{orderCell().name}</strong></div>
  <div className="study-recipient-choice">
   <CheckoutPhysicalReceiver {...ui} {...{draft,update}} errors={{}}/>
  </div>
 </Card>;
 if(stage==='delivery')return <Card title="Получение">
  <div className="study-delivery-summary"><FulfillmentDetails details={draft.committedFulfillment}/>
   <Button {...ui} label="Изменить получение" onClick={()=>setEditing(true)}/>
  </div>
  {editing&&<DeliveryDialog {...{ui,draft}} onClose={()=>setEditing(false)} onSave={next=>{setDraft({...next,committedFulfillment:fulfillmentDetails(next)});setEditing(false);}}/>}
 </Card>;
 if(stage==='schedule')return <Card title="Когда доставить">
  {[['deliveryDate','Дата доставки',deliveryDates().map(day=>[day.key,deliveryDateLabel(day.key)])],['deliverySlot','Время доставки',exampleDeliverySlots.map(slot=>[slot,slot])]].map(([key,label,items])=><fieldset className="checkout-options study-schedule" key={key} disabled={key==='deliverySlot'&&!draft.deliveryDate}>
   <legend>{label}</legend>
   <div className="checkout-option-list">{items.map(([value,copy])=><label key={value} className="checkout-option"><input type="radio" name={id+key} checked={draft[key]===value} onChange={()=>update(key,value)}/><span>{copy}</span></label>)}</div>
  </fieldset>)}
  {draft.deliverySlot&&<p role="status">{deliveryDateLabel(draft.deliveryDate)}, {draft.deliverySlot}</p>}
 </Card>;
 if(stage==='payment')return <Card title="Оплата">
  <PaymentOptions {...{ui,draft,setDraft}}/>
  <PaymentAction ui={ui} payment={draft.payment} onClick={()=>setNotice(true)}/>
  {notice&&<p className="checkout-caption" role="status">Платёжная форма недоступна.</p>}
 </Card>;
 return <Card title="Проверка заказа">
  <OrderTotal {...{ui}} account={draft.committedRecipient} delivery={draft.committedFulfillment} payment={draft.payment} useBonus={draft.useBonus}
   onEdit={key=>{editTarget.current=key;setEditing(true);}}/>
  {editing&&editTarget.current==='delivery'&&<DeliveryDialog {...{ui,draft}} onClose={()=>setEditing(false)} onSave={next=>{setDraft({...next,committedFulfillment:fulfillmentDetails(next)});setEditing(false);}}/>}
  {editing&&editTarget.current!=='delivery'&&<SummaryEdit {...{ui,draft}} target={editTarget.current} onClose={()=>setEditing(false)} onSave={next=>{setDraft(next);setEditing(false);}}/>}
 </Card>;
}

function SummaryEdit({ui,draft,target,onClose,onSave}){
 const [next,setNext]=useState(draft);
 const account=target==='account';
 return <Dialog {...ui} title={account?'Аккаунт заказа':'Способ оплаты'} className="profile checkout-study-dialog" onClose={onClose}
  footer={<Button {...ui} label="Сохранить" tone="Primary" disabled={account?next.forOther&&!next.recipientCell:!next.payment} onClick={()=>onSave({...next,committedRecipient:getAccount(next)})}/>}>
  {account?<CheckoutRecipient {...ui} draft={next} setDraft={setNext} scenario="recipient-ready"/>:<PaymentOptions ui={ui} draft={next} setDraft={setNext}/>}
 </Dialog>;
}

function BlockComparison({Shared,db}){
 const id=useId(),ui={Shared,db};
 const [view,setView]=useState('flow');
 const selected=views.find(item=>item.value===view);
 return <div className="profile checkout-study">
  <header className="study-header">
   <h1>Сравнение оформления заказа</h1>
   <p>Пройдите текущий сценарий и альтернативу на тех же данных.</p>
  </header>
  <SegmentedTabs items={views} value={view} onChange={setView} idPrefix={id} panelId={id+'panel'} className="study-tabs" label="Блоки оформления"/>
  <div id={id+'panel'} key={view} role="tabpanel" aria-labelledby={id+view} className="study-panel">
   <div className="study-context">
    <h2>{selected.title}</h2><p>{selected.difference}</p>
    <div className="study-source-list">{selected.sources.map(key=><a key={key} href={sites[key][1]} target="_blank" rel="noreferrer">{sites[key][0]}</a>)}</div>
   </div>
   <div className="study-pair">
    <section className="study-side study-current" aria-label="Текущая Virena">
     <div className="study-side-heading"><h3>Virena сейчас</h3>{view==='flow'&&<p>Оформление на одной странице</p>}</div>
     <CurrentView ui={ui} stage={view}/>
    </section>
    <section className="study-side study-alternative" aria-label="Альтернатива">
     <div className="study-side-heading"><h3>Альтернатива</h3><p>{view==='flow'?'Вертикальные блоки · адаптация на ДС Virena':'Адаптация на ДС Virena'}</p></div>
     <AlternateView ui={ui} stage={view}/>
    </section>
   </div>
   <p className="study-choice"><strong>Что попробовать в Virena</strong>{selected.choice}</p>
   {selected.sources.length>0&&<p className="study-source-note">Источники проверены 24 ноября 2026. Для открытия checkout может понадобиться товар в корзине.</p>}
  </div>
 </div>;
}

export default function CheckoutComparison({Shared,db}){
 const [blocks,setBlocks]=useState(()=>new URLSearchParams(location.search).get('studyMode')==='blocks');
 return blocks?<><button type="button" onClick={()=>setBlocks(false)}>← Версии магазинов</button><BlockComparison {...{Shared,db}}/></>:<MerchantCheckoutStudy Shared={Shared} renderCurrent={()=> <CurrentView ui={{Shared,db}} stage="flow"/>} onBlocks={()=>setBlocks(true)}/>;
}
