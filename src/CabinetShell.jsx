import usePageSkeleton from './usePageSkeleton.js';
import {isMarketplacePage} from './commerceRoutes.js';
import './marketplace.css';
import CabinetButton from './cabinet/components/CabinetButton.jsx';
import {memberStates,normalizeMember} from './cabinet/components/memberStates.js';
import {createPortal} from 'react-dom';
import React,{useState,useEffect,useLayoutEffect,useRef,useCallback} from 'react';
import logo from './assets/virena-logo.svg';
import mark from './assets/virena-mark.svg';
import chevronSource from './assets/navigation/alt-arrow-right-linear.svg?raw';
const compactChevron=chevronSource.replace('<svg ', '<svg aria-hidden="true" ').replace('<path ', '<path vector-effect="non-scaling-stroke" ').replace('stroke="black"','stroke="currentColor"');
import './cabinet.css';
import Storefront,{products} from './Storefront.jsx';
import Cart from './cabinet/components/Cart.jsx';
import CabinetDialog from './cabinet/components/CabinetDialog.jsx';
import Checkout from './cabinet/components/Checkout.jsx';
import {changeQuantity,emptyCheckout,createDemoOrder} from './cabinet/components/commerceData.js';
import Profile from './cabinet/components/Profile.jsx';
import ProfileMenu from './cabinet/components/ProfileMenu.jsx';
import EmptyIllustration from './cabinet/components/EmptyIllustration.jsx';
import Invitations from './cabinet/components/Invitations.jsx';
import Finance from './cabinet/components/Finance.jsx';
import Orders,{OrderSupport} from './cabinet/components/Orders.jsx';
import FinanceDesignGallery from './cabinet/components/FinanceDesignGallery.jsx';
import {financeScenarios,makeFinanceSession} from './cabinet/components/financeData.js';
import {initialInvitationView} from './cabinet/components/invitationsData.js';
import Participants from './cabinet/components/Participants.jsx';
import GenealogyWorkspace from './cabinet/components/GenealogyWorkspace.jsx';
import TreeDirections from './cabinet/components/TreeDirections.jsx';
import CabinetDestination from './cabinet/components/CabinetDestination.jsx';
import Overview,{profilePhoto,profileInitials} from './cabinet/components/Overview.jsx';

const solarAssets=import.meta.glob('./assets/navigation/*.svg',{eager:true,query:'?url',import:'default'});
// Navigation shape follows the approved sidebar; labels follow the current BC map.
const pages={
 overview:['Обзор','Home','Главная кабинета: состояние участника, важные действия и сводка бизнеса.'],
 participants:['Участники','Users','Список участников и подробная информация о структуре.'],
 genealogy:['Бинарное дерево','Branch','Дерево структуры, поиск и размещение новых участников.'],
 invitations:['Личные приглашения','plane-3-linear','Приглашённые участники, их этапы и те, кому нужно уделить внимание.'],
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
 checkout:['Оформление заказа','cart','Данные заказа и оплата.'],
 confirmation:['Заказ оформлен','cart','Результат оформления.'],
 cart:['Корзина','cart','Товары и активность, оформление заказа.'],
 support:['Поддержка','chat-round-dots','Обращения в службу поддержки.']
};
const activeNavIcons={overview:'home-bold',participants:'users-group-two-rounded-bold',genealogy:'git-branch-selected',invitations:'plane-3-bold',finances:'wallet-bold',orders:'bag-bold',shop:'shop-bold',learning:'book-bold',news:'notebook-2-bold',offers:'tag-bold',calendar:'calendar-bold',materials:'presentation-graph-bold',locations:'map-point-bold',knowledge:'library-bold',support:'chat-round-dots-bold'};
const profilePages={profile:'personal',security:'security',details:'requisites',settings:'settings'};
const profileTabs=['personal','contacts','security','requisites','successor','settings'];
const readProfileTab=()=>{const q=new URLSearchParams(location.search);return profileTabs.includes(q.get('profileTab'))?q.get('profileTab'):(profilePages[q.get('page')]||'personal');};
const cartBackground=()=>{
 if(new URLSearchParams(location.search).get('page')!=='cart')return null;
 const saved=history.state?.virenaCart;
 if(saved&&pages[saved.page]&&saved.page!=='cart')return saved;
 const url=new URL(location.href);url.searchParams.set('page','shop');url.searchParams.delete('intent');
 return {page:'shop',url:url.href,scroll:0};
};
export default function CabinetShell({Shared,db,dark,onTheme,onLogout,design,settingsTarget,marketplace=false,storeGuest=false,onStoreGuestChange,onAuth}){
 const root=useRef(null),drawer=useRef(null),menuButton=useRef(null),pop=useRef(null);
 const cartContext=useRef(cartBackground());
 const [cartOpen,setCartOpen]=useState(()=>new URLSearchParams(location.search).get('page')==='cart');
 const [page,setPage]=useState(()=>{const key=new URLSearchParams(location.search).get('page');return key==='cart'?(cartContext.current?.page||'shop'):pages[key]?key:'overview'});
 const [ordersScenario,setOrdersScenario]=useState('ready');
 const [clearCartOpen,setClearCartOpen]=useState(false);
 const [cartLines,setCartLines]=useState([]),[checkoutDraft,setCheckoutDraft]=useState(emptyCheckout);
 const [commerceScenario,setCommerceScenario]=useState('ready'),[demoOrders,setDemoOrders]=useState([]),[confirmedOrder,setConfirmedOrder]=useState(null);
 const [commerceToast,setCommerceToast]=useState('');const commerceTimer=useRef(null),placingOrder=useRef(false);
 const notifyCommerce=message=>{clearTimeout(commerceTimer.current);setCommerceToast(message);commerceTimer.current=setTimeout(()=>setCommerceToast(''),3000);};
 useEffect(()=>()=>clearTimeout(commerceTimer.current),[]);
 const [cartAnimation,setCartAnimation]=useState(0);
 const cartCount=cartLines.reduce((n,l)=>n+l.quantity,0);
 const [badgeCount,setBadgeCount]=useState(cartCount),[badgeClosing,setBadgeClosing]=useState(false);
 useLayoutEffect(()=>{if(cartCount){setBadgeCount(cartCount);setBadgeClosing(false);return;}if(!badgeCount)return;setBadgeClosing(true);const timer=setTimeout(()=>{setBadgeCount(0);setBadgeClosing(false);},180);return()=>clearTimeout(timer);},[cartCount]);
 const addProduct=(id,quantity=1)=>{if(!products.some(p=>p.id===id)||!Number.isSafeInteger(quantity)||quantity<1)return;setCartLines(lines=>changeQuantity(lines,id,(lines.find(l=>l.productId===id)?.quantity||0)+quantity));setCartAnimation(n=>n+1);setCommerceScenario('ready');setConfirmedOrder(null);notifyCommerce(`${products.find(p=>p.id===id)?.name} добавлен в корзину`);};
 const onSetQuantity=(id,quantity)=>{setCartLines(lines=>changeQuantity(lines,id,quantity));setCommerceScenario('ready');};
 const removeProduct=id=>{setCartLines(lines=>lines.filter(line=>line.productId!==id));setCommerceScenario('ready');notifyCommerce('Товар удалён из корзины');};
 const placeDemoOrder=()=>{if(placingOrder.current||!cartLines.length)return;placingOrder.current=true;const order=createDemoOrder(cartLines,products,checkoutDraft,'DEMO-'+Date.now());setDemoOrders(orders=>[order,...orders]);setConfirmedOrder(order);setCartLines([]);setCheckoutDraft(emptyCheckout());nav('confirmation');queueMicrotask(()=>{placingOrder.current=false;});};
 const changeCommerceScenario=value=>{setCommerceScenario(value);setConfirmedOrder(null);setCheckoutDraft(emptyCheckout());if(['empty','single','many','physical','digital'].includes(value))setCartLines(value==='empty'?[]:(value==='many'?products:value==='digital'?products.filter(p=>p.category==='online'):products.filter(p=>p.id==='expert')).map(p=>({productId:p.id,quantity:1})));};
 const [financeHistoryCount,setFinanceHistoryCount]=useState(null);
 const [financeIdeas,setFinanceIdeas]=useState(()=>new URLSearchParams(location.search).has('financeIdeas'));
 const [financeView,setFinanceView]=useState(()=>new URLSearchParams(location.search).get('financeView')==='history'?'history':'overview');
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
 const [financeScenario,setFinanceScenario]=useState('ready'),[financeMember,setFinanceMember]=useState('partner'),[financeSession,setFinanceSession]=useState(()=>makeFinanceSession());
 const [invitationsScenario,setInvitationsScenario]=useState('ready');
 const [invitationsView,setInvitationsView]=useState(initialInvitationView);
 const [invitationsSession,setInvitationsSession]=useState({notes:{},reminders:{}});
 const [invitationsMember,setInvitationsMember]=useState('partner');
 const [participantsScenario,setParticipantsScenario]=useState('ready');
 const [participantsView,setParticipantsView]=useState({scope:'all',query:'',side:[],state:[],pack:[],page:1,pageSize:10,sortKey:'',sortDirection:'asc'}),participantsScroll=useRef(0);
 useLayoutEffect(()=>{if(page==='participants'){const el=root.current?.querySelector('.cab-main');if(el)el.scrollTop=participantsScroll.current;}},[page]);
 const [treeSession,setTreeSession]=useState({sides:{},registered:[]});
 const [treeScenario,setTreeScenario]=useState('ready'),[treeMember,setTreeMember]=useState(()=>new URLSearchParams(location.search).get('member')||'partner'),[treeCell,setTreeCell]=useState('');
 const [member,setMember]=useState(()=>normalizeMember(new URLSearchParams(location.search).get('member')));
 const changeMember=value=>{setMember(value);const url=new URL(location.href);url.searchParams.set('member',value);history.replaceState({},'',url);};
 const [intent,setIntent]=useState(()=>new URLSearchParams(location.search).get('intent')||'');
 const [mobile,setMobile]=useState(false),[collapsed,setCollapsed]=useState(false),[more,setMore]=useState(false),[popup,setPopup]=useState('');
 const closeCart=()=>{
  if(history.state?.virenaCart){history.back();return;}
  const context=cartContext.current;setCartOpen(false);
  if(context){history.replaceState({},'',context.url);acceptedUrl.current=context.url;setPage(context.page);}
 };
 const nav=(key,purpose='')=>{
  if(marketplace&&storeGuest&&!isMarketplacePage(key,purpose)&&key!=='cart'){onAuth?.('overview');return;}
  if(key==='cart'){
   if(cartOpen)return;
   const backgroundUrl=new URL(location.href);if(!marketplace){backgroundUrl.searchParams.set('tab','store');backgroundUrl.searchParams.set('page','shop');for(const key of ['intent','product','category','q'])backgroundUrl.searchParams.delete(key);}const context={page:marketplace?page:'shop',url:backgroundUrl.href,scroll:marketplace?(root.current?.querySelector('.cab-main')?.scrollTop||0):0};
   cartContext.current=context;const url=new URL(location.href);url.searchParams.set('tab','store');url.searchParams.set('page','cart');
   history.pushState({virenaCart:context},'',url);acceptedUrl.current=url.href;setCartOpen(true);setMobile(false);setPopup('');setTip(null);window.dispatchEvent(new PopStateEvent('popstate'));return;
  }
  guarded(()=>{setCartOpen(false);setIntent(purpose);setTip(null);setFinanceIdeas(false);setFinanceView('overview');setPage(key);setMobile(false);setPopup('');const url=new URL(location.href);url.searchParams.set('tab',isMarketplacePage(key,purpose)?'store':'cabinet');url.searchParams.set('page',key);for(const param of ['product','category','q','financeView','financeIdeas'])url.searchParams.delete(param);if(purpose)url.searchParams.set('intent',purpose);else url.searchParams.delete('intent');if(profilePages[key]){setProfileTab(profilePages[key]);url.searchParams.set('profileTab',profilePages[key]);}else url.searchParams.delete('profileTab');history.pushState({},'',url);acceptedUrl.current=url.href;window.dispatchEvent(new PopStateEvent('popstate'));});};
 useEffect(()=>{const back=()=>{const target=location.href;const apply=()=>{history.replaceState({},'',target);acceptedUrl.current=target;const q=new URLSearchParams(location.search);setMember(normalizeMember(q.get('member')));setIntent(q.get('intent')||'');const isCart=q.get('page')==='cart';const background=isCart?cartBackground():null;if(background)cartContext.current=background;setCartOpen(isCart);setPage(isCart?(background?.page||'shop'):pages[q.get('page')]?q.get('page'):'overview');setProfileTab(readProfileTab());setFinanceView(q.get('financeView')==='history'?'history':'overview');setFinanceIdeas(q.has('financeIdeas'));setMobile(false);setPopup('');};if(leaveGuard.current&&new URL(acceptedUrl.current).searchParams.get('page')!=='cart'&&new URL(target).searchParams.get('page')!=='cart'){history.replaceState({},'',acceptedUrl.current);leaveGuard.current(apply);}else apply();};window.addEventListener('popstate',back);return()=>window.removeEventListener('popstate',back);},[]);
 useLayoutEffect(()=>{if(cartOpen&&cartContext.current){const main=root.current?.querySelector('.cab-main');if(main)main.scrollTop=cartContext.current.scroll||0;}},[page,cartOpen]);
 useLayoutEffect(()=>{const update=()=>{if(root.current)root.current.style.setProperty('--cabinet-height',`${innerHeight-root.current.getBoundingClientRect().top}px`);};update();const ro=new ResizeObserver(update);const header=document.querySelector('#root>header');if(header)ro.observe(header);const toolbar=document.querySelector('.cab-overview-toolbar,.cab-profile-toolbar');if(toolbar)ro.observe(toolbar);window.addEventListener('resize',update);return()=>{ro.disconnect();window.removeEventListener('resize',update);};},[page]);
 useEffect(()=>{if(!popup)return;const outside=e=>{if(!pop.current?.contains(e.target))setPopup('');};document.addEventListener('pointerdown',outside);return()=>document.removeEventListener('pointerdown',outside);},[popup]);
 useEffect(()=>{if(mobile)drawer.current?.querySelector('button')?.focus();const key=e=>{if(e.key==='Escape'){setPopup('');if(mobile){setMobile(false);menuButton.current?.focus();}}if(mobile&&e.key==='Tab'){const els=[...drawer.current.querySelectorAll('button')].filter(e=>e.offsetParent!==null&&!e.closest('[inert]'));if(e.shiftKey&&document.activeElement===els[0]){e.preventDefault();els.at(-1)?.focus();}else if(!e.shiftKey&&document.activeElement===els.at(-1)){e.preventDefault();els[0]?.focus();}}};document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key);},[mobile]);
 const icon=name=>{if(name==='alt-arrow-right')return <span className="cab-chevron" aria-hidden="true" dangerouslySetInnerHTML={{__html:compactChevron}}/>;const url=solarAssets['./assets/navigation/'+name+'-linear.svg'];return url?<span className="cab-solar-icon" aria-hidden="true" style={{maskImage:'url('+JSON.stringify(url)+')',WebkitMaskImage:'url('+JSON.stringify(url)+')'}}/>:<Shared.Icon name={name}/>;};
 const showTip=e=>{if(!collapsed||mobile)return;const button=e.target.closest('.cab-nav-item');if(!button)return;const r=button.getBoundingClientRect();setTip({label:button.getAttribute('aria-label')||button.textContent.trim(),x:r.right+12,y:Math.max(24,Math.min(innerHeight-24,r.top+r.height/2))});};
 const changeFinanceView=view=>{setFinanceIdeas(false);setFinanceView(view);setMobile(false);setTip(null);const url=new URL(location.href);url.searchParams.delete('financeIdeas');if(view==='history')url.searchParams.set('financeView','history');else url.searchParams.delete('financeView');if(url.href!==location.href)history.pushState({},'',url);acceptedUrl.current=url.href;};
 const item=(key,nested=false)=><button key={key} type="button" aria-label={pages[key][0]} aria-describedby={collapsed&&tip?.label===pages[key][0]?'cab-nav-tooltip':undefined} className={'cab-nav-item'+(nested?' nested':'')} aria-current={page===key&&(key!=='finances'||financeView==='overview')?'page':undefined} onClick={()=>nav(key)}>{page===key&&(key!=='finances'||financeView==='overview')&&activeNavIcons[key]?<span className="cab-nav-filled" data-icon={key}><Shared.Icon name={activeNavIcons[key]}/></span>:icon(pages[key][1])}<span>{key==='invitations'?'Приглашения':pages[key][0]}</span></button>;
 const accountAvatar=()=><button className="cab-avatar" aria-haspopup="menu" aria-controls="cab-account-actions" aria-label="Меню профиля" aria-expanded={popup==='profile'} onClick={()=>setPopup(popup==='profile'?'':'profile')}><>{avatarPhoto?<img src={avatarPhoto} alt=""/>:<span className="cab-avatar-initials">{profileInitials}</span>}</></button>;
 const iconButton=(label,child,action)=><Shared.Button group={db.components.find(c=>c.name==='Boris / Icon button')} choice={{Tone:design==='soft'?'Soft':'Outline',Size:'48'}} ariaLabel={label} iconContent={child} onClick={action}/>;
 usePageSkeleton(root,[page,profileTab,financeView,intent].join(':'),{selector:'.cab-main',loading:(profilePages[page]?profileScenario:({overview:overviewScenario,participants:participantsScenario,genealogy:treeScenario,invitations:invitationsScenario,finances:financeScenario,orders:ordersScenario,checkout:commerceScenario,confirmation:commerceScenario}[page]))==='loading'});
 return <>{commerceToast&&!cartOpen&&createPortal(<div className="auth-toast" role="status">{commerceToast}</div>,document.body)}{settingsTarget&&createPortal(<>{(cartOpen||['shop','checkout','confirmation'].includes(page))&&<div className="cab-overview-toolbar"><span>Демо · цены вымышлены · оплаты нет · корзина и заказы хранятся до перезагрузки</span>{marketplace&&<label>Посетитель<select aria-label="Посетитель каталога" value={storeGuest?'guest':'signed-in'} onChange={e=>onStoreGuestChange?.(e.target.value==='guest')}><option value="signed-in">Авторизован</option><option value="guest">Гость</option></select></label>}<label>Состояние<select aria-label="Состояние корзины" value={commerceScenario} onChange={e=>changeCommerceScenario(e.target.value)}>{Object.entries({ready:'Текущая корзина',empty:'Пусто',single:'Один товар',many:'Все товары',physical:'Физический товар',digital:'Онлайн-продукты',loading:'Загрузка',error:'Ошибка загрузки','submit-error':'Ошибка оформления'}).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label></div>}{page==='orders'&&<div className="cab-overview-toolbar"><span>Демонстрационные покупки · цены и чеки вымышлены</span><label>Состояние<select aria-label="Состояние покупок" value={ordersScenario} onChange={e=>setOrdersScenario(e.target.value)}>{Object.entries({ready:'Готово',empty:'Пусто',single:'Один заказ',many:'Много заказов',long:'Длинные данные',loading:'Загрузка',error:'Ошибка загрузки','action-error':'Ошибка действия'}).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label></div>}{page==='finances'&&!financeIdeas&&<div className="cab-overview-toolbar"><span>Демо · 05.11.2026 · выплаты не отправляются · пароль Virena123</span><a href="?tab=cabinet&page=finances&financeIdeas=1">50 вариантов дизайна</a><label>Владелец<select aria-label="Владелец финансов" value={financeMember} onChange={e=>{setFinanceMember(e.target.value);setFinanceSession(makeFinanceSession(financeScenario));}}>{Object.entries(memberStates).map(([key,state])=><option key={key} value={key}>{state.label}</option>)}</select></label><label>Состояние<select aria-label="Состояние финансов" value={financeScenario} onChange={e=>{setFinanceScenario(e.target.value);setFinanceSession(makeFinanceSession(e.target.value));}}>{Object.entries(financeScenarios).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label></div>}{page==='invitations'&&<div className="cab-overview-toolbar"><span>Демонстрация · контакты вымышлены · письма не отправляются</span><label>Владелец<select aria-label="Владелец приглашений" value={invitationsMember} onChange={e=>setInvitationsMember(e.target.value)}>{Object.entries(memberStates).map(([key,state])=><option key={key} value={key}>{state.label}</option>)}</select></label><label>Состояние<select aria-label="Состояние приглашений" value={invitationsScenario} onChange={e=>setInvitationsScenario(e.target.value)}>{Object.entries({ready:'Готово',empty:'Пусто',single:'Один',many:'Много',long:'Длинные данные',loading:'Загрузка',error:'Ошибка',calculating:'Идёт расчёт',deleted:'Регистрация удалена','action-error':'Ошибка действия'}).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label></div>}{page==='participants'&&<div className="cab-overview-toolbar"><span>Демонстрационные данные структуры</span><label>Состояние<select aria-label="Состояние списка участников" value={participantsScenario} onChange={e=>setParticipantsScenario(e.target.value)}>{Object.entries({ready:'Готово',empty:'Пусто',single:'Один участник',long:'Длинные данные',loading:'Загрузка',error:'Ошибка'}).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label></div>}{page==='genealogy'&&new URLSearchParams(location.search).get('cards')!=='ideas'&&<div className="cab-overview-toolbar"><span>Демонстрация · данные и регистрации не отправляются · справочники сокращены</span><a href="?tab=cabinet&page=genealogy&cards=ideas">Варианты карточки ↗</a><label>Участник<select aria-label="Участник дерева" value={treeMember} onChange={e=>setTreeMember(e.target.value)}>{Object.entries(memberStates).map(([key,state])=><option key={key} value={key}>{state.label}</option>)}</select></label><label>Сценарий<select aria-label="Сценарий дерева" value={treeScenario} onChange={e=>{setTreeScenario(e.target.value);setTreeCell('');}}>{Object.entries({ready:'Готово',empty:'Пустая структура',single:'Один участник',loading:'Загрузка',error:'Ошибка загрузки',denied:'Нет доступа',calculating:'Идёт расчёт','save-error':'Ошибка сохранения','registration-error':'Ошибка регистрации','extra-slots':'Свободные свои ячейки','slot-taken':'Место уже заняли','own-cells':'Три свои ячейки'}).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label></div>}{profilePages[page]&&<div className="cab-overview-toolbar cab-profile-toolbar"><span>Демонстрация профиля · данные не отправляются · код 123456 · пароль Virena123</span><label>Фото<select aria-label="Фото профиля" value={avatarPhoto?'loaded':'empty'} onChange={e=>setAvatarPhoto(e.target.value==='empty'?'':profilePhoto)}><option value="loaded">Загружено</option><option value="empty">Без фото</option></select></label><label>Состояние профиля<select aria-label="Состояние профиля" value={profileScenario} onChange={e=>setProfileScenario(e.target.value)}><option value="ready">Готово</option><option value="empty">Реквизиты и преемник не указаны</option><option value="filled">Реквизиты и преемник заполнены</option><option value="loading">Загрузка</option><option value="error">Ошибка загрузки</option></select></label></div>}{page==='overview'&&<div className="cab-overview-toolbar"><span>Демонстрационные данные</span><label>Участник<select aria-label="Участник" value={member} onChange={e=>changeMember(e.target.value)}>{Object.entries(memberStates).map(([key,state])=><option key={key} value={key}>{state.label}</option>)}</select></label><label>Состояние<select aria-label="Состояние" value={overviewScenario} onChange={e=>setOverviewScenario(e.target.value)}><option value="ready">Готово</option><option value="loading">Загрузка</option><option value="profile-error">Ошибка профиля</option><option value="sponsor-error">Ошибка спонсора</option></select></label></div>}</>,settingsTarget)}<div ref={root} className={'cabinet'+(marketplace?' marketplace profile':'')+(collapsed?' is-collapsed':'')+(mobile?' menu-open':'')}>
 {!marketplace&&mobile&&<button className="cab-scrim" aria-label="Закрыть меню" onClick={()=>setMobile(false)}/>}
 {!marketplace&&<aside onPointerOver={showTip} onPointerLeave={()=>setTip(null)} onFocusCapture={showTip} onBlurCapture={()=>setTip(null)} onScroll={()=>setTip(null)} ref={drawer} className="cab-sidebar" aria-label="Разделы кабинета" role={mobile?'dialog':undefined} aria-modal={mobile||undefined}>
 <a className="cab-brand" href="?tab=cabinet&page=overview" aria-label="Virena – на главную" style={{textDecoration:'none'}} onClick={e=>{if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();nav('overview');}}><img className="cab-wordmark" src={logo} alt=""/><img className="cab-mark" src={mark} alt=""/><span>Бизнес-центр</span></a>
 <button className="cab-mobile-close cab-icon-button" aria-label="Закрыть навигацию" onClick={()=>setMobile(false)}><Shared.Icon name="Cross"/></button>
 <nav className="cab-nav" aria-label="Основная навигация">
 {item('overview')}
 {item('participants')}
 {item('genealogy')}
 {item('invitations')}
 {item('finances')}
 <div className="cab-nav-group" data-open={page==='finances'} inert={page!=='finances'||undefined} aria-hidden={page!=='finances'}><div><button type="button" className="cab-nav-item nested" aria-label="История финансов" aria-current={page==='finances'&&financeView==='history'?'page':undefined} onClick={()=>changeFinanceView('history')}><span className={financeView==='history'?'cab-nav-filled':'cab-nav-icon'}><Shared.Icon name={financeView==='history'?'clock-circle-bold':'clock-circle-linear'}/></span><span>История</span></button></div></div>
 {item('orders')}{item('learning')}
 <button className="cab-nav-item cab-more" aria-expanded={more} aria-controls="cab-more" aria-label="Другие разделы" onClick={()=>{setTip(null);setMore(!more);}}>{icon('widget')}<span>Другие разделы</span><i className={'cab-disclosure'+(more?' expanded':'')}>{icon('alt-arrow-right')}</i></button>
 <div id="cab-more" className="cab-nav-group" data-open={more} inert={!more||undefined} aria-hidden={!more}><div>{['news','offers','calendar','materials','locations','knowledge'].map(key=>item(key,true))}</div></div>
 </nav>
 <div className="cab-sidebar-bottom">{item('support')}<div className="cab-collapse-slot"><button type="button" className="cab-sidebar-toggle" aria-label={collapsed?'Развернуть меню':'Свернуть меню'} title={collapsed?'Развернуть меню':'Свернуть меню'} aria-expanded={!collapsed} onClick={()=>{setTip(null);setCollapsed(!collapsed);}}>{icon(collapsed?'panel-left-open':'panel-left-close')}<span className="cab-collapse-label">Свернуть меню</span></button></div></div>
 </aside>}
 <div className="cab-body" inert={mobile||undefined}>
 <header className="cab-header">
 {marketplace&&<><a className="marketplace-brand" href={storeGuest?"?tab=store&page=shop":"?tab=cabinet&page=overview"} aria-label="Virena – на главную" onClick={e=>{if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();nav(storeGuest?'shop':'overview');}}><img src={logo} alt=""/></a></>}
 {!marketplace&&<button ref={menuButton} className="cab-mobile-menu cab-icon-button" aria-label="Открыть меню" aria-expanded={mobile} onClick={()=>setMobile(true)}>{icon('panel-left-open')}</button>}
 <h1 className="cab-title">{profilePages[page]?'Мой профиль':page==='finances'&&financeIdeas?'Финансы · варианты':page==='finances'&&financeView==='history'?'История операций':pages[page][0]}{page==='finances'&&financeView==='history'&&financeHistoryCount!==null&&<span className="cab-title-count" aria-live="polite">{financeHistoryCount}</span>}{page==='shop'&&!intent&&catalogCount!==null&&<span className="cab-title-count" aria-live="polite">{catalogCount}</span>}</h1>
 <div className="cab-top-actions" ref={pop}>
 {(!marketplace||!storeGuest)&&<CabinetButton Shared={Shared} db={db} label={marketplace?"Бизнес-центр":"Маркетплейс"} tone="Soft" leadingIcon={marketplace?"home-linear":"shop-linear"} leadingIconContent={marketplace?<Shared.Icon name="home-linear"/>:icon('shop')} onClick={()=>nav(marketplace?'overview':'shop')}/>}
 <span className="cab-desktop">{iconButton(dark?'Светлая тема':'Тёмная тема',<Shared.Icon name={dark?'sun-linear':'moon-linear'}/>,onTheme)}</span>

 {marketplace&&<span className="cab-cart-trigger">{iconButton(cartCount?`Корзина · ${cartCount} товаров`:'Корзина',icon('cart'),()=>nav('cart'))}{(cartCount>0||badgeCount>0)&&<span key={cartAnimation} className={'cab-cart-badge'+(badgeClosing?' is-closing':cartAnimation?' is-added':'')} aria-hidden="true"><span className="cab-cart-count">{cartCount||badgeCount}</span></span>}</span>}
 {marketplace&&storeGuest&&<CabinetButton Shared={Shared} db={db} label="Войти" tone="Soft" onClick={()=>onAuth?.('store')}/>}
 {marketplace&&!storeGuest&&<>{accountAvatar()}<ProfileMenu open={popup==='profile'} Shared={Shared} photo={avatarPhoto} page={page} navigate={nav} onClose={()=>setPopup('')} onLogout={()=>guarded(onLogout)} dark={dark} onTheme={onTheme} onServices={()=>setPopup('services')}/></>}
 {!marketplace&&<><span className="cab-desktop">{iconButton('Сервисы',icon('Grid'),()=>setPopup(popup==='services'?'':'services'))}</span>
 <span className={page==='shop'?'cab-desktop':undefined}>{iconButton('Уведомления',<Shared.Icon name="bell-linear"/>,()=>setPopup(popup==='notifications'?'':'notifications'))}</span>
 {accountAvatar()}
 <ProfileMenu open={popup==='profile'} Shared={Shared} photo={avatarPhoto} page={page} navigate={nav} onClose={()=>setPopup('')} onLogout={()=>guarded(onLogout)} dark={dark} onTheme={onTheme} onServices={()=>setPopup('services')}/>
 {popup&&popup!=='profile'&&<div className="cab-popover" key={popup}>
 {popup==='notifications'?<><strong>Уведомления</strong><p>Новых уведомлений пока нет</p><button onClick={()=>nav('notifications')}>Все уведомления</button><button onClick={()=>nav('settings')}>Настроить уведомления</button></>:<><strong>Сервисы</strong><button onClick={()=>nav('shop')}>Магазин</button><p>Другие сервисы появятся здесь после подключения.</p></>}
 </div>}
 </>}
 </div>
 </header>
 <main className="cab-main" key={profilePages[page]?'profile':page}>
 <>{profilePages[page]?<Profile photo={avatarPhoto} setPhoto={setAvatarPhoto} Shared={Shared} db={db} initialTab={profileTab} dark={dark} onTheme={onTheme} registerGuard={registerGuard} onTabChange={changeProfileTab} scenario={profileScenario}/>:page==='overview'?<Overview photo={avatarPhoto} key={member} member={member} Shared={Shared} db={db} icon={icon} navigate={nav} scenario={overviewScenario}/>:page==='finances'&&financeIdeas?<FinanceDesignGallery Shared={Shared} db={db} navigate={nav}/>:page==='finances'?<Finance onHistoryCountChange={setFinanceHistoryCount} view={financeView} onViewChange={changeFinanceView} Shared={Shared} db={db} key={financeScenario+'-'+financeMember} scenario={financeScenario} member={financeMember} session={financeSession} setSession={setFinanceSession} navigate={nav} icon={icon} intent={intent}/>:page==='invitations'?<Invitations icon={icon} key={invitationsScenario+'-'+invitationsMember} Shared={Shared} db={db} scenario={invitationsScenario} member={invitationsMember} view={invitationsView} setView={setInvitationsView} session={invitationsSession} setSession={setInvitationsSession} navigate={nav} intent={intent} onShowTree={cell=>{setTreeScenario('ready');setTreeCell('');setTreeMember('partner');setTreeSession(s=>({...s,invitationCell:cell}));nav('genealogy','invitation:'+cell.path);}}/>:page==='participants'?<Participants view={participantsView} setView={setParticipantsView} key={participantsScenario} Shared={Shared} db={db} scenario={participantsScenario} onShowTree={path=>{participantsScroll.current=root.current?.querySelector('.cab-main')?.scrollTop||0;setTreeScenario('ready');setTreeCell('');nav('genealogy','participant:'+path);}}/>:page==='genealogy'?(new URLSearchParams(location.search).has('tree-study')?<TreeDirections photo={avatarPhoto}/>:<GenealogyWorkspace onReturnList={intent.startsWith('invitation:')?()=>nav('invitations'):intent.startsWith('participant:')?()=>nav('participants'):undefined} Shared={Shared} db={db} photo={avatarPhoto} member={treeMember} scenario={treeScenario} navigate={nav} activeCell={treeCell} setActiveCell={setTreeCell} session={treeSession} setSession={setTreeSession} icon={icon}/>):page==='orders'?<Orders Shared={Shared} db={db} key={ordersScenario} scenario={ordersScenario} navigate={nav} sessionOrders={demoOrders}/>:page==='support'&&intent.startsWith('order:')?<OrderSupport Shared={Shared} db={db} orderId={intent.slice(6)} navigate={nav}/>:['checkout','confirmation'].includes(page)?<Checkout Shared={Shared} db={db} lines={cartLines} draft={checkoutDraft} setDraft={setCheckoutDraft} navigate={nav} onConfirm={placeDemoOrder} order={page==='confirmation'?confirmedOrder:null} confirmation={page==='confirmation'} scenario={commerceScenario}/>: (page==='shop'&&['upgrade','packages','activity','renewal','restore'].includes(intent))?<CabinetDestination Shared={Shared} db={db} page={page} intent={intent} navigate={nav}/>:page==='shop'&&!intent?<Storefront Shared={Shared} db={db} onCountChange={setCatalogCount} onAdd={addProduct} onQuantity={onSetQuantity} onRemove={removeProduct} cartLines={cartLines} navigate={nav}/>:<section className="cab-placeholder"><EmptyIllustration kind={page}/><h2>{page==='overview'?'Ваш Бизнес-центр':'Раздел готовится'}</h2><p>{page==='shop'&&intent==='restore'?'Восстановление активности · 240 €':page==='shop'&&intent==='renewal'?'Продление в льготном окне · 240 €':page==='shop'&&intent==='upgrade'?'Апгрейд партнёрского пакета · демонстрация':page==='shop'&&intent==='activity'?'Оплата годовой активности · 120 €':page==='shop'&&intent==='packages'?'Выбор партнёрского пакета':page==='finances'&&intent.startsWith('invitee:')?'Отчёт по приглашённому: '+intent.slice(8):pages[page][2]}</p><span>Содержимое появится в следующих обновлениях.</span>
 {page==='overview'&&<div className="cab-start-links">{['genealogy','profile','orders'].map(key=><button key={key} onClick={()=>nav(key)}>{pages[key][0]} {icon('alt-arrow-right')}</button>)}</div>}
 </section>}</>
 <footer className="cab-footer"><span>© Virena{marketplace?' · Маркетплейс':''}</span>{!marketplace&&<button onClick={()=>nav('support')}>Поддержка</button>}</footer>
 </main>
 </div>

 {cartOpen&&<div className="profile genealogy" style={{display:'contents'}}><CabinetDialog drawer Shared={Shared} db={db} title="Корзина" headerActions={cartLines.length>0?<CabinetButton Shared={Shared} db={db} label="Очистить" tone="Ghost" size="40" onClick={()=>setClearCartOpen(true)}/>:undefined} className="cart-drawer-dialog" notification={commerceToast} onClose={closeCart}><Cart drawer Shared={Shared} db={db} lines={cartLines} scenario={commerceScenario} onRetry={()=>setCommerceScenario('ready')} onQuantity={onSetQuantity} onRemove={removeProduct} onCheckout={()=>{setCheckoutDraft(d=>({...d,step:'details'}));nav('checkout');}} navigate={nav}/></CabinetDialog></div>}
 {clearCartOpen&&<div className="profile genealogy" style={{display:'contents'}}><CabinetDialog Shared={Shared} db={db} title="Очистить корзину?" onClose={()=>setClearCartOpen(false)} footer={<><CabinetButton Shared={Shared} db={db} label="Отмена" onClick={()=>setClearCartOpen(false)}/><CabinetButton Shared={Shared} db={db} label="Очистить" tone="Primary" onClick={()=>{setCartLines([]);setCommerceScenario('ready');setClearCartOpen(false);notifyCommerce('Корзина очищена');}}/></>}><p>Все товары будут удалены из корзины.</p></CabinetDialog></div>}
 {tip&&collapsed&&!mobile&&createPortal(<div id="cab-nav-tooltip" role="tooltip" className="cab-nav-tooltip" style={{left:tip.x,top:tip.y}}>{tip.label}</div>,document.body)}
 </div></>;
}
