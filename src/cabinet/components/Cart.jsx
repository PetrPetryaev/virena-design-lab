import React from 'react';
import {products,AssetImage} from '../../Storefront.jsx';
import {formatCents} from '../../numberFormat.js';
import Button from './CabinetButton.jsx';
import EmptyIllustration from './EmptyIllustration.jsx';
import './profile.css';
import './cart.css';

const quantityOf=value=>Number.isSafeInteger(value)&&value>0?value:1;

import QuantityControl from '../../ds/QuantityControl.jsx';
export {default as QuantityControl} from '../../ds/QuantityControl.jsx';

function CartLoading(){
 return <div className="cart-layout" role="status" aria-label="Загрузка корзины" aria-busy="true"><section className="cart-items cart-loading" aria-hidden="true">{[0,1,2].map(i=><div className="cart-skeleton-row" key={i}><span/><div><i/><i/><i/></div></div>)}</section><aside className="cart-summary cart-loading" aria-hidden="true"><i/><i/><i/><i/></aside></div>;
}

export default function Cart({Shared,db,lines=[],onQuantity,onRemove,onCheckout,navigate,scenario='ready',onRetry,drawer=false}){
 const resolved=lines.map(line=>({product:products.find(p=>p.id===line.productId),quantity:quantityOf(line.quantity)})).filter(line=>line.product);
 const totalCents=resolved.reduce((total,{product,quantity})=>total+Math.round(product.price*100)*quantity,0);
 const count=resolved.reduce((total,{quantity})=>total+quantity,0);
 const empty=scenario==='empty'||!resolved.length;
 return <div className={'profile cart'+(drawer?' cart-in-drawer':'')}>
  {!drawer&&<div className="cart-back"><Button {...{Shared,db}} label="Вернуться к магазину" tone="White" leadingIconContent={<Shared.Icon name="return-to-list"/>} onClick={()=>navigate('shop')}/></div>}
  {scenario==='loading'?<CartLoading/>:scenario==='error'?<section className="cart-state" role="alert"><h2>Не удалось загрузить корзину</h2><p>Попробуйте ещё раз.</p><Button {...{Shared,db}} label="Повторить" tone="Primary" onClick={onRetry}/></section>:empty?<section className="cart-state"><EmptyIllustration kind="cart"/><h2>В корзине пока пусто</h2><p>Выберите продукты в маркетплейсе.</p><Button {...{Shared,db}} label="Перейти в маркетплейс" tone="Primary" onClick={()=>navigate('shop')}/></section>:<div className="cart-layout">
   <section className="cart-items" aria-label="Товары в корзине">{resolved.map(({product,quantity})=><article className="cart-item" key={product.id}>
    <div className="cart-art"><AssetImage asset={product.image} alt={product.name}/></div>
    <div className="cart-product-copy"><h2>{product.name}</h2><p>{product.description}</p><span className="cart-unit-price">{formatCents(Math.round(product.price*100))} за шт.</span></div>
    <div className="cart-item-bottom"><div className="cart-item-controls"><QuantityControl {...{Shared,db}} value={quantity} label={`Количество ${product.name}`} onChange={value=>onQuantity(product.id,value)}/></div>
    <div className="cart-line-actions"><strong className="cart-line-total" aria-label={`Сумма за ${product.name}`}>{formatCents(Math.round(product.price*100)*quantity)}</strong><Button {...{Shared,db}} icon="Boris / Icon / Trash action" label={`Удалить ${product.name}`} size="40" tone="Ghost" onClick={()=>onRemove(product.id)}/></div></div>
   </article>)}</section>
   <aside className="cart-summary" aria-label="Итог корзины">{!drawer&&<h2>Ваш заказ</h2>}<dl><div><dt>Товары, {count} шт.</dt><dd>{formatCents(totalCents)}</dd></div><>{!drawer&&<><div><dt>Доставка</dt><dd>При оформлении</dd></div><div><dt>Баллы</dt><dd>Будут рассчитаны</dd></div></>}</><div className="cart-total"><dt>Сумма товаров</dt><dd>{formatCents(totalCents)}</dd></div></dl>{drawer&&<details className="cart-summary-details"><summary>Доставка и баллы</summary><dl><div><dt>Доставка</dt><dd>При оформлении</dd></div><div><dt>Баллы</dt><dd>Будут рассчитаны</dd></div></dl></details>}<Button {...{Shared,db}} label="Перейти к оформлению" tone="Primary" onClick={onCheckout}/><p className="cart-demo-note">Цены демонстрационные</p></aside>
  </div>}
 </div>;
}
