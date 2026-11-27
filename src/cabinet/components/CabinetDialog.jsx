import dismissOnBackdrop from './dismissOnBackdrop.js';
import React,{useEffect,useLayoutEffect,useRef,useId} from 'react';
import useMotionDismiss from '../../ds/useMotionDismiss.js';
import Button from './CabinetButton.jsx';
import './genealogy.css';
import './participant-details.css';
import './invitations.css';
export default function CabinetDialog({title,onClose,Shared,db,children,footer,drawer=false,dismissRequested=false,onSwipe,notification,headerActions,navigation,titleAction,subtitle,headerContent,scrollLabel,scrollResetKey,closeLabel='Закрыть окно',className=''}){
 const titleId=useId();
 const scroll=useRef(null);
 const ref=useRef(null),touch=useRef(null),close=useRef(onClose);const dismiss=useMotionDismiss(ref,onClose);close.current=dismiss;
 useEffect(()=>{const d=ref.current,previous=document.activeElement;d.showModal();const main=document.querySelector('.cab-main'),overflow=main?.style.overflow;if(main)main.style.overflow='hidden';return()=>{d.close();if(main)main.style.overflow=overflow;if(previous?.isConnected)previous.focus({preventScroll:true});};},[]);
 useLayoutEffect(()=>{if(scroll.current)scroll.current.scrollTop=0;},[scrollResetKey]);
 useEffect(()=>{if(dismissRequested)dismiss();},[dismissRequested,dismiss]);
 return <dialog ref={ref} className={`inv-dialog participant-dialog ${drawer?'inv-drawer member-details-drawer':'inv-modal'} ${className}`} aria-labelledby={titleId} onClick={e=>dismissOnBackdrop(e,dismiss)} onCancel={e=>{e.preventDefault();close.current();}} onTouchStart={e=>{touch.current={x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY};}} onTouchEnd={e=>{if(!touch.current||!onSwipe||e.target.closest('textarea,input,button,select,a'))return;const dx=e.changedTouches[0].clientX-touch.current.x,dy=e.changedTouches[0].clientY-touch.current.y;touch.current=null;if(Math.abs(dx)>80&&Math.abs(dx)>Math.abs(dy)*2)onSwipe(dx<0?1:-1);}}><div className="participant-heading">{headerContent?headerContent(titleId):titleAction||subtitle?<div className="drawer-title-group"><div className="drawer-title-row"><h2 id={titleId}>{title}</h2>{titleAction}</div>{subtitle}</div>:<h2 id={titleId}>{title}</h2>}<div className="drawer-header-actions">{headerActions}{navigation&&<nav className="drawer-navigation" aria-label={navigation.label}><Button Shared={Shared} db={db} icon="Auth / Icon / Back" size="40" {...navigation.previous}/><span className="drawer-next"><Button Shared={Shared} db={db} icon="Auth / Icon / Back" size="40" {...navigation.next}/></span></nav>}<Button Shared={Shared} db={db} icon="Cross" tone={drawer?'Soft':'Ghost'} size="40" label={closeLabel} onClick={dismiss}/></div></div><div ref={scroll} className="participant-scroll" tabIndex={scrollLabel?0:undefined} role={scrollLabel?"region":undefined} aria-label={scrollLabel}>{children}</div>{footer&&<div className="participant-actions">{footer}</div>}{notification&&<div className="auth-toast" role="status">{notification}</div>}</dialog>;
}
