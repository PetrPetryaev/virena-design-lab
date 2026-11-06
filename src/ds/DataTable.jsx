import React,{useLayoutEffect,useRef} from 'react';
import './directory-motion.css';
import './data-table.css';
/** Shared table contract. Consumers provide data/columns, never row/header geometry. */
export default function DataTable({columns,rows,rowKey=r=>r.id,sortKey,direction='desc',onSort,Shared,label='Список',onRowClick,loading=false,renderExpansion,layout='directory'}){
 const root=useRef(null),previous=useRef(new Map());
 // Array instances change when a drawer opens; only list membership/order should animate.
 const rowOrder=JSON.stringify(rows.map(rowKey));
 useLayoutEffect(()=>{const next=new Map(),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const body=root.current?.querySelector('.ds-table-body'),top=body?.getBoundingClientRect().top||0;
 body?.querySelectorAll('[data-row-key]').forEach(el=>{el.getAnimations().forEach(a=>a.cancel());const key=el.dataset.rowKey,y=el.getBoundingClientRect().top-top;next.set(key,y);const old=previous.current.get(key);
 if(!loading&&!reduced&&previous.current.size&&(old===undefined||Math.abs(old-y)>1))el.animate(old!==undefined?[{transform:`translateY(${old-y}px)`},{transform:'translateY(0)'}]:[{opacity:0,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],{duration:180,easing:'cubic-bezier(.16,1,.3,1)'});
 });previous.current=loading?new Map():next;
 },[rowOrder,loading]);
 return <div ref={root} className={'ds-data-table'+(layout==='records'?' ds-table-records':layout==='purchases'?' ds-table-purchases':'')} role="table" aria-label={label} aria-busy={loading} style={{'--table-columns':columns.map(c=>c.width||'minmax(0,1fr)').join(' ')}}>
 <div role="rowgroup" className="ds-table-head"><div role="row" className="ds-table-row ds-table-header">{columns.map(c=><div role="columnheader" key={c.key} aria-sort={c.sort&&sortKey===c.sort?(direction==='desc'?'descending':'ascending'):undefined}>{c.sort?<button type="button" disabled={loading} className="ds-table-sort" onClick={()=>onSort(c.sort)}>{c.label}<span className={'ds-sort-indicator'+(sortKey===c.sort?' is-active':'')} aria-hidden="true"><Shared.Icon name={sortKey===c.sort&&direction==='asc'?'sort-from-bottom-to-top-linear':'sort-from-top-to-bottom-linear'}/></span></button>:c.label}</div>)}</div></div>
 <div role="rowgroup" className="ds-table-body">{(loading?Array.from({length:5},(_,id)=>({id})):rows).map(row=><React.Fragment key={rowKey(row)}><div role="row" data-row-key={rowKey(row)} className={'ds-table-row'+(loading?' ds-table-skeleton':'')} onClick={loading?undefined:()=>onRowClick?.(row)}>{columns.map(c=><div role="cell" data-column={c.key} data-label={c.label} className={c.className||''} key={c.key}>{loading?<span className="ds-table-placeholder"/>:c.render(row)}</div>)}</div>{!loading&&renderExpansion?.(row)&&<div role="row" className="ds-table-expansion"><div role="cell" aria-colspan={columns.length}>{renderExpansion(row)}</div></div>}</React.Fragment>)}</div>
 </div>;
}
