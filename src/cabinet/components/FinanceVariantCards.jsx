import React from 'react';
function Card({children,className}){return <section className={'profile-card '+className}>{children}</section>;}
import Button from './CabinetButton.jsx';
import MemberPackage from './MemberPackage.jsx';
import TreeLegMetrics from './TreeLegMetrics.jsx';
import DataTable from '../../ds/DataTable.jsx';
import {euro,financeSnapshot} from './financeData.js';
import {pendingGroups} from './financeVariantData.js';

export function VariantIcon({Shared,name='wallet-money-linear',large=false}){return <span className={'fv-icon'+(large?' is-large':'')} aria-hidden="true"><Shared.Icon name={name}/></span>;}
function Facts({items}){return <dl className="fv-facts">{items.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;}
export default function FinanceVariantCards({family,n,Shared,db,onAction}){
 const action=(label,event,tone='Soft',icon)=><Button Shared={Shared} db={db} label={label} tone={tone} leadingIconContent={icon?<Shared.Icon name={icon} tintColor={tone==='Primary'?'var(--lab-on-accent, white)':undefined}/>:undefined} onClick={()=>onAction(event)}/>;
 const glyph=(name,large)=> <VariantIcon Shared={Shared} name={name} large={large}/>;
 const cls=`fv-card fv-${family} fv-${family}-${n}`;
 const facts=<Facts items={[["Выведено в 2026",euro(30000)],["09 ноября",'+'+euro(2600)]]}/>;
 const balance=<div className="fv-balance-number"><span>Доступно к выводу</span><strong>{euro(financeSnapshot.available)}</strong><small>EUR · личный счёт</small></div>;
 const buttons=<div className="fv-actions">{action('Реквизиты','details')}{action(n===8?'Заявка на вывод':'Оформить вывод','withdraw','Primary')}</div>;
 const next=<div className="fv-next">{glyph('clock-circle-linear')}<div><small>Ближайшее поступление · 09 ноября</small><strong>+{euro(2600)}</strong></div></div>;
 const identity=<div className="fv-identity">{glyph('wallet-money-linear',n===10)}<div><span>Ваши финансы</span><h3>Личный счёт</h3></div><Shared.Status label="EUR"/></div>;
 if(family==='balance')return <Card className={cls} title="">
 {n===1&&<>{identity}<div className="fv-main-row">{balance}{buttons}</div>{facts}</>}
 {n===2&&<><div className="fv-split">{balance}<aside><h3>Управление счётом</h3>{buttons}</aside></div>{facts}</>}
 {n===3&&<><div className="fv-wallet-face">{identity}{balance}</div>{buttons}{next}</>}
 {n===4&&<><div className="fv-editorial">{glyph('wallet-money-linear')}{balance}</div>{buttons}{facts}</>}
 {n===5&&<><h3>Ваши финансы</h3><div className="fv-three-time">{balance}<aside>{next}<small>Уже выведено</small><strong>{euro(30000)}</strong></aside></div>{buttons}</>}
 {n===6&&<>{identity}<div className="fv-center">{balance}{buttons}</div>{next}</>}
 {n===7&&<><div className="fv-main-row">{balance}{glyph('wallet-money-linear',true)}</div>{facts}{buttons}</>}
 {n===8&&<>{balance}{next}<div className="fv-footer"><span>Выведено за год · {euro(30000)}</span>{buttons}</div></>}
 {n===9&&<>{balance}<div className="fv-action-panel"><p>Выберите сумму и подтвердите заявку</p>{buttons}</div>{facts}</>}
 {n===10&&<><div className="fv-center">{glyph('wallet-money-linear',true)}{balance}{buttons}</div>{facts}</>}
 </Card>;
 const packageIdentity=<div className="fv-identity">{glyph('box-linear',true)}<div><span>Ваш пакет</span><h3>Стандарт</h3></div></div>;
 const current=<div className="fv-package-current"><small>Сейчас</small><MemberPackage pack="Стандарт"/><strong>693 €</strong><span>до 104 BV с одной покупки</span></div>;
 const upgrade=<div className="fv-upgrade-offer"><small>Следующий пакет</small><h3>Профи</h3><strong>407 € <small>доплата</small></strong>{action('Перейти на Профи','upgrade','Primary','medal-ribbon-star-linear')}</div>;
 const benefits=<div className="fv-benefits"><div>{glyph('box-linear')}<span>Пакет <strong>Профи</strong> вместо Стандарта</span></div><div>{glyph('calendar-date-linear')}<span>Условие перехода: порог <strong>1 100 €</strong> вместо 693 €</span></div></div>;
 const packageFoot=<details className="fv-disclosure"><summary>Условия повышения</summary><p>Доплата 407 € · без дополнительной покупки ещё 41 день.</p><p>Пакет действует с оплаты. Прошлые покупки не пересчитываются.</p>{action('Посмотреть условия','upgrade')}</details>;
 const loss=<button className="finance-row-trigger" onClick={()=>onAction('cap')}>Не засчитано в ноябре: {euro(19926)} ВЗР</button>;
 if(family==='package')return <Card className={cls} title="">
 {n===1&&<><h3>Ваш следующий шаг</h3><div className="fv-package-compare">{current}{upgrade}</div>{benefits}{packageFoot}</>}
 {n===2&&<>{packageIdentity}<Facts items={[["База покупки","693 €"],["Засчитывается","до 104 BV"]]}/>{upgrade}{packageFoot}</>}
 {n===3&&<><h3>Ваш пакет</h3><div className="fv-ladder">{['Стандарт','Профи','ВИП'].map((p,i)=><div key={p} className={i===0?'is-current':''}>{glyph('medal-ribbon-star-linear')}<MemberPackage pack={p}/><small>{i===0?'Сейчас':i===1?'Следующий':'Позже'}</small></div>)}</div>{upgrade}{packageFoot}</>}
 {n===4&&<>{packageIdentity}<h3>Условия перехода на Профи</h3>{benefits}{upgrade}{packageFoot}</>}
 {n===5&&<>{current}<div className="fv-limit"><small>Порог следующего пакета</small><strong>1 100 €</strong><span>До Профи – 407 €</span></div>{action('Повысить пакет','upgrade','Primary')}{packageFoot}</>}
 {n===6&&<>{packageIdentity}<p>С покупки учитывается до 693 € / 104 BV</p>{upgrade}{packageFoot}</>}
 {n===7&&<><div className="fv-identity">{glyph('calendar-date-linear')}<div><span>Условие повышения</span><h3>Ещё 41 день</h3></div></div><p>Переход на Профи только с доплатой, без дополнительной покупки.</p>{current}{upgrade}{packageFoot}</>}
 {n===8&&<>{packageIdentity}<div className="fv-impact"><small>Срезано потолком в ноябре</small><strong>{euro(19926)}</strong><span>ВЗР · прошлые покупки не пересчитываются</span>{loss}</div>{upgrade}{packageFoot}</>}
 {n===9&&<><div className="fv-package-compare">{current}<div className="fv-next-passport">{glyph('medal-ribbon-star-linear',true)}<MemberPackage pack="Профи"/><strong>1 100 €</strong><span>Порог пакета</span></div></div><div className="fv-ticket"><strong>Доплатить 407 €</strong>{action('Перейти на Профи','upgrade','Primary')}</div>{packageFoot}</>}
 {n===10&&<>{packageIdentity}<p>693 € / 104 BV с одной покупки</p>{loss}<div className="fv-ticket"><div><small>Следующий пакет</small><h3>Профи · 407 €</h3></div>{action('Повысить','upgrade','Primary')}</div>{packageFoot}</>}
 </Card>;
 const legs=<TreeLegMetrics points={[600,160]} showStrength unit="BV" className="fv-tree-legs"/>;
 const target=<div className="fv-target">{glyph('graph-up-linear')}<div><small>До следующего цикла</small><strong>+140 BV <span>справа</span></strong></div></div>;
 const expiry=<button className="fv-expiry finance-row-trigger" onClick={()=>onAction('points')}><Shared.Icon name="calendar-date-linear"/>01.12 сгорит 210 BV левой ноги</button>;
 const binaryHeader=<div className="fv-header"><div className="fv-identity">{glyph('chart-square-linear')}<h3>Ваш бинар</h3></div>{<Button Shared={Shared} db={db} label="В дерево" tone="Soft" leadingIcon="Virena / Navigation icon / Branch" onClick={()=>onAction('tree')}/>}</div>;
 const report=<Facts items={[["Циклов в ноябре","1"],["Шагов всего","33"],["Расчёт","05.11 · 09:40"]]}/>;
 if(family==='binary')return <Card className={cls} title="">
 {binaryHeader}
 {n===1&&<>{legs}{target}{expiry}</>}
 {n===2&&<><div className="fv-weak"><small>Правая нога · слабее</small><strong>160 BV</strong><Shared.Status tone="Info" label="Усилить"/><span>Левая нога · 600 BV</span></div>{target}{expiry}</>}
 {n===3&&<>{legs}<div className="fv-cycle-bridge"><span>Сейчас<br/><strong>160 BV справа</strong></span>{glyph('graph-up-linear')}<span>До цикла<br/><strong>ещё 140 BV</strong></span></div>{expiry}</>}
 {n===4&&<>{target}<div className="fv-progress" role="meter" aria-label="Объём правой ноги для цикла" aria-valuemin={0} aria-valuemax={300} aria-valuenow={160}><span style={{width:(160/300*100)+'%'}}/></div><p>160 из 300 BV в правой ноге</p>{legs}{expiry}</>}
 {n===5&&<><div className="fv-volume-bars">{[600,160].map((v,i)=><div key={v}><strong>{v} BV</strong><div><span style={{height:(v/600*100)+'%'}}/></div><span>{i?'Правая':'Левая'}</span></div>)}</div>{target}{expiry}</>}
 {n===6&&<>{report}{legs}{target}{expiry}</>}
 {n===7&&<><div className="fv-warning-panel">{expiry}<p>Проверьте срок баллов в истории</p>{action('Проверить баллы','points')}</div>{legs}{target}</>}
 {n===8&&<><div className="fv-cycle-hero"><small>До следующего цикла</small><strong>140 <span>BV</span></strong><p>Нужно добавить в правую ногу</p></div>{legs}{expiry}</>}
 {n===9&&<><div className="fv-report-date">{glyph('calendar-date-linear')}<span>Последний расчёт<br/><strong>05 ноября · 09:40 МСК</strong></span></div>{legs}<Facts items={[["Циклов в ноябре","1"],["Шагов всего","33"]]}/>{target}{expiry}</>}
 {n===10&&<>{legs}<div className="fv-binary-footer"><span>До цикла<br/><strong>140 BV справа</strong></span><span>Циклов в ноябре<br/><strong>1</strong></span></div>{expiry}</>}
 </Card>;
 const pendingItem=(r,calendar=false)=><div className="fv-pending-item" key={r.id}>{calendar?<span className="fv-date-tile"><strong>{r.day}</strong><small>{r.month}</small></span>:glyph(r.icon)}<div><strong>{r.date}</strong><small>{r.source}</small></div><b>{euro(r.amount)}</b></div>;
 const total=<div className="fv-pending-total"><small>Всего ожидает</small><strong>{euro(17300)}</strong></div>;
 const pendingHeader=<div className="fv-header"><h3>Ожидаемые поступления</h3>{glyph('calendar-date-linear')}</div>;
 const all=()=>onAction('pending');
 if(family==='pending')return <Card className={cls} title="">
 {pendingHeader}
 {n===1&&<><div className="fv-timeline">{pendingGroups.map(r=>pendingItem(r,true))}</div>{total}</>}
 {n===2&&<><div className="fv-nearest">{glyph('clock-circle-linear',true)}<span>Ближайшее · 09 ноября</span><strong>{euro(2600)}</strong></div>{pendingGroups.slice(1).map(r=>pendingItem(r))}{total}</>}
 {n===3&&<><div className="fv-date-strip">{pendingGroups.map(r=><button key={r.id} className="fv-date-tile" onClick={all}><strong>{r.day}</strong><small>{r.month}</small><b>{euro(r.amount)}</b></button>)}</div>{total}<p>Наставнический бонус – ближайшее поступление.</p></>}
 {n===4&&<>{total}<DataTable Shared={Shared} layout="records" label="Ожидаемые поступления" rows={pendingGroups} columns={[{key:'date',label:'Дата',render:r=><strong>{r.date}</strong>},{key:'source',label:'Источник',render:r=><span>{r.source}</span>},{key:'amount',label:'Сумма',render:r=><strong>{euro(r.amount)}</strong>}]}/></>}
 {n===5&&<><div className="fv-money-flow">{pendingGroups.map((r,i)=><div key={r.id}><span className="fv-step">0{i+1}</span><strong>{euro(r.amount)}</strong><span>{r.date}</span><small>{r.source}</small></div>)}</div>{total}</>}
 {n===6&&<>{total}<div className="fv-queue">{pendingGroups.map(r=>pendingItem(r))}</div></>}
 {n===7&&<><div className="fv-soon"><h3>Ближайшие даты</h3>{pendingGroups.slice(0,2).map(r=>pendingItem(r,true))}</div><div className="fv-later"><small>Долгосрочные · копится</small>{pendingItem(pendingGroups[2])}</div></>}
 {n===8&&<>{[{id:'mentor',date:'09.11.2026',source:'Наставнический',amount:2600,icon:'users-group-rounded-linear'},{id:'binary',date:'01.12.2026',source:'Бинарный бонус',amount:8500,icon:'chart-square-linear'},{id:'speed',date:'01.12.2026',source:'Премия за скорость',amount:5000,icon:'bolt-linear'},pendingGroups[2]].map(r=>pendingItem(r))}{total}</>}
 {n===9&&<><div className="fv-calendar-hero"><span className="fv-date-tile"><strong>09</strong><small>ноября</small></span><div><small>Следующее поступление</small><strong>{euro(2600)}</strong><span>Наставнический</span></div></div>{pendingGroups.slice(1).map(r=>pendingItem(r,true))}{total}</>}
 {n===10&&<>{total}{pendingGroups.map((r,i)=><details className="fv-pending-disclosure" key={r.id} open={i===0}><summary><span>{r.date}</span><strong>{euro(r.amount)}</strong></summary><p>{r.source}</p></details>)}</>}
 <div className="fv-pending-action">{action('Все поступления','pending','Soft','clock-circle-linear')}</div>
 </Card>;
 return null;
}
