import usePageSkeleton from './usePageSkeleton.js';
import {formatPrice} from './numberFormat.js';
import {RollingMoney} from './cabinet/components/FinanceIncome.jsx';
import React,{useState,useEffect,useLayoutEffect,useRef,useId} from 'react';
import deviceSheet from './assets/catalog-demo/sheet-0.jpg';
import nutritionSheet from './assets/catalog-demo/sheet-1.jpg';
import digitalSheet from './assets/catalog-demo/sheet-2.jpg';
const marketplaceManifest=import.meta.glob('./assets/marketplace-products/manifest.json',{eager:true,import:'default'})['./assets/marketplace-products/manifest.json']||{};
const marketplaceAssets=import.meta.glob(['./assets/marketplace-products/*-v2-studio-*.png','./assets/marketplace-products/*-v2-lifestyle-*.jpg','./assets/marketplace-products/banner-v2.png'],{eager:true,query:'?url',import:'default'});
const marketplaceUrl=path=>marketplaceAssets[path?.replace(/^\/src\//,'./')]||path;
import CatalogToolbar from './CatalogToolbar.jsx';
import QuantityControl from './ds/QuantityControl.jsx';
import {goodsTotal} from './cabinet/components/commerceData.js';
import CabinetButton from './cabinet/components/CabinetButton.jsx';
import './cabinet/components/profile.css';
import chevron from './assets/navigation/alt-arrow-right-linear.svg?raw';
import angle1 from './assets/expert-gallery/angle-1.png';
import angle2 from './assets/expert-gallery/angle-2.png';
import angle3 from './assets/expert-gallery/angle-3.png';
import angle4 from './assets/expert-gallery/angle-4.png';
const expertAngles=[angle1,angle2,angle3,angle4];
const angleNames=['Общий ракурс','Ракурс под углом','Вид сверху','Вид спереди'];
function Arrow(){return <span className="store-ds-arrow" aria-hidden="true" dangerouslySetInnerHTML={{__html:chevron.replace('stroke="black"','stroke="currentColor"')}}/>;}
import expertImage from './assets/virena-expert-transparent.png';
import './storefront.css';

const demoGallery={};
[['balance','beauty','water','mini-balance','deep-sleep'],['bio-life','more-life','neuro-life'],['pulse','training','a-scan']].forEach((ids,sheet)=>ids.forEach((id,row)=>{
 const rows=ids.length,src=[deviceSheet,nutritionSheet,digitalSheet][sheet],cellHeight=1024/rows;
 demoGallery[id]=[0,1].map(col=>({src,fullBleed:sheet>0,x:col*512+32,y:row*cellHeight+(sheet===1?26:8),w:448,h:cellHeight-(sheet===1?48:sheet===2&&row===2?56:16)}));
}));
export function AssetImage({asset,...props}){const clipId=useId().replaceAll(':','');return typeof asset==='string'?<img src={asset} {...props}/>:<svg {...props} data-asset-image="true" role="img" viewBox={`${asset.x} ${asset.y} ${asset.w} ${asset.h}`} preserveAspectRatio={asset.fullBleed?"xMidYMid slice":"xMidYMid meet"} aria-label={props.alt}><defs><clipPath id={clipId}><rect x={asset.x} y={asset.y} width={asset.w} height={asset.h}/></clipPath></defs><image href={asset.src} width="1024" height="1024" clipPath={`url(#${clipId})`} onLoad={props.onLoad}/></svg>;}

const categories=[['all','Все продукты'],['devices','Приборы'],['nutrition','Питание'],['online','Онлайн-продукты']];
const demoPrices={expert:690,balance:290,beauty:240,water:180,'mini-balance':190,'deep-sleep':220,'bio-life':49,'more-life':59,'neuro-life':69,pulse:39,training:29,'a-scan':19};
const priceLabel=product=>formatPrice(product.price);
export const products=[
 ['expert','Expert','devices','Стационарный прибор для подбора программы'],
 ['balance','Balance','devices','Приборы Virena'],['beauty','Beauty','devices','Приборы Virena'],['water','Water','devices','Приборы Virena'],['mini-balance','Mini Balance','devices','Приборы Virena'],['deep-sleep','Deep Sleep','devices','Приборы Virena'],
 ['bio-life','Bio Life','nutrition','Питание в саше'],['more-life','More Life','nutrition','Питание в саше'],['neuro-life','Neuro Life','nutrition','Питание в саше'],
 ['pulse','Virena Pulse','online','Онлайн-продукты Virena'],['training','Обучающий бот','online','Обучение'],['a-scan','A-Scan','online','Отдельный сервис']
].map(([id,name,category,description])=>{const media=marketplaceManifest[id];return {id,name,category,description,price:demoPrices[id],image:media?marketplaceUrl(media.image):(id==='expert'?expertImage:demoGallery[id][0]),gallery:media?media.gallery.map(marketplaceUrl):(id==='expert'?expertAngles:demoGallery[id]),galleryLabels:media?.labels};});
const readRoute=()=>{const q=new URLSearchParams(location.search);return {product:q.get('product')||'',category:categories.some(([id])=>id===q.get('category'))?q.get('category'):'all',query:q.get('q')||''};};
const hrefFor=(product='',category='all',query='')=>{const u=new URL(location.href);u.searchParams.set('tab','store');u.searchParams.set('page','shop');for(const key of ['intent','screen','product','category','q'])u.searchParams.delete(key);if(product)u.searchParams.set('product',product);if(category!=='all')u.searchParams.set('category',category);if(query)u.searchParams.set('q',query);return u.pathname+u.search;};
function Artwork({product}){return product.image?<AssetImage asset={product.image} alt={product.name} />:<div className="store-art-pending"><span aria-hidden="true">{product.name}</span><small>Изображение скоро появится</small></div>;}
function ProductAction({Shared,db,inCart,loading,onClick}){
 const target=inCart?'Перейти в корзину':'Добавить в корзину';
 const [shown,setShown]=useState(target),[animated,setAnimated]=useState(false);
 const root=useRef(null),restoreFocus=useRef(false);
 useLayoutEffect(()=>{if(!loading&&shown!==target){setShown(target);setAnimated(true);}},[loading,target,shown]);
 useLayoutEffect(()=>{if(!loading&&restoreFocus.current){root.current?.querySelector('button')?.focus();restoreFocus.current=false;}},[loading]);
 return <div ref={root} className="store-cta" data-animated={animated}>
 <Shared.Button group={db.components.find(c=>c.name==='Boris / Button')} choice={{Tone:'Primary',Size:'48'}} ariaLabel={target} loading={loading} onClick={e=>{restoreFocus.current=e.currentTarget.matches(':focus-visible');onClick();}} label={<span className="store-cta-label" aria-hidden="true" key={shown}>{[...shown].map((letter,index)=><span className="store-cta-glyph" style={{'--glyph-index':index}} key={index}>{letter===' '? '\u00a0':letter}</span>)}</span>}/>
 </div>;
}
export default function Storefront({Shared,db,onCountChange,onAdd,onQuantity,onRemove,cartLines=[],navigate:goToPage}){
 const [route,setRoute]=useState(readRoute),[query,setQuery]=useState(()=>readRoute().query);const heading=useRef(null),moved=useRef(false),skeletonRoot=useRef(null);
 usePageSkeleton(skeletonRoot,route.product,{initial:false});
 const [draftQuantities,setDraftQuantities]=useState({});
 const [adding,setAdding]=useState(false),addingRef=useRef(false),addingTimer=useRef();
 useEffect(()=>()=>clearTimeout(addingTimer.current),[]);
 const previousCartIds=useRef(cartLines.map(l=>l.productId));
 useEffect(()=>{const ids=cartLines.map(l=>l.productId);const removed=previousCartIds.current.filter(id=>!ids.includes(id));if(removed.length)setDraftQuantities(q=>{const next={...q};removed.forEach(id=>{next[id]=1;});return next;});previousCartIds.current=ids;},[cartLines]);
 useEffect(()=>{const back=()=>{const next=readRoute();setRoute(next);setQuery(next.query);moved.current=true;};window.addEventListener('popstate',back);return()=>window.removeEventListener('popstate',back);},[]);
 useEffect(()=>{if(moved.current){heading.current?.focus({preventScroll:true});heading.current?.closest('.cab-main')?.scrollTo(0,0);}},[route.product]);
 const navigate=(product='',category=route.category,q=query)=>{history.pushState({},'',hrefFor(product,category,q));moved.current=true;setRoute({product,category,query:q});setQuery(q);};
 const follow=(e,product='',category=route.category)=>{if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();navigate(product,category);};
 const Button=({label,onClick,tone='Soft',loading=false})=><Shared.Button group={db.components.find(c=>c.name==='Boris / Button')} choice={{Tone:tone,Size:'48'}} label={label} onClick={onClick} loading={loading}/>;
 const catalogRef=useRef(null);
 const selected=products.find(p=>p.id===route.product),visible=products.filter(p=>(route.category==='all'||p.category===route.category)&&`${p.name} ${p.description}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
 useEffect(()=>{onCountChange?.(route.product?null:visible.length);},[route.product,visible.length,onCountChange]);
 const selectedQuantity=selected?(cartLines.find(l=>l.productId===selected.id)?.quantity||draftQuantities[selected.id]||1):1;
 const tabItems=categories.map(([value,label])=>({value,label,count:products.filter(p=>(value==='all'||p.category===value)&&`${p.name} ${p.description}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())).length}));
 return <div ref={skeletonRoot} className="store store-embedded"><div className="store-main" key={route.product||'catalog'}>
 {route.product?selected?<><div className="store-back"><CabinetButton Shared={Shared} db={db} label="Вернуться в каталог" leadingIconContent={<Shared.Icon name="return-to-list"/>} onClick={()=>navigate()}/></div><div className="store-detail"><ProductGallery key={selected.id} product={selected} Shared={Shared} db={db}/><section className="store-detail-copy"><span className="store-eyebrow">{categories.find(([id])=>id===selected.category)?.[1]} Virena</span><h1 tabIndex={-1} ref={heading}>{selected.name}</h1><p className="store-lead">{selected.description}</p>{selected.id==='expert'&&<p>Expert подбирает программу, которую может получать носимый прибор Balance.</p>}<div className="store-availability" aria-live="polite"><div className="store-purchase-total"><span>Сумма за {selectedQuantity} шт.</span><RollingMoney value={goodsTotal([{productId:selected.id,quantity:selectedQuantity}],products)} format={cents=>formatPrice(cents/100)}/></div><span>{priceLabel(selected)} за 1 шт.</span></div><div className="store-purchase-area profile" data-in-cart={cartLines.some(l=>l.productId===selected.id)}><div className="store-purchase-actions"><QuantityControl Shared={Shared} db={db} label={`Количество ${selected.name}`} value={selectedQuantity} onChange={quantity=>{if(cartLines.some(l=>l.productId===selected.id))onQuantity?.(selected.id,quantity);else setDraftQuantities(q=>({...q,[selected.id]:quantity}));}}/><span className="store-purchase-remove">{cartLines.some(l=>l.productId===selected.id)?<CabinetButton Shared={Shared} db={db} icon="Boris / Icon / Trash action" label={`Удалить ${selected.name} из корзины`} tone="Ghost" size="48" onClick={()=>{onRemove?.(selected.id);setDraftQuantities(q=>({...q,[selected.id]:1}));}}/>:null}</span><div className="store-purchase-main"><ProductAction Shared={Shared} db={db} inCart={cartLines.some(l=>l.productId===selected.id)} loading={adding} onClick={()=>{if(addingRef.current)return;if(cartLines.some(l=>l.productId===selected.id)){goToPage?.('cart');return;}addingRef.current=true;setAdding(true);onAdd?.(selected.id,draftQuantities[selected.id]||1);addingTimer.current=setTimeout(()=>{addingRef.current=false;setAdding(false);},500);}}/></div></div></div></section></div><section className="store-about"><h2>О продукте</h2>{selected.id==='expert'?<dl><div><dt>Формат</dt><dd>Стационарный прибор</dd></div><div><dt>Назначение</dt><dd>Подбор программы</dd></div><div><dt>Связь с другими приборами</dt><dd>Balance получает программу от Expert</dd></div></dl>:<p>Подробное описание продукта скоро появится.</p>}</section><section className="store-related profile"><h2>В этой категории</h2><div className="store-related-grid">{products.filter(p=>p.category===selected.category&&p.id!==selected.id).map(p=><ProductCard compact key={p.id} product={p} Shared={Shared} db={db} href={hrefFor(p.id,route.category,query)} onClick={e=>follow(e,p.id)}/>)}</div></section></>:<section className="store-empty"><h1 ref={heading} tabIndex={-1}>Продукт не найден</h1><Button label="В каталог" onClick={()=>navigate('','all','')}/></section>:<>
 <section className="store-feature"><div><h2>Deep Sleep</h2><p>Познакомьтесь с прибором Virena</p><Button label="Подробнее о Deep Sleep" tone="Primary" onClick={()=>navigate('deep-sleep')}/></div><AssetImage asset={marketplaceAssets['./assets/marketplace-products/banner-v2.png']||products.find(p=>p.id==='deep-sleep').image} alt=""/></section>
 <section ref={catalogRef} tabIndex={-1} className="store-catalog" aria-label="Каталог продуктов"><CatalogToolbar Shared={Shared} db={db} leading={<h1 ref={heading} tabIndex={-1} className="store-catalog-title">Все продукты</h1>} expandSearch resetActive={!!query} onReset={()=>navigate('',route.category,'')} items={tabItems} value={route.category} onChange={id=>navigate('',id)} label="Категории" idPrefix="store-tab-" panelId="store-products" query={query} searchLabel="Найти продукт" onQueryChange={value=>{setQuery(value);history.replaceState({},'',hrefFor('',route.category,value));}}/>
 <div id="store-products" role="tabpanel" aria-labelledby={'store-tab-'+route.category}>{visible.length?<div className="store-grid">{visible.map(product=><ProductCard key={product.id} product={product} Shared={Shared} db={db} onAdd={onAdd} onQuantity={onQuantity} onRemove={onRemove} quantity={cartLines.find(line=>line.productId===product.id)?.quantity} href={hrefFor(product.id,route.category,query)} onClick={e=>follow(e,product.id)}/>)}</div>:<div className="store-empty"><h2>Ничего не нашлось</h2><p>Попробуйте другое название или выберите все продукты.</p><Button label="Сбросить поиск" onClick={()=>navigate('','all','')}/></div>}</div></section>
 </>}
 </div></div>;
}

export function ProductCard({product,href,onClick,onAdd,onQuantity,onRemove,quantity,Shared,db,compact=false}){
 const [view,setView]=useState(-1),[loaded,setLoaded]=useState([]),[hovered,setHovered]=useState(false),[focused,setFocused]=useState(false);
 const actionRef=useRef(null),restoreActionFocus=useRef(false);
 useLayoutEffect(()=>{if(restoreActionFocus.current){actionRef.current?.querySelector('button')?.focus();restoreActionFocus.current=false;}},[quantity]);
 // Keep the cover stable when filtering: one lifestyle cover per three products.
 const lifestyleFirst=!compact&&products.findIndex(item=>item.id===product.id)%3===0&&product.gallery.length>2;
 const order=product.gallery.map((_,index)=>index);
 if(lifestyleFirst)[order[0],order[2]]=[order[2],order[0]];
 const gallery=order.map(index=>product.gallery[index]),count=gallery.length,active=loaded.includes(view)?view:-1;
 const cover=lifestyleFirst?gallery[0]:product.image;
 const move=e=>{if(e.pointerType==='touch')return;const r=e.currentTarget.getBoundingClientRect(),x=e.clientX-r.left,zone=r.width/count;
 setView(current=>{const slot=count===2?(current+1)%2:current;if(current>=0&&x>=slot*zone-6&&x<=(slot+1)*zone+6)return current;const next=Math.max(0,Math.min(count-1,Math.floor(x/zone)));return count===2?(next+1)%2:next;});};
 const keyboard=e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();setView(v=>(Math.max(0,v)+(e.key==='ArrowRight'?1:count-1))%count);}};
 return <article className={'store-product'+(compact?' store-product-compact':'')+(product.image?.fullBleed?' has-fullbleed-art':'')} onPointerEnter={e=>{if(e.pointerType!=='touch'){setHovered(true);setView(count===2?1:0);}}} onPointerMove={move} onPointerLeave={()=>{setHovered(false);setView(-1);}} onFocusCapture={()=>setFocused(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget)){setFocused(false);setView(-1);}}} onKeyDown={keyboard}>
 <div className="store-product-art" data-active-view={active}>
 <AssetImage className={`store-gallery-layer ${lifestyleFirst?'is-lifestyle':'is-studio'}`} asset={cover} alt={active===-1?product.name:''} aria-hidden={active!==-1} data-visible={active===-1}/>
 {gallery.map((asset,i)=><AssetImage className={`store-gallery-layer store-generated ${order[i]<2?'is-studio':'is-lifestyle'}`} key={i} asset={asset} alt={active===i?`${product.name} — ракурс ${i+1}`:''} aria-hidden={active!==i} data-visible={active===i} onLoad={()=>setLoaded(v=>v.includes(i)?v:[...v,i])}/>)}
 <span className="store-gallery-bars" aria-hidden="true">{gallery.map((_,i)=><i key={i} data-active={active===i}/>)}</span>
 </div><div className="store-product-bottom"><div><span className="store-eyebrow">{categories.find(([id])=>id===product.category)?.[1]}</span><h2><a className="store-product-link" href={href} onClick={onClick} aria-label={`Подробнее: ${product.name}`}>{product.name}</a></h2></div><span ref={actionRef} className="store-card-action" data-cart-action={!!onAdd}>{quantity? <span className="store-card-morph" key="quantity"><QuantityControl Shared={Shared} db={db} value={quantity} label={`Количество ${product.name}`} onChange={value=>onQuantity?.(product.id,value)} onRemove={()=>{restoreActionFocus.current=!!actionRef.current?.querySelector('button:focus-visible');onRemove?.(product.id);}}/></span>:<span className="store-card-morph" key="add"><Shared.Button group={db.components.find(c=>c.name==='Boris / Button')} choice={{Tone:compact||hovered||focused?'Primary':'Soft',Size:compact?'40':'56'}} label={priceLabel(product)} ariaLabel={onAdd?`Добавить ${product.name} в корзину — ${priceLabel(product)}`:`${product.name} — ${priceLabel(product)}`} onClick={onAdd?e=>{e?.stopPropagation();restoreActionFocus.current=e.currentTarget.matches(':focus-visible');onAdd(product.id,1);}:onClick}/></span>}</span></div></article>;
}
function ProductGallery({product,Shared,db}){
 const [view,setView]=useState(0);const buttons=useRef([]),gallery=product.gallery,count=gallery.length;
 const labels=product.galleryLabels||(product.id==='expert'?angleNames:gallery.map((_,i)=>`Ракурс ${i+1}`));
 const key=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?count-1:(view+(e.key==='ArrowRight'?1:count-1))%count;setView(next);buttons.current[next]?.focus();};
 return <div className="store-expert-gallery profile"><div className="store-detail-art store-detail-generated">{gallery.map((asset,i)=><AssetImage key={i} asset={asset} className={`store-gallery-layer ${i<2?'is-studio':'is-lifestyle'}`} data-visible={view===i} alt={view===i?`${product.name} — ${labels[i]}`:''} aria-hidden={view!==i}/>)}{count>1&&<div className="store-gallery-controls">{[-1,1].map(direction=><Shared.Button key={direction} group={db.components.find(c=>c.name==='Boris / Icon button')} choice={{Tone:'Soft',Size:'48'}} ariaLabel={direction<0?'Предыдущее фото':'Следующее фото'} label={direction<0?'Предыдущее фото':'Следующее фото'} iconContent={<span className={direction<0?'store-gallery-arrow is-prev':'store-gallery-arrow'} aria-hidden="true" dangerouslySetInnerHTML={{__html:chevron.replaceAll('stroke="black"','stroke="currentColor"')}}/>} onClick={()=>setView(current=>(current+direction+count)%count)}/>)}</div>}<span className="store-gallery-status" role="status" aria-live="polite">{`${view+1} из ${count}: ${labels[view]}`}</span></div><div className="store-thumbnails" role="group" aria-label={`Ракурсы ${product.name}`} onKeyDown={key}>{gallery.map((asset,i)=><button type="button" key={i} ref={el=>{buttons.current[i]=el;}} aria-label={labels[i]} aria-pressed={view===i} onClick={()=>setView(i)}><AssetImage asset={asset} alt=""/></button>)}</div></div>;
}
