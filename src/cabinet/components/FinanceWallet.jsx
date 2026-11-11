import React from 'react';
import {ProfileCard} from './Profile.jsx';
import Button from './CabinetButton.jsx';
import {euro,AS_OF,displayDate,financeSnapshot} from './financeData.js';
import './finance-dashboard.css';

function Money({value}){const text=euro(value),split=text.lastIndexOf(',');return <>{text.slice(0,split)}<small>{text.slice(split)}</small></>;}
// Shared wallet: its actions are supplied by the owning screen so withdrawal rules stay there.
export default function FinanceWallet({Shared,db,balanceRef,available,paid,reserved=0,scenario,frozen,loading,skeleton,next,onDetails,detailsDisabled=false,requestControl,onPending,pendingDisabled=false,children}){
 return <div ref={balanceRef} className="fd-wallet-shell"><ProfileCard title="Доступно к выводу" className="fd-wallet fd-card" headingActions={<Shared.Status tone={frozen?'Danger':'Neutral'} label={frozen?'Заблокировано':'EUR'}/> }>
 {loading?skeleton('баланс'):<><div className="fd-wallet-main"><div className="fd-balance" data-testid="available"><Money value={available}/></div><div className="fd-wallet-actions"><Button Shared={Shared} db={db} label="Реквизиты" tone="Soft" disabled={detailsDisabled} onClick={onDetails}/>{requestControl}</div></div>
 {(reserved>0||scenario==='debt')&&<p className="fd-note">{reserved>0?`В заявке на вывод: ${euro(reserved)}`:`Погашено в счёт задолженности: ${euro(financeSnapshot.repaidDebt)}`}</p>}
 {children||<div className="fd-wallet-context"><div><span>Выведено в {AS_OF.slice(0,4)}</span><strong>{euro(paid)}</strong></div><div><span>Ближайшее поступление</span>{next?<><button type="button" className="finance-row-trigger" disabled={pendingDisabled} onClick={onPending}>{euro(next.amount)}</button><small>{displayDate(next.date)}</small></>:<strong>Нет ожидаемых</strong>}</div></div>}</>}
 </ProfileCard></div>;
}
