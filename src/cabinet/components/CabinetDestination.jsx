import React from 'react';
import Button from './CabinetButton.jsx';
import EmptyIllustration from './EmptyIllustration.jsx';
import {financeSnapshot,bv} from './financeData.js';

// These routes describe available prototype steps. They never simulate a payment.
const shopDestinations={
 upgrade:{title:'Повышение пакета',description:`Стандарт → Профи. Доплата ${bv(financeSnapshot.targetThresholds[0]-financeSnapshot.statusThreshold)} €. Условия повышения и лимиты доступны в разделе «Финансы».`},
 packages:{title:'Партнёрские пакеты',description:'Пороги пакетов: 369 / 693 / 1 100 / 3 000 / 6 000 €. Продукты можно посмотреть в каталоге.'},
 activity:{title:'Годовая активность',description:'Оплата годовой активности – 120 €.'},
 renewal:{title:'Продление активности',description:'Продление в льготном окне – 240 €.'},
 restore:{title:'Восстановление активности',description:'Восстановление после заморозки – 240 €.'},
};
export default function CabinetDestination({Shared,db,page,intent,navigate}){
 const cart=page==='cart',destination=shopDestinations[intent];
 return <section className="cab-placeholder" aria-label={cart?'Корзина':destination.title}>
  <EmptyIllustration kind={cart?'cart':'shop'}/>
  <h2>{cart?'Корзина пока пуста':destination.title}</h2>
  <p>{cart?'Посмотрите продукты Virena в каталоге.':destination.description}</p>
  <p>{cart?'В демонстрации доступны просмотр продуктов и история покупок. Добавление товаров и оформление заказа пока не подключены.':'Демонстрационные условия. Покупка и оплата пакетов и активности пока не подключены.'}</p>
  <div className="cab-destination-actions">
   <Button Shared={Shared} db={db} label="Перейти в каталог" tone="Primary" onClick={()=>navigate('shop')}/>
   <Button Shared={Shared} db={db} label={cart?'Мои покупки':'Открыть финансы'} onClick={()=>navigate(cart?'orders':'finances')}/>
  </div>
 </section>;
}
