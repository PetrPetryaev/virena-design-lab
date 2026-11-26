import usePageSkeleton from './usePageSkeleton.js';
import {formatPrice} from './numberFormat.js';
import {productDescriptions} from './storeProductDescriptions.js';
import {RollingMoney} from './cabinet/components/FinanceIncome.jsx';
import React,{useState,useEffect,useLayoutEffect,useRef,useId} from 'react';
import deviceSheet from './assets/catalog-demo/sheet-0.jpg';
import nutritionSheet from './assets/catalog-demo/sheet-1.jpg';
import digitalSheet from './assets/catalog-demo/sheet-2.jpg';
const marketplaceManifest=import.meta.glob('./assets/marketplace-products/manifest.json',{eager:true,import:'default'})['./assets/marketplace-products/manifest.json']||{};
const productRenders=import.meta.glob('./assets/marketplace-products/renders/*.png',{eager:true,query:'?url',import:'default'});
const marketplaceAssets=import.meta.glob(['./assets/marketplace-products/*-v2-studio-*.png','./assets/marketplace-products/*-v2-lifestyle-*.jpg','./assets/marketplace-products/banner-v2.png'],{eager:true,query:'?url',import:'default'});
const marketplaceUrl=path=>marketplaceAssets[path?.replace(/^\/src\//,'./')]||path;
import CatalogToolbar from './CatalogToolbar.jsx';
import QuantityControl from './ds/QuantityControl.jsx';
import {goodsTotal} from './cabinet/components/commerceData.js';
import CabinetButton from './cabinet/components/CabinetButton.jsx';
import './cabinet/components/profile.css';
import chevron from './assets/navigation/alt-arrow-right-linear.svg?raw';
import cartIcon from './assets/navigation/cart-linear.svg';
import angle1 from './assets/expert-gallery/angle-1.png';
import angle2 from './assets/expert-gallery/angle-2.png';
import angle3 from './assets/expert-gallery/angle-3.png';
import angle4 from './assets/expert-gallery/angle-4.png';
const expertAngles=[angle1,angle2,angle3,angle4];
const angleNames=['Общий ракурс','Ракурс под углом','Вид сверху','Вид спереди'];
function Arrow(){return <span className="store-ds-arrow" aria-hidden="true" dangerouslySetInnerHTML={{__html:chevron.replace('stroke="black"','stroke="currentColor"')}}/>;}
import expertImage from './assets/virena-expert-transparent.png';
import './storefront.css';
import './store-product-details.css';

const demoGallery={};
[['balance','beauty','water','mini-balance','deep-sleep'],['bio-life','more-life','neuro-life'],['pulse','training','a-scan']].forEach((ids,sheet)=>ids.forEach((id,row)=>{
 const rows=ids.length,src=[deviceSheet,nutritionSheet,digitalSheet][sheet],cellHeight=1024/rows;
 demoGallery[id]=[0,1].map(col=>({src,fullBleed:sheet>0,x:col*512+32,y:row*cellHeight+(sheet===1?26:8),w:448,h:cellHeight-(sheet===1?48:sheet===2&&row===2?56:16)}));
}));
export function AssetImage({asset,...props}){const clipId=useId().replaceAll(':','');return typeof asset==='string'?<img src={asset} {...props}/>:<svg {...props} data-asset-image="true" role="img" viewBox={`${asset.x} ${asset.y} ${asset.w} ${asset.h}`} preserveAspectRatio={asset.fullBleed?"xMidYMid slice":"xMidYMid meet"} aria-label={props.alt}><defs><clipPath id={clipId}><rect x={asset.x} y={asset.y} width={asset.w} height={asset.h}/></clipPath></defs><image href={asset.src} width="1024" height="1024" clipPath={`url(#${clipId})`} onLoad={props.onLoad}/></svg>;}

const categories=[['all','Все продукты'],['devices','Приборы'],['nutrition','Питание'],['online','Онлайн-продукты']];
function CategoryLabel({category}){
 const label=category==='online'?'Онлайн':categories.find(([id])=>id===category)?.[1];
 return <span className={`store-eyebrow store-category-brand store-category-${category}`}>Virena <span>{label}</span></span>;
}
const demoPrices={expert:690,balance:290,beauty:240,water:180,'mini-balance':190,'deep-sleep':220,'bio-life':49,'more-life':59,'neuro-life':69,pulse:39,training:29,'a-scan':19};
const priceLabel=product=>formatPrice(product.price);
export const products=[
 ['expert','Expert','devices','Стационарный прибор для подбора программы'],
 ['balance','Balance','devices','Приборы Virena'],['beauty','Beauty','devices','Приборы Virena'],['water','Water','devices','Приборы Virena'],['mini-balance','Mini Balance','devices','Приборы Virena'],['deep-sleep','Deep Sleep','devices','Приборы Virena'],
 ['bio-life','BioLife','nutrition','Питание в саше'],['more-life','MoreLife','nutrition','Питание в саше'],['neuro-life','NeuroLife','nutrition','Питание в саше'],
 ['pulse','Virena Pulse','online','Онлайн-продукты Virena'],['training','Обучающий бот','online','Обучение'],['a-scan','A-Scan','online','Отдельный сервис']
].map(([id,name,category,description])=>{const media=marketplaceManifest[id];return {id,name,category,description:productDescriptions[id]?.lead ?? description,price:demoPrices[id],image:media?marketplaceUrl(media.image):(id==='expert'?expertImage:demoGallery[id][0]),gallery:media?media.gallery.map(marketplaceUrl):(id==='expert'?expertAngles:demoGallery[id]),galleryLabels:media?.labels};});
// Training remains in the internal demo catalogue, outside the public marketplace.
const storefrontProducts=products.filter(product=>product.id!=='training');
const readRoute=()=>{const q=new URLSearchParams(location.search);return {product:q.get('product')||'',category:categories.some(([id])=>id===q.get('category'))?q.get('category'):'all',query:q.get('q')||''};};
const hrefFor=(product='',category='all',query='')=>{const u=new URL(location.href);u.searchParams.set('tab','store');u.searchParams.set('page','shop');for(const key of ['intent','screen','product','category','q'])u.searchParams.delete(key);if(product)u.searchParams.set('product',product);if(category!=='all')u.searchParams.set('category',category);if(query)u.searchParams.set('q',query);return u.pathname+u.search;};
function Artwork({product}){return product.image?<AssetImage asset={product.image} alt={product.name} />:<div className="store-art-pending"><span aria-hidden="true">{product.name}</span><small>Изображение скоро появится</small></div>;}
function ProductAction({Shared,db,inCart,onAdd,onOpenCart,productName,quantityPending=false}){
 const [pending,setPending]=useState(false);
 const addTimer=useRef(null),focusAfterAdd=useRef(null);
 useLayoutEffect(()=>()=>clearTimeout(addTimer.current),[]);
 useLayoutEffect(()=>{
  if(inCart&&addTimer.current!==null){
   clearTimeout(addTimer.current);
   addTimer.current=null;
   setPending(false);
  }
 },[inCart]);
 useLayoutEffect(()=>{
  if(pending||!focusAfterAdd.current)return;
  const button=focusAfterAdd.current;
  focusAfterAdd.current=null;
  if(document.activeElement===document.body)button.focus();
 },[pending]);
 const label=inCart?'В корзине':'В корзину';
 return <Shared.Button
  group={db.components.find(c=>c.name===(productName?'Boris / Icon button':'Boris / Button'))}
  choice={{Tone:inCart&&productName?'Soft':'Primary',Size:'48'}}
  fixed={!!productName}
  icon={productName?db.components.find(c=>c.name==='Plus')?.id:undefined}
  iconContent={productName&&inCart?<span className="cab-solar-icon" aria-hidden="true" style={{maskImage:`url("${cartIcon}")`,WebkitMaskImage:`url("${cartIcon}")`}}/>:undefined}
  label={label}
  loading={pending||quantityPending}
  ariaLabel={productName?`${label}: ${productName}`:label}
  onClick={e=>{
   e.stopPropagation();
   if(e.detail>1||addTimer.current!==null||quantityPending)return;
   if(inCart){onOpenCart();return;}
   if(e.currentTarget.matches(':focus-visible'))focusAfterAdd.current=e.currentTarget;
   setPending(true);
   // Keep the local add fixture observable before committing the cart update.
   addTimer.current=setTimeout(()=>{
    addTimer.current=null;
    try{onAdd();}
    catch(error){console.error(error);}
    finally{setPending(false);}
   },600);
  }}
 />;
}

function ProductPurchase({Shared,db,product,quantity,onAdd,onQuantity,onRemove,onOpenCart}){
 const [quantityPending,setQuantityPending]=useState(false);
 const root=useRef(null),restoreFocus=useRef(false);
 const inCart=quantity>0;
 useLayoutEffect(()=>{
  if(!inCart&&!quantityPending&&restoreFocus.current){
   restoreFocus.current=false;
   root.current?.querySelector('button')?.focus();
  }
 },[inCart,quantityPending]);
 return <div ref={root} className="store-purchase-area profile" data-in-cart={inCart}>
  <ProductAction Shared={Shared} db={db} inCart={inCart} quantityPending={quantityPending} onAdd={()=>onAdd(product.id,1)} onOpenCart={onOpenCart}/>
  <div className="store-purchase-quantity">
   {inCart&&<QuantityControl Shared={Shared} db={db} label={`Количество ${product.name}`} value={quantity} onChange={value=>onQuantity(product.id,value)} onPendingChange={setQuantityPending} onRemove={shouldRestoreFocus=>{
    restoreFocus.current=shouldRestoreFocus;
    onRemove(product.id);
   }}/>}
  </div>
 </div>;
}

const expertSpecifications = [
 ['Формат', 'Стационарный прибор'],
 ['Назначение', 'Подбор программы'],
 ['Связь с другими приборами', 'Balance получает программу от Expert'],
];

function ProductDetails({productId}) {
 const {body, specifications = productId === 'expert' ? expertSpecifications : []} = productDescriptions[productId] ?? {};
 const paragraphs = body?.trim().split(/\n\s*\n/) ?? [];
 if (!paragraphs[0] && !specifications.length) return null;

 return <div className="store-product-details profile">
  {paragraphs[0] && <details open>
   <summary>Описание<Arrow/></summary>
   {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
  </details>}
  {specifications.length > 0 && <details>
   <summary>Характеристики<Arrow/></summary>
   <dl>{specifications.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
  </details>}
 </div>;
}

export default function Storefront({Shared,db,onCountChange,onAdd,onQuantity,onRemove,cartLines=[],navigate:goToPage}){
 const [route,setRoute]=useState(readRoute),[query,setQuery]=useState(()=>readRoute().query);const heading=useRef(null),moved=useRef(false),skeletonRoot=useRef(null);
 usePageSkeleton(skeletonRoot,route.product,{initial:false});
 useEffect(()=>{const back=()=>{const next=readRoute();setRoute(next);setQuery(next.query);moved.current=true;};window.addEventListener('popstate',back);return()=>window.removeEventListener('popstate',back);},[]);
 useEffect(()=>{if(moved.current){heading.current?.focus({preventScroll:true});heading.current?.closest('.cab-main')?.scrollTo(0,0);}},[route.product]);
 const navigate=(product='',category=route.category,q=query)=>{history.pushState({},'',hrefFor(product,category,q));moved.current=true;setRoute({product,category,query:q});setQuery(q);};
 const follow=(e,product='',category=route.category)=>{if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();navigate(product,category);};
 const Button=({label,onClick,tone='Soft',loading=false})=><Shared.Button group={db.components.find(c=>c.name==='Boris / Button')} choice={{Tone:tone,Size:'48'}} label={label} onClick={onClick} loading={loading}/>;
 const catalogRef=useRef(null);
 const selected=storefrontProducts.find(p=>p.id===route.product),visible=storefrontProducts.filter(p=>(route.category==='all'||p.category===route.category)&&`${p.name} ${p.description}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
 useEffect(()=>{onCountChange?.(route.product?null:visible.length);},[route.product,visible.length,onCountChange]);
 const cartQuantity=id=>cartLines.find(line=>line.productId===id)?.quantity??0;
 const selectedQuantity=selected?cartQuantity(selected.id):0;
 const pricingQuantity=selectedQuantity||1;
 const openCart=()=>goToPage?.('cart');
 const tabItems=categories.map(([value,label])=>({value,label,count:storefrontProducts.filter(p=>(value==='all'||p.category===value)&&`${p.name} ${p.description}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())).length}));
 return <div ref={skeletonRoot} className="store store-embedded"><div className="store-main" key={route.product||'catalog'}>
 {route.product?selected?<><div className="store-back"><CabinetButton Shared={Shared} db={db} label="Вернуться в каталог" leadingIconContent={<Shared.Icon name="return-to-list"/>} onClick={()=>navigate()}/></div><div className="store-detail"><ProductGallery key={selected.id} product={selected} Shared={Shared} db={db}/><section className="store-detail-copy"><CategoryLabel category={selected.category}/><h1 tabIndex={-1} ref={heading}>{selected.name}</h1><p className="store-lead">{selected.description}</p><ProductDetails productId={selected.id}/><div className="store-availability" aria-live="polite"><div className="store-purchase-total"><span>Сумма за {pricingQuantity} шт.</span><RollingMoney value={goodsTotal([{productId:selected.id,quantity:pricingQuantity}],products)} format={cents=>formatPrice(cents/100)}/></div><span>{priceLabel(selected)} за 1 шт.</span></div><ProductPurchase Shared={Shared} db={db} product={selected} quantity={selectedQuantity} onAdd={onAdd} onQuantity={onQuantity} onRemove={onRemove} onOpenCart={openCart}/></section></div><section className="store-related profile"><h2>В этой категории</h2><div className="store-related-grid">{storefrontProducts.filter(p=>p.category===selected.category&&p.id!==selected.id).map(p=><ProductCard compact key={p.id} product={p} Shared={Shared} db={db} href={hrefFor(p.id,route.category,query)} onClick={e=>follow(e,p.id)}/>)}</div></section></>:<section className="store-empty"><h1 ref={heading} tabIndex={-1}>Продукт не найден</h1><Button label="В каталог" onClick={()=>navigate('','all','')}/></section>:<>
 <section className="store-feature store-category-devices"><div><CategoryLabel category="devices"/><h2>Deep Sleep</h2><p><span className="store-feature-description">Время замедлиться: Deep Sleep для спокойного вечернего ритуала и отдыха.</span><span className="store-feature-short">Время замедлиться</span></p><a className="store-feature-link" href={hrefFor('deep-sleep',route.category,query)} onClick={e=>follow(e,'deep-sleep')} aria-label="Подробнее о Deep Sleep">Подробнее</a></div><AssetImage asset={marketplaceAssets['./assets/marketplace-products/banner-v2.png']||products.find(p=>p.id==='deep-sleep').image} alt=""/></section>
 <section ref={catalogRef} tabIndex={-1} className="store-catalog" aria-label="Каталог продуктов"><CatalogToolbar Shared={Shared} db={db} leading={<h1 ref={heading} tabIndex={-1} className="store-catalog-title">Все продукты</h1>} expandSearch resetActive={!!query} onReset={()=>navigate('',route.category,'')} items={tabItems} value={route.category} onChange={id=>navigate('',id)} label="Категории" idPrefix="store-tab-" panelId="store-products" query={query} searchLabel="Найти продукт" onQueryChange={value=>{setQuery(value);history.replaceState({},'',hrefFor('',route.category,value));}}/>
 <div id="store-products" role="tabpanel" aria-labelledby={'store-tab-'+route.category}>{visible.length?<div className="store-grid">{visible.map(product=><ProductCard key={product.id} product={product} Shared={Shared} db={db} onAdd={onAdd} onOpenCart={openCart} quantity={cartQuantity(product.id)} href={hrefFor(product.id,route.category,query)} onClick={e=>follow(e,product.id)}/>)}</div>:<div className="store-empty"><h2>Ничего не нашлось</h2><p>Попробуйте другое название или выберите все продукты.</p><Button label="Сбросить поиск" onClick={()=>navigate('','all','')}/></div>}</div></section>
 </>}
 </div></div>;
}

const cardSurfaces={expert:'photo',balance:'light',beauty:'dark',water:'light','mini-balance':'dark','deep-sleep':'photo','bio-life':'light','more-life':'photo','neuro-life':'dark',pulse:'dark',training:'light','a-scan':'photo'};
export function ProductCard({product,href,onClick,onAdd,onOpenCart,quantity,Shared,db,compact=false}){
 const surface=compact?'photo':cardSurfaces[product.id]||'photo';
 const render=surface==='photo'?null:productRenders[`./assets/marketplace-products/renders/${product.id}-${surface}.png`];
 const cover=render||(surface==='photo'?product.gallery[2]:product.gallery[0])||product.image;
 const coverIndex=product.gallery.indexOf(cover);
 return <article data-surface={surface} className={'store-product store-category-'+product.category+(compact?' store-product-compact':'')+(cover?.fullBleed?' has-fullbleed-art':'')}>
 <div className="store-product-art">
 <AssetImage className={`store-gallery-layer ${render?'is-render':coverIndex>=2?'is-lifestyle':'is-studio'}`} asset={cover} alt={product.name} data-visible="true"/>
 </div><div className="store-product-bottom"><div className="store-product-heading"><CategoryLabel category={product.category}/><h2><a className="store-product-link" href={href} onClick={onClick} aria-label={`Подробнее: ${product.name}`}>{product.name}</a></h2>{product.description!=='Приборы Virena'&&<p>{product.description}</p>}</div><div className="store-product-purchase"><span className="store-product-price">{priceLabel(product)}</span>{onAdd&&<div className="store-card-action" data-cart-action="true"><ProductAction Shared={Shared} db={db} productName={product.name} inCart={quantity>0} onAdd={()=>onAdd(product.id,1)} onOpenCart={onOpenCart}/></div>}</div></div></article>;
}
function ProductGallery({product,Shared,db}){
 const [{requested,view},setSelection]=useState({requested:0,view:0});
 const buttons=useRef([]),loaded=useRef(new Set());
 const select=next=>{
  const ready=loaded.current.has(next);
  setSelection(current=>({requested:next,view:ready?next:current.view}));
 };
 const onLoad=index=>{
  loaded.current.add(index);
  setSelection(current=>current.requested===index&&current.view!==index?{...current,view:index}:current);
 };
 const order=product.gallery.map((_,i)=>i).sort((a,b)=>(a<2)-(b<2));
 const gallery=order.map(i=>product.gallery[i]),count=gallery.length;
 const sourceLabels=product.galleryLabels||(product.id==='expert'?angleNames:product.gallery.map((_,i)=>`Ракурс ${i+1}`));
 const labels=order.map(i=>sourceLabels[i]);
 const key=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?count-1:(requested+(e.key==='ArrowRight'?1:count-1))%count;select(next);buttons.current[next]?.focus();};
 return <div className="store-expert-gallery profile"><div className="store-detail-art store-detail-generated">{gallery.map((asset,i)=><AssetImage key={i} asset={asset} className={`store-gallery-layer ${order[i]<2?'is-studio':'is-lifestyle'}`} data-visible={view===i} alt={view===i?`${product.name} — ${labels[i]}`:''} aria-hidden={view!==i} onLoad={()=>onLoad(i)}/>)}{count>1&&<div className="store-gallery-controls">{[-1,1].map(direction=><Shared.Button key={direction} group={db.components.find(c=>c.name==='Boris / Icon button')} choice={{Tone:'Soft',Size:'48'}} ariaLabel={direction<0?'Предыдущее фото':'Следующее фото'} label={direction<0?'Предыдущее фото':'Следующее фото'} iconContent={<span className={direction<0?'store-gallery-arrow is-prev':'store-gallery-arrow'} aria-hidden="true" dangerouslySetInnerHTML={{__html:chevron.replaceAll('stroke="black"','stroke="currentColor"')}}/>} onClick={()=>select((requested+direction+count)%count)}/>)}</div>}<span className="store-gallery-status" role="status" aria-live="polite">{`${view+1} из ${count}: ${labels[view]}`}</span></div><div className="store-thumbnails" role="group" aria-label={`Ракурсы ${product.name}`} onKeyDown={key}>{gallery.map((asset,i)=><button type="button" key={i} ref={el=>{buttons.current[i]=el;}} aria-label={labels[i]} aria-pressed={view===i} onClick={()=>select(i)}><AssetImage asset={asset} alt=""/></button>)}</div></div>;
}
