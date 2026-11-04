import React from 'react';
// Owner-requested relative visualization, not a rank or a marketing-plan threshold.
export function strengthLevels(points){const max=Math.max(...points.filter(Number.isFinite),0);return points.map(value=>!Number.isFinite(value)?null:max===0?0:Math.ceil(value/max*3));}
export function StrengthCircle({level}){return <span className="tree-strength" role="img" aria-label={level===null?'Нет данных по баллам':`Относительный объём: ${level} из 3`} title="Объём баллов относительно другой ноги"><span aria-hidden="true">{level===null?'—':[1,2,3].map(n=><i key={n} className={n<=level?'is-filled':''}/>)}</span></span>;}
export function LegComparison({points,counts}){
 const levels=strengthLevels(points);
 return <div className="tree-comparison-table"><div className="tree-comparison-head"><span>Левая нога<StrengthCircle level={levels[0]}/></span><span/><span>Правая нога<StrengthCircle level={levels[1]}/></span></div>{[[points,'Баллы',format],[counts,'Участники',value=>Number.isFinite(value)?String(value):'—']].map(([values,label,formatter])=>{const known=values.every(Number.isFinite),sign=!known?'–':values[0]===values[1]?'=':values[0]>values[1]?'>':'<';return <div className="tree-comparison-row" key={label}><div className={known&&values[0]>values[1]?'is-larger':''}><strong>{formatter(values[0])}</strong></div><span className="tree-comparison-divider"><small>{label}</small><b aria-label={!known?'Нет данных':sign==='='?'Поровну':sign==='>'?'Больше слева':'Больше справа'}>{sign}</b></span><div className={known&&values[1]>values[0]?'is-larger':''}><strong>{formatter(values[1])}</strong></div></div>;})}</div>;
}
const format=value=>value===null?'—':value.toLocaleString('ru-RU',{minimumFractionDigits:2,maximumFractionDigits:2});
