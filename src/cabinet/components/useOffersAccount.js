import {useCallback, useEffect, useState} from 'react';
import {profileInitialData} from './profileData.js';

// Local cabinet account. The API should persist these fields per authenticated partner.
const storageKey = 'virena-offers:' + profileInitialData.personal.partnerId;
function readAccount() {
  let value;
  try { value = JSON.parse(localStorage.getItem(storageKey)); } catch {}
  return {
    showUnavailable: value?.showUnavailable !== false,
    seenIds: Array.isArray(value?.seenIds) ? value.seenIds.filter(id => typeof id === 'string') : [],
  };
}

export function useOffersAccount() {
  const [account, setAccount] = useState(readAccount);
  useEffect(() => {
    const sync = event => { if (event.key === storageKey || event.key === null) setAccount(readAccount()); };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  const update = useCallback(next => {
    setAccount(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
  }, []);
  const onSeen = useCallback(id => {
    if (!account.seenIds.includes(id)) update({...account, seenIds: [...account.seenIds, id]});
  }, [account, update]);
  const onShowUnavailable = showUnavailable => update({...account, showUnavailable});
  return {...account, onSeen, onShowUnavailable};
}
