import React,{useEffect,useState} from 'react';
import './overview.css';
import profilePhoto from '../../assets/alexandra-avatar.png';
export {profilePhoto};
import mark from '../../assets/virena-mark.svg';
import product from '../../assets/virena-expert-transparent.png';
import networking from '../../assets/networking-group.png';
import './overview-variants.css';
import {IdentityCard,BannerCard,MediaCard} from './Cards.jsx';

// Explicit demo fixture; prices/deadline follow TES-341 and the 02.11 architecture.
export const newcomerDemo={name:'Александра Соколова',id:'VR-100024',days:7,activationWindowDays:7,deadline:'10.11.2026',activityPrice:120};
export const profileInitials=newcomerDemo.name.trim().split(/\s+/).slice(0,2).map(part=>part[0]).join('').toLocaleUpperCase('ru');
export function OverviewCards({Shared,db,icon,navigate,profile='ready',sponsor='ready',retry=()=>{},only,surface,loading=false}){
 const button=(label,action,tone='Outline')=><Shared.Button group={db.components.find(c=>c.name==='Boris / Button')} choice={{Tone:tone,Size:'48'}} label={label} onClick={action}/>;
 const state=(kind,title)=>kind==='loading'?<div className="overview-loading" role="status" aria-label={`Загрузка: ${title}`}><span/><span/><span/></div>:<div className="overview-error" role="status"><h3>Не удалось загрузить {title==='профиль'?'профиль':'спонсора'}</h3><p>Попробуйте ещё раз. Остальные разделы доступны.</p>{button('Повторить',()=>retry(title==='профиль'?'profile':'sponsor'))}</div>;
 const cards={
 profile:<IdentityCard kind="profile" label="Профиль участника" state={profile} fallback={state(profile,'профиль')} surface={surface}>
  <div className="overview-person"><span className="overview-avatar" aria-hidden="true"><img className="overview-profile-photo" src={profilePhoto} alt=""/></span><div><span className="overview-eyebrow">Ваш профиль</span><h2>{newcomerDemo.name}</h2><p>ID {newcomerDemo.id}</p></div><div className="overview-profile-link">{button('Мой профиль',()=>navigate('profile'))}</div></div>
  <dl className="overview-profile-meta"><div><dt>Статус</dt><dd className="overview-status-registered">{icon('Auth / Icon / Success')}<span className="overview-chip">Зарегистрирован</span></dd></div><div><dt>Пакет</dt><dd className="overview-fact-empty">{icon('box')}Без пакета</dd></div><div><dt>Ранг</dt><dd className="overview-fact-empty">{icon('medal-ribbon-star')}Пока нет</dd></div></dl>
 </IdentityCard>,
 sponsor:<IdentityCard kind="sponsor" label="Ваш спонсор" state={sponsor} fallback={state(sponsor,'спонсор')} surface={surface}>
  <div className="overview-person"><span className="overview-avatar overview-company-avatar" aria-hidden="true"><img src={mark} alt=""/></span><div><span className="overview-eyebrow">Ваш спонсор</span><h2>Компания Virena</h2></div></div><p>По вопросам начала работы обратитесь в поддержку.</p><div className="overview-sponsor-action">{button('Связаться с поддержкой',()=>navigate('support'))}</div>
 </IdentityCard>,
 notice:<BannerCard loading={loading} label="Срок первой оплаты" surface={surface} title={`На первый шаг — ${newcomerDemo.days} дней`} description={`Оплатите активность или сделайте покупку до ${newcomerDemo.deadline}, иначе регистрация будет удалена.`} icon={<><svg className="overview-time-ring" viewBox="0 0 64 64"><circle className="time-track" cx="32" cy="32" r="29"/><circle className="time-remaining" cx="32" cy="32" r="29" pathLength="100" strokeDasharray="25 100"/></svg>{icon('calendar')}</>} action={button('Оплатить активность',()=>navigate('shop','activity'),'Primary')}/>,
 package:<BannerCard loading={loading} kind="package" surface={surface} title="Выбрать пакет" description="Посмотрите пакеты и условия участия в партнёрской программе." price="от 369 €" icon={icon('box')} action={button('Посмотреть пакеты',()=>navigate('shop','packages'))}/>,
 product:<MediaCard loading={loading} surface={surface||'soft'} title="Познакомиться с продуктами" description="Выберите продукт для себя. Ваши заказы появятся в разделе «Мои покупки»." src={product} imageFit="bleed" action={button('Перейти в каталог',()=>navigate('shop'))}/>,
 partner:<MediaCard loading={loading} surface={surface} title="Стать партнёром" description="Оплатите годовую активность для участия в партнёрской программе." price={<>120 € <span>/ год</span></>} src={networking} action={button('Оплатить активность',()=>navigate('shop','activity'),'Primary')}/>
 };
 if(only)return cards[only];
 return <><div className="overview-identity">{cards.profile}{cards.sponsor}</div>{cards.notice}<div className="overview-columns"><section className="overview-card overview-start" aria-label="Возможности участия"><div className="overview-options">{cards.package}{cards.product}{cards.partner}</div></section></div></>;
}
export default function Overview({Shared,db,icon,navigate,scenario='ready'}){
 const [profile,setProfile]=useState('loading'),[sponsor,setSponsor]=useState('loading');
 useEffect(()=>{setProfile('loading');setSponsor('loading');if(scenario==='loading')return;const t=setTimeout(()=>{setProfile(scenario==='profile-error'?'error':'ready');setSponsor(scenario==='sponsor-error'?'error':'ready');},550);return()=>clearTimeout(t);},[scenario]);
 const retry=kind=>kind==='profile'?setProfile('ready'):setSponsor('ready');
 return <div className="overview overview-comparison" data-layout="literal" aria-label="Обзор нового пользователя"><OverviewCards {...{Shared,db,icon,navigate,profile,sponsor,retry}} loading={profile==='loading'&&sponsor==='loading'}/></div>;
}
