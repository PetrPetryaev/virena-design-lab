import React,{useEffect,useRef} from 'react';
import {activityLabel,formatPoints,legLabel,participantDetails,genealogyCells} from './genealogyData.js';
import './participant-details.css';

export default function ParticipantDetails({cell,Shared,db,onClose,onNavigate,photo,cells=genealogyCells}){
 const ref=useRef(null),closeRef=useRef(onClose);closeRef.current=onClose;
 const person=participantDetails(cell);
 const sponsor=person.sponsor;
// Active account is path "". Browsing a subtree never changes that boundary.
 const accessibleSponsor=!sponsor?.isCompany && typeof sponsor?.path==='string' && cells.some(c=>c.path===sponsor.path && c.login===sponsor.login);
 useEffect(()=>{
  const dialog=ref.current,previous=document.activeElement;
  dialog.showModal();
  const trap=e=>{
   if(e.key!=='Tab')return;
   const items=[...dialog.querySelectorAll('button:not(:disabled),a[href],[tabindex="0"]')].filter(el=>el.getClientRects().length);
   const first=items[0],last=items.at(-1);
   if((e.shiftKey&&document.activeElement===first)||(!e.shiftKey&&document.activeElement===last)){
    e.preventDefault();(e.shiftKey?last:first)?.focus();
   }
  };
  dialog.addEventListener('keydown',trap);
  const scroller=document.querySelector('.cab-main');
  const overflow=scroller?.style.overflow;
  if(scroller)scroller.style.overflow='hidden';
  return()=>{dialog.removeEventListener('keydown',trap);dialog.close();if(scroller)scroller.style.overflow=overflow; if(previous?.isConnected)previous.focus({preventScroll:true});};
 },[]);
 const Button=({label,onClick,tone='Outline',disabled=false})=><Shared.Button group={db.components.find(c=>c.name==='Boris / Button')} choice={{Tone:tone,Size:'48'}} label={label} onClick={onClick} disabled={disabled}/>;
 const go=path=>{onClose();onNavigate(path);};
 const status={partner:'Партнёр',grace:'Льготное окно',frozen:'Заморожен',client:'Клиент',deactivated:'Неактивна'}[person.state];
 return <dialog ref={ref} className="participant-dialog" aria-labelledby="participant-title" onCancel={e=>{e.preventDefault();closeRef.current();}} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)onClose();}}}>
  <div className="participant-heading"><div className="participant-identity"><span className="genealogy-avatar" aria-hidden="true">{photo?(typeof photo==='string'?<img src={photo} alt=""/>:<span className="genealogy-photo" style={{backgroundImage:`url(${photo.src})`,backgroundSize:photo.size,backgroundPosition:photo.position}}/>):person.name?person.name.split(' ').map(n=>n[0]).slice(0,2).join(''):person.login.slice(0,2).toUpperCase()}</span><div><p>Подробная информация</p><h2 id="participant-title">{person.name||person.login}</h2>{person.name&&<span>{person.login}</span>}</div></div><Shared.Button group={db.components.find(c=>c.name==='Boris / Icon button')} choice={{Tone:'Ghost',Size:'40'}} ariaLabel="Закрыть информацию об участнике" iconContent={<Shared.Icon name="Cross"/>} onClick={onClose}/></div>
  <div className="participant-scroll" tabIndex={0} role="region" aria-label="Сведения и контакты участника">
   <div className="participant-badges"><span>{status}</span><span>{person.pack||'Без пакета'}</span>{person.own?<span>Вы</span>:person.personal?<span>Лично приглашённый</span>:null}</div>
   <p className="participant-activity">{activityLabel(person)}</p>
   <dl className="participant-facts">
    <div><dt>Ранг</dt><dd aria-label={`Ранг: ${person.rank}`}>{person.rank?'★'.repeat(person.rank):'Ранга нет'}</dd></div>
    <div><dt>Закрыто шагов</dt><dd>{person.steps}</dd></div>
    <div><dt>Спонсор</dt><dd>{sponsor.login}</dd></div>
    <div><dt>Место в структуре</dt><dd>{legLabel(person.path)}{person.path&&` · уровень ${person.path.length} от вас`}</dd></div>
    <div><dt>Дата регистрации</dt><dd>{person.registeredAt}</dd></div>
    <div><dt>В структуре с</dt><dd>{person.placedAt}</dd></div>
    {person.location&&<div><dt>Страна и город</dt><dd>{person.location}</dd></div>}
   </dl>
   <section className="participant-legs" aria-label="Ноги участника">{['Левая нога','Правая нога'].map((name,i)=><div key={name}><h3>{name}</h3><strong>{formatPoints(person.points[i])}</strong><span>баллов</span><p>Участников: {person.counts[i]}</p></div>)}</section>
   <section className="participant-contacts"><h3>Контакты</h3>
    {person.contacts?<><p className="participant-note">Вы видите контакты как спонсор участника</p><dl className="participant-facts">
     <div><dt>Email</dt><dd>{person.contacts.email}</dd></div><div><dt>Телефон</dt><dd>{person.contacts.phone||'Не указан'}</dd></div><div><dt>Мессенджер</dt><dd>{person.contacts.messenger||'Не указан'}</dd></div><div><dt>Язык общения</dt><dd>{person.contacts.language}</dd></div><div><dt>День рождения</dt><dd>{person.contacts.birthday}</dd></div>
    </dl><div title="Участник не указал мессенджер"><Button label="Написать" disabled/></div><p className="participant-note">Участник не указал мессенджер</p></>:person.own?<p className="participant-note">Ваши контакты доступны в разделе «Мой профиль»</p>:<><p className="participant-note">Контакты видит спонсор участника: {sponsor.login}</p>{accessibleSponsor?<Button label="Открыть спонсора в дереве" onClick={()=>go(sponsor.path)}/>:<p className="participant-note">Спонсор находится вне вашей структуры</p>}</>}
   </section>
  </div>
  <div className="participant-actions"><Button label="Показать в дереве" tone="Primary" onClick={()=>go(person.path)}/></div>
 </dialog>;
}
