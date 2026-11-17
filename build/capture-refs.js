// Снимает референсные сайты целиком: node capture-refs.js name=url ...
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, '.cache', 'refs');
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch();
  for (const arg of process.argv.slice(2)) {
    const [name, url] = arg.split(/=(.+)/);
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    try {
      await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    } catch (e) { console.log(name, 'goto', e.message.split('\n')[0]); }
    const h = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 400) { await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(150); }
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(1500);
    await p.screenshot({ path: path.join(OUT, name + '_first.png') });
    await p.screenshot({ path: path.join(OUT, name + '_full.png'), fullPage: true });
    // структура: заголовки, ссылки навигации, тексты блоков
    const info = await p.evaluate(() => {
      const t = (s) => s.replace(/\s+/g, ' ').trim();
      const links = [...document.querySelectorAll('a')].map((a) => t(a.innerText)).filter((x) => x && x.length < 40);
      const text = t(document.body.innerText).slice(0, 2500);
      return { title: document.title, h: document.documentElement.scrollHeight, links: [...new Set(links)].slice(0, 40), text };
    });
    fs.writeFileSync(path.join(OUT, name + '.json'), JSON.stringify(info, null, 1));
    console.log(name, info.h, info.title);
    await p.close();
  }
  await b.close();
})();
