import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { getOffers } from '../src/cabinet/components/offersData.js';

const anchor = new Date('2026-11-26T10:00:00Z');
const offers = options => getOffers({ now: anchor, anchor, ...options });
const expert = list => list.find(offer => offer.id === 'expert-week');
const workshop = list => list.find(offer => offer.id === 'expert-workshop');
const eligible = { country: 'Казахстан', stars: 3, products: ['expert'] };

const active = offers();
assert.deepEqual(active.map(({ id }) => id), ['expert-week', 'partner-start', 'expert-workshop']);
assert.ok(active[0].pinned);
assert.equal(expert(active).period, '22–29 ноября 2026');
assert.equal(expert(active).timing, 'Осталось 3 дня');
assert.equal(active[1].period, 'Бессрочная');
assert.equal(active[1].timing, '');
assert.equal(workshop(active).timing, 'Осталось 7 дней');
assert.deepEqual(workshop(active).reasons, ['Только для: Казахстан', 'Нужно от 3★', 'Только для владельцев Expert']);

assert.deepEqual(workshop(offers({ partner: eligible })).reasons, []);
assert.deepEqual(workshop(offers({ partner: { ...eligible, stars: 2 } })).reasons, ['Нужно от 3★']);
assert.deepEqual(workshop(offers({ partner: { ...eligible, products: [] } })).reasons, ['Только для владельцев Expert']);
assert.deepEqual(workshop(offers({ partner: { ...eligible, country: 'RU' } })).reasons, ['Только для: Казахстан']);
assert.deepEqual(workshop(offers({ scenario: 'eligible' })).reasons, []);
assert.ok(offers({scenario:'unavailable'}).every(item => item.reasons.length));
assert.equal(workshop(offers({ scenario: 'unavailable', partner: eligible })).reasons.length, 3);

const upcoming = offers({ tab: 'upcoming' });
assert.deepEqual(upcoming.map(({ id }) => id), ['balance-week', 'kazakhstan-meeting']);
assert.equal(upcoming[0].timing, 'Старт через 4 дня');
const archive = offers({ tab: 'archive' });
assert.equal(archive.length, 13);
assert.ok(archive.every(offer => offer.timing === 'Завершена'));
const availableArchive = archive.filter(offer => !offer.reasons.length);
assert.ok(availableArchive.every((offer, index) => index === 0 || availableArchive[index - 1].end > offer.end));

const beforeStart = new Date('2026-11-21T20:59:59Z');
const startsToday = new Date('2026-11-21T21:00:00Z');
const endsToday = new Date('2026-11-29T20:59:59Z');
const dayAfterEnd = new Date('2026-11-29T21:00:00Z');
assert.equal(expert(offers({ tab: 'upcoming', now: beforeStart })).timing, 'Старт через 1 день');
assert.equal(expert(offers({ now: startsToday })).status, 'active');
assert.equal(expert(offers({ now: endsToday })).timing, 'Заканчивается сегодня');
assert.equal(expert(offers({ tab: 'archive', now: dayAfterEnd })).status, 'archive');
assert.equal(workshop(offers({ now: new Date('2026-11-25T10:00:00Z') })).timing, '');

const english = offers({ language: 'English' });
assert.equal(expert(english).title, 'Expert Week');
assert.notEqual(expert(english).cover, expert(active).cover);
assert.equal(english[1].title, 'Getting started resources');
assert.equal(english[1].cover, active[1].cover);
assert.equal(workshop(english).title, workshop(active).title);
assert.equal(expert(offers({ language: 'en', scenario: 'russian-only' })).title, expert(active).title);
assert.equal(expert(offers({ scenario: 'no-cover' })).cover, null);
assert.equal(offers({ tab: 'archive', scenario: 'no-cover' }).length, archive.length);
assert.ok(offers({ scenario: 'many-new' }).length >= 10);
assert.deepEqual(offers({ scenario: 'empty' }), []);

for (const offer of [...active, ...upcoming, ...archive, ...english]) {
  assert.ok(existsSync(new URL(offer.cover)), `Missing cover for ${offer.id}`);
}
console.log('Offer fixtures, calendar boundaries, eligibility, sorting, covers and fallback passed.');
