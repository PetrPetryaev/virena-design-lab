import { AsYouType, parsePhoneNumberFromString, getCountryCallingCode } from 'libphonenumber-js';

export const PHONE_COUNTRIES = {
  Россия: { iso: 'RU', example: '912 345-67-89' },
  Казахстан: { iso: 'KZ', example: '701 234-56-78' },
  Германия: { iso: 'DE', example: '1512 3456789' },
  США: { iso: 'US', example: '201-555-0123' },
};

export function phoneCountryCode(countryName = 'Россия') {
  return PHONE_COUNTRIES[countryName]?.iso || 'RU';
}

// These inputs collect personal contact numbers; RU/KZ extended service numbers are excluded.
export function formatPhoneNumber(value, countryName = 'Россия') {
 const iso=phoneCountryCode(countryName),prefix=getCountryCallingCode(iso);
 let digits=String(value||'').replace(/\D/g,'');
 if(String(value).trim().startsWith('+')&&digits.startsWith(prefix))digits=digits.slice(prefix.length);
 else if(['RU','KZ'].includes(iso)&&digits.length===11&&/^[78]/.test(digits))digits=digits.slice(1);
 const max=iso==='DE'?13:10;
 digits=digits.slice(0,max);
 if(!digits)return '';
 if(iso==='RU'||iso==='KZ')return [digits.slice(0,3),digits.slice(3,6),digits.slice(6,8),digits.slice(8,10)].filter(Boolean).map((s,i)=>i===1?' '+s:i>1?'-'+s:s).join('');
 if(iso==='US')return [digits.slice(0,3),digits.slice(3,6),digits.slice(6,10)].filter(Boolean).join('-');
 return new AsYouType(iso).input('+'+prefix+digits).replace(new RegExp('^\\+'+prefix+'\\s*'),'');
}

export function validatePhoneNumber(value, countryName = 'Россия') {
  if (!value?.trim()) return false;
  const parsed = parsePhoneNumberFromString(value, phoneCountryCode(countryName));
  return !!parsed?.isValid();
}

export function phoneExample(countryName = 'Россия') {
  return PHONE_COUNTRIES[countryName]?.example || PHONE_COUNTRIES.Россия.example;
}
