import React,{useEffect,useMemo,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import CatalogToolbar from '../../CatalogToolbar.jsx';
import ActionDropdown from '../../ds/ActionDropdown.jsx';
import DataTable from '../../ds/DataTable.jsx';
import {products,AssetImage} from '../../Storefront.jsx';
import {formatCents as euro,formatValue as number} from '../../numberFormat.js';
import Button from './CabinetButton.jsx';
import Dialog from './CabinetDialog.jsx';
import {ProfileField as Field,ProfileSelect as Select} from './Profile.jsx';
import EmptyIllustration from './EmptyIllustration.jsx';
import FinanceInfo from './FinanceInfo.jsx';
import logo from '../../assets/virena-logo.svg';
import {ordersFor,orderTotals,periodOrders,filterOrders,summarizeOrders,orderDate,ORDER_AS_OF} from './ordersData.js';
import './orders.css';

const periods={all:'За всё время',year:'Текущий год',previous:'Прошлый год',custom:'Свой диапазон'};
const statuses={all:'Все статусы',paid:'Оплаченные',refund:'С возвратом',demo:'Демо-заказы'};
const orderStatus={demo:['Info','Демо · без оплаты'],paid:['Success','Оплачен'],partial:['Warning','Частичный возврат'],returned:['Neutral','Возвращён']};
const keyFor=(map,value)=>Object.keys(map).find(k=>map[k]===value);
const normalize=v=>v.trim().toLocaleLowerCase('ru');
function validDate(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const d=new Date(value+'T12:00:00Z');return Number.isFinite(+d)&&d.toISOString().slice(0,10)===value;}
function ProductArt({item}){const product=products.find(p=>p.id===item.productId);return <span className="order-art">{product?.image?<AssetImage asset={product.image} alt={item.name}/>:<img src={logo} alt="Virena"/>}</span>;}
function OrderBadge({Shared,order}){const [tone,label]=orderStatus[order.status];return <Shared.Status tone={tone} label={label}/>;}
function OrderDetails({order,Shared,db,query,notify,navigate,actionError}){
 const totals=orderTotals(order);
 const copy=async()=>{try{if(actionError)throw Error();await navigator.clipboard.writeText(order.id);notify('Номер скопирован');}catch{notify('Не удалось скопировать номер. Выделите его рядом с кнопкой.');}};
 const download=async()=>{try{if(actionError)throw Error();const response=await fetch(`${import.meta.env.BASE_URL}assets/order-receipts/${order.receiptId}.pdf`);if(!response.ok||!response.headers.get('content-type')?.includes('pdf'))throw Error();const url=URL.createObjectURL(await response.blob()),a=document.createElement('a');a.href=url;a.download=`Virena-заказ-${order.id}-демо.pdf`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('Демонстрационный чек скачан');}catch{notify('Не удалось скачать чек. Попробуйте ещё раз.');}};
 return <section className="order-detail" id={`order-${order.id}`} aria-label={`Состав заказа ${order.id}`}>
 <div className="order-detail-heading"><h3>Состав заказа</h3><span className="order-copy"><span>№ {order.id}</span><Button {...{Shared,db}} icon="copy-linear" label={`Скопировать номер заказа ${order.id}`} size="40" tone="Ghost" onClick={copy}/></span></div>
 <div className="order-products">{order.items.map(item=><div key={item.id} className={'order-product'+(query&&normalize(item.name).includes(normalize(query))?' is-match':'')}>
 <ProductArt item={item}/><div className="order-product-copy"><strong>{item.name}</strong>{item.description&&<p>{item.description}</p>}<div className="order-tags">{item.gift&&<Shared.Status tone="Info" label="Подарок"/>}{item.noStatus&&<Shared.Status tone="Neutral" label="Не учитывается для статуса"/>}{item.returnedAt&&<Shared.Status tone="Neutral" label="Возвращено"/>}</div>{item.returnedAt&&<small>Возврат {orderDate(item.returnedAt).split(',')[0]}</small>}</div>
 <div className="order-line-price"><span>{item.quantity} шт. × {euro(item.unitCents)}</span><strong className={item.returnedAt?'order-returned':''}>{euro(item.quantity*item.unitCents-item.discountCents)}</strong></div>
 <div className="order-line-bv"><span className={item.returnedAt?'order-returned':''}>{order.unknownBV?'Баллы не рассчитаны':item.bv?`${number(item.bv)} баллов`:'Баллы не начисляются'}</span>{item.discountCents>0&&<FinanceInfo {...{Shared,db}} label={`Скидка: ${item.name}`} text="Баллы уменьшены пропорционально скидке"/>}</div>
 </div>)}</div>
 <div className="order-detail-bottom"><div className="order-fulfillment"><section><h3>Оплата</h3>{order.demo&&<p>Деньги не списаны. Выбранный способ: {({external:'внешняя оплата','external-bonus':'внешняя оплата + бонусный счёт',balance:'балансовый счёт'})[order.paymentChoice]}.</p>}<dl>{order.payments.map((payment,i)=><div key={i}><dt>{payment.label}</dt><dd>{euro(payment.amountCents)}</dd></div>)}</dl></section>{order.delivery&&<section><h3>Доставка</h3><p>{order.delivery.recipient}</p><p className="order-muted">{order.delivery.address}</p></section>}</div>
 <section className="order-totals"><h3>Итог заказа</h3><dl><div><dt>Товары</dt><dd>{euro(totals.goodsCents)}</dd></div>{totals.discountCents>0&&<div><dt>Скидка</dt><dd>−{euro(totals.discountCents)}</dd></div>}{order.delivery&&<div><dt>Доставка</dt><dd>{order.unquotedDelivery?'Не рассчитана':euro(order.deliveryCents)}</dd></div>}{(order.demo||order.taxCents>0)&&<div><dt>Налоги</dt><dd>{order.demo?'Требуют уточнения':euro(order.taxCents)}</dd></div>}<div className="order-total"><dt>{order.demo?'Сумма товаров':'Итого оплачено'}</dt><dd>{euro(totals.paidCents)}</dd></div><div><dt>Баллы за заказ</dt><dd>{order.unknownBV?'Не рассчитаны':number(totals.bv)}</dd></div>{totals.refundCents>0&&<div className="order-refund"><dt>Возвращено</dt><dd>−{euro(totals.refundCents)}<small>−{number(totals.refundBV)} баллов</small></dd></div>}</dl><p className="order-note">Баллы начисляются за товары без доставки и налогов</p></section></div>
 <div className="order-actions">{!order.demo&&<Button {...{Shared,db}} label="Скачать чек" tone="White" leadingIconContent={<Shared.Icon name="download-minimalistic-linear"/>} onClick={download}/>}<Button {...{Shared,db}} label="Вопрос по заказу" tone="White" leadingIconContent={<Shared.Icon name="chat-round-linear"/>} onClick={()=>navigate('support','order:'+order.id)}/></div>
 </section>;
}
export default function Orders({Shared,db,scenario='ready',navigate,sessionOrders=[]}){
 const [query,setQuery]=useState(''),[period,setPeriod]=useState('all'),[status,setStatus]=useState('all'),[range,setRange]=useState({from:'2026-01-01',to:ORDER_AS_OF});
 const [selectedOrder,setSelectedOrder]=useState(null),[limit,setLimit]=useState(20),[mobileFilters,setMobileFilters]=useState(false),[recovered,setRecovered]=useState(false),[toast,setToast]=useState('');
 const timer=useRef(null);const notify=message=>{clearTimeout(timer.current);setToast(message);timer.current=setTimeout(()=>setToast(''),4000);};useEffect(()=>()=>clearTimeout(timer.current),[]);
 const orders=useMemo(()=>[...(scenario==='ready'?sessionOrders:[]),...ordersFor(scenario)],[scenario,sessionOrders]);
 const invalidRange=period==='custom'&&(!validDate(range.from)||!validDate(range.to)||range.from>range.to);
 const inPeriod=invalidRange?[]:periodOrders(orders,period,range),filtered=filterOrders(inPeriod,{query,status}),summary=summarizeOrders(filtered);
 const loading=scenario==='loading'&&!recovered,error=scenario==='error'&&!recovered,hasFilters=!!query||period!=='all'||status!=='all';
 useEffect(()=>{setLimit(20);},[query,period,status,range]);
 const reset=()=>{setQuery('');setPeriod('all');setStatus('all');};
 const selection=(map,value,setValue,label)=><Select {...{Shared,db}} label={label} value={map[value]} items={Object.values(map)} onChange={v=>setValue(keyFor(map,v))}/>;
 const filters=<>{selection(periods,period,setPeriod,'Период')}{selection(statuses,status,setStatus,'Статус')}{period==='custom'&&<div className="order-date-range"><Field {...{Shared,db}} label="С даты · ГГГГ-ММ-ДД" value={range.from} onChange={from=>setRange(r=>({...r,from}))}/><Field {...{Shared,db}} label="По дату · ГГГГ-ММ-ДД" value={range.to} onChange={to=>setRange(r=>({...r,to}))}/></div>}{invalidRange&&<p className="profile-error" role="alert">Укажите существующие даты: начало не позже окончания.</p>}</>;
 const columns=[
 {key:'order',label:'Заказ',width:'minmax(0,2.2fr)',render:order=><div className="order-identity"><div className="ds-table-stack"><strong>№ {order.id}</strong><small>{orderDate(order.date)}</small><span className="ds-table-line order-composition" title={order.items.map(i=>i.name).join(', ')}>{order.items[0].name}{order.items.length>1&&` и ещё ${order.items.length-1}`}</span></div><div className="order-thumbnails">{order.items.slice(0,3).map(item=><ProductArt key={item.id} item={item}/>)}{order.items.length>3&&<span className="order-more">+{order.items.length-3}</span>}</div></div>},
 {key:'amount',label:'Сумма',width:'minmax(0,.8fr)',render:order=><strong className={order.status==='returned'?'order-returned':''}>{euro(orderTotals(order).paidCents)}</strong>},
 {key:'points',label:'Баллы',width:'minmax(0,.65fr)',render:order=><span className={order.status==='returned'?'order-returned':''}>{order.unknownBV?'Не рассчитаны':orderTotals(order).bv?number(orderTotals(order).bv):'Без баллов'}</span>},
 {key:'status',label:'Статус',width:'minmax(0,1.25fr)',render:order=><div className="ds-table-stack"><OrderBadge Shared={Shared} order={order}/>{order.partnerLabel&&<small>{order.partnerLabel}</small>}</div>},
 {key:'action',label:'',width:'var(--profile-px-40)',render:order=><span onClick={e=>e.stopPropagation()} className="order-expand"><Shared.Button group={db.components.find(c=>c.name==='Boris / Icon button')} choice={{Tone:'Ghost',Size:'40'}} ariaLabel={`Открыть заказ ${order.id}`} iconContent={<Shared.Icon name="Auth / Icon / Chevron"/>} onClick={()=>setSelectedOrder(order)}/></span>}
 ];
 return <div className="profile genealogy orders">
 <CatalogToolbar {...{Shared,db}} query={query} onQueryChange={setQuery} searchLabel="Номер заказа или продукт" resetActive={hasFilters} onReset={reset} expandSearch actions={<><div className="orders-desktop-filters"><ActionDropdown {...{Shared,db}} triggerTone="White" label="Период" triggerLabel={periods[period]} items={Object.entries(periods).map(([key,label])=>({label,onClick:()=>setPeriod(key)}))}/><ActionDropdown {...{Shared,db}} triggerTone="White" label="Статус" triggerLabel={statuses[status]} items={Object.entries(statuses).map(([key,label])=>({label,onClick:()=>setStatus(key)}))}/></div><span className="orders-mobile-filters"><Button {...{Shared,db}} label="Фильтры" tone="White" leadingIconContent={<Shared.Icon name="Virena / Icon / Filter"/>} onClick={()=>setMobileFilters(true)}/></span></>}/>
 {period==='custom'&&<div className="orders-date-desktop"><div className="order-date-range"><Field {...{Shared,db}} label="С даты · ГГГГ-ММ-ДД" value={range.from} onChange={from=>setRange(r=>({...r,from}))}/><Field {...{Shared,db}} label="По дату · ГГГГ-ММ-ДД" value={range.to} onChange={to=>setRange(r=>({...r,to}))}/></div>{invalidRange&&<p className="profile-error" role="alert">Укажите существующие даты: начало не позже окончания.</p>}</div>}
 <section className="orders-summary" aria-label="Итоги с учётом фильтров"><div><span>Оплаченных заказов</span><strong>{loading||error?'—':number(summary.count)}</strong></div><div><span>Сумма товаров</span><strong>{loading||error?'—':euro(summary.goodsCents)}</strong></div><div><span>Начислено баллов</span><strong>{loading||error?'—':number(summary.bv)}</strong></div></section>
 {error?<section className="orders-empty" role="alert"><h2>Не удалось загрузить покупки</h2><p>Попробуйте ещё раз.</p><Button {...{Shared,db}} label="Повторить" tone="Primary" onClick={()=>setRecovered(true)}/></section>:!loading&&!filtered.length?<section className="orders-empty"><EmptyIllustration kind={!orders.length?'orders':'search'}/><h2>{!orders.length?'У вас пока нет покупок':'Ничего не найдено'}</h2><p>{!orders.length?'Оплаченные заказы появятся здесь.':'Попробуйте изменить период, статус или поисковый запрос.'}</p><Button {...{Shared,db}} label={!orders.length?'Перейти в маркетплейс':'Сбросить фильтры'} tone="Primary" onClick={()=>!orders.length?navigate('shop'):reset()}/></section>:<section className="orders-list" aria-label="Ваши заказы"><DataTable {...{Shared,loading,columns}} layout="purchases" rows={filtered.slice(0,limit)} label="Заказы" onRowClick={order=>setSelectedOrder(order)}/>{!loading&&filtered.length>limit&&<div className="orders-more"><Button {...{Shared,db}} label={`Показать ещё · ${Math.min(20,filtered.length-limit)}`} onClick={()=>setLimit(n=>n+20)}/><span>Показано {limit} из {filtered.length}</span></div>}</section>}
 {selectedOrder&&<Dialog drawer {...{Shared,db}} title={`Заказ № ${selectedOrder.id}`} onClose={()=>{setSelectedOrder(null);setToast('');}} notification={toast}><div className="order-modal-body"><div className="order-modal-meta"><span>{orderDate(selectedOrder.date)}</span><OrderBadge Shared={Shared} order={selectedOrder}/></div><OrderDetails {...{Shared,db,query,notify,navigate}} order={selectedOrder} actionError={scenario==='action-error'}/></div></Dialog>}
 {mobileFilters&&<Dialog {...{Shared,db}} title="Фильтры заказов" onClose={()=>setMobileFilters(false)} footer={<Button {...{Shared,db}} label="Показать заказы" tone="Primary" disabled={invalidRange} onClick={()=>setMobileFilters(false)}/>}><div className="profile orders-filter-dialog">{filters}</div></Dialog>}
 {toast&&!selectedOrder&&createPortal(<div className="auth-toast" role="status">{toast}</div>,document.body)}
 </div>;
}

export function OrderSupport({Shared,db,orderId,navigate}){
 const [text,setText]=useState(''),[error,setError]=useState(''),[done,setDone]=useState(false);
 return <div className="profile genealogy orders"><section className="orders-support"><h2>Вопрос по заказу № {orderId}</h2><p className="order-muted">Опишите вопрос, чтобы поддержка могла помочь.</p><Field {...{Shared,db}} label="Ваш вопрос" value={text} onChange={v=>{setText(v);setError('');}} placeholder="Например, уточните адрес доставки" error={error}/><p className="order-note">Демонстрация обращения. Сообщение не отправляется.</p><div className="order-actions"><Button {...{Shared,db}} label="К моим покупкам" onClick={()=>navigate('orders')}/><Button {...{Shared,db}} label="Создать обращение в демо" tone="Primary" onClick={()=>text.trim()?setDone(true):setError('Опишите ваш вопрос')}/></div></section>{done&&<Dialog {...{Shared,db}} title="Обращение создано в демо" onClose={()=>setDone(false)} footer={<Button {...{Shared,db}} label="К покупкам" tone="Primary" onClick={()=>navigate('orders')}/>}><p>Заказ № {orderId}</p><p>{text}</p><p>Поддержка не получила сообщение. В рабочем кабинете здесь появится номер обращения.</p></Dialog>}</div>;
}
