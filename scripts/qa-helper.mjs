/**
 * Shared puppeteer helper for QA agents.
 * Usage:
 *   import { browse, login, screenshot } from '../scripts/qa-helper.mjs';
 *   const { browser, page } = await browse();
 *   await login(page, 'admin@arabicwordroot.com', 'AdminDev2026!');
 *   await screenshot(page, 'dashboard', '01-auth');
 */
import puppeteer from 'puppeteer-core';

const BASE_URL = 'http://localhost:4180';
const SCREENSHOT_DIR = '/home/mboukhatem/root-arb/qa-output/screenshots';

export async function browse({ viewport = { width: 1440, height: 900 } } = {}) {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setViewport(viewport);

  // Capture console errors for reporting
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(`UNCAUGHT: ${err.message}`));

  return { browser, page, BASE_URL, consoleErrors };
}

export async function go(page, path) {
  await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle0', timeout: 30000 });
}

export async function screenshot(page, name, prefix = '') {
  const path = `${SCREENSHOT_DIR}/${prefix ? prefix + '-' : ''}${name}.png`;
  await page.screenshot({ path, fullPage: true });
  return path;
}

export async function login(page, email = 'admin@arabicwordroot.com', password = 'AdminDev2026!') {
  await go(page, '/login');
  await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
  await page.type('input[type="email"], input[name="email"]', email);
  await page.type('input[type="password"], input[name="password"]', password);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => null),
    page.click('button[type="submit"]'),
  ]);
  // give TanStack a tick to settle
  await new Promise((r) => setTimeout(r, 500));
}

export async function getText(page, selector) {
  return page.$eval(selector, (el) => el.textContent?.trim() ?? '');
}

export async function exists(page, selector) {
  return (await page.$(selector)) !== null;
}
