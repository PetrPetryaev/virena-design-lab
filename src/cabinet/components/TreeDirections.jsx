import React,{useState,useRef,useEffect} from 'react';
import {flushSync} from 'react-dom';
import {genealogyCells} from './genealogyData.js';
import './tree-directions.css';
const names=['anna_m','mikhail_k','elena_s','andrey_v','sergey_p','marina_k'];
function Portrait({person,photo}){const p=photo||person?.photo;return <span className="td-avatar" aria-hidden="true">{p?(typeof p==='string'?<img src={p} alt=""/>:<span style={{backgroundImage:`url(${p.src})`,backgroundSize:p.size,backgroundPosition:p.position}}/>):(person?.name||person?.login||'АП').split(/[ _]/).slice(0,2).map(s=>s[0]).join('').toUpperCase()}</span>;}
export default function TreeDirections({photo}){
 const variant='soft';
 const [view,setView]=useState({root:'team_north',parents:['sergey_p','alexandra92']});
 const [busy,setBusy]=useState(false);
 const [scale,setScale]=useState(1);const viewport=useRef(null);
 useEffect(()=>{const fit=()=>{const el=viewport.current;if(!el)return;const height=Math.max(240,innerHeight-el.getBoundingClientRect().top-24);setScale(Math.min(1,el.clientWidth/1120,height/(view.parents.length?940:750)));};const observer=new ResizeObserver(fit);observer.observe(viewport.current);window.addEventListener('resize',fit);fit();return()=>{observer.disconnect();window.removeEventListener('resize',fit);};},[view.parents.length]);
 const inside=view.parents.length>0;
 const content=useRef(null),locked=useRef(false),alive=useRef(true),animations=useRef([]);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;animations.current.forEach(a=>a.cancel());};},[]);
 const navigate=async(root,direction='down',parents)=>{
  if(locked.current)return;
  const next={root,parents:parents??[view.root,...view.parents]};
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){setView(next);return;}
  locked.current=true;setBusy(true);
  const sign=direction==='down'?-1:1;
  try{
   const leave=content.current.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:`translateY(${sign*40}px)`}],{duration:160,easing:'cubic-bezier(.4,0,1,1)',fill:'forwards'});
   animations.current=[leave];await leave.finished;
   if(!alive.current)return;
   flushSync(()=>setView(next));leave.cancel();
   const enter=content.current.animate([{opacity:0,transform:`translateY(${-sign*40}px)`},{opacity:1,transform:'translateY(0)'}],{duration:240,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'});
   animations.current=[enter];await enter.finished;enter.cancel();
  }catch(error){if(error.name!=='AbortError')throw error;}
  finally{locked.current=false;if(alive.current)setBusy(false);}
 };
 const up=()=>{if(inside)navigate(view.parents[0],'up',view.parents.slice(1));};
 const own=genealogyCells[0];
 const people=names.map(login=>genealogyCells.find(c=>c.login===login));
 const Card=({person,root=false,leaf=false,stack=0})=><div className={`td-node ${root?'td-root-node':''} ${leaf?'td-leaf':''} ${stack?'td-stacked-down':''}`}>
  <button className="td-card" onClick={()=>root?up():navigate(person.login)} aria-label={`Посмотреть композицию на уровне ${person.login}`}>
   <span className="td-person"><Portrait person={person} photo={person===own?photo:null}/><span><strong>{person.login}</strong><small>{person.personal?person.name:'Участник структуры'}</small></span><span className="td-rank">{person.rank?'★'.repeat(person.rank):'—'}</span></span>
   {!leaf&&<><span className="td-package">{person.pack||'Без пакета'}<span>•</span>{person===own?'Ваша ячейка':'Партнёр'}</span><span className="td-numbers"><span><small>Левая нога</small><b>{person.points[0]?.toLocaleString('ru-RU')??'—'}</b></span><span><small>Правая нога</small><b>{person.points[1]?.toLocaleString('ru-RU')??'—'}</b></span></span></>}
  </button>
  {stack>0&&<button className="td-continuation" onClick={()=>navigate(person.login)}><span>Ещё {stack} уровня</span><span aria-hidden="true">↓</span></button>}
 </div>;
 return <section className={`tree-directions td-${variant}`}>
  <div className="td-review"><div><small>ВИЗУАЛЬНЫЕ НАПРАВЛЕНИЯ · ЛОКАЛЬНЫЙ ЭСКИЗ</small><h2>Карточки, связи и скрытые уровни</h2><p>Одна композиция для сравнения. Это условный фрагмент, не новые бизнес-правила.</p></div><a href="?tab=cabinet&page=genealogy">Вернуться к прототипу</a></div>

  <div className="td-description"><p>Выбранное направление · точки, низкие стеки и мягкие переходы</p><div><button disabled={busy||!inside} onClick={up}>↑ Переход выше</button><button disabled={busy} onClick={()=>navigate(people[0].login)}>Переход ниже ↓</button></div></div>
  <div className="td-scroll" ref={viewport}><div className="td-fit" style={{width:1120*scale,height:(inside?940:750)*scale}}><div className={`td-scene ${inside?'has-parents':'at-start'}`} style={{transform:`scale(${scale})`,transformOrigin:'top left'}} aria-busy={busy}><div className="td-scene-content" ref={content} inert={busy||undefined}>
   <svg className="td-links" viewBox="0 0 1120 940" aria-hidden="true">
    <path d="M 406 350 H 302 Q 270 350 270 382 V 486"/>
    <path d="M 714 350 H 818 Q 850 350 850 382 V 486"/>
    <path d="M 116 565 H 105 Q 80 565 80 590 V 721"/>
    <path d="M 424 565 H 440 Q 465 565 465 590 V 721"/>
    <path d="M 696 565 H 680 Q 655 565 655 590 V 721"/>
    <path d="M 1004 565 H 1020 Q 1045 565 1045 590 V 721"/>
   </svg>
   <div className="td-above">{inside?<>
    <button className="td-up-pill" onClick={()=>navigate('alexandra92','up',[])}>{view.parents.length>1?`↑ ${view.parents.length} уровня выше`:'Начало'}</button>
    <button className="td-parent-card" onClick={up}><Portrait person={genealogyCells.find(c=>c.login===view.parents[0])}/><span><strong>{view.parents[0]}</strong><small>{genealogyCells.find(c=>c.login===view.parents[0])?.personal?genealogyCells.find(c=>c.login===view.parents[0])?.name:'Участник структуры'}</small></span></button>
    <div className="td-upper-stack" aria-hidden="true"/>
   </>:<span className="td-start">Ваша ячейка · начало структуры</span>}</div>
   <div className="td-root"><Card person={genealogyCells.find(c=>c.login===view.root)} root/></div>
   <div className="td-first td-first-left"><Card person={people[0]}/></div><div className="td-first td-first-right"><Card person={people[1]}/></div>
   <div className="td-last td-last-one"><Card person={people[2]} leaf stack={2}/></div><div className="td-last td-last-two"><Card person={people[3]} leaf/></div><div className="td-last td-last-three"><Card person={people[4]} leaf stack={3}/></div><div className="td-last td-last-four"><Card person={people[5]} leaf/></div>
  </div></div></div></div>
  <p className="td-caption">Стек появляется только у скрытого продолжения. У Анны и Михаила дети уже видны – дополнительных слоёв под ними нет. Карточка или нижний пилл – спуск; верхняя карточка – подъём. Движение демонстрационное, структура условная.</p>
 </section>;
}
