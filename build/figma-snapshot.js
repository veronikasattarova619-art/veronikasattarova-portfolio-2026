// Готовит самодостаточные HTML-снимки страниц (ширина 1440) для импорта в Figma как редактируемые слои.
// node figma-snapshot.js [page.html ...]  → .cache/figma/<page>.html
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const DOCS = path.join(__dirname, '..', 'docs');
const OUT = path.join(__dirname, '.cache', 'figma');
fs.mkdirSync(OUT, { recursive: true });
const W = 1440, H = 900;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp4': 'video/mp4' };
const PREFIX = '/veronikasattarova-portfolio-2026';
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.startsWith(PREFIX)) p = p.slice(PREFIX.length);
  const f = path.join(DOCS, p);
  fs.readFile(f, (err, data) => {
    if (err) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
    res.end(data);
  });
});

// фиксируем вьюпорт-единицы, убираем мобильные медиа-запросы и шрифтовые @font-face (Inter есть в Figma)
function freezeCss(css) {
  css = css.replace(/@font-face\s*{[^}]*}/g, '');
  // вырезаем блоки @media (max-width…) и (prefers-reduced-motion) целиком
  let out = '', i = 0;
  while (i < css.length) {
    const m = css.slice(i).match(/@media[^{]*\((max-width|prefers-reduced-motion)[^{]*{/);
    if (!m) { out += css.slice(i); break; }
    const start = i + m.index;
    out += css.slice(i, start);
    let depth = 0, j = start + m[0].length - 1;
    for (; j < css.length; j++) { if (css[j] === '{') depth++; else if (css[j] === '}') { depth--; if (depth === 0) break; } }
    i = j + 1;
  }
  return freezeUnits(out);
}
const freezeUnits = (s) => s
  .replace(/(-?\d*\.?\d+)vw/g, (_, n) => (parseFloat(n) * W / 100).toFixed(2) + 'px')
  .replace(/(-?\d*\.?\d+)s?vh/g, (_, n) => (parseFloat(n) * H / 100).toFixed(2) + 'px');

(async () => {
  const pages = process.argv.slice(2).length ? process.argv.slice(2) : ['index.html', 'yumapos.html', 'kvas.html', 'tsenny-put.html', 'smile.html', 'studyspace.html', 'price.html'];
  await new Promise((r) => server.listen(4174, r));
  const css = freezeCss(fs.readFileSync(path.join(DOCS, 'assets/css/style.css'), 'utf8')) + `
/* снимок для Figma */
html,body{width:${W}px;min-width:${W}px}
body::before{display:none!important}
.header{position:absolute!important;transform:none!important;background:transparent!important;backdrop-filter:none!important}
.hero{min-height:${H}px}
`;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  for (const pg of pages) {
    await p.goto(`http://localhost:4174${PREFIX}/${pg}`, { waitUntil: 'networkidle' });
    const h = await p.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < h; y += 600) { await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(40); }
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.waitForLoadState('networkidle');
    const html = await p.evaluate(async (css) => {
      const d = document;
      d.documentElement.className = '';
      d.querySelectorAll('script, .page-fade, .grid-overlay, .menu, .cursor-preview, .skip, .works-list, .hero__scroll, link, .ba input, .ba__handle').forEach((e) => e.remove());
      d.querySelectorAll('.menu-btn').forEach((e) => e.remove());
      d.querySelectorAll('[data-reveal]').forEach((e) => { e.removeAttribute('data-reveal'); e.style.removeProperty('--d'); });
      d.querySelectorAll('.hero__photo img').forEach((e) => (e.style.transform = ''));
      d.querySelectorAll('.pills .pill').forEach((e, i) => e.classList.toggle('is-active', i === 2));
      // слайдеры до/после → две отдельные картинки с подписями
      d.querySelectorAll('.ba').forEach((ba) => {
        const before = ba.querySelector('.ba__before img'), after = ba.querySelector('.ba__after img');
        const wrap = d.createElement('div');
        wrap.style.cssText = 'display:grid;gap:28px';
        for (const [img, label, cls] of [[before, 'До', 'pair-label t-label'], [after, 'После', 'pair-label pair-label--after t-label']]) {
          const box = d.createElement('div');
          const l = d.createElement('span'); l.className = cls; l.textContent = label;
          const m = d.createElement('div'); m.className = 'fig__media'; m.style.cssText = 'border-radius:6px;background:#f4f4f4';
          img.style.cssText = 'width:100%;height:auto;display:block'; m.appendChild(img);
          box.append(l, m); wrap.appendChild(box);
        }
        ba.replaceWith(wrap);
      });
      // псевдоэлементы с содержимым → настоящие span (Figma их не видит)
      const props = ['display', 'position', 'left', 'top', 'right', 'bottom', 'width', 'height', 'background-color', 'border-radius', 'color', 'font-size', 'font-weight', 'letter-spacing', 'line-height', 'margin-left', 'margin-right', 'opacity', 'font-variant-numeric', 'vertical-align'];
      const idx = new Map();
      for (const el of d.querySelectorAll('body *')) {
        for (const ps of ['::before', '::after']) {
          const cs = getComputedStyle(el, ps);
          const c = cs.content;
          if (!c || c === 'none' || c === 'normal') continue;
          let text;
          if (c.includes('counter(')) {
            const list = el.parentElement; if (!idx.has(list)) idx.set(list, 0);
            const n = idx.get(list) + 1; idx.set(list, n); text = String(n).padStart(2, '0');
          } else if (/^".*"$/.test(c)) text = JSON.parse(c);
          else continue;
          if (cs.display === 'none' || parseFloat(cs.opacity) === 0) { el.dataset.pm = '1'; continue; }
          const s = d.createElement('span');
          s.textContent = text;
          s.style.cssText = props.map((p) => `${p}:${cs.getPropertyValue(p)}`).join(';');
          if (cs.display === 'inline') s.style.display = 'inline';
          ps === '::before' ? el.prepend(s) : el.append(s);
          el.dataset.pm = '1';
        }
      }
      const pm = d.createElement('style'); pm.textContent = '[data-pm]::before,[data-pm]::after{content:none!important;display:none!important}'; d.head.appendChild(pm);
      // видео → постер
      d.querySelectorAll('video').forEach((v) => { const i = d.createElement('img'); i.src = v.poster; i.width = v.width; i.height = v.height; i.alt = v.getAttribute('aria-label') || ''; i.style.width = '100%'; v.replaceWith(i); });
      const toData = async (url) => { const r = await fetch(url); const bl = await r.blob(); return await new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(bl); }); };
      for (const img of d.querySelectorAll('img')) {
        const src = img.currentSrc || img.src;
        img.removeAttribute('srcset'); img.removeAttribute('sizes'); img.removeAttribute('loading'); img.removeAttribute('fetchpriority'); img.removeAttribute('decoding');
        try { img.src = await toData(src); } catch (e) {}
      }
      const st = d.createElement('style'); st.textContent = css; d.head.appendChild(st);
      return '<!doctype html>\n' + d.documentElement.outerHTML;
    }, css);
    const final0 = html.replace(/Потяните ползунок,[\s ]*чтобы сравнить[\s ]*экраны\./g, 'Экраны до и после редизайна.');
    const final = final0.replace(/style="([^"]*)"/g, (m, s) => `style="${s.replace(/(-?\d*\.?\d+)vw/g, (_, n) => (parseFloat(n) * W / 100).toFixed(2) + 'px')}"`);
    const f = path.join(OUT, pg);
    fs.writeFileSync(f, final);
    console.log(pg, (final.length / 1e6).toFixed(1) + 'MB');
  }
  await b.close();
  server.close();
})();
