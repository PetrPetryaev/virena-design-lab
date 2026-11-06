import React,{useState} from 'react';
import {activityLabel,legLabel} from './genealogyData.js';
import {directoryCells as genealogyCells} from './memberDirectory.js';
import {MemberRegistration,MemberTeam} from './MemberDirectoryFacts.jsx';
import ToolbarFilters from '../../ToolbarFilters.jsx';
import CatalogToolbar from '../../CatalogToolbar.jsx';
import MemberTable from './MemberTable.jsx';
import ParticipantDetails from './ParticipantDetails.jsx';
import MemberAvatar from './MemberAvatar.jsx';
import MemberRank from './MemberRank.jsx';
import MemberStatus,{memberStates} from './MemberStatus.jsx';
import EmptyIllustration from './EmptyIllustration.jsx';
import './genealogy.css';
import './participants.css';

// List view of the same local tree fixtures; unplaced registrations are excluded.
export default function Participants({Shared,db,onShowTree,scenario='ready',view,setView}){
 const {scope,side=[],state=[],pack=[],query,page=1,pageSize=10,sortKey='',sortDirection='desc'}=view;
 const update=(key,value)=>setView(p=>({...p,[key]:value,...(key==='page'?{}:{page:1})}));
 const setScope=v=>update('scope',v),setSide=v=>update('side',v),setState=v=>update('state',v),setPack=v=>update('pack',v),setQuery=v=>update('query',v);
 const states=memberStates;
 const reset=()=>{setQuery('');setScope('all');setSide([]);setState([]);setPack([]);};
 const [selected,setSelected]=useState(null),[recovered,setRecovered]=useState(false);
 const cells=scenario==='empty'?[]:scenario==='single'?genealogyCells.slice(1,2):scenario==='long'?genealogyCells.slice(1).map((c,i)=>i===0?{...c,name:'Александра Константинопольская-Воскресенская',login:'alexandra_konstantinopolskaya_voskresenskaya'}:c):genealogyCells.slice(1);
 const normalized=query.trim().toLocaleLowerCase('ru');
 const available=!['loading','error'].includes(scenario)||recovered;
 const subset=scope==='personal'?cells.filter(c=>c.personal):cells;
 const results=subset.filter(c=>(!side.length||side.includes(legLabel(c.path)))&&(!state.length||state.includes(states[c.state]))&&(!pack.length||pack.includes(c.pack||'Без пакета'))).filter(c=>`${c.login} ${c.personal?c.name:''}`.toLocaleLowerCase('ru').includes(normalized));
 const groups=[{key:'side',label:'Нога',values:side,set:setSide,options:['Левая нога','Правая нога']},{key:'state',label:'Состояние',values:state,set:setState,options:Object.values(states)},{key:'pack',label:'Пакет',values:pack,set:setPack,options:[...new Set(genealogyCells.map(c=>c.pack||'Без пакета'))]}];
 const filterCount=side.length+state.length+pack.length;
 const clearFilters=()=>setView(p=>({...p,query:'',side:[],state:[],pack:[],page:1}));
 const toggle=(group,value)=>group.set(group.values.includes(value)?group.values.filter(v=>v!==value):[...group.values,value]);
 const sorted=[...results].sort((a,b)=>{let result=sortKey==='name'?(a.personal&&a.name?a.name:a.login).localeCompare(b.personal&&b.name?b.name:b.login,'ru'):sortKey==='rank'?a.rank-b.rank:sortKey==='level'?a.path.length-b.path.length:0;return sortDirection==='desc'?-result:result;});
 const pages=Math.max(1,Math.ceil(sorted.length/pageSize)),currentPage=Math.min(page,pages),visible=sorted.slice((currentPage-1)*pageSize,currentPage*pageSize);
 const sort=key=>setView(p=>({...p,sortKey:key,sortDirection:p.sortKey===key&&p.sortDirection==='desc'?'asc':'desc',page:1}));
 const sortOptions=[['','asc','По расположению в дереве'],['name','asc','Участник: А–Я'],['name','desc','Участник: Я–А'],['rank','asc','Ранг: по возрастанию'],['rank','desc','Ранг: по убыванию'],['level','asc','Уровень: ближе к вам'],['level','desc','Уровень: дальше от вас']];
 const activeSort=sortOptions.find(([key,direction])=>key===sortKey&&direction===sortDirection)||sortOptions[0];

 const Button=({label,onClick})=><Shared.Button group={db.components.find(c=>c.name==='Boris / Button')} choice={{Tone:'Soft',Size:'40'}} label={label} onClick={onClick}/>;
 return <section className="genealogy participants" aria-label="Участники структуры">
  <CatalogToolbar Shared={Shared} db={db} expandSearch items={[{value:'all',label:'Все участники',count:available?cells.length:undefined},{value:'personal',label:'Лично приглашённые',count:available?cells.filter(c=>c.personal).length:undefined}]} value={scope} onChange={setScope} label="Участники" idPrefix="participants-tab-" panelId="participants-results" query={query} onQueryChange={setQuery} searchLabel="Найти участника" resetActive={filterCount>0||!!query} onReset={clearFilters} actions={<div className="participants-filter-actions"><ToolbarFilters Shared={Shared} db={db} count={filterCount}><div className="participants-filter-groups">{groups.map(group=><fieldset key={group.key}><legend>{group.label}</legend>{group.options.map(value=><label key={value} className="participants-check"><Shared.Toggle group={db.components.find(c=>c.name==='Boris / Checkbox')} value={group.values.includes(value)} onChange={()=>toggle(group,value)} ariaLabel={value}/><span>{value}</span></label>)}</fieldset>)}</div></ToolbarFilters></div>}/>

  <div className="participants-mobile-sort"><Shared.Select embedded searchable={false} group={db.components.find(c=>c.name==='Auth / Select')} source={!available?{props:{State:{value:'Disabled'}}}:undefined} label="Сортировка участников" value={activeSort[2]} items={sortOptions.map(o=>o[2])} onChange={label=>{const [sortKey,sortDirection]=sortOptions.find(o=>o[2]===label);setView(p=>({...p,sortKey,sortDirection,page:1}));}}/></div>
  <div className="participants-panel" id="participants-results" role="tabpanel" aria-labelledby={'participants-tab-'+scope}>
  {scenario==='loading'&&!recovered?<div className="participants-loading" role="status" aria-label="Загружаем участников" aria-busy="true"><MemberTable Shared={Shared} rows={[]} loading label="Загрузка участников"/><div className="participants-pagination"><span className="participants-skeleton-lines"><b/></span></div></div>:scenario==='error'&&!recovered?<div className="participants-empty" role="alert"><h3>Не удалось загрузить участников</h3><p>Попробуйте ещё раз.</p><Button label="Повторить" onClick={()=>setRecovered(true)}/></div>:!results.length?<div className="participants-empty" role="status"><EmptyIllustration kind={cells.length?'search':'participants-empty'}/><h3>{cells.length?'Никого не нашли':'В структуре пока никого нет'}</h3><p>{cells.length?'Измените запрос или сбросьте фильтры.':'Новые участники появятся здесь после первой оплаты.'}</p>{(query||scope!=='all'||filterCount>0)&&<Button label="Сбросить поиск и фильтры" onClick={reset}/>}</div>:<>
   <MemberTable Shared={Shared} rows={visible} label="Участники структуры" onOpen={setSelected} sortKey={sortKey} direction={sortDirection} onSort={sort} sortKeys={{name:'name',pack:'rank',level:'level'}} renderAction={cell=><Shared.Button group={db.components.find(c=>c.name==='Boris / Icon button')} choice={{Tone:'Ghost',Size:'40'}} ariaLabel="В дереве" iconContent={<Shared.Icon name="Virena / Navigation icon / Branch"/>} onClick={e=>{e.stopPropagation();onShowTree(cell.path);}}/>}/>
   <div className="participants-pagination"><span role="status">{(currentPage-1)*pageSize+1}–{Math.min(currentPage*pageSize,results.length)} из {results.length}</span>{results.length>=10&&<><div className="participants-page-size"><span>Строк:</span><Shared.Select embedded group={db.components.find(c=>c.name==='Auth / Select')} searchable={false} label="Строк на странице" placeholder={String(pageSize)} value={String(pageSize)} onChange={v=>update('pageSize',Number(v))} items={['10','25','50']}/></div><nav aria-label="Страницы участников"><Shared.Button group={db.components.find(c=>c.name==='Boris / Icon button')} choice={{Tone:'Soft',Size:'40'}} ariaLabel="Предыдущая страница" disabled={currentPage===1} iconContent={<Shared.Icon name="Auth / Icon / Back"/>} onClick={()=>update('page',currentPage-1)}/><span>{currentPage} / {pages}</span><Shared.Button group={db.components.find(c=>c.name==='Boris / Icon button')} choice={{Tone:'Soft',Size:'40'}} ariaLabel="Следующая страница" disabled={currentPage===pages} iconContent={<span className="participants-next"><Shared.Icon name="Auth / Icon / Back"/></span>} onClick={()=>update('page',currentPage+1)}/></nav></>}</div>
  </>}
  </div>
  {selected&&<ParticipantDetails cell={selected} cells={genealogyCells} photo={selected.personal?selected.photo:null} Shared={Shared} db={db} onClose={()=>setSelected(null)} onNavigate={path=>{setSelected(null);onShowTree(path);}}/>}
 </section>;
}
