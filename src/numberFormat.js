// Monetary helpers explicitly distinguish euros from integer cents.
export const formatValue=value=>Number.isFinite(value)?new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2}).format(value):'—';
export const formatMoney=value=>Number.isFinite(value)?new Intl.NumberFormat('ru-RU',{style:'currency',currency:'EUR',minimumFractionDigits:2,maximumFractionDigits:2}).format(value):'—';
export const formatCents=value=>Number.isFinite(value)?formatMoney(value/100):'—';
export const formatPrice=value=>Number.isFinite(value)?new Intl.NumberFormat('ru-RU',{style:'currency',currency:'EUR',minimumFractionDigits:Number.isInteger(value)?0:2,maximumFractionDigits:2}).format(value):'—';
