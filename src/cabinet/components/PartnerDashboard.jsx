import dismissOnBackdrop from './dismissOnBackdrop.js';
import Button from './CabinetButton.jsx';
import {TimeRing} from './TimeRing.jsx';
import React,{useEffect,useRef} from 'react';
import {BannerCard} from './Cards.jsx';
import './partner-dashboard.css';

const activity = member => member==='frozen' ? 'Заморожена с 02.11.2026' : member==='grace' ? 'Льготное окно · осталось 2 дня' : 'Активна до 03.11.2027';
function BusinessCard({title,value,summary,icon,action,loading,children,metric,onNavigate,chevron}){
 const Tag=metric?'a':'section';
 return <Tag href={metric?onNavigate.href:undefined} onClick={metric?e=>{e.preventDefault();onNavigate.go();}:undefined} className={`partner-stat${metric?' partner-stat-link':action?' card-clickable':''}${loading?' card-loading':''}`} aria-label={title} aria-busy={loading} inert={loading?true:undefined} data-surface="white">
  <div className="partner-stat-copy"><div className="partner-stat-title">{icon}<h3>{title}</h3></div>
  {value&&<div className="partner-stat-value-row"><strong className="partner-stat-value">{value}</strong>{metric&&<span className="partner-stat-chevron" aria-hidden="true">{chevron}</span>}</div>}
  <p>{summary}</p>{children&&<div className="partner-stat-facts">{children}</div>}
  </div>{!metric&&action&&<div className="partner-stat-action">{action}</div>}
 </Tag>;
}
export function PartnerDashboard({member,model,loading,icon,button,navigate,partnerCard,productCard,identity}){
 const noPackage=!model.package, frozen=model.locked;
 const notice=member==='grace'?{title:'Продлите активность — осталось 2 дня',text:'Годовая активность завершилась. В льготном окне партнёрство ещё активно.',cta:'Продлить за 240 €',intent:'renewal'}:frozen?{title:'Партнёрство заморожено',text:'Баллы в ногах сгорели. Начисления, вывод и приглашения остановлены. Срок до деактивации уточняется в данных аккаунта.',cta:'Восстановить за 240 €',intent:'restore'}:noPackage?{title:'Выберите пакет для начислений',text:'Годовая активность оплачена, но без пакета начисления не идут.',cta:'Выбрать пакет',intent:'packages'}:null;
 const summaries={
  'Финансы':frozen?'Вывод приостановлен':'Доступно к выводу',
  'Бинар':frozen?'Баллы сгорели':noPackage?'Нужен пакет для начислений':'Циклы вашей команды',
  'Карьера':frozen?'Развитие приостановлено':noPackage?'Начните с выбора пакета':'Первый ориентир — 1 цикл',
  'Ваш пакет':frozen?'Повышение доступно после восстановления':noPackage?'Пакеты от 369 €':'До пакета «Профи» — 407 €',
  'Годовой бонус':frozen?'Бонус сгорел':'С начала года активности',
  'Моя команда':'В вашей структуре',
  'Приглашения':frozen?'Доступны после восстановления активности':'Отправьте личное приглашение',
  'Последние события':'Начисления и изменения команды',
 };
 const destinations={'Финансы':'finances','Бинар':'genealogy','Годовой бонус':'finances','Моя команда':'participants'};
 const tile=(title,value,description,glyph,action,children)=>{const page=destinations[title];return <BusinessCard {...{title,value,loading,action}} metric={!!page} onNavigate={page?{href:`?tab=cabinet&page=${page}&member=${member}`,go:()=>navigate(page)}:undefined} chevron={icon('alt-arrow-right')} summary={summaries[title]} icon={icon(glyph)}>{page?children:title==='Ваш пакет'?children:null}</BusinessCard>};
 return <div className="partner-dashboard" data-member={member}>
 {notice&&<BannerCard attention loading={loading} title={notice.title} description={notice.text} icon={<>{member==='grace'&&<TimeRing days={2}/>} {icon(frozen?'snowflake':noPackage?'box':'calendar')}</>} action={button(notice.cta,()=>navigate('shop',notice.intent),'Primary')}/>}
 {identity}
 <div className="partner-metric-strip" aria-label="Ключевые показатели">
 {tile('Финансы','0,00 €',null,'wallet')}
 {tile('Бинар','0 циклов',null,'Branch')}
 {tile('Годовой бонус','0,00 €',frozen?'Накопленный бонус сгорел при заморозке.':'Накоплений пока нет. Расчётный год начинается с оплаты активности.','calendar',button('Открыть финансы',()=>navigate('finances')))}
 {tile('Моя команда','0 участников','Здесь появятся участники вашей структуры и те, кому нужно внимание.','Users',button('Открыть участников',()=>navigate('participants')))}
 </div>
 <div className="partner-workspace">
 <div className="partner-media-grid">{productCard}{partnerCard}</div>
 <div className="partner-business-grid" aria-label="Развитие и события">
 {tile('Ваш пакет',frozen?'Пакет сохранён':noPackage?'Выберите первый пакет':'Повысить пакет',frozen?'Апгрейд недоступен во время заморозки.':noPackage?'Пороги пакетов: 369 / 693 / 1 100 / 3 000 / 6 000 €.':'До пакета «Профи» — 407 €. Окно апгрейда отсчитывается от покупки пакета.','box',frozen?null:button(noPackage?'Выбрать пакет':'Посмотреть апгрейд',()=>navigate('shop',noPackage?'packages':'upgrade'),'Primary'))}
 {tile('Карьера',frozen?'Карьера на паузе':noPackage?'Ранг пока недоступен':'До первого ранга',noPackage?'Начните с выбора пакета.':frozen?'Развитие приостановлено до восстановления активности.':'Первый ориентир — один бинарный цикл. Ранг обновится после расчёта.','medal-ribbon-star',button('Условия рангов',()=>navigate('knowledge')),<p>9 ступеней: 1, 15, 30, 60, 150, 300, 600, 1 500 и 3 000 циклов. Дополнительные условия и сроки берутся из маркетинг-плана.</p>)}
 {tile('Приглашения',frozen?'Приглашения на паузе':'Развивайте команду',frozen?'Реферальные ссылки приостановлены на время заморозки.':'Приглашайте людей в свою команду. Личные приглашения доступны в отдельном разделе.','plane-3-linear',frozen?null:button('Пригласить',()=>navigate('invitations')))}
 {tile('Последние события','Пока без обновлений','Пока нет событий. Здесь появятся начисления, изменения команды и новые достижения.','clock-circle',button('Все события',()=>navigate('notifications')))}
 </div></div></div>;

}
export function PartnershipDetails({Shared,db,member,model,button,navigate,close}){
 const dialog=useRef(null);
 useEffect(()=>{const el=dialog.current;el.showModal();return()=>el.close();},[]);
 const go=(page,intent)=>{close();navigate(page,intent);};
 return <dialog ref={dialog} className="partnership-dialog" aria-labelledby="partnership-title" onCancel={close} onClick={e=>dismissOnBackdrop(e,close)}><div className="partnership-dialog-head"><h2 id="partnership-title">Ваше партнёрство</h2><Button Shared={Shared} db={db} label="Закрыть" icon="Cross" tone="Ghost" size="40" onClick={close}/></div><p>Демонстрационные данные участника</p><dl><div><dt>Активность</dt><dd>{activity(member)}</dd></div><div><dt>Пакет</dt><dd>{model.package||'Не выбран'}</dd></div><div><dt>Ранг</dt><dd>Пока нет</dd></div></dl><p>{model.locked?'Начисления, вывод и приглашения недоступны. Для восстановления требуется оплата 240 €.':member==='grace'?'Продление в льготном окне стоит 240 €. После его окончания партнёрство замораживается.':!model.package?'Активность оплачена. Выберите пакет, чтобы начать получать начисления.':'Управляйте пакетом и развивайте свою структуру. Продление активности до окончания срока стоит 120 €.'}</p><div className="partnership-dialog-actions">{model.locked?button('Восстановить за 240 €',()=>go('shop','restore'),'Primary'):member==='grace'?button('Продлить за 240 €',()=>go('shop','renewal'),'Primary'):button(model.package?'Посмотреть пакет':'Выбрать пакет',()=>go('shop','packages'))}{button('Моя структура',()=>go('genealogy'))}</div></dialog>;
}
