import React, { useEffect, useState } from 'react';
import { getOffers } from './offersData.js';
import wordmark from '../../assets/virena-logo.svg';
import './offers.css';

const copy = {
  ru: { language: 'Язык страницы', missing: 'Акция не найдена', ended: 'Акция завершена', terms: 'Условия акции', files: 'Вложения', bytes: 'Б' },
  en: { language: 'Page language', missing: 'Offer not found', ended: 'This offer has ended', terms: 'Offer terms', files: 'Attachments', bytes: 'B' },
};

export function publicOfferUrl(id, language, ref) {
  const url = new URL(import.meta.env.BASE_URL, location.origin);
  url.searchParams.set('offer', id);
  url.searchParams.set('lang', language);
  if (/^VR-\d+$/.test(ref || '')) url.searchParams.set('ref', ref);
  return url;
}

export function Terms({ offer, language, withHeading = true }) {
  const labels = copy[language];
  const attachment = offer.attachment;
  return <>
    <section className="offer-terms">
      {withHeading && <h3>{labels.terms}</h3>}
      <p>{offer.description}</p>
      {offer.details.some(line => line !== offer.description) &&
        <ul>{offer.details.filter(line => line !== offer.description).map(line => <li key={line}>{line}</li>)}</ul>}
    </section>
    {attachment && <section className="offer-terms">
      <h3>{labels.files}</h3>
      <a download href={import.meta.env.BASE_URL + 'offers/' + attachment.file}>
        {attachment.name} <span>· TXT · {attachment.bytes} {labels.bytes}</span>
      </a>
    </section>}
  </>;
}

export default function PublicOffer({ params }) {
  const id = params.get('offer'), ref = params.get('ref');
  const language = params.get('lang') === 'en' ? 'en' : 'ru';
  const labels = copy[language];
  const offer = ['active', 'upcoming', 'archive'].flatMap(tab => getOffers({ tab, language })).find(item => item.public && item.id === id);
  const ended = offer?.status === 'archive';
  const [coverFailed, setCoverFailed] = useState(false);
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = (offer?.title || labels.missing) + ' · Virena';
  }, [language, offer?.title, labels]);
  let action;
  if (offer?.action && offer.status === 'active') {
    action = new URL(offer.action.href, new URL(import.meta.env.BASE_URL, location.origin));
    if (/^VR-\d+$/.test(ref || '')) action.searchParams.set('ref', ref);
  }

  return <div className="offer-public" lang={language}>
    <header className="offer-public-header">
      <img src={wordmark} width="116" alt="Virena" />
      <nav aria-label={labels.language}>
        {['ru','en'].map(lang => <a key={lang} href={publicOfferUrl(id, lang, ref).href} lang={lang}
          hrefLang={lang} aria-current={lang === language ? 'page' : undefined}>{lang.toUpperCase()}</a>)}
      </nav>
    </header>
    <main className="offer-public-body">
      {offer ? <article className="offers offers-detail-card" data-archived={ended}>
        {offer.cover && !coverFailed && <div className="offers-cover">
          <img className="offers-cover-image" src={offer.cover} alt="" onError={() => setCoverFailed(true)}/>
        </div>}
        <div className="offers-labels"><span className="offers-period">{offer.period}</span>
          {offer.timing && !ended && <span className="offers-label">{offer.timing}</span>}
          {!ended && offer.audience.map(label => <span className="offers-label" key={label}>{label}</span>)}
        </div>
        <h1>{offer.title}</h1>
        {ended ? <p className="offer-ended">{labels.ended}</p> : <>
          <Terms offer={offer} language={language}/>
          {action && <a className="offer-primary-action" href={action.href}>{offer.action.label}</a>}
        </>}
      </article> : <h1>{labels.missing}</h1>}
    </main>
  </div>;
}
