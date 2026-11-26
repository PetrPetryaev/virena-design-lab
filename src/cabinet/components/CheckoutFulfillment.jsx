import React,{useEffect,useId,useRef,useState} from 'react';
import {SegmentedTabs} from '../../AuthPrimitives.jsx';
import DateCalendar from '../../DateCalendar.jsx';
import Button from './CabinetButton.jsx';
import CabinetDialog from './CabinetDialog.jsx';
import {ProfileField as Field,ProfileSelect as Select} from './Profile.jsx';
import {profileCountries} from './profileData.js';
import {useAddressSuggestions} from './checkoutAddress.js';
import {deliveryAddress,deliveryDateLabel,deliveryDates,exampleDeliveryRates,deliverySlotsForDate,exampleShowrooms,fixtureCourierCents} from './commerceData.js';
import {formatCents} from '../../numberFormat.js';
import './checkout-fulfillment.css';

const tabs=[{value:'delivery',label:'Доставка на адрес'},{value:'showroom',label:'Забрать в шоу-руме'}];
const addressKeys=['country','city','address','postal'];
const addressFields=address=>Object.fromEntries(addressKeys.map(key=>[key,address[key]]));
const splitAddress=value=>(value||'').split(/,\s*кв(?:артира)?\.?\s*/i,2);
const addressText=(street,apartment)=>apartment?`${street}, кв. ${apartment}`:street;
const normalizeSearch=value=>value.trim().toLocaleLowerCase('ru-RU').replace(/[^а-яёa-z0-9]+/g,' ');

function manualAddress(value,draft){
 const parts=value.split(',').map(part=>part.trim());
 if(parts.length>1&&normalizeSearch(parts[0])===normalizeSearch(draft.city||''))parts.shift();
 return {country:draft.country,city:draft.city,address:parts.join(', '),postal:''};
}

function RadioOptions({title,name,items,value,onChange,error,empty,children,className=''}) {
 const errorId=useId();
 return <fieldset className={'checkout-options '+className} aria-describedby={error?errorId:empty?errorId+'empty':undefined}>
  <legend>{title}</legend>
  {(items.length>0||children)&&<div className="checkout-option-list">
   {items.map(item=><label className="checkout-option checkout-choice" key={item.value}>
    <input type="radio" name={name+'-'+errorId} value={item.value} checked={value===item.value} aria-invalid={error?true:undefined} onChange={()=>onChange(item.value)}/>
    <span>{item.label}{item.address&&<small className="checkout-showroom-address">{item.address}</small>}</span>{item.detail&&<small>{item.detail}</small>}
   </label>)}
   {children}
  </div>}
  {empty&&!error&&<p className="checkout-options-empty" id={errorId+'empty'} role="status">{empty}</p>}
  {error&&<p className="profile-error" id={errorId} role="alert">{error}</p>}
 </fieldset>;
}

function FulfillmentRegion({label,regionRef,pending,className='',children,...props}){
 return <div {...props} ref={regionRef} aria-busy={!!pending} className={'checkout-loading-region '+className}
  style={pending?{blockSize:pending.height}:undefined}>
  <div className="checkout-loading-content" inert={!!pending} aria-hidden={pending?true:undefined}>{children}</div>
  {pending&&<div className="checkout-inline-skeleton cart-loading" role="status" aria-label={label}>
   <i aria-hidden="true"/><i aria-hidden="true"/>{className==='checkout-fulfillment-region'&&<i aria-hidden="true"/>}
  </div>}
 </div>;
}

export function DeliverySchedule({draft,update,errors,slotRegion,pending,onDateChange,showPrice=false}) {
 const now=new Date(),dates=deliveryDates(now);
 const selectedDate=pending?.value||draft.deliveryDate;
 const quick=dates.slice(0,2);
 const calendarChoice=dates.slice(2).find(day=>day.key===selectedDate);
 const calendarLabel=calendarChoice?deliveryDateLabel(calendarChoice.key):'Другая дата';
 const times=deliverySlotsForDate(draft.deliveryDate,now);
 const chooseDay=value=>{
  const commit=()=>{
   update('deliveryDate',value);
   update('deliverySlot',deliverySlotsForDate(value,now).includes(draft.deliverySlot)?draft.deliverySlot:'');
  };
  if(onDateChange)onDateChange(value,commit);
  else commit();
 };
 const options=quick.map(day=>{
  const [weekday,label]=deliveryDateLabel(day.key).split(', ');
  return {value:day.key,label:label||weekday,detail:label?weekday:undefined};
 });
 return <section className="checkout-schedule">
  <RadioOptions className="checkout-date-options" title="Дата доставки" name="checkout-date" value={selectedDate} items={options} onChange={chooseDay} error={errors.deliveryDate}>
   <div className="checkout-calendar-choice" data-selected={!!calendarChoice}>
    <DateCalendar value={selectedDate?.split('-').reverse().join('.')} allowedDates={dates.map(day=>day.date)}
     triggerLabel={calendarLabel} onChange={value=>chooseDay(value.split('.').reverse().join('-'))}/>
   </div>
  </RadioOptions>
  <FulfillmentRegion className="checkout-times-region" label="Загружаем время доставки" regionRef={slotRegion} pending={pending}>
   <RadioOptions className="checkout-slot-options" title="Время доставки" name="checkout-slot" value={draft.deliverySlot}
    items={times.map(value=>({value,label:value,detail:showPrice?formatCents(fixtureCourierCents):undefined}))} onChange={value=>update('deliverySlot',value)}
    error={times.length?errors.deliverySlot:undefined}
    empty={times.length?undefined:draft.deliveryDate?'На эту дату нет интервалов. Выберите другую дату.':'Сначала выберите дату доставки.'}/>
  </FulfillmentRegion>
 </section>;
}

function AddressEditor({ui,draft,onSave,onClose}){
 const [street,apartment='']=splitAddress(draft.address);
 const [value,setValue]=useState([draft.city,street].filter(Boolean).join(', '));
 const [parts,setParts]=useState({apartment,...draft.addressDetails});
 const privateHouse=!!parts.privateHouse;
 const [selected,setSelected]=useState(null);
 const [showSuggestions,setShowSuggestions]=useState(false),[error,setError]=useState('');
 const editor=useRef(null);
 const {suggestions,status}=useAddressSuggestions(value,draft.city,draft.country,showSuggestions);
 useEffect(()=>{editor.current?.querySelector('input')?.focus({preventScroll:true});},[]);
 const updatePart=(key,value)=>setParts(current=>({...current,[key]:value}));
 const chooseAddress=item=>{
  const previous=selected||{city:draft.city,address:street};
  if(previous.city!==item.city||previous.address!==item.address)setParts(current=>({privateHouse:current.privateHouse}));
  setSelected(item);
  setValue(`${item.city}, ${item.address}`);
  setShowSuggestions(false);
  setError('');
  editor.current?.querySelector('input')?.focus({preventScroll:true});
 };
 const save=()=>{
  const sameAddress=normalizeSearch(value)===normalizeSearch([draft.city,street].filter(Boolean).join(', '));
  const address=selected?addressFields(selected):sameAddress&&draft.country&&draft.city?{...addressFields(draft),address:street}:manualAddress(value,draft);
  if(!value.trim()||!address.address?.trim()){
   setError('Укажите улицу и дом');
   editor.current?.querySelector('input')?.focus();
   return;
  }
  const {apartment='',entrance='',floor='',comment=''}=parts;
  onSave({...address,regionEdited:true,address:addressText(address.address,privateHouse?'':apartment.trim()),addressDetails:{
   entrance:privateHouse?'':entrance.trim(),floor:privateHouse?'':floor.trim(),comment:comment.trim(),...(privateHouse?{privateHouse:true}:{}),
  }});
 };
 return <section className="checkout-address-inline" ref={editor} aria-label="Редактирование адреса">
  <div className="checkout-address-editor">
   <div className="checkout-editor-address">
    <div className="checkout-address-search"
     onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))setShowSuggestions(false);}}
     onKeyDown={event=>{
      if(event.key==='Escape'&&suggestions.length){
       event.preventDefault();event.stopPropagation();event.currentTarget.querySelector('input')?.focus();setShowSuggestions(false);return;
      }
      if(!['ArrowDown','ArrowUp'].includes(event.key)||!suggestions.length)return;
      event.preventDefault();
      const options=[...event.currentTarget.querySelectorAll('.checkout-address-suggestions button')];
      const index=options.indexOf(event.target);
      const next=index<0?(event.key==='ArrowDown'?0:options.length-1):(index+(event.key==='ArrowDown'?1:options.length-1))%options.length;
      options[next]?.focus();
     }}>
     <Field {...ui} label="Адрес" value={value} error={error} placeholder="Улица, дом, корпус" onChange={next=>{
      setValue(next);setSelected(null);setShowSuggestions(true);setError('');
     }}/>
     {suggestions.length>0&&<div className="checkout-address-suggestions" role="group" aria-label="Подходящие адреса">
      {suggestions.map(item=><button key={item.value} type="button" onClick={()=>chooseAddress(item)}>
       <strong>{item.address}</strong><small>{item.city}</small>
      </button>)}
     </div>}
     {status&&<p className="checkout-address-suggestion-status" role="status">
      {status==='loading'?'Ищем адрес…':status==='unavailable'?'Подсказки недоступны. Введите адрес вручную.':'Адреса не найдены. Введите адрес вручную.'}
     </p>}
    </div>
   </div>
   <div className="checkout-editor-fields">
    <div className="checkout-check checkout-switch checkout-private-house">
     <span onClick={()=>updatePart('privateHouse',!privateHouse)}>Частный дом</span>
     <ui.Shared.Toggle group={ui.db.components.find(component=>component.name==='Boris / Switch')} value={privateHouse}
      ariaLabel="Частный дом" onChange={value=>updatePart('privateHouse',value)}/>
    </div>
    {!privateHouse&&<div className="checkout-address-unit">
     <Field {...ui} label="Квартира" value={parts.apartment} onChange={value=>updatePart('apartment',value)}/>
     <Field {...ui} label="Подъезд" value={parts.entrance} onChange={value=>updatePart('entrance',value)}/>
     <Field {...ui} label="Этаж" value={parts.floor} onChange={value=>updatePart('floor',value)}/>
    </div>}
    <label className="profile-request-comment checkout-courier-comment">
     <span>Комментарий курьеру</span>
     <textarea value={parts.comment||''} rows={3} placeholder="Например, как найти вход" onChange={event=>updatePart('comment',event.target.value)}/>
    </label>
   </div>
  </div>
  <div className="checkout-address-actions">
   <Button {...ui} label="Сохранить адрес" tone="Primary" onClick={save}/>
   <Button {...ui} label="Отменить изменения" size="40" onClick={onClose}/>
  </div>
 </section>;
}

const pickupFilters=[{value:'all',label:'Все'},{value:'today',label:'Сегодня'},{value:'tomorrow',label:'Завтра'}];
const showroomMetadata={
 'Москва · ул. Садовая, 5':{label:'Шоу-рум на Садовой',ready:'tomorrow'},
 'Москва · просп. Мира, 48':{label:'Шоу-рум на проспекте Мира',ready:'today'},
};
const showroomFixtures=exampleShowrooms.map(value=>{
 const [city,address]=value.split(' · ');
 return {value,city,address,...showroomMetadata[value]};
});
const matchesShowroom=(item,filter)=>filter==='all'||filter===item.ready;
const citiesByCountry={
 Россия:['Москва','Екатеринбург'],
 Казахстан:['Алматы','Астана'],
 Германия:['Берлин'],США:['Нью-Йорк'],Армения:['Ереван'],Грузия:['Тбилиси'],
};

export function CheckoutRegion({Shared,db,draft,onApply,disabled=false}){
 const [region,setRegion]=useState(null);
 const cities=region?[...new Set([...(citiesByCountry[region.country]||[]),region.city].filter(Boolean))]:[];
 const ui={Shared,db};
 const close=()=>setRegion(null);
 return <>
  <button type="button" className="checkout-city-trigger profile-text-link" disabled={disabled} aria-haspopup="dialog"
   aria-label={draft.city?'Изменить город получения: '+draft.city:'Выбрать город получения'}
   onClick={()=>setRegion({country:draft.country||'',city:draft.city||''})}>{draft.city||'Выбрать город'}</button>
  {region&&<CabinetDialog {...ui} title="Город получения" onClose={close} className="genealogy checkout-region-dialog"
   footer={<><Button {...ui} label="Отмена" onClick={close}/><Button {...ui} label="Применить" tone="Primary"
    disabled={!region.country||!region.city.trim()} onClick={()=>{onApply(region.country,region.city.trim());close();}}/></>}>
   <div className="checkout-region-fields">
    <Select {...ui} label="Страна" value={region.country} items={profileCountries} autoSelectSingle={false}
     onChange={country=>setRegion({country,city:''})}/>
    {region.country&&(citiesByCountry[region.country]
     ?<Select {...ui} label="Город" value={region.city} items={cities} autoSelectSingle={false} onChange={city=>setRegion(v=>({...v,city}))}/>
     :<Field {...ui} label="Город" value={region.city} onChange={city=>setRegion(v=>({...v,city}))}/>)}
   </div>
  </CabinetDialog>}
 </>;
}

export function changeCheckoutRegion(draft,country,city){
 if(country===draft.country&&city===draft.city)return draft;
 return {...draft,country,city,address:'',postal:'',addressMode:'profile',addressSnapshot:null,
  addressDetails:null,showroom:'',deliveryDate:'',deliverySlot:'',regionEdited:true};
}

function ShowroomOptions({draft,update,error}) {
 const [filter,setFilter]=useState('all');
 useEffect(()=>setFilter('all'),[draft.country,draft.city]);
 const {country,city}=draft;
 const inCity=country==='Россия'?showroomFixtures.filter(item=>item.city===city):[];
 const options=inCity.filter(item=>matchesShowroom(item,filter));
 const selected=options.find(item=>item.value===draft.showroom);
 const choose=value=>update('showroom',value);
 const changeFilter=value=>{setFilter(value);if(selected&&!matchesShowroom(selected,value))choose('');};
 const readiness=item=>pickupFilters.find(option=>option.value===item.ready)?.label||(item.ready==='later'?'Позже':undefined);
 return <div className="checkout-showrooms">
  {inCity.length?<>
   <RadioOptions title="Когда забрать" name="checkout-pickup-filter" items={pickupFilters} value={filter}
    className="checkout-pickup-filter" onChange={changeFilter}/>
   {options.length?<RadioOptions className="checkout-showroom-options" title="Шоу-рум"
    name="checkout-showroom" value={selected?.value} items={options.map(item=>({...item,detail:readiness(item)}))} onChange={choose} error={error}/>
    :<p className="checkout-options-empty" role="status">Нет шоу-румов по этим условиям. Измените фильтр.</p>}
  </>:<p className="checkout-options-empty" role="status">{draft.city?'В этом городе нет шоу-румов.':'Выберите город, чтобы увидеть шоу-румы.'}</p>}
  {error&&!options.length&&<p className="profile-error" role="alert">{error}</p>}
 </div>;
}

export function FulfillmentDetails({details}){
 return <span className="checkout-fulfillment-details"><strong>{details.method}</strong><span className="checkout-fulfillment-value">{details.address}</span>{details.schedule&&<span>{details.schedule}</span>}{details.name&&<span>{details.name}{details.phone&&' · '+details.phone}</span>}</span>;
}

export default function CheckoutFulfillment({Shared,db,draft,setDraft,update,errors,setErrors,available,hideRegion,showPrice,onLoadingChange}){
 const id=useId(),ui={Shared,db};
 const [retried,setRetried]=useState(false),[pending,setPending]=useState(null);
 const timer=useRef(null),panelRegion=useRef(null),slotRegion=useRef(null);
 useEffect(()=>()=>{clearTimeout(timer.current);if(timer.current!==null)onLoadingChange?.(false);},[onLoadingChange]);
 const pickup=draft.fulfillment==='showroom';
 const [,estimate]=exampleDeliveryRates[0].split(' · ');
 const selectedMethod=pending?.scope==='method'?pending.value:pickup?'showroom':'delivery';
 const runSelection=(scope,value,commit,region)=>{
  if(!onLoadingChange){commit();return;}
  clearTimeout(timer.current);
  const height=region.current?.getBoundingClientRect().height;
  setPending({scope,value,height});
  onLoadingChange(true);
  // shortcut: simulate the loading transition until warehouse availability is connected.
  timer.current=setTimeout(()=>{
   timer.current=null;
   commit();
   setPending(null);
   onLoadingChange(false);
  },500);
 };
 const selectMethod=value=>{
  if(value===selectedMethod)return;
  runSelection('method',value,()=>{
   setRetried(false);
   setErrors({});
   update('fulfillment',value);
  },panelRegion);
 };
 const editAddress=()=>{
  setDraft(d=>({...d,addressMode:'edit',addressSnapshot:addressFields(d)}));
 };
 const finishAddress=values=>{
  const changed=values&&addressKeys.some(key=>values[key]!==draft[key]);
  const restoreFocus=()=>requestAnimationFrame(()=>document.getElementById(id+'address')?.querySelector('.checkout-address-overview button')?.focus());
  setDraft(d=>({...d,...values,addressMode:'profile',addressSnapshot:null,
   ...(changed?{deliveryDate:'',deliverySlot:''}:{}),
   ...(values&&(values.country!==d.country||values.city!==d.city)?{showroom:''}:{}),
  }));
  if(changed)runSelection('region',values.city,restoreFocus,panelRegion);
  else restoreFocus();
  setErrors(previous=>({...previous,country:'',city:'',address:'',postal:'',addressMode:''}));
 };
 return <div className="checkout-recipient checkout-fulfillment">
  {!hideRegion&&<CheckoutRegion {...ui} draft={draft} onApply={(country,city)=>{
   setDraft(d=>changeCheckoutRegion(d,country,city));
   setErrors({});
  }}/>}
  <SegmentedTabs className="checkout-choice-tabs" items={tabs} value={selectedMethod} label="Как вы хотите получить заказ?" idPrefix={id} panelId={id+'panel'} onChange={selectMethod}/>
  <FulfillmentRegion className="checkout-fulfillment-region" label="Загружаем способы получения" regionRef={panelRegion}
   pending={pending?.scope==='date'?null:pending} role="tabpanel" id={id+'panel'} aria-labelledby={id+selectedMethod}>
   <section className="checkout-address-card" aria-label="Адрес доставки" id={id+'address'} hidden={pickup}>
    <div className="checkout-address-heading checkout-address-overview">
     <h3>Адрес доставки</h3>
     {draft.addressMode!=='edit'&&<Shared.Button group={db.components.find(component=>component.name==='Boris / Button')}
      choice={{Tone:'Soft',Size:'40'}} label={draft.address?'Изменить':'Указать адрес'}
      ariaLabel={draft.address?'Изменить адрес':'Указать адрес'} onClick={editAddress}/>}
    </div>
    {draft.addressMode==='edit'?<AddressEditor {...{ui,draft}} onSave={finishAddress} onClose={()=>finishAddress(null)}/>:
     draft.address&&<div className="checkout-address"><p>{deliveryAddress(draft)}</p></div>}
   </section>
   {available?(pickup?<ShowroomOptions draft={draft} update={update} error={errors.showroom}/>:draft.address&&draft.addressMode!=='edit'?<>
    <div className="checkout-courier">
     <div className="checkout-courier-info"><strong>Доставка курьером</strong><span>{estimate}</span></div>
     {errors.deliveryRate&&<p className="profile-error" role="alert">{errors.deliveryRate}</p>}
    </div>
    <DeliverySchedule {...{draft,update,errors,slotRegion}} showPrice={showPrice} pending={pending?.scope==='date'?pending:null}
     onDateChange={(value,commit)=>runSelection('date',value,commit,slotRegion)}/>
   </>:null):<div className="checkout-delivery-note">
    <p className="checkout-caption" role={retried?'alert':'status'} key={retried?'retry':'initial'}>{pickup?'Не удалось загрузить шоу-румы.':'Не удалось загрузить варианты доставки.'}{retried&&' Попробуйте позже.'}</p>
    <Button {...ui} label="Повторить" size="40" onClick={()=>setRetried(true)}/>
   </div>}
   {available&&<CheckoutPhysicalReceiver {...ui} {...{draft,update,errors}}/>}
  </FulfillmentRegion>
 </div>;
}

export function CheckoutPhysicalReceiver({Shared,db,draft,update,errors}){
 const ui={Shared,db},prefix=draft.fulfillment==='showroom'?'pickup':'delivery';
 const other=!!draft[prefix+'Other'];
 return <section className="checkout-physical-recipient" aria-label="Получатель заказа">
  {!draft.forOther&&<div className="checkout-check checkout-switch checkout-switch-panel" onClick={event=>{if(!event.target.closest('button'))update(prefix+'Other',!other);}}>
   <div className="checkout-switch-copy"><span>Получит другой человек</span></div>
   <Shared.Toggle group={db.components.find(component=>component.name==='Boris / Switch')} value={other} ariaLabel="Получит другой человек" onChange={value=>update(prefix+'Other',value)}/>
  </div>}
  {(draft.forOther||other)&&<div className="checkout-fields">
   <Field {...ui} label="Имя и фамилия получателя" value={draft[prefix+'Name']} onChange={value=>update(prefix+'Name',value)} error={errors[prefix+'Name']}/>
   <Field {...ui} type="Phone" label="Телефон получателя" value={draft[prefix+'Phone']} onChange={value=>update(prefix+'Phone',value)} error={errors[prefix+'Phone']}/>
  </div>}
 </section>;
}
