// Локальный предпросмотр: поднимает статический сервер для ../docs и снимает скриншоты страниц.
// node preview.js [page.html ...] [--mobile] [--full]
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const DOCS = path.join(__dirname, '..', 'docs');
const OUT = path.join(__dirname, '.cache', 'preview');
fs.mkdirSync(OUT, { recursive: true });
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.xml': 'application/xml', '.txt': 'text/plain' };
const PREFIX = '/veronikasattarova-portfolio-2026';

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.startsWith(PREFIX)) p = p.slice(PREFIX.length);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(DOCS, p);
  fs.readFile(f, (err, data) => {
    if (err) { res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' }); res.end(fs.readFileSync(path.join(DOCS, '404.html'))); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
    res.end(data);
  });
});

(async () => {
  const args = process.argv.slice(2);
  const mobile = args.includes('--mobile');
  const full = args.includes('--full');
  const pages = args.filter((a) => !a.startsWith('--'));
  await new Promise((r) => server.listen(4173, r));
  const b = await chromium.launch();
  const ctx = await b.newContext(mobile ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errors = [];
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  p.on('pageerror', (e) => errors.push(String(e)));
  p.on('requestfailed', (r) => errors.push('FAILED ' + r.url()));
  p.on('response', (r) => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
  for (const pg of pages.length ? pages : ['index.html']) {
    await p.goto(`http://localhost:4173${PREFIX}/${pg}`, { waitUntil: 'networkidle' });
    if (full) {
      // прокрутить, чтобы сработали появления и ленивые картинки
      const h = await p.evaluate(() => document.body.scrollHeight);
      for (let y = 0; y < h; y += 500) { await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(60); }
      await p.evaluate(() => { document.querySelectorAll('[data-reveal]').forEach((e) => e.classList.add('is-in')); window.scrollTo(0, 0); });
      await p.waitForTimeout(1500);
    } else await p.waitForTimeout(1600);
    if (process.env.ACT) { await p.evaluate(process.env.ACT); await p.waitForTimeout(1200); }
    const name = pg.replace(/[^\w.-]/g, '_').replace('.html', '') + (mobile ? '_m' : '') + (full ? '_full' : '');
    await p.screenshot({ path: path.join(OUT, name + '.png'), fullPage: full });
    console.log('shot', name);
  }
  if (errors.length) console.log('ERRORS:\n' + [...new Set(errors)].join('\n'));
  await b.close();
  server.close();
})();
