import React,{useState,useEffect,useRef,useId} from 'react';
import deviceSheet from './assets/catalog-demo/sheet-0.jpg';
import nutritionSheet from './assets/catalog-demo/sheet-1.jpg';
import digitalSheet from './assets/catalog-demo/sheet-2.jpg';
import CatalogToolbar from './CatalogToolbar.jsx';
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
function AssetImage({asset,...props}){const clipId=useId().replaceAll(':','');return typeof asset==='string'?<img src={asset} {...props}/>:<svg {...props} role="img" viewBox={`${asset.x} ${asset.y} ${asset.w} ${asset.h}`} preserveAspectRatio={asset.fullBleed?"xMidYMid slice":"xMidYMid meet"} aria-label={props.alt}><defs><clipPath id={clipId}><rect x={asset.x} y={asset.y} width={asset.w} height={asset.h}/></clipPath></defs><image href={asset.src} width="1024" height="1024" clipPath={`url(#${clipId})`} onLoad={props.onLoad}/></svg>;}

const categories=[['all','Все продукты'],['devices','Приборы'],['nutrition','Питание'],['online','Онлайн-продукты']];
const demoPrices={expert:690,balance:290,beauty:240,water:180,'mini-balance':190,'deep-sleep':220,'bio-life':49,'more-life':59,'neuro-life':69,pulse:39,training:29,'a-scan':19};
const priceLabel=product=>new Intl.NumberFormat('ru-RU',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(product.price);
export const products=[
 ['expert','Expert','devices','Стационарный прибор для подбора программы'],
 ['balance','Balance','devices','Приборы Virena'],['beauty','Beauty','devices','Приборы Virena'],['water','Water','devices','Приборы Virena'],['mini-balance','Mini Balance','devices','Приборы Virena'],['deep-sleep','Deep Sleep','devices','Приборы Virena'],
 ['bio-life','Bio Life','nutrition','Питание в саше'],['more-life','More Life','nutrition','Питание в саше'],['neuro-life','Neuro Life','nutrition','Питание в саше'],
 ['pulse','Virena Pulse','online','Онлайн-продукты Virena'],['training','Обучающий бот','online','Обучение'],['a-scan','A-Scan','online','Отдельный сервис']
].map(([id,name,category,description])=>({id,name,category,description,price:demoPrices[id],image:id==='expert'?expertImage:demoGallery[id][0],gallery:id==='expert'?expertAngles:demoGallery[id]}));
const readRoute=()=>{const q=new URLSearchParams(location.search);return {product:q.get('product')||'',category:categories.some(([id])=>id===q.get('category'))?q.get('category'):'all',query:q.get('q')||''};};
const hrefFor=(product='',category='all',query='')=>{const u=new URL(location.href);u.searchParams.set('tab','cabinet');u.searchParams.set('page','shop');for(const key of ['intent','screen','product','category','q'])u.searchParams.delete(key);if(product)u.searchParams.set('product',product);if(category!=='all')u.searchParams.set('category',category);if(query)u.searchParams.set('q',query);return u.pathname+u.search;};
function Artwork({product}){return product.image?<AssetImage asset={product.image} alt={product.name} />:<div className="store-art-pending"><span aria-hidden="true">{product.name}</span><small>Изображение скоро появится</small></div>;}
export default function Storefront({Shared,db,onCountChange}){
 const [route,setRoute]=useState(readRoute),[query,setQuery]=useState(()=>readRoute().query);const heading=useRef(null),moved=useRef(false);
 useEffect(()=>{const back=()=>{const next=readRoute();setRoute(next);setQuery(next.query);moved.current=true;};window.addEventListener('popstate',back);return()=>window.removeEventListener('popstate',back);},[]);
 useEffect(()=>{if(moved.current){heading.current?.focus({preventScroll:true});heading.current?.closest('.cab-main')?.scrollTo(0,0);}},[route.product]);
 const navigate=(product='',category=route.category,q=query)=>{history.pushState({},'',hrefFor(product,category,q));moved.current=true;setRoute({product,category,query:q});setQuery(q);};
 const follow=(e,product='',category=route.category)=>{if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();navigate(product,category);};
 const Button=({label,onClick,tone='Outline'})=><Shared.Button group={db.components.find(c=>c.name==='Boris / Button')} choice={{Tone:tone,Size:'48'}} label={label} onClick={onClick}/>;
 const selected=products.find(p=>p.id===route.product),visible=products.filter(p=>(route.category==='all'||p.category===route.category)&&`${p.name} ${p.description}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
 useEffect(()=>{onCountChange?.(route.product?null:visible.length);},[route.product,visible.length,onCountChange]);
 const tabItems=categories.map(([value,label])=>({value,label,count:products.filter(p=>(value==='all'||p.category===value)&&`${p.name} ${p.description}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())).length}));
 return <div className="store store-embedded"><div className="store-main" key={route.product||'catalog'}>
 {route.product?selected?<><nav className="store-breadcrumb" aria-label="Хлебные крошки"><a href={hrefFor('',route.category,query)} onClick={e=>follow(e)}>Каталог</a><span aria-hidden="true">/</span><span>{selected.name}</span></nav><div className="store-detail"><ProductGallery key={selected.id} product={selected}/><section className="store-detail-copy"><span className="store-eyebrow">{categories.find(([id])=>id===selected.category)?.[1]} Virena</span><h1 tabIndex={-1} ref={heading}>{selected.name}</h1><p className="store-lead">{selected.description}</p>{selected.id==='expert'&&<p>Expert подбирает программу, которую может получать носимый прибор Balance.</p>}<div className="store-availability"><strong>{priceLabel(selected)}</strong></div><Button label="Вернуться в каталог" onClick={()=>navigate()} /></section></div><section className="store-about"><h2>О продукте</h2>{selected.id==='expert'?<dl><div><dt>Формат</dt><dd>Стационарный прибор</dd></div><div><dt>Назначение</dt><dd>Подбор программы</dd></div><div><dt>Связь с другими приборами</dt><dd>Balance получает программу от Expert</dd></div></dl>:<p>Подробное описание продукта скоро появится.</p>}</section><section className="store-related"><h2>В этой категории</h2><div className="store-related-links">{products.filter(p=>p.category===selected.category&&p.id!==selected.id).map(p=><a key={p.id} href={hrefFor(p.id,route.category,query)} onClick={e=>follow(e,p.id)}>{p.name}<Arrow/></a>)}</div></section></>:<section className="store-empty"><h1 ref={heading} tabIndex={-1}>Продукт не найден</h1><Button label="В каталог" onClick={()=>navigate('','all','')}/></section>:<>
 <section ref={!route.product?heading:undefined} tabIndex={-1} className="store-catalog" aria-label="Каталог продуктов"><CatalogToolbar Shared={Shared} items={tabItems} value={route.category} onChange={id=>navigate('',id)} label="Категории" idPrefix="store-tab-" panelId="store-products" query={query} searchLabel="Найти продукт" onQueryChange={value=>{setQuery(value);history.replaceState({},'',hrefFor('',route.category,value));}}/>
 <div id="store-products" role="tabpanel" aria-labelledby={'store-tab-'+route.category}>{visible.length?<div className="store-grid">{visible.map(product=><ProductCard key={product.id} product={product} Shared={Shared} db={db} href={hrefFor(product.id,route.category,query)} onClick={e=>follow(e,product.id)}/>)}</div>:<div className="store-empty"><h2>Ничего не нашлось</h2><p>Попробуйте другое название или выберите все продукты.</p><Button label="Сбросить поиск" onClick={()=>navigate('','all','')}/></div>}</div></section>
 </>}
 </div></div>;
}

function ProductCard({product,href,onClick,Shared,db}){
 const [view,setView]=useState(-1),[loaded,setLoaded]=useState([]),[hovered,setHovered]=useState(false),[focused,setFocused]=useState(false);
 const gallery=product.gallery,count=gallery.length,active=loaded.includes(view)?view:-1;
 const move=e=>{if(e.pointerType==='touch')return;const r=e.currentTarget.getBoundingClientRect(),x=e.clientX-r.left,zone=r.width/count;
 setView(current=>{const slot=count===2?(current+1)%2:current;if(current>=0&&x>=slot*zone-6&&x<=(slot+1)*zone+6)return current;const next=Math.max(0,Math.min(count-1,Math.floor(x/zone)));return count===2?(next+1)%2:next;});};
 const keyboard=e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();setView(v=>(Math.max(0,v)+(e.key==='ArrowRight'?1:count-1))%count);}};
 return <article className={'store-product'+(product.image?.fullBleed?' has-fullbleed-art':'')} onPointerEnter={e=>{if(e.pointerType!=='touch'){setHovered(true);setView(count===2?1:0);}}} onPointerMove={move} onPointerLeave={()=>{setHovered(false);setView(-1);}} onFocusCapture={()=>setFocused(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget)){setFocused(false);setView(-1);}}} onKeyDown={keyboard}>
 <div className="store-product-art" data-active-view={active}>
 <AssetImage className="store-gallery-layer" asset={product.image} alt={active===-1?product.name:''} aria-hidden={active!==-1} data-visible={active===-1}/>
 {gallery.map((asset,i)=><AssetImage className="store-gallery-layer store-generated" key={i} asset={asset} alt={active===i?`${product.name} — ракурс ${i+1}`:''} aria-hidden={active!==i} data-visible={active===i} onLoad={()=>setLoaded(v=>v.includes(i)?v:[...v,i])}/>)}
 <span className="store-gallery-bars" aria-hidden="true">{gallery.map((_,i)=><i key={i} data-active={active===i}/>)}</span>
 </div><div className="store-product-bottom"><div><span className="store-eyebrow">{categories.find(([id])=>id===product.category)?.[1]}</span><h2><a className="store-product-link" href={href} onClick={onClick} aria-label={`Подробнее: ${product.name}`}>{product.name}</a></h2></div><span className="store-card-action"><Shared.Button group={db.components.find(c=>c.name==='Boris / Button')} choice={{Tone:hovered||focused?'Primary':'Soft',Size:'56'}} label={priceLabel(product)} ariaLabel={`${product.name} — ${priceLabel(product)}`} onClick={onClick}/></span></div></article>;
}
function ProductGallery({product}){
 const [view,setView]=useState(0);const buttons=useRef([]),gallery=product.gallery,count=gallery.length;
 const labels=product.id==='expert'?angleNames:gallery.map((_,i)=>`Ракурс ${i+1}`);
 const key=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?count-1:(view+(e.key==='ArrowRight'?1:count-1))%count;setView(next);buttons.current[next]?.focus();};
 return <div className="store-expert-gallery"><div className="store-detail-art store-detail-generated">{gallery.map((asset,i)=><AssetImage key={i} asset={asset} className="store-gallery-layer" data-visible={view===i} alt={view===i?`${product.name} — ${labels[i]}`:''} aria-hidden={view!==i}/>)}</div><div className="store-thumbnails" role="group" aria-label={`Ракурсы ${product.name}`} onKeyDown={key}>{gallery.map((asset,i)=><button type="button" key={i} ref={el=>{buttons.current[i]=el;}} aria-label={labels[i]} aria-pressed={view===i} onClick={()=>setView(i)}><AssetImage asset={asset} alt=""/></button>)}</div></div>;
}
