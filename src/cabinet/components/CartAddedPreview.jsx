import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {AssetImage,products} from '../../Storefront.jsx';
import {formatCents} from '../../numberFormat.js';
import {goodsTotal} from './commerceData.js';
import CabinetButton from './CabinetButton.jsx';
import './CartAddedPreview.css';

export default function CartAddedPreview({Shared,db,anchor,productId,lines,onClose,onCheckout}){
 const panel=useRef(null),items=useRef(null),[position,setPosition]=useState(null);
 const product=products.find(p=>p.id===productId),line=lines.find(l=>l.productId===productId);
 useLayoutEffect(()=>{const update=()=>{const rect=anchor.current?.getBoundingClientRect();if(rect)setPosition({top:rect.bottom+8,left:Math.max(8,Math.min(window.innerWidth-8-Math.min(360,window.innerWidth-16),rect.right-Math.min(360,window.innerWidth-16)))});};update();window.addEventListener('resize',update);window.addEventListener('scroll',update,true);return()=>{window.removeEventListener('resize',update);window.removeEventListener('scroll',update,true);};},[anchor]);
 useEffect(()=>{const outside=e=>{const cartAction=e.target.closest?.('.store-grid .store-card-action[data-cart-action=true] button');if(!cartAction&&!panel.current?.contains(e.target)&&!anchor.current?.contains(e.target))onClose();};const key=e=>{if(e.key==='Escape')onClose();};const link=e=>{if(e.target.closest('a')&&!panel.current?.contains(e.target))onClose();};document.addEventListener('click',link);document.addEventListener('pointerdown',outside);document.addEventListener('keydown',key);return()=>{document.removeEventListener('click',link);document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',key);};},[anchor,onClose]);
 useLayoutEffect(()=>{const row=items.current;const entry=row&&[...row.children].find(el=>el.dataset.productId===productId);if(entry){const left=entry.offsetLeft;if(left<row.scrollLeft)row.scrollLeft=left;else if(left+entry.offsetWidth>row.scrollLeft+row.clientWidth)row.scrollLeft=left+entry.offsetWidth-row.clientWidth;}},[productId,!!position]);
 if(!product||!line||!position)return null;
 const count=lines.reduce((sum,item)=>sum+item.quantity,0);
 return createPortal(<section ref={panel} className="cart-added-preview profile" aria-label="Товар добавлен в корзину" style={position}>
  <div className="cart-added-heading"><strong>Добавлено в корзину</strong><CabinetButton Shared={Shared} db={db} icon="Cross" tone="Ghost" size="40" label="Закрыть" onClick={onClose}/></div>
  <div ref={items} className="cart-added-items" role="list" aria-label="Товары в корзине" tabIndex={0}>
   {lines.map(item=>{const entry=products.find(p=>p.id===item.productId);if(!entry)return null;return <div className="cart-added-mini" role="listitem" data-product-id={item.productId} key={item.productId}>
    <div className="cart-added-image"><AssetImage asset={entry.image} alt=""/></div>
    <strong title={entry.name}>{entry.name}</strong><span>{item.quantity} шт.</span><span className="cart-added-line-price">{formatCents(goodsTotal([item],products))}</span>
   </div>;})}
  </div>
  <div className="cart-added-total"><span>Товары, {count} шт.</span><strong>{formatCents(goodsTotal(lines,products))}</strong></div>
  <CabinetButton Shared={Shared} db={db} label="Перейти к оформлению" tone="Primary" onClick={onCheckout}/>
 </section>,document.body);
}
