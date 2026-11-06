import React,{useState} from 'react';
import {SegmentedTabs} from '../../AuthPrimitives.jsx';
import Button from './CabinetButton.jsx';
import Dialog from './CabinetDialog.jsx';
import FinanceIncome from './FinanceIncome.jsx';
import VariantCard from './FinanceVariantCards.jsx';
import {variantFamilies,variantConcepts,recommendedVariants,pendingGroups} from './financeVariantData.js';
import {ledgerFor,periodBounds,incomeFor,euro} from './financeData.js';
import './finance-variants.css';
const periods=[{value:'week',label:'Неделя'},{value:'month',label:'Месяц'},{value:'year',label:'Год'},{value:'all',label:'Всё время'}];
const storageKey='virena-finance-design-selection-v1';
function IncomeProposal({n,Shared,db,onAction,instance}){
 const [kind,setKind]=useState('month'),[offset,setOffset]=useState(0);
 const period=periodBounds(kind,offset),ledger=ledgerFor('ready','partner'),income=incomeFor(ledger,period),total=income.reduce((s,r)=>s+r.amount,0),previous=incomeFor(ledger,periodBounds(kind,offset-1)).reduce((s,r)=>s+r.amount,0);
 return <FinanceIncome {...{Shared,db,income,total,kind,period,offset,periods}} comparison={kind==='all'||!previous?null:Math.round((total-previous)/Math.abs(previous)*100)} active designVariant={n} idPrefix={instance+'-income-'+n} onKind={v=>{setKind(v);setOffset(0);}} onOffset={setOffset} onSource={source=>onAction('source',source)}/>;
}
export default function FinanceDesignGallery({Shared,db,navigate}){
 const [family,setFamily]=useState('balance'),[wide,setWide]=useState(false),[modal,setModal]=useState(null);
 const [selected,setSelected]=useState(()=>{try{const saved=JSON.parse(localStorage.getItem(storageKey));return Object.fromEntries(variantFamilies.map(f=>[f.value,Number.isInteger(saved?.[f.value])&&saved[f.value]>=1&&saved[f.value]<=10?saved[f.value]:1]));}catch{return {...recommendedVariants};}});
 const choose=(key,n)=>{const next={...selected,[key]:n};setSelected(next);localStorage.setItem(storageKey,JSON.stringify(next));};
 const onAction=(action,source)=>{if(action==='tree'){navigate('genealogy');return;}if(action==='details'){navigate('details');return;}setModal({action,source});};
 const card=(key,n,instance)=>key==='income'?<IncomeProposal {...{Shared,db,onAction,n,instance}}/>:<VariantCard {...{Shared,db,onAction,n}} family={key}/>;
 const families=family==='all'?variantFamilies:variantFamilies.filter(f=>f.value===family);
 const titles={withdraw:'Заявка на вывод',upgrade:'Повышение до Профи',cap:'Ограничение пакета',points:'Баллы бинарного дерева',pending:'Ожидаемые поступления',source:modal?.source};
 return <div className="profile genealogy finances finance-design-gallery">
 <div className="fv-gallery-intro"><div><h2>50 направлений для финансов</h2><p>По 10 композиций на блок. Выберите понравившиеся и откройте «Моя сборка».</p><small>Демо-данные на 5 ноября 2026. Действия в карточках открывают демонстрационные детали.</small></div><a className="finance-row-trigger" href="?tab=cabinet&page=finances">Вернуться к финансам</a></div>
 <div className="fv-gallery-toolbar"><SegmentedTabs items={[...variantFamilies,{value:'all',label:'Все 50'},{value:'assembly',label:'Моя сборка'}]} value={family} onChange={setFamily} label="Семейство вариантов" idPrefix="fv-family-" panelId="fv-gallery-panel"/>{family!=='assembly'&&<Button {...{Shared,db}} label={wide?'Две колонки':'На всю ширину'} tone="Soft" onClick={()=>setWide(v=>!v)}/>}</div>
 <div id="fv-gallery-panel" role="tabpanel" aria-labelledby={'fv-family-'+family}>
 {family==='assembly'?<><p className="fv-assembly-caption">Выбрано: {variantFamilies.map(f=>f.prefix+String(selected[f.value]).padStart(2,'0')).join(' · ')}</p><div className="fv-assembly"><div className="fv-assembly-left">{['balance','package','binary','pending'].map(key=><React.Fragment key={key}>{card(key,selected[key],'assembly')}</React.Fragment>)}</div><div>{card('income',selected.income,'assembly')}</div></div></>:families.map(f=><section className="fv-family" key={f.value}><h2>{f.label} <span>10 вариантов</span></h2><div className={'fv-gallery-grid'+(wide?' is-wide':'')}>{variantConcepts[f.value].map(([name,description],i)=><article className="fv-proposal" data-variant={f.prefix+String(i+1).padStart(2,'0')} key={i}><header><div><span className="fv-proposal-code">{f.prefix}{String(i+1).padStart(2,'0')}{i===0?' · выбор UI-эксперта':''}</span><h3>{name}</h3><p>{description}</p></div><Button {...{Shared,db}} label={selected[f.value]===i+1?'Выбрано':'Выбрать'} tone={selected[f.value]===i+1?'Primary':'Soft'} onClick={()=>choose(f.value,i+1)}/></header>{card(f.value,i+1,'gallery')}</article>)}</div></section>)}
 </div>
 {modal&&<Dialog {...{Shared,db}} title={titles[modal.action]} onClose={()=>setModal(null)} footer={<Button {...{Shared,db}} label="Закрыть" tone="Soft" onClick={()=>setModal(null)}/>}><div className="fv-modal-details">
 {modal.action==='withdraw'&&<><p>Доступно к выводу</p><h3>{euro(128460)}</h3><p>Минимальная сумма – 50 €. Заявка оформляется с выбранными реквизитами и подтверждением.</p><a className="finance-row-trigger" href="?tab=cabinet&page=finances">Открыть рабочий сценарий вывода</a></>}
 {modal.action==='upgrade'&&<><h3>Стандарт → Профи</h3><p>Доплата: 407 €. Порог Профи: 1 100 €.</p><p>Ещё 41 день можно повысить пакет только с доплатой, без дополнительной покупки.</p><p>Новый пакет действует с момента оплаты. Прошлые покупки не пересчитываются.</p></>}
 {modal.action==='cap'&&<><p>В ноябре ограничение Стандарта уменьшило ВЗР на {euro(19926)}.</p><p>С одной покупки засчитывается до 693 € / 104 BV. Повышение пакета не возвращает недополученное за прошлые покупки.</p></>}
 {modal.action==='points'&&<><p>Левая нога: 600 BV. Правая: 160 BV.</p><p>До следующего цикла: ещё 140 BV справа.</p><p>01.12.2026 истекает срок 210 BV левой ноги.</p><Button {...{Shared,db}} label="Открыть дерево" onClick={()=>navigate('genealogy')}/></>}
 {modal.action==='pending'&&pendingGroups.map(r=><div className="fv-modal-row" key={r.id}><strong>{r.date}</strong><span>{r.source}</span><b>{euro(r.amount)}</b></div>)}
 {modal.action==='source'&&<><p>Операции источника «{modal.source}» доступны в истории финансов.</p><a className="finance-row-trigger" href="?tab=cabinet&page=finances&financeView=history">Открыть историю операций</a></>}
 </div></Dialog>}
 </div>;
}
