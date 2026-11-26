import calendarSource from './assets/navigation/calendar-linear.svg?raw';
const calendarIcon=calendarSource.replaceAll('stroke="black"','stroke="currentColor"').replace('width="24" height="24"','width="20" height="20"');
import {t,useLocale} from './i18n.js';
import React,{useRef,useState,useEffect,useId} from 'react';
import {DayPicker} from '@daypicker/react';
import {ru,enUS} from '@daypicker/react/locale';
import '@daypicker/react/style.css';
// Normalize only on commit; never rewrite the draft or caret while the user edits.
export function formatDateInput(value){
 const raw=(value||'').trim();
 const compact=/^(\d{2})(\d{2})(\d{4})$/.exec(raw);
 const separated=/^(\d{1,2})[.\/\-\s]+(\d{1,2})[.\/\-\s]+(\d{4})$/.exec(raw);
 const m=compact||separated;
 return m?`${m[1].padStart(2,'0')}.${m[2].padStart(2,'0')}.${m[3]}`:raw;
}
export function parseDate(value){const m=/^(\d{2})\.(\d{2})\.(\d{4})$/.exec(formatDateInput(value));if(!m)return;const d=new Date(0);d.setHours(0,0,0,0);d.setFullYear(+m[3],+m[2]-1,+m[1]);if(d.getFullYear()===+m[3]&&d.getMonth()===+m[2]-1&&d.getDate()===+m[1])return d;}
export function dateInputError(value){
 if(!value.trim())return 'Укажите дату рождения';
 if(!/^\d{2}\.\d{2}\.\d{4}$/.test(formatDateInput(value)))return 'Введите дату полностью, например 12.03.1990';
 const date=parseDate(value);
 if(!date)return 'Такой даты нет. Проверьте день, месяц и год';
 if(date.getFullYear()<1900||date>new Date())return 'Дата должна быть от 1900 года до сегодняшнего дня';
 return '';
}
export default function DateCalendar({value,onChange,disabled,inputRef,allowedDates,triggerLabel}){
 const locale=useLocale(), bounded=!!allowedDates?.length;
 const root=useRef(null),trigger=useRef(null),id=useId(),[open,setOpen]=useState(false),[month,setMonth]=useState(parseDate(value)||allowedDates?.[0]||new Date(1990,0,1));
 useEffect(()=>{const close=e=>{if(!root.current?.contains(e.target))setOpen(false);};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close);},[]);
 useEffect(()=>{if(disabled)setOpen(false);},[disabled]);
 return <div ref={root} className="date-calendar" onKeyDown={e=>{if(e.key==='Escape'){e.stopPropagation();setOpen(false);trigger.current?.focus();}}} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setOpen(false);}}>
 <button ref={trigger} type="button" className={bounded?"calendar-trigger checkout-calendar-trigger":"field-tool calendar-trigger"} disabled={disabled} aria-label={triggerLabel||t("Открыть календарь")} aria-expanded={open} aria-controls={id} onMouseDown={e=>{if(!bounded)e.preventDefault();}} onClick={()=>{setMonth(parseDate(value)||month);setOpen(!open);}}><span aria-hidden="true" style={{display:'flex',width:20,height:20}} dangerouslySetInnerHTML={{__html:calendarIcon}}/>{triggerLabel}</button>
 {open&&<div className="calendar-popover" id={id} role="dialog" aria-label={bounded?"Выберите дату доставки":t("Выберите дату рождения")}><DayPicker locale={locale==='en'?enUS:ru} mode="single" selected={parseDate(value)} month={month} onMonthChange={setMonth} captionLayout={bounded?"label":"dropdown"} startMonth={bounded?allowedDates[0]:new Date(1900,0)} endMonth={bounded?allowedDates.at(-1):new Date()} disabled={bounded?d=>!allowedDates.some(allowed=>+allowed===+d):{after:new Date()}} autoFocus={bounded} onSelect={d=>{if(d){onChange(`${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`);setOpen(false);(inputRef?.current||trigger.current)?.focus();}}}/></div>}
 </div>;
}
