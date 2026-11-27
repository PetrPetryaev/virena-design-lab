import {useCallback,useRef} from 'react';
export default function useMotionDismiss(ref,onClose){
 const busy=useRef(false),latest=useRef(onClose);latest.current=onClose;
 return useCallback(()=>{
  if(busy.current)return;
  const el=ref.current;
  if(!el||matchMedia('(prefers-reduced-motion: reduce)').matches){latest.current();return;}
  busy.current=true;
  const style=getComputedStyle(el);
  const sheetExit=style.getPropertyValue('--sheet-exit-transform').trim();
  const drawer=el.classList.contains('member-details-drawer');
  const start={opacity:style.opacity,transform:style.transform};
  el.dataset.closing='true';
  el.animate([start,{
   opacity:sheetExit||drawer?1:0,
   transform:sheetExit||(drawer?'translateX(24px)':'translateY(6px)')
  }],{duration:sheetExit?220:120,easing:'ease-in',fill:'forwards'}).finished.catch(()=>{}).finally(()=>{
   busy.current=false;
   latest.current();
  });
 },[ref]);
}
