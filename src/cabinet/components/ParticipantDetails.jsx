import React from 'react';
import CabinetDialog from './CabinetDialog.jsx';
import {activityLabel,formatPoints,legLabel,participantDetails,genealogyCells} from './genealogyData.js';
import './participant-details.css';
import {MemberRegistration,MemberTeam} from './MemberDirectoryFacts.jsx';
import MemberAvatar from './MemberAvatar.jsx';
import MemberRank from './MemberRank.jsx';
import MemberStatus from './MemberStatus.jsx';

export default function ParticipantDetails({cell,Shared,db,onClose,onNavigate,photo,cells=genealogyCells}){
 const person=participantDetails(cell);
 const sponsor=person.sponsor;
// Active account is path "". Browsing a subtree never changes that boundary.
 const accessibleSponsor=!sponsor?.isCompany && typeof sponsor?.path==='string' && cells.some(c=>c.path===sponsor.path && c.login===sponsor.login);
 const Button=({label,onClick,tone='Soft',disabled=false,icon})=><Shared.Button group={db.components.find(c=>c.name==='Boris / Button')} choice={{Tone:tone,Size:'48'}} label={label} onClick={onClick} disabled={disabled} iconContent={icon?<Shared.Icon name={icon}/>:undefined}/>;
 const go=path=>{onClose();onNavigate(path);};
 return <CabinetDialog drawer {...{Shared,db,onClose}} scrollLabel="Сведения и контакты участника" closeLabel="Закрыть информацию об участнике" headerContent={titleId=><div className="participant-identity"><MemberAvatar cell={{...person,personal:person.personal||person.own}} photo={photo} Shared={Shared} size={48}/><div><p>Подробная информация</p><h2 id={titleId}>{person.name||person.login}</h2>{person.name&&<span>{person.login}</span>}</div></div>} footer={<Button label="Показать в дереве" tone="Soft" icon="Virena / Navigation icon / Branch" onClick={()=>go(person.path)}/> }>
   <div className="participant-badges"><MemberStatus state={person.state} Shared={Shared}/>{person.new&&<Shared.Status tone="Info" label="Новый"/>}<span>{person.pack||'Без пакета'}</span>{person.own?<span>Вы</span>:person.personal?<span>Лично приглашённый</span>:null}</div>
   <p className="participant-activity">{activityLabel(person)}</p>
   <dl className="participant-facts">
    <div><dt>Ранг</dt><dd><MemberRank rank={person.rank}/></dd></div>
    <div><dt>Закрыто шагов</dt><dd>{person.steps}</dd></div>
    <div><dt>Спонсор</dt><dd>{sponsor.login}</dd></div>
    <div><dt>Место в структуре</dt><dd>{legLabel(person.path)}{person.path&&` · уровень ${person.path.length} от вас`}</dd></div>
    <div><dt>Регистрация · вход</dt><dd><MemberRegistration cell={person}/></dd></div><div><dt>Команда и ВЗР</dt><dd><MemberTeam cell={person}/></dd></div>
    <div><dt>В структуре с</dt><dd>{person.placedAt}</dd></div>
    {person.location&&<div><dt>Страна и город</dt><dd>{person.location}</dd></div>}
   </dl>
   <section className="participant-legs" aria-label="Ноги участника">{['Левая нога','Правая нога'].map((name,i)=><div key={name}><h3>{name}</h3><strong>{formatPoints(person.points[i])}</strong><span>баллов</span><p>Участников: {person.counts[i]}</p></div>)}</section>
   <section className="drawer-section participant-contacts"><h3>Контакты</h3>
    {person.contacts?<><p className="participant-note">Вы видите контакты как спонсор участника</p><dl className="participant-facts">
     <div><dt>Email</dt><dd>{person.contacts.email}</dd></div><div><dt>Телефон</dt><dd>{person.contacts.phone||'Не указан'}</dd></div><div><dt>Мессенджер</dt><dd>{person.contacts.messenger||'Не указан'}</dd></div><div><dt>Язык общения</dt><dd>{person.contacts.language}</dd></div><div><dt>День рождения</dt><dd>{person.contacts.birthday}</dd></div>
    </dl><p className="participant-note">Связаться с участником можно по указанным контактам.</p></>:person.own?<p className="participant-note">Ваши контакты доступны в разделе «Мой профиль»</p>:<><p className="participant-note">Контакты видит спонсор участника: {sponsor.login}</p>{accessibleSponsor?<Button label="Открыть спонсора в дереве" icon="Virena / Navigation icon / Branch" onClick={()=>go(sponsor.path)}/>:<p className="participant-note">Спонсор находится вне вашей структуры</p>}</>}
   </section>
 </CabinetDialog>;
}
