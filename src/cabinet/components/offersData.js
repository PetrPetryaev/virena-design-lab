// Локальные примеры акций для проверки витрины.
const covers = {
  expert: new URL('../../assets/marketplace-products/expert-v2-lifestyle-1.jpg', import.meta.url).href,
  expertEn: new URL('../../assets/marketplace-products/expert-v2-lifestyle-2.jpg', import.meta.url).href,
  training: new URL('../../assets/news/learning.webp', import.meta.url).href,
  meeting: new URL('../../assets/news/partner-meeting.webp', import.meta.url).href,
  welcome: new URL('../../assets/news/welcome-materials.webp', import.meta.url).href,
  product: new URL('../../assets/news/product-card.webp', import.meta.url).href,
  event: new URL('../../assets/news/online-event.webp', import.meta.url).href,
  balance: new URL('../../assets/marketplace-products/balance-v2-lifestyle-1.jpg', import.meta.url).href,
  water: new URL('../../assets/marketplace-products/water-v2-lifestyle-1.jpg', import.meta.url).href,
};

const campaigns = [
  {
    id: 'expert-week', public: true, start: -4, end: 3, pinned: true,
    action: { ru: 'Перейти к Expert', en: 'View Expert', href: '?tab=store&page=shop&product=expert' },
    ru: {
      title: 'Неделя Expert',
      description: 'Специальное предложение на комплект Virena Expert для партнёров. В комплект входит прибор и доступ к вводному занятию.',
      details: ['Комплект можно выбрать в каталоге в период акции.', 'Доступ к вводному занятию появится после оплаты комплекта. Участие ограничено одним комплектом на партнёра.'],
      cover: covers.expert,
    },
    en: {
      title: 'Expert Week',
      description: 'A special offer on the Virena Expert bundle for partners. It includes the device and access to an introductory session.',
      details: ['Select the bundle in the catalog while the offer is active.', 'Access to the introductory session becomes available after payment. One bundle per partner.'],
      cover: covers.expertEn,
    },
  },
  {
    id: 'partner-start', start: -1, end: null,
    action: { ru: 'Открыть материалы', en: 'Open partner guide', href: '?tab=cabinet&page=news&intent=article:partner-cabinet-guide' },
    ru: {
      title: 'Материалы для старта',
      description: 'Подборка вводных материалов и встреч для партнёров, которые знакомятся с продуктами Virena.',
      details: ['В подборке собраны материалы для знакомства с каталогом и работы с командой.'],
      cover: covers.welcome,
    },
    en: { title: 'Getting started resources', description: 'Introductory resources and meetings for partners exploring Virena products.' },
  },
  {
    id: 'expert-workshop', start: -2, end: 7, countries: ['KZ'], stars: 3, product: 'Expert',
    ru: {
      title: 'Практикум для владельцев Expert',
      description: 'Разберём настройки Expert и ответим на вопросы о работе с прибором на встрече для партнёров из Казахстана.',
      details: ['Участие доступно партнёрам из Казахстана с рангом от 3★ и покупкой Expert.'],
      cover: covers.training,
    },
  },
  {
    id: 'balance-week', public: true, start: 4, end: 11,
    en: { title: 'Balance Week', description: 'Order Balance during the offer to get an introductory session with the device.' },
    ru: {
      title: 'Неделя Balance',
      description: 'В течение недели при заказе Balance будет доступно вводное занятие по работе с прибором.',
      cover: covers.balance,
    },
  },
  {
    id: 'kazakhstan-meeting', start: 8, end: 9, countries: ['KZ'],
    ru: {
      title: 'Встреча партнёров в Казахстане',
      description: 'Открываем регистрацию на встречу для обмена опытом и знакомства с новыми материалами Virena.',
      cover: covers.meeting,
    },
  },
];

const pastCampaigns = [
  ['water-week', 'Неделя Water', 'Предложение на Water с вводной встречей по использованию прибора.', covers.water],
  ['catalog-consultation', 'Консультации по каталогу', 'Серия встреч о характеристиках продуктов и выборе комплекта.', covers.product],
  ['autumn-meeting', 'Осенняя встреча партнёров', 'Встреча команды по открытым вопросам партнёрства.', covers.meeting],
  ['balance-practice', 'Практикум Balance', 'Вводное занятие по работе с Balance.', covers.balance],
  ['expert-introduction', 'Знакомство с Expert', 'Предложение на комплект Expert с вводным занятием.', covers.expert],
  ['partner-school', 'Школа партнёра', 'Серия занятий о каталогах, заказах и кабинете.', covers.training],
  ['catalog-preview', 'Знакомство с каталогом', 'Встреча с обзором обновлённых карточек продуктов.', covers.product],
  ['welcome-week', 'Неделя для новых партнёров', 'Вводные материалы и ответы на вопросы новых партнёров.', covers.welcome],
  ['water-practice', 'Практикум Water', 'Встреча о настройках и обслуживании прибора Water.', covers.water],
  ['online-questions', 'Вопросы о продуктах', 'Онлайн-встреча с ответами на вопросы партнёров.', covers.event],
  ['expert-team', 'Встреча владельцев Expert', 'Обмен опытом и практическими советами по Expert.', covers.expert, { product: 'Expert' }],
  ['balance-consultation', 'Консультация по Balance', 'Знакомство с комплектом Balance на вводной встрече.', covers.balance],
  ['regional-meeting', 'Встреча команды в Казахстане', 'Обсуждение планов и материалов команды в Казахстане.', covers.meeting, { countries: ['KZ'] }],
].map(([id, title, description, cover, eligibility], index) => {
  const end = -2 - 8 * index;
  const water = id === 'water-week';
  return { id, start: end - 5, end, ru: { title, description, cover }, ...eligibility, public: water,
    ...(water && { en: { title: 'Water Week', description: 'A Water offer with an introductory session on using the device.' } }),
  };
});

const DAY_MS = 86_400_000;
// Даты кабинета фиксированы по Москве (GMT+3).
const calendarDay = date => Math.floor((date.getTime() + 3 * 3_600_000) / DAY_MS);
const busiestCampaigns = pastCampaigns.slice(0, 8).map((offer, index) => ({
  ...offer, id: `${offer.id}-edition`, start: -index - 1, end: 15 - index,
}));

const initialDay = new Date();
const openPartner = { country: 'KZ', stars: 3, products: ['Expert'] };
const closedPartner = { country: 'RU', stars: 2, products: [] };

function eligibility(offer, partner, locale) {
  const english = locale === 'en';
  const metTerms = [];
  const reasons = [];
  const country = String(partner.country ?? '').trim().toLowerCase();
  const countryCode = ({ россия: 'ru', russia: 'ru', казахстан: 'kz', kazakhstan: 'kz' })[country] ?? country;
  if (offer.countries?.length) {
    const countryNames = new Intl.DisplayNames([locale], { type: 'region' });
    const countries = offer.countries.map(code => countryNames.of(code)).join(', ');
    const label = english ? `Only for: ${countries}` : `Только для: ${countries}`;
    if (!offer.countries.some(code => code.toLowerCase() === countryCode)) reasons.push(label);
    else metTerms.push(countries);
  }
  if (offer.stars) {
    if (Number(partner.stars ?? 0) < offer.stars) {
      reasons.push(english ? `Requires ${offer.stars}★ or more` : `Нужно от ${offer.stars}★`);
    } else metTerms.push(english ? `From ${offer.stars}★` : `От ${offer.stars}★`);
  }
  if (offer.product) {
    const label = english ? `Only for ${offer.product} owners` : `Только для владельцев ${offer.product}`;
    if (!(partner.products ?? []).some(product => product.toLowerCase() === offer.product.toLowerCase())) reasons.push(label);
    else metTerms.push(english ? `${offer.product} owners` : `Владельцы ${offer.product}`);
  }
  return { metTerms, reasons };
}

function timingText(status, delta, locale) {
  const english = locale === 'en';
  if (status === 'archive') return english ? 'Ended' : 'Завершена';
  if (status === 'active' && (delta == null || delta > 7)) return '';
  const unit = new Intl.PluralRules(locale).select(delta);
  if (english) {
    const days = unit === 'one' ? 'day' : 'days';
    return status === 'upcoming' ? `Starts in ${delta} ${days}` : `${delta} ${days} left`;
  }
  if (delta === 0) return 'Заканчивается сегодня';
  const days = { one: 'день', few: 'дня', many: 'дней', other: 'дня' }[unit];
  if (status === 'upcoming') return `Старт через ${delta} ${days}`;
  return `${unit === 'one' ? 'Остался' : 'Осталось'} ${delta} ${days}`;
}

export function getOffers({ tab = 'active', scenario = 'ready', partner = closedPartner, language = 'ru', now = new Date(), anchor = initialDay } = {}) {
  if (scenario === 'empty') return [];
  const locale = /^(en(?:-|$)|english$|английский$)/i.test(language) ? 'en' : 'ru';
  if (scenario === 'eligible') partner = openPartner;
  if (scenario === 'unavailable') partner = closedPartner;
  const today = calendarDay(now);
  const anchorDay = calendarDay(anchor);
  const formatter = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const examples = [...campaigns, ...pastCampaigns];
  if (scenario === 'many-new') examples.push(...busiestCampaigns);
  const selected = examples.flatMap(offer => {
    const start = anchorDay + offer.start;
    const end = offer.end == null ? null : anchorDay + offer.end;
    const status = start > today ? 'upcoming' : end != null && end < today ? 'archive' : 'active';
    if (status !== tab) return [];
    if (scenario === 'unavailable' && !(offer.countries || offer.stars || offer.product)) return [];
    const primary = offer.id === 'expert-week';
    const localized = primary && scenario === 'russian-only' ? offer.ru : offer[locale];
    const copy = { ...offer.ru, ...localized };
    const period = end == null
      ? locale === 'en' ? 'No end date' : 'Бессрочная'
      : formatter.formatRange(new Date(start * DAY_MS), new Date(end * DAY_MS)).replace(/\sг\.$/u, '');
    return [{
      id: offer.id,
      public: offer.public === true && !offer.id.endsWith('-edition'),
      attachment: primary ? {
        name: locale === 'en' ? 'Expert Week terms' : 'Условия акции «Неделя Expert»',
        file: 'expert-week-' + locale + '.txt',
        bytes: locale === 'en' ? 249 : 415,
      } : null,
      audience: primary ? (locale === 'en' ? ['For partners'] : ['Для партнёров']) : [],
      status,
      title: copy.title,
      description: copy.description,
      action: offer.action && { label: offer.action[locale] ?? offer.action.ru, href: offer.action.href },
      details: copy.details ?? [copy.description],
      cover: primary && scenario === 'no-cover' ? null : copy.cover ?? null,
      period,
      ...eligibility(offer, partner, locale),
      timing: timingText(status, status === 'upcoming' ? start - today : end == null ? null : end - today, locale),
      pinned: Boolean(offer.pinned),
      start,
      end,
    }];
  });
  return selected.sort((a, b) => {
    const availability = Number(Boolean(a.reasons.length)) - Number(Boolean(b.reasons.length));
    if (availability) return availability;
    if (tab === 'upcoming') return a.start - b.start;
    if (tab === 'archive') return b.end - a.end;
    return Number(b.pinned) - Number(a.pinned) || b.start - a.start;
  });
}
