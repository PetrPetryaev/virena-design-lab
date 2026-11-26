import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.setDefaultTimeout(8000);
page.setDefaultNavigationTimeout(15000);
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const base = (process.env.TEST_URL || 'http://127.0.0.1:5174/') + '?tab=cabinet&page=offers';
const tab = name => page.getByRole('tab', { name: new RegExp(`^${name}`) });
const cards = () => page.locator('.offers-card');
const card = id => page.locator(`[data-offer-id="${id}"]`);
const heading = name => page.getByRole('heading', { name, exact: true });
const detail = page.getByRole('region', { name: 'Страница акции' });
const open = (scenario, id) => page.goto(base
  + (scenario ? `&offersScenario=${scenario}` : '')
  + (id ? `&intent=offer:${id}` : ''), { waitUntil: 'domcontentloaded' });
const overflow = async () => assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), page.url());
try {
  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 1000 });
    await open();
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'domcontentloaded' });
    await tab('Действующие').waitFor();
    assert.equal(await tab('Действующие').getAttribute('aria-selected'), 'true');
    const toggle = page.getByRole('switch', { name: 'Показывать недоступные акции' });
    assert.equal(await toggle.getAttribute('aria-checked'), 'true');
    await page.getByRole('heading', { name: 'Недоступные вам' }).waitFor();
    await toggle.click();
    assert.equal(await page.getByRole('heading', { name: 'Недоступные вам' }).count(), 0);
    await tab('Скоро').click();
    assert.equal(await tab('Скоро').getAttribute('aria-selected'), 'true');
    await tab('Действующие').click();
    assert.equal(await toggle.getAttribute('aria-checked'), 'false');
    await page.reload({ waitUntil: 'domcontentloaded' });
    assert.equal(await toggle.getAttribute('aria-checked'), 'false');
    const first = cards().first();
    const title = await first.getByRole('heading').first().innerText();
    assert.equal(await first.getByText('Новая', { exact: true }).count(), 1);
    await first.getByRole('button', { name: 'Подробнее' }).click();
    assert.match(page.url(), /intent=offer/);
    await page.getByRole('heading', { name: title, exact: true }).waitFor();
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: title, exact: true }).waitFor();
    await page.getByRole('button', { name: 'Все акции' }).first().click();
    await first.waitFor();
    assert.equal(await first.getByText('Новая', { exact: true }).count(), 0);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await first.waitFor();
    assert.equal(await first.getByText('Новая', { exact: true }).count(), 0);
    await tab('Архив').click();
    const before = await cards().count();
    await page.getByRole('button', { name: 'Показать ещё' }).click();
    await cards().nth(before).waitFor();
    assert.ok(await cards().count() > before);
    await overflow();
    await open('empty');
    await page.getByRole('heading', { name: 'Сейчас нет действующих акций' }).waitFor();
    await tab('Скоро').click();
    await page.getByRole('heading', { name: 'Новые акции скоро появятся' }).waitFor();
    await tab('Архив').click();
    await page.getByRole('heading', { name: 'Завершённых акций пока нет' }).waitFor();
    await overflow();
    await open('loading');
    await page.getByRole('status', { name: 'Загрузка акций' }).waitFor();
    await overflow();
    await open('error');
    await page.getByRole('alert').waitFor();
    await page.getByRole('button', { name: 'Повторить' }).click();
    await cards().first().waitFor();
    await overflow();
    await open('more-error');
    await tab('Архив').click();
    const count = await cards().count();
    await page.getByRole('button', { name: 'Показать ещё' }).click();
    await page.getByRole('alert').waitFor();
    assert.equal(await cards().count(), count);
    await page.getByRole('button', { name: 'Повторить' }).click();
    await cards().nth(count).waitFor();
    assert.ok(await cards().count() > count);
    await overflow();

    await open('unavailable');
    await heading('Все акции в этой вкладке пока недоступны вам').waitFor();
    assert.equal(await cards().count(), 0);
    await page.getByRole('button', { name: 'Показать недоступные акции' }).click();
    const workshop = card('expert-workshop');
    await workshop.waitFor();
    assert.equal(await toggle.getAttribute('aria-checked'), 'true');
    await workshop.getByText(/Только для: Казахстан.*Нужно от 3★.*Только для владельцев Expert/).waitFor();
    await overflow();

    await open('eligible');
    for (const term of ['Казахстан', 'От 3★', 'Владельцы Expert']) {
      await workshop.getByText(term, { exact: true }).waitFor();
    }
    assert.equal(await workshop.locator('.offers-reasons').count(), 0);
    await overflow();

    await open('all-read');
    await cards().first().waitFor();
    assert.equal(await cards().getByText('Новая', { exact: true }).count(), 0);
    assert.equal(await tab('Действующие').locator('[aria-hidden="true"]').count(), 0);
    await open('many-new');
    await tab('Действующие').getByText('9+', { exact: true }).waitFor();
    assert.ok(await cards().getByText('Новая', { exact: true }).count() > 9);
    await overflow();

    const expert = card('expert-week');
    await open('no-cover');
    await expert.locator('.offers-cover-fallback').waitFor();
    assert.equal(await expert.locator('.offers-cover-image').count(), 0);
    const expertCoverUrl = '**/expert-v2-lifestyle-1*.jpg*';
    await page.route(expertCoverUrl, route => route.request().resourceType() === 'image' ? route.abort() : route.continue());
    await open();
    await expert.locator('.offers-cover-fallback').waitFor();
    await page.unroute(expertCoverUrl);
    await overflow();

    await open('russian-only');
    await tab('Active').waitFor();
    await expert.getByRole('heading', { name: 'Неделя Expert' }).waitFor();
    await expert.getByRole('button', { name: 'View details' }).waitFor();
    await overflow();

    for (const [id, name, status, returnTab] of [
      ['unknown-offer', 'Акция не найдена', null, 'Действующие'],
      ['water-week', 'Неделя Water', 'Завершена', 'Архив'],
      ['balance-week', 'Неделя Balance', /^Старт через/, 'Скоро'],
      ['expert-workshop', 'Практикум для владельцев Expert', 'Недоступна вам', 'Действующие'],
    ]) {
      await open(undefined, id);
      await detail.getByRole('heading', { name, exact: true }).waitFor();
      if (status) await detail.getByText(status, { exact: true }).waitFor();
      assert.equal(await detail.getByRole('button', { name: 'Поделиться' }).count(), ['water-week','balance-week'].includes(id) ? 1 : 0);
      await overflow();
      await detail.getByRole('button', { name: 'Все акции' }).click();
      await tab(returnTab).and(page.locator('[aria-selected="true"]')).waitFor();
    }

    await open('loading', 'expert-week');
    await detail.getByRole('status', { name: 'Загрузка акций' }).waitFor();
    await overflow();
    await open('error', 'expert-week');
    await detail.getByRole('alert').waitFor();
    await detail.getByRole('button', { name: 'Повторить' }).click();
    await detail.getByRole('status', { name: 'Загрузка акций' }).waitFor();
    await detail.getByRole('heading', { name: 'Неделя Expert' }).waitFor();
    await overflow();

    await open('eligible');
    const cover = expert.locator('.offers-cover');
    await cover.scrollIntoViewIfNeeded();
    const { x, y, width: coverWidth, height: coverHeight } = await cover.boundingBox();
    const point = { x: x + coverWidth / 2, y: y + coverHeight / 2 };
    await page.mouse.move(0, 0);
    const idleShadow = await expert.evaluate(node => getComputedStyle(node).boxShadow);
    await page.mouse.move(point.x, point.y);
    assert.ok(await expert.evaluate(node => node.matches(':hover')));
    await page.waitForFunction(({ idleShadow }) => {
      const node = document.querySelector('[data-offer-id="expert-week"]');
      return node && getComputedStyle(node).boxShadow !== idleShadow;
    }, { idleShadow }, { timeout: 2000 });
    await page.mouse.click(point.x, point.y);
    await detail.getByRole('heading', { name: 'Неделя Expert' }).waitFor();
    await detail.getByRole('button', { name: 'Все акции' }).click();
    await expert.locator('a:focus').waitFor();
    await expert.getByRole('button', { name: 'Подробнее' }).click();
    await detail.getByRole('button', { name: 'Перейти к Expert' }).click();
    await page.waitForURL(url => url.searchParams.get('tab') === 'store' && url.searchParams.get('product') === 'expert');
    await page.locator('.store-detail h1').filter({ hasText: /Expert/ }).waitFor();
  }
  assert.deepEqual(errors, []);
  console.log('PASS: offers list/detail states, eligibility, unread counts, localized fallback, media fallback, navigation and overflow at 1440/375');
} finally {
  await browser.close();
}
