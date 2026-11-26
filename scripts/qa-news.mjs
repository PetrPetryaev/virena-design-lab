import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage(),
  errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const base =
  (process.env.TEST_URL || 'http://127.0.0.1:5174/') + '?tab=cabinet&page=news';
const cards = () => page.locator('.news-grid .news-card');
const noOverflow = async () =>
  assert.deepEqual(
    await page.evaluate(() => {
      const main = document.querySelector('.cab-main');
      return [
        document.documentElement.scrollWidth <= innerWidth,
        main.scrollWidth <= main.clientWidth,
      ];
    }),
    [true, true],
  );
try {
  await page.goto(base);
  await page.locator('.news-grid').waitFor();
  assert.equal(await cards().count(), 12);
  assert.equal(await page.locator('.news-grid .news-lead').count(), 1);
  assert.equal(await page.locator('.news-grid .news-row').count(), 11);
  await page.getByRole('button', { name: 'Показать ещё', exact: true }).click();
  await cards().nth(13).waitFor();
  assert.equal(await cards().count(), 14);
  await page.getByRole('tab', { name: 'Продукт', exact: true }).click();
  assert.equal(await cards().count(), 4);
  assert.equal(
    await cards()
      .filter({
        hasNot: page.locator('.news-category', { hasText: 'Продукт' }),
      })
      .count(),
    0,
  );
  await cards().first().click();
  await page
    .getByRole('button', { name: 'Все новости', exact: true })
    .first()
    .click();
  assert.equal(await cards().count(), 4);
  assert.equal(
    await page
      .getByRole('tab', { name: 'Продукт', exact: true })
      .getAttribute('aria-selected'),
    'true',
  );
  await page.getByRole('tab', { name: 'Все', exact: true }).click();
  const search = page.getByRole('searchbox', { name: 'Поиск новостей' });
  await search.fill('ка');
  assert.equal(await cards().count(), 12);
  await search.fill('каталоге');
  assert.ok((await cards().count()) > 0);
  assert.ok((await page.locator('.news-card mark').count()) > 0);
  await search.fill('несуществующий запрос 123');
  assert.equal(
    await page
      .getByRole('heading', {
        name: 'По запросу «несуществующий запрос 123» ничего не найдено',
      })
      .count(),
    1,
  );
  await page
    .getByRole('button', { name: 'Сбросить поиск', exact: true })
    .click();
  assert.equal(await cards().count(), 12);
  const first = cards().first(),
    title = await first.locator('h3').innerText();
  assert.equal(await first.getByText('Новая', { exact: true }).count(), 1);
  await first.click();
  assert.equal(await page.locator('.news-article h1').textContent(), title);
  assert.match(page.url(), /intent=article/);
  await page.reload();
  assert.equal(await page.locator('.news-article h1').textContent(), title);
  await page
    .getByRole('button', { name: 'Все новости', exact: true })
    .first()
    .click();
  assert.equal(
    await cards().first().getByText('Новая', { exact: true }).count(),
    0,
  );
  await page.reload();
  assert.equal(
    await cards().first().getByText('Новая', { exact: true }).count(),
    0,
  );
  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.waitForTimeout(300);
    await noOverflow();
    await cards().first().click();
    await page.locator('.news-article').waitFor();
    const cover = page.locator('.news-article > img:first-child');
    assert.ok(await cover.evaluate(async image => {
      await image.decode();
      return Math.abs(image.clientHeight - image.clientWidth * image.naturalHeight / image.naturalWidth) <= 1;
    }));
    await noOverflow();
    await page
      .getByRole('button', { name: 'Все новости', exact: true })
      .first()
      .click();
  }
  await page.goto(base + '&newsScenario=empty');
  await page.getByRole('heading', { name: 'Новостей пока нет' }).waitFor();
  await noOverflow();
  await page.goto(base + '&intent=article:missing');
  await page.getByRole('heading', { name: 'Новость не найдена' }).waitFor();
  await page.getByRole('button', { name: 'Все новости', exact: true }).click();
  assert.equal(await cards().count(), 12);
  await noOverflow();
  const article = 'partner-cabinet-guide';
  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const intent of ['', `&intent=article:${article}`]) {
      await page.goto(base + '&newsScenario=loading' + intent);
      await page.getByRole('status', { name: intent ? 'Загрузка новости' : 'Загрузка новостей' }).waitFor();
      await noOverflow();
      await page.goto(base);
      await page.evaluate(() => sessionStorage.removeItem('virena-read-news'));
      await page.goto(base + '&newsScenario=error' + intent);
      await page.getByRole('alert').waitFor();
      assert.deepEqual(await page.evaluate(() => JSON.parse(sessionStorage.getItem('virena-read-news') || '[]')), []);
      await page.getByRole('button', { name: 'Повторить', exact: true }).click();
      if (intent) await page.locator('.news-article h1').waitFor();
      else await cards().first().waitFor();
      await noOverflow();
    }
    await page.goto(base + '&newsScenario=more-error');
    await cards().nth(11).waitFor();
    const titles = await cards().locator('h3').allTextContents();
    await page.getByRole('button', { name: 'Показать ещё', exact: true }).click();
    await page.getByRole('alert').waitFor();
    assert.deepEqual(await cards().locator('h3').allTextContents(), titles);
    await page.getByRole('alert').getByRole('button', { name: 'Повторить' }).click();
    await cards().nth(13).waitFor();
    assert.deepEqual((await cards().locator('h3').allTextContents()).slice(0, 12), titles);
    await cards().first().click();
    await page.getByRole('button', { name: 'Все новости', exact: true }).first().click();
    assert.equal(await cards().count(), 14);
    await noOverflow();
    await page.goto(base);
    await page.evaluate(() => sessionStorage.removeItem('virena-read-news'));
    await page.goto(base + '&newsScenario=read-error');
    await page.getByRole('button', { name: 'Действия с новостями' }).click();
    await page.getByText('Отметить все как прочитанные', { exact: true }).click();
    await page.getByRole('alert').waitFor();
    assert.ok(await cards().first().getByText('Новая', { exact: true }).count());
    await page.getByRole('alert').getByRole('button', { name: 'Повторить' }).click();
    await page.getByRole('alert').waitFor({ state: 'hidden' });
    assert.equal(await page.getByText('Новая', { exact: true }).count(), 0);
    await page.goto(base + '&newsScenario=all-read');
    await cards().first().waitFor();
    assert.equal(await page.getByText('Новая', { exact: true }).count(), 0);
    await page.goto(base + '&newsScenario=no-cover&intent=article:' + article);
    await page.locator('.news-article-cover').waitFor();
    assert.ok(await page.locator('.news-article-cover').evaluate(img => img.complete && img.naturalWidth > 0));
    await noOverflow();
    await page.goto(base + '&newsScenario=russian-only&intent=article:' + article);
    await page.getByText('Новость пока доступна только на русском языке').waitFor();
    await noOverflow();
  }
  assert.deepEqual(errors, []);
  console.log(
    'PASS: news feed, pagination, category, search, read persistence, detail/back, empty and missing article, loading/errors/retries, read and fallback states, 1440/375 overflow',
  );
} finally {
  await browser.close();
}
