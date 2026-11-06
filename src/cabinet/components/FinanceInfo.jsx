import React,{useId,useState} from 'react';
import {createPortal} from 'react-dom';
import Button from './CabinetButton.jsx';
/** Read-only row information, using the cabinet's portal tooltip treatment. */
export default function FinanceInfo({Shared,db,label,text}){
 const id=useId(),[anchor,setAnchor]=useState(null);
 const open=e=>{const el=e.currentTarget,b=el.getBoundingClientRect();el.querySelector('button')?.setAttribute('aria-describedby',id);setAnchor({right:Math.max(12,innerWidth-b.right),top:b.bottom+8,bottom:b.top});};
 return <span className="finance-info-trigger" onMouseEnter={open} onMouseLeave={()=>setAnchor(null)} onFocus={open} onBlur={()=>setAnchor(null)} onKeyDown={e=>{if(e.key==='Escape'){e.stopPropagation();setAnchor(null);}}}><Button Shared={Shared} db={db} icon="Auth / Icon / Info" label={label} size="40" tone="Ghost" onClick={open}/>{anchor&&createPortal(<div id={id} role="tooltip" className="cab-nav-tooltip finance-info-tooltip" style={{right:anchor.right,...(anchor.top+160>innerHeight?{bottom:innerHeight-anchor.bottom+8}:{top:anchor.top})}}>{text}</div>,document.body)}</span>;
}
