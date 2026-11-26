import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import CatalogToolbar from '../../CatalogToolbar.jsx';
import ActionDropdown from '../../ds/ActionDropdown.jsx';
import Button from './CabinetButton.jsx';
import EmptyIllustration from './EmptyIllustration.jsx';
import businessCover from '../../assets/partnership-editorial.png';
import productCover from '../../assets/virena-expert.png';
import eventsCover from '../../assets/networking-group.jpg';
import offerCover from '../../assets/partnership-conversation-v3.png';
import './news.css';

const categoryCovers = { Бизнес: businessCover, Продукт: productCover, Мероприятия: eventsCover, Акция: offerCover };

function Cover({ item, className, noCover }) {
  const fallback = categoryCovers[item.category];
  const [failed, setFailed] = useState([]);
  useEffect(() => setFailed([]), [item.cover, item.category, noCover]);
  const src = [noCover ? null : item.cover, fallback].find(value => value && !failed.includes(value));
  return src ? <img className={className} src={src} alt="" onError={() => setFailed(values => [...values, src])} /> : null;
}

function Loading({ article }) {
  return <div className="news-loading" role="status" aria-busy="true" aria-label={article ? 'Загрузка новости' : 'Загрузка новостей'}>
    <div className="news-skeleton" aria-hidden="true"><span/><span/><span/><span/></div>
  </div>;
}

const categories = ['Все', 'Бизнес', 'Продукт', 'Мероприятия', 'Акция'];
const date = (value) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Europe/Moscow',
      });
};
function highlight(text, query) {
  const value = String(text || ''),
    needle =
      query.trim().length >= 3 ? query.trim().toLocaleLowerCase('ru') : '';
  if (!needle) return value;
  const parts = [];
  let start = 0,
    index;
  while (
    (index = value.toLocaleLowerCase('ru').indexOf(needle, start)) !== -1
  ) {
    parts.push(
      value.slice(start, index),
      <mark key={index}>{value.slice(index, index + needle.length)}</mark>,
    );
    start = index + needle.length;
  }
  return [...parts, value.slice(start)];
}
function bodyText(node) {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(bodyText).join(' ');
  return React.isValidElement(node) ? bodyText(node.props.children) : '';
}
function Card({ item, query, read, onOpen, variant, noCover }) {
  return (
    <button type="button" className={`news-card news-${variant} ${variant === 'row' ? 'ds-hover-row' : 'cab-action-card'}`} onClick={() => onOpen(item.id)}>
      <div className="news-cover">
        <Cover item={item} noCover={noCover} />

      </div>
      <div className="news-card-copy">
        <div className="news-badges">
        <span
          className={
            'news-category category-' + categories.indexOf(item.category)
          }
        >
          {item.category}
        </span>
          {!read && <span>Новая</span>}
          {item.pinned && <span>Закреплено</span>}
          {item.important && <span>Важно</span>}
        </div>
        <h3>{highlight(item.title, query)}</h3>
        <p>{highlight(item.description, query)}</p>
        <div className="news-card-footer">
          <time dateTime={item.date}>{date(item.date)}</time>
        </div>
      </div>
    </button>
  );
}
export default function News({
  Shared,
  db,
  items = [],
  readIds = [],
  onReadAll,
  readError = false,
  articleId,
  onOpen,
  onBack,
  navigate,
  scenario,
  onRetry,
}) {
  const [query, setQuery] = useState(''),
    [category, setCategory] = useState('Все'),
    [limit, setLimit] = useState(12),
    scroll = useRef(0),
    wasDetail = useRef(false);
  const [moreState, setMoreState] = useState('ready');
  const moreFailed = useRef(false);
  const timer = useRef(null);
  useEffect(() => {
    setLimit(12);
    moreFailed.current = false;
  }, [query, category, scenario]);
  useEffect(() => {
    setMoreState('ready');
    return () => clearTimeout(timer.current);
  }, [query, category, articleId, scenario]);
  const loadMore = () => {
    setMoreState('loading');
    timer.current = setTimeout(() => {
      if (scenario === 'more-error' && !moreFailed.current) {
        moreFailed.current = true;
        setMoreState('error');
      } else {
        setLimit(n => n + 12);
        setMoreState('ready');
      }
    }, 300);
  };
  const root = useRef(null);
  useLayoutEffect(() => {
    const container = root.current?.closest('.cab-main');
    if (articleId) {
      wasDetail.current = true;
      container?.scrollTo(0, 0);
    } else if (wasDetail.current) {
      container?.scrollTo(0, scroll.current);
      wasDetail.current = false;
    }
  }, [articleId]);
  const article = items.find((item) => item.id === articleId),
    needle =
      query.trim().length >= 3 ? query.trim().toLocaleLowerCase('ru') : '';
  const filtered = items.filter(
    (item) =>
      (category === 'Все' || item.category === category) &&
      (!needle ||
        `${item.title} ${item.description || ''} ${bodyText(item.body)}`
          .toLocaleLowerCase('ru')
          .includes(needle)),
  );

  const visibleItems = filtered.slice(0, limit);
  const featuredCount = category === 'Все' && !needle ? 1 : 0;
  const rows = visibleItems.slice(featuredCount);
  const open = (id) => {
    if (!articleId)
      scroll.current = root.current?.closest('.cab-main')?.scrollTop || 0;
    onOpen?.(id);
  };
  const card = (item, variant = 'tile') => (
    <Card
      key={item.id}
      variant={variant}
      item={item}
      query={needle}
      read={readIds.includes(item.id)}
      onOpen={open}
      noCover={scenario === 'no-cover'}
    />
  );
  const backButton = (
    <Button {...{ Shared, db }} label="Все новости"
      leadingIconContent={<Shared.Icon name="return-to-list" />} onClick={onBack} />
  );
  if (scenario === 'loading') return <div ref={root} className="news">{articleId && backButton}<Loading article={!!articleId} /></div>;
  if (scenario === 'error') return <div ref={root} className="news news-empty" role="alert">
    <h2>{articleId ? 'Не удалось загрузить новость' : 'Не удалось загрузить новости'}</h2>
    <p>Попробуйте ещё раз.</p>
    <Button {...{ Shared, db }} label="Повторить" onClick={onRetry} />
    {articleId && backButton}
  </div>;
  if (articleId && !article)
    return (
      <div ref={root} className="news news-empty">
        <h2>Новость не найдена</h2>
        {backButton}
      </div>
    );
  if (article) {
    const related = items
      .filter((item) => item.id !== article.id)
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
    return (
      <div ref={root} className="news news-detail">
        {backButton}
        <article className="news-article">
          <Cover item={article} className="news-article-cover" noCover={scenario === 'no-cover'} />
          <div className="news-meta">
            <span
              className={
                'news-category category-' + categories.indexOf(article.category)
              }
            >
              {article.category}
            </span>
            {article.important && <span>Важно</span>}
          </div>
          <h1>{article.title}</h1>
          <div className="news-meta">
            <time dateTime={article.date}>{date(article.date)}</time>
            {article.updated &&
              new Date(article.updated) > new Date(article.date) && (
                <span>Обновлено {date(article.updated)}</span>
              )}
          </div>
          {(article.russianOnly || scenario === 'russian-only') && (
            <p>Новость пока доступна только на русском языке</p>
          )}
          <div className="news-body">{article.body}</div>
          {article.attachments?.length > 0 && (
            <section className="news-attachments">
              <h2>Материалы</h2>
              {article.attachments.map((file) => (
                <a key={file.url} href={file.url} download>
                  {file.name} ↓
                </a>
              ))}
            </section>
          )}
          {article.action && (
            <Button
              {...{ Shared, db }}
              label={article.action.label}
              tone="Primary"
              onClick={() => navigate(article.action.page)}
            />
          )}
        </article>
        {related.length > 0 && (
          <section className="news-related">
            <h2>Другие новости</h2>
            <div className="news-related-list">{related.map(item => card(item))}</div>
          </section>
        )}
        {backButton}
      </div>
    );
  }

  return (
    <div ref={root} className="news">
      {items.length > 0 && (
        <CatalogToolbar
          {...{ Shared, db }}
          items={categories
            .filter(
              (value) =>
                value === 'Все' ||
                items.some((item) => item.category === value),
            )
            .map((value) => ({ value, label: value }))}
          value={category}
          onChange={setCategory}
          label="Категории новостей"
          idPrefix="news-tab-"
          panelId="news-results"
          query={query}
          onQueryChange={setQuery}
          searchLabel="Поиск новостей"
          actions={
            <>
              {items.some((item) => !readIds.includes(item.id)) && (
                <>
                  <span>
                    <ActionDropdown
                      {...{ Shared, db }}
                      label="Действия с новостями"
                      items={[
                        {
                          label: 'Отметить все как прочитанные',
                          onClick: onReadAll,
                        },
                      ]}
                    />
                  </span>
                </>
              )}
            </>
          }
        />
      )}
      {readError && <div className="news-read-error" role="alert"><span>Не удалось отметить новости как прочитанные.</span><Button {...{ Shared, db }} label="Повторить" onClick={onReadAll} /></div>}
      {scenario === 'empty' || !filtered.length ? (
        <div className="news-empty">
          <EmptyIllustration kind={items.length && scenario !== 'empty' ? 'search' : 'news'} />
          <h2>
            {items.length && scenario !== 'empty'
              ? needle ? `По запросу «${query}» ничего не найдено` : 'В этой категории пока нет новостей'
              : 'Новостей пока нет'}
          </h2>
          <p>{items.length && scenario !== 'empty' && needle ? 'Попробуйте изменить поисковый запрос.' : ''}</p>
          {items.length > 0 && scenario !== 'empty' && (
            <Button
              {...{ Shared, db }}
              label={needle ? 'Сбросить поиск' : 'Все новости'}
              tone="Primary"
              onClick={() => { setQuery(''); if (!needle) setCategory('Все'); }}
            />
          )}
        </div>
      ) : (
        <>
          <section id="news-results" className="news-grid" aria-label="Новости">
            {visibleItems.slice(0, featuredCount).map(item =>
              card(item, 'lead')
            )}
            {rows.length > 0 && <div className="news-list-surface">
              {rows.map(item => card(item, 'row'))}
            </div>}
          </section>
          {filtered.length > limit && (
            <div className="news-pagination">
              {moreState === 'error' ? <div role="alert"><p>Не удалось загрузить остальные новости.</p><Button {...{ Shared, db }} label="Повторить" onClick={loadMore} /></div> :
                <Button {...{ Shared, db }} label={moreState === 'loading' ? 'Загрузка…' : 'Показать ещё'} disabled={moreState === 'loading'} onClick={loadMore} />}
            </div>
          )}
        </>
      )}
    </div>
  );
}
