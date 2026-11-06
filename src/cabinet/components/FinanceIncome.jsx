import React,{createContext,useContext,useEffect,useMemo,useState} from 'react';
import {PieChart,Pie,ResponsiveContainer,Sector} from 'recharts';
import {SegmentedTabs} from '../../AuthPrimitives.jsx';
import DataTable from '../../ds/DataTable.jsx';
import {ProfileCard as Card} from './Profile.jsx';
import Button from './CabinetButton.jsx';
import {euro,AS_OF} from './financeData.js';
import chevron from '../../assets/navigation/alt-arrow-right-linear.svg?raw';

export function RollingMoney({value}){
 const text=euro(value),comma=text.lastIndexOf(',');
 return <strong className="finance-rolling-money" aria-label={text}><span aria-hidden="true">{[...text].map((char,i)=>{const minor=comma>=0&&i>=comma;return <span key={text.length-i} className={(minor?'is-minor ':'')+(/\d/.test(char)?'finance-digit':'finance-money-char')}>{/\d/.test(char)?<span className="finance-digit-reel" style={{transform:`translateY(-${Number(char)*10}%)`}}>{Array.from({length:10},(_,n)=><span key={n}>{n}</span>)}</span>:char}</span>;})}</span></strong>;
}

const ChartInteraction=createContext(null);
function IncomeSector({payload:row,...props}){
 const {hover,onHover,onSource,share}=useContext(ChartInteraction);
 return <Sector {...props} className={'finance-ring-sector'+(hover&&hover!==row.source?' is-muted':'')+(hover===row.source?' is-highlighted':'')} role="button" tabIndex={0} aria-label={`${row.source}: ${euro(row.amount)}, ${share(row)}`} onFocus={()=>onHover(row.source)} onBlur={()=>onHover(null)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSource(row.source);}}} onMouseEnter={()=>onHover(row.source)} onMouseLeave={()=>onHover(null)} onClick={()=>onSource(row.source)}/>;
}

const incomeSectorShape=<IncomeSector/>;

export default function FinanceIncome({Shared,db,income,total,comparison,kind,period,offset,periods,loading,active,onKind,onOffset,onSource,designVariant=0,idPrefix='finance',onUpgrade,displayMode='segments'}){
 const [hovered,setHover]=useState(null),[focused,setFocused]=useState(null),[reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 const hover=focused||hovered;
 useEffect(()=>{const m=matchMedia('(prefers-reduced-motion: reduce)'),change=()=>setReduced(m.matches);m.addEventListener('change',change);return()=>m.removeEventListener('change',change);},[]);
 useEffect(()=>{setHover(null);setFocused(null);},[kind,offset]);
 const gross=income.reduce((sum,r)=>sum+Math.max(0,r.amount),0);
 const dataKey=JSON.stringify(income.map(r=>[r.source,r.amount,r.index]));
 const data=useMemo(()=>income.filter(r=>r.amount>0).map(r=>({...r,fill:`var(--finance-source-${r.index})`})),[dataKey]);
 const share=r=>gross>0&&r.amount>0?Math.round(r.amount/gross*100)+'%':'—';
 const trend=<span className={'fv-trend '+(comparison!==null&&comparison>=0?'is-up':'is-down')}><Shared.Icon name={comparison!==null&&comparison>=0?'graph-up-linear':'graph-down-linear'}/><strong>{comparison===null?'—':Math.abs(comparison)+'%'}</strong><small>к прошлому периоду</small></span>;
 const formatted=euro(total),comma=formatted.lastIndexOf(','),major=comma>=0?formatted.slice(0,comma):formatted,minor=comma>=0?formatted.slice(comma):'';
 const dateLabel=kind==='month'?new Date(period.from+'T00:00:00Z').toLocaleDateString('ru-RU',{month:'long',timeZone:'UTC'})+(period.from.slice(0,4)===AS_OF.slice(0,4)?'':` ${period.from.slice(2,4)}г.`):kind==='week'?`${period.from.slice(8,10)}.${period.from.slice(5,7)}${period.from.slice(0,4)===AS_OF.slice(0,4)?'':'.'+period.from.slice(2,4)} – ${period.to.slice(8,10)}.${period.to.slice(5,7)}${period.to.slice(0,4)===AS_OF.slice(0,4)?'':'.'+period.to.slice(2,4)}`:period.label;
 const dateChevron=<span className="finance-date-chevron" aria-hidden="true" dangerouslySetInnerHTML={{__html:chevron.replaceAll('black','currentColor')}}/>;
 const compactTabs=<SegmentedTabs items={periods.map(p=>({...p,label:({week:"Н",month:"М",year:"Г",all:"Все"})[p.value]}))} value={kind} onChange={onKind} label="Период начислений: неделя, месяц, год, всё время" idPrefix={idPrefix+"-period-"} panelId={idPrefix+"-sources"} className="finance-mini-tabs"/>;
 const periodControl=(<div className="finance-income-period">{designVariant===0?null:[9,10].includes(designVariant)?<Shared.Select embedded searchable={false} group={db.components.find(c=>c.name==='Auth / Select')} label="Период начислений" value={periods.find(p=>p.value===kind)?.label} items={periods.map(p=>p.label)} onChange={label=>onKind(periods.find(p=>p.label===label).value)} leadingIcon={<Shared.Icon name="calendar-date-linear"/>}/>:<SegmentedTabs items={periods} value={kind} onChange={onKind} label="Период начислений" idPrefix={idPrefix+'-period-'} panelId={idPrefix+'-sources'} className="store-category-tabs"/>}<div className="finance-period-nav">{kind!=='all'&&<Button Shared={Shared} db={db} label="Предыдущий период" icon="Auth / Icon / Back" leadingIconContent={dateChevron} size="40" tone="Soft" onClick={()=>onOffset(n=>n-1)}/>}<span>{dateLabel}</span>{kind!=='all'&&<span className="inv-next"><Button Shared={Shared} db={db} label="Следующий период" icon="Auth / Icon / Back" leadingIconContent={dateChevron} size="40" tone="Soft" disabled={offset===0} onClick={()=>onOffset(n=>n+1)}/></span>}</div></div>);
 return <Card headingActions={!designVariant?compactTabs:undefined} title={designVariant?"Начислено за период":"Начислено"} className={'finance-income-card finance-income-reference'+(!designVariant?' finance-income-horizontal'+(displayMode==='bars'?' finance-income-bars':''):'')+(designVariant?' fv-income fv-i'+designVariant:'')}>
 {loading?<div className="finance-skeleton" aria-label="Загрузка начислений"><span/><span/><span/></div>:<>
 {designVariant>0&&<div className="fv-income-summary"><span>Начислено · {period.label}</span><strong>{euro(total)}</strong>{trend}</div>}
 {!designVariant?<>
 <div className={"finance-income-value"+(income.every(r=>!r.count)?" is-zero":"")}><div className="finance-income-value-top"><RollingMoney value={total}/>{periodControl}</div>{comparison!==null&&<div className="finance-income-change"><span className={comparison>=0?'finance-positive':'finance-negative'}>{comparison>=0?'+':'−'}{Math.abs(comparison)}%</span><small>к прошлому периоду</small></div>}</div>

 <div className="finance-stacked-bar" role="group" aria-label={'Начисления по источникам: '+euro(total)}>{data.length?data.map(r=><button key={r.source} type="button" style={{flexGrow:r.amount,background:r.fill}} className={(hover&&hover!==r.source?'is-muted ':'')+(hover===r.source?'is-highlighted':'')} aria-label={`${r.source}: ${euro(r.amount)}, ${share(r)}`} title={`${r.source}: ${euro(r.amount)} · ${share(r)}`} onMouseEnter={()=>setHover(r.source)} onMouseLeave={()=>setHover(null)} onFocus={()=>setFocused(r.source)} onBlur={()=>setFocused(null)} onClick={()=>onSource(r.source)}/>):<span className="finance-stacked-empty" aria-label="Нет начислений за период"/>}</div>
 {income.some(r=>r.amount<0)&&<p className="finance-caption">Полоса показывает положительные суммы по источникам. Итог учитывает отрицательные корректировки.</p>}
 </>:<> <div className="finance-ring" role="group" aria-label={'Начислено '+euro(total)+', '+period.label}>
 {active&&<ChartInteraction.Provider value={{hover,onHover:setHover,onSource,share}}><ResponsiveContainer width="100%" height="100%"><PieChart accessibilityLayer={false}>
 {data.length?<Pie data={data} dataKey="amount" nameKey="source" cx="50%" cy="50%" innerRadius="84%" outerRadius="94%" startAngle={90} endAngle={-270} paddingAngle={data.length>1?2:0} cornerRadius={3} stroke="none" isAnimationActive={!reduced} animationBegin={0} animationDuration={400} animationEasing="cubic-bezier(0.16,1,0.3,1)" shape={incomeSectorShape}/>:<Pie data={[{amount:1,fill:'var(--lab-line)'}]} dataKey="amount" innerRadius="84%" outerRadius="94%" stroke="none" isAnimationActive={false}/>}
 </PieChart></ResponsiveContainer></ChartInteraction.Provider>}
 <div className="finance-ring-center"><span className="finance-ring-label">{designVariant===8?<Shared.Icon name="calendar-date-linear"/>:'Начислено'}</span><strong className="finance-ring-amount">{major}<small>{minor}</small></strong><span className="finance-ring-period">{period.label}</span>{comparison!==null&&<span className={'finance-ring-comparison '+(comparison>=0?'finance-positive':'finance-negative')}>{designVariant?trend:<>{comparison>0?'+':''}{comparison}% к прошлому периоду</>}</span>}</div>
 </div></>}

 {designVariant>0&&periodControl}
 <div id={idPrefix+'-sources'} data-highlighted-source={hover||undefined} className="finance-source-list" role="tabpanel" aria-labelledby={!designVariant||[9,10].includes(designVariant)?undefined:idPrefix+'-period-'+kind} aria-label={!designVariant||[9,10].includes(designVariant)?'Источники начислений':undefined} onPointerOver={e=>{const row=e.target.closest('[data-row-key]');if(row)setHover(row.dataset.rowKey);}} onPointerLeave={()=>setHover(null)} onFocusCapture={e=>{const row=e.target.closest('[data-row-key]');if(row)setFocused(row.dataset.rowKey);}} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))setFocused(null);}}>
 <h3>По источникам</h3><DataTable Shared={Shared} layout="records" label="Источники начислений" rows={income} rowKey={r=>r.source} columns={[
 {key:'source',label:'Источник',width:'minmax(0,2fr)',render:r=><div className={"finance-source-name"+(!r.count?" is-zero":"")}>{designVariant?<span className={'fv-source-icon finance-source-'+r.index}><Shared.Icon name={['chart-square-linear','card-transfer-linear','users-group-rounded-linear','bolt-linear','refresh-circle-linear'][r.index]||'calendar-date-linear'}/></span>:<span className={'finance-source-dot finance-source-'+r.index}/>}<span><strong>{r.source}</strong><small>Начислений: {r.count}</small>{displayMode==='bars'&&<span className="finance-source-track" aria-hidden="true"><span style={{width:gross>0?Math.max(0,r.amount)/gross*100+'%':'0%',background:`var(--finance-source-${r.index})`}}/></span>}</span></div>},
 {key:'amount',label:'Сумма и доля',width:'minmax(0,1fr)',render:r=><div className={"finance-source-amount"+(!r.count?" is-zero":"")+(hover===r.source?" is-active":"")}><button type="button" className="finance-row-trigger" aria-label={`Операции: ${r.source}`} onClick={e=>{e.stopPropagation();onSource(r.source);}}>{euro(r.amount)}</button><small>{share(r)}</small></div>}
 ]} onRowClick={r=>onSource(r.source)}/>
 </div>
 {!designVariant&&onUpgrade&&<div className="finance-income-upgrade"><div><span className="finance-caption">Больше возможностей</span><h3>Перейдите на Профи</h3><p>С одной покупки засчитывается до 1 100 € вместо 693 €.</p><Button Shared={Shared} db={db} label="Повысить пакет" size="40" tone="Soft" onClick={onUpgrade}/></div><span className="finance-upgrade-symbol" aria-hidden="true"><Shared.Icon name="box-linear"/></span></div>}
 </>}
 </Card>;
}
