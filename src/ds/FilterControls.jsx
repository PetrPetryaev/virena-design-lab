import React from 'react';
import './filter-controls.css';
import ToolbarReset from '../ToolbarReset.jsx';

export function FilterTrigger({Shared,db,count=0,onClick,expanded,controls}){
  return <Shared.Button group={db.components.find(c=>c.name==='Boris / Button')}
    choice={{Tone:'Ghost',Size:'40'}} label="Фильтры" ariaLabel={count?'Фильтры · '+count:'Фильтры'}
    ariaExpanded={expanded} ariaControls={controls} onClick={onClick}
    iconContent={count?<span className="cab-nav-count">{count}</span>:<Shared.Icon name="filter-sliders-linear"/>}/>;
}

export function FilterChips({Shared,db,chips,onReset}){
  if(!chips.length)return null;
  return <div className="ds-filter-chips" aria-label="Применённые фильтры">{chips.map(chip=>
    <Shared.Button key={chip.key??chip.label} group={db.components.find(c=>c.name==='Boris / Button')}
      choice={{Tone:'Primary',Size:'40'}} label={chip.label} ariaLabel={'Снять фильтр: '+chip.label}
      iconContent={<Shared.Icon name="Cross" tintColor="#ffffff"/>} onClick={chip.clear}/>)}<ToolbarReset {...{Shared,db}} active={Boolean(onReset)} onClick={onReset}/></div>;
}
