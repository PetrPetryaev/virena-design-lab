import MemberOwnBadge from './MemberOwnBadge.jsx';
import React from 'react';
import DataTable from '../../ds/DataTable.jsx';
import MemberAvatar from './MemberAvatar.jsx';
import MemberStatus from './MemberStatus.jsx';
import MemberPackage from './MemberPackage.jsx';
import MemberRank from './MemberRank.jsx';
import {activityLabel} from './genealogyData.js';
import {registeredLabel,lastLoginLabel} from './memberDirectory.js';
import './member-table.css';
export function MemberIdentity({cell,Shared,onOpen}){
 const name=cell.personal&&cell.name?cell.name:cell.login;
 const meta=[cell.name&&cell.personal?cell.login:'Участник структуры',cell.personal?cell.country:null].filter(Boolean).join(' · ');
 return <button type="button" className="member-table-person" aria-label={'Подробная информация: '+cell.login} onClick={e=>{e.stopPropagation();onOpen(cell);}}><MemberAvatar cell={cell} Shared={Shared} photo={cell.personal?cell.photo:null}/><span className="member-table-identity"><span className="member-table-name"><strong className="ds-table-line" title={name}>{name}</strong>{cell.new&&<Shared.Status label="Новый" tone="Info"/>}{cell.own&&<MemberOwnBadge/>}</span><small className="ds-table-line" title={meta}>{meta}</small></span></button>;
}
export default function MemberTable({Shared,rows,onOpen,renderAction,sortKey,direction,onSort,sortKeys={},reason,loading=false,label}){
 const columns=[
 {key:'person',label:'Участник',sort:sortKeys.name||'name',width:'minmax(180px,1.15fr)',render:c=><MemberIdentity cell={c} Shared={Shared} onOpen={onOpen}/>},
 {key:'status',label:'Состояние',sort:sortKeys.state,width:'minmax(160px,1.05fr)',render:c=><div className="ds-table-stack"><MemberStatus state={c.state} Shared={Shared}/><small className="ds-table-line" title={reason?.(c)||activityLabel(c)}>{reason?.(c)||activityLabel(c)}</small></div>},
 {key:'package',label:'Пакет',sort:sortKeys.pack||'rank',width:'minmax(120px,.8fr)',render:c=><div className="ds-table-stack"><MemberPackage pack={c.pack} empty={['registered','client'].includes(c.state)?'—':'Без пакета'}/>{!['registered','client'].includes(c.state)&&<MemberRank rank={c.rank}/>}</div>},
 {key:'structure',label:'Структура',sort:sortKeys.level,width:'minmax(125px,.85fr)',render:c=><div className="ds-table-stack"><span>{c.path?(c.path[0]==='L'?'Левая':'Правая'):(c.plannedLeg==='L'?'Встанет слева':'Встанет справа')}</span><small>{c.path?'Уровень '+c.path.length:'После оплаты'}</small></div>},
 {key:'registered',label:'Регистрация',sort:sortKeys.registered,width:'minmax(155px,1fr)',render:c=><div className="ds-table-stack"><span>{registeredLabel(c)}</span><small className="ds-table-line" title={c.personal?c.lastLogin:undefined}>{lastLoginLabel(c).replace(/^Вход /,'')}</small></div>},
 {key:'action',label:'',width:'88px',className:'ds-table-action',render:renderAction},
 ];
 return <DataTable columns={columns} rows={rows} rowKey={c=>c.id||c.login} sortKey={sortKey} direction={direction} onSort={onSort} Shared={Shared} label={label} onRowClick={onOpen} loading={loading}/>;
}
