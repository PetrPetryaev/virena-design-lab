import React,{useEffect,useMemo,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import PurchaseFilterBar from './PurchaseFilterBar.jsx';
import DataTable from '../../ds/DataTable.jsx';
import {products,AssetImage} from '../../Storefront.jsx';
import {formatCents as euro,formatValue as number} from '../../numberFormat.js';
import Button from './CabinetButton.jsx';
import ToolbarFilters from '../../ToolbarFilters.jsx';
import Dialog from './CabinetDialog.jsx';
import {ProfileField as Field,ProfileSelect as Select} from './Profile.jsx';
import EmptyIllustration from './EmptyIllustration.jsx';
import FinanceInfo from './FinanceInfo.jsx';
import logo from '../../assets/virena-logo.svg';
import {ordersFor,orderTotals,periodOrders,filterOrders,summarizeOrders,orderDate,ORDER_AS_OF} from './ordersData.js';
import './orders.css';

const periods={all:'За всё время',year:'Текущий год',previous:'Прошлый год',custom:'Свой диапазон'};
const statuses={all:'Все статусы',paid:'Оплаченные',pending:'В обработке',refund:'С возвратом',demo:'Без оплаты'};
const orderStatus={pending:['Warning','В обработке'],demo:['Info','Без оплаты'],paid:['Success','Оплачен'],partial:['Warning','Частичный возврат'],returned:['Neutral','Возвращён']};
const keyFor=(map,value)=>Object.keys(map).find(k=>map[k]===value);
const normalize=v=>v.trim().toLocaleLowerCase('ru');
function validDate(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const d=new Date(value+'T12:00:00Z');return Number.isFinite(+d)&&d.toISOString().slice(0,10)===value;}
function ProductArt({item}){const product=products.find(p=>p.id===item.productId);return <span className="order-art">{product?.image?<AssetImage asset={product.image} alt={item.name}/>:<img src={logo} alt="Virena"/>}</span>;}
function OrderBadge({Shared,order}){const [tone,label]=orderStatus[order.status];return <Shared.Status tone={tone} label={label}/>;}
function OrderDetails({order,Shared,db,query,notify,navigate,actionError,onClose,toast}){
 const totals=orderTotals(order),quote=order.quote;
 const copy=async()=>{try{if(actionError)throw Error();await navigator.clipboard.writeText(order.id);notify('Номер скопирован');}catch{notify('Не удалось скопировать номер. Выделите его рядом с кнопкой.');}};
 const download=async()=>{try{if(actionError)throw Error();const response=await fetch(`${import.meta.env.BASE_URL}assets/order-receipts/${order.receiptId}.pdf`);if(!response.ok||!response.headers.get('content-type')?.includes('pdf'))throw Error();const url=URL.createObjectURL(await response.blob()),a=document.createElement('a');a.href=url;a.download=`Virena-заказ-${order.id}-заказ.pdf`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('Файл заказа скачан');}catch{notify('Не удалось скачать чек. Попробуйте ещё раз.');}};
 return <Dialog drawer className="order-drawer" {...{Shared,db,onClose}} title={`Заказ № ${order.id}`} notification={toast}
   titleAction={<Button {...{Shared,db}} icon="copy-linear" label={`Скопировать номер заказа ${order.id}`} size="40" tone="Ghost" onClick={copy}/>}
   subtitle={<div className="order-modal-meta"><span>{orderDate(order.date)}</span><OrderBadge Shared={Shared} order={order}/></div>}
   headerActions={!order.demo&&<Button {...{Shared,db}} icon="download-minimalistic-linear" size="40" label="Скачать чек" onClick={download}/>} footer={<>{order.demo&&order.status==='pending'&&<Button {...{Shared,db}} label="Статус оплаты" tone="White" onClick={()=>navigate('confirmation','order:'+order.id)}/>}<Button {...{Shared,db}} label="Вопрос по заказу" tone="Soft" leadingIconContent={<Shared.Icon name="chat-round-linear"/>} onClick={()=>navigate('support','order:'+order.id)}/></>}>
 <div className="order-modal-body"><section className="order-detail" id={`order-${order.id}`} aria-label={`Состав заказа ${order.id}`}>
 <h3>Состав заказа</h3>
 <div className="order-products">{order.items.map(item=><div key={item.id} className={'order-product'+(query&&normalize(item.name).includes(normalize(query))?' is-match':'')}>
 <ProductArt item={item}/><div className="order-product-copy"><strong>{item.name}</strong>{item.description&&<p>{item.description}</p>}<div className="order-tags">{item.gift&&<Shared.Status tone="Info" label="Подарок"/>}{item.noStatus&&<Shared.Status tone="Neutral" label="Не учитывается для статуса"/>}{item.returnedAt&&<Shared.Status tone="Neutral" label="Возвращено"/>}</div>{item.returnedAt&&<small>Возврат {orderDate(item.returnedAt).split(',')[0]}</small>}<div className="order-line-bv"><span className={item.returnedAt?'order-returned':''}>{order.unknownBV?'Баллы не рассчитаны':item.bv?`${number(item.bv)} баллов`:'Баллы не начисляются'}</span>{item.discountCents>0&&<FinanceInfo {...{Shared,db}} label={`Скидка: ${item.name}`} text="Баллы уменьшены пропорционально скидке"/>}</div></div>
 <div className="order-line-price"><strong className={item.returnedAt?'order-returned':''}>{euro(item.quantity*item.unitCents-item.discountCents)}</strong><span>{item.quantity} шт.{(item.quantity>1||item.discountCents>0)&&<> × {euro(item.unitCents)}</>}</span>{item.discountCents>0&&<span>Скидка −{euro(item.discountCents)}</span>}</div>
 </div>)}</div>
 <div className="drawer-section order-detail-bottom"><div className="order-fulfillment"><section><h3>Оплата</h3>{order.demo&&<p>{order.status==='demo'?'Деньги не списаны. ':''}Способ оплаты: {({external:'банковская карта','external-bonus':'банковская карта + бонусный счёт','saved-card':'сохранённая карта',balance:'балансовый счёт'})[order.paymentChoice]}.</p>}<dl>{order.payments.map((payment,i)=><div key={i}><dt>{payment.label}</dt><dd>{euro(payment.amountCents)}</dd></div>)}</dl></section>{order.delivery?<section><h3>{order.delivery.method||'Доставка'}</h3><p>{order.delivery.recipient}</p><p className="order-muted">{order.delivery.address}</p>{order.delivery.schedule&&<p className="order-muted">{order.delivery.schedule}</p>}</section>:order.demo&&<section><h3>Получение</h3><p>Онлайн-продукты · доставка не нужна.</p></section>}</div>
 <section className="order-totals"><h3>Итог заказа</h3><dl><div><dt>Товары</dt><dd>{euro(totals.goodsCents)}</dd></div>{totals.discountCents>0&&<div><dt>Скидка</dt><dd>−{euro(totals.discountCents)}</dd></div>}{order.delivery&&<div><dt>{order.delivery.method==='Самовывоз'?'Самовывоз':'Доставка'}</dt><dd>{order.unquotedDelivery?'Не рассчитана':euro(order.deliveryCents)}</dd></div>}{quote?<div><dt>В том числе налог</dt><dd>{euro(quote.taxCents)}</dd></div>:order.taxCents>0&&<div><dt>Налоги</dt><dd>{euro(order.taxCents)}</dd></div>}{quote?.bonusCents>0&&<div><dt>Бонусами</dt><dd>{euro(-quote.bonusCents)}</dd></div>}<div className="order-total"><dt>{order.status==='pending'?'Сумма заказа':order.status==='demo'?'Сумма проверки':'Итого оплачено'}</dt><dd>{euro(quote?.payableCents??totals.paidCents)}</dd></div><div><dt>Баллы за заказ</dt><dd>{order.unknownBV?'Не рассчитаны':number(totals.bv)}</dd></div>{totals.refundCents>0&&<div className="order-refund"><dt>Возвращено</dt><dd>−{euro(totals.refundCents)}<small>−{number(totals.refundBV)} баллов</small></dd></div>}</dl><p className="order-note">Баллы начисляются за товары без доставки и налогов</p></section></div>
 </section></div></Dialog>;
}
export default function Orders({Shared,db,scenario='ready',navigate,sessionOrders=[],orderId,onCloseLinkedOrder}){
 const [query,setQuery]=useState(''),[period,setPeriod]=useState('all'),[status,setStatus]=useState('all'),[range,setRange]=useState({from:'2026-01-01',to:ORDER_AS_OF});
 const [openedOrder,setSelectedOrder]=useState(null),[limit,setLimit]=useState(20),[recovered,setRecovered]=useState(false),[toast,setToast]=useState('');
 const [sort,setSort]=useState('newest');
 const timer=useRef(null);const notify=message=>{clearTimeout(timer.current);setToast(message);timer.current=setTimeout(()=>setToast(''),4000);};useEffect(()=>()=>clearTimeout(timer.current),[]);
 const orders=useMemo(()=>[...(scenario==='ready'?sessionOrders:[]),...ordersFor(scenario)],[scenario,sessionOrders]);
 const linkedOrder=orders.find(order=>order.id===orderId),selectedOrder=linkedOrder??openedOrder;
 const invalidRange=period==='custom'&&(!validDate(range.from)||!validDate(range.to)||range.from>range.to);
 const inPeriod=invalidRange?[]:periodOrders(orders,period,range),filtered=filterOrders(inPeriod,{query,status}).sort((a,b)=>sort==='newest'?Date.parse(b.date)-Date.parse(a.date):Date.parse(a.date)-Date.parse(b.date)),summary=summarizeOrders(filtered);
 const loading=scenario==='loading'&&!recovered,error=scenario==='error'&&!recovered;
 useEffect(()=>{setLimit(20);},[query,period,status,range]);
 const reset=()=>{setQuery('');setPeriod('all');setStatus('all');};
 const selection=(map,value,setValue,label)=><Select {...{Shared,db}} label={label} value={map[value]} items={Object.values(map)} onChange={v=>setValue(keyFor(map,v))}/>;
 const chips=[];
 if(period!=='all')chips.push({label:period==='custom'?[range.from,range.to].map(date=>date.split('-').reverse().join('.')).join(' – '):periods[period],clear:()=>setPeriod('all')});
 if(status!=='all')chips.push({label:statuses[status],clear:()=>setStatus('all')});
 const invalidDraft=draft=>draft.period==='custom'&&(!validDate(draft.from)||!validDate(draft.to)||draft.from>draft.to);
 const applyDraft=draft=>{setPeriod(draft.period);setStatus(draft.status);setRange({from:draft.from,to:draft.to});};
 const filters=(draft,setDraft)=>{
  const updateDraft=change=>setDraft(current=>({...current,...change}));
  return <div className="profile orders-filter-dialog">{selection(periods,draft.period,period=>updateDraft({period}),'Период')}{selection(statuses,draft.status,status=>updateDraft({status}),'Статус')}{draft.period==='custom'&&<div className="order-date-range"><Field {...{Shared,db}} label="С даты · ГГГГ-ММ-ДД" value={draft.from} onChange={from=>updateDraft({from})}/><Field {...{Shared,db}} label="По дату · ГГГГ-ММ-ДД" value={draft.to} onChange={to=>updateDraft({to})}/></div>}{invalidDraft(draft)&&<p className="profile-error" role="alert">Укажите существующие даты: начало не позже окончания.</p>}</div>;
 };
 const columns=[
 {key:'order',label:'Заказ',width:'minmax(0,1.8fr)',render:order=><div className="order-identity"><div className="ds-table-stack"><strong>№ {order.id}</strong><small>{orderDate(order.date)}</small><span className="ds-table-line order-composition" title={order.items.map(i=>i.name).join(', ')}>{order.items[0].name}{order.items.length>1&&` и ещё ${order.items.length-1}`}</span></div><div className="order-thumbnails">{order.items.slice(0,3).map(item=><ProductArt key={item.id} item={item}/>)}{order.items.length>3&&<span className="order-more">+{order.items.length-3}</span>}</div></div>},
 {key:'amount',label:'Сумма',width:'minmax(0,.8fr)',render:order=><strong className={order.status==='returned'?'order-returned':''}>{euro(order.quote?.payableCents??orderTotals(order).paidCents)}</strong>},
 {key:'points',label:'Баллы',width:'minmax(0,.65fr)',render:order=><span className={order.status==='returned'?'order-returned':''}>{order.unknownBV?'Не рассчитаны':orderTotals(order).bv?number(orderTotals(order).bv):'Без баллов'}</span>},
 {key:'status',label:'Статус',width:'minmax(0,1.25fr)',render:order=><div className="ds-table-stack"><OrderBadge Shared={Shared} order={order}/>{order.partnerLabel&&!order.demo&&<small>{order.partnerLabel}</small>}</div>},
 {key:'action',label:'',width:'var(--profile-px-40)',render:order=><span onClick={e=>e.stopPropagation()} className="order-expand"><Shared.Button group={db.components.find(c=>c.name==='Boris / Icon button')} choice={{Tone:'Ghost',Size:'40'}} ariaLabel={`Открыть заказ ${order.id}`} iconContent={<Shared.Icon name="Auth / Icon / Chevron"/>} onClick={()=>setSelectedOrder(order)}/></span>}
 ];
 return <div className="profile genealogy orders">
 <section className="orders-summary" aria-label="Итоги с учётом фильтров"><div><span title="Оплаченных заказов"><span className="summary-full">Оплаченных заказов</span><span className="summary-short">Оплачено</span></span><strong>{loading||error?'—':number(summary.count)}</strong></div><div><span title="Сумма товаров"><span className="summary-full">Сумма товаров</span><span className="summary-short">Сумма</span></span><strong>{loading||error?'—':euro(summary.goodsCents)}</strong></div><div><span title="Начислено баллов"><span className="summary-full">Начислено баллов</span><span className="summary-short">Баллы</span></span><strong>{loading||error?'—':number(summary.bv)}</strong></div></section>
 <div className="purchase-layout">
 <div className="purchase-results">
 <PurchaseFilterBar {...{Shared,db,chips,query,setQuery,sort,setSort}} onReset={()=>{setPeriod('all');setStatus('all');}} filterControl={<ToolbarFilters {...{Shared,db}} label="Фильтры заказов" count={chips.length} value={{period,status,...range}} invalid={invalidDraft} onApply={applyDraft} applyLabel="Показать заказы">{filters}</ToolbarFilters>}/>
 {error?<section className="orders-empty" role="alert"><h2>Не удалось загрузить покупки</h2><p>Попробуйте ещё раз.</p><Button {...{Shared,db}} label="Повторить" tone="Primary" onClick={()=>setRecovered(true)}/></section>:!loading&&!filtered.length?<section className="orders-empty"><EmptyIllustration kind={!orders.length?'orders':'search'}/><h2>{!orders.length?'У вас пока нет покупок':'Ничего не найдено'}</h2><p>{!orders.length?'Оплаченные заказы появятся здесь.':'Попробуйте изменить период, статус или поисковый запрос.'}</p><Button {...{Shared,db}} label={!orders.length?'Перейти в маркетплейс':'Сбросить фильтры'} tone="Primary" onClick={()=>!orders.length?navigate('shop'):reset()}/></section>:<section className="orders-list" aria-label="Ваши заказы"><DataTable {...{Shared,loading,columns}} layout="purchases" rows={filtered.slice(0,limit)} label="Заказы" onRowClick={order=>setSelectedOrder(order)}/>{!loading&&filtered.length>limit&&<div className="orders-more"><Button {...{Shared,db}} label={`Показать ещё · ${Math.min(20,filtered.length-limit)}`} onClick={()=>setLimit(n=>n+20)}/><span>Показано {limit} из {filtered.length}</span></div>}</section>}
 </div></div>
 {selectedOrder&&<OrderDetails {...{Shared,db,query,notify,navigate,toast}} order={selectedOrder} actionError={scenario==='action-error'} onClose={()=>{setSelectedOrder(null);if(linkedOrder)onCloseLinkedOrder?.();setToast('');}}/>}
 {toast&&!selectedOrder&&createPortal(<div className="auth-toast" role="status">{toast}</div>,document.body)}
 </div>;
}

export function OrderSupport({Shared,db,orderId,navigate}){
 const [text,setText]=useState(''),[error,setError]=useState(''),[done,setDone]=useState(false);
 return <div className="profile genealogy orders"><section className="orders-support"><h2>Вопрос по заказу № {orderId}</h2><p className="order-muted">Опишите вопрос, чтобы поддержка могла помочь.</p><Field {...{Shared,db}} label="Ваш вопрос" value={text} onChange={v=>{setText(v);setError('');}} placeholder="Например, уточните адрес доставки" error={error}/><p className="order-note">Отправка обращения сейчас недоступна.</p><div className="order-actions"><Button {...{Shared,db}} label="К моим покупкам" onClick={()=>navigate('orders')}/><Button {...{Shared,db}} label="Просмотреть обращение" tone="Primary" onClick={()=>text.trim()?setDone(true):setError('Опишите ваш вопрос')}/></div></section>{done&&<Dialog {...{Shared,db}} title="Просмотр обращения" onClose={()=>setDone(false)} footer={<Button {...{Shared,db}} label="К покупкам" tone="Primary" onClick={()=>navigate('orders')}/>}><p>Заказ № {orderId}</p><p>{text}</p><p>Обращение не отправлено.</p></Dialog>}</div>;
}
