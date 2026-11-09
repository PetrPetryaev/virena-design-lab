import React,{useLayoutEffect,useRef} from 'react';
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
export default function QuantityControl({Shared,db,value,onChange,onRemove,label='Количество'}){
 const quantity=Number.isSafeInteger(value)&&value>0?value:1,previous=useRef(quantity),direction=quantity>=previous.current?1:-1;
 useLayoutEffect(()=>{previous.current=quantity;},[quantity]);
 const group=db.components.find(c=>c.name==='Boris / Button');
 return <div className="cart-quantity quantity-control" role="group" aria-label={label}>
 <Shared.Button group={group} choice={{Tone:'Soft',Size:'40'}} label="−" ariaLabel={`Уменьшить: ${label}`} disabled={quantity<=1&&!onRemove} onClick={()=>quantity===1&&onRemove?onRemove():onChange(quantity-1)}/>
 <output aria-label={`${label}: ${quantity}`} aria-live="polite" aria-atomic="true"><span className="quantity-accessible">{quantity}</span><span className="quantity-digits" aria-hidden="true">{String(quantity).split('').map((d,i,a)=><Digit key={a.length-1-i} index={a.length-1-i} digit={Number(d)} direction={direction}/>)}</span></output>
 <Shared.Button group={group} choice={{Tone:'Soft',Size:'40'}} label="+" ariaLabel={`Увеличить: ${label}`} disabled={quantity===Number.MAX_SAFE_INTEGER} onClick={()=>onChange(quantity+1)}/>
 </div>;
}
