import React,{useEffect,useRef,useState} from 'react';
import Genealogy from './Genealogy.jsx';
import GenealogyCardIdeas from './GenealogyCardIdeas.jsx';
import GenealogyRegistration from './GenealogyRegistration.jsx';
import {genealogyCells,outermost,formatPoints,activityLabel,dataAsOf} from './genealogyData.js';
import {BannerCard} from './Cards.jsx';
import './genealogy-workspace.css';

export function TreeDialog({title,onClose,Shared,db,children,footer,compact=false}){
 const ref=useRef(null),close=useRef(onClose);close.current=onClose;
 useEffect(()=>{const d=ref.current,previous=document.activeElement;d.showModal();const trap=e=>{if(e.key!=='Tab')return;const els=[...d.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]')].filter(el=>el.getClientRects().length);const first=els[0],last=els.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}};d.addEventListener('keydown',trap);return()=>{d.removeEventListener('keydown',trap);d.close();if(previous?.isConnected)previous.focus({preventScroll:true});};},[]);
 return <dialog ref={ref} className={`participant-dialog tree-dialog${compact?' tree-confirm-dialog':''}`} aria-labelledby="tree-dialog-title" onCancel={e=>{e.preventDefault();close.current();}}>
  <div className="participant-heading"><h2 id="tree-dialog-title">{title}</h2><Shared.Button group={db.components.find(c=>c.name==='Boris / Icon button')} choice={{Tone:'Ghost',Size:'40'}} ariaLabel="Закрыть окно" iconContent={<Shared.Icon name="Cross"/>} onClick={onClose}/></div><div className="participant-scroll">{children}</div>{footer&&<div className="participant-actions tree-dialog-actions">{footer}</div>}
 </dialog>;
}

// All scenarios below are fixtures. No registration requests or account mutations.
function fixture(member,scenario,activeCell){
 let list=genealogyCells.map(c=>({...c}));
 if(scenario==='empty'||scenario==='extra-slots'||scenario==='slot-taken')list=list.slice(0,1).map(c=>({...c,points:[0,0],counts:[0,0]}));
 if(scenario==='single')list=list.slice(0,2).map(c=>({...c,points:c.path?[0,0]:[2400,0],counts:c.path?[0,0]:[1,0]}));
 if(scenario==='own-cells'){
  list=list.map(c=>['L','R'].includes(c.path)?{...c,login:`alexandra92${c.path.toLowerCase()}`,name:list[0].name,personal:true,ownExtra:true,photo:null}:c);
 }
 if(activeCell){
  list=list.filter(c=>c.path.startsWith(activeCell)).map(c=>({...c,path:c.path.slice(activeCell.length),personal:c.path===activeCell,photo:null,sponsor:{login:'alexandra92'}}));
 }
 list[0]={...list[0],state:member==='partner-no-package'?'partner':member,pack:member==='partner-no-package'?null:list[0].pack,points:member==='frozen'?[0,0]:member==='partner-no-package'?[null,null]:list[0].points};
 return list;
}
export default function GenealogyWorkspace({Shared,db,photo,member='partner',scenario='ready',navigate,activeCell='',setActiveCell,session,setSession,icon,onReturnList}){
 const {sides,registered}=session;
 const setSides=update=>setSession(p=>({...p,sides:update(p.sides)}));
 const setRegistered=update=>setSession(p=>({...p,registered:update(p.registered)}));
 const [modal,setModal]=useState(null),[toast,setToast]=useState(''),[recovered,setRecovered]=useState(false),[navigation,setNavigation]=useState(null),[operationError,setOperationError]=useState('');
 const timer=useRef(null);
 useEffect(()=>{setRecovered(false);setModal(null);setOperationError('');setNavigation(null);},[scenario,member,activeCell]);
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 const notify=text=>{setToast(text);clearTimeout(timer.current);timer.current=setTimeout(()=>setToast(''),3500);};
 const cells=fixture(member,scenario,activeCell),owner=cells[0],side=sides[activeCell]||(activeCell==='R'?'R':'L');
 const pending=registered.filter(r=>r.owner===owner.login);
 const next=outermost(side,cells),slots=['L','R'].filter(s=>!cells.some(c=>c.path===s));
 const blocked=['newcomer','client','deactivated'].includes(member),frozen=member==='frozen';
 const Button=({label,onClick,tone='Outline',disabled=false})=><Shared.Button group={db.components.find(c=>c.name==='Boris / Button')} choice={{Tone:tone,Size:'48'}} label={label} onClick={onClick} disabled={disabled}/>;
 const context=`${scenario}-${member}-${activeCell}`;
 const go=path=>setNavigation({path,context,at:Date.now()});
 const retry=()=>setRecovered(true);
 const scenarioError=['error','denied'].includes(scenario)&&!recovered;
 if(new URLSearchParams(location.search).get('cards')==='ideas')return <GenealogyCardIdeas Shared={Shared} db={db} photo={photo}/>;
 return <section className="genealogy tree-workspace" data-member={member} aria-label="Управление структурой">
  {blocked?<div className="tree-content-state"><h2>{member==='newcomer'?'Структура появится после первой оплаты':member==='client'?'Генеалогия доступна партнёрам':'Ячейка деактивирована'}</h2><p>{member==='deactivated'?'Ячейка деактивирована 01.10.2026. Стать партнёром снова можно только новой регистрацией.':'Оплатите активность, чтобы открыть свою структуру.'}</p>{member!=='deactivated'&&<Button tone="Primary" label={member==='client'?'Стать партнёром – 120 € в год':'Оплатить активность – 120 €'} onClick={()=>navigate('shop','activity')}/>}</div>
  :scenario==='loading'&&!recovered?<div className="tree-content-state" role="status" aria-busy="true"><h2>Загружаем структуру</h2><div className="tree-skeleton"/><div className="tree-skeleton"/><Button label="Повторить загрузку" onClick={retry}/></div>
  :scenarioError?<div className="tree-content-state" role="alert"><h2>{scenario==='denied'?'Этот участник не в вашей структуре':'Структура временно недоступна'}</h2><p>{scenario==='denied'?'Можно смотреть только свою ячейку и участников под ней.':'Попробуйте через минуту.'}</p><Button label={scenario==='denied'?'К своей ячейке':'Обновить'} onClick={retry}/></div>
  :<>
   {scenario==='own-cells'&&<div className="tree-own-cells" aria-label="Мои ячейки">{[['','Основная'],['L','Слева'],['R','Справа']].map(([path,label])=><Button key={path} label={`alexandra92${path.toLowerCase()} · ${label}`} tone={activeCell===path?'Primary':'Soft'} onClick={()=>setActiveCell(path)}/>)}</div>}
   {['frozen','grace','partner-no-package'].includes(member)&&<div className="overview-comparison tree-notice"><BannerCard attention title={frozen?'Партнёрство заморожено':member==='grace'?'Продлите активность до 12.11':'Выберите пакет для начислений'} description={frozen?'Баллы в ногах сгорели. Приглашения остановлены, дерево доступно для просмотра.':member==='grace'?'Сейчас партнёрство ещё активно. Продлите его, чтобы сохранить баллы.':'Годовая активность оплачена, но без пакета баллы в ваши ноги не засчитываются. Объём идёт вверх по структуре.'} icon={icon(frozen?'snowflake':member==='grace'?'calendar':'box')} action={<Button tone="Primary" label={frozen?'Восстановить за 240 €':member==='grace'?'Продлить за 240 €':'Выбрать пакет'} onClick={()=>navigate('shop',frozen?'restore':member==='grace'?'renewal':'packages')}/>}/></div>}
   {scenario==='calculating'&&<p className="tree-state-note" role="status">Идёт расчёт. Баллы и шаги обновятся до 10:00 МСК. Сейчас показан расчёт на {dataAsOf}.</p>}
   {cells.length===1&&<div className="tree-empty-note"><p>Пока в структуре никого нет. Зарегистрируйте участника – он появится после первой оплаты.</p></div>}
   {pending.length>0&&<div className="tree-pending"><Button label={`Ожидают первой оплаты: ${pending.length}`} onClick={()=>setModal({kind:'pending'})}/></div>}
   <Genealogy onReturnList={onReturnList} key={`${scenario}-${member}-${activeCell}`} Shared={Shared} db={db} photo={photo} cells={cells} placementSide={side} navigation={navigation?.context===context?navigation:null} placementDisabled={frozen} onPlacementChange={value=>{if(value===side)return;setOperationError('');setModal({kind:'placement',side:value});}}/>
  </>}
  {modal&&<TreeDialog title={modal.kind==='pending'?'Ожидают первой оплаты':modal.kind==='placement'?'Изменить сторону размещения?':modal.kind==='success'?'Участник зарегистрирован':'Регистрация участника'} Shared={Shared} db={db} compact={modal.kind==='placement'} footer={modal.kind==='placement'?<><Button label="Отмена" tone="Soft" onClick={()=>setModal(null)}/><Button label="Изменить" tone="Primary" onClick={()=>{if(scenario==='save-error'){setOperationError('Не удалось изменить сторону. Прежний выбор сохранён. Попробуйте ещё раз.');return;}setSides(p=>({...p,[activeCell]:modal.side}));setModal(null);notify('Сторона размещения изменена');}}/></>:undefined} onClose={()=>setModal(null)}>
   {modal.kind==='pending'?<div className="tree-dialog-copy"><p>Эти участники ещё не занимают место в дереве. После первой оплаты система разместит их по выбранной на тот момент стороне.</p>{pending.map(record=><p key={record.login}><strong>{record.login}</strong> · зарегистрирован · осталось 7 дней</p>)}</div>:modal.kind==='placement'?<div className="tree-dialog-copy"><div className="tree-confirm-side"><span>Новая сторона</span><strong>{modal.side==='L'?'Левая нога':'Правая нога'}</strong></div><p>Новые приглашённые будут размещаться в этой ноге. Участники, которые уже находятся в дереве, останутся на своих местах.</p><p className="tree-confirm-note">Для зарегистрированных, но ещё не оплативших участников сторона определяется в момент первой оплаты.</p>{operationError&&<p className="tree-error" role="alert">{operationError}</p>}</div>
   :modal.kind==='success'?<div className="tree-dialog-copy"><p><strong>{modal.login}</strong> появится в структуре после первой оплаты – покупки или активности.</p><p>Если оплаты не будет 7 дней, регистрация удалится.</p>{modal.extra&&<p>Место под основной ячейкой проверяется повторно при оплате.</p>}<Button label="Готово" tone="Primary" onClick={()=>setModal(null)}/></div>
   :<GenealogyRegistration Shared={Shared} db={db} owner={owner} side={side} slots={slots} extraAllowed={!activeCell&&slots.length>0} registered={[...cells,...registered]} fail={scenario==='registration-error'} collision={scenario==='slot-taken'} Button={Button} onComplete={record=>{setRegistered(p=>[...p,{...record,owner:owner.login}]);setModal({kind:'success',...record});notify('Регистрация завершена в демо');}}/>}
  </TreeDialog>}
  {toast&&<div className="auth-toast" role="status">{toast}</div>}
 </section>;
}
