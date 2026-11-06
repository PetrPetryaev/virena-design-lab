import React,{useEffect,useRef} from 'react';
const menuIcons=import.meta.glob('../../assets/navigation/*.svg',{eager:true,query:'?raw',import:'default'});
function MenuIcon({name,Shared}){const svg=menuIcons['../../assets/navigation/'+name+'.svg'];return svg?<span className="demo-icon" aria-hidden="true" dangerouslySetInnerHTML={{__html:svg.replaceAll('"black"','"currentColor"')}}/>:<Shared.Icon name={name}/>;}
const items=[['profile','Мой профиль','user-circle-linear'],['security','Безопасность','shield-linear'],['details','Реквизиты','wallet-linear'],['settings','Настройки','settings-linear']];
export default function ProfileMenu({open,Shared,photo,page,navigate,onClose,onLogout,dark,onTheme,onServices}){
 const ref=useRef(null);
 useEffect(()=>{if(open&&document.activeElement?.matches('.cab-avatar:focus-visible'))ref.current?.querySelector('[role=menuitem]')?.focus();},[open]);
 const keyDown=e=>{const buttons=[...ref.current.querySelectorAll('[role=menuitem]')].filter(b=>b.offsetParent!==null),i=buttons.indexOf(document.activeElement);if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();buttons[e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length]?.focus();}if(e.key==='Escape'){e.stopPropagation();onClose();document.querySelector('.cab-avatar')?.focus();}if(e.key==='Tab')onClose();};
 const row=(key,label,icon,action,mobile=false)=><button key={key} type="button" role="menuitem" className={mobile?'cab-mobile-option':undefined} aria-current={page===key?'page':undefined} onClick={action}><MenuIcon name={icon} Shared={Shared}/><span>{label}</span></button>;
 if(!open)return null;
 return <div className="cab-popover cab-profile-menu" ref={ref} id="cab-account-actions" role="menu" aria-label="Меню аккаунта" onKeyDown={keyDown}>
 <strong>Ваш аккаунт</strong>
 {items.map(([key,label,icon])=>row(key,label,icon,()=>navigate(key)))}
 {row('theme',dark?'Светлая тема':'Тёмная тема',dark?'sun-linear':'moon-linear',onTheme,true)}
 {row('cart','Корзина','cart-linear',()=>navigate('cart'),true)}
 {row('services','Сервисы','widget-linear',onServices,true)}
 {row('logout','Выйти','logout-2-linear',onLogout)}
 </div>;
}
