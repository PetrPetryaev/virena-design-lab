import {flushSync} from 'react-dom';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {genealogyCells as defaultCells, formatPoints, activityLabel, legLabel, outermost, dataAsOf} from './genealogyData.js';
import './genealogy.css';
import breadcrumbChevron from '../../assets/navigation/alt-arrow-right-linear.svg?raw';
import starIcon from '../../assets/tree-icons/star-bold.svg?raw';
import frozenIcon from '../../assets/tree-icons/snowflake-linear.svg?raw';
import MemberAvatar from './MemberAvatar.jsx';
import MemberRank from './MemberRank.jsx';
import ParticipantDetails from './ParticipantDetails.jsx';

// Product components: the snapshot has no binary-tree node or connector family.
function TreeLibraryIcon({kind}){return <span className={`genealogy-library-icon icon-${kind}`} aria-hidden="true" dangerouslySetInnerHTML={{__html:(kind==='star'?starIcon:frozenIcon).replaceAll('"black"','"currentColor"')}}/>;}
function TreeArrow({direction='right',Shared}){return <span className={`genealogy-arrow arrow-${direction}`} aria-hidden="true"><Shared.Icon name="Auth / Icon / Back"/></span>;}
function Avatar({cell,photo,Shared}){return <MemberAvatar cell={cell} photo={photo} Shared={Shared} size={36}/>;}
function OwnMemberCard({cell,photo,Shared,db,onDetails,side,disabled,onChange}){
 const weak=cell.points.every(Number.isFinite)&&cell.points[0]!==cell.points[1]?(cell.points[0]<cell.points[1]?0:1):null;
 return <div className="genealogy-node is-own"><section className={`genealogy-member own-tree-card state-${cell.state}`} aria-label="Ваша ячейка">
  <div className="own-card-header"><Avatar Shared={Shared} cell={cell} photo={photo}/><div className="genealogy-identity"><strong>{cell.name||cell.login}</strong><span>{cell.login}</span></div><Shared.Button group={db.components.find(c=>c.name==='Boris / Icon button')} choice={{Tone:'Ghost',Size:'40'}} ariaLabel={`Подробная информация: ${cell.login}`} iconContent={<Shared.Icon name="Auth / Icon / Info"/>} onClick={()=>onDetails(cell)}/></div>
  <div className="own-card-meta"><span className="genealogy-package package-vip">{cell.pack||'Без пакета'}</span><span className="genealogy-you">Вы</span><MemberRank rank={cell.rank}/></div>
  <div className="own-card-summary"><div className="tree-own-totals"><span><strong>{cell.counts[0]+cell.counts[1]}</strong> участников</span><span><strong>{cell.steps}</strong> шагов</span></div><span className="own-card-status">{activityLabel(cell)}</span></div>
  <fieldset className="own-card-placement"><legend>Куда направлять новых приглашённых</legend><div className="own-card-legs">{['L','R'].map((leg,i)=>{const chosen=side===leg,parts=formatPoints(cell.points[i]).split(',');return <label key={leg} className={`own-leg ${chosen?'is-selected':''} ${disabled?'is-disabled':''}`}>
   <div className="own-leg-panel"><div className="own-leg-heading"><span>{i===0?'Левая нога':'Правая нога'}</span>{weak===i&&!disabled&&<span className="own-leg-hint">Нужно усилить</span>}</div><strong className="own-leg-points">{parts[0]}{parts[1]&&<small>,{parts[1]}</small>}</strong><div className="own-leg-bottom"><span>баллов</span><span className="own-leg-people" aria-label={`${cell.counts[i]} участников`}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7" r="3.5"/><path d="M4.5 18.7c0-3.1 3.4-5.2 7.5-5.2s7.5 2.1 7.5 5.2c0 1.2-.8 1.8-2 1.8h-11c-1.2 0-2-.6-2-1.8Z"/></svg><b>{cell.counts[i]}</b></span></div></div>
   <span className="own-leg-choice"><input type="radio" name="own-card-placement" aria-label={i===0?'В левую ногу':'В правую ногу'} checked={chosen} disabled={disabled} onChange={()=>onChange(leg)}/><span>{chosen?'Выбрано':i===0?'Направлять влево':'Направлять вправо'}</span></span>
  </label>;})}</div></fieldset>
 </section></div>;
}

function MiniMemberCard({cell,onOpen,onDetails,Shared}){
 const name=cell.personal?cell.name:'';
 return <div className={`genealogy-node node-mini state-${cell.state}`}>
  <button type="button" className="genealogy-member mini-member" onClick={onOpen} onContextMenu={e=>{e.preventDefault();onDetails(cell);}} aria-label={`Открыть ветку ${cell.login}`} title={`${name?name+' · ':''}${cell.login}`}>
   <Avatar Shared={Shared} cell={cell} photo={cell.personal?cell.photo:null}/>
   <span className="mini-identity"><strong>{name||cell.login}</strong><span>{name?cell.login:'Участник'}</span></span>
  </button>
 </div>;
}
function MemberCard({cells,cell, compact, onOpen, root, onDetails, Shared, db, boundary, photo}) {
 const timer=useRef(null), held=useRef(false), start=useRef(null);
 const cancel=()=>clearTimeout(timer.current);
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 const pointerDown=e=>{held.current=false;if(e.pointerType!=='touch')return;start.current={x:e.clientX,y:e.clientY};timer.current=setTimeout(()=>{held.current=true;onDetails(cell);},550);};
 const pointerMove=e=>{if(start.current&&Math.hypot(e.clientX-start.current.x,e.clientY-start.current.y)>10)cancel();};
 const below=cells.filter(c=>c.path.startsWith(cell.path)&&c.path.length>cell.path.length);
 const extraLevels=below.length?Math.max(...below.map(c=>c.path.length-cell.path.length)):0;
 const visibleName = cell.personal ? cell.name : '';
 const packageTone=({'ВИП':'vip','Супер ВИП':'super','Профи':'pro','Стандарт':'standard'})[cell.pack]||'basic';
 return <div className={`genealogy-node ${boundary&&extraLevels>0?'has-hidden-levels':''} ${compact?'node-compact':''} ${cell.path===''?'is-own':''}`}><button type="button" className={`genealogy-member ${compact ? 'is-compact' : ''} state-${cell.state}`} onClick={e=>{if(held.current){held.current=false;e.preventDefault();return;}if(root)onDetails(cell);else onOpen();}} onContextMenu={e=>{e.preventDefault();cancel();onDetails(cell);}} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={cancel} onPointerCancel={cancel} aria-label={`${root ? 'Информация об участнике' : 'Открыть ветку'} ${cell.login}`} data-login={cell.login}>
  <span className="genealogy-member-head">
   <Avatar Shared={Shared} cell={cell} photo={photo}/>
   <span className="genealogy-identity"><strong title={visibleName||cell.login}>{visibleName||cell.login}</strong><span title={visibleName?cell.login:'Участник структуры'}>{visibleName?cell.login:'Участник структуры'}</span></span>
  </span>
  <span className="genealogy-card-meta"><span className={`genealogy-package package-${packageTone}`}>{cell.pack || (cell.state === 'client' ? 'Клиент' : 'Без пакета')}</span>{cell.path===''&&<span className="genealogy-you">Вы</span>}<MemberRank rank={cell.rank}/></span>
  {cell.path===''&&<span className="tree-own-totals"><span><strong>{cell.counts[0]+cell.counts[1]}</strong> участников</span><span><strong>{cell.steps}</strong> шагов</span></span>}
  <span className="genealogy-metrics">{['Левая нога','Правая нога'].map((label,i)=><span className="genealogy-leg-stat" key={label}><span className="genealogy-leg-label">{label}</span><b>{formatPoints(cell.points[i])}</b>{cell.path===''&&cell.points.every(Number.isFinite)&&cell.points[0]!==cell.points[1]&&<span className={`tree-leg-strength-label ${cell.points[i]<cell.points[1-i]?'is-weaker':''}`}><span aria-hidden="true" className={i===0?'points-left':'points-right'} dangerouslySetInnerHTML={{__html:breadcrumbChevron.replace('stroke="black"','stroke="currentColor"')}}/>{cell.points[i]<cell.points[1-i]?'Слабее · усилить':'Сильнее'}</span>}<span className="genealogy-stat-people">Участников: <strong>{cell.counts[i]}</strong></span></span>)}</span>

 {cell.path===''&&cell.state==='partner'&&<span className="tree-own-activity">{activityLabel(cell)}</span>}
 </button>{cell.state!=='partner'&&<span className={`genealogy-card-state state-${cell.state}`}>{activityLabel(cell)}{cell.state==='frozen'&&<TreeLibraryIcon kind="frozen"/>}</span>}{boundary&&extraLevels>0&&<button type="button" className={`genealogy-more ${boundary}`} onClick={onOpen} aria-label={`Открыть следующие ${extraLevels} уровня под ${cell.login}`}>Ещё {extraLevels} ур. <TreeArrow Shared={Shared} direction="down"/></button>}<span className="genealogy-info"><Shared.Button group={db.components.find(c=>c.name==='Boris / Icon button')} choice={{Tone:'Ghost',Size:'40'}} ariaLabel={`Подробная информация: ${cell.login}`} iconContent={<Shared.Icon name="Auth / Icon / Info"/>} onClick={()=>onDetails(cell)}/></span></div>;
}

export default function Genealogy({Shared, db, photo, cells=defaultCells, placementSide='L', navigation, placementDisabled=false, onPlacementChange,onReturnList}) {
 const [rootPath, setRootPath] = useState(()=>{const intent=new URLSearchParams(location.search).get('intent')||'',path=intent.startsWith('participant:')?intent.slice(12):'';return cells.some(c=>c.path===path)?path:'';});
 const [viewSize,setViewSize]=useState('');
 const [highlight,setHighlight]=useState(null),completedNavigation=useRef(null),boardRef=useRef(null);
 const [selected,setSelected]=useState(null);
 const [busy,setBusy]=useState(false);
 const [compactView,setCompactView]=useState(()=>window.innerHeight<1000);
 const scene=useRef(null),locked=useRef(false),alive=useRef(true),animations=useRef([]);
 const [links,setLinks]=useState([]);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;animations.current.forEach(a=>a.cancel());};},[]);
 const [query, setQuery] = useState('');
 const [searchOpen, setSearchOpen] = useState(false);
 const canvas = useRef(null), pan=useRef(null);
 const panStart=e=>{if(e.pointerType!=='mouse'||e.button!==0||e.target.closest('button,input,label,a'))return;pan.current={x:e.clientX,y:e.clientY,left:e.currentTarget.scrollLeft,top:e.currentTarget.scrollTop};e.currentTarget.setPointerCapture(e.pointerId);};
 const panMove=e=>{if(!pan.current)return;e.currentTarget.scrollLeft=pan.current.left+pan.current.x-e.clientX;e.currentTarget.scrollTop=pan.current.top+pan.current.y-e.clientY;};
 const panEnd=()=>{pan.current=null;};
 const current = cells.find(c=>c.path === rootPath);
 const rootButton = useRef(null);
 useEffect(()=>{
  const viewport=canvas.current;
  const center=()=>{viewport.scrollLeft=(viewport.scrollWidth-viewport.clientWidth)/2;const height=viewport.clientHeight;setViewSize(`${viewport.clientWidth}:${height}`);setCompactView(height<740);};
  const observer=new ResizeObserver(center);observer.observe(viewport);center();
  return ()=>observer.disconnect();
 },[]);
 const open = async path => {
  if(locked.current||path===rootPath||!cells.some(c=>c.path===path))return;
  setHighlight(null);
  const travelY=path.length<rootPath.length?-28:28;
  const update=()=>{setRootPath(path);setSearchOpen(false);setQuery('');};
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){update();requestAnimationFrame(()=>rootButton.current?.querySelector('button')?.focus({preventScroll:true}));return;}
  locked.current=true;setBusy(true);
  try{
   const leave=scene.current.animate([{opacity:1,transform:'translate(0, 0)'},{opacity:0,transform:`translateY(${-travelY}px)`}],{duration:160,easing:'ease-in',fill:'forwards'});
   animations.current=[leave];await leave.finished;if(!alive.current)return;
   flushSync(update);leave.cancel();
   const enter=scene.current.animate([{opacity:0,transform:`translateY(${travelY}px)`},{opacity:1,transform:'translate(0, 0)'}],{duration:240,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'});
   animations.current=[enter];await enter.finished;enter.cancel();
   rootButton.current?.querySelector('button')?.focus({preventScroll:true});
  }catch(error){if(error.name!=='AbortError')throw error;}
  finally{locked.current=false;if(alive.current)setBusy(false);}
 };
 useEffect(()=>{
  const measure=()=>{
   const el=scene.current;if(!el)return;const box=el.getBoundingClientRect();const paths=[];
   const root=el.querySelector('.genealogy-root .genealogy-member');
   el.querySelectorAll('.genealogy-slot.has-parent').forEach(slot=>{
    const path=slot.dataset.treePath;const target=slot.querySelector('.genealogy-member,.genealogy-vacant');
    const parentPath=path.slice(0,-1);const parent=parentPath===rootPath?root:el.querySelector(`[data-tree-path="${parentPath}"] .genealogy-member`);
    if(!parent||!target)return;const a=parent.getBoundingClientRect(),b=target.getBoundingClientRect();
    if(slot.parentElement.classList.contains('level-3')){const x=b.left+b.width/2-box.left,y=a.bottom-box.top,endY=b.top-box.top-4;paths.push({path,d:`M ${x} ${y} V ${endY}`});return;}
    const left=path.endsWith('L'),x=(left?a.left-4:a.right+4)-box.left,y=a.top+a.height*.52-box.top;
    const endX=b.left+b.width/2-box.left,endY=b.top-box.top-4;const sign=left?-1:1;const radius=Math.min(24,Math.abs(endX-x),Math.max(0,endY-y));
    paths.push({path,d:`M ${x} ${y} H ${endX-sign*radius} Q ${endX} ${y} ${endX} ${y+radius} V ${endY}`});
   });setLinks(paths);
  };const observer=new ResizeObserver(measure);observer.observe(scene.current);measure();return()=>observer.disconnect();
 },[rootPath,compactView,viewSize,current.points[0],current.points[1]]);
 const results = useMemo(()=>{
  const q=query.trim().toLocaleLowerCase('ru');
  return q.length<3 ? [] : cells.filter(c=>`${c.login} ${c.personal ? c.name : ''}`.toLocaleLowerCase('ru').includes(q)).slice(0,10);
 },[query]);

 useEffect(()=>{
  if(!navigation||completedNavigation.current===navigation||busy)return;
  if(rootPath!==navigation.path){open(navigation.path);return;}
  completedNavigation.current=navigation;
  setHighlight(`${navigation.path}${placementSide}`);
 },[navigation,busy,rootPath,placementSide]);
 useEffect(()=>setHighlight(null),[placementSide]);
 useEffect(()=>{
  if(!highlight||busy)return;
  const frame=requestAnimationFrame(()=>{const viewport=canvas.current,target=viewport?.querySelector(`[data-tree-path="${highlight}"] .genealogy-vacant`);if(!target)return;boardRef.current?.scrollIntoView({block:'start',behavior:'instant'});const v=viewport.getBoundingClientRect(),t=target.getBoundingClientRect(),free=v.height-0-32;viewport.scrollTo({left:viewport.scrollLeft+t.left-v.left-(v.width-t.width)/2,top:viewport.scrollTop+t.top-v.top-Math.max(16,(free-t.height)/2),behavior:'instant'});target.focus({preventScroll:true});});return()=>cancelAnimationFrame(frame);
 },[highlight,navigation,viewSize,busy]);

 const path = Array.from({length:rootPath.length+1},(_,i)=>cells.find(c=>c.path===rootPath.slice(0,i))).filter(Boolean);
 const shortPath = path.length>4 ? [path[0],null,...path.slice(-2)] : path;
 const parent=path.at(-2);
 const nextPath = `${outermost(placementSide,cells).path}${placementSide}`;
 return <div ref={boardRef} className={`genealogy visual-tree ${compactView?'is-short':''}`}>
  <div className="genealogy-tools">
   <div className="genealogy-location-panel">{onReturnList&&<div className="genealogy-return genealogy-return-mobile"><Shared.Button group={db.components.find(c=>c.name==='Boris / Button')} choice={{Tone:'White',Size:'48'}} label="В таблицу" iconContent={<Shared.Icon name="return-to-list"/>} onClick={onReturnList}/></div>}<div className="genealogy-location"><nav aria-label="Путь в дереве">{shortPath.map((c,i)=><React.Fragment key={c?.path??'ellipsis'}>{i>0&&<span className="genealogy-breadcrumb-chevron" aria-hidden="true" dangerouslySetInnerHTML={{__html:breadcrumbChevron.replace('stroke="black"','stroke="currentColor"')}}/>}{c?<button type="button" onClick={()=>open(c.path)} aria-current={c.path===rootPath?'location':undefined} aria-label={c.login}>{c.path?c.login:'Моя ячейка'}</button>:<span>…</span>}</React.Fragment>)}</nav><span aria-live="polite">Уровень {rootPath.length}</span></div>

  <nav className="genealogy-navigation" aria-label="Навигация по структуре">{[
   ['Начало','',rootPath==='','home'],
   ['Выше',rootPath.slice(0,-1),rootPath==='','up'],
   ['Внизу слева',outermost('L',cells).path,!cells.some(c=>c.path==='L'),'down-left'],
   ['Внизу справа',outermost('R',cells).path,!cells.some(c=>c.path==='R'),'down-right']
  ].map(([label,target,disabled,direction])=><Shared.Button key={label} group={db.components.find(c=>c.name==='Boris / Button')} choice={{Tone:'Soft',Size:'40'}} label={label} iconContent={<span className={`genealogy-nav-icon nav-${direction}`} aria-hidden="true"><Shared.Icon name={direction==='home'?'Virena / Navigation icon / Home':'Auth / Icon / Back'}/></span>} disabled={disabled||busy} onClick={()=>{canvas.current.scrollTo({top:0,behavior:'instant'});open(target);}}/>)}</nav>
   </div>
   <div className="genealogy-search" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setSearchOpen(false);}} onFocus={()=>setSearchOpen(true)} onKeyDown={e=>{if(e.key==='Escape'){e.currentTarget.querySelector('input')?.focus();setSearchOpen(false);}if(e.key==='ArrowDown'&&e.target.tagName==='INPUT'){e.preventDefault();e.currentTarget.querySelector('.genealogy-result')?.focus();}}}>
    <label className="store-search"><span className="store-search-symbol" aria-hidden="true"><Shared.Icon name="Serach"/></span><input type="search" aria-label="Поиск по структуре" placeholder="Найти участника" value={query} onChange={e=>{setQuery(e.target.value);setSearchOpen(true);}}/></label>
    {searchOpen && query.trim().length>0 && <div className="genealogy-results" role="region" aria-label="Результаты поиска">
     {query.trim().length<3 ? <p role="status">Введите не менее 3 символов</p> : results.length ? results.map(c=><button type="button" className="genealogy-result" key={c.path} onClick={()=>{setSelected(c);setSearchOpen(false);}}><strong>{c.login}</strong>{c.personal && <span>{c.name}</span>}<small>{legLabel(c.path)} · уровень {c.path.length}</small></button>) : <p role="status">В вашей структуре не найдено</p>}
    </div>}
   </div>
  </div>
  <div className="genealogy-viewport" onPointerDown={panStart} onPointerMove={panMove} onPointerUp={panEnd} onPointerCancel={panEnd} ref={canvas} tabIndex={0} role="region" aria-label="Бинарное дерево, прокручиваемая область">
   <div className="genealogy-board-space"><div ref={scene} className="genealogy-canvas" aria-busy={busy} inert={busy||undefined}>
    <svg className="genealogy-links" aria-hidden="true">{links.map(link=><path key={link.path} d={link.d} data-branch={link.path} className={rootPath===''&&link.path===placementSide?'is-placement-selected':undefined}/>)}</svg>
    <div className="genealogy-ancestry">
     {rootPath.length>1&&<button type="button" className="genealogy-ancestor-more" onClick={()=>open('')}><TreeArrow Shared={Shared} direction="up"/>Ещё {rootPath.length-1} {rootPath.length===2?'уровень':'уровня'} выше · к вашей ячейке</button>}
     {rootPath?<button type="button" className="genealogy-ancestor" aria-label={`Выше: ${path.at(-2).login}`} onClick={()=>open(rootPath.slice(0,-1))}><span className="genealogy-parent-person"><Avatar Shared={Shared} cell={parent} photo={parent.path===''?photo:parent.personal?parent.photo:null}/><span><strong title={parent.personal?parent.name:parent.login}>{parent.personal?parent.name:parent.login}</strong>{parent.personal&&<small>{parent.login}</small>}</span></span><span className="genealogy-up-action" aria-hidden="true"><TreeArrow Shared={Shared} direction="up"/></span></button>:<span className="genealogy-boundary">Ваша ячейка · начало доступной структуры</span>}
    </div>
    <div className={`genealogy-root ${rootPath?'has-ancestors':'is-own-root'}`} ref={rootButton}>{onReturnList&&<div className="genealogy-return genealogy-return-card"><Shared.Button group={db.components.find(c=>c.name==='Boris / Button')} choice={{Tone:'White',Size:'48'}} label="В таблицу" iconContent={<Shared.Icon name="return-to-list"/>} onClick={onReturnList}/></div>}{rootPath===''&&onPlacementChange?<OwnMemberCard cell={current} photo={photo} Shared={Shared} db={db} onDetails={setSelected} side={placementSide} disabled={placementDisabled} onChange={onPlacementChange}/>:<MemberCard cells={cells} Shared={Shared} db={db} onDetails={setSelected} cell={current} photo={current.path===''?photo:current.personal?current.photo:null} root onOpen={()=>rootPath && open(rootPath.slice(0,-1))}/>}</div>
    {(parseInt(viewSize,10)>=900?[1,2,3]:[1,2]).map(level=><div key={level} className={`genealogy-level level-${level}`} style={{'--tree-columns':2**level}}>{Array.from({length:2**level},(_,i)=>{
     const relative=i.toString(2).padStart(level,'0').replaceAll('0','L').replaceAll('1','R');
     const fullPath=rootPath+relative;
     const c=cells.find(c=>c.path===fullPath);
     const parent=cells.some(c=>c.path===fullPath.slice(0,-1));
     return <div key={relative} className={`genealogy-slot leg-${relative[0]==='L'?'left':'right'} ${parent?'has-parent':''}`} data-tree-path={fullPath}>
      {c?(level===3?<MiniMemberCard cell={c} Shared={Shared} db={db} onDetails={setSelected} onOpen={()=>open(c.path)}/>:<MemberCard cells={cells} Shared={Shared} db={db} onDetails={setSelected} cell={c} photo={c.personal?c.photo:null} onOpen={()=>open(c.path)}/>):<div className={`genealogy-vacant ${highlight===fullPath?'is-forecast-highlight':''}`} tabIndex={highlight===fullPath?-1:undefined} aria-label={highlight===fullPath?'Место следующего приглашённого':undefined} title="Свободная позиция"><span>Свободная позиция</span>{fullPath===nextPath&&<strong>Сюда встанет следующий</strong>}</div>}
     </div>;
    })}</div>)}
   </div></div>
  </div>
 <div className="genealogy-board-footer">

  <p className="genealogy-calculation">Баллы и шаги – по расчёту на {dataAsOf}</p>
 </div>
 {selected&&<ParticipantDetails photo={selected.path===''?photo:selected.personal?selected.photo:null} cell={selected} cells={cells} Shared={Shared} db={db} onClose={()=>setSelected(null)} onNavigate={open}/>}
 </div>;
}
