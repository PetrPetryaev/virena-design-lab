import React,{useEffect,useRef,useState} from 'react';
import {formatPoints} from './genealogyData.js';
import './genealogy-card-ideas.css';

const cases={
 ready:{label:'Слабее правая',points:[9332.75,4200],people:[6,5]},
 reverse:{label:'Слабее левая',points:[4200,9332.75],people:[7,4]},
 equal:{label:'Баллы равны',points:[4200,4200],people:[6,5]},
 empty:{label:'Пустая структура',points:[0,0],people:[0,0],steps:0},
 missing:{label:'Нет данных',points:[null,null],people:[6,5]},
 frozen:{label:'Заморозка',points:[0,0],people:[6,5],locked:true,note:'Партнёрство заморожено. Выбор стороны недоступен.'},
 package:{label:'Без пакета',points:[null,null],people:[6,5],note:'Без пакета баллы в ваши ноги не зачисляются.'},
 grace:{label:'Пора продлить',points:[9332.75,4200],people:[6,5],note:'Продлите активность до 12.11, чтобы сохранить баллы.'},
 calculating:{label:'Идёт расчёт',points:[9332.75,4200],people:[6,5],note:'Идёт расчёт. Показаны предыдущие значения.'},
 error:{label:'Ошибка сохранения',points:[9332.75,4200],people:[6,5]},
};
const previousConcepts=[
 ['Оригинал','Принятый вариант: две кликабельные ноги, выбор рядом с названием.','tiles'],
 ['Компактнее','Та же логика, меньше высота: баллы и участники собраны плотнее.','compact'],
 ['Цифры в центре','Симметричные блоки с крупными баллами. Радиокнопка справа вверху.','centered'],
 ['Выбор внизу','Сначала сравнение, затем действие в нижней части каждой ноги.','footer'],
 ['Единый блок','Общая серая плашка с двумя половинами и спокойной обводкой выбранной.','split'],
 ['С подсказкой','Слабая нога получает отдельную подпись, а выбранная – явный итог.','guided'],
];
const polishedConcepts=[
 ['Контур и число','Лёгкий вариант: цельная иконка человека, спокойные подписи и выбор внизу.','footer-outline'],
 ['Плашка участников','Число участников в отдельной плашке, как ранг со звездой.','footer-badge'],
];
const refinedConcepts=[
 ['Всё по центру','Название, баллы и участники на одной оси. Ничего не тянет взгляд в сторону.','footer-balanced'],
 ['Спокойная карточка','Белые блоки, тонкий контур и минимум заливок. Выбор заметен без тяжёлой кнопки.','footer-light'],
 ['Число и счётчик','Баллы слева, участники компактно справа. Сравнение читается как две короткие строки.','footer-line'],
 ['Одна поверхность','Две ноги внутри общей плашки. Выбранная сторона выделена белым, действие – синим.','footer-unified'],
];
const broadConcepts=[
 ['Чистый контур','Н2 как точка отсчёта: белые блоки и компактный счётчик.','footer-explore-outline'],
 ['Мягкая заливка','Серая база и белая выбранная нога. Меньше контуров.','footer-explore-soft'],
 ['Без коробочек','Открытое сравнение, тонкий разделитель и линия выбранной стороны.','footer-explore-open'],
 ['Выбор сверху','Сначала направление, под ним баллы и люди.','footer-explore-top'],
 ['Горизонтальные строки','Две строки вместо двух колонок. Удобнее читать длинные числа.','footer-explore-rows'],
 ['Крупные баллы','Симметрия, крупное число и счётчик участников под ним.','footer-explore-numbers'],
 ['Счётчик у края','Баллы и участники разнесены по краям. Выбор занимает всю ширину.','footer-explore-edge'],
 ['Плавающий переключатель','Выбор отдельной мягкой плашкой внутри каждого блока.','footer-explore-pill'],
 ['Цветовая полоса','Выбранную сторону отмечает тонкая синяя полоса.','footer-explore-rail'],
 ['Компактный профиль','Небольшая шапка и плотные данные – больше места дереву.','footer-explore-compact'],
 ['Профиль по центру','Аватар и имя по центру; две симметричные ноги ниже.','footer-explore-portrait'],
 ['Сводка в плашках','Участники и шаги выделены в два небольших блока.','footer-explore-totals'],
 ['Карточки внутри карточки','Чуть больше воздуха и лёгкая тень у выбранной ноги.','footer-explore-raised'],
 ['С объяснением','Короткая подсказка по баллам отдельно от выбора.','footer-explore-hint'],
 ['С явным результатом','Внизу всегда видно, куда пойдут новые приглашённые.','footer-explore-result'],
 ['Участники заметнее','Крупнее плашка с человеком; баллы остаются основным числом.','footer-explore-people'],
 ['Без разделителя','Данные и радиокнопка на общей поверхности, без кнопочного подвала.','footer-explore-seamless'],
 ['Деловая таблица','Строгое выравнивание: направление слева, показатели справа.','footer-explore-table'],
];
function Person(){return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7" r="3.5"/><path d="M4.5 18.7c0-3.1 3.4-5.2 7.5-5.2s7.5 2.1 7.5 5.2c0 1.2-.8 1.8-2 1.8h-11c-1.2 0-2-.6-2-1.8Z"/></svg>}
function DSButton({Shared,db,label,onClick,tone='Outline',disabled=false}){return <Shared.Button group={db.components.find(c=>c.name==='Boris / Button')} choice={{Tone:tone,Size:'40'}} label={label} onClick={onClick} disabled={disabled}/>}
function Confirm({pending,onClose,onConfirm,error,Shared,db}){
 const ref=useRef(null);useEffect(()=>{const d=ref.current,old=document.activeElement;d.showModal();return()=>{d.close();old?.focus({preventScroll:true});};},[]);
 return <dialog className="ci-dialog" ref={ref} aria-labelledby="ci-confirm-title" onCancel={e=>{e.preventDefault();onClose();}}><h2 id="ci-confirm-title">Новых приглашённых – {pending.side===0?'влево':'вправо'}?</h2><p>Настройка относится к вашей ячейке. Новый участник попадёт в выбранную ногу после первой оплаты. Существующие участники останутся на местах.</p>{error&&<p role="alert" className="ci-error">Не удалось сохранить. Прежняя сторона остаётся выбранной. Попробуйте ещё раз.</p>}<div className="ci-dialog-actions"><DSButton {...{Shared,db}} label="Отмена" onClick={onClose}/><DSButton {...{Shared,db}} label={error?'Повторить':'Подтвердить'} tone="Primary" onClick={onConfirm}/></div></dialog>
}
export default function GenealogyCardIdeas({Shared,db,photo}){
 const references=!new URLSearchParams(location.search).get('round')||new URLSearchParams(location.search).get('round')==='references';
 const polish=new URLSearchParams(location.search).get('round')!=='tiles';
 const previousPolish=new URLSearchParams(location.search).get('round')==='polished';
 const refined=polish&&!previousPolish;
 const broad=!['tiles','polished','refined'].includes(new URLSearchParams(location.search).get('round'));
 const concepts=broad?broadConcepts:refined?refinedConcepts:polish?polishedConcepts:previousConcepts;
 const [scenario,setScenario]=useState('ready'),[sides,setSides]=useState(()=>Array(18).fill(new URLSearchParams(location.search).get('round')?1:0)),[pending,setPending]=useState(null),[error,setError]=useState(false),[saved,setSaved]=useState('');
 const data=cases[scenario],known=data.points.every(Number.isFinite),weak=known&&data.points[0]!==data.points[1]?(data.points[0]<data.points[1]?0:1):null;
 const strength=i=>!known?'Нет данных':data.locked?'Баллы обнулены':data.points.every(v=>v===0)?'Пока нет баллов':weak===null?'Поровну баллов':weak===i?'Меньше баллов':'Больше баллов';
 const suggest=!known?'Дождитесь данных для сравнения.':data.locked?'Настройка доступна после восстановления партнёрства.':weak===null?'Можно выбрать любую сторону.':`В ${weak===0?'левой':'правой'} ноге меньше баллов. Её можно усилить новыми приглашёнными.`;
 const select=(id,side)=>{if(data.locked||side===sides[id])return;setError(false);setPending({id,side});};
 const confirm=()=>{if(scenario==='error'&&!error){setError(true);return;}setSides(v=>v.map((s,i)=>i===pending.id?pending.side:s));setSaved(`Вариант ${pending.id+1}: новые приглашённые ${pending.side===0?'в левую':'в правую'} ногу`);setPending(null);};
 const radio=(id,i,label)=> <label className={`ci-choice ${sides[id]===i?'is-selected':''} ${data.locked?'is-disabled':''}`}><input type="radio" name={`ci-side-${id}`} checked={sides[id]===i} disabled={data.locked} onChange={()=>select(id,i)} aria-label={`${i===0?'Левая':'Правая'} нога, вариант ${id+1}`}/><span>{label}</span></label>;
 const metrics=(id,kind)=><fieldset className="ci-metrics"><legend className="ci-sr">Новые приглашённые, вариант {id+1}</legend>{[0,1].map(i=><div key={i} className={`ci-leg ${sides[id]===i?'is-selected':''} ${data.locked?'is-disabled':''}`}>
 {kind.startsWith('footer')?(kind!=='footer-light'&&!kind.includes('explore')&&<span className="ci-leg-title">{i===0?'Левая нога':'Правая нога'}</span>):radio(id,i,i===0?'Левая нога':'Правая нога')}
 {kind==='guided'&&<span className={`ci-guidance ${weak===i?'is-weaker':''}`}>{weak===i?'Можно усилить':strength(i)}</span>}
 <div className="ci-leg-values"><strong className="ci-points">{formatPoints(data.points[i])}</strong><span className="ci-people" aria-label={`${data.people[i]} участников`}><span className="ci-people-count"><Person/><b>{data.people[i]}</b></span><span>участников</span></span></div>
 {kind!=='guided'&&kind!=='footer-light'&&!kind.includes('explore')&&<span className={`ci-strength ${weak===i?'is-weaker':''}`}>{strength(i)}</span>}
 {kind.startsWith('footer')&&radio(id,i,refined?(i===0?'В левую ногу':'В правую ногу'):(sides[id]===i?'Выбрано':'Направлять сюда'))}
 {kind==='guided'&&<span className={`ci-tile-result ${sides[id]===i?'is-active':''}`}>{sides[id]===i?'Новые приглашённые сюда':'Можно выбрать эту ногу'}</span>}
 </div>)}</fieldset>;
 if(references)return <ReferenceGallery {...{Shared,db,photo,data,scenario,setScenario,sides,radio,strength,suggest,weak,pending,error,saved}} onConfirm={confirm} onClose={()=>setPending(null)} onStateChange={value=>{setScenario(value);setPending(null);setError(false);setSaved('');}}/>;
 return <section className="genealogy card-ideas" aria-label="Варианты карточки участника">
 <div className="ci-intro"><div><span className="ci-eyebrow">{broad?'18 направлений · сравнение карточек':polish?(refined?'Ещё 4 варианта · цельная композиция':'Вариант 04 · визуальная полировка'):'Вариант 01 · 6 вариаций'}</span><h2>{broad?'Найдём подходящую композицию.':polish?(refined?'Меньше шума. Яснее выбор.':'Выбор внизу. Два исполнения.'):'Выбор прямо на карточке.'}</h2><p>Синий обозначает выбранную сторону. Все варианты можно переключать и проверять в разных состояниях.</p></div><a href="?tab=cabinet&page=genealogy">Вернуться к дереву ↗</a></div>
 <div className="ci-controls"><label>Состояние<select value={scenario} onChange={e=>{setScenario(e.target.value);setPending(null);setError(false);setSaved('');}}>{Object.entries(cases).map(([key,c])=><option value={key} key={key}>{c.label}</option>)}</select></label><p>Все варианты интерактивны. Изменения только в этой демонстрации.</p></div>
 {polish&&<div className="ci-history"><a className="ci-previous" href="?tab=cabinet&page=genealogy&cards=ideas&round=refined">Н2 и последние четыре</a><a className="ci-previous" href="?tab=cabinet&page=genealogy&cards=ideas&round=tiles">Первые шесть</a><a className="ci-previous" href={refined?"?tab=cabinet&page=genealogy&cards=ideas&round=polished":"?tab=cabinet&page=genealogy&cards=ideas"}>{refined?"Предыдущие два":"Новые четыре"}</a></div>}
 <div className={`ci-grid ${polish?'ci-polished-grid':''} ${broad?'ci-broad-grid':''}`}>{concepts.map(([name,description,kind],id)=><article className="ci-example" key={kind}>
 <header className="ci-concept-heading"><span className="ci-number">{broad?String(id+1).padStart(2,'0'):polish?`${refined?'Н': '04'}${id+1}`:`0${id+1}`}</span><div><h3>{name}{!polish&&id===0&&<small>Исходный вариант</small>}</h3><p>{description}</p></div></header>
 <div className="ci-stage"><div className={`ci-card ci-tile-family ${kind.startsWith('footer')?'ci-design-footer':''} ${broad?'ci-design-footer-light ci-exploration':''} ci-design-${kind}`} data-concept={id+1}>
 <div className="ci-profile"><img src={photo} alt=""/><div><strong>Александра Петрова</strong><span>alexandra92</span></div><span className="ci-rank" aria-label="Ранг 3">★ <b>3</b></span></div>
 <div className="ci-status"><span className="ci-package">{scenario==='package'?'Без пакета':'ВИП'}</span><span>{data.locked?'Заморожено':scenario==='grace'?'Пора продлить':'Активна до 02.03.2027'}</span></div>
 <div className="ci-totals"><span><strong>{data.people.reduce((a,b)=>a+b,0)}</strong> участников</span><span><strong>{data.steps??12}</strong> шагов</span></div>
 {data.note&&<p className="ci-notice">{data.note}</p>}
 <div className="ci-section-label">Куда направлять новых приглашённых</div>
 {kind==='footer-explore-hint'&&<p className="ci-explore-hint">{suggest}</p>}
 {metrics(id,kind)}
 {kind==='footer-explore-result'&&<p className="ci-explore-result">Новые приглашённые → <strong>{sides[id]===0?'в левую ногу':'в правую ногу'}</strong></p>}
 <p className="ci-footnote">{kind==='guided'?suggest:'Выберите ногу. Размещение – после первой оплаты.'}</p>
 </div></div></article>)}</div>
 <p className="ci-legend">Сила ноги определяется баллами, а не количеством людей. Выбор относится к вашей ячейке и не переносит существующих участников.</p><p className="ci-sr" role="status">{saved}</p>
 {pending&&<Confirm {...{pending,error,Shared,db}} onClose={()=>setPending(null)} onConfirm={confirm}/>}
 </section>;
}


// Four broader compositions inspired by the owner's references. Shared demo rules above.
function ReferenceGallery({Shared,db,photo,data,scenario,sides,radio,strength,suggest,weak,pending,error,saved,onConfirm,onClose,onStateChange}){
 const previous=new URLSearchParams(location.search).get('round')==='references';
 const designs=previous?[
 ['Общий модуль','По мотивам обменника: единая рамка, крупные баллы и отдельная строка направления.','exchange'],
 ['Две стороны на одной основе','По мотивам сравнения тарифов: общая серая поверхность, выбранная нога приподнята.','pricing'],
 ['Мягкие цветные шапки','По мотивам компактных тарифов: число в цветной шапке, детали и выбор ниже.','color'],
 ['Просторный выбор','По мотивам карточек с радио: название, большие цифры и ясная отметка выбора.','radio'],
 ]:[['Ваш вариант','Выбранная сторона – синяя. Подсказка слабой ноги не зависит от выбора.','proposal']];
 const amount=i=>{const value=formatPoints(data.points[i]),parts=value.split(',');return <div className="ri-amount"><strong>{parts[0]}{parts[1]&&<small>,{parts[1]}</small>}</strong><span>баллов</span></div>;};
 const people=i=><div className="ri-detail"><span>Участников</span><strong>{data.people[i]}</strong></div>;
 const selected=id=><span className="ri-outcome"><i aria-hidden="true"/>Новые приглашённые – {sides[id]===0?'в левую':'в правую'} ногу</span>;
 return <section className="genealogy card-ideas reference-ideas" aria-label="Новые композиции главной карточки">
 <div className="ci-intro"><div><span className="ci-eyebrow">{previous?'По вашим референсам · 4 композиции':'Карточка по вашему эскизу'}</span><h2>{previous?'Главная карточка. Больше пространства.':'Выбор стороны и подсказка – рядом.'}</h2><p>Крупные показатели, две понятные стороны и выбор без лишних деталей.</p></div><a href="?tab=cabinet&page=genealogy">К дереву ↗</a></div>
 <div className="ci-controls"><label>Состояние<select value={scenario} onChange={e=>onStateChange(e.target.value)}>{Object.entries(cases).map(([key,c])=><option key={key} value={key}>{c.label}</option>)}</select></label><p>Демонстрация · выберите сторону и подтвердите изменение.</p></div>
 <div className="ci-history"><a className="ci-previous" href="?tab=cabinet&page=genealogy&cards=ideas&round=references">Четыре композиции по референсам</a><a className="ci-previous" href="?tab=cabinet&page=genealogy&cards=ideas&round=broad">Предыдущие 18 вариантов</a><a className="ci-previous" href="?tab=cabinet&page=genealogy&cards=ideas&round=refined">Вернуться к Н2</a></div>
 <div className={`ri-gallery ${previous?'':'ri-proposal-gallery'}`}>{designs.map(([title,description,kind],id)=><article className="ri-example" key={kind}>
 <header className="ci-concept-heading"><span className="ci-number">0{id+1}</span><div><h3>{title}</h3><p>{description}</p></div></header>
 <div className="ri-stage"><div className={`ri-card ri-${kind} ${kind==='proposal'?'ri-color':''}`} data-concept={id+1}>
 <div className="ri-header"><div className="ri-person"><img src={photo} alt=""/><div><strong>Александра Петрова</strong><span>alexandra92 <span className="ri-you">· Ваша ячейка</span></span></div></div>{kind!=='proposal'&&<span className="ci-rank" aria-label="Ранг 3">★ <b>3</b></span>}</div>
 <div className="ri-status"><span className="ri-package">{scenario==='package'?'Без пакета':'ВИП'}</span>{kind==='proposal'&&<span className="ri-own-badge">Вы</span>}<span>{data.locked?'Партнёрство заморожено':scenario==='grace'?'Пора продлить':'Активна до 02.03.2027'}</span>{kind==='proposal'&&<span className="ci-rank" aria-label="Ранг 3">★ <b>3</b></span>}</div>
 <div className="ri-summary"><span><strong>{data.people.reduce((a,b)=>a+b,0)}</strong> участников в структуре</span><span><strong>{data.steps??12}</strong> шагов</span></div>
 {data.note&&<p className="ci-notice">{data.note}</p>}
 <div className="ri-heading"><h4>Куда направлять новых приглашённых</h4>{kind==='radio'&&<span>Выберите сторону</span>}</div>
 {kind==='exchange'?<div className="ri-exchange-module"><fieldset className="ri-direction"><legend className="ci-sr">Направление новых приглашённых</legend>{[0,1].map(i=><div key={i}>{radio(id,i,i===0?'Левая нога':'Правая нога')}</div>)}</fieldset><div className="ri-comparison">{[0,1].map(i=><div key={i} className="ri-side">{amount(i)}{people(i)}</div>)}</div><div className="ri-exchange-bottom">{selected(id)}</div></div>
 :<fieldset className="ri-options"><legend className="ci-sr">Направление новых приглашённых</legend>{[0,1].map(i=><div key={i} className={`ri-option ${sides[id]===i?'is-selected':''} ${data.locked?'is-disabled':''}`}>
 {kind==='radio'?radio(id,i,i===0?'Левая нога':'Правая нога'):(kind==='color'||kind==='proposal')?<div className="ri-color-head"><div className="ri-color-title"><span>{i===0?'Левая нога':'Правая нога'}</span>{kind==='proposal'&&weak===i&&!data.locked&&<span className="ri-boost-badge">Нужно усилить</span>}</div>{amount(i)}{kind==='proposal'&&<span className="ri-head-people" aria-label={`${data.people[i]} участников`}><Person/><strong>{data.people[i]}</strong></span>}</div>:<><div className="ri-option-title">{i===0?'Левая нога':'Правая нога'}</div>{amount(i)}</>}
 {kind==='radio'&&amount(i)}
 {kind!=='proposal'&&<div className="ri-option-details">{people(i)}<span className={`ri-compare-note ${weak===i?'is-weaker':''}`}>{strength(i)}</span></div>}
 {kind!=='radio'&&radio(id,i,sides[id]===i?'Выбрано':i===0?'Направлять влево':'Направлять вправо')}
 </div>)}</fieldset>}
 <div className="ri-footer">{kind==='exchange'?<span>{suggest}</span>:selected(id)}<span>Размещение после первой оплаты</span></div>
 </div></div></article>)}</div>
 <p className="ci-legend">Сравнение – по баллам. Выбранная сторона – настройка вашей ячейки. Существующие участники не перемещаются.</p><p role="status" className="ci-sr">{saved}</p>
 {pending&&<Confirm {...{pending,error,Shared,db}} onClose={onClose} onConfirm={onConfirm}/>}
 </section>;
}
