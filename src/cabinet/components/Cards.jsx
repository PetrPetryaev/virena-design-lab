import React from 'react';
import './overview.css';
import './overview-variants.css';
import './cards.css';

/** Shared identity shell: hidden content reserves geometry and is removed from tab order. */
export function IdentityCard({kind='profile',label,state='ready',fallback,children,surface='white'}){
 return <section className={`overview-card overview-${kind}`} data-surface={surface} aria-label={label} aria-busy={state==='loading'}>
  {state!=='ready'&&fallback}
  <div className={`overview-identity-content${state==='ready'?'':' is-pending'}`} aria-hidden={state!=='ready'} inert={state!=='ready'?true:undefined}>{children}</div>
 </section>;
}
/** One horizontal card for notices and package offers; icon, copy and action are slots. */
export function BannerCard({loading=false,kind='notice',label,title,description,price,icon,action,surface=kind==='notice'?'white':'soft'}){
 const notice=kind==='notice';
 const IconTag=notice?'span':'div';
 return <section className={`${notice?'overview-notice':'overview-option overview-package'}${loading?' card-loading':''}`} aria-busy={loading} inert={loading?true:undefined} data-surface={surface} aria-label={label}>
  <IconTag className={notice?'overview-notice-icon':'overview-art overview-art-package'} aria-hidden="true">{icon}</IconTag>
  <div><h3>{title}</h3><p>{description}</p>{price&&<strong className="overview-price">{price}</strong>}</div>{action}
 </section>;
}
/** Same media card, with either a cropped product or a contained illustration. */
export function MediaCard({loading=false,title,description,price,src,imageFit='contain',action,surface='white'}){
 const product=imageFit==='bleed';
 return <article className={`overview-option ${product?'overview-product':'overview-partner'}${loading?' card-loading':''}`} aria-busy={loading} inert={loading?true:undefined} data-surface={surface}>
  <div className={`overview-art${product?' overview-art-products':''}`} aria-hidden="true">{product?<img src={src} alt=""/>:<span className="networking-art"><img src={src} alt=""/></span>}</div>
  <div className={product?'overview-product-content':'overview-partner-content'}><div><h3>{title}</h3><p>{description}</p>{price&&<strong className="overview-price">{price}</strong>}</div>{action}</div>
 </article>;
}
