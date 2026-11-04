import React,{useRef,useState} from 'react';
import {DateField,DateInput,DateSegment,I18nProvider} from 'react-aria-components';
import {CalendarDate,today,getLocalTimeZone} from '@internationalized/date';
import DateCalendar,{parseDate} from './DateCalendar.jsx';
import {t,useLocale} from './i18n.js';
import './birth-date.css';

const serialize=d=>d?`${String(d.day).padStart(2,'0')}.${String(d.month).padStart(2,'0')}.${String(d.year).padStart(4,'0')}`:'';
export default function BirthDateField({value,onChange,label,error,disabled=false}){
 const locale=useLocale(),root=useRef(null),[touched,setTouched]=useState(false),[revision,setRevision]=useState(0);
 const parsed=parseDate(value),date=parsed?new CalendarDate(parsed.getFullYear(),parsed.getMonth()+1,parsed.getDate()):null;
 const min=new CalendarDate(1900,1,1),max=today(getLocalTimeZone());
 const localError=touched?(!date?'Укажите дату рождения полностью':date.compare(min)<0||date.compare(max)>0?'Проверьте год рождения':''):'';
 const invalid=!!error||!!localError;
 // Calendar returns focus to the day segment; it does not implement text editing.
 const focusTarget={current:{focus:()=>root.current?.querySelector('[role=spinbutton]')?.focus()}};
 return <I18nProvider locale={locale==='en'?'en-GB':'ru-RU'}><DateField key={revision} ref={root} aria-label={label||t('Дата рождения')} className="virena-date field-demo embedded-control" value={date} onChange={next=>{onChange(serialize(next));setTouched(false);}} minValue={min} maxValue={max} placeholderValue={new CalendarDate(1990,1,1)} shouldForceLeadingZeros isDisabled={disabled} isInvalid={invalid} validationBehavior="aria" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setTouched(true);}}>
 <div className="real-field virena-date-shell">
 <DateInput className="virena-date-input" onPointerDownCapture={e=>{const segments=[...e.currentTarget.querySelectorAll('[role=spinbutton]')];if(segments.length&&segments.every(s=>s.hasAttribute('data-placeholder'))){e.preventDefault();e.stopPropagation();segments[0].focus();}}}>{segment=><DateSegment segment={segment} className="virena-date-segment"/>}</DateInput>
 {!!value&&<button type="button" className="field-tool virena-date-clear" aria-label={t('Очистить дату')} disabled={disabled} tabIndex={-1} onMouseDown={e=>e.preventDefault()} onClick={()=>{onChange('');setTouched(false);setRevision(x=>x+1);requestAnimationFrame(()=>focusTarget.current.focus());}}><span aria-hidden="true">×</span></button>}
 <DateCalendar value={value} onChange={next=>{onChange(next);setTouched(false);}} disabled={disabled} inputRef={focusTarget}/>
 </div>
 {localError&&!error&&<p className="field-error" role="alert">{t(localError)}</p>}
 </DateField></I18nProvider>;
}
