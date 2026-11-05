import React,{useRef,useState} from 'react';
import './expanding-search.css';
export default function ExpandingSearch({Shared,db,value,onChange,label}){
 const [open,setOpen]=useState(!!value),input=useRef(null),trigger=useRef(null);
 const close=()=>{if(!value){setOpen(false);requestAnimationFrame(()=>trigger.current?.querySelector('button')?.focus());}};
 return <div className="expanding-search" data-open={open} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget)&&!value&&!e.currentTarget.closest('.catalog-toolbar-actions')?.contains(e.relatedTarget))setOpen(false);}}>
 <span ref={trigger} className="expanding-search-trigger" hidden={open}><Shared.Button group={db.components.find(c=>c.name==='Boris / Icon button')} choice={{Tone:'Soft',Size:'48'}} ariaLabel={label} ariaExpanded={open} iconContent={<Shared.Icon name="Serach"/>} onClick={()=>{setOpen(true);requestAnimationFrame(()=>input.current?.focus());}}/></span>
 <span className="expanding-search-leading" hidden={!open} aria-hidden="true"><Shared.Icon name="Serach"/></span>
 <div className="expanding-search-field"><input ref={input} type="search" aria-label={label} placeholder={label} value={value} tabIndex={open?0:-1} aria-hidden={!open} onChange={e=>onChange(e.target.value)} onKeyDown={e=>{if(e.key==='Escape'){e.stopPropagation();if(value)onChange('');else close();}}}/></div>
 </div>;
}
