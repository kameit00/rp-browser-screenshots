import { test, expect, type TestInfo } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import urls, { type UrlEntry } from '../urls.config';

const BASE_URL = (process.env.BASE_URL || '').replace(/\/$/, '');
const MODE = process.env.MODE || 'capture'; // 'capture' | 'compare'

function resolve(entry: UrlEntry) {
  const isObj = typeof entry === 'object' && entry !== null;
  const urlPath = (isObj ? entry.path : (entry as string)).trim();
  const fullPage = isObj ? entry.fullPage !== false : true;
  const fullUrl = /^https?:\/\//i.test(urlPath) ? urlPath : `${BASE_URL}${urlPath}`;
  const label =
    (isObj && entry.label) ||
    urlPath
      .replace(/^https?:\/\//i, '')
      .replace(/[/?#=&]+/g, '-')
      .replace(/[^a-z0-9._-]+/gi, '')
      .replace(/^-+|-+$/g, '') ||
    'index';
  return { urlPath, fullPage, fullUrl, label };
}

function outFile(testInfo: TestInfo, label: string) {
  const os = process.env.RUNNER_OS || process.platform;
  const dir = path.join('screenshots', String(os), testInfo.project.name);
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, `${label}.png`);
}

for (const entry of urls) {
  const { urlPath, fullPage, fullUrl, label } = resolve(entry);

  test(`screenshot ${urlPath}`, async ({ page }, testInfo) => {
    test.skip(
      !fullUrl,
      'No BASE_URL set and entry is not absolute. Export BASE_URL (e.g. https://shop.example.com).',
    );

    await page.goto(fullUrl, { waitUntil: 'domcontentloaded' });
    // Best-effort wait for lazy-loaded content / shop widgets to settle.
    await page
      .waitForLoadState('networkidle', { timeout: 15000 })
      .catch(() => {});

    const dest = outFile(testInfo, label);

    if (MODE === 'compare') {
      // Compare against committed baseline. Seed with: npm run update-snapshots
      await expect(page).toHaveScreenshot([`${label}.png`], {
        fullPage,
        maxDiffPixelRatio: 0.01,
      });
    }

    // Always also write a plain PNG to ./screenshots/<os>/<browser>/<label>.png
    const buffer = await page.screenshot({ fullPage });
    fs.writeFileSync(dest, buffer);
    await testInfo.attach(`${label}.png`, {
      body: buffer,
      contentType: 'image/png',
    });
  });
}
