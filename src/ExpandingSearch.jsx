import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import './expanding-search.css';

export default function ExpandingSearch({Shared,db,value,onChange,label,triggerLabel=label}){
  const [open,setOpen]=useState(Boolean(value));
  const field=useRef(null),trigger=useRef(null),restoreFocus=useRef(false);
  useEffect(()=>{if(value)setOpen(true);},[value]);
  useLayoutEffect(()=>{
    if(restoreFocus.current){
      if(open)field.current?.focus();
      else trigger.current?.querySelector('button')?.focus();
      restoreFocus.current=false;
    }
  },[open]);
  function toggle(next){
    restoreFocus.current=true;
    if(!next&&value)onChange('');
    setOpen(next);
  }
  const group=db.components.find(c=>c.name==='Boris / Icon button');
  const choice={Tone:'Ghost',Size:'40'};
  return <div className="expanding-search-frame" data-open={open}>
    {open?<div className="expanding-search" data-open="true" onKeyDown={event=>{
      if(event.key==='Escape'){event.preventDefault();toggle(false);}
    }}>
      <span className="expanding-search-leading" aria-hidden="true"><Shared.Icon name="Serach"/></span>
      <input ref={field} type="search" aria-label={label} placeholder={label} value={value} onChange={event=>onChange(event.target.value)}/>
      <Shared.Button {...{group,choice}} ariaLabel="Закрыть поиск" iconContent={<Shared.Icon name="Cross"/>} onClick={()=>toggle(false)}/>
    </div>:<span ref={trigger}><Shared.Button group={group} choice={choice} ariaLabel={triggerLabel} ariaExpanded={false} iconContent={<Shared.Icon name="Serach"/>} onClick={()=>toggle(true)}/></span>}
  </div>;
}
