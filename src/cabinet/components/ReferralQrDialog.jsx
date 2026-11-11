import React,{useEffect,useState} from 'react';
import QRCode from 'qrcode';
import CabinetDialog from './CabinetDialog.jsx';
import CabinetButton from './CabinetButton.jsx';

export default function ReferralQrDialog({Shared,db,url,title,onClose}){
 const [image,setImage]=useState('');
 const [error,setError]=useState(false);
 useEffect(()=>{
  let active=true;
  setImage('');setError(false);
  if(typeof url!=='string'||!url.trim()){setError(true);return()=>{active=false;};}
  QRCode.toDataURL(url,{errorCorrectionLevel:'M',margin:4,width:240})
   .then(data=>{if(active)setImage(data);})
   .catch(()=>{if(active)setError(true);});
  return()=>{active=false;};
 },[url]);
 return <CabinetDialog Shared={Shared} db={db} title={title||'QR-код приглашения'} onClose={onClose} footer={<CabinetButton Shared={Shared} db={db} label="Закрыть" tone="Soft" onClick={onClose}/> }>
  <p>Демонстрационная ссылка. Отсканируйте QR-код камерой телефона.</p>
  {error?<p role="alert">Не удалось создать QR-код. Попробуйте открыть его ещё раз.</p>:image?<img src={image} width="240" height="240" alt="QR-код демонстрационной ссылки"/>:<p role="status">Создаём QR-код…</p>}
  <p>{url}</p>
 </CabinetDialog>;
}
