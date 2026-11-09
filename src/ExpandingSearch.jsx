import React,{useRef,useState,useEffect,useLayoutEffect} from 'react';
import './expanding-search.css';
export default function ExpandingSearch({Shared,db,value,onChange,label}){
 const [open,setOpen]=useState(()=>!!value&&!window.matchMedia('(max-width: 600px)').matches),[pressing,setPressing]=useState(false),[mediaVersion,setMediaVersion]=useState(0);
 const input=useRef(null),trigger=useRef(null),root=useRef(null),frame=useRef(0),timer=useRef(0),width=useRef(value?240:48),velocity=useRef(0);
 useEffect(()=>{if(value&&!window.matchMedia('(max-width: 600px)').matches)setOpen(true);},[value]);
 useEffect(()=>{const queries=[window.matchMedia('(max-width: 600px)'),window.matchMedia('(prefers-reduced-motion: reduce)')];const changed=()=>setMediaVersion(v=>v+1);queries.forEach(q=>q.addEventListener('change',changed));return()=>queries.forEach(q=>q.removeEventListener('change',changed));},[]);
 useLayoutEffect(()=>{
  const node=root.current;if(!node)return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const target=open?(window.matchMedia('(max-width: 600px)').matches?220:240):48;
  let previous;
  const paint=()=>{const p=Math.max(0,Math.min(1,(width.current-48)/(target===48?(window.matchMedia('(max-width: 600px)').matches?172:192):target-48)));node.style.setProperty('--search-width',`${width.current}px`);node.style.setProperty('--search-reveal',Math.max(0,Math.min(1,(p-.55)/.45)));node.style.setProperty('--search-slide',`${(1-p)*8}px`);};
  if(reduced){width.current=target;velocity.current=0;paint();return;}
  const tick=time=>{const dt=previous===undefined?1:Math.max(0,Math.min(2.5,(time-previous)/16.67));previous=time;velocity.current+=(target-width.current)*.112*dt;velocity.current*=Math.pow(.66,dt);width.current+=velocity.current*dt;if(Math.abs(target-width.current)<.02&&Math.abs(velocity.current)<.02){width.current=target;velocity.current=0;paint();return;}paint();frame.current=requestAnimationFrame(tick);};
  frame.current=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame.current);
 },[open,mediaVersion]);
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 const expand=()=>{if(pressing)return;setPressing(true);const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;timer.current=setTimeout(()=>{setPressing(false);setOpen(true);input.current?.focus();},reduced?0:90);};
 const close=()=>{setOpen(false);requestAnimationFrame(()=>trigger.current?.querySelector('button')?.focus());};
 return <div className="expanding-search-frame" data-open={open}><div ref={root} className="expanding-search" data-open={open} data-pressing={pressing} onBlur={e=>{if(!window.matchMedia('(max-width: 600px)').matches&&!e.currentTarget.contains(e.relatedTarget)&&!value&&!e.currentTarget.closest('.catalog-toolbar-actions')?.contains(e.relatedTarget))setOpen(false);}}>
 <span className="expanding-search-leading" aria-hidden="true"><Shared.Icon name="Serach"/></span>
 <span ref={trigger} className="expanding-search-trigger" hidden={open} onPointerDown={e=>{if(e.pointerType==='touch')input.current?.focus();}}><Shared.Button group={db.components.find(c=>c.name==='Boris / Icon button')} choice={{Tone:'Soft',Size:'48'}} ariaLabel={label} ariaExpanded={open} iconContent={<span/>} onClick={expand}/></span>
 <div className="expanding-search-field"><input ref={input} type="search" aria-label={label} placeholder={label} value={value} tabIndex={open?0:-1} aria-hidden={!open} onChange={e=>onChange(e.target.value)} onKeyDown={e=>{if(e.key==='Escape'){e.stopPropagation();if(window.matchMedia('(max-width: 600px)').matches)close();else if(value)onChange('');else close();}}}/></div>
 {open&&value&&<span className="expanding-search-clear"><Shared.Button group={db.components.find(c=>c.name==='Boris / Icon button')} choice={{Tone:'Ghost',Size:'40'}} ariaLabel="Очистить поиск" iconContent={<Shared.Icon name="Cross"/>} onClick={()=>{onChange('');input.current?.focus();}}/></span>}
 </div>{open&&<span className="expanding-search-close"><Shared.Button group={db.components.find(c=>c.name==='Boris / Icon button')} choice={{Tone:'Soft',Size:'48'}} ariaLabel="Закрыть поиск" iconContent={<Shared.Icon name="Cross"/>} onClick={close}/></span>}</div>;
}
