import React,{useState} from 'react';
import {validatePhoneNumber} from '../../phone-utils.js';

// Same searchable demo geography as auth. Production supplies the full directory.
const cities={'Россия':['Москва','Санкт-Петербург'],'Казахстан':['Астана','Алматы'],'Германия':['Берлин','Мюнхен'],'США':['Нью-Йорк','Чикаго']};
export default function GenealogyRegistration({Shared,db,owner,side,slots,extraAllowed,registered,onComplete,fail,collision,Button}){
 const [kind,setKind]=useState('Новый участник');
 const [v,setV]=useState({language:'Русский',country:'Россия',city:'',first:'',last:'',email:'',login:'',phone:'',messenger:'Не указан',messengerPhone:'',consent:false,slot:slots.includes('L')?'Слева':'Справа'});
 const [availableSlots,setAvailableSlots]=useState(slots),[collisionSeen,setCollisionSeen]=useState(false);
 const [errors,setErrors]=useState({}),[requestError,setRequestError]=useState('');
 const extra=kind==='Моя дополнительная ячейка';
 const group=name=>db.components.find(c=>c.name===name);
 const update=(key,value)=>{setV(p=>({...p,[key]:value,...(key==='country'?{city:'',phone:''}:{})}));setErrors(p=>({...p,[key]:''}));setRequestError('');};
 const loginError=value=>!value?'Укажите логин':!/^[a-z0-9]{4,20}$/.test(value)?'От 4 до 20 строчных латинских букв и цифр':registered.some(p=>p.login===value)||value===owner.login?'Логин занят':'';
 const emailError=value=>!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)?'Укажите корректный email':value.toLowerCase()===`${owner.login}@example.com`?'Для своего email выберите дополнительную ячейку':registered.some(p=>p.email?.toLowerCase()===value.toLowerCase())?'Email занят':'';
 const field=(key,label,type='Text')=><div className="tree-form-field"><label>{label}</label><Shared.Field group={group(type==='Phone'?'Auth / Phone':'Auth / Input')} embedded label={label} type={type} value={v[key]} onChange={value=>update(key,value)} validateOnBlur={false} error={errors[key]||(key==='login'&&v.login?loginError(v.login):key==='email'&&v.email?emailError(v.email):'')} {...(type==='Phone'?{countryCode:v.country,onCountryChange:value=>update('country',value)}:{})}/>{key==='login'&&v.login&&!loginError(v.login)&&<small className="tree-success">Логин свободен</small>}</div>;
 const select=(key,label,items)=><div className="tree-form-field"><label>{label}</label><Shared.Select searchable={key==='country'||key==='city'?true:undefined} group={group('Auth / Select')} embedded label={label} placeholder="Выберите" items={items} value={v[key]} onChange={value=>update(key,value)} error={errors[key]}/></div>;
 const submit=()=>{
  const next={login:loginError(v.login)};
  if(extra){if(!availableSlots.includes(v.slot==='Слева'?'L':'R'))next.slot='Позиция уже занята';}
  else {
   for(const key of ['first','last'])if(!/^[\p{Script=Latin}\p{Script=Cyrillic}][\p{Script=Latin}\p{Script=Cyrillic} '\-]{1,49}$/u.test(v[key].trim()))next[key]='От 2 до 50 букв';
   next.email=emailError(v.email);
   if(!validatePhoneNumber(v.phone,v.country))next.phone='Проверьте номер телефона';
   if(v.messenger!=='Не указан'&&v.messengerPhone&&!validatePhoneNumber(v.messengerPhone,v.country))next.messengerPhone='Проверьте номер';
   if(!v.city)next.city='Выберите город';
   if(!v.consent)next.consent='Нужно согласие участника';
  }
  setErrors(next);
  if(Object.values(next).some(Boolean)){requestAnimationFrame(()=>document.querySelector('.tree-dialog [aria-invalid="true"]')?.focus());return;}
  if(collision&&extra&&!collisionSeen){const remaining=availableSlots.filter(s=>s!==(v.slot==='Слева'?'L':'R'));setAvailableSlots(remaining);setCollisionSeen(true);setV(p=>({...p,slot:remaining[0]==='L'?'Слева':'Справа'}));setRequestError('Эту позицию уже заняли. Выбрана оставшаяся свободная сторона – проверьте и подтвердите.');return;}
  if(fail){setRequestError('Не удалось зарегистрировать. Данные сохранены в форме, попробуйте ещё раз.');return;}
  onComplete({login:v.login,email:extra?`${owner.login}@example.com`:v.email,extra,slot:v.slot});
 };
 return <form className="tree-registration" onSubmit={e=>{e.preventDefault();submit();}}>
  <p>Спонсор: <strong>{owner.login}</strong>. {extra?'Дополнительная ячейка появится непосредственно под вашей.':`Участник встанет в крайнюю ${side==='L'?'левую':'правую'} позицию при первой оплате.`}</p>
  {extraAllowed&&<div className="tree-form-field"><label>Тип регистрации</label><Shared.Select group={group('Auth / Select')} embedded label="Тип регистрации" items={['Новый участник','Моя дополнительная ячейка']} value={kind} onChange={value=>{setKind(value);setErrors({});setRequestError('');}}/></div>}
  {extra?<><p>Личные данные и контакты возьмём из основной ячейки. Переключатель размещения на эту ячейку не влияет.</p>{select('slot','Позиция',availableSlots.map(s=>s==='L'?'Слева':'Справа'))}</>:<>{select('language','Язык общения',['Русский','English','Deutsch'])}<div className="tree-form-grid">{field('first','Имя')}{field('last','Фамилия')}</div>{field('email','Email','Email')}</>}
  {field('login','Логин')}
  {!extra&&<><div className="tree-form-grid">{select('country','Страна',Object.keys(cities))}{select('city','Город',cities[v.country]||[])}</div>{field('phone','Телефон','Phone')}{select('messenger','Мессенджер',['Не указан','Telegram','WhatsApp','Viber'])}{v.messenger!=='Не указан'&&<>{field('messengerPhone','Номер в мессенджере','Phone')}<small>Если оставить пустым, используем телефон участника.</small></>}<div className="auth-check"><Shared.Toggle group={group('Boris / Checkbox')} value={v.consent} ariaLabel="Участник согласен на передачу данных" onChange={value=>update('consent',value)}/><span onClick={()=>update('consent',!v.consent)}>Участник согласен, чтобы я передал его данные для регистрации</span></div>{errors.consent&&<p className="tree-error" role="alert">{errors.consent}</p>}<p>Пароли участник задаст сам по ссылке из письма. Соглашения примет при первом входе.</p></>}
  {requestError&&<p className="tree-error" role="alert">{requestError}</p>}
  <Button label="Зарегистрировать" tone="Primary" onClick={submit}/>
 </form>;
}
