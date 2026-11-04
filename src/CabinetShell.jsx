import Genealogy from './cabinet/components/Genealogy.jsx';
import TreeDirections from './cabinet/components/TreeDirections.jsx';
import {memberStates,normalizeMember} from './cabinet/components/memberStates.js';
import {createPortal} from 'react-dom';
import React,{useState,useEffect,useLayoutEffect,useRef,useCallback} from 'react';
import logo from './assets/virena-logo.svg';
import mark from './assets/virena-mark.svg';
import chevronSource from './assets/navigation/alt-arrow-right-linear.svg?raw';
const compactChevron=chevronSource.replace('<svg ', '<svg aria-hidden="true" ').replace('<path ', '<path vector-effect="non-scaling-stroke" ').replace('stroke="black"','stroke="currentColor"');
import './cabinet.css';
import Storefront,{products} from './Storefront.jsx';
import Profile from './cabinet/components/Profile.jsx';
import Overview,{profilePhoto,profileInitials} from './cabinet/components/Overview.jsx';

const solarAssets=import.meta.glob('./assets/navigation/*.svg',{eager:true,query:'?url',import:'default'});
// Navigation shape follows the approved sidebar; labels follow the current BC map.
const pages={
 overview:['Обзор','Home','Главная кабинета: состояние участника, важные действия и сводка бизнеса.'],
 participants:['Участники','Users','Список участников и подробная информация о структуре.'],
 genealogy:['Бинарное дерево','Branch','Дерево структуры, поиск и размещение новых участников.'],
 invitations:['Личные приглашения','Invite','Приглашённые участники, их этапы и те, кому нужно уделить внимание.'],
 finances:['Финансы','wallet','Начисления, история операций и заявки на вывод.'],
 orders:['Мои покупки','Orders','Ваши заказы, оплата, доставка и документы.'],
 shop:['Каталог','shop','Продукты, активность и оформление покупки.'],
 learning:['Обучение','book','Курсы, уроки и результаты обучения.'],
 news:['Новости','notebook-2','Новости компании и продуктов.'],
 offers:['Акции','tag','Действующие предложения и условия участия.'],
 calendar:['Календарь','calendar','Мероприятия и напоминания.'],
 materials:['Презентация','presentation-graph','Слайды, видео, сертификаты и печатные материалы.'],
 locations:['Шоу-румы и сервисные центры','map-point','Точки на карте, контакты и часы работы.'],
 knowledge:['База знаний','library','Статьи о продуктах и ответы на вопросы.'],
 profile:['Мой профиль','user-circle','Личные данные, контакты и настройки профиля.'],
 security:['Безопасность','shield','Пароль для входа, финансовый пароль и способы входа.'],
 details:['Реквизиты','document','Реквизиты для выплат.'],
 settings:['Настройки','settings','Язык, тема, уведомления и приватность.'],
 notifications:['Уведомления','Invite','Все уведомления и настройка каналов связи.'],
 cart:['Корзина','cart','Товары и активность, оформление заказа.'],
 support:['Поддержка','chat-round-dots','Обращения в службу поддержки.']
};
const profilePages={profile:'personal',security:'security',details:'requisites',settings:'settings'};
const profileTabs=['personal','contacts','security','requisites','successor','settings'];
const readProfileTab=()=>{const q=new URLSearchParams(location.search);return profileTabs.includes(q.get('profileTab'))?q.get('profileTab'):(profilePages[q.get('page')]||'personal');};
function Glyph({name}){
 const paths={menu:'M4 6h16M4 12h16M4 18h16',close:'m6 6 12 12M18 6 6 18',bell:'M6 9a6 6 0 0 1 12 0v5l2 3H4l2-3V9m4 11h4',sun:'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1',moon:'M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z'};
 return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={paths[name]}/>{name==='sun'&&<circle cx="12" cy="12" r="4"/>}</svg>
}
export default function CabinetShell({Shared,db,dark,onTheme,onLogout}){
 const root=useRef(null),drawer=useRef(null),menuButton=useRef(null),pop=useRef(null);
 const [page,setPage]=useState(()=>{const key=new URLSearchParams(location.search).get('page');return pages[key]?key:'overview'});
 const [tip,setTip]=useState(null);
 const [avatarPhoto,setAvatarPhoto]=useState(()=>new URLSearchParams(location.search).get('avatar')==='empty'?'':profilePhoto);
 const [profileTab,setProfileTab]=useState(readProfileTab),[profileScenario,setProfileScenario]=useState('ready');
 const leaveGuard=useRef(null),acceptedUrl=useRef(location.href);
 const registerGuard=useCallback(fn=>{leaveGuard.current=fn;},[]);
 const guarded=action=>leaveGuard.current?leaveGuard.current(action):action();
 const changeProfileTab=useCallback(value=>{setProfileTab(value);const url=new URL(location.href);url.searchParams.set('profileTab',value);history.pushState({},'',url);acceptedUrl.current=url.href;},[]);
 useEffect(()=>{const listener=e=>{if(leaveGuard.current){e.preventDefault();leaveGuard.current(e.detail);}};window.addEventListener('virena:leave-cabinet',listener);return()=>window.removeEventListener('virena:leave-cabinet',listener);},[]);
 const [catalogCount,setCatalogCount]=useState(products.length);
 const [overviewScenario,setOverviewScenario]=useState('ready');
 const [member,setMember]=useState(()=>normalizeMember(new URLSearchParams(location.search).get('member')));
 const changeMember=value=>{setMember(value);const url=new URL(location.href);url.searchParams.set('member',value);history.replaceState({},'',url);};
 const [intent,setIntent]=useState(()=>new URLSearchParams(location.search).get('intent')||'');
 const [mobile,setMobile]=useState(false),[collapsed,setCollapsed]=useState(false),[structure,setStructure]=useState(true),[more,setMore]=useState(false),[popup,setPopup]=useState('');
 const nav=(key,purpose='')=>guarded(()=>{setIntent(purpose);setTip(null);setPage(key);setMobile(false);setPopup('');const url=new URL(location.href);url.searchParams.set('tab','cabinet');url.searchParams.set('page',key);for(const param of ['product','category','q'])url.searchParams.delete(param);if(purpose)url.searchParams.set('intent',purpose);else url.searchParams.delete('intent');if(profilePages[key]){setProfileTab(profilePages[key]);url.searchParams.set('profileTab',profilePages[key]);}else url.searchParams.delete('profileTab');history.pushState({},'',url);acceptedUrl.current=url.href;});
 useEffect(()=>{const back=()=>{const target=location.href;const apply=()=>{history.replaceState({},'',target);acceptedUrl.current=target;const q=new URLSearchParams(location.search);setMember(normalizeMember(q.get('member')));setIntent(q.get('intent')||'');setPage(pages[q.get('page')]?q.get('page'):'overview');setProfileTab(readProfileTab());setMobile(false);setPopup('');};if(leaveGuard.current){history.replaceState({},'',acceptedUrl.current);leaveGuard.current(apply);}else apply();};window.addEventListener('popstate',back);return()=>window.removeEventListener('popstate',back);},[]);
 useLayoutEffect(()=>{const update=()=>{if(root.current)root.current.style.setProperty('--cabinet-height',`${innerHeight-root.current.getBoundingClientRect().top}px`);};update();const ro=new ResizeObserver(update);const header=document.querySelector('#root>header');if(header)ro.observe(header);const toolbar=document.querySelector('.cab-overview-toolbar,.cab-profile-toolbar');if(toolbar)ro.observe(toolbar);window.addEventListener('resize',update);return()=>{ro.disconnect();window.removeEventListener('resize',update);};},[page]);
 useEffect(()=>{if(!popup)return;const outside=e=>{if(!pop.current?.contains(e.target))setPopup('');};document.addEventListener('pointerdown',outside);return()=>document.removeEventListener('pointerdown',outside);},[popup]);
 useEffect(()=>{if(mobile)drawer.current?.querySelector('button')?.focus();const key=e=>{if(e.key==='Escape'){setPopup('');if(mobile){setMobile(false);menuButton.current?.focus();}}if(mobile&&e.key==='Tab'){const els=[...drawer.current.querySelectorAll('button')].filter(e=>e.offsetParent!==null&&!e.closest('[inert]'));if(e.shiftKey&&document.activeElement===els[0]){e.preventDefault();els.at(-1)?.focus();}else if(!e.shiftKey&&document.activeElement===els.at(-1)){e.preventDefault();els[0]?.focus();}}};document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key);},[mobile]);
 const icon=name=>{if(name==='alt-arrow-right')return <span className="cab-chevron" aria-hidden="true" dangerouslySetInnerHTML={{__html:compactChevron}}/>;const url=solarAssets['./assets/navigation/'+name+'-linear.svg'];return url?<span className="cab-solar-icon" aria-hidden="true" style={{maskImage:'url('+JSON.stringify(url)+')',WebkitMaskImage:'url('+JSON.stringify(url)+')'}}/>:<Shared.Icon name={name}/>;};
 const showTip=e=>{if(!collapsed||mobile)return;const button=e.target.closest('.cab-nav-item');if(!button)return;const r=button.getBoundingClientRect();setTip({label:button.getAttribute('aria-label')||button.textContent.trim(),x:r.right+12,y:Math.max(24,Math.min(innerHeight-24,r.top+r.height/2))});};
 const item=(key,nested=false)=><button key={key} type="button" aria-label={pages[key][0]} aria-describedby={collapsed&&tip?.label===pages[key][0]?'cab-nav-tooltip':undefined} className={'cab-nav-item'+(nested?' nested':'')} aria-current={page===key?'page':undefined} onClick={()=>nav(key)}>{icon(pages[key][1])}<span>{key==='invitations'?'Приглашения':pages[key][0]}</span></button>;
 const iconButton=(label,child,action)=><Shared.Button group={db.components.find(c=>c.name==='Boris / Icon button')} choice={{Tone:'Outline',Size:'48'}} ariaLabel={label} iconContent={child} onClick={action}/>;
 return <>{page==='genealogy'&&<div className="cab-overview-toolbar"><span>Бинарное дерево · демонстрационные данные · контакты вымышленные</span></div>}{profilePages[page]&&<div className="cab-overview-toolbar cab-profile-toolbar"><span>Демонстрация профиля · данные не отправляются · код 123456 · пароль Virena123</span><label>Фото<select aria-label="Фото профиля" value={avatarPhoto?'loaded':'empty'} onChange={e=>setAvatarPhoto(e.target.value==='empty'?'':profilePhoto)}><option value="loaded">Загружено</option><option value="empty">Без фото</option></select></label><label>Состояние профиля<select aria-label="Состояние профиля" value={profileScenario} onChange={e=>setProfileScenario(e.target.value)}><option value="ready">Готово</option><option value="empty">Реквизиты и преемник не указаны</option><option value="filled">Реквизиты и преемник заполнены</option><option value="loading">Загрузка</option><option value="error">Ошибка загрузки</option></select></label></div>}{page==='overview'&&<div className="cab-overview-toolbar"><span>Демонстрационные данные</span><label>Участник<select aria-label="Участник" value={member} onChange={e=>changeMember(e.target.value)}>{Object.entries(memberStates).map(([key,state])=><option key={key} value={key}>{state.label}</option>)}</select></label><label>Состояние<select aria-label="Состояние" value={overviewScenario} onChange={e=>setOverviewScenario(e.target.value)}><option value="ready">Готово</option><option value="loading">Загрузка</option><option value="profile-error">Ошибка профиля</option><option value="sponsor-error">Ошибка спонсора</option></select></label></div>}<div ref={root} className={'cabinet'+(collapsed?' is-collapsed':'')+(mobile?' menu-open':'')}>
 {mobile&&<button className="cab-scrim" aria-label="Закрыть меню" onClick={()=>setMobile(false)}/>}
 <aside onPointerOver={showTip} onPointerLeave={()=>setTip(null)} onFocusCapture={showTip} onBlurCapture={()=>setTip(null)} onScroll={()=>setTip(null)} ref={drawer} className="cab-sidebar" aria-label="Разделы кабинета" role={mobile?'dialog':undefined} aria-modal={mobile||undefined}>
 <div className="cab-brand"><img className="cab-wordmark" src={logo} alt="Virena"/><img className="cab-mark" src={mark} alt="Virena"/><span>Бизнес-центр</span></div>
 <button className="cab-mobile-close cab-icon-button" aria-label="Закрыть навигацию" onClick={()=>setMobile(false)}><Glyph name="close"/></button>
 <nav className="cab-nav" aria-label="Основная навигация">
 {item('overview')}
 <button className="cab-nav-item" aria-expanded={structure} aria-controls="cab-structure" aria-label="Моя структура" onClick={()=>{setTip(null);setStructure(!structure);if(!structure)nav('participants');}}>{icon('Tree')}<span>Моя структура</span><i className={'cab-disclosure'+(structure?' expanded':'')}>{icon('alt-arrow-right')}</i></button>
 <div id="cab-structure" className="cab-nav-group" data-open={structure} inert={!structure||undefined} aria-hidden={!structure}><div>{item('participants',true)}{item('genealogy',true)}</div></div>
 {['invitations','finances','orders','shop','learning'].map(key=>item(key))}
 <button className="cab-nav-item cab-more" aria-expanded={more} aria-controls="cab-more" aria-label="Другие разделы" onClick={()=>{setTip(null);setMore(!more);if(!more)nav('news');}}>{icon('widget')}<span>Другие разделы</span><i className={'cab-disclosure'+(more?' expanded':'')}>{icon('alt-arrow-right')}</i></button>
 <div id="cab-more" className="cab-nav-group" data-open={more} inert={!more||undefined} aria-hidden={!more}><div>{['news','offers','calendar','materials','locations','knowledge'].map(key=>item(key,true))}</div></div>
 </nav>
 <div className="cab-sidebar-bottom">{item('support')}<div className="cab-collapse-slot"><button type="button" className="cab-sidebar-toggle" aria-label={collapsed?'Развернуть меню':'Свернуть меню'} title={collapsed?'Развернуть меню':'Свернуть меню'} aria-expanded={!collapsed} onClick={()=>{setTip(null);setCollapsed(!collapsed);}}>{icon(collapsed?'panel-left-open':'panel-left-close')}<span className="cab-collapse-label">Свернуть меню</span></button></div></div>
 </aside>
 <div className="cab-body" inert={mobile||undefined}>
 <header className="cab-header">
 <button ref={menuButton} className="cab-mobile-menu cab-icon-button" aria-label="Открыть меню" aria-expanded={mobile} onClick={()=>setMobile(true)}><Glyph name="menu"/></button>
 <h1 className="cab-title">{profilePages[page]?'Мой профиль':pages[page][0]}{page==='shop'&&!intent&&catalogCount!==null&&<span className="cab-title-count" aria-live="polite">{catalogCount}</span>}</h1>
 <div className="cab-top-actions" ref={pop}>
 <span className="cab-desktop">{iconButton(dark?'Светлая тема':'Тёмная тема',<Glyph name={dark?'sun':'moon'}/>,onTheme)}</span>

 <span className="cab-desktop">{iconButton('Корзина',icon('Orders'),()=>nav('cart'))}</span>
 <span className="cab-desktop">{iconButton('Сервисы',icon('Grid'),()=>setPopup(popup==='services'?'':'services'))}</span>
 {iconButton('Уведомления',<Glyph name="bell"/>,()=>setPopup(popup==='notifications'?'':'notifications'))}
 <button className="cab-avatar" aria-label="Меню профиля" aria-expanded={popup==='profile'} onClick={()=>setPopup(popup==='profile'?'':'profile')}><>{avatarPhoto?<img src={avatarPhoto} alt=""/>:<span className="cab-avatar-initials">{profileInitials}</span>}</></button>
 {popup&&<div className={`cab-popover${popup==='profile'?' cab-profile-menu':''}`} key={popup}>
 {popup==='profile'?<><strong>Ваш аккаунт</strong>{['profile','security','details','settings'].map(key=><button key={key} onClick={()=>nav(key)}>{icon(pages[key][1])}<span>{pages[key][0]}</span></button>)}<button className="cab-mobile-option" onClick={onTheme}><Glyph name={dark?'sun':'moon'}/><span>{dark?'Светлая тема':'Тёмная тема'}</span></button><button className="cab-mobile-option" onClick={()=>nav('cart')}>{icon('cart')}<span>Корзина</span></button><button className="cab-mobile-option" onClick={()=>setPopup('services')}>{icon('widget')}<span>Сервисы</span></button><button onClick={()=>guarded(onLogout)}>{icon('logout-2')}<span>Выйти</span></button></>:popup==='notifications'?<><strong>Уведомления</strong><p>Новых уведомлений пока нет</p><button onClick={()=>nav('notifications')}>Все уведомления</button><button onClick={()=>nav('settings')}>Настроить уведомления</button></>:<><strong>Сервисы</strong><button onClick={()=>nav('shop')}>Магазин</button><p>Другие сервисы появятся здесь после подключения.</p></>}
 </div>}
 </div>
 </header>
 <main className="cab-main" key={profilePages[page]?'profile':page}>
 <>{profilePages[page]?<Profile photo={avatarPhoto} setPhoto={setAvatarPhoto} Shared={Shared} db={db} initialTab={profileTab} dark={dark} onTheme={onTheme} registerGuard={registerGuard} onTabChange={changeProfileTab} scenario={profileScenario}/>:page==='overview'?<Overview photo={avatarPhoto} key={member} member={member} Shared={Shared} db={db} icon={icon} navigate={nav} scenario={overviewScenario}/>:page==='genealogy'?(new URLSearchParams(location.search).has('tree-study')?<TreeDirections photo={avatarPhoto}/>:<Genealogy Shared={Shared} db={db} photo={avatarPhoto}/>):page==='shop'&&!intent?<Storefront Shared={Shared} db={db} onCountChange={setCatalogCount}/>:<section className="cab-placeholder"><div className="cab-placeholder-icon">{icon(pages[page][1])}</div><h2>{page==='overview'?'Ваш Бизнес-центр':'Раздел готовится'}</h2><p>{page==='shop'&&intent==='restore'?'Восстановление активности · 240 €':page==='shop'&&intent==='renewal'?'Продление в льготном окне · 240 €':page==='shop'&&intent==='upgrade'?'Апгрейд партнёрского пакета · демонстрация':page==='shop'&&intent==='activity'?'Оплата годовой активности · 120 €':page==='shop'&&intent==='packages'?'Выбор партнёрского пакета':pages[page][2]}</p><span>Содержимое появится в следующих обновлениях.</span>
 {page==='overview'&&<div className="cab-start-links">{['genealogy','profile','orders'].map(key=><button key={key} onClick={()=>nav(key)}>{pages[key][0]} {icon('alt-arrow-right')}</button>)}</div>}
 </section>}</>
 <footer className="cab-footer"><span>© Virena</span><button onClick={()=>nav('support')}>Поддержка</button></footer>
 </main>
 </div>
 {tip&&collapsed&&!mobile&&createPortal(<div id="cab-nav-tooltip" role="tooltip" className="cab-nav-tooltip" style={{left:tip.x,top:tip.y}}>{tip.label}</div>,document.body)}
 </div></>;
}
