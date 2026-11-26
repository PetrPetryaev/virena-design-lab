import React,{useId,useLayoutEffect,useRef,useState} from 'react';
import {SegmentedTabs} from '../../AuthPrimitives.jsx';
import Button from './CabinetButton.jsx';
import {emptyCheckout,exampleRecipient,ownedOrderCells,recipientError} from './commerceData.js';

const recipientTabs=[{value:'self',label:'Себе'},{value:'other',label:'На другой аккаунт'}];
const recipientFields=['recipient','country','city','address','postal','addressMode','addressSnapshot','addressDetails','regionEdited','fulfillment','showroom','deliveryRate','deliveryDate','deliverySlot','deliveryOther','deliveryName','deliveryPhone','pickupOther','pickupName','pickupPhone'];
const recipientDetails=draft=>Object.fromEntries(recipientFields.map(key=>[key,draft[key]]));

function PayerCells({draft,setDraft,scenario,error,other}){
 const id=useId(),cells=ownedOrderCells(scenario);
 const selected=draft.payerCell||(cells.length===1?cells[0].id:'');
 return <fieldset className="checkout-options checkout-payer-options" aria-describedby={error?id:undefined}>
  <legend>{other?'Ячейка плательщика':'Ваша ячейка'}</legend>
  <div className="checkout-option-list">
   {cells.map(cell=><label className="checkout-option checkout-choice" key={cell.id}>
    <input type="radio" name={id} checked={selected===cell.id} aria-invalid={error?true:undefined}
     onChange={()=>setDraft(d=>({...d,payerCell:cell.id}))}/>
    <strong>{cell.position}</strong><small>{cell.id}</small>
   </label>)}
  </div>
  {error&&<p id={id} className="profile-error" role="alert">{error}</p>}
 </fieldset>;
}

export default function CheckoutRecipient({Shared,db,draft,setDraft,scenario,validationError,payerError,onLoadingChange,buyer,deliveryProfile}){
 const id=useId(),recipientMode=draft.forOther?'other':'self';
 const [result,setResult]=useState(null),[editing,setEditing]=useState(null);
 const inputArea=useRef(null),lastFeedback=useRef(null);
 const accountDigits=(draft.account||'').replace(/\D/g,'').slice(0,6);
 const lookupId=draft.forOther&&!draft.recipientCell&&accountDigits.length===6?draft.account:'';
 const matches=result?.id===lookupId&&result?.scenario===scenario;
 const pending=!!lookupId&&!matches;
 const lookupMessage=pending?'':(matches?result.error:'')||validationError;
 const foundCell=matches&&!result.error?exampleRecipient:null;
 const displayedCell=draft.recipientCell||foundCell;

 useLayoutEffect(()=>{
  if(!pending)return;
  onLoadingChange?.(true);
  const timer=setTimeout(()=>setResult({id:lookupId,scenario,error:recipientError(lookupId,scenario)}),380);
  return()=>{clearTimeout(timer);onLoadingChange?.(false);};
 },[lookupId,onLoadingChange,pending,scenario]);

 const selectRecipient=next=>{
  if(next===recipientMode)return;
  setDraft(d=>{
   const initial=recipientDetails(emptyCheckout(deliveryProfile));
   return {...d,...(d.recipientDetails?.[next]||initial),forOther:next==='other',recipientDetails:{...d.recipientDetails,[recipientMode]:recipientDetails(d)}};
  });
 };
 const editRecipient=()=>{
  const recipient=draft.recipientCell;
  setEditing({id:recipient.id,scenario});
  setDraft(d=>({...d,account:recipient.id,recipientCell:null}));
  requestAnimationFrame(()=>{
   const input=inputArea.current?.querySelector('input');
   input?.focus();
   input?.select();
  });
 };
 const confirmRecipient=()=>{
  const changed=editing?.scenario===scenario&&editing.id!==foundCell.id;
  setDraft(d=>d.account===lookupId?{
   ...d,...(changed?{deliveryName:'',deliveryPhone:'',pickupName:'',pickupPhone:''}:{}),recipientCell:foundCell,
  }:d);
  setEditing(null);
 };
 const feedback=displayedCell?<fieldset className="checkout-options checkout-payer-options checkout-recipient-result">
  <legend>Получатель</legend>
  <div className="checkout-recipient-result-row">
   <label className="checkout-option checkout-choice">
    <input type="radio" name={id+'recipient'} checked={!!draft.recipientCell} onChange={confirmRecipient}/>
    <strong>{displayedCell.login}</strong><small>{displayedCell.id}</small>
   </label>
   {draft.recipientCell&&<Button {...{Shared,db}} label="Изменить получателя" size="40" tone="Ghost" onClick={editRecipient}/>}
  </div>
 </fieldset>:lookupMessage?<p className="profile-error" role="alert">{lookupMessage}</p>:null;
 useLayoutEffect(()=>{if(feedback)lastFeedback.current=feedback;},[feedback]);
 return <div className="checkout-recipient">
  <SegmentedTabs className="checkout-choice-tabs" items={recipientTabs} value={recipientMode} onChange={selectRecipient}
   label="На кого оформить заказ" idPrefix={id} panelId={id+'panel'}/>
  <div className="checkout-account-fields" role="tabpanel" id={id+'panel'} aria-labelledby={id+recipientMode}>
   {!draft.forOther&&buyer}
   {draft.forOther&&<div className="checkout-recipient-lookup" aria-busy={pending} ref={inputArea}>
    <label className="profile-field-label">ID ячейки получателя</label>
    <Shared.Field group={db.components.find(component=>component.name==='Boris / Search')} embedded
     label="ID ячейки получателя" placeholder="000000" inputMode="numeric" value={accountDigits}
     leadingIcon={<span className="checkout-id-prefix" aria-hidden="true">VR-</span>} readOnly={!!draft.recipientCell}
     error={lookupMessage} validateOnBlur={false} searchSuggestions={false}
     onChange={value=>{
      const digits=value.replace(/\D/g,'').slice(0,6);
      const account=digits?'VR-'+digits:'';
      setDraft(d=>account===d.account?d:{...d,account});
     }}
     trailingContent={pending?<span className="checkout-id-loading" role="status" aria-label="Ищем ячейку"><span className="fallback-spinner" aria-hidden="true"/></span>:undefined}/>
    <div className="checkout-recipient-feedback" data-open={!!feedback}>
     <div inert={!feedback} aria-hidden={!feedback}>{feedback||lastFeedback.current}</div>
    </div>
   </div>}
   {(!draft.forOther||draft.recipientCell)&&<PayerCells {...{draft,setDraft,scenario}} error={payerError} other={draft.forOther}/>}
  </div>
 </div>;
}
