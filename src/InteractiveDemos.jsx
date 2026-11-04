import lockIcon from './assets/profile-icons/lock-keyhole.svg';
import './field-refinements.css';
import {t,useLocale} from './i18n.js';
import React,{useState,useEffect,useRef,useId} from 'react';
import {passwordRules,passwordOK} from './password-policy.js';
import BirthDateField from './BirthDateField.jsx';
import DateCalendar,{formatDateInput,parseDate,dateInputError} from './DateCalendar.jsx';
import {formatPhoneNumber,phoneExample,validatePhoneNumber} from './phone-utils.js';
import ru from 'flag-icons/flags/4x3/ru.svg';
import kz from 'flag-icons/flags/4x3/kz.svg';
import de from 'flag-icons/flags/4x3/de.svg';
import us from 'flag-icons/flags/4x3/us.svg';
const countries=[{name:'Россия',code:'+7',flag:ru},{name:'Казахстан',code:'+7',flag:kz},{name:'Германия',code:'+49',flag:de},{name:'США',code:'+1',flag:us}];
function ReadOnlyHint({text}){
 const [open,setOpen]=useState(false);const id=useId();
 return <span className="readonly-hint" onMouseEnter={()=>setOpen(true)} onMouseLeave={()=>setOpen(false)}><button type="button" className="field-tool readonly-lock" aria-label={text} aria-describedby={open?id:undefined} onFocus={()=>setOpen(true)} onBlur={()=>setOpen(false)} onClick={()=>setOpen(true)} onKeyDown={e=>{if(e.key==='Escape'){e.stopPropagation();setOpen(false)}}}><span aria-hidden="true" style={{maskImage:`url("${lockIcon}")`,WebkitMaskImage:`url("${lockIcon}")`}}/></button>{open&&<span role="tooltip" id={id}>{text}</span>}</span>;
}
export function createDemos({db,Node,css,text,ink}){
 const family=name=>db.components.find(c=>c.name===name);
 const variant=(name,state='Default',props={})=>{const g=family(name);return g?.variants.find(v=>(!v.variants?.State||v.variants.State===state)&&Object.entries(props).every(([k,val])=>v.variants?.[k]===val))||g?.variants[0];};
 function Icon({name,muted=false,tintColor}){const g=db.components.find(c=>c.name===name||c.name.endsWith(' / '+name));if(!g)return null;const node=structuredClone(g.variants[0]);if(muted){const ref=family('Auth / Icon / Chevron')?.variants[0];let paint;function find(n){paint??=n.fills?.find(p=>p.type==='SOLID')||n.strokes?.find(p=>p.type==='SOLID');n.children?.forEach(find);}if(ref)find(ref);function tint(n){if(paint){if(n.fills?.some(p=>p.type==='SOLID'))n.fills=[paint];if(n.strokes?.some(p=>p.type==='SOLID'))n.strokes=[paint];}n.children?.forEach(tint);}tint(node);}if(tintColor){const color={r:parseInt(tintColor.slice(1,3),16)/255,g:parseInt(tintColor.slice(3,5),16)/255,b:parseInt(tintColor.slice(5,7),16)/255};function recolor(n){for(const key of ['fills','strokes'])if(n[key])n[key]=n[key].map(p=>p.type==='SOLID'&&p.visible!==false?{...p,color}:p);n.children?.forEach(recolor);}recolor(node);}return <span className="demo-icon"><Node node={node} root/></span>;}
 function Action({children,onClick,disabled=false,primary=false,...rest}){return <button type="button" className={'demo-action'+(primary?' primary':'')} disabled={disabled} onClick={onClick} {...rest}>{children}</button>;}
 function DemoShell({embedded,children,...rest}){return embedded?children:<Frame {...rest}>{children}</Frame>;}
 function Button({group,source,choice={},label,icon,iconContent,showIcon=false,disabled=false,loading=false,onClick,onStateChange,ariaLabel,fixed=false}){useLocale();
  const [hover,setHover]=useState(false),[focus,setFocus]=useState(false),[pressed,setPressed]=useState(false);
  const props={...Object.fromEntries(Object.entries(source?.props||{}).filter(([,v])=>v.type==='VARIANT').map(([k,v])=>[k,v.value])),...choice};
  const off=disabled||props.State==='Disabled',busy=loading||props.State==='Loading';
  const state=busy?'Loading':off?'Disabled':pressed?'Pressed':focus?'Focus':hover?'Hover':'Default';
  useEffect(()=>{onStateChange?.(state);},[state]);
  const n=group.variants.find(v=>v.variants?.State===state&&Object.entries(props).every(([k,val])=>k==='State'||!v.variants?.[k]||v.variants[k]===(k==='Tone'&&val==='DangerSoft'?'Outline':val)))||source||group.variants[0];
  const base=source||group.variants.find(v=>v.variants?.State==='Default'&&Object.entries(props).every(([k,val])=>k==='State'||!v.variants?.[k]||v.variants[k]===(k==='Tone'&&val==='DangerSoft'?'Outline':val)))||n;
  const isText=group.name==='Boris / Button',isIcon=group.name==='Boris / Icon button';
  const labelNode=base.children?.find(c=>c.name==='Label'),stateLabel=n.children?.find(c=>c.name==='Label');
  const iconNode=base.children?.find(c=>c.name==='Leading icon'||c.name==='Icon');
  let iconCopy=structuredClone(db.components.find(g=>g.id===icon)?.variants[0]||iconNode||db.components.find(g=>g.name==='Plus')?.variants[0]);
  const labelInk=stateLabel?.children?.find(c=>c.type==='TEXT')?.fills;
  const paint=labelInk||n.children?.find(c=>c.type==='INSTANCE')?.children?.[0]?.strokes||n.children?.find(c=>c.type==='INSTANCE')?.children?.[0]?.fills;
  function tint(v){if(!v)return;if(paint){if(v.fills?.some(p=>p.type==='SOLID'&&p.visible!==false))v.fills=v.fills.map(p=>p.type==='SOLID'&&p.visible!==false?paint[0]:p);if(v.strokes?.some(p=>p.type==='SOLID'&&p.visible!==false))v.strokes=v.strokes.map(p=>p.type==='SOLID'&&p.visible!==false?paint[0]:p);}v.children?.forEach(tint);}const brandIcon=iconCopy&&(iconCopy.master===family('Auth / Icon / Google')?.id||iconCopy.set===family('Auth / Icon / Google')?.id||/Google/.test(iconCopy.name));if(!brandIcon)tint(iconCopy);
  const matching=isIcon&&['Hover','Pressed'].includes(state)?family('Boris / Button')?.variants.find(v=>v.variants.Tone===props.Tone&&v.variants.Size===props.Size&&v.variants.State===state):null;
  const surface={...css(n,true),width:fixed?base.w:isText?'auto':n.w,height:base.h,minWidth:base.w,...(matching?{backgroundColor:ink(matching.fills),opacity:1}:{})};
  const content=label??text(base).trim();
  const iconVisible=showIcon||isIcon;
  const spinner=n.children?.find(c=>c.visible!==false&&c.type==='ELLIPSE');
  const events={onPointerEnter:e=>{if(e.pointerType!=='touch')setHover(true);},onPointerLeave:()=>{setHover(false);setPressed(false);},onPointerDown:()=>{setFocus(false);setPressed(true);},onPointerUp:()=>setPressed(false),onFocus:e=>setFocus(e.currentTarget.matches(':focus-visible')),onBlur:()=>{setFocus(false);setPressed(false);},onKeyDown:e=>{setFocus(true);if(e.key===' '||e.key==='Enter')setPressed(true);},onKeyUp:()=>setPressed(false)};
  return <button type="button" {...events} data-ui="Button" data-tone={props.Tone} className="preview-control" data-kind="button" data-state={state} disabled={off||busy} aria-busy={busy} aria-label={ariaLabel||content||'Действие'} onClick={onClick} style={{padding:0,border:0,background:'transparent',borderRadius:n.radius||0,cursor:busy?'wait':off?'not-allowed':'pointer',display:'block'}}>
  {isText||isIcon?<div className="motion-surface" style={{...surface,padding:isText?'0 24px':0,display:'flex',alignItems:'center',justifyContent:'center',gap:8,pointerEvents:'none'}}>
   {iconContent&&<span style={{display:'flex',opacity:busy?0:1,color:'var(--lab-ink)'}}>{iconContent}</span>}
   {!iconContent&&iconVisible&&iconCopy&&<span style={{opacity:busy?0:1,display:'flex'}}><Node node={iconCopy} root/></span>}
   {isText&&<span style={{...css(labelNode?.children?.[0]||stateLabel?.children?.[0]||{type:'TEXT'},true),color:labelInk?ink(labelInk,'ink'):undefined,width:'auto',height:'auto',whiteSpace:'nowrap',opacity:busy?0:1}}>{content}</span>}
   {busy&&<span className="motion-loader" style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>{spinner?<Node node={spinner} root animate/>:<span className="fallback-spinner" style={{color:props.Tone==='Primary'||props.Tone==='Danger'?'white':'var(--lab-ink)'}}/>}</span>}
  </div>:<div className="motion-surface" style={{pointerEvents:'none'}}><Node node={{...base,fills:n.fills,strokes:n.strokes,opacity:n.opacity}} root/></div>}
  </button>;
 }
 function Toggle({group,source,value,onChange,disabled=false,ariaLabel='Переключатель',onStateChange}){useLocale();
  const [hover,setHover]=useState(false),[focus,setFocus]=useState(false),[pressed,setPressed]=useState(false);
  const state=disabled?'Disabled':pressed?'Pressed':focus?'Focus':hover?'Hover':'Default',isSwitch=group.name==='Boris / Switch';
  useEffect(()=>{onStateChange?.(state);},[state]);
  const n=variant(group.name,state,{Value:value?'On':'Off'}),thumb=n.children.find(c=>c.type==='ELLIPSE');
  return <button type="button" data-ui="Toggle" className="preview-control" data-state={state} role={isSwitch?'switch':'checkbox'} aria-checked={value} disabled={disabled} aria-label={ariaLabel} onClick={()=>onChange(!value)} onPointerEnter={()=>setHover(true)} onPointerLeave={()=>{setHover(false);setPressed(false);}} onPointerDown={()=>{setFocus(false);setPressed(true);}} onPointerUp={()=>setPressed(false)} onFocus={e=>setFocus(e.currentTarget.matches(':focus-visible'))} onBlur={()=>setFocus(false)} style={{border:0,padding:0,background:'transparent',display:'block'}}>
   {isSwitch?<div className="motion-surface" style={{...css(n,true),pointerEvents:'none'}}><span className="motion-thumb" style={{...css(thumb),left:0,borderRadius:'50%',transform:`translateX(${thumb.x}px)`}}/></div>:<div style={{pointerEvents:'none'}}><Node node={n} root/></div>}
  </button>;
 }
 function Frame({children,controls,status}){return <div className="playground"><div className="preview"><div className="real-stage">{children}</div><div className="preview-status" role="status">{status||'Интерактивный пример · тестовые данные'}</div></div><div className="controls">{controls||<small>Попробуй мышь, Tab, Enter и Escape.</small>}</div></div>;}
 function FieldDemo({group,embedded=false,value:controlledValue,onChange,source,label:fieldLabel,placeholder:fieldPlaceholder,type:providedType,codeLength=6,error:externalError,validateOnBlur=true,showPasswordRules=!embedded,emailSuggestions=false,countryCode,onCountryChange,readOnly=false,readOnlyHint='',clearable,leadingIcon,trailingContent}){useLocale();

  const search=group.name==='Boris / Search',phone=group.name==='Auth / Phone';
  const canClear=clearable??true;
  const [localValue,setLocalValue]=useState(''),[localType,setType]=useState('Text'),[reveal,setReveal]=useState(false),[localDisabled,setDisabled]=useState(false),[focused,setFocused]=useState(false),[hover,setHover]=useState(false),[touched,setTouched]=useState(false),[forced,setForced]=useState(false),[scenario,setScenario]=useState('normal'),[loading,setLoading]=useState(false),[country,setCountry]=useState(countries.find(c=>c.name===countryCode)||countries[0]),[countryOpen,setCountryOpen]=useState(false),[picked,setPicked]=useState('');
  useEffect(()=>{if(phone&&countryCode){const next=countries.find(c=>c.name===countryCode);if(next)setCountry(next);}},[phone,countryCode]);
  const value=controlledValue??localValue,type=providedType??localType;
  const code=group.name==='Auth / Code cell'||type==='Code';
  const [pasteError,setPasteError]=useState(''),[dateError,setDateError]=useState('');
  const disabled=source?.props?.State?.value==='Disabled'||localDisabled;
  function setValue(v){if(readOnly)return;setDateError('');setPasteError('');setLocalValue(v);setEmailActive(0);setEmailDismissed(false);onChange?.(v);}
  const input=useRef(null);
  const [emailActive,setEmailActive]=useState(0),[emailDismissed,setEmailDismissed]=useState(false);
  const emailListId=useId();
  const emailParts=value.split('@');
  const emails=emailSuggestions&&!emailDismissed&&focused&&emailParts.length<=2&&/^[^\s@]+$/.test(emailParts[0])?['gmail.com','mail.ru','yandex.ru','outlook.com'].filter(d=>d.startsWith((emailParts[1]||'').toLowerCase())&&d!==emailParts[1]).map(d=>emailParts[0]+'@'+d):[];
  const emailIndex=Math.min(emailActive,Math.max(0,emails.length-1));
  function pickEmail(v){setValue(v);setEmailDismissed(true);input.current?.focus();}
  function handlePhoneChange(e){
   const raw=e.target.value, digitsBefore=raw.slice(0,e.target.selectionStart??raw.length).replace(/\D/g,'').length;
   const formatted=formatPhoneNumber(raw,country.name);setValue(formatted);
   requestAnimationFrame(()=>{if(document.activeElement!==input.current)return;let seen=0,pos=formatted.length;for(let i=0;i<formatted.length;i++){if(/\d/.test(formatted[i]))seen++;if(seen>=digitsBefore){pos=i+1;break;}}input.current?.setSelectionRange(pos,pos);});
  }

  const password=type==='Password',date=type==='Date';
  const dateErrorId=useId();
  const rulesId=useId(),hasRules=password&&showPasswordRules;
  const invalid=!readOnly&&(!!dateError||!!externalError||forced||(validateOnBlur&&touched&&!search&&(code?value.length!==codeLength:phone?!validatePhoneNumber(value,country.name):date?!parseDate(value):password?!passwordOK(value):!value.trim())));
  useEffect(()=>{if(!search)return;setLoading(!!value);const timer=setTimeout(()=>setLoading(false),250);return()=>clearTimeout(timer);},[value,search]);
  const state=disabled?'Disabled':invalid?'Error':focused?'Focus':hover?'Hover':value?'Filled':'Default';
  const n=variant(group.name,state,group.name==='Auth / Input'?{Type:date||code?'Text':type}:{});
  const candidates=['Анна Петрова','Антон Иванов','Мария Соколова'].filter(v=>v.toLowerCase().includes(value.toLowerCase()));
  function clear(){setValue('');setPicked('');setTouched(false);input.current?.focus();}
  if(date)return <DemoShell embedded={embedded} status="DateField · React Aria" controls={<small>День, месяц и год редактируются отдельно. Стрелки переключают сегменты и значения.</small>}><BirthDateField value={value} onChange={setValue} label={fieldLabel} error={externalError} disabled={disabled}/></DemoShell>;
  return <DemoShell embedded={embedded} status={disabled?'Disabled':invalid?'Ошибка':loading?'Поиск…':picked?'Выбрано: '+picked:state} controls={<>
   {group.name==='Auth / Input'&&<label>Тип<select aria-label="Тип поля" value={type} onChange={e=>{setType(e.target.value);setReveal(false);setTouched(false);}}><option>Text</option><option>Password</option><option>Date</option><option>Code</option></select></label>}
   <label className="toggle"><input type="checkbox" checked={disabled} onChange={e=>{setDisabled(e.target.checked);setCountryOpen(false);}}/>Disabled</label>
   <label className="toggle"><input type="checkbox" checked={forced} onChange={e=>setForced(e.target.checked)}/>Показать ошибку</label>
   {search&&<label>Ответ поиска<select aria-label="Ответ поиска" value={scenario} onChange={e=>setScenario(e.target.value)}><option value="normal">Результаты</option><option value="empty">{t("Ничего не найдено")}</option><option value="error">Ошибка сети</option></select></label>}
   <small>{search?'Поиск по трём тестовым участникам.':'Пароль: 8 символов, буква и цифра.'} Очистка видна только у заполненного поля в фокусе.</small>
  </>}><div data-ui="Field" data-readonly={readOnly||undefined} className={'field-demo'+(embedded?' embedded-control':'')}>
   <div className="real-field" onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} style={{...css(n,true),width:source?.w??(code?200:n.w),height:source?.h??n.h,maxWidth:'100%',display:'flex',alignItems:'center',padding:code&&codeLength>1&&!value?'0 8px 0 var(--field-inset)':'0 var(--field-inset)',gap:10,overflow:'visible'}}>
   {leadingIcon}{search&&<Icon name="Serach"/>}
   {phone&&<div className="country-wrap" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setCountryOpen(false);}}><button type="button" className="field-tool country" disabled={disabled||readOnly} aria-label={t("Код страны")} aria-expanded={countryOpen} onClick={()=>setCountryOpen(!countryOpen)}><img src={country.flag} alt={t(country.name)}/><Icon name="Auth / Icon / Chevron" muted/></button>{countryOpen&&<div className="option-menu" onKeyDown={e=>{if(e.key==='Escape')setCountryOpen(false);}}>{countries.map(c=><button type="button" key={c.name} aria-selected={c.name===country.name} onClick={()=>{setCountry(c);setValue(formatPhoneNumber(value,c.name));onCountryChange?.(c.name);setCountryOpen(false);input.current?.focus();}}><img src={c.flag} alt=""/>{t(c.name)} {c.code}</button>)}</div>}</div>}
   {phone&&<span>{country.code}</span>}
   <input readOnly={readOnly} ref={input} data-email-suggestions={emailSuggestions} role={emailSuggestions?"combobox":undefined} aria-autocomplete={emailSuggestions?"list":undefined} aria-expanded={emailSuggestions?!!emails.length:undefined} aria-controls={emails.length?emailListId:undefined} aria-activedescendant={emails.length?emailListId+'-'+emailIndex:undefined} aria-describedby={dateError?dateErrorId:hasRules?rulesId:undefined} aria-label={fieldLabel||(search?t('Поиск участника'):phone?t('Телефон'):code?t('Код подтверждения'):password?t('Пароль'):t('Текст поля'))} aria-invalid={invalid} disabled={disabled} type={password&&!reveal?'password':phone?'tel':type==='Email'?'email':'text'} inputMode={phone||code||date?'numeric':undefined} autoComplete={date?"bday":code?"one-time-code":undefined} maxLength={code?codeLength:undefined} onPaste={phone?e=>{e.preventDefault();setValue(formatPhoneNumber(e.clipboardData.getData('text'),country.name));}:code?e=>{e.preventDefault();setValue(e.clipboardData.getData('text').replace(/\D/g,'').slice(0,codeLength));}:undefined} placeholder={phone?phoneExample(country.name):fieldPlaceholder??(search?t('Поиск участника'):code?'123456':date?t('ДД.ММ.ГГГГ'):password?t('Введите пароль'):t('Введите текст'))} value={value} onChange={e=>{if(phone)handlePhoneChange(e);else if(date){setValue(e.target.value);setTouched(false);}else setValue(code?e.target.value.replace(/\D/g,''):e.target.value);setPicked('');}} onFocus={()=>setFocused(true)} onBlur={()=>{setFocused(false);setTouched(true);if(date){const normalized=formatDateInput(value);setValue(normalized);setDateError(dateInputError(normalized));}}} onKeyDown={e=>{if(emails.length&&['ArrowDown','ArrowUp','Enter','Escape'].includes(e.key)){e.preventDefault();e.stopPropagation();if(e.key==='Enter')pickEmail(emails[emailIndex]);else if(e.key==='Escape')setEmailDismissed(true);else setEmailActive((emailIndex+(e.key==='ArrowDown'?1:-1)+emails.length)%emails.length);return;}if(e.key==='Escape'){if(canClear&&!readOnly)clear();setCountryOpen(false);}if(e.key==='Enter'&&search&&candidates[0]){setPicked(candidates[0]);setValue(candidates[0]);}}}/>
   {canClear&&focused&&!disabled&&!readOnly&&!!value&&(!code||codeLength>1)&&<button type="button" className="field-tool field-clear" disabled={disabled} tabIndex={-1} aria-label={t("Очистить текст")} onMouseDown={e=>e.preventDefault()} onClick={clear}><Icon name="Cross" muted/></button>}
   {code&&codeLength>1&&!value&&<span className="code-paste"><Button group={family('Boris / Button')} choice={{Tone:'White',Size:'40'}} label={t("Вставить")} disabled={disabled} onClick={async()=>{try{const raw=await navigator.clipboard.readText();const digits=raw.replace(/\D/g,'');if(!digits){setPasteError(t('В буфере нет кода. Введите 6 цифр вручную.'));return;}setValue(digits.slice(0,codeLength));input.current?.focus();}catch{setPasteError(t('Не удалось прочитать буфер. Вставьте код через Ctrl+V или ⌘V.'));input.current?.focus();}}}/></span>}
   {date&&<DateCalendar value={value} onChange={setValue} disabled={disabled} inputRef={input}/>}
   {trailingContent}{readOnly&&readOnlyHint&&<ReadOnlyHint text={readOnlyHint}/>}
   {password&&<button type="button" className="field-tool" disabled={disabled} aria-label={reveal?t('Скрыть пароль'):t('Показать пароль')} aria-pressed={reveal} onMouseDown={e=>e.preventDefault()} onClick={()=>setReveal(!reveal)}><Icon name={reveal?'Auth / Icon / Eye closed':'Auth / Icon / Eye'}/></button>}
   </div>
   {pasteError&&<p className="field-error" role="alert">{pasteError}</p>}
   {!!emails.length&&<div className="option-menu email-suggestions" role="listbox" id={emailListId} aria-label={t("Варианты email")}>{emails.map((v,i)=><button type="button" role="option" id={emailListId+'-'+i} key={v} aria-selected={i===emailIndex} tabIndex={-1} onMouseDown={e=>e.preventDefault()} onClick={()=>pickEmail(v)}>{v}</button>)}</div>}
   {hasRules&&<ul id={rulesId} className="password-rules" aria-label={t("Требования к паролю")}>{passwordRules.map(rule=>{const met=rule.test(value);return <li key={rule.id} data-status={met?'met':invalid?'error':'pending'}><span className="password-rule-icon" aria-hidden="true"><Icon name="Auth / Icon / Success" tintColor={met?'#28734b':'#65666b'}/></span>{t(rule.label)}</li>;})}</ul>}
   {dateError&&!externalError&&<p id={dateErrorId} className="field-error" role="alert">{dateError}</p>}
   {invalid&&!dateError&&!embedded&&!hasRules&&<p className="field-error" role="alert">{date?'Введите дату в формате ДД.ММ.ГГГГ':password?'Минимум 8 символов':phone?'Проверьте номер телефона':code?'Введите 6 цифр':t('Заполните поле')}</p>}
   {search&&value&&!disabled&&focused&&!picked&&<div className="search-results">{loading?<p>Поиск…</p>:scenario==='error'?<p role="alert">Не удалось загрузить. <button type="button" onClick={()=>setScenario('normal')}>Повторить</button></p>:scenario==='empty'||!candidates.length?<p>{t("Ничего не найдено")}</p>:candidates.map(name=><button type="button" key={name} onMouseDown={e=>e.preventDefault()} onClick={()=>{setPicked(name);setValue(name);}}>{name}</button>)}</div>}
  </div></DemoShell>;
 }
 function SelectDemo({group,embedded=false,value:controlledValue,onChange,source,label=t('Выбор страны'),placeholder=t('Выберите страну'),items=countries.map(c=>c.name),error:externalError,clearable=false,leadingIcon,optionIcon}){useLocale();
  const [open,setOpen]=useState(group.name==='Auth / Select menu'),[query,setQuery]=useState(''),[localValue,setLocalValue]=useState(''),[localDisabled,setDisabled]=useState(false),[error,setError]=useState(false),[active,setActive]=useState(-1);
  const value=controlledValue??localValue,disabled=source?.props?.State?.value==='Disabled'||localDisabled;
  const root=useRef(null),input=useRef(null),listId=useId();
  const options=items.filter(v=>t(v).toLowerCase().includes(query.toLowerCase()));
  function setValue(v){setLocalValue(v);onChange?.(v);}
  function close(){setOpen(false);setQuery('');setActive(-1);}
  function choose(v){setValue(v);close();setError(false);input.current?.focus();}
  useEffect(()=>{const fn=e=>{if(!root.current?.contains(e.target))close();};document.addEventListener('pointerdown',fn);return()=>document.removeEventListener('pointerdown',fn);},[]);
  const showError=!disabled&&!open&&!value&&!!(error||externalError);
  const n=variant('Auth / Select',disabled?'Disabled':open?'Focus':showError?'Error':value?'Filled':'Default');
  return <DemoShell embedded={embedded} controls={<><label className="toggle"><input type="checkbox" checked={disabled} onChange={e=>{setDisabled(e.target.checked);close();}}/>Disabled</label><label className="toggle"><input type="checkbox" checked={error} onChange={e=>setError(e.target.checked)}/>Показать ошибку</label><small>Печатай прямо в поле. Стрелки – выбор, Enter – подтвердить, Escape – закрыть.</small></>} status={value?'Выбрано: '+value:'Значение не выбрано'}>
  <div data-ui="Select" className={'select-demo'+(embedded?' embedded-control':'')} ref={root} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();close();}if(e.key==='ArrowDown'){e.preventDefault();setOpen(true);setActive(i=>i<0?0:Math.min(i+1,options.length-1));}if(e.key==='ArrowUp'){e.preventDefault();setOpen(true);setActive(i=>i<0?options.length-1:Math.max(0,i-1));}if(e.key==='Enter'&&open){e.preventDefault();if(options[active])choose(options[active]);}if(e.key==='Tab')close();}}>
   <div className="real-field" style={{...css(n,true),width:source?.w??n.w,height:source?.h??n.h,maxWidth:'100%',padding:'0 var(--field-inset)',display:'flex',alignItems:'center',gap:8,overflow:'visible'}}>
   {leadingIcon}<input ref={input} role="combobox" aria-invalid={showError} aria-label={label} aria-autocomplete="list" aria-expanded={open} aria-controls={listId} aria-activedescendant={open&&options[active]?listId+'-'+active:undefined} disabled={disabled} placeholder={placeholder} value={open?query:t(value)} onClick={()=>{setOpen(true);setActive(-1);}} onChange={e=>{setQuery(e.target.value);setOpen(true);setActive(-1);}}/>
   {clearable&&(value||query)&&<button type="button" className="field-tool field-clear" disabled={disabled} tabIndex={-1} aria-label={t("Очистить выбор")} onMouseDown={e=>e.preventDefault()} onClick={()=>{setValue('');setQuery('');setOpen(true);input.current?.focus();}}><Icon name="Cross" muted/></button>}
   <button type="button" className="field-tool" disabled={disabled} aria-label={open?t('Закрыть список'):t('Открыть список')} onMouseDown={e=>e.preventDefault()} onClick={()=>{if(open)close();else setOpen(true);input.current?.focus();}}><Icon name="Auth / Icon / Chevron"/></button>
   </div>{showError&&<p className="field-error" role="alert">{externalError||t("Выберите значение")}</p>}
   {open&&<div className="option-menu"><div role="listbox" id={listId}>{options.length?options.map((v,i)=><button type="button" id={listId+'-'+i} role="option" aria-selected={v===value} className={i===active?'highlight':''} key={v} onMouseEnter={()=>setActive(i)} onMouseDown={e=>e.preventDefault()} onClick={()=>choose(v)}>{optionIcon?.(v)}{t(v)}</button>):<p>{t("Ничего не найдено")}</p>}</div></div>}
  </div></DemoShell>;
 }
 function TooltipDemo(){const [show,setShow]=useState(false);return <Frame><div className="tooltip-demo" onMouseEnter={()=>setShow(true)} onMouseLeave={()=>setShow(false)}><Action aria-describedby={show?'sample-tip':undefined} onFocus={()=>setShow(true)} onBlur={()=>setShow(false)} onKeyDown={e=>{if(e.key==='Escape')setShow(false);}}>Наведи или нажми Tab</Action>{show&&<div id="sample-tip" role="tooltip"><Node node={variant('Boris / Tooltip')} root/></div>}</div></Frame>;}
 function CopyDemo({embedded=false,accountId='123456'}){useLocale();const [copied,setCopied]=useState(false),[error,setError]=useState('');const timer=useRef();useEffect(()=>()=>clearTimeout(timer.current),[]);return <DemoShell embedded={embedded} status={error||'Копирование в буфер обмена'}><div data-ui="Copy" className="copy-demo"><span>{t('Ваш ID:')} {accountId}</span><Action onClick={async()=>{try{await navigator.clipboard.writeText(accountId);setCopied(true);setError('');clearTimeout(timer.current);timer.current=setTimeout(()=>setCopied(false),2000);}catch{setError(t('Не удалось скопировать. Разрешите доступ к буферу обмена.'));}}}><span className="copy-labels" aria-live="polite"><span style={{visibility:copied?'hidden':'visible'}} aria-hidden={copied}>{t("Скопировать ID")}</span><span style={{visibility:copied?'visible':'hidden'}} aria-hidden={!copied}>{t("Скопировано")}<Icon name="Auth / Icon / Success"/></span></span></Action>{error&&<span role="alert">{error}</span>}</div></DemoShell>;}
 function ChoiceDemo({group}){
  const [selected,setSelected]=useState(0),[disabled,setDisabled]=useState(false);
  const nav=group.name==='Boris / Nav item';const names=nav?['Обзор','Моя структура','Участники']:['Все','Приборы','Аксессуары'];
  return <Frame controls={<label className="toggle"><input type="checkbox" checked={disabled} onChange={e=>setDisabled(e.target.checked)}/>Disabled</label>} status={'Выбрано: '+names[selected]}><div className={nav?'demo-navigation':'demo-tabs'} role={nav?'navigation':'tablist'}>{names.map((name,i)=><Action key={name} disabled={disabled} role={nav?undefined:'tab'} aria-selected={nav?undefined:i===selected} aria-current={nav&&i===selected?'page':undefined} onClick={()=>setSelected(i)}>{nav&&<Icon name={['Home','Tree','Users'][i]}/>} {name}</Action>)}{!nav&&<p role="tabpanel">Содержимое: {names[selected]}</p>}</div></Frame>;
 }
 function AvatarDemo({group}){const [initials,setInitials]=useState('АП'),[tone,setTone]=useState('Lilac'),[avatarCount,setAvatarCount]=useState(1);let n=structuredClone(variant('Boris / Avatar','Default',{Content:'Initials',Tone:tone}));function replace(n){if(n.type==='TEXT'){n.text=initials;n.runs=undefined;}n.children?.forEach(replace);}replace(n);return <Frame controls={<><label>Количество<select aria-label="Количество аватаров" value={avatarCount} onChange={e=>setAvatarCount(+e.target.value)}>{[1,2,3].map(n=><option key={n}>{n}</option>)}</select></label><label>Инициалы<input maxLength={3} value={initials} onChange={e=>setInitials(e.target.value)}/></label><label>Цвет<select value={tone} onChange={e=>setTone(e.target.value)}>{['Neutral','Blue','Teal','Pink','Lilac'].map(t=><option key={t}>{t}</option>)}</select></label></>}><div className="demo-avatar-stack">{Array.from({length:avatarCount},(_,i)=>i).map(i=><span key={i} title={['Анна Петрова','Мария Иванова','Елена Смирнова'][i]}><Node node={n} root/></span>)}</div></Frame>;}

 function Nested({node:n,root=false,onAction}){
  const [on,setOn]=useState(false);
  if(n.visible===false)return null;
  const name=db.components.find(c=>c.id===n.set)?.name||n.name;
  const check=name==='Boris / Checkbox',toggle=name==='Boris / Switch';
  const action=/^(Boris \/ (Button|Icon button|Call action)|Auth \/ Link)$/.test(name);
  if(check||toggle){const v=variant(check?'Boris / Checkbox':'Boris / Switch','Default',{Value:on?'On':'Off'});return <button type="button" className="nested-action" style={{...css(n,root),background:'transparent',border:0,padding:0}} role={check?'checkbox':'switch'} aria-checked={on} aria-label={check?'Выбрать участника':'Включить встречу'} onClick={()=>setOn(!on)}><Node node={v} root/></button>;}
  if(action){const label=(text(n).trim()||n.name+' '+n.children?.map(c=>c.name).join(' '));return <button type="button" className="nested-action" style={{...css(n,root),background:'transparent',border:0,padding:0}} aria-label={label} onClick={()=>onAction(label)}><Node node={n} root/></button>;}
  if(n.type==='TEXT'||n.svg||!n.children?.length)return <Node node={n} root={root}/>;
  return <div style={css(n,root)}>{n.children.map(c=><Nested key={c.id} node={c} onAction={onAction}/>)}</div>;
 }
 function CompositeDemo({group}){
  const [message,setMessage]=useState(''),[editing,setEditing]=useState(false),[value,setValue]=useState(''),[items,setItems]=useState([]),[closed,setClosed]=useState(false),[search,setSearch]=useState(false);
  function act(label){if(/Add|Добав|Pencil|Редакт/i.test(label)){setEditing(true);return;}if(/Cross|Закры/i.test(label)){setClosed(true);return;}if(/Serach|Search|Поиск/i.test(label)){setSearch(v=>!v);return;}if(/Trash|Delete|Удал/i.test(label)){setMessage('Удаление выбрано. В демо исходные данные сохраняются.');return;}if(/Share/i.test(label)){setMessage('Ссылка участника готова для отправки (демо)');return;}setMessage('Выбрано: '+label);}
  return <Frame status={message||'Каждая кнопка и чекбокс доступны отдельно'} controls={<><Action onClick={()=>{setClosed(false);setItems([]);setMessage('');setEditing(false);setSearch(false);}}>Сбросить пример</Action><small>Действия выполняются локально, без отправки на сервер.</small></>}>
  <div className="composite-demo">{closed?<Action onClick={()=>setClosed(false)}>Открыть панель</Action>:<><Nested node={group.variants[0]} root onAction={act}/>{search&&<input aria-label="Поиск в панели" placeholder="Поиск" value={value} onChange={e=>setValue(e.target.value)}/>}
  {editing&&<form onSubmit={e=>{e.preventDefault();if(value.trim()){setItems([...items,value]);setValue('');setEditing(false);setMessage('Сохранено');}}}><input aria-label="Имя участника" placeholder="Имя участника" autoFocus required value={value} onChange={e=>setValue(e.target.value)}/><Action primary>Сохранить</Action><Action onClick={()=>setEditing(false)} type="button">Отмена</Action></form>}{items.filter(v=>!search||v.toLowerCase().includes(value.toLowerCase())).map((v,i)=><p key={i}>{v}</p>)}</>}</div></Frame>;
 }
 const map={'Members':CompositeDemo,'Boris / Panel header':CompositeDemo,'Boris / Member row':CompositeDemo,'Boris / Meeting row':CompositeDemo,'Boris / Search':FieldDemo,'Auth / Input':FieldDemo,'Auth / Phone':FieldDemo,'Auth / Code cell':FieldDemo,'Auth / Select':SelectDemo,'Auth / Select menu':SelectDemo,'Auth / Select option':SelectDemo,'Boris / Tooltip':TooltipDemo,'Auth / Account ID':CopyDemo,'Boris / Nav item':ChoiceDemo,'Boris / Category tab':ChoiceDemo,'Boris / Avatar':AvatarDemo,'Boris / Avatar stack':AvatarDemo,'Boris / Meeting avatars':AvatarDemo};
 function InteractiveDemo({group}){const Demo=map[group.name];return Demo?<Demo key={group.id} group={group}/>:null;}
 return {InteractiveDemo,Field:FieldDemo,Select:SelectDemo,Copy:CopyDemo,Button,Toggle,Icon};
}
