import React from 'react';
import CabinetDialog from './CabinetDialog.jsx';
import AchievementBadge from './AchievementBadge.jsx';
const packages=['Начальный','Стандарт','Профи','ВИП','Супер ВИП'];
// Rank and package images are separate asset families; earned ranks do not depend on package purchase.
export default function AchievementGallery({Shared,db,onClose,rank=0,packageName,member,packageImages=[],stateImages={}}) {
 return <CabinetDialog title="Все награды" drawer Shared={Shared} db={db} onClose={onClose} className="pd-awards-dialog">
  <section aria-labelledby="award-ranks-title"><h3 id="award-ranks-title">Ранги</h3><p>Ранг зависит от шагов и условий структуры.</p><div className="pd-awards-grid">{Array.from({length:9},(_,i)=>{const n=i+1,state=n===rank?'Текущий':n<rank?'Получен':'Впереди';return <div className="pd-award" key={n}><strong className="pd-award-stars" aria-label={`${n} из 9 звёзд`}>{'★'.repeat(n)}</strong><small>{state}</small></div>})}</div></section>
  <section aria-labelledby="award-packages-title"><h3 id="award-packages-title">Пакеты</h3><p>Пакет определяет условия участия и не является рангом.</p><div className="pd-awards-grid">{packages.map((name,i)=><div className="pd-award pd-award-package" key={name}><AchievementBadge src={packageImages[i]} alt=""/><strong>{name}</strong><small>{name===packageName?'Текущий':'Пакет'}</small></div>)}</div></section>
  <section aria-labelledby="award-states-title"><h3 id="award-states-title">Состояния аккаунта</h3><p>Состояние отражает доступ к возможностям аккаунта и не является наградой.</p><div className="pd-awards-grid">{[['newcomer','Зарегистрирован','Первый шаг'],['client','Клиент','Покупки доступны'],['frozen','Заморожен','Требуется восстановление']].map(([key,name,description])=><div className="pd-award" key={key}><AchievementBadge src={stateImages[key]} alt=""/><strong>{name}</strong><small>{member===key?'Текущее состояние':description}</small></div>)}</div></section>
 </CabinetDialog>;
}
