import React,{useLayoutEffect,useRef,useState} from 'react';
import './quantity-control.css';
// Visual reference: https://bencho.dev/?c=rolling-counter&theme=light
// Local implementation: native DS buttons and rolling decimal columns, no external runtime.
function Digit({digit,direction,index}){
 const track=useRef(null),previous=useRef(digit);
 useLayoutEffect(()=>{const from=previous.current;previous.current=digit;if(from===digit||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const start=direction<0&&from===0&&digit===9?10:from,end=direction>0&&from===9&&digit===0?10:digit;
 const animation=track.current.animate([{transform:`translateY(${-start}em)`},{transform:`translateY(${-end}em)`}],{duration:220,delay:Math.min(index,3)*25,easing:'cubic-bezier(.16,1,.3,1)'});
 return()=>animation.cancel();
 },[digit,direction,index]);
 return <span className="quantity-digit"><span ref={track} className="quantity-track" style={{transform:`translateY(${-digit}em)`}}>{[0,1,2,3,4,5,6,7,8,9,0].map((n,i)=><span key={i}>{n}</span>)}</span></span>;
}
export default function QuantityControl({Shared,db,value,onChange,onRemove,onPendingChange,label='Количество'}){
 const quantity=Number.isSafeInteger(value)&&value>0?value:1,previous=useRef(quantity),direction=quantity>=previous.current?1:-1;
 const [pending,setPending]=useState(0);
 const timer=useRef(null),focusAfterChange=useRef(null);
 useLayoutEffect(()=>()=>clearTimeout(timer.current),[]);
 useLayoutEffect(()=>{
  if(!pending||!onPendingChange)return;
  onPendingChange(true);
  return()=>onPendingChange(false);
 },[onPendingChange,pending]);
 useLayoutEffect(()=>{
  previous.current=quantity;
  if(timer.current!==null){
   clearTimeout(timer.current);
   timer.current=null;
   setPending(0);
  }
 },[quantity]);
 useLayoutEffect(()=>{
  if(pending||!focusAfterChange.current)return;
  const button=focusAfterChange.current;
  focusAfterChange.current=null;
  if(document.activeElement===document.body)button.focus();
 },[pending]);
 function change(delta,event){
  if(timer.current!==null)return;
  const button=event.currentTarget;
  if(document.activeElement===button)focusAfterChange.current=button;
  setPending(delta);
  // Let the fixture show the pending action before changing the shared cart.
  timer.current=setTimeout(()=>{
   timer.current=null;
   try{
    if(delta<0&&quantity===1&&onRemove){
     onRemove(focusAfterChange.current===button&&(document.activeElement===document.body||document.activeElement===button));
    }else onChange(quantity+delta);
   }catch(error){console.error(error);}
   finally{setPending(0);}
  },600);
 }
 const group=db.components.find(c=>c.name==='Boris / Button');
 return <div className="cart-quantity quantity-control" role="group" aria-label={label}>
 <Shared.Button group={group} choice={{Tone:'Soft',Size:'40'}} label="−" ariaLabel={`Уменьшить: ${label}`} loading={!onPendingChange&&pending===-1} disabled={pending!==0||(quantity<=1&&!onRemove)} onClick={event=>change(-1,event)}/>
 <output aria-label={`${label}: ${quantity}`} aria-live="polite" aria-atomic="true"><span className="quantity-accessible">{quantity}</span><span className="quantity-digits" aria-hidden="true">{String(quantity).split('').map((d,i,a)=><Digit key={a.length-1-i} index={a.length-1-i} digit={Number(d)} direction={direction}/>)}</span></output>
 <Shared.Button group={group} choice={{Tone:'Soft',Size:'40'}} label="+" ariaLabel={`Увеличить: ${label}`} loading={!onPendingChange&&pending===1} disabled={pending!==0||quantity===Number.MAX_SAFE_INTEGER} onClick={event=>change(1,event)}/>
 </div>;
}
