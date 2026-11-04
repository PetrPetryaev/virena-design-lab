import React, {useEffect, useMemo, useRef, useState} from 'react';
import {genealogyCells as cells, dataAsOf, formatPoints, activityLabel, legLabel, outermost} from './genealogyData.js';
import './genealogy.css';
import ParticipantDetails from './ParticipantDetails.jsx';

// Product components: the snapshot has no binary-tree node or connector family.
function MemberCard({cell, compact, onOpen, root, onDetails, Shared, db, boundary, photo}) {
 const timer=useRef(null), held=useRef(false), start=useRef(null);
 const cancel=()=>clearTimeout(timer.current);
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 const pointerDown=e=>{held.current=false;if(e.pointerType!=='touch')return;start.current={x:e.clientX,y:e.clientY};timer.current=setTimeout(()=>{held.current=true;onDetails(cell);},550);};
 const pointerMove=e=>{if(start.current&&Math.hypot(e.clientX-start.current.x,e.clientY-start.current.y)>10)cancel();};
 const below=cells.filter(c=>c.path.startsWith(cell.path)&&c.path.length>cell.path.length);
 const extraLevels=below.length?Math.max(...below.map(c=>c.path.length-cell.path.length)):0;
 const visibleName = cell.personal ? cell.name : '';
 const mark = !cell.path ? 'Вы' : cell.personal ? 'Лично приглашённый' : '';
 return <div className="genealogy-node"><button type="button" className={`genealogy-member ${compact ? 'is-compact' : ''} state-${cell.state}`} onClick={e=>{if(held.current){held.current=false;e.preventDefault();return;}onOpen();}} onContextMenu={e=>{e.preventDefault();cancel();onDetails(cell);}} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={cancel} onPointerCancel={cancel} disabled={root && !cell.path} aria-label={`${root ? (cell.path?'Выше от':'Ваша ячейка') : 'Открыть ветку'} ${cell.login}`} data-login={cell.login}>
  <span className="genealogy-member-head">
   <span className="genealogy-avatar" aria-hidden="true">{photo?(typeof photo==='string'?<img src={photo} alt=""/>:<span className="genealogy-photo" style={{backgroundImage:`url(${photo.src})`,backgroundSize:photo.size,backgroundPosition:photo.position}}/>):visibleName ? visibleName.split(' ').map(n=>n[0]).slice(0,2).join('') : cell.login.slice(0,2).toUpperCase()}</span>
   <span className="genealogy-identity"><strong title={cell.login}>{cell.login}</strong>{visibleName && <span title={visibleName}>{visibleName}</span>}</span>
   <span className="genealogy-package" title={cell.pack ? `Пакет ${cell.pack}` : cell.state === 'client' ? 'Клиент' : 'Без пакета'}>{cell.pack || (cell.state === 'client' ? 'Клиент' : cell.state === 'deactivated' ? 'Неактивна' : 'Без пакета')}</span>
  </span>
  <span className="genealogy-rank"><span aria-label={`Ранг: ${cell.rank} из 9`}>{cell.rank ? '★'.repeat(cell.rank) : 'Ранга нет'}</span><span>Шагов: {cell.steps}</span></span>
  <span className="genealogy-activity" title={activityLabel(cell)}><i/>{activityLabel(cell)}</span>
  <span className="genealogy-metrics" title="Баллы и участники в левой и правой ноге этого участника"><span>Баллы <b>{cell.points.map(formatPoints).join(' / ')}</b></span><span>Участники <b>{cell.counts.join(' / ')}</b></span></span>
  {mark && <span className="genealogy-mark" title={mark}>{mark}</span>}
 </button>{boundary&&extraLevels>0&&<button type="button" className={`genealogy-more ${boundary}`} onClick={onOpen} aria-label={`Открыть следующие ${extraLevels} уровня под ${cell.login}`}>Ещё {extraLevels} ур. ↓</button>}<span className="genealogy-info"><Shared.Button group={db.components.find(c=>c.name==='Boris / Icon button')} choice={{Tone:'Ghost',Size:'40'}} ariaLabel={`Подробная информация: ${cell.login}`} iconContent={<Shared.Icon name="Auth / Icon / Info"/>} onClick={()=>onDetails(cell)}/></span></div>;
}

export default function Genealogy({Shared, db, photo}) {
 const [rootPath, setRootPath] = useState('');
 const [selected,setSelected]=useState(null);
 const [transition,setTransition]=useState({id:0,direction:'down'});
 const [query, setQuery] = useState('');
 const [searchOpen, setSearchOpen] = useState(false);
 const canvas = useRef(null);
 const current = cells.find(c=>c.path === rootPath);
 const rootButton = useRef(null);
 useEffect(()=>{
  const viewport=canvas.current;
  const center=()=>{viewport.scrollLeft=(viewport.scrollWidth-viewport.clientWidth)/2;};
  const observer=new ResizeObserver(center);observer.observe(viewport);center();
  return ()=>observer.disconnect();
 },[]);
 const open = path => {
  if (!cells.some(c=>c.path === path)) return;
  if(path!==rootPath)setTransition(t=>({id:t.id+1,direction:path.length<rootPath.length?'up':'down'}));
  setRootPath(path); setSearchOpen(false); setQuery('');
  requestAnimationFrame(()=>{if(canvas.current)canvas.current.scrollLeft=(canvas.current.scrollWidth-canvas.current.clientWidth)/2; rootButton.current?.querySelector('button')?.focus({preventScroll:true}); canvas.current?.closest('.genealogy')?.scrollIntoView({block:'start',behavior:'instant'});});
 };
 const results = useMemo(()=>{
  const q=query.trim().toLocaleLowerCase('ru');
  return q.length<3 ? [] : cells.filter(c=>`${c.login} ${c.personal ? c.name : ''}`.toLocaleLowerCase('ru').includes(q)).slice(0,10);
 },[query]);

 const path = Array.from({length:rootPath.length+1},(_,i)=>cells.find(c=>c.path===rootPath.slice(0,i))).filter(Boolean);
 const shortPath = path.length>4 ? [path[0],null,...path.slice(-2)] : path;
 const nextPath = `${outermost('L').path}L`;
 return <div className="genealogy">
  <div className="genealogy-tools">

   <div className="genealogy-search" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setSearchOpen(false);}} onFocus={()=>setSearchOpen(true)} onKeyDown={e=>{if(e.key==='Escape'){e.currentTarget.querySelector('input')?.focus();setSearchOpen(false);}if(e.key==='ArrowDown'&&e.target.tagName==='INPUT'){e.preventDefault();e.currentTarget.querySelector('.genealogy-result')?.focus();}}}>
    <label className="store-search"><span className="store-search-symbol" aria-hidden="true"><Shared.Icon name="Serach"/></span><input type="search" aria-label="Поиск по структуре" placeholder="Найти участника" value={query} onChange={e=>{setQuery(e.target.value);setSearchOpen(true);}}/></label>
    {searchOpen && query.trim().length>0 && <div className="genealogy-results" role="region" aria-label="Результаты поиска">
     {query.trim().length<3 ? <p role="status">Введите не менее 3 символов</p> : results.length ? results.map(c=><button type="button" className="genealogy-result" key={c.path} onClick={()=>open(c.path)}><strong>{c.login}</strong>{c.personal && <span>{c.name}</span>}<small>{legLabel(c.path)} · уровень {c.path.length}</small></button>) : <p role="status">В вашей структуре не найдено</p>}
    </div>}
   </div>
  </div>
  <div className="genealogy-location"><nav aria-label="Путь в дереве">{shortPath.map((c,i)=><React.Fragment key={c?.path??'ellipsis'}>{i>0&&<span aria-hidden="true">›</span>}{c?<button type="button" onClick={()=>open(c.path)} aria-current={c.path===rootPath?'location':undefined}>{c.login}</button>:<span title={`${path.length-3} промежуточных уровней`}>… {path.length-3} ур.</span>}</React.Fragment>)}</nav><span aria-live="polite">Уровень {rootPath.length}{rootPath ? ` · ${legLabel(rootPath).toLocaleLowerCase('ru')}` : ' · ваша ячейка'}</span></div>
  <p className="genealogy-calculation">Баллы и шаги – по расчёту на {dataAsOf}</p>

  <p className="genealogy-scroll-hint">Проведите по дереву в сторону, чтобы увидеть соседние ячейки</p>
  <div className="genealogy-viewport" ref={canvas} tabIndex={0} role="region" aria-label="Бинарное дерево, прокручиваемая область">
   <div key={transition.id} className={`genealogy-canvas transition-${transition.direction}`}>
    <div className="genealogy-ancestry">
     {rootPath.length>1&&<button type="button" className="genealogy-ancestor-more" onClick={()=>open('')}>↑ Ещё {rootPath.length-1} {rootPath.length===2?'уровень':'уровня'} выше · к вашей ячейке</button>}
     {rootPath?<button type="button" className="genealogy-ancestor" aria-label={`Выше: ${path.at(-2).login}`} onClick={()=>open(rootPath.slice(0,-1))}><span>↑ На уровень выше</span><strong>{path.at(-2).login}</strong></button>:<span className="genealogy-boundary">Ваша ячейка · начало доступной структуры</span>}
    </div>
    <div className="genealogy-root" ref={rootButton}><MemberCard Shared={Shared} db={db} onDetails={setSelected} cell={current} photo={current.path===''?photo:current.personal?current.photo:null} root onOpen={()=>rootPath && open(rootPath.slice(0,-1))}/></div>
    {[1,2].map(level=><div key={level} className={`genealogy-level level-${level}`} style={{'--tree-columns':2**level}}>{Array.from({length:2**level},(_,i)=>{
     const relative=i.toString(2).padStart(level,'0').replaceAll('0','L').replaceAll('1','R');
     const fullPath=rootPath+relative;
     const c=cells.find(c=>c.path===fullPath);
     const parent=cells.some(c=>c.path===fullPath.slice(0,-1));
     return <div key={relative} className={`genealogy-slot leg-${relative[0]==='L'?'left':'right'} ${parent?'has-parent':''}`} data-tree-path={fullPath}>
      {c?<MemberCard Shared={Shared} db={db} onDetails={setSelected} cell={c} photo={c.personal?c.photo:null} boundary={level===2?'boundary-all':null} compact={level===2} onOpen={()=>open(c.path)}/>:<div className="genealogy-vacant" title="Свободная позиция"><span>Свободная позиция</span>{fullPath===nextPath&&<strong>Сюда встанет следующий</strong>}</div>}
     </div>;
    })}</div>)}
   </div>
  </div>
 {selected&&<ParticipantDetails photo={selected.path===''?photo:selected.personal?selected.photo:null} cell={selected} Shared={Shared} db={db} onClose={()=>setSelected(null)} onNavigate={open}/>}
 </div>;
}
