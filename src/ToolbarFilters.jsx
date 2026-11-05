import React,{useState,useRef,useEffect,useId} from 'react';
import './toolbar-filters.css';
export default function ToolbarFilters({Shared,db,count=0,children}){
 const [open,setOpen]=useState(false),root=useRef(null),id=useId();
 useEffect(()=>{if(!open)return;const outside=e=>{if(!root.current?.contains(e.target))setOpen(false);};const key=e=>{if(e.key==='Escape'){setOpen(false);root.current?.querySelector('button')?.focus();}};document.addEventListener('pointerdown',outside);document.addEventListener('keydown',key);return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',key);};},[open]);
 return <div className="toolbar-filters" ref={root}><Shared.Button group={db.components.find(c=>c.name==='Boris / Button')} choice={{Tone:'White',Size:'48'}} label={`Фильтры${count?' · '+count:''}`} ariaExpanded={open} ariaControls={id} iconContent={<Shared.Icon name="Virena / Icon / Filter"/>} onClick={()=>setOpen(!open)}/>{open&&<div id={id} className="toolbar-filter-popover" role="region" aria-label="Фильтры участников"><div className="toolbar-filter-heading"><strong>Фильтры</strong><Shared.Button group={db.components.find(c=>c.name==='Boris / Icon button')} choice={{Tone:'Ghost',Size:'40'}} ariaLabel="Закрыть фильтры" iconContent={<Shared.Icon name="Cross"/>} onClick={()=>setOpen(false)}/></div>{children}</div>}</div>;
}
