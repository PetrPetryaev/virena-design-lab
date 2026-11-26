import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { SegmentedTabs } from '../../AuthPrimitives.jsx';
import Button from './CabinetButton.jsx';
import EmptyIllustration from './EmptyIllustration.jsx';
import { publicOfferUrl, Terms } from './PublicOffer.jsx';
import { profileInitialData } from './profileData.js';
import { getOffers } from './offersData.js';
import './offers.css';

const tabs = ['active', 'upcoming', 'archive'];
const pageSize = 10;
const copy = {
  ru: {
    active: 'Действующие', upcoming: 'Скоро', archive: 'Архив',
    empty: { active: 'Сейчас нет действующих акций', upcoming: 'Новые акции скоро появятся', archive: 'Завершённых акций пока нет' },
    offers: 'Акции', status: 'Статус акций', new: 'Новая', restricted: 'Недоступна вам',
    unavailable: 'Недоступные вам', show: 'Показывать недоступные акции', showAction: 'Показать недоступные акции',
    hidden: 'Все акции в этой вкладке пока недоступны вам', details: 'Подробнее',
    loading: 'Загрузка акций', error: 'Не удалось загрузить акции', retry: 'Повторить',
    detail: 'Страница акции', missing: 'Акция не найдена', back: 'Все акции',
    more: 'Показать ещё', loadingMore: 'Загружаем акции…', moreError: 'Не удалось загрузить ещё акции',
  },
  en: {
    active: 'Active', upcoming: 'Upcoming', archive: 'Archive',
    empty: { active: 'No active offers right now', upcoming: 'New offers are coming soon', archive: 'No ended offers yet' },
    offers: 'Offers', status: 'Offer status', new: 'New', restricted: 'Unavailable to you',
    unavailable: 'Unavailable to you', show: 'Show unavailable offers', showAction: 'Show unavailable offers',
    hidden: 'All offers in this tab are currently unavailable to you', details: 'View details',
    loading: 'Loading offers', error: 'Could not load offers', retry: 'Try again',
    detail: 'Offer details', missing: 'Offer not found', back: 'All offers',
    more: 'Show more', loadingMore: 'Loading offers…', moreError: 'Could not load more offers',
  },
};

function offerHref(id) {
  const url = new URL(location.href);
  url.searchParams.set('intent', 'offer:' + id);
  return url.pathname + url.search;
}

function OfferCover({ offer }) {
  const [failed, setFailed] = useState('');
  return offer.cover && failed !== offer.cover
    ? <img className="offers-cover-image" src={offer.cover} alt="" onError={() => setFailed(offer.cover)} />
    : <div className="offers-cover-fallback" aria-hidden="true"><EmptyIllustration kind="offers" /></div>;
}

function OfferMeta({ offer, unread, labels }) {
  return <div className="offers-labels">
    <span className="offers-period">{offer.period}</span>
    {offer.timing && <span className="offers-label">{offer.timing}</span>}
    {unread && <span className="offers-label is-new">{labels.new}</span>}
  </div>;
}

function OfferConditions({ offer, labels }) {
  if (!offer.metTerms.length && !offer.reasons.length) return null;
  return <div className="offers-conditions">
    {offer.metTerms.length > 0 && <div className="offers-labels">
      {offer.metTerms.map(term => <span className="offers-label" key={term}>{term}</span>)}
    </div>}
    {offer.reasons.length > 0 && <p className="offers-reasons"><strong>{labels.restricted}</strong> · {offer.reasons.join(' · ')}</p>}
  </div>;
}

function OfferCard({ offer, tab, unread, onOpen, button, labels }) {
  const openLink = event => {
    if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    event.preventDefault();
    onOpen();
  };
  return <article className="offers-card cab-action-card" data-offer-id={offer.id} data-archived={tab === 'archive'}>
    <div className="offers-cover">
      <OfferCover offer={offer} />
    </div>
    <div className="offers-copy">
      <h3 className="offers-title"><a href={offerHref(offer.id)} onClick={openLink}>{offer.title}</a></h3>
      <OfferMeta offer={offer} unread={unread} labels={labels} />
      <p className="offers-description">{offer.description}</p>
      <OfferConditions offer={offer} labels={labels} />
      <div className="offers-card-action">{button(labels.details, onOpen, { size: '40' })}</div>
    </div>
  </article>;
}

export default function Offers({
  Shared, db, scenario = 'ready', partner, language, intent = '', navigate,
  onRetry, onSeen, seenIds = [], showUnavailable = true, onShowUnavailable,
}) {
  const locale = /^(en(?:-|$)|english$|английский$)/i.test(language) ? 'en' : 'ru';
  const labels = copy[locale];
  const [shared, setShared] = useState(null);
  const [tab, setTab] = useState('active');
  const [limit, setLimit] = useState(pageSize);
  const [pagination, setPagination] = useState('ready');
  const [failedMore, setFailedMore] = useState(false);
  const root = useRef(null);
  const returnPoint = useRef(null);
  const detailTitle = useRef(null);
  const byTab = Object.fromEntries(tabs.map(key => [key, getOffers({ tab: key, scenario, partner, language })]));
  const hasSeen = id => seenIds instanceof Set ? seenIds.has(id) : seenIds.includes(id);
  const isUnread = id => scenario !== 'all-read' && !hasSeen(id);
  const unreadCount = byTab.active.filter(offer => isUnread(offer.id) && (showUnavailable || !offer.reasons.length)).length;
  const detailId = intent.startsWith('offer:') ? intent.slice('offer:'.length) : '';
  const detailTab = detailId && tabs.find(key => byTab[key].some(offer => offer.id === detailId));
  const detail = detailTab && byTab[detailTab].find(offer => offer.id === detailId);
  const unreadDetail = detailTab === 'active' && isUnread(detailId);
  const loading = scenario === 'loading';
  const error = scenario === 'error';
  const button = (label, onClick, props) => (
    <Button Shared={Shared} db={db} label={label} onClick={onClick} {...props} />
  );

  useEffect(() => {
    if (unreadDetail && !loading && !error) onSeen?.(detailId);
  }, [detailId, unreadDetail, loading, error, onSeen]);

  useLayoutEffect(() => {
    const scroller = root.current?.closest('.cab-main');
    if (detailId) {
      if (scroller) scroller.scrollTop = 0;
      detailTitle.current?.focus({ preventScroll: true });
    } else if (returnPoint.current) {
      const { top, id, focus } = returnPoint.current;
      if (scroller) scroller.scrollTop = top;
      const card = [...root.current.querySelectorAll('[data-offer-id]')].find(node => node.dataset.offerId === id);
      card?.querySelector(focus)?.focus({ preventScroll: true });
      returnPoint.current = null;
    }
  }, [detailId]);

  useEffect(() => {
    setLimit(pageSize);
    setPagination('ready');
    setFailedMore(false);
  }, [scenario]);

  useEffect(() => {
    if (pagination !== 'loading' || tab !== 'archive' || detailId) return;
    const timer = setTimeout(() => {
      if (scenario === 'more-error' && !failedMore) {
        setFailedMore(true);
        setPagination('error');
      } else {
        setLimit(count => count + pageSize);
        setPagination('ready');
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [pagination, tab, detailId, scenario, failedMore]);

  async function shareOffer() {
    const url = publicOfferUrl(detailId, locale, profileInitialData.personal.partnerId).href;
    try {
      await navigator.clipboard.writeText(url);
      setShared({ id: detailId, copied: true });
    } catch {
      setShared({ id: detailId, url });
    }
  }

  useEffect(() => {
    setShared(null);
  }, [detailId]);

  function openOffer(id) {
    const active = document.activeElement;
    const focus = active?.matches('.offers-card-action button') ? '.offers-card-action button' : '.offers-title a';
    returnPoint.current = { id, top: root.current.closest('.cab-main')?.scrollTop ?? 0, focus };
    if (pagination === 'loading') setPagination('ready');
    navigate('offers', 'offer:' + id);
  }

  function changeTab(next) {
    if (pagination === 'loading' && next !== tab) setPagination('ready');
    setTab(next);
  }

  function back() {
    if (!returnPoint.current && detailTab) setTab(detailTab);
    navigate('offers');
  }

  const available = byTab[tab].filter(offer => !offer.reasons.length);
  const restricted = showUnavailable ? byTab[tab].filter(offer => offer.reasons.length) : [];
  const visibleLimit = tab === 'archive' ? limit : Infinity;
  const visibleRestricted = restricted.slice(0, Math.max(0, visibleLimit - available.length));
  const card = offer => <OfferCard key={offer.id} offer={offer} tab={tab} unread={tab === 'active' && isUnread(offer.id)} button={button} labels={labels} onOpen={() => openOffer(offer.id)} />;

  function feedback(title, action, error = false) {
    return <div className="offers-feedback">
      <EmptyIllustration kind="offers" />
      <h2 role={error ? 'alert' : undefined}>{title}</h2>
      {action}
    </div>;
  }

  const loadingState = <div className="offers-skeleton" role="status" aria-label={labels.loading} aria-busy="true">
    <div className="offers-skeleton-cover" aria-hidden="true" />
    <div className="offers-skeleton-lines" aria-hidden="true"><span/><span/><span/><span/></div>
  </div>;
  const errorState = feedback(labels.error, button(labels.retry, onRetry), true);

  const backButton = () => button(labels.back, back, {
    size: '40',
    leadingIcon: 'return-to-list',
    leadingIconContent: <Shared.Icon name="return-to-list" />,
  });

  if (detailId) return <section className="offers offers-detail" ref={root} aria-label={labels.detail}>
    <div>{backButton()}</div>
    {loading ? loadingState : error ? errorState : detail ? <article className="offers-detail-card" data-archived={detailTab === 'archive'}>
      <div className="offers-cover"><OfferCover offer={detail} /></div>
      <h2 ref={detailTitle} tabIndex={-1}>{detail.title}</h2>
      <OfferMeta offer={detail} labels={labels} />
      <OfferConditions offer={detail} labels={labels} />
      {detail.public && <div className="offer-share">
        {button(locale === 'ru' ? 'Поделиться' : 'Share', shareOffer, { size: '40' })}
        {shared?.id === detailId && (shared.copied
          ? <span role="status">{locale === 'ru' ? 'Ссылка скопирована' : 'Link copied'}</span>
          : <input aria-label={locale === 'ru' ? 'Ссылка на акцию' : 'Offer link'} readOnly value={shared.url} onFocus={event => event.target.select()} />)}
      </div>}
      <Terms offer={detail} language={locale}/>
      {detailTab === 'active' && !detail.reasons.length && detail.action && <div>
        {button(detail.action.label, () => window.location.assign(detail.action.href), { tone: 'Primary' })}
      </div>}
    </article> : feedback(labels.missing)}
  </section>;

  const tabItems = tabs.map((value) => ({
    value,
    label: labels[value],
    count: value === 'active' && unreadCount && !loading && !error
      ? <span aria-hidden="true">{unreadCount > 9 ? '9+' : unreadCount}</span>
      : undefined,
  }));
  const allHidden = !showUnavailable && byTab[tab].length > 0 && available.length === 0;

  return <section className="offers" ref={root} aria-label={labels.offers}>
    <div className="offers-toolbar">
      <SegmentedTabs className="offers-tabs store-category-tabs" items={tabItems} value={tab} onChange={changeTab} label={labels.status} idPrefix="offers-tab-" panelId="offers-panel" />
      <label className="offers-filter">
        <Shared.Toggle group={db.components.find(item => item.name === 'Boris / Switch')} value={showUnavailable} onChange={onShowUnavailable} ariaLabel={labels.show} />
        <span>{labels.show}</span>
      </label>
    </div>
    <div className="offers-panel" id="offers-panel" role="tabpanel" aria-labelledby={'offers-tab-' + tab}>
      {loading ? loadingState : error ? errorState : available.length + restricted.length === 0
        ? allHidden
          ? feedback(labels.hidden, button(labels.showAction, () => onShowUnavailable(true)))
          : feedback(labels.empty[tab])
        : <>
          {available.slice(0, visibleLimit).map(card)}
          {visibleRestricted.length > 0 && <section className="offers-restricted" aria-labelledby="offers-restricted">
            <h2 id="offers-restricted">{labels.unavailable}</h2>
            {visibleRestricted.map(card)}
          </section>}
          {tab === 'archive' && available.length + restricted.length > limit && <div className="offers-more">
            {pagination === 'error' ? <>
              <p role="alert">{labels.moreError}</p>
              {button(labels.retry, () => setPagination('loading'))}
            </> : pagination === 'loading'
              ? <span role="status">{labels.loadingMore}</span>
              : button(labels.more, () => setPagination('loading'))}
          </div>}
        </>}
    </div>
  </section>;
}
