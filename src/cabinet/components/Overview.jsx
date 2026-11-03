import {TimeRing} from './TimeRing.jsx';
import React,{useEffect,useState,useRef} from 'react';
import {createPortal} from 'react-dom';
import './overview.css';
import {memberStates} from './memberStates.js';
import {PartnerDashboard,PartnershipDetails} from './PartnerDashboard.jsx';
import profilePhoto from '../../assets/alexandra-avatar.png';
export {profilePhoto};
import mark from '../../assets/virena-mark.svg';
import product from '../../assets/virena-expert-transparent.png';
import networking from '../../assets/networking-group.png';
import './overview-variants.css';
import {IdentityCard,BannerCard,MediaCard} from './Cards.jsx';
import './overview-refinements.css';

// Explicit demo fixture; prices/deadline follow TES-341 and the 02.11 architecture.
export const newcomerDemo={name:'Александра Соколова',id:'VR-100024',days:7,activationWindowDays:7,deadline:'10.11.2026',activityPrice:120};
export const profileInitials=newcomerDemo.name.trim().split(/\s+/).slice(0,2).map(part=>part[0]).join('').toLocaleUpperCase('ru');
export function OverviewCards({Shared,db,icon,navigate,profile='ready',sponsor='ready',retry=()=>{},only,surface,loading=false,member='newcomer'}){
 const model=memberStates[member]||memberStates.newcomer;
 const client=member==='client'||model.deactivated;
 const [details,setDetails]=useState(false);
 const [copyStatus,setCopyStatus]=useState('');
 const copyTimer=useRef();
 useEffect(()=>()=>clearTimeout(copyTimer.current),[]);
 const copyId=async()=>{try{await navigator.clipboard.writeText(newcomerDemo.id);setCopyStatus('ID скопирован');}catch{setCopyStatus('Не удалось скопировать ID');}clearTimeout(copyTimer.current);copyTimer.current=setTimeout(()=>setCopyStatus(''),2500);};
 const button=(label,action,tone='Outline')=><Shared.Button group={db.components.find(c=>c.name==='Boris / Button')} choice={{Tone:tone,Size:'48'}} label={label} onClick={action}/>;
 const state=(kind,title)=>kind==='loading'?<div className="overview-loading" role="status" aria-label={`Загрузка: ${title}`}><span/><span/><span/></div>:<div className="overview-error" role="status"><h3>Не удалось загрузить {title==='профиль'?'профиль':'спонсора'}</h3><p>Попробуйте ещё раз. Остальные разделы доступны.</p>{button('Повторить',()=>retry(title==='профиль'?'profile':'sponsor'))}</div>;
 const cards={
 profile:<IdentityCard kind="profile" label="Профиль участника" state={profile} fallback={state(profile,'профиль')} surface={surface}>
  <div className="overview-person"><span className="overview-avatar" aria-hidden="true"><img className="overview-profile-photo" src={profilePhoto} alt=""/></span><div><span className="overview-eyebrow">Ваш профиль</span><h2>{newcomerDemo.name}</h2></div><div className="overview-profile-link"><span className="overview-copy-id"><Shared.Button group={db.components.find(c=>c.name==='Boris / Button')} choice={{Tone:'Soft',Size:'48'}} label={newcomerDemo.id} ariaLabel="Скопировать ID" onClick={copyId} iconContent={icon(copyStatus==='ID скопирован'?'Auth / Icon / Success':'copy')}/>{copyStatus&&createPortal(<div className="auth-toast" role="status">{copyStatus==='ID скопирован'&&<Shared.Icon name="Auth / Icon / Success"/>}{copyStatus}</div>,document.body)}</span>{button('Мой профиль',()=>navigate('profile'))}</div></div>
  <dl className="overview-profile-meta"><div><dt>{icon('Auth / Icon / Success')}Статус</dt><dd className={`overview-status-registered${model.locked?' is-frozen':''}`}><span className="overview-chip">{model.status}</span>{model.partner&&<span className="overview-status-term">{member==='frozen'?'с 02.11.2026':member==='grace'?'· осталось 2 дня':'до 03.11.2027'}</span>}</dd></div><div><dt>{icon('box')}Пакет</dt><dd className="overview-fact-empty">{model.package||'Без пакета'}</dd></div><div><dt>{icon('medal-ribbon-star')}Ранг</dt><dd className="overview-fact-empty">Пока нет</dd></div></dl>

 </IdentityCard>,
 sponsor:<IdentityCard kind="sponsor" label="Ваш спонсор" state={sponsor} fallback={state(sponsor,'спонсор')} surface={surface}>
  <div className="overview-person"><span className="overview-avatar overview-company-avatar" aria-hidden="true"><img src={mark} alt=""/></span><div><span className="overview-eyebrow">Ваш спонсор</span><h2>Компания Virena</h2></div></div><p>По вопросам начала работы обратитесь в поддержку.</p><div className="overview-sponsor-action">{button('Связаться с поддержкой',()=>navigate('support'))}</div>
 </IdentityCard>,
 notice:<BannerCard attention loading={loading} label="Срок первой оплаты" surface={surface} title={`На первый шаг — ${newcomerDemo.days} дней`} description={`Оплатите активность или сделайте покупку до ${newcomerDemo.deadline}, иначе регистрация будет удалена.`} icon={<><TimeRing days={newcomerDemo.days}/>{icon('calendar')}</>} action={button('Оплатить активность',()=>navigate('shop','activity'),'Primary')}/>,
 package:<BannerCard loading={loading} kind="package" surface={surface} title="Выбрать пакет" description="Посмотрите пакеты и условия участия в партнёрской программе." price="от 369 €" icon={icon('box')} action={button('Посмотреть пакеты',()=>navigate('shop','packages'))}/>,
 product:<MediaCard loading={loading} surface={surface||'soft'} title={client?'Каталог продуктов':'Познакомиться с продуктами'} description={client?'Выберите продукты для следующего заказа.':'Выберите продукт для себя. Ваши заказы появятся в разделе «Мои покупки».'} src={product} imageFit="bleed" action={button('Перейти в каталог',()=>navigate('shop'))}/>,
 partner:<MediaCard loading={loading} surface={surface||'soft'} title="Стать партнёром" description="Оплатите годовую активность для участия в партнёрской программе." price={<>120 € <span>/ год</span></>} src={networking} action={button('Оплатить активность',()=>navigate('shop','activity'),'Primary')}/>
 };
 if(only)return cards[only];
 if(model.partner)return <><PartnerDashboard identity={<div className="overview-identity">{cards.profile}{cards.sponsor}</div>} {...{member,model,loading,icon,button,navigate}} partnerCard={<MediaCard loading={loading} title="Ваше партнёрство" description={model.locked?'Начисления и приглашения приостановлены. Посмотрите условия восстановления.':'Активность, пакет и возможности развития вашей структуры.'} src={networking} action={button('Подробнее о партнёрстве',()=>setDetails(true))}/>} productCard={cards.product}/>{details&&<PartnershipDetails {...{member,model,button,navigate}} close={()=>setDetails(false)}/>}</>;
 if(client)return <><div className="overview-identity">{cards.profile}{cards.sponsor}</div>
  <BannerCard loading={loading} kind="package" label="Мои заказы" title="Мои заказы" description={<>1 оплаченный заказ · <strong className="overview-order-total">693,00 €</strong></>} icon={icon('Orders')} action={button('Посмотреть заказы',()=>navigate('orders'))}/>
  {model.deactivated?<BannerCard loading={loading} kind="package" surface="white" title="Партнёрство завершено" description="Деактивация: 02.11.2026. Повторное участие возможно только через новую регистрацию." icon={icon('calendar')} action={button('Уточнить условия',()=>navigate('support'))}/>:<BannerCard loading={loading} kind="package" surface="white" label="Пакет после активации" title="Ваши покупки — будущий пакет" description="Сумма покупок: 693,00 €. При оплате активности вы получите пакет «Стандарт»." icon={icon('box')} action={button('Стать партнёром',()=>navigate('shop','activity'),'Primary')}/>}
  <div className="overview-columns overview-client-actions"><section className="overview-card overview-start" aria-label="Возможности клиента"><div className="overview-options">{cards.product}{model.deactivated?<MediaCard loading={loading} title="Ваше партнёрство завершено" description="Покупки остаются доступны. По вопросам повторной регистрации обратитесь в поддержку." src={networking} surface="soft" action={button('Связаться с поддержкой',()=>navigate('support'))}/>:cards.partner}</div></section></div>
 </>;

 return <>{cards.notice}<div className="overview-identity">{cards.profile}{cards.sponsor}</div><div className="overview-columns"><section className="overview-card overview-start" aria-label="Возможности участия"><div className="overview-options">{cards.package}{cards.product}{model.deactivated?<MediaCard loading={loading} title="Ваше партнёрство завершено" description="Покупки остаются доступны. По вопросам повторной регистрации обратитесь в поддержку." src={networking} surface="soft" action={button('Связаться с поддержкой',()=>navigate('support'))}/>:cards.partner}</div></section></div></>;
}
export default function Overview({Shared,db,icon,navigate,scenario='ready',member='newcomer'}){
 const [profile,setProfile]=useState('loading'),[sponsor,setSponsor]=useState('loading');
 useEffect(()=>{setProfile('loading');setSponsor('loading');if(scenario==='loading')return;const t=setTimeout(()=>{setProfile(scenario==='profile-error'?'error':'ready');setSponsor(scenario==='sponsor-error'?'error':'ready');},550);return()=>clearTimeout(t);},[scenario]);
 const retry=kind=>kind==='profile'?setProfile('ready'):setSponsor('ready');
 return <div className="overview overview-comparison" data-layout="literal" aria-label={member==='client'?'Обзор клиента':member==='newcomer'?'Обзор нового пользователя':`Обзор: ${memberStates[member]?.label}`}><OverviewCards {...{Shared,db,icon,navigate,profile,sponsor,retry,member}} loading={profile==='loading'&&sponsor==='loading'}/></div>;
}
