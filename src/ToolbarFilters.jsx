import React,{useState} from 'react';
import {FilterTrigger} from './ds/FilterControls.jsx';
import Dialog from './cabinet/components/CabinetDialog.jsx';
import Button from './cabinet/components/CabinetButton.jsx';
import './toolbar-filters.css';

export default function ToolbarFilters({Shared,db,count=0,value,onApply,children,label='Фильтры участников',applyLabel='Показать результаты',invalid}){
  const [draft,setDraft]=useState(null);
  const close=()=>setDraft(null);
  return <div className="toolbar-filters">
    <FilterTrigger {...{Shared,db,count}} expanded={draft!==null} onClick={()=>setDraft(value)}/>
    {draft!==null&&<Dialog {...{Shared,db}} className="toolbar-filter-dialog" title={label} onClose={close}
      footer={<Button {...{Shared,db}} tone="Primary" label={typeof applyLabel==='function'?applyLabel(draft):applyLabel} disabled={invalid?.(draft)} onClick={()=>{onApply(draft);close();}}/>}>
      {children(draft,setDraft)}
    </Dialog>}
  </div>;
}
