import dismissOnBackdrop from './dismissOnBackdrop.js';
import React,{useEffect,useRef,useId} from 'react';
import useMotionDismiss from '../../ds/useMotionDismiss.js';
import Button from './CabinetButton.jsx';
import './genealogy.css';
import './participant-details.css';
import './invitations.css';
export default function CabinetDialog({title,onClose,Shared,db,children,footer,drawer=false,onSwipe,notification,className=''}){
 const titleId=useId();
 const ref=useRef(null),touch=useRef(null),close=useRef(onClose);const dismiss=useMotionDismiss(ref,onClose);close.current=dismiss;
 useEffect(()=>{const d=ref.current,previous=document.activeElement;d.showModal();const main=document.querySelector('.cab-main'),overflow=main?.style.overflow;if(main)main.style.overflow='hidden';return()=>{d.close();if(main)main.style.overflow=overflow;if(previous?.isConnected)previous.focus({preventScroll:true});};},[]);
 return <dialog ref={ref} className={`inv-dialog participant-dialog ${drawer?'inv-drawer member-details-drawer':'inv-modal'} ${className}`} aria-labelledby={titleId} onClick={e=>dismissOnBackdrop(e,dismiss)} onCancel={e=>{e.preventDefault();close.current();}} onTouchStart={e=>{touch.current={x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY};}} onTouchEnd={e=>{if(!touch.current||!onSwipe||e.target.closest('textarea,input,button'))return;const dx=e.changedTouches[0].clientX-touch.current.x,dy=e.changedTouches[0].clientY-touch.current.y;if(Math.abs(dx)>80&&Math.abs(dx)>Math.abs(dy)*2)onSwipe(dx<0?1:-1);}}><div className="participant-heading"><h2 id={titleId}>{title}</h2><Button Shared={Shared} db={db} icon="Cross" tone="Ghost" size="40" label="Закрыть окно" onClick={dismiss}/></div><div className="participant-scroll">{children}</div>{footer&&<div className="participant-actions">{footer}</div>}{notification&&<div className="auth-toast" role="status">{notification}</div>}</dialog>;
}
