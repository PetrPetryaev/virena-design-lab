import {flushSync} from 'react-dom';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {genealogyCells as cells, formatPoints, activityLabel, legLabel, outermost} from './genealogyData.js';
import './genealogy.css';
import ParticipantDetails from './ParticipantDetails.jsx';

// Product components: the snapshot has no binary-tree node or connector family.
function Avatar({cell,photo}){const name=cell.personal?cell.name:'';return <span className="genealogy-avatar" aria-hidden="true">{photo?(typeof photo==='string'?<img src={photo} alt=""/>:<span className="genealogy-photo" style={{backgroundImage:`url(${photo.src})`,backgroundSize:photo.size,backgroundPosition:photo.position}}/>):name?name.split(' ').map(n=>n[0]).slice(0,2).join(''):cell.login.slice(0,2).toUpperCase()}</span>;}
function MemberCard({cell, compact, onOpen, root, onDetails, Shared, db, boundary, photo}) {
 const timer=useRef(null), held=useRef(false), start=useRef(null);
 const cancel=()=>clearTimeout(timer.current);
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 const pointerDown=e=>{held.current=false;if(e.pointerType!=='touch')return;start.current={x:e.clientX,y:e.clientY};timer.current=setTimeout(()=>{held.current=true;onDetails(cell);},550);};
 const pointerMove=e=>{if(start.current&&Math.hypot(e.clientX-start.current.x,e.clientY-start.current.y)>10)cancel();};
 const below=cells.filter(c=>c.path.startsWith(cell.path)&&c.path.length>cell.path.length);
 const extraLevels=below.length?Math.max(...below.map(c=>c.path.length-cell.path.length)):0;
 const visibleName = cell.personal ? cell.name : '';
 const packageTone=({'ВИП':'vip','Супер ВИП':'super','Профи':'pro','Стандарт':'standard'})[cell.pack]||'basic';
 return <div className={`genealogy-node ${boundary&&extraLevels>0?'has-hidden-levels':''} ${compact?'node-compact':''} ${cell.path===''?'is-own':''}`}><button type="button" className={`genealogy-member ${compact ? 'is-compact' : ''} state-${cell.state}`} onClick={e=>{if(held.current){held.current=false;e.preventDefault();return;}onOpen();}} onContextMenu={e=>{e.preventDefault();cancel();onDetails(cell);}} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={cancel} onPointerCancel={cancel} disabled={root && !cell.path} aria-label={`${root ? (cell.path?'Выше от':'Ваша ячейка') : 'Открыть ветку'} ${cell.login}`} data-login={cell.login}>
  <span className="genealogy-member-head">
   <Avatar cell={cell} photo={photo}/>
   <span className="genealogy-identity"><strong title={visibleName||cell.login}>{visibleName||cell.login}</strong><span title={visibleName?cell.login:'Участник структуры'}>{visibleName?cell.login:'Участник структуры'}</span></span>
  </span>
  <span className="genealogy-card-meta"><span className={`genealogy-package package-${packageTone}`}>{cell.pack || (cell.state === 'client' ? 'Клиент' : 'Без пакета')}</span>{cell.path===''&&<span className="genealogy-you">Вы</span>}<span className={`genealogy-rank ${cell.rank===0?'is-zero':''}`} aria-label={`Ранг: ${cell.rank} из 9`}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.5 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9Z"/></svg><span>{cell.rank}</span></span></span>
  <span className="genealogy-metrics">{['Левая нога','Правая нога'].map((label,i)=><span className="genealogy-leg-stat" key={label}><span className="genealogy-leg-label">{label}</span><b>{formatPoints(cell.points[i])}</b><span className="genealogy-stat-people">Участников: <strong>{cell.counts[i]}</strong></span></span>)}</span>
  {cell.state!=='partner'&&<span className={`genealogy-card-state state-${cell.state}`}>{activityLabel(cell)}</span>}

 </button>{boundary&&extraLevels>0&&<button type="button" className={`genealogy-more ${boundary}`} onClick={onOpen} aria-label={`Открыть следующие ${extraLevels} уровня под ${cell.login}`}>Ещё {extraLevels} ур. ↓</button>}<span className="genealogy-info"><Shared.Button group={db.components.find(c=>c.name==='Boris / Icon button')} choice={{Tone:'Ghost',Size:'40'}} ariaLabel={`Подробная информация: ${cell.login}`} iconContent={<Shared.Icon name="Auth / Icon / Info"/>} onClick={()=>onDetails(cell)}/></span></div>;
}

export default function Genealogy({Shared, db, photo}) {
 const [rootPath, setRootPath] = useState('');
 const [selected,setSelected]=useState(null);
 const [busy,setBusy]=useState(false);
 const [compactView,setCompactView]=useState(()=>window.innerHeight<1000);
 const [compactRoot,setCompactRoot]=useState(false),[denseView,setDenseView]=useState(false);
 const scene=useRef(null),locked=useRef(false),alive=useRef(true),animations=useRef([]);
 const [links,setLinks]=useState([]);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;animations.current.forEach(a=>a.cancel());};},[]);
 const [query, setQuery] = useState('');
 const [searchOpen, setSearchOpen] = useState(false);
 const canvas = useRef(null), pan=useRef(null);
 const panStart=e=>{if(e.pointerType!=='mouse'||e.button!==0||e.target.closest('button,input,a'))return;pan.current={x:e.clientX,y:e.clientY,left:e.currentTarget.scrollLeft,top:e.currentTarget.scrollTop};e.currentTarget.setPointerCapture(e.pointerId);};
 const panMove=e=>{if(!pan.current)return;e.currentTarget.scrollLeft=pan.current.left+pan.current.x-e.clientX;e.currentTarget.scrollTop=pan.current.top+pan.current.y-e.clientY;};
 const panEnd=()=>{pan.current=null;};
 const current = cells.find(c=>c.path === rootPath);
 const rootButton = useRef(null);
 useEffect(()=>{
  const viewport=canvas.current;
  const center=()=>{viewport.scrollLeft=(viewport.scrollWidth-viewport.clientWidth)/2;const height=viewport.clientHeight;setCompactView(height<740);setCompactRoot(height<560);setDenseView(height<460);};
  const observer=new ResizeObserver(center);observer.observe(viewport);center();
  return ()=>observer.disconnect();
 },[]);
 const open = async path => {
  if(locked.current||path===rootPath||!cells.some(c=>c.path===path))return;
  const direction=path.length<rootPath.length?1:-1;
  const update=()=>{setRootPath(path);setSearchOpen(false);setQuery('');};
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){update();requestAnimationFrame(()=>rootButton.current?.querySelector('button')?.focus({preventScroll:true}));return;}
  locked.current=true;setBusy(true);
  try{
   const leave=scene.current.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:`translateY(${direction*28}px)`}],{duration:160,easing:'ease-in',fill:'forwards'});
   animations.current=[leave];await leave.finished;if(!alive.current)return;
   flushSync(update);leave.cancel();
   const enter=scene.current.animate([{opacity:0,transform:`translateY(${-direction*28}px)`},{opacity:1,transform:'translateY(0)'}],{duration:240,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'});
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
    const left=path.endsWith('L'),x=(left?a.left-4:a.right+4)-box.left,y=a.top+a.height*.52-box.top;
    const endX=b.left+b.width/2-box.left,endY=b.top-box.top-4;const sign=left?-1:1;const radius=Math.min(24,Math.abs(endX-x),Math.max(0,endY-y));
    paths.push(`M ${x} ${y} H ${endX-sign*radius} Q ${endX} ${y} ${endX} ${y+radius} V ${endY}`);
   });setLinks(paths);
  };const observer=new ResizeObserver(measure);observer.observe(scene.current);measure();return()=>observer.disconnect();
 },[rootPath,compactView,compactRoot,denseView]);
 const results = useMemo(()=>{
  const q=query.trim().toLocaleLowerCase('ru');
  return q.length<3 ? [] : cells.filter(c=>`${c.login} ${c.personal ? c.name : ''}`.toLocaleLowerCase('ru').includes(q)).slice(0,10);
 },[query]);

 const path = Array.from({length:rootPath.length+1},(_,i)=>cells.find(c=>c.path===rootPath.slice(0,i))).filter(Boolean);
 const shortPath = path.length>4 ? [path[0],null,...path.slice(-2)] : path;
 const parent=path.at(-2);
 const nextPath = `${outermost('L').path}L`;
 return <div className={`genealogy visual-tree ${compactView?'is-short':''}`}>
  <div className="genealogy-tools">
   <div className="genealogy-location"><nav aria-label="Путь в дереве">{shortPath.map((c,i)=><React.Fragment key={c?.path??'ellipsis'}>{i>0&&<span aria-hidden="true">›</span>}{c?<button type="button" onClick={()=>open(c.path)} aria-current={c.path===rootPath?'location':undefined} aria-label={c.login}>{c.path?c.login:'Моя ячейка'}</button>:<span>…</span>}</React.Fragment>)}</nav><span aria-live="polite">Уровень {rootPath.length}</span></div>

   <div className="genealogy-search" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setSearchOpen(false);}} onFocus={()=>setSearchOpen(true)} onKeyDown={e=>{if(e.key==='Escape'){e.currentTarget.querySelector('input')?.focus();setSearchOpen(false);}if(e.key==='ArrowDown'&&e.target.tagName==='INPUT'){e.preventDefault();e.currentTarget.querySelector('.genealogy-result')?.focus();}}}>
    <label className="store-search"><span className="store-search-symbol" aria-hidden="true"><Shared.Icon name="Serach"/></span><input type="search" aria-label="Поиск по структуре" placeholder="Найти участника" value={query} onChange={e=>{setQuery(e.target.value);setSearchOpen(true);}}/></label>
    {searchOpen && query.trim().length>0 && <div className="genealogy-results" role="region" aria-label="Результаты поиска">
     {query.trim().length<3 ? <p role="status">Введите не менее 3 символов</p> : results.length ? results.map(c=><button type="button" className="genealogy-result" key={c.path} onClick={()=>{setSelected(c);setSearchOpen(false);}}><strong>{c.login}</strong>{c.personal && <span>{c.name}</span>}<small>{legLabel(c.path)} · уровень {c.path.length}</small></button>) : <p role="status">В вашей структуре не найдено</p>}
    </div>}
   </div>
  </div>
  <div className="genealogy-viewport" onPointerDown={panStart} onPointerMove={panMove} onPointerUp={panEnd} onPointerCancel={panEnd} ref={canvas} tabIndex={0} role="region" aria-label="Бинарное дерево, прокручиваемая область">
   <div className="genealogy-board-space"><div ref={scene} className="genealogy-canvas" aria-busy={busy} inert={busy||undefined}>
    <svg className="genealogy-links" aria-hidden="true">{links.map((d,i)=><path key={i} d={d}/>)}</svg>
    <div className="genealogy-ancestry">
     {rootPath.length>1&&<button type="button" className="genealogy-ancestor-more" onClick={()=>open('')}>↑ Ещё {rootPath.length-1} {rootPath.length===2?'уровень':'уровня'} выше · к вашей ячейке</button>}
     {rootPath?<button type="button" className="genealogy-ancestor" aria-label={`Выше: ${path.at(-2).login}`} onClick={()=>open(rootPath.slice(0,-1))}><span className="genealogy-parent-person"><Avatar cell={parent} photo={parent.path===''?photo:parent.personal?parent.photo:null}/><span><strong title={parent.personal?parent.name:parent.login}>{parent.personal?parent.name:parent.login}</strong>{parent.personal&&<small>{parent.login}</small>}</span></span><span className="genealogy-up-action">На уровень выше <span aria-hidden="true">↑</span></span></button>:<span className="genealogy-boundary">Ваша ячейка · начало доступной структуры</span>}
    </div>
    <div className={`genealogy-root ${rootPath?'has-ancestors':''}`} ref={rootButton}><MemberCard Shared={Shared} db={db} onDetails={setSelected} cell={current} compact={compactRoot} photo={current.path===''?photo:current.personal?current.photo:null} root onOpen={()=>rootPath && open(rootPath.slice(0,-1))}/></div>
    {(compactView?[1]:[1,2]).map(level=><div key={level} className={`genealogy-level level-${level}`} style={{'--tree-columns':2**level}}>{Array.from({length:2**level},(_,i)=>{
     const relative=i.toString(2).padStart(level,'0').replaceAll('0','L').replaceAll('1','R');
     const fullPath=rootPath+relative;
     const c=cells.find(c=>c.path===fullPath);
     const parent=cells.some(c=>c.path===fullPath.slice(0,-1));
     return <div key={relative} className={`genealogy-slot leg-${relative[0]==='L'?'left':'right'} ${parent?'has-parent':''}`} data-tree-path={fullPath}>
      {c?<MemberCard Shared={Shared} db={db} onDetails={setSelected} cell={c} photo={c.personal?c.photo:null} boundary={level===(compactView?1:2)?'boundary-all':null} compact={level===2||denseView} onOpen={()=>open(c.path)}/>:<div className="genealogy-vacant" title="Свободная позиция"><span>Свободная позиция</span>{fullPath===nextPath&&<strong>Сюда встанет следующий</strong>}</div>}
     </div>;
    })}</div>)}
   </div></div>
  </div>
 {selected&&<ParticipantDetails photo={selected.path===''?photo:selected.personal?selected.photo:null} cell={selected} Shared={Shared} db={db} onClose={()=>setSelected(null)} onNavigate={open}/>}
 </div>;
}
