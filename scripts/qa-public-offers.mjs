import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base = new URL(process.env.TEST_URL || 'http://127.0.0.1:5174/');
const browser = await chromium.launch({ channel: 'chrome' });
try {
  for (const width of [1440, 390]) {
    const member = await browser.newContext({ viewport: { width, height: 900 }, permissions: ['clipboard-read','clipboard-write'] });
    const page = await member.newPage();
    await page.goto(new URL('?tab=cabinet&page=offers&intent=offer:expert-week', base).href);
    await page.getByRole('button', { name: 'Поделиться', exact: true }).click();
    await page.getByRole('status').getByText('Ссылка скопирована', { exact: true }).waitFor();
    const copied = new URL(await page.evaluate(() => navigator.clipboard.readText()));
    assert.equal(copied.pathname, base.pathname);
    assert.deepEqual(Object.fromEntries(copied.searchParams), { offer: 'expert-week', lang: 'ru', ref: 'VR-100024' });
    await page.goto(new URL('?tab=cabinet&page=offers&intent=offer:partner-start', base).href);
    await page.getByRole('heading', { name: 'Материалы для старта' }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Поделиться' }).count(), 0);
    await member.close();

    const guest = await browser.newContext({ viewport: { width, height: 900 } });
    const landing = await guest.newPage();
    const errors = [];
    landing.on('pageerror', err => errors.push(err.message));
    await landing.goto(copied.href);
    const heading = name => landing.getByRole('heading', { name, exact: true });
    await heading('Неделя Expert').waitFor();
    assert.equal(await landing.locator('.lab-settings,.cabinet,.offers-toolbar').count(), 0);
    assert.equal(await landing.locator('.offers-cover-image').evaluate(img => img.decode().then(() => img.naturalWidth > 0)), true);
    for (const lang of ['ru', 'en']) {
      if (lang === 'en') await landing.getByRole('link', { name: 'EN', exact: true }).click();
      await heading(lang === 'en' ? 'Expert Week' : 'Неделя Expert').waitFor();
      const cta = new URL(await landing.locator('.offer-primary-action').getAttribute('href'));
      assert.equal(cta.pathname, base.pathname);
      assert.equal(cta.searchParams.get('ref'), 'VR-100024');
      assert.equal(cta.searchParams.get('product'), 'expert');
      const file = landing.locator('a[download]');
      const download = await landing.request.get(new URL(await file.getAttribute('href'), landing.url()).href);
      assert.ok(download.ok());
      const content = await download.body();
      assert.match(content.toString(), lang === 'en' ? /One bundle per partner/ : /одним комплектом на партнёра/);
      assert.ok((await file.innerText()).includes(String(content.byteLength)));
      assert.ok(await landing.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      assert.equal(await landing.locator('html').getAttribute('lang'), lang);
    }
    await landing.locator('.offer-primary-action').click();
    await heading('Expert').waitFor();
    assert.equal(new URL(landing.url()).searchParams.get('ref'), 'VR-100024');
    await landing.goto(new URL('?offer=water-week&lang=en', base).href);
    await heading('Water Week').waitFor();
    await landing.getByText('This offer has ended').waitFor();
    assert.equal(await landing.locator('.offer-terms,.offer-primary-action').count(), 0);
    for (const id of ['partner-start', 'unknown']) {
      await landing.goto(new URL('?offer=' + id, base).href);
      await heading('Акция не найдена').waitFor();
      assert.equal(await landing.locator('.cabinet,.offer-primary-action,a[download]').count(), 0);
    }
    assert.deepEqual(errors, []);
    await guest.close();
    console.log('PASS', width, 'copy, incognito, localized attachment and CTA, archived, private and missing');
  }
} finally { await browser.close(); }
