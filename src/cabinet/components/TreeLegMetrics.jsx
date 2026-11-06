import React from 'react';
import {formatPoints} from './genealogyData.js';
import chevron from '../../assets/navigation/alt-arrow-right-linear.svg?raw';
/** Shared metric pair used in the tree card and finance summary. */
export default function TreeLegMetrics({points,counts,showStrength=false,unit='',className=''}){
 return <span className={'genealogy-metrics '+className}>{['Левая нога','Правая нога'].map((label,i)=><span className="genealogy-leg-stat" key={label}><span className="genealogy-leg-label">{label}</span><b>{formatPoints(points[i])}{unit&&' '+unit}</b>{showStrength&&points.every(Number.isFinite)&&points[0]!==points[1]&&<span className={`tree-leg-strength-label ${points[i]<points[1-i]?'is-weaker':''}`}><span aria-hidden="true" className={i===0?'points-left':'points-right'} dangerouslySetInnerHTML={{__html:chevron.replace('stroke="black"','stroke="currentColor"')}}/>{points[i]<points[1-i]?'Слабее · усилить':'Сильнее'}</span>}{counts&&<span className="genealogy-stat-people">Участников: <strong>{counts[i]}</strong></span>}</span>)}</span>;
}
