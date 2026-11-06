import {t,useLocale} from './i18n.js';
import React,{useState,useEffect} from 'react';
import {LiveCatalog,liveFamilies} from './LiveCatalog.jsx';
import AuthFlow from './AuthFlow.jsx';
import CabinetShell from './CabinetShell.jsx';
import CardCatalog,{cardFamilies} from './cabinet/components/CardCatalog.jsx';
import logoUrl from './assets/virena-logo.svg';
import {createDemos} from './InteractiveDemos.jsx';
import {SegmentedTabs,AuthPrimitiveDemo} from './AuthPrimitives.jsx';
import {createRoot} from 'react-dom/client';
import '@fontsource/inter/400.css';import '@fontsource/inter/500.css';import '@fontsource/inter/600.css';import './style.css';
import './theme.css';
import './design-variants.css';
import {themePaint} from './theme.js';
// Keep previously shared storefront links inside the cabinet.
if(new URLSearchParams(location.search).get('tab')==='store'){const u=new URL(location.href);u.searchParams.set('tab','cabinet');u.searchParams.set('page','shop');history.replaceState({},'',u);}
// Prototype deep links mirror the profile routes from TES-339.
const profilePath=location.pathname.match(/\/profile\/(personal|contacts|security|requisites|successor|settings)\/?$/);
if(profilePath){const u=new URL(location.href);u.pathname=import.meta.env.BASE_URL;u.searchParams.set('tab','cabinet');u.searchParams.set('page','profile');u.searchParams.set('profileTab',profilePath[1]);history.replaceState({},'',u);}
const db=await (await fetch(import.meta.env.BASE_URL+'snapshot.json')).json();
for(const asset of Object.values(db.assets))if(asset.url?.startsWith('/'))asset.url=import.meta.env.BASE_URL+asset.url.slice(1);
const displayName=value=>String(value??'').replace(/Boris/gi,'Virena').replace(/Борис/gi,'Антон');
const groups=new Map(db.components.map(c=>[c.id,c]));
const isIcon=c=>/\/ (?:Navigation icon|Icon) \/ /.test(c.name)||['Grid','Mute on','Turn off video','Share','Plus','Serach','Pencil','Cross','Trash','Subtract'].includes(c.name);
const icons=db.components.filter(isIcon);
const isArtwork=c=>/\/ Artwork \/|\/ Product image \/|Promo \/ Image/.test(c.name);
const artworks=db.components.filter(isArtwork);
const masters=new Map(db.components.flatMap(c=>c.variants.map(v=>[v.id,{...v,set:c.id}])));
const color=themePaint;
const ink=(ps,role='surface')=>color(ps?.find(p=>p.visible!==false&&p.type==='SOLID'),role);
function text(n){if(n.visible===false)return '';return n.text!=null?displayName(n.text):(n.children||[]).map(text).join(' ');}
function css(n,root=false){
 const s={position:root?'relative':'absolute',left:root?0:n.x,top:root?0:n.y,width:n.w,height:n.h,opacity:n.opacity??1,borderRadius:n.radius||0,boxSizing:'border-box',overflow:n.clips?'hidden':undefined};
 if(n.type!=='TEXT'){
  s.backgroundColor=ink(n.fills,n.type==='ELLIPSE'?'ink':'surface');const im=n.fills?.find(p=>p.type==='IMAGE'&&p.visible!==false);if(im&&db.assets[im.src]?.url){s.backgroundImage=`url(${db.assets[im.src].url})`;s.backgroundSize=im.scaleMode==='FIT'?'contain':'cover';s.backgroundPosition='center';s.backgroundRepeat='no-repeat';}
  const stroke=n.strokes?.find(p=>p.visible!==false&&p.type==='SOLID');
  const shadows=(n.effects||[]).filter(e=>e.visible!==false&&['DROP_SHADOW','INNER_SHADOW'].includes(e.type)).map(e=>`${e.type==='INNER_SHADOW'?'inset ':''}${e.offset.x}px ${e.offset.y}px ${e.radius}px ${e.spread||0}px ${color({color:e.color})}`);
  if(stroke)shadows.push(`inset 0 0 0 ${n.strokeWeight||1}px ${color(stroke,'line')}`);if(shadows.length)s.boxShadow=shadows.join(',');
 }else Object.assign(s,{color:ink(n.fills,'ink'),fontFamily:'Inter',fontSize:n.size,fontWeight:/bold/i.test(n.font?.style||'')?600:/medium/i.test(n.font?.style||'')?500:400,lineHeight:n.line?.unit==='PIXELS'?`${n.line.value}px`:n.line?.unit==='PERCENT'?`${n.line.value}%`:'normal',letterSpacing:n.spacing?.unit==='PERCENT'?`${n.spacing.value/100}em`:n.spacing?.value||0,textAlign:(n.align||'LEFT').toLowerCase(),whiteSpace:n.text?.includes('\n')?'pre-wrap':n.h<=(n.size||16)*1.6?'nowrap':'pre-wrap',textDecoration:n.decoration==='UNDERLINE'?'underline':undefined});
 if(n.type==='TEXT'&&n.valign==='CENTER')Object.assign(s,{display:'flex',alignItems:'center',justifyContent:n.align==='CENTER'?'center':n.align==='RIGHT'?'flex-end':'flex-start'});
 return s;
}
function Node({node:n,root=false,live=false,act,values,setValue,fieldLabel,animate=false}){
 if(n.visible===false)return null;
 const family=groups.get(n.set)?.name||'';
 if(live&&['Auth / Input','Auth / Code cell','Auth / Phone','Auth / Select','Auth / Account ID','Boris / Search','Boris / Button','Boris / Icon button','Auth / Link','Boris / Checkbox','Boris / Switch'].includes(family))
  return <FlowControl node={n} root={root} family={family} fieldLabel={fieldLabel} values={values} setValue={setValue} act={act}/>;
 if(family==='Virena / Brand / Logo'||n.name==='Virena / Brand / Logo')return <span role="img" aria-label="Virena" data-ui="Logo" data-node={n.id} style={{position:root?'relative':'absolute',left:root?0:n.x,top:root?0:n.y,width:n.w,height:n.h,display:'block',backgroundColor:ink(n.children?.find(c=>c.fills?.some(p=>p.visible!==false))?.fills,'ink'),mask:`url("${logoUrl}") center / contain no-repeat`,WebkitMask:`url("${logoUrl}") center / contain no-repeat`}}/>;
 const control=false;
 const s=css(n,root); if(n.name==='Virena / Navigation icon / Branch'||n.master==='134:47409')s.transform=[s.transform,'scaleY(-1)'].filter(Boolean).join(' '); if(animate && (n.type==="ELLIPSE" || /spinner|loading/i.test(n.name))) s.animation="lab-spin .8s linear infinite";
 if(n.svg){const a=db.assets[n.svg];const b=n.bounds,r=n.render;const geometry={...s,backgroundColor:'transparent',boxShadow:'none',left:(root?0:n.x)+(r&&b?r.x-b.x:0),top:(root?0:n.y)+(r&&b?r.y-b.y:0),width:r?.width||n.w,height:r?.height||n.h};const paint=n.fills?.find(p=>p.type==='SOLID'&&p.visible!==false)||n.strokes?.find(p=>p.type==='SOLID'&&p.visible!==false);if(a?.url&&paint&&a.url.endsWith('.svg'))return <span data-node={n.id} style={{...geometry,display:'block',backgroundColor:color(paint,'ink'),mask:`url(${a.url}) center / 100% 100% no-repeat`,WebkitMask:`url(${a.url}) center / 100% 100% no-repeat`}}/>;return <img alt="" draggable="false" data-node={n.id} style={geometry} src={a?.url}/>;}
 return <div style={{...s,cursor:control?'pointer':undefined}} data-node={n.id} data-master={n.master} role={control?'button':undefined} tabIndex={control?0:undefined} aria-label={control?text(n).trim():undefined} onClick={control?e=>{e.stopPropagation();act(text(n).trim());}:undefined} onKeyDown={control?e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();act(text(n).trim());}}:undefined}>
 {n.type==='TEXT'?(n.runs?.length?n.runs.map((r,i)=><span key={i} style={{color:ink(r.fills,'ink'),fontSize:r.fontSize,fontWeight:/medium/i.test(r.fontName?.style||'')?500:400,textDecoration:r.textDecoration==='UNDERLINE'?'underline':'none'}}>{displayName(r.characters)}</span>):displayName(n.text)):n.children?.map(c=><Node key={c.id} node={c} animate={animate||n.variants?.State==='Loading'} live={live} act={act} values={values} setValue={setValue} fieldLabel={n.name.startsWith('Field / ')?n.name.slice(8):n.name.startsWith('Checkbox / ')?n.name.slice(11):fieldLabel}/>)}
 </div>;
}
function Demo({group,variant}){return <div className="sample"><Node node={variant} root/></div>;}
function Playground({group}){
 const [displayState,setDisplayState]=useState('Default');
 const initial=group.variants.find(v=>v.variants?.State==='Default')||group.variants[0];
 const axes={};group.variants.forEach(v=>Object.entries(v.variants||{}).forEach(([k,val])=>{(axes[k]??=[]).includes(val)||axes[k].push(val);}));
 const [choice,setChoice]=useState(initial.variants||{}),[hover,setHover]=useState(false),[focus,setFocus]=useState(false),[pressed,setPressed]=useState(false),[disabled,setDisabled]=useState(false),[loading,setLoading]=useState(false),[showIcon,setShowIcon]=useState(false),[label,setLabel]=useState(text(initial).trim()),[icon,setIcon]=useState(icons[0]?.id),[clicks,setClicks]=useState(0);
 const states=axes.State||[],button=/button|action|link/i.test(group.name),textButton=group.name==='Boris / Button',iconButton=group.name==='Boris / Icon button';
 const state=disabled?'Disabled':loading?'Loading':pressed&&states.includes('Pressed')?'Pressed':focus&&states.includes('Focus')?'Focus':hover&&states.includes('Hover')?'Hover':'Default';
 const n=group.variants.find(v=>Object.entries(choice).every(([k,val])=>k==='State'||v.variants?.[k]===val)&&(!states.length||v.variants?.State===state))||group.variants.find(v=>Object.entries(choice).every(([k,val])=>k==='State'||v.variants?.[k]===val))||initial;
 const handlers={onPointerEnter:e=>{if(e.pointerType!=='touch')setHover(true);},onPointerLeave:()=>{setHover(false);setPressed(false);},onPointerDown:()=>{setFocus(false);setPressed(true);},onPointerUp:()=>setPressed(false),onFocus:e=>setFocus(e.currentTarget.matches(':focus-visible')),onBlur:()=>{setFocus(false);setPressed(false);},onKeyDown:e=>{setFocus(true);if([' ','Enter'].includes(e.key))setPressed(true);},onKeyUp:()=>setPressed(false),onClick:()=>{if(disabled||loading)return;setClicks(c=>c+1);if(axes.Value?.includes('On'))setChoice(c=>({...c,Value:c.Value==='On'?'Off':'On'}));}};
 const custom=textButton||iconButton;
 const isSwitch=group.name==='Boris / Switch';

 return <div className="playground"><div className="preview"><div className="preview-stage">
 {(custom)?<Shared.Button group={group} choice={choice} label={label} icon={icon} showIcon={showIcon} disabled={disabled} loading={loading} ariaLabel="Тестовый компонент" onStateChange={setDisplayState} onClick={()=>setClicks(c=>c+1)}/>:
 (group.name==='Boris / Checkbox'||isSwitch)?<Shared.Toggle group={group} value={choice.Value==='On'} disabled={disabled} ariaLabel="Тестовый компонент" onStateChange={setDisplayState} onChange={v=>{setChoice({...choice,Value:v?'On':'Off'});setClicks(c=>c+1);}}/>:
 <button {...handlers} className="preview-control" data-state={state} disabled={disabled||loading} aria-label="Тестовый компонент"><Node node={n} root/></button>}
</div><div className="preview-status" role="status">{custom||isSwitch||group.name==='Boris / Checkbox'?displayState:state} · Нажатий: {clicks}</div></div>
 <div className="controls"><strong>Настройки</strong>{Object.entries(axes).filter(([key])=>key!=='State').map(([key,vals])=><label key={key}>{({Size:'Размер',Tone:'Стиль',Value:'Значение',Type:'Тип'})[key]||key}<select aria-label={key} value={choice[key]} onChange={e=>setChoice({...choice,[key]:e.target.value})}>{vals.map(v=><option key={v}>{v}</option>)}</select></label>)}
 {textButton&&<label>Текст<input aria-label="Текст" value={label} onChange={e=>setLabel(e.target.value)}/></label>}
 {textButton&&<label className="toggle"><input type="checkbox" checked={showIcon} onChange={e=>setShowIcon(e.target.checked)}/>Показать иконку</label>}
 {(textButton||iconButton)&&<label>Иконка<select aria-label="Иконка" disabled={textButton&&!showIcon} value={icon} onChange={e=>setIcon(e.target.value)}>{icons.map(i=><option key={i.id} value={i.id}>{i.name.split(' / ').at(-1)}</option>)}</select></label>}
 {states.includes('Disabled')&&<label className="toggle"><input type="checkbox" checked={disabled} onChange={e=>{setDisabled(e.target.checked);setLoading(false);}}/>Disabled</label>}
 {states.includes('Loading')&&<label className="toggle"><input type="checkbox" checked={loading} onChange={e=>{setLoading(e.target.checked);setDisabled(false);}}/>Loading</label>}
 <small>{button?'Наведи, зажми кнопку или перейди к ней клавишей Tab.':'Состояния реагируют на наведение и фокус. On/Off переключается нажатием.'}</small>
 </div></div>;
}
const Shared=createDemos({db,Node,css,text,ink});
const {InteractiveDemo}=Shared;
function FlowControl({node:n,root,family,fieldLabel,values={},setValue,act}){
 const group=groups.get(n.set),code=family==='Auth / Code cell';
 const key=code?n.id:fieldLabel||family;
 const selected=n.props?.State?.value;
 const placeholder=n.children?.find(c=>c.type==='TEXT')?.text;
 const position={position:root?'relative':'absolute',left:root?0:n.x,top:root?0:n.y,width:n.w,height:n.h};
 const options=fieldLabel==='Город'?({'Россия':['Москва','Санкт-Петербург'],'Казахстан':['Астана','Алматы'],'Германия':['Берлин','Мюнхен'],'США':['Нью-Йорк','Чикаго']}[values['Страна']]||[]):fieldLabel==='Мессенджер'?['Telegram','WhatsApp']:undefined;
 let control;
 if(['Auth / Input','Auth / Code cell','Auth / Phone','Boris / Search'].includes(family))control=<Shared.Field group={group} embedded source={n} type={n.props?.Type?.value} label={code?'Код '+n.id:key} placeholder={placeholder} codeLength={code?1:6} value={values[key]||''} onChange={v=>setValue(key,v)}/>;
 else if(family==='Auth / Select')control=<Shared.Select group={group} embedded source={n} label={key} placeholder={placeholder} items={options} value={values[key]||''} onChange={v=>{setValue(key,v);}}/>;
 else if(family==='Auth / Account ID')control=<Shared.Copy embedded/>;
 else if(['Boris / Checkbox','Boris / Switch'].includes(family))control=<Shared.Toggle group={group} source={n} ariaLabel={key} value={values[key]??(n.props?.Value?.value==='On')} onChange={v=>setValue(key,v)} disabled={selected==='Disabled'}/>;
 else control=<Shared.Button group={group} source={n} fixed label={text(n).trim()} showIcon={n.children?.some(c=>c.name==='Leading icon'&&c.visible!==false)} onClick={()=>act(text(n).trim())}/>;
 return <div className="flow-control" data-component={family} data-node={n.id} style={position}>{control}</div>;
}

const interactiveNames=['Members','Boris / Panel header','Boris / Member row','Boris / Meeting row','Boris / Search','Auth / Input','Auth / Phone','Auth / Code cell','Auth / Select','Auth / Select menu','Auth / Select option','Boris / Tooltip','Auth / Account ID','Boris / Nav item','Boris / Category tab','Boris / Avatar','Boris / Avatar stack','Boris / Meeting avatars'];
const catalogHidden=new Set(['Boris / Panel header','Boris / Avatar stack','Boris / Meeting avatars','Auth / Select option','Auth / Select menu','Auth / Code cell']);
const authPrimitiveNames=['Auth / Flow tabs','Auth / Password rules','Auth / Code','Auth / Date','Auth / Sponsor switch','Auth / Success','Auth / Toast'];
function Catalog({group,isIcons}){
 return <><h1>{displayName(group.name)}</h1>{!isIcons&&(group.name==='Boris / Status'?<div className="preview static-preview">{['Neutral','Success','Info','Danger'].map(tone=><Shared.Status key={tone} tone={tone} label={{Neutral:'Заморожен',Success:'Активен',Info:'Новый',Danger:'Льготное окно'}[tone]}/>)}</div>:liveFamilies.includes(group.name)?<LiveCatalog key={group.id} group={group} Shared={Shared} db={db}/>:authPrimitiveNames.includes(group.name)?<AuthPrimitiveDemo name={group.name} Shared={Shared} db={db}/>:interactiveNames.includes(group.name)?<InteractiveDemo group={group}/>:group.variants.some(v=>v.variants?.State)?<Playground key={group.id} group={group}/>:<div className="preview static-preview"><Node node={group.variants[0]} root/></div>)}
 {isIcons?<p>Иконки в исходном размере. Название ведёт к мастеру в Figma.</p>:null}
 {isIcons?<VariantGrid group={group} iconGrid/>:group.name!=='Boris / Status'&&!authPrimitiveNames.includes(group.name)&&<details className="variants"><summary>Все варианты и состояния ({group.variants.length})</summary><VariantGrid group={group}/></details>}
 </>;
}
function VariantGrid({group,iconGrid=false}){const related=group.name==='Auth / Select'?['Auth / Select option','Auth / Select menu']:group.name==='Boris / Avatar'?['Boris / Avatar stack','Boris / Meeting avatars']:[];if(related.length)group={...group,variants:[...group.variants,...db.components.filter(c=>related.includes(c.name)).flatMap(c=>c.variants)]};return <div className={'grid'+(iconGrid?' icon-grid':'')}>{group.variants.map(v=><section key={v.id}><a title={displayName(v.name)} href={`https://www.figma.com/design/${db.fileKey}?node-id=${v.id.replace(':','-')}`} target="_blank" rel="noreferrer">{iconGrid?v.name.split(' / ').at(-1):displayName(v.name)}</a>{group.name==='Иллюстрации'?<div className="art-preview"><div style={{width:v.w,height:v.h,transform:'scale('+Math.min(1,120/v.w,80/v.h)+')',transformOrigin:'center'}}><Node node={v} root/></div></div>:<Demo group={group} variant={v}/>}<small>{Math.round(v.w)} × {Math.round(v.h)}</small></section>)}</div>;}
function App(){useLocale();
 const [design,setDesign]=useState(()=>{try{return localStorage.getItem('virena-design')==='soft'?'soft':'original';}catch{return 'original';}});
 useEffect(()=>{document.documentElement.dataset.design=design;try{localStorage.setItem('virena-design',design);}catch{}},[design]);
 const [fullscreen,setFullscreen]=useState(false);
 useEffect(()=>{document.documentElement.toggleAttribute('data-content-fullscreen',fullscreen);const escape=e=>{if(e.key==='Escape')setFullscreen(false);};window.addEventListener('keydown',escape);return()=>{document.documentElement.removeAttribute('data-content-fullscreen');window.removeEventListener('keydown',escape);};},[fullscreen]);
 const fullscreenIcon=<svg viewBox="0 0 24 24" aria-hidden="true"><path d={fullscreen?'M4 9h5V4m6 0v5h5M4 15h5v5m6 0v-5h5':'M9 4H4v5m11-5h5v5M4 15v5h5m11-5v5h-5'}/></svg>;

 const [systemDark,setSystemDark]=useState(()=>matchMedia('(prefers-color-scheme: dark)').matches);
 useEffect(()=>{const media=matchMedia('(prefers-color-scheme: dark)');const update=()=>setSystemDark(media.matches);media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
 const [theme,setTheme]=useState(()=>{try{return localStorage.getItem('virena-theme')||'system';}catch{return 'system';}});
 useEffect(()=>{const media=matchMedia('(prefers-color-scheme: dark)');const apply=()=>{document.documentElement.dataset.theme=theme==='system'?(media.matches?'dark':'light'):theme;};apply();try{localStorage.setItem('virena-theme',theme);}catch{}media.addEventListener('change',apply);return()=>media.removeEventListener('change',apply);},[theme]);
 const dark=theme==='dark'||(theme==='system'&&systemDark);
 const params=new URLSearchParams(location.search);const [tab,setTab]=useState(['flows','cabinet','store'].includes(params.get('tab'))?params.get('tab'):'components'),[search,setSearch]=useState(''),[selected,setSelected]=useState(db.components.find(c=>c.name==='Boris / Button').id),[screen,setScreen]=useState(params.get('screen')||'login'),[values,setValues]=useState({}),[scenario,setScenario]=useState('success'),[message,setMessage]=useState('');
 const selectLabTab=next=>{const proceed=()=>{const url=new URL(location.href);url.searchParams.set('tab',next);history.pushState({},'',url);setTab(next);};const event=new CustomEvent('virena:leave-cabinet',{cancelable:true,detail:proceed});if(window.dispatchEvent(event))proceed();};
 useEffect(()=>{const back=()=>{const next=new URLSearchParams(location.search).get('tab');setTab(['flows','cabinet','store'].includes(next)?next:'components');};window.addEventListener('popstate',back);return()=>window.removeEventListener('popstate',back);},[]);
 const snap=db.screens.find(s=>s.name.split(' · ')[0]===screen)||db.screens[0];const authPrimitive=typeof selected==='string'&&selected.startsWith('auth-demo:');const group=authPrimitive?{id:selected,name:selected.slice('auth-demo:'.length),variants:[]}:['icons','artworks'].includes(selected)?{name:selected==='icons'?'Иконки':'Иллюстрации',variants:(selected==='icons'?icons:artworks).flatMap(c=>c.variants.map(v=>({...v,name:c.name})))}:groups.get(selected);
 function go(s){setScreen(s);setMessage('');}
 function act(label){
  const current=screen;
  if(/Забыли пароль/.test(label)){go('forgot');return;}
  if(/Зарегистрироваться/.test(label)&&!current.startsWith('register')){go('register');return;}
  if(/Уже.*Войти|Назад ко входу|Вернуться ко входу/.test(label)){go('login');return;}
  if(/Google/.test(label)){setMessage('Google – внешняя интеграция. В демо можно выбрать google-complete в списке состояний.');return;}
  if(/Войти/.test(label)&&current.startsWith('login')){go(scenario==='network'?'login-network':scenario==='error'?'login-error':Object.values(values).filter(v=>typeof v==='string'&&v).length<2?'login-validation':'destination');return;}
  if(/Зарегистрироваться|Создать аккаунт/.test(label)&&current.startsWith('register')){
   const vv=Object.values(values).filter(v=>typeof v==='string');if(!vv.some(v=>/^.+@.+\..+$/.test(v))||!vv.some(v=>v.length>=8&&/[a-zа-я]/i.test(v)&&/\d/.test(v))||!Object.entries(values).some(([k,v])=>/принимаю/i.test(k)&&v===true)){go('register-errors');return;}
   go(scenario==='error'?'register-email':'verify');return;
  }
  if(/Отправить|Продолжить|Получить код/.test(label)&&current.startsWith('forgot')){go(Object.values(values).some(v=>typeof v==='string'&&/^.+@.+\..+$/.test(v))?'reset-code':'forgot-error');return;}
  if(/Сохранить|Изменить|Создать пароль/.test(label)&&current.startsWith('new-password')){const v=values['Новый пароль']||'';const valid=v.length>=8&&/[a-zа-я]/i.test(v)&&/\d/.test(v);go(valid?(scenario==='error'?'new-password-error':'reset-success'):'new-password-error');return;}
  if(/Далее|Продолжить/.test(label)&&current.startsWith('onboard')){go(current==='onboard-1'?'onboard-2':current==='onboard-2'?'onboard-3':'welcome');return;}
  if(/Назад/.test(label)){go(current==='onboard-3'?'onboard-2':current==='onboard-2'?'onboard-1':'login');return;}
  if(/кабинет/i.test(label)){go('destination');return;}
  if(/Скопировать/.test(label)){go('welcome-copy');return;}
  if(/повторно|ещё раз/i.test(label)){setMessage('Демо: код отправлен повторно. Для проверки используйте 123456.');return;}
  setMessage('Для этого действия пока доступен макет, полноценное поведение ещё не подключено.');
 }
 function setValue(key,value){const next={...values,[key]:value,...(key==='Страна'?{Город:''}:{})};setValues(next);if((screen.startsWith('verify')||screen.startsWith('reset-code'))&&key.includes(':')){const codes=[];function walk(n){if(groups.get(n.set)?.name==='Auth / Code cell')codes.push(next[n.id]||'');n.children?.forEach(walk);}walk(snap);if(codes.length===6&&codes.every(Boolean)){go(codes.join('')==='123456'?(screen.startsWith('verify')?'onboard-1':'new-password'):(screen.startsWith('verify')?'verify-invalid':'reset-code-error'));}}}
 const only=params.get('only')==='true';
 if(only)return <Node node={snap} root values={values} setValue={setValue} act={act}/>;
 return <>{fullscreen&&<button type="button" className="fullscreen-toggle fullscreen-exit" aria-label="Показать панели" title="Показать панели (Esc)" onClick={()=>setFullscreen(false)} autoFocus>{fullscreenIcon}</button>}<header><strong>Virena / Design Lab</strong><nav><button onClick={()=>selectLabTab('components')} aria-pressed={tab==='components'}>{t('Компоненты')}</button><button onClick={()=>selectLabTab('flows')} aria-pressed={tab==='flows'}>{t('Флоу')}</button><button onClick={()=>selectLabTab('cabinet')} aria-pressed={tab==='cabinet'}>Кабинет</button></nav><SegmentedTabs className="design-version-switch" items={[{value:"original",label:"Текущая"},{value:"soft",label:"Серый фон"}]} value={design} onChange={setDesign} label="Версия дизайна" idPrefix="design-version-"/><button className="theme-control" type="button" role="switch" aria-label="Тёмная тема" aria-checked={dark} onClick={()=>setTheme(dark?'light':'dark')} title={dark?'Включить светлую тему':'Включить тёмную тему'}><span className="theme-thumb"/><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14.3A9 9 0 0 1 9.7 3.5a9 9 0 1 0 10.8 10.8Z"/></svg></button><small>{t('Локальный прототип · без отправки данных')} · Цены демонстрационные</small><button type="button" className="fullscreen-toggle" aria-label="Полный экран" title="Полный экран – скрыть панели" onClick={()=>setFullscreen(true)}>{fullscreenIcon}</button></header>
 {tab==='components'?<div className="workspace"><aside><input placeholder="Найти компонент" value={search} onChange={e=>setSearch(e.target.value)}/><p>Компоненты и общая галерея иконок</p><button aria-pressed={selected==='icons'} onClick={()=>setSelected('icons')}>Иконки<small>{icons.length}</small></button><button aria-pressed={selected==='artworks'} onClick={()=>setSelected('artworks')}>Иллюстрации<small>{artworks.length}</small></button>{db.components.filter(c=>!catalogHidden.has(c.name)&&!isIcon(c)&&!isArtwork(c)&&! /content$|^Tone=/.test(c.name)&&displayName(c.name).toLowerCase().includes(search.toLowerCase())).map(c=><button key={c.id} aria-pressed={selected===c.id} onClick={()=>setSelected(c.id)}>{displayName(c.name)}<small>{c.variants.length}</small></button>)}{cardFamilies.filter(name=>name.toLowerCase().includes(search.toLowerCase())).map(name=><button key={name} aria-pressed={selected===name} onClick={()=>setSelected(name)}>{name}<small>Live</small></button>)}{authPrimitiveNames.filter(name=>name.toLowerCase().includes(search.toLowerCase())).map(name=><button key={name} aria-pressed={selected==='auth-demo:'+name} onClick={()=>setSelected('auth-demo:'+name)}>{name}<small>Demo</small></button>)}</aside><main>{cardFamilies.includes(selected)?<CardCatalog key={selected} name={selected} Shared={Shared} db={db}/>:<Catalog group={group} isIcons={['icons','artworks'].includes(selected)}/>}</main></div>:tab==='flows'?<AuthFlow Shared={Shared} db={db} onEnter={()=>setTab('cabinet')}/>:tab==='cabinet'?<CabinetShell design={design} Shared={Shared} db={db} dark={dark} onTheme={value=>setTheme(['light','dark','system'].includes(value)?value:(dark?'light':'dark'))} onLogout={()=>{sessionStorage.removeItem('virena-auth-draft-v1');const url=new URL(location.href);url.searchParams.set('tab','flows');url.searchParams.set('screen','login');url.searchParams.delete('page');history.replaceState({},'',url);setTab('flows');}}/>:<main><h1>Контракт Figma ↔ React</h1><p>Источник первого снимка: {db.file}, {db.capturedAt}. Сохраняются ID мастеров и экземпляров, размеры и токены.</p><ol><li>Изменяем один компонент и проверяем состояния здесь.</li><li>Сверяем геометрию и рендер с Figma.</li><li>По команде «синхронизируй» готовим адресный патч мастера, сохраняя ID.</li><li>Проверяем затронутые экземпляры и обновляем снимок.</li></ol><p><strong>Автоматическая запись сейчас выключена.</strong> В этой версии работает чтение Figma. Обратная запись и конфликт-контроль ещё не подключены.</p><p>Открытая работа: дерево (общий мастер разрешён), маркетплейс, организация страницы Figma, полный паритет и все ветки авторизации.</p><p>Сложные векторные иллюстрации, экспортированные растровым превью: {db.issues.filter(x=>x.includes('raster')).length}. Они не считаются нативной репликой.</p></main>}</>;
}
createRoot(document.getElementById('root')).render(<App/>);
