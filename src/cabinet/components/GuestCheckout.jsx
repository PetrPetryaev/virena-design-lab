import React,{useRef,useState} from 'react';
import Button from './CabinetButton.jsx';
import {ProfileField as Field} from './Profile.jsx';

export default function GuestCheckout({Shared,db,scenario,onSignIn,onVerified}){
 const [tab,setTab]=useState('login'),[values,setValues]=useState({}),[errors,setErrors]=useState({}),[codeStep,setCodeStep]=useState(false);
 const ui={Shared,db},body=useRef(null);
 const focusInvalid=()=>requestAnimationFrame(()=>body.current?.querySelector('[aria-invalid="true"]')?.focus());
 const field=(key,label,type='Text')=><Field {...ui} label={label} type={type} value={values[key]} error={errors[key]} onChange={value=>{setValues(v=>({...v,[key]:value}));setErrors(e=>({...e,[key]:''}));}}/>;
 const register=()=>{
  const found={};
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email||''))found.email='Введите корректный email';
  if((values.password||'').length<8||!/[a-zа-яё]/i.test(values.password)||!/\d/.test(values.password))found.password='Укажите не менее 8 символов, включая букву и цифру';
  if((values.phone||'').replace(/\D/g,'').length<10)found.phone='Введите номер телефона';
  const [day,month,year]=(values.birthDate||'').split('.').map(Number);
  const birth=new Date(year,month-1,day);
  if(!/^\d{2}\.\d{2}\.\d{4}$/.test(values.birthDate||'')||birth.getFullYear()!==year||birth.getMonth()!==month-1||birth.getDate()!==day||birth>=new Date())found.birthDate='Укажите прошедшую дату в формате ДД.ММ.ГГГГ';
  if(values.sponsor?.trim()&&values.sponsor.trim()!=='VR-100024')found.sponsor='Не удалось подтвердить ID спонсора. Проверьте его или очистите поле.';
  if(Object.keys(found).length){setErrors(found);focusInvalid();return;}
  if(scenario==='guest-email'){setTab('login');setErrors({submit:'Этот email уже зарегистрирован.'});return;}
  if(scenario==='guest-deleted'){setErrors({submit:'Аккаунт удалён. Восстановить его можно через поддержку в течение 12 месяцев.'});return;}
  if(scenario!=='guest-code'){setErrors({submit:'Не удалось продолжить регистрацию. Попробуйте позже.'});return;}
  setValues(v=>({...v,password:''}));setErrors({});setCodeStep(true);
 };
 return <div className="cart-auth-options" ref={body}>
 <div className="cart-auth-tabs" role="group" aria-label="Вход или регистрация"><Button {...ui} label="Войти" pressed={tab==='login'} tone={tab==='login'?'Primary':'Soft'} onClick={()=>{setTab('login');setErrors({});}}/><Button {...ui} label="Я здесь впервые" pressed={tab==='register'} tone={tab==='register'?'Primary':'Soft'} onClick={()=>{setTab('register');setErrors({});}}/></div>
 {errors.submit&&<p className="profile-error" role="alert">{errors.submit}</p>}
 {tab==='login'?<><p>Войдите в свой аккаунт. Товары останутся в корзине.</p><Button {...ui} label="Перейти ко входу" tone="Primary" onClick={onSignIn}/></>:codeStep?<><p>Подтвердите номер {values.phone}.</p>{field('code','Код из SMS')}<Button {...ui} label="Подтвердить телефон" tone="Primary" onClick={()=>{if(values.code==='123456')onVerified({email:values.email,phone:values.phone});else{setErrors({code:'Проверьте код и попробуйте ещё раз.'});focusInvalid();}}}/><Button {...ui} label="Изменить номер" onClick={()=>{setCodeStep(false);setErrors({});}}/></>:<>
 {field('email','Email','Email')}{field('password','Пароль','Password')}{field('phone','Телефон','Phone')}{field('birthDate','Дата рождения')}{!new URLSearchParams(location.search).has('ref')&&field('sponsor','ID спонсора · необязательно')}
 {scenario==='guest-code'?<div className="cart-auth-consent"><Shared.Toggle group={db.components.find(c=>c.name==='Boris / Checkbox')} value={!!values.consent} ariaLabel="Согласие с условиями регистрации" onChange={consent=>setValues(v=>({...v,consent}))}/><span>Согласие с условиями регистрации</span></div>:<p className="checkout-caption">Условия регистрации пока недоступны.</p>}
 <Button {...ui} label="Получить код" tone="Primary" disabled={scenario==='guest-code'&&!values.consent} onClick={register}/></>}
 </div>;
}
