// Рендерит обложки-мокапы (браузер / телефоны) из скриншотов в build/.cache → build/.cache/mock/*.png
// Скриншоты СМАИЛ снимаются capture-smile.js, макеты YUMA выгружены из Figma.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const C = path.join(__dirname, '.cache');
const OUT = path.join(C, 'mock');
fs.mkdirSync(OUT, { recursive: true });
const u = (p) => 'file:///' + path.join(C, p).replace(/\\/g, '/');

const FONT = `@font-face{font-family:Inter;src:url(${'file:///' + path.join(__dirname, '../docs/assets/fonts/inter-latin.woff2').replace(/\\/g, '/')})}`;

const base = (w, h, body, css = '') => `<!doctype html><html><head><style>
${FONT}
*{box-sizing:border-box;margin:0}
html,body{width:${w}px;height:${h}px;overflow:hidden;font-family:Inter,sans-serif}
.browser{position:absolute;border-radius:14px;overflow:hidden;background:#fff;box-shadow:0 40px 80px -30px rgba(20,20,10,.35),0 0 0 1px rgba(0,0,0,.06)}
.browser .bar{height:34px;background:#f3f2ef;display:flex;align-items:center;gap:7px;padding:0 14px;border-bottom:1px solid rgba(0,0,0,.06)}
.browser .bar i{width:10px;height:10px;border-radius:50%;background:#d9d6cf}
.browser .bar b{margin-left:18px;height:18px;flex:0 0 38%;border-radius:6px;background:#e6e4de}
.browser img{display:block;width:100%}
.phone{position:absolute;border-radius:46px;background:#111;padding:10px;box-shadow:0 40px 80px -30px rgba(20,20,10,.45)}
.phone .scr{border-radius:37px;overflow:hidden;position:relative;background:#fff}
.phone .scr img{display:block;width:100%}
.phone .scr:after{content:"";position:absolute;top:10px;left:50%;transform:translateX(-50%);width:30%;height:22px;border-radius:12px;background:#111}
${css}</style></head><body>${body}</body></html>`;

const phone = (img, x, y, w, extra = '') =>
  `<div class="phone" style="left:${x}px;top:${y}px;width:${w}px;${extra}"><div class="scr" style="aspect-ratio:390/844"><img src="${u(img)}" style="height:100%;object-fit:cover;object-position:top"></div></div>`;
const browser = (img, x, y, w, h, extra = '') =>
  `<div class="browser" style="left:${x}px;top:${y}px;width:${w}px;${extra}"><div class="bar"><i></i><i></i><i></i><b></b></div><div style="height:${h}px;overflow:hidden"><img src="${u(img)}"></div></div>`;

const scenes = {
  // СМАИЛ — обложка: десктоп + два телефона
  'smile-cover': [1600, 1000, base(1600, 1000,
    `<div style="position:absolute;inset:0;background:radial-gradient(120% 90% at 85% 100%,#cfe07a 0%,#e4ebc4 45%,#efeee6 100%)"></div>
     ${browser('smile/d_hero_viewport.png', 70, 110, 1120, 700)}
     ${phone('smile_m/mob_05.png', 1290, 130, 240, 'transform:rotate(5deg)')}
     ${phone('smile_m/mob_00.png', 1110, 270, 270)}`)],
  // СМАИЛ — мобильная версия, ряд телефонов
  'smile-phones': [1600, 900, base(1600, 900,
    `<div style="position:absolute;inset:0;background:#1f1d17"></div>
     <div style="position:absolute;left:-10%;right:-10%;bottom:-40%;height:80%;background:radial-gradient(closest-side,rgba(200,227,91,.35),transparent)"></div>
     ${phone('smile_m/mob_00.png', 70, 150, 270)}
     ${phone('smile_m/mob_03.png', 370, 90, 270)}
     ${phone('smile_m/mob_08.png', 670, 30, 270)}
     ${phone('smile_m/mob_14.png', 970, 90, 270)}
     ${phone('smile_m/mob_15.png', 1270, 150, 270)}`)],
  // YUMA — обложка: две страницы после редизайна
  'yuma-cover': [1600, 1000, base(1600, 1000,
    `<div style="position:absolute;inset:0;background:radial-gradient(110% 90% at 10% 0%,#fef9da 0%,#fdf2af 55%,#fbe56a 100%)"></div>
     ${browser('yuma/after_reports.png', 520, 70, 1000, 640)}
     ${browser('yuma/after_menu.png', 80, 300, 960, 615)}`)],
  // YUMA — модальное окно поверх страницы
  'yuma-shop': [1600, 1000, base(1600, 1000,
    `<div style="position:absolute;inset:0;background:#edeff1"></div>
     ${browser('yuma/after_shop.png', 140, 90, 1320, 742)}`)],
  // Studyspace — телефоны
  'ss-phones': [1600, 900, base(1600, 900,
    `<div style="position:absolute;inset:0;background:linear-gradient(160deg,#e9eef0,#efe9f3)"></div>`)],
};

(async () => {
  const b = await chromium.launch();
  const only = process.argv.slice(2);
  for (const [name, [w, h, html]] of Object.entries(scenes)) {
    if (only.length && !only.includes(name)) continue;
    if (name === 'ss-phones') continue;
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    const f = path.join(OUT, name + '.html');
    fs.writeFileSync(f, html);
    await p.goto('file:///' + f.replace(/\\/g, '/'));
    await p.waitForTimeout(400);
    await p.screenshot({ path: path.join(OUT, name + '.png') });
    await p.close();
    console.log('mock', name);
  }
  await b.close();
})();
