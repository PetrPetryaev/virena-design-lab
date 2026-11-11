import {TimeRing} from './TimeRing.jsx';
import React,{useEffect,useState,useRef} from 'react';
import {createPortal} from 'react-dom';
import './overview.css';
import {memberStates} from './memberStates.js';
import {PartnerDashboard} from './PartnerDashboard.jsx';
import profilePhoto from '../../assets/alexandra-avatar.png';
export {profilePhoto};
import {genealogyCells} from './genealogyData.js';
import AchievementBadge from './AchievementBadge.jsx';
import {stateImages} from './achievementAssets.js';
import networking from '../../assets/networking-group.png';
import './overview-variants.css';
import {IdentityCard,BannerCard,MediaCard} from './Cards.jsx';
import './overview-refinements.css';

// Explicit demo fixture; prices/deadline follow TES-341 and the 02.11 architecture.
export const newcomerDemo={name:'Александра Соколова',id:'VR-100024',days:7,activationWindowDays:7,deadline:'10.11.2026',activityPrice:120};
export const profileInitials=newcomerDemo.name.trim().split(/\s+/).slice(0,2).map(part=>part[0]).join('').toLocaleUpperCase('ru');
export function OverviewCards({Shared,db,icon,navigate,profile='ready',sponsor='ready',retry=()=>{},only,surface,loading=false,member='newcomer',photo=profilePhoto,placementSide='L',onPlacementChange}){
 const model=memberStates[member]||memberStates.newcomer;
 const client=member==='client'||model.deactivated;
 const [copyStatus,setCopyStatus]=useState('');
 const copyTimer=useRef();
 useEffect(()=>()=>clearTimeout(copyTimer.current),[]);
 const copyId=async()=>{try{await navigator.clipboard.writeText(newcomerDemo.id);setCopyStatus('ID скопирован');}catch{setCopyStatus('Не удалось скопировать ID');}clearTimeout(copyTimer.current);copyTimer.current=setTimeout(()=>setCopyStatus(''),2500);};
 const button=(label,action,tone='Soft')=><Shared.Button group={db.components.find(c=>c.name==='Boris / Button')} choice={{Tone:tone,Size:'48'}} label={label} onClick={action}/>;
 const state=(kind,title)=>kind==='loading'?<div className="overview-loading" role="status" aria-label={`Загрузка: ${title}`}><span/><span/><span/></div>:<div className="overview-error" role="status"><h3>Не удалось загрузить {title==='профиль'?'профиль':'спонсора'}</h3><p>Попробуйте ещё раз. Остальные разделы доступны.</p>{button('Повторить',()=>retry(title==='профиль'?'profile':'sponsor'))}</div>;
 const cards={
 profile:<IdentityCard kind="profile" label="Профиль участника" state={profile} fallback={state(profile,'профиль')} surface={surface}>
  {model.partner?<div className="pd-identity-row"><span className="overview-avatar" aria-hidden="true">{photo?<img className="overview-profile-photo" src={photo} alt=""/>:profileInitials}</span><div className="pd-identity-heading"><strong>{newcomerDemo.name}</strong><span className="overview-chip">{model.status}</span></div><p className="pd-activity">{member==='frozen'?'Заморожена с 02.11.2026':member==='grace'?'Льготное окно · осталось 2 дня':'Оплачена до 03.11.2027'}</p><div className="pd-identity-actions">{button('Профиль',()=>navigate('profile'),'Primary')}<Shared.Button group={db.components.find(c=>c.name==='Boris / Button')} choice={{Tone:'Soft',Size:'48'}} label={newcomerDemo.id} ariaLabel="Скопировать ID" onClick={copyId} iconContent={icon('copy')}/></div>{copyStatus&&createPortal(<div className="auth-toast" role="status">{copyStatus}</div>,document.body)}</div>:<div className="overview-person"><span className="overview-avatar" aria-hidden="true">{photo?<img className="overview-profile-photo" src={photo} alt=""/>:profileInitials}</span><div><span className="overview-eyebrow">Ваш профиль {model.partner&&<span className="pd-inline-state"><span className="overview-chip">{model.status}</span><AchievementBadge src={stateImages[member]} alt=""/></span>}</span><h2>{newcomerDemo.name}</h2></div><div className="overview-profile-link"><span className="overview-copy-id"><Shared.Button group={db.components.find(c=>c.name==='Boris / Button')} choice={{Tone:'Soft',Size:'48'}} label={newcomerDemo.id} ariaLabel="Скопировать ID" onClick={copyId} iconContent={icon(copyStatus==='ID скопирован'?'Auth / Icon / Success':'copy')}/>{copyStatus&&createPortal(<div className="auth-toast" role="status">{copyStatus==='ID скопирован'&&<Shared.Icon name="Auth / Icon / Success"/>}{copyStatus}</div>,document.body)}</span>{button('Мой профиль',()=>navigate('profile'))}</div></div>}
  {!model.partner&&<dl className="overview-profile-meta"><div><dt>{icon('Auth / Icon / Success')}Состояние</dt><dd className={`overview-status-registered${model.locked?' is-frozen':''}`}><span className="overview-chip">{model.status}</span><AchievementBadge src={stateImages[member]} alt=""/></dd></div><div><dt>{icon('box')}Пакет</dt><dd className="overview-fact-empty">{model.package||'Без пакета'}</dd></div><div><dt>Ранг</dt><dd className="overview-fact-empty">{model.partner?<span className="pd-profile-rank" aria-label={`Ранг: ${model.package?genealogyCells[0].rank:0} из 9 звёзд`}>{Array.from({length:9},(_,i)=><span key={i} className={model.package&&i<genealogyCells[0].rank?"is-earned":""}>★</span>)}</span>:"Пока нет"}</dd></div></dl>}


 </IdentityCard>,
 sponsor:<IdentityCard kind="sponsor" label="Ваш спонсор" state={sponsor} fallback={state(sponsor,'спонсор')} surface={surface}>
  <div className="overview-person"><span className="overview-avatar" aria-hidden="true" style={{backgroundImage:`url(${genealogyCells[1].photo.src})`,backgroundSize:genealogyCells[1].photo.size,backgroundPosition:genealogyCells[1].photo.position}}/><div><span className="overview-eyebrow">Ваш спонсор</span><h2>Мария Крылова</h2></div></div><div className="overview-sponsor-action">{button('Поддержка',()=>navigate('support'))}</div>
 </IdentityCard>,
 notice:<BannerCard attention loading={loading} label="Срок первой оплаты" surface={surface} title={`На первый шаг — ${newcomerDemo.days} дней`} description={`Оплатите активность или сделайте покупку до ${newcomerDemo.deadline}, иначе регистрация будет удалена.`} icon={<><TimeRing days={newcomerDemo.days}/>{icon('calendar')}</>} action={button('Оплатить активность',()=>navigate('shop','activity'),'White')}/>,
 package:<BannerCard loading={loading} kind="package" surface={surface} title="Выбрать пакет" description="Посмотрите пакеты и условия участия в партнёрской программе." price="от 369 €" icon={icon('box')} action={button('Выбрать пакет',()=>navigate('shop','packages'))}/>,
 product:<article className={`overview-option overview-product overview-product-scene card-clickable${loading?' card-loading':''}`} aria-busy={loading} inert={loading?true:undefined}><img className="overview-product-scene-image" src={new URL(`../../assets/overview-banner/blue-room-${new URLSearchParams(window.location.search).get('overviewBanner')==='a'?'a':'b'}.png`,import.meta.url).href} alt=""/><div className="overview-product-content"><div className="banner-copy"><h3>{client?'Каталог продуктов':'Познакомиться с продуктами'}</h3><p>{client?'Выберите продукты для следующего заказа.':'Выберите продукт для себя.'}</p></div>{button('Перейти в каталог',()=>navigate('shop'),'White')}</div></article>,
 partner:<MediaCard loading={loading} surface={surface||'soft'} title="Стать партнёром" description="Оплатите годовую активность для участия в партнёрской программе." price={<>120 € <span>/ год</span></>} src={networking} action={button('Оплатить активность',()=>navigate('shop','activity'),'White')}/>
 };
 if(only)return cards[only];
 if(model.partner)return <PartnerDashboard {...{member,model,loading,icon,button,navigate,placementSide,onPlacementChange,Shared,db}} profileCard={cards.profile} sponsorCard={cards.sponsor} productCard={cards.product}/>;
 if(client)return <><div className="overview-identity">{cards.profile}{cards.sponsor}</div>
  <BannerCard loading={loading} kind="package" label="Мои заказы" title="Мои заказы" description={<>1 оплаченный заказ · <strong className="overview-order-total">693,00 €</strong></>} icon={icon('Orders')} action={button('Посмотреть заказы',()=>navigate('orders'))}/>
  {model.deactivated?<BannerCard loading={loading} kind="package" surface="white" title="Партнёрство завершено" description="Деактивация: 02.11.2026. Повторное участие возможно только через новую регистрацию." icon={<Shared.Icon name="user-cross-linear"/>} action={button('Уточнить условия',()=>navigate('support'))}/>:<BannerCard loading={loading} kind="package" surface="white" label="Пакет после активации" title="Ваши покупки — будущий пакет" description="Сумма покупок: 693,00 €. При оплате активности вы получите пакет «Стандарт»." icon={icon('box')} action={button('Стать партнёром',()=>navigate('shop','activity'),'Primary')}/>}
  <div className={`overview-columns overview-client-actions${model.deactivated?' deactivation-content':''}`}><section className="overview-card overview-start" aria-label="Возможности клиента"><div className="overview-options">{cards.product}{model.deactivated?<MediaCard loading={loading} title="Ваше партнёрство завершено" description="Покупки остаются доступны. По вопросам повторной регистрации обратитесь в поддержку." src={networking} surface="soft" action={button('Связаться с поддержкой',()=>navigate('support'))}/>:cards.partner}</div></section></div>
 </>;

 return <>{cards.notice}<div className="overview-identity">{cards.profile}{cards.sponsor}</div><div className="overview-columns"><section className="overview-card overview-start" aria-label="Возможности участия"><div className="overview-options">{cards.package}{cards.product}{model.deactivated?<MediaCard loading={loading} title="Ваше партнёрство завершено" description="Покупки остаются доступны. По вопросам повторной регистрации обратитесь в поддержку." src={networking} surface="soft" action={button('Связаться с поддержкой',()=>navigate('support'))}/>:cards.partner}</div></section></div></>;
}
export default function Overview({Shared,db,icon,navigate,scenario='ready',member='newcomer',photo=profilePhoto,placementSide='L',onPlacementChange}){
 const [profile,setProfile]=useState('loading'),[sponsor,setSponsor]=useState('loading');
 useEffect(()=>{setProfile('loading');setSponsor('loading');if(scenario==='loading')return;const t=setTimeout(()=>{setProfile(scenario==='profile-error'?'error':'ready');setSponsor(scenario==='sponsor-error'?'error':'ready');},550);return()=>clearTimeout(t);},[scenario]);
 const retry=kind=>kind==='profile'?setProfile('ready'):setSponsor('ready');
 return <div className="overview overview-comparison overview-framed-profile" data-layout="literal" data-member={member} aria-label={member==='client'?'Обзор клиента':member==='newcomer'?'Обзор нового пользователя':`Обзор: ${memberStates[member]?.label}`}><OverviewCards {...{Shared,db,icon,navigate,profile,sponsor,retry,member,photo,placementSide,onPlacementChange}} loading={profile==='loading'&&sponsor==='loading'}/></div>;
}
