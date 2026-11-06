import {formatValue} from '../../numberFormat.js';
import React from 'react';
import chevron from '../../assets/navigation/alt-arrow-right-linear.svg?raw';
export const metricTone=(values,index)=>Number.isFinite(values[index])&&(!Number.isFinite(values[1-index])||values[index]>=values[1-index])?'is-larger':'is-smaller';
const format=formatValue;
export function LegComparison({points,counts}){
 const comparable=points.every(Number.isFinite),equal=points[0]===points[1];
 return <div className="genealogy-metrics tree-summary-legs">{['Левая нога','Правая нога'].map((label,i)=><span className="genealogy-leg-stat" key={label}><span className="genealogy-leg-label">{label}</span><b className={metricTone(points,i)}>{format(points[i])}</b><span className="genealogy-stat-people">Участников: <strong className={metricTone(counts,i)}>{counts[i]??'—'}</strong></span></span>)}<span className="tree-leg-divider-mark" title={comparable?(equal?'Баллов поровну':`Больше баллов ${points[0]>points[1]?'слева':'справа'}`):'Нет данных по баллам'}>{!comparable?'—':equal?'=':<span className={points[0]>points[1]?'points-left':'points-right'} aria-label={`Больше баллов ${points[0]>points[1]?'слева':'справа'}`} dangerouslySetInnerHTML={{__html:chevron.replace('stroke="black"','stroke="currentColor"')}}/>}</span></div>;
}
