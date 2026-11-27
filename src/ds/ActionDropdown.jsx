import React,{useRef,useId,useState} from 'react';
import './action-dropdown.css';
export default function ActionDropdown({Shared,db,label,items,triggerLabel,triggerTone='Soft',triggerIcon,triggerSize,disabled}){
 const popup=useRef(null),trigger=useRef(null),id=useId(),[open,setOpen]=useState(false);
 const toggle=()=>{const el=popup.current;if(el.matches(':popover-open')){el.hidePopover();return;}el.showPopover();const rect=trigger.current.getBoundingClientRect();el.style.left=Math.max(8,Math.min(rect.right-el.offsetWidth,innerWidth-el.offsetWidth-8))+'px';el.style.top=Math.max(8,Math.min(rect.bottom+8,innerHeight-el.offsetHeight-8))+'px';el.querySelector('button')?.focus();};
 return <span ref={trigger} className="ds-action-dropdown" onClick={e=>e.stopPropagation()}><Shared.Button group={db.components.find(c=>c.name===(triggerLabel?'Boris / Button':'Boris / Icon button'))} choice={{Tone:triggerLabel?triggerTone:'Ghost',Size:triggerSize??(triggerLabel?'48':'40')}} label={triggerLabel} ariaLabel={label} disabled={disabled} ariaExpanded={open} ariaControls={id} iconContent={<Shared.Icon name={triggerIcon??(triggerLabel?'Auth / Icon / Chevron':'Virena / Icon / More')}/>} onClick={toggle}/><div ref={popup} id={id} popover="auto" className="ds-action-popover" role="group" aria-label={label} onToggle={e=>setOpen(e.newState==='open')} onKeyDown={e=>{const buttons=[...e.currentTarget.querySelectorAll('button')],i=buttons.indexOf(document.activeElement);if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();buttons[e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length]?.focus();}}}>{items.filter(Boolean).map(item=><div role="none" key={item.label}><Shared.Button group={db.components.find(c=>c.name==='Boris / Button')} choice={{Tone:'White',Size:'40'}} label={item.label} iconContent={item.icon?<Shared.Icon name={item.icon}/>:undefined} onClick={()=>{popup.current.hidePopover();trigger.current?.querySelector('button')?.focus();item.onClick();}}/></div>)}</div></span>;
}

export function SortMenu({Shared,db,label,value,descending,items,disabled}){
 return <ActionDropdown {...{Shared,db,label,items,disabled}} triggerLabel={value} triggerTone="Ghost" triggerSize="40"
   triggerIcon={descending?'sort-from-top-to-bottom-linear':'sort-from-bottom-to-top-linear'}/>;
}
