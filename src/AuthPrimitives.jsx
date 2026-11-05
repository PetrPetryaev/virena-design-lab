import React,{useState} from 'react';
import {t} from './i18n.js';

const authTabs=[['login','Вход'],['register','Регистрация']];

export function SegmentedTabs({items,value,onChange,disabled=false,label,idPrefix,panelId,className=''}){
 function keyDown(e){
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
  e.preventDefault();
  const enabled=items.filter(item=>!item.disabled);
  if(!enabled.length)return;
  const index=enabled.findIndex(item=>item.value===value);
  const next=enabled[e.key==='Home'?0:e.key==='End'?enabled.length-1:(index+(e.key==='ArrowRight'?1:enabled.length-1))%enabled.length].value;
  onChange(next);
  requestAnimationFrame(()=>document.getElementById(idPrefix+next)?.focus());
 }
 return <div className={'auth-flow-tabs '+className} role="tablist" aria-label={label} style={{gridTemplateColumns:`repeat(${items.length},minmax(0,1fr))`}}>
  {items.map(item=><button key={item.value} id={idPrefix+item.value} type="button" role="tab" aria-selected={value===item.value} aria-controls={panelId} tabIndex={value===item.value?0:-1} disabled={disabled||item.disabled} onClick={()=>onChange(item.value)} onKeyDown={keyDown}>{item.label}{item.count!==undefined&&<span className="segmented-count">{item.count}</span>}</button>)}
 </div>;
}
export function AuthTabs({value,onChange,disabled=false}){
 return <SegmentedTabs items={authTabs.map(([value,label])=>({value,label:t(label)}))} value={value} onChange={onChange} disabled={disabled} label={t('Вход или регистрация')} idPrefix="auth-tab-" panelId="auth-mode-panel"/>;
}

export function AuthPrimitiveDemo({name,Shared,db}){
 const [toast,setToast]=useState(false);
 const [tab,setTab]=useState('login'),[password,setPassword]=useState(''),[code,setCode]=useState(''),[date,setDate]=useState(''),[sponsor,setSponsor]=useState(''),[hasSponsor,setHasSponsor]=useState(true);
 const group=componentName=>db.components.find(c=>c.name===componentName);
 const tabsDemo=name==='Auth / Flow tabs';
 const iconDemo=name==='Auth / Success'||name==='Auth / Toast';
 const iconName=name==='Auth / Toast'?'Auth / Icon / Success':'Auth / Icon / Success';
 if(tabsDemo)return <div className="playground"><div className="preview"><div className="real-stage"><div className="catalog-tabs"><AuthTabs value={tab} onChange={setTab}/><div id="auth-mode-panel" role="tabpanel" aria-labelledby={'auth-tab-'+tab}>{tab==='login'?t('Вход'):t('Регистрация')}</div></div></div><div className="preview-status" role="status">{tab==='login'?t('Вход'):t('Регистрация')}</div></div><div className="controls"><small>Стрелки, Home и End переключают вкладку.</small></div></div>;
 if(name==='Auth / Toast')return <div className="playground"><div className="preview"><div className="real-stage"><div className="catalog-toast"><Shared.Button group={group('Boris / Button')} choice={{Tone:'Primary',Size:'48'}} label="Показать уведомление" onClick={()=>setToast(true)}/>{toast&&<div className="auth-toast" role="status"><Shared.Icon name={iconName} tintColor="#28734b"/>{t('Новый код отправлен')}<button type="button" aria-label="Закрыть уведомление" onClick={()=>setToast(false)}>×</button></div>}</div></div></div><div className="controls"><small>Уведомление появляется по действию и закрывается кнопкой.</small></div></div>;
 if(iconDemo)return <div className="playground"><div className="preview"><div className="real-stage">{name==='Auth / Toast'?<div className="auth-toast" role="status"><Shared.Icon name={iconName} tintColor="#28734b"/>{t('Новый код отправлен')}</div>:<div className="auth-success-icon" aria-hidden="true"><Shared.Icon name={iconName} tintColor="#28734b"/></div>}</div><div className="preview-status">{name}</div></div><div className="controls"><small>Значок из DS: Auth / Icon / Success.</small></div></div>;
 if(name==='Auth / Password rules')return <div className="playground"><div className="preview"><div className="real-stage"><Shared.Field group={group('Auth / Input')} embedded type="Password" label={t('Пароль')} placeholder={t('Введите пароль')} value={password} onChange={setPassword} showPasswordRules/></div><div className="preview-status" role="status">{password?t('Проверка пароля'):t('Введите пароль')}</div></div><div className="controls"><small>Правила обновляются при вводе.</small></div></div>;
 if(name==='Auth / Code')return <div className="playground"><div className="preview"><div className="real-stage"><Shared.Field group={group('Auth / Input')} embedded type="Code" label={t('Код подтверждения')} placeholder="123456" codeLength={6} value={code} onChange={setCode}/></div><div className="preview-status" role="status">{code?`${code.length}/6`:t('Введите код')}</div></div><div className="controls"><small>Введите или вставьте код подтверждения.</small></div></div>;
 if(name==='Auth / Date')return <div className="playground"><div className="preview"><div className="real-stage"><Shared.Field group={group('Auth / Input')} embedded type="Date" label={t('Дата рождения')} placeholder={t('ДД.ММ.ГГГГ')} value={date} onChange={setDate}/></div><div className="preview-status" role="status">{date||t('Введите дату рождения')}</div></div><div className="controls"><small>Дату можно ввести вручную или выбрать в календаре.</small></div></div>;
 if(name==='Auth / Sponsor switch')return <div className="playground"><div className="preview"><div className="real-stage"><section className="auth-sponsor-section" aria-label={t('Спонсор')}><div className="auth-sponsor-heading"><label id="catalog-sponsor-label" onClick={()=>setHasSponsor(v=>!v)}>{t('У меня есть спонсор')}</label><Shared.Toggle group={group('Boris / Switch')} value={hasSponsor} ariaLabel={t('У меня есть спонсор')} onChange={setHasSponsor}/></div><div className="auth-sponsor-reveal" data-open={hasSponsor} inert={!hasSponsor} aria-hidden={!hasSponsor}><div className="auth-sponsor-clip"><Shared.Field group={group('Auth / Input')} embedded label={t('Спонсор')} placeholder={t('ID или логин спонсора')} value={sponsor} onChange={setSponsor}/></div></div></section></div><div className="preview-status" role="status">{hasSponsor?t('Спонсор'):t('Подбор спонсора')}</div></div><div className="controls"><small>Переключатель раскрывает поле спонсора.</small></div></div>;
 return null;
}
