import React,{useId,useState} from 'react';
import ExpandingSearch from '../ExpandingSearch.jsx';
import './filter-choice-group.css';

export default function FilterChoiceGroup({
  Shared,db,label,options,selected,onChange,initialOpen=false,
  optionLabel=String,accessibleLabel=optionLabel
}){
  const [open,setOpen]=useState(initialOpen);
  const [all,setAll]=useState(false);
  const [query,setQuery]=useState('');
  const panelId=useId();
  const long=options.length>8;
  const searchable=long&&options.some(value=>!/^\d+$/.test(value));
  const term=query.trim().toLocaleLowerCase();
  const matching=options.filter(value=>optionLabel(value).toLocaleLowerCase().includes(term));
  const visible=long&&!all&&!term?matching.slice(0,5):matching;
  const checkbox=db.components.find(component=>component.name==='Boris / Checkbox');
  const summary=open?'':selected.map(optionLabel).join(', ');
  return <section className="ds-filter-choice-group">
    <button className="ds-filter-choice-heading" type="button" aria-label={label}
      aria-expanded={open} aria-controls={panelId} aria-describedby={summary?panelId+'-selection':undefined} onClick={()=>setOpen(!open)}>
      <strong>{label}</strong>
      {summary&&<span id={panelId+'-selection'} className="ds-filter-choice-summary" title={summary}>{summary}</span>}
      <span className="ds-filter-choice-chevron" aria-hidden="true"><Shared.Icon name="Auth / Icon / Chevron"/></span>
    </button>
    <div id={panelId} hidden={!open}>
      {open&&<div className="ds-filter-choice-options">
        {searchable&&<ExpandingSearch {...{Shared,db}} value={query} onChange={setQuery} label={'Поиск значений: '+label}/>}
        {visible.map(value=><label key={value} className="ds-filter-choice-option">
          <Shared.Toggle group={checkbox} value={selected.includes(value)} ariaLabel={accessibleLabel(value)}
            onChange={checked=>onChange(checked?[...selected,value]:selected.filter(item=>item!==value))}/>
          <span>{optionLabel(value)}</span>
        </label>)}
        {matching.length===0&&<span role="status">Ничего не найдено</span>}
        {long&&!term&&<Shared.Button group={db.components.find(component=>component.name==='Boris / Button')}
          choice={{Tone:'Ghost',Size:'40'}} label={all?'Свернуть список':'Показать все ('+options.length+')'} onClick={()=>setAll(!all)}/>}
      </div>}
    </div>
  </section>;
}
