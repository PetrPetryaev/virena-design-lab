import {useCallback,useRef} from 'react';
export default function useMotionDismiss(ref,onClose){
 const busy=useRef(false),latest=useRef(onClose);latest.current=onClose;
 return useCallback(()=>{if(busy.current)return;const el=ref.current;if(!el||matchMedia('(prefers-reduced-motion: reduce)').matches){latest.current();return;}busy.current=true;el.dataset.closing='true';const drawer=el.classList.contains('member-details-drawer');el.animate([{opacity:1,transform:'translate(0,0)'},{opacity:drawer?1:0,transform:drawer?'translateX(24px)':'translateY(6px)'}],{duration:120,easing:'ease-in',fill:'forwards'}).finished.catch(()=>{}).finally(()=>{busy.current=false;latest.current();});},[ref]);
}
