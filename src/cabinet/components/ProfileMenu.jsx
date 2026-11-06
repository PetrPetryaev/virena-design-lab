import React,{useEffect,useLayoutEffect,useRef} from 'react';
import {newcomerDemo,profileInitials} from './Overview.jsx';
import './profile-menu.css';
const menuIcons=import.meta.glob('../../assets/navigation/*.svg',{eager:true,query:'?raw',import:'default'});
function MenuIcon({name,Shared}){const svg=menuIcons['../../assets/navigation/'+name+'.svg'];return svg?<span className="demo-icon" aria-hidden="true" dangerouslySetInnerHTML={{__html:svg.replaceAll('"black"','"currentColor"')}}/>:<Shared.Icon name={name}/>;}
const items=[['profile','Мой профиль','user-circle-linear'],['security','Безопасность','shield-linear'],['details','Реквизиты','wallet-linear'],['settings','Настройки','settings-linear']];
export default function ProfileMenu({open,Shared,photo,page,navigate,onClose,onLogout,dark,onTheme,onServices}){
 const ref=useRef(null);
 useEffect(()=>{if(open&&document.activeElement?.matches('.cab-avatar:focus-visible'))ref.current?.querySelector('[role=menuitem]')?.focus();},[open]);
 useLayoutEffect(()=>{if(!open)return;
 const el=ref.current.closest('.cab-account-menu'),trigger=el.parentElement.querySelector('.cab-avatar'),avatar=el.querySelector('.account-menu-avatar');
 const fit=()=>{
  const x=trigger.offsetLeft+trigger.offsetWidth/2-avatar.offsetLeft-avatar.offsetWidth/2-el.clientLeft;
  const y=trigger.offsetTop+trigger.offsetHeight/2-avatar.offsetTop-avatar.offsetHeight/2-el.clientTop;
  el.style.left=x+'px';el.style.top=y+'px';
  el.style.transformOrigin=(avatar.offsetLeft+avatar.offsetWidth/2)+'px '+(avatar.offsetTop+avatar.offsetHeight/2)+'px';
  el.style.setProperty('--account-available',Math.max(120,innerHeight-el.parentElement.getBoundingClientRect().top-y-16)+'px');
 };fit();window.addEventListener('resize',fit);return()=>window.removeEventListener('resize',fit);
 },[open]);
 const keyDown=e=>{const buttons=[...ref.current.querySelectorAll('[role=menuitem]')].filter(b=>b.offsetParent!==null),i=buttons.indexOf(document.activeElement);if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();buttons[e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length]?.focus();}if(e.key==='Escape'){e.stopPropagation();onClose();document.querySelector('.cab-avatar')?.focus();}if(e.key==='Tab')onClose();};
 const row=(key,label,icon,action,mobile=false,index=0)=><button key={key} type="button" role="menuitem" tabIndex={open?0:-1} className={'account-menu-row'+(mobile?' account-menu-mobile':'')} aria-current={page===key?'page':undefined} style={{'--account-row':index}} onClick={action}><MenuIcon name={icon} Shared={Shared}/><span>{label}</span></button>;
 return <div className="cab-account-menu" data-open={open} inert={!open?true:undefined} aria-hidden={!open}>
 <div className="account-menu-identity"><div><strong>{newcomerDemo.name}</strong><span>{newcomerDemo.id}</span></div><button type="button" className="account-menu-avatar" aria-label="Закрыть меню профиля" onClick={()=>{onClose();document.querySelector('.cab-avatar')?.focus();}}>{photo?<img src={photo} alt=""/>:<span>{profileInitials}</span>}</button></div>
 <div ref={ref} id="cab-account-actions" role="menu" aria-label="Меню аккаунта" onKeyDown={keyDown}>
 <div className="account-menu-group" role="group" aria-label="Аккаунт">{items.map(([key,label,icon],i)=>row(key,label,icon,()=>navigate(key),false,i))}
 {row('theme',dark?'Светлая тема':'Тёмная тема',dark?'sun-linear':'moon-linear',onTheme,true,4)}
 {row('cart','Корзина','bag-2-linear',()=>navigate('cart'),true,5)}
 {row('services','Сервисы','widget-linear',onServices,true,6)}</div>
 <div className="account-menu-group account-menu-footer" role="group" aria-label="Помощь и выход">{row('support','Поддержка','chat-round-dots-linear',()=>navigate('support'),false,4)}{row('logout','Выйти','logout-2-linear',onLogout,false,5)}</div>
 </div></div>;
}
