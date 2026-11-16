const { chromium } = require('playwright');
const out = process.argv[2];
(async () => {
  const b = await chromium.launch();
  for (const [name, vp, dpr, mobile] of [['d',{width:1440,height:900},2,false],['m',{width:390,height:844},3,true]]) {
    const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: dpr, isMobile: mobile, hasTouch: mobile, locale:'ru-RU' });
    const p = await ctx.newPage();
    await p.goto('https://smile-digital.ru/', { waitUntil: 'networkidle', timeout: 90000 });
    let h = await p.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < h; y += 300) { await p.evaluate(y => window.scrollTo(0, y), y); await p.waitForTimeout(200); }
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(1500);
    await p.screenshot({ path: `${out}/${name}_hero_viewport.png` });
    await p.evaluate(() => { for (const e of document.querySelectorAll('body *')) { const s = getComputedStyle(e); if (s.position === 'fixed' || s.position === 'sticky') e.style.setProperty('visibility','hidden','important'); } });
    const hs = await p.$$('.t-rec');
    for (const [k,el] of hs.entries()) {
      const bb = await el.boundingBox(); if (!bb || bb.height < 40) continue;
      console.log(name, k, Math.round(bb.height));
      await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
      await el.screenshot({ path: `${out}/${name}_${String(k).padStart(2,'0')}.png` });
    }
    await ctx.close();
  }
  await b.close();
})();
