import React,{useState} from 'react';
import starIcon from '../../assets/tree-icons/star-bold.svg?raw';
import {TreeDialog} from './GenealogyWorkspace.jsx';
import {financeSnapshot,pointBatches,euro,ledgerFor,pendingFor,initialRequests,periodBounds,incomeFor,inPeriod} from './financeData.js';
import {invitationFixtures,reasons,sortInvitations} from './invitationsData.js';
import {genealogyCells} from './genealogyData.js';
import {SegmentedTabs} from '../../AuthPrimitives.jsx';
import CabinetButton from './CabinetButton.jsx';
import {BannerCard} from './Cards.jsx';
import CabinetDialog from './CabinetDialog.jsx';
import AchievementBadge from './AchievementBadge.jsx';
import AchievementGallery from './AchievementGallery.jsx';
import {packageImages,stateImages} from './achievementAssets.js';
import ReferralQrDialog from './ReferralQrDialog.jsx';
import TreeLegMetrics from './TreeLegMetrics.jsx';
import FinanceWallet from './FinanceWallet.jsx';
import MemberAvatar from './MemberAvatar.jsx';
import './partner-dashboard.css';

const links=[['Регистрация партнёра','https://example.com/register?ref=alexandra92'],['Магазин для клиентов','https://example.com/shop?ref=alexandra92'],['Сайт компании','https://example.com/?ref=alexandra92']];
const events=ledgerFor('ready','partner').map(row=>({type:'Деньги',text:`${row.amount>0?'+':''}${euro(row.amount)} ${row.kind} – ${row.basis}`,time:`${row.date.split('-').reverse().join('.')} · ${row.time} МСК`,sort:`${row.date}T${row.time}`,page:'finances'})).concat([
 {type:'Команда',text:'Анна Морозова зарегистрировалась в команде',time:'03.11.2026 · 10:30 МСК',sort:'2026-11-03T10:30',page:'invitations'},
 {type:'Карьера',text:'Активность продлена до 03.11.2027',time:'03.11.2026 · 09:00 МСК',sort:'2026-11-03T09:00',page:'profile'},
]).sort((a,b)=>b.sort.localeCompare(a.sort));

function Card({title,icon,children,className=''}){return <section className={'pd-card '+className}>{title&&<div className="pd-title">{icon}<h3>{title}</h3></div>}{children}</section>}
export function PartnerNotice({member,model,icon,button,navigate}){
 const frozen=model.locked, noPackage=!model.package;
 const notice=member==='grace'?{title:'Продлите активность – осталось 2 дня',text:'Оплаченный год закончился. Продлите активность в льготном окне, чтобы сохранить баллы.',cta:'Продлить за 240 €',intent:'renewal'}:frozen?{title:'Аккаунт заморожен',text:'Баллы сгорели, начисления и вывод остановлены. Срок до деактивации пока недоступен.',cta:'Вернуться за 240 €',intent:'restore'}:noPackage?{title:'Начисления не идут – нет пакета',text:'Выберите пакет, чтобы получать начисления.',cta:'Выбрать пакет',intent:'packages'}:null;
 return notice?<BannerCard attention title={notice.title} description={notice.text} icon={icon(frozen?'snowflake':member==='grace'?'calendar':'box')} action={button(notice.cta,()=>navigate('shop',notice.intent),'White')}/>:null;
}
export function RankProgress({rank,noPackage,frozen,onAwards}){
 const maxRank=rank>=9, remaining=Math.max(0,60-financeSnapshot.steps);
 const rankProgress=noPackage?0:Math.min(100,Math.round(financeSnapshot.steps/60*100));
 return <section className="pd-career-compact" aria-label="Карьера"><div className="pd-rank-row"><strong className="pd-rank-value"><span aria-hidden="true" dangerouslySetInnerHTML={{__html:starIcon.replaceAll('"black"','"currentColor"')}}/>{rank}-й ранг</strong><span>{maxRank?'Максимум':'До следующего'}</span></div>{maxRank?<p>Достигнут максимальный ранг</p>:<><div className="pd-capped-bar pd-career-progress" role="progressbar" aria-valuemin={0} aria-valuemax={60} aria-valuenow={noPackage?0:financeSnapshot.steps} aria-label="Шаги до следующего ранга"><span style={{width:`${rankProgress}%`}}/></div><div className="pd-rank-row"><strong>{rankProgress}%</strong><span>{noPackage?'Нужен пакет':frozen?'Приостановлено':`Ещё ${remaining} шагов`}</span></div></>}<button type="button" className="pd-text-link" onClick={onAwards}>Подробнее о ранге</button></section>;
}
export function PackageCard({member,model,button,navigate}){
 const frozen=model.locked, noPackage=!model.package, superVip=model.package==='Супер ВИП';
 const example=ledgerFor('ready',member).find(r=>r.id==='F-1105');
 const currentExample=example?.amount, proExample=example?Math.floor(example.amount*financeSnapshot.targetThresholds[0]/financeSnapshot.statusThreshold):null;
 return <Card className="pd-package-card"><div className="pd-package-hero" data-package={model.package||'none'}><AchievementBadge src={packageImages[['Начальный','Стандарт','Профи','ВИП','Супер ВИП'].indexOf(model.package)]} alt={model.package?`Пакет ${model.package}`:''}/><div className="pd-package-heading"><span className="pd-label">Ваш пакет</span><strong className="pd-value pd-value-small">{model.package||'Без пакета'}</strong>{noPackage?<p>Выберите пакет для начислений.</p>:superVip?<strong className="pd-package-cap">Потолка засчёта нет</strong>:<strong className="pd-package-cap">Лимит учитываемой покупки – <span className="pd-cap-amount">{financeSnapshot.statusThreshold.toLocaleString('ru-RU')} €</span></strong>}</div></div>{!noPackage&&!superVip&&<><p>Сумма сверх лимита покупки не участвует в расчёте вознаграждения. До {financeSnapshot.statusBV} баллов.</p>{example&&<div className="pd-package-comparison"><p>Пример: одна покупка на 1 800 € · ВЗР 18%</p><table><thead><tr><th></th><th>Сейчас</th><th>С пакетом Профи</th></tr></thead><tbody><tr><th>Лимит покупки</th><td>{financeSnapshot.statusThreshold.toLocaleString('ru-RU')} €</td><td>{financeSnapshot.targetThresholds[0].toLocaleString('ru-RU')} €</td></tr><tr><th>ВЗР с покупки</th><td>{euro(currentExample)}</td><td>{euro(proExample)}</td></tr></tbody></table><strong>+{euro(proExample-currentExample)} в этом примере</strong></div>}<p>Доплата до Профи: {financeSnapshot.targetThresholds[0]-financeSnapshot.statusThreshold} €.</p>{frozen&&<p>Апгрейд доступен после восстановления.</p>}</>}{!frozen&&!superVip&&button(noPackage?'Выбрать пакет':'Сделать апгрейд',()=>navigate('shop',noPackage?'packages':'upgrade'),'Primary')}</Card>;
}
export function PartnerDashboard({member,model,loading,icon,button,navigate,productCard,profileCard,sponsorCard,placementSide,onPlacementChange,Shared,db}){
 const frozen=model.locked, noPackage=!model.package;
 const [filter,setFilter]=useState('Все'),[expanded,setExpanded]=useState(false),[message,setMessage]=useState(''),[placementOpen,setPlacementOpen]=useState(false),[qr,setQr]=useState(null),[inviteOpen,setInviteOpen]=useState(false),[awardsOpen,setAwardsOpen]=useState(false);

 const copy=async value=>{try{await navigator.clipboard.writeText(value);setMessage('Ссылка скопирована');}catch{setMessage('Не удалось скопировать ссылку');}};
 const share=async (name,url)=>{if(navigator.share){try{await navigator.share({title:name,text:'Ссылка Virena',url});}catch{} }else await copy(url);};
 const visible=(noPackage?[]:events).filter(e=>filter==='Все'||filter===e.type);
 const ledger=ledgerFor('ready',member), pending=pendingFor(ledger).filter(r=>!r.accruing).reduce((sum,r)=>sum+r.amount,0), paid=initialRequests.filter(r=>r.status==='Выплачена').reduce((sum,r)=>sum+r.amount,0);
 const pendingRows=pendingFor(ledger), nextDate=pendingRows[0]?.date, next=nextDate?{date:nextDate,amount:pendingRows.filter(r=>r.date===nextDate).reduce((sum,r)=>sum+r.amount,0)}:null;
 const month=incomeFor(ledger,periodBounds('month')).reduce((sum,r)=>sum+r.amount,0),previous=incomeFor(ledger,periodBounds('month',-1)).reduce((sum,r)=>sum+r.amount,0);
 const direct=invitationFixtures.filter(p=>p.sponsor?.path===''), attention=sortInvitations(direct.filter(p=>p.attention?.length),'urgency').slice(0,3);
 const legValue=leg=>frozen||noPackage?0:pointBatches.filter(p=>p.leg===leg).reduce((sum,p)=>sum+p.remainder,0);
 const rank=noPackage?0:genealogyCells[0].rank;
 const careerCard=<RankProgress {...{rank,noPackage,frozen}} onAwards={()=>setAwardsOpen(true)}/>;
 return <div className={"partner-dashboard"+(loading?" card-loading":"")} data-member={member} aria-busy={loading} inert={loading?true:undefined}>
 <PartnerNotice {...{member,model,icon,button,navigate}}/>
 <div className="pd-top"><div className="pd-profile-composite">{profileCard}{careerCard}{sponsorCard}</div><PackageCard {...{member,model,button,navigate}}/></div>
 <div className="profile genealogy pd-wallet-area fd-dashboard" data-direction="calm"><FinanceWallet {...{Shared,db,frozen,loading,next}} available={noPackage?0:financeSnapshot.available} paid={noPackage?0:paid} skeleton={()=>null} onDetails={()=>navigate('details')} detailsDisabled={frozen} onPending={()=>navigate('finances')} pendingDisabled={frozen} requestControl={frozen?<p>Вывод заблокирован до продления активности</p>:<CabinetButton Shared={Shared} db={db} tone="Primary" label="Заявка на вывод" onClick={()=>navigate('finances')}/>}>
 <div className="pd-finance-stats"><div><span>Начислено за месяц</span><div className="pd-month-value"><strong>{euro(month)}</strong>{previous!==0&&<small>{Math.round((month-previous)/Math.abs(previous)*100)}%</small>}</div></div><div><span>Ожидается</span><strong>{euro(pending)}</strong>{next&&<small>Ближайшее: {next.date.split('-').reverse().join('.')}</small>}</div><div><span>Выведено</span><strong>{euro(noPackage?0:paid)}</strong></div><div><span>Годовой бонус · копится</span><details className="pd-annual"><summary>{frozen||noPackage?'0,00 €':euro(ledger.find(r=>r.id==='F-annual')?.amount||0)}</summary><p>{frozen?'Накопленное за год сгорело при заморозке.':noPackage?'Пока нет начислений.':'Расчётный год: 25.10.2026 – 24.10.2027. Выплата после 25.10.2027.'}</p></details></div></div>
 </FinanceWallet></div>

 <section className="pd-section" aria-labelledby="pd-team-title"><div className="pd-section-heading"><h2 id="pd-team-title">Структура и команда</h2><p>Бинар и лично приглашённые</p></div><div className="pd-development">
 <Card className="pd-binary" title="Бинар" icon={icon('Branch')}><div className="pd-binary-layout"><div className="pd-placement-tile"><span>Новые приглашённые</span><strong>{placementSide==='L'?'Левая':'Правая'} нога</strong>{!frozen&&<button type="button" className="pd-text-link" onClick={()=>setPlacementOpen(true)}>Изменить</button>}</div><TreeLegMetrics points={[legValue('Левая'),legValue('Правая')]} counts={genealogyCells[0].counts} unit="баллов" className="pd-leg-metrics"/></div><p>{frozen?'Баллы сгорели при заморозке, новые не начисляются.':noPackage?'Баллы не засчитываются без пакета.':'За вчера: 1 цикл · 100,00 €. Следующий расчёт: 9–10 МСК.'}</p>{button('Открыть структуру',()=>navigate('genealogy'))}</Card>
 <Card title="Команда" icon={icon('Users')}><div className="pd-team-total"><strong>{direct.length}</strong><span>лично приглашённых</span></div><div className="pd-team-avatars">{direct.filter(p=>p.photo).slice(0,3).map(p=><MemberAvatar key={p.id} cell={p} photo={p.photo} Shared={Shared} size={40}/>)}</div><div className="pd-facts"><div><span>С пакетом / без пакета</span><b>{direct.filter(p=>p.pack).length} / {direct.filter(p=>!p.pack).length}</b></div><div><span>Клиенты / льготное окно / заморожены</span><b>{['client','grace','frozen'].map(state=>direct.filter(p=>p.state===state).length).join(' / ')}</b></div></div><p><strong>Требуют внимания</strong></p>{attention.map(p=><p key={p.id}>{p.name} – {reasons[p.attention[0]]}</p>)}{button('Вся команда',()=>navigate('invitations'))}</Card>




 </div></section>
 <div className="pd-bottom"><div className="pd-product-slot">{productCard}</div><div className="pd-feed-column"><Card title="Лента событий" icon={icon('clock-circle')} className="pd-feed"><SegmentedTabs className="pd-tabs" label="Фильтр событий" idPrefix="overview-events-" panelId="overview-events" value={filter} onChange={v=>{setFilter(v);setExpanded(false)}} items={['Все','Деньги','Команда','Карьера'].map(value=>({value,label:value}))}/><div id="overview-events" role="tabpanel"><div className={"pd-events"+(expanded?" is-expanded":"")}>{visible.length?visible.slice(0,expanded?undefined:10).map(e=><button className="pd-event" type="button" key={e.text} onClick={()=>navigate(e.page)}><span>{e.text}</span><small>{e.time}</small></button>):<p>Здесь появятся ваши начисления и новости команды.</p>}</div>{visible.length>5&&button(expanded?'Свернуть':'Показать все',()=>setExpanded(!expanded))}</div></Card><Card title="Ближайшие события" icon={icon('calendar')}><p>Ближайших событий пока нет.</p></Card></div></div>
 <div className="pd-invite-trigger"><CabinetButton Shared={Shared} db={db} tone="Primary" label="Пригласить партнёра" onClick={()=>setInviteOpen(true)}/></div>
 {inviteOpen&&<CabinetDialog title="Пригласить партнёра" drawer Shared={Shared} db={db} className="pd-invite-dialog" onClose={()=>setInviteOpen(false)}><div className="pd-invite-content">{links.map(([name,url])=><div className="pd-link" key={name}><div><strong>{name}</strong><small>{url.replace('https://','')}</small></div><div className="pd-link-actions"><CabinetButton Shared={Shared} db={db} size="40" icon="copy" leadingIconContent={icon('copy')} label={`Копировать: ${name}`} disabled={frozen} onClick={()=>copy(url)}/><CabinetButton Shared={Shared} db={db} size="40" icon="qr-code" leadingIconContent={<span>QR</span>} label="QR" disabled={frozen} onClick={()=>setQr({name,url})}/><CabinetButton Shared={Shared} db={db} size="40" icon="plane-3-linear" leadingIconContent={icon('plane-3-linear')} label={`Поделиться: ${name}`} disabled={frozen} onClick={()=>share(name,url)}/ ></div></div>)}{frozen?<p>Ссылки не работают до продления.</p>:<button type="button" className="pd-text-link" onClick={()=>setPlacementOpen(true)}>Новые приглашённые – {placementSide==='L'?'левая':'правая'} нога · изменить</button>}<span role="status">{message}</span></div></CabinetDialog>}
 {awardsOpen&&<AchievementGallery Shared={Shared} db={db} onClose={()=>setAwardsOpen(false)} rank={noPackage?0:genealogyCells[0].rank} packageName={model.package} member={member} {...{packageImages,stateImages}}/>}
 {qr&&<ReferralQrDialog Shared={Shared} db={db} title={qr.name} url={qr.url} onClose={()=>setQr(null)}/>}
 {placementOpen&&<TreeDialog compact title="Изменить сторону размещения?" Shared={Shared} db={db} onClose={()=>setPlacementOpen(false)} footer={<>{button('Отмена',()=>setPlacementOpen(false))}{button('Изменить',()=>{onPlacementChange?.(placementSide==='L'?'R':'L');setPlacementOpen(false)},'Primary')}</>}><div className="tree-dialog-copy"><p>Новая сторона: <strong>{placementSide==='L'?'правая':'левая'} нога</strong>.</p><p>Новые приглашённые будут размещаться в этой ноге после первой оплаты. Уже размещённые участники останутся на своих местах.</p></div></TreeDialog>}
 </div>;
}
