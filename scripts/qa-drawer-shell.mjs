import {chromium} from 'playwright';
import assert from 'node:assert/strict';

const base = process.env.TEST_URL || 'http://127.0.0.1:5187/';
const browser = await chromium.launch({channel: 'chrome'});
try {
  for (const [width, inset] of [[390, '24px'], [1440, '32px']]) {
    const page = await browser.newPage({viewport: {width, height: 900}, reducedMotion: 'reduce'});
    await page.goto(new URL('?tab=cabinet&page=overview&member=partner', base).href);
    for (const [trigger, title] of [
      ['Пригласить партнёра', 'Пригласить партнёра'],
      ['Подробнее о ранге', 'Все награды'],
    ]) {
      await page.getByRole('button', {name: trigger, exact: true}).click();
      const panel = page.getByRole('dialog', {name: title, exact: true});
      await panel.waitFor();
      const bounds = await panel.boundingBox();
      assert.ok(Math.abs(width - bounds.x - bounds.width) < 2);
      for (const part of ['.participant-heading', '.participant-scroll']) {
        assert.equal(await panel.locator(part).evaluate(el => getComputedStyle(el).paddingInlineStart), inset);
      }
      assert.equal(await panel.getByRole('navigation').count(), 0);
      if (title === 'Все награды') assert.equal(await panel.locator('.drawer-section').count(), 2);
      await page.keyboard.press('Escape');
      await panel.waitFor({state: 'hidden'});
    }
    await page.goto(new URL('?lab=1&tab=components', base).href);
    await page.getByRole('button', {name: /Virena \/ Drawer/}).click();
    await page.getByRole('button', {name: 'Открыть боковую панель'}).click();
    await page.getByRole('dialog', {name: 'Анна Морозова'}).waitFor();
    await page.close();
    console.log(width, 'overview and catalog drawers passed');
  }
} finally {
  await browser.close();
}
