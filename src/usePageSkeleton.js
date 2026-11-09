import {useLayoutEffect,useRef} from 'react';
import './page-skeleton.css';

// The mounted destination remains the layout authority, including responsive cards,
// wrapped text and reserved artwork. Only its paint and interaction are replaced.
export default function usePageSkeleton(rootRef,routeKey,{selector,duration=420,loading=false,initial=true,enabled=true}={}){
 const first=useRef(true);
 useLayoutEffect(()=>{
  const root=selector?rootRef.current?.querySelector(selector):rootRef.current;
  const skip=first.current&&!initial;first.current=false;
  if(!root||!enabled||skip&&!loading)return;
  const previousBusy=root.getAttribute('aria-busy'),previousInert=root.inert;
  const layer=document.createElement('div');layer.className='page-skeleton-layer';layer.setAttribute('aria-hidden','true');
  const measure=()=>{
   layer.replaceChildren();const base=root.getBoundingClientRect();
   const draw=(rect,kind,style)=>{if(rect.width<2||rect.height<2)return;const item=document.createElement('span');item.className='page-skeleton-piece '+kind;Object.assign(item.style,{left:rect.left-base.left+root.scrollLeft+'px',top:rect.top-base.top+root.scrollTop+'px',width:rect.width+'px',height:rect.height+'px',...style});layer.append(item);};
   const origin={left:base.left+parseFloat(getComputedStyle(root).paddingLeft||0),top:base.top+parseFloat(getComputedStyle(root).paddingTop||0)};
   const width=root.clientWidth-parseFloat(getComputedStyle(root).paddingLeft||0)-parseFloat(getComputedStyle(root).paddingRight||0);
   const block=(x,y,w,h,kind='')=>draw({left:origin.left+x,top:origin.top+y,width:w,height:h},kind);
   const listPage=/^(orders|participants|invitations)(:|$)/.test(String(routeKey))||String(routeKey).includes(':history:');
   if(listPage){
    // Keep the loading table neutral: a surface with sparse lines in each cell,
    // independent of whether the eventual result is full, empty or an error.
    block(0,0,Math.min(320,width*.6),40);block(Math.max(0,width-160),0,Math.min(160,width*.38),40);
    const mobile=width<560,columns=mobile?[.58,.42]:[.28,.19,.19,.19,.15];
    const rows=Math.max(3,Math.min(7,Math.floor((root.clientHeight-160)/72)));
    block(0,64,width,rows*72+64,'page-skeleton-card');
    let x=16;const inner=Math.max(0,width-32);
    for(const fraction of columns){
     const cell=inner*fraction,line=Math.max(0,Math.min(cell-16,cell*.55));
     block(x,84,line,8,'page-skeleton-text');
     for(let i=0;i<rows;i++){
      block(x,132+i*72,Math.min(cell-16,cell*.7),8,'page-skeleton-text');
      if(mobile||fraction===columns[0])block(x,148+i*72,Math.min(cell-16,cell*.4),8,'page-skeleton-text');
     }
     x+=cell;
    }
   }else{
    const candidates=[...root.querySelectorAll('article,fieldset,[class*="-card"],.store-detail-art,.store-thumbnails,.auth-field,.auth-actions')].filter(el=>!el.closest('footer,.page-skeleton-layer'));
    const cards=candidates.filter(el=>!candidates.some(parent=>parent!==el&&parent.contains(el))).filter(el=>{const r=el.getBoundingClientRect();return r.width>120&&r.height>60;});
    if(cards.length){
     for(const el of cards){const rect=el.getBoundingClientRect(),s=getComputedStyle(el);draw(rect,'page-skeleton-card',{background:s.backgroundColor==='rgba(0, 0, 0, 0)'?'var(--lab-surface)':s.backgroundColor,borderRadius:s.borderRadius,border:s.border});const pad=Math.min(24,rect.width*.08);draw({left:rect.left+pad,top:rect.top+pad,width:Math.max(40,(rect.width-pad*2)*.62),height:20},'page-skeleton-text');draw({left:rect.left+pad,top:rect.top+pad+36,width:Math.max(40,(rect.width-pad*2)*.85),height:14},'page-skeleton-text');if(rect.height>160)draw({left:rect.left+pad,top:rect.bottom-pad-40,width:Math.min(180,rect.width-pad*2),height:40},'');}
    }else{
     // Generic expected content, never an empty illustration or an error message.
     const available=Math.max(180,Math.min(root.clientHeight||520,640));
     block(0,0,width*.55,28);block(0,52,width*.8,16);
     for(let i=0;i<Math.max(2,Math.floor((available-100)/88));i++){block(0,100+i*88,width,56);}
    }
   }
  };
  measure();root.append(layer);root.classList.add('has-page-skeleton');root.setAttribute('aria-busy','true');root.inert=true;
  const resize=new ResizeObserver(()=>{root.classList.remove('has-page-skeleton');measure();root.classList.add('has-page-skeleton');});resize.observe(root);
  const finish=()=>{resize.disconnect();layer.remove();root.classList.remove('has-page-skeleton');root.inert=previousInert;if(previousBusy===null)root.removeAttribute('aria-busy');else root.setAttribute('aria-busy',previousBusy);};
  const timer=loading?null:setTimeout(finish,duration);
  return()=>{clearTimeout(timer);finish();};
 },[routeKey,loading,enabled]);
}
