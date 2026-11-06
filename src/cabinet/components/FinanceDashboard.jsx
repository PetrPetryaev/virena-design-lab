import React,{useState} from 'react';
import Dialog from './CabinetDialog.jsx';
import {ProfileCard as Card} from './Profile.jsx';
import Button from './CabinetButton.jsx';
import MemberPackage from './MemberPackage.jsx';
import TreeLegMetrics from './TreeLegMetrics.jsx';
import FinanceIncome,{RollingMoney} from './FinanceIncome.jsx';
import {euro,bv,AS_OF,displayDate,financeSnapshot} from './financeData.js';

function Money({value}){const text=euro(value),split=text.lastIndexOf(',');return <>{text.slice(0,split)}<small>{text.slice(split)}</small></>;}
export default function FinanceDashboard({Shared,db,loading,skeleton,balanceRef,available,paid,reserved,scenario,noPackage,frozen,inactive,isEmpty,pack,pendingDates,pendingTotal,pendingTable,ledger,legs,requestControl,navigate,goPoints,goHistory,incomeProps}){
 const [showConditions,setShowConditions]=useState(false),[showBinary,setShowBinary]=useState(false);
 const direction='calm';
 const next=pendingDates[0],lost=ledger.filter(r=>r.capped&&r.date.slice(0,7)==='2026-11').reduce((s,r)=>s+(r.lost||0),0);
 const canUpgrade=!noPackage&&!frozen&&!inactive&&scenario!=='supervip';
 const pendingGroups=groups=><div className="fd-schedule">{groups.map((group,index)=><section className="fd-schedule-group" key={group.id}><div className="fd-schedule-date"><Shared.Icon name="calendar-date-linear"/><span>{displayDate(group.date)}</span>{group.id===next?.id&&<small>Ближайшее</small>}</div>{group.items.map(item=><button type="button" className="fd-schedule-item" key={item.source} onClick={()=>goHistory({source:item.source,state:'Начислено',period:null})}><span><strong>{item.source}</strong>{item.accruing&&<span className="fd-schedule-status">Копится</span>}</span><b>{euro(item.amount)}</b></button>)}</section>)}</div>;
 return <><div className="fd-dashboard" data-direction={direction}>
 <div className="fd-primary">
 <div ref={balanceRef} className="fd-wallet-shell"><Card title="Доступно к выводу" className="fd-wallet fd-card" headingActions={<Shared.Status tone={frozen?'Danger':'Neutral'} label={frozen?'Заблокировано':'EUR'}/>}>
 {loading?skeleton('баланс'):<><div className="fd-wallet-main"><div className="fd-balance" data-testid="available"><Money value={available}/></div><div className="fd-wallet-actions"><Button Shared={Shared} db={db} label="Реквизиты" tone="Soft" onClick={()=>navigate('details')}/>{requestControl}</div></div>
 {(reserved>0||scenario==='debt')&&<p className="fd-note">{reserved>0?`В заявке на вывод: ${euro(reserved)}`:`Погашено в счёт задолженности: ${euro(financeSnapshot.repaidDebt)}`}</p>}
 <div className="fd-wallet-context"><div><span>Выведено в {AS_OF.slice(0,4)}</span><strong>{euro(paid)}</strong></div><div><span>Ближайшее поступление</span>{next?<><button type="button" className="finance-row-trigger" onClick={()=>document.querySelector('.fd-pending')?.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}>{euro(next.amount)}</button><small>{displayDate(next.date)}</small></>:<strong>Нет ожидаемых</strong>}</div></div></>}
 </Card></div>
 <Card title="Партнёрский пакет" className="fd-package fd-card" headingActions={<div className="fd-package-heading-actions"><MemberPackage pack={noPackage?'':pack}/>{!noPackage&&scenario!=='supervip'&&<Button Shared={Shared} db={db} icon="Auth / Icon / Info" label="Условия повышения пакета" tone="Ghost" size="40" onClick={()=>setShowConditions(true)}/>}</div>}>
 {loading?skeleton('пакет'):noPackage?<div className="fd-package-empty"><span className="fd-icon"><Shared.Icon name="box-linear"/></span><div className="fd-package-empty-copy"><h3>Начните с первого пакета</h3><p>Пакеты от 369 €. Выберите подходящие условия участия.</p></div><Button Shared={Shared} db={db} tone="Primary" label="Выбрать пакет" onClick={()=>navigate('shop','packages')}/></div>:<>
 <div className={'fd-plan-compare'+(!canUpgrade?' is-single':'')}><div className="fd-plan-current"><span className="fd-eyebrow"><Shared.Icon name="box-linear"/>Ваш пакет</span><h3>{pack}</h3>{scenario==='supervip'?<p>Без потолка засчёта</p>:<><strong>{bv(financeSnapshot.statusThreshold)} € <small>/ {bv(financeSnapshot.statusBV)} BV</small></strong><p>Лимит с одной покупки</p><p className="fd-plan-current-note">Сумма выше лимита не учитывается в расчёте ВЗР.</p></>}</div>
 {canUpgrade&&<div className="fd-plan-next"><span className="fd-eyebrow">Следующий уровень</span><h3>Профи</h3><strong>{bv(financeSnapshot.targetThresholds[0])} €</strong><p>Лимит с одной покупки</p><ul className="fd-plan-benefits"><li>До {bv(financeSnapshot.targetThresholds[0]-financeSnapshot.statusThreshold)} € дополнительно в зачёт с одной покупки</li><li>Новый лимит действует сразу после оплаты</li></ul><div className="fd-plan-upgrade"><strong>Доплата {bv(financeSnapshot.targetThresholds[0]-financeSnapshot.statusThreshold)} €</strong><Button Shared={Shared} db={db} label="Посмотреть апгрейд" tone="Primary" onClick={()=>navigate('shop','upgrade')}/></div></div>}</div>

 </>}
 </Card>
 <Card title="Бинар" className="fd-binary fd-card" headingActions={<div className="fd-package-heading-actions"><Button Shared={Shared} db={db} icon="Auth / Icon / Info" label="Расчёт и статистика" tone="Ghost" size="40" onClick={()=>setShowBinary(true)}/><Button Shared={Shared} db={db} label="В дерево" size="40" tone="Soft" leadingIcon="Virena / Navigation icon / Branch" onClick={()=>navigate('genealogy')}/></div>}>
 {loading?skeleton('бинар'):<><TreeLegMetrics className="fd-legs" points={legs.map(r=>r.value)} showStrength={!isEmpty&&!frozen} unit="BV"/>
 <div className="fd-binary-context"><p>{frozen?'Баллы сгорели при заморозке. Продлите активность, чтобы снова получать объём.':noPackage?'Баллы начисляются после покупки пакета от 369 €.':isEmpty?'Объём появится после покупок в структуре.':<>До следующего цикла <strong>+{bv(financeSnapshot.cycleNeeded)} BV</strong> в правую ногу</>}</p>{!isEmpty&&!frozen&&<><button type="button" className="fd-expiry finance-row-trigger" onClick={goPoints}><Shared.Icon name="clock-circle-linear"/><span>{displayDate(financeSnapshot.expiryDate)} сгорит {bv(financeSnapshot.expiryBV)} BV левой ноги</span></button></>}</div></>}
 </Card>
 </div>
 <div className="fd-secondary">
 <FinanceIncome {...incomeProps} Shared={Shared} db={db} displayMode="segments"/>
 <Card title="Ожидаемые поступления" className="fd-pending fd-card" >
 {!loading&&<div className="finance-income-value"><RollingMoney value={pendingTotal}/></div>}{loading?skeleton('ожидаемые начисления'):pendingDates.length?pendingGroups(pendingDates):<p className="fd-note">Ожидаемых поступлений пока нет</p>}
 </Card>
 </div>
 </div>{showConditions&&<Dialog Shared={Shared} db={db} title="Условия повышения пакета" onClose={()=>setShowConditions(false)}><div className="fd-package-conditions"><p>{scenario==='upgrade-150'?'Доплата + покупка продукции на 150 BV. Условие до 05.12.2026.':scenario==='upgrade-300'?'Доплата + покупка продукции на 300 BV.':`Только доплата · без дополнительной покупки ещё ${financeSnapshot.upgradeDaysLeft} день.`}</p><p>{lost>0?<button className="finance-row-trigger" type="button" onClick={()=>goHistory({cap:true})}>Недополучено в ноябре: {euro(lost)} ВЗР</button>:'В этом месяце потолок не срабатывал'}</p><p>До ВИП: доплата {bv(financeSnapshot.targetThresholds[1]-financeSnapshot.statusThreshold)} € · до Супер ВИП: {bv(financeSnapshot.targetThresholds[2]-financeSnapshot.statusThreshold)} €.</p><p>Virena Pulse не учитывается в сумме для пакета. Пакет действует с момента оплаты, прошлые покупки не пересчитываются.</p></div></Dialog>}{showBinary&&<Dialog Shared={Shared} db={db} title="Расчёт и статистика" onClose={()=>setShowBinary(false)}><div className="fd-package-conditions"><p>{financeSnapshot.cycles} цикл в ноябре · {financeSnapshot.steps} шага за всё время</p><p>Расчёт за 04.11 выполнен 05.11 в 09:40.</p></div></Dialog>}</>;
}
