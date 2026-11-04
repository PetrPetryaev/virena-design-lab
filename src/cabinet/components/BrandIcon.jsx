import React from 'react';
const assets=import.meta.glob('../../assets/profile-icons/*.svg',{eager:true,query:'?url',import:'default'});
const aliases={website:'global',Сайт:'global',Telegram:'telegram',telegramChannel:'telegram',WhatsApp:'whatsapp',Viber:'viber',Instagram:'instagram',Facebook:'facebook',YouTube:'youtube',TikTok:'tiktok',vkontakte:'vk','ВКонтакте':'vk'};
const brandColors={"facebook": "#0866FF", "instagram": "#FF0069", "telegram": "#26A5E4", "tiktok": "#000000", "viber": "#7360F2", "vk": "#0077FF", "whatsapp": "#25D366", "youtube": "#FF0000"};
export default function BrandIcon({name,colored=true}){const key=aliases[name]||name.toLowerCase();const url=assets[`../../assets/profile-icons/${key}.svg`];return url?<span className="field-leading-icon" aria-hidden="true" style={{background:!colored?'var(--lab-muted)':key==='tiktok'?'var(--lab-ink)':brandColors[key]||'var(--lab-muted)',maskImage:`url("${url}")`,WebkitMaskImage:`url("${url}")`}}/>:null;}
