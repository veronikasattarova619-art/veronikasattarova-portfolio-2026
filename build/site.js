// Генерирует HTML-страницы в ../docs из контента ниже. Запуск: node site.js
const fs = require('fs');
const path = require('path');

const DOCS = path.join(__dirname, '..', 'docs');
const M = JSON.parse(fs.readFileSync(path.join(__dirname, 'manifest.json'), 'utf8'));
const SITE = 'https://veronikasattarova619-art.github.io/veronikasattarova-portfolio-2026/';
const TG = 'https://t.me/veronikactrlz';
const BEHANCE = 'https://www.behance.net/veronikasa8b43';
const DPROFILE = 'https://dprofile.ru/veronika';
const V = Date.now().toString(36); // сброс кеша css/js

/* ---------------- помощники ---------------- */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const nb = (s) => s.replace(/ (в|и|с|к|о|у|а|на|по|за|из|от|до|не|для|без|при|про|что|как|или|под|над|это|все) /gi, (m, w) => ` ${w} `);

const SIZES = {
  full: '(max-width: 900px) 100vw, 92vw',
  wide: '(max-width: 900px) 100vw, 75vw',
  half: '(max-width: 900px) 100vw, 48vw',
  third: '(max-width: 560px) 100vw, (max-width: 900px) 50vw, 32vw',
  quarter: '(max-width: 560px) 100vw, (max-width: 900px) 50vw, 24vw',
};
const colSize = { 'c-12': 'full', 'c-10': 'wide', 'c-9': 'wide', 'c-8': 'wide', 'c-8r': 'wide', 'c-8c': 'wide', 'c-7': 'half', 'c-6': 'half', 'c-6r': 'half', 'c-6c': 'half', 'c-5': 'half', 'c-4': 'third', 'c-4r': 'third', 'c-3': 'quarter' };

function img(key, o = {}) {
  const m = M[key];
  if (!m) throw new Error('no image ' + key);
  const alt = esc(o.alt || '');
  const lazy = o.eager ? 'fetchpriority="high"' : 'loading="lazy"';
  const cls = o.cls ? ` class="${o.cls}"` : '';
  const style = o.style ? ` style="${o.style}"` : '';
  if (m.anim) return `<img src="assets/img/${m.src}" width="${m.w}" height="${m.h}" alt="${alt}" ${lazy} decoding="async"${cls}${style}>`;
  const last = m.set[m.set.length - 1];
  const w = last[1], h = Math.round(m.h * last[1] / m.w);
  const srcset = m.set.map(([f, sw]) => `assets/img/${f} ${sw}w`).join(', ');
  const src = m.set[0][0];
  return `<img src="assets/img/${src}" srcset="${srcset}" sizes="${o.sizes || SIZES.full}" width="${w}" height="${h}" alt="${alt}" ${lazy} decoding="async"${cls}${style}>`;
}
const ratio = (key) => { const m = M[key]; return m.anim ? `${m.w} / ${m.h}` : `${m.w} / ${m.h}`; };

// фигура с подписью-индексом
function fig(key, o = {}) {
  const col = o.col || 'c-12';
  const sizes = SIZES[colSize[col] || 'full'];
  let media = img(key, { alt: o.alt || o.cap || '', sizes });
  if (o.browser) media = `<div class="browser"><div class="browser__bar"><i></i><i></i><i></i><span>${esc(o.browser)}</span></div>${media}</div>`;
  const mcls = ['fig__media', o.frame ? 'fig__media--frame' : '', o.dark ? 'fig__media--dark' : ''].filter(Boolean).join(' ');
  const cap = o.cap ? `<figcaption><span class="n">${o.n || ''}</span><span>${nb(o.cap)}</span></figcaption>` : '';
  return `<figure class="fig ${col}${o.cls ? ' ' + o.cls : ''}" data-reveal${o.d ? ` style="--d:${o.d}s"` : ''}><div class="${mcls}" data-reveal="img">${media}</div>${cap}</figure>`;
}
const figs = (...items) => `<div class="grid figs">${items.join('')}</div>`;

// слайдер до/после
function ba(before, after, o = {}) {
  const sizes = SIZES.full;
  return `<figure class="fig ${o.col || 'c-12'}" data-reveal>
  <div class="ba" style="aspect-ratio:${ratio(after)}">
    <div class="ba__after">${img(after, { alt: 'После: ' + (o.alt || ''), sizes })}</div>
    <div class="ba__before">${img(before, { alt: 'До: ' + (o.alt || ''), sizes })}</div>
    <div class="ba__handle" aria-hidden="true"></div>
    <span class="ba__tag ba__tag--l">До</span><span class="ba__tag ba__tag--r">После</span>
    <input type="range" min="0" max="100" value="50" aria-label="Сравнить до и после: ${esc(o.alt || '')}">
  </div>
  ${o.cap ? `<figcaption><span class="n">${o.n || ''}</span><span>${nb(o.cap)}</span></figcaption>` : ''}
</figure>`;
}

// смысловой блок кейса: ярлык слева, текст справа
function block(n, label, body, o = {}) {
  return `<section class="block wrap${o.night ? ' night block--night' : ''}"${o.id ? ` id="${o.id}"` : ''}${o.night ? ' style="padding-bottom:clamp(70px,10vw,150px);margin-top:clamp(70px,10vw,150px)"' : ''}>
  <div class="grid">
    <div class="block__label" data-reveal><div class="t-label"><span class="muted">${n}</span><span>${label}</span></div></div>
    <div class="block__body" data-reveal>${body}</div>
  </div>
  ${o.after || ''}
</section>`;
}
const bullets = (arr) => `<ol class="bullets">${arr.map((x) => `<li>${nb(x)}</li>`).join('')}</ol>`;
const P = (s) => `<p>${nb(s)}</p>`;
const LEAD = (s) => `<p class="lead">${nb(s)}</p>`;

/* ---------------- работы ---------------- */
const WORKS = [
  { slug: 'yumapos', n: '01', title: 'YUMA Back Office', short: 'Редизайн бэк-офиса и дизайн-система', year: '2025', tags: ['UI', 'Дизайн-система', 'In-house'], cover: 'yuma/cover', list: 'yuma/cover',
    desc: 'Новый визуальный язык бэк-офиса для ресторанов: компоненты, состояния, семантическая палитра и гайды.' },
  { slug: 'kvas', n: '02', title: 'HT Reviews Drinks Collection', short: 'Упаковка кваса и имиджевая кампания', year: 'Концепт', tags: ['Упаковка', 'Иллюстрация', 'Нейросети'], cover: 'kvas/hand-can', list: 'kvas/feast',
    desc: 'Четыре вкуса кваса стали рыцарями «Великого турнира вкусов»: банки, герои и серия сцен.' },
  { slug: 'tsenny-put', n: '03', title: '«Ценный путь»', short: 'Настольная бизнес-игра для Ленстройтреста', year: '2024', tags: ['Настольная игра', 'Полиграфия'], cover: 'tsenny/card-photo-decency', list: 'tsenny/box',
    desc: 'Игровое поле с картой Петербурга, 150+ карточек, правила и коробка — всё подготовлено к печати.' },
  { slug: 'smile', n: '04', title: 'СМАИЛ', short: 'Сайт digital-агентства для HoReCa', year: '2025', tags: ['Веб-дизайн', 'Tilda', 'Генерация'], cover: 'smile/cover', list: 'smile/cover',
    desc: 'Одностраничный сайт нового бренда: от метафоры «улыбки» до вёрстки в Zero Block.' },
  { slug: 'studyspace', n: '05', title: 'Studyspace', short: 'Персональный планер обучения', year: 'Пет-проект', tags: ['Продукт', 'UX/UI', 'Vercel + Supabase'], cover: 'studyspace/cover', list: 'studyspace/cover',
    desc: 'Собирает курсы из YouTube, Яндекс Диска и VK Видео в одну спокойную очередь уроков.' },
];

/* ---------------- каркас ---------------- */
function layout({ file, title, description, body, current, ogImage, night }) {
  const nav = [
    ['index.html#work', 'Работы', '05', current === 'work'],
    ['index.html#about', 'Обо мне', '', current === 'about'],
    ['price.html', 'Стоимость', '', current === 'price'],
  ];
  const og = ogImage ? SITE + 'assets/img/' + M[ogImage].set[M[ogImage].set.length - 1][0] : SITE + 'assets/img/' + M['yuma/cover'].set[0][0];
  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#e9e7e2">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${og}">
<meta property="og:url" content="${SITE}${file === 'index.html' ? '' : file}">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="${SITE}${file === 'index.html' ? '' : file}">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="preload" href="assets/fonts/inter-cyrillic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/css/style.css?v=${V}">
<script>(function(d){var c='js';if(!('onpagereveal' in window))c+=' no-vt is-entering';try{if(localStorage.getItem('grid')==='1')c+=' grid-on'}catch(e){}d.className=c})(document.documentElement)</script>
<script src="assets/js/main.js?v=${V}" defer></script>
</head>
<body>
<a class="skip" href="#main">К содержанию</a>
<div class="page-fade" aria-hidden="true"></div>
<div class="grid-overlay" aria-hidden="true"><div class="grid">${'<span></span>'.repeat(12)}</div></div>

<header class="header">
  <div class="wrap grid">
    <a class="header__name" href="index.html" aria-label="Вероника Саттарова — на главную"><b>Вероника Саттарова</b><span>дизайнер</span></a>
    <nav class="header__nav" aria-label="Основная навигация">
      ${nav.map(([h, t, s, cur]) => `<a href="${h}"${cur ? ' aria-current="page"' : ''}>${t}${s ? `<sup>${s}</sup>` : ''}</a>`).join('\n      ')}
    </nav>
    <div class="header__cta">
      <span class="status"><i></i><span>Открыта к проектам</span></span>
      <a class="btn" href="${TG}" target="_blank" rel="noopener">Написать <span class="arrow">↗</span></a>
      <button class="menu-btn" type="button" data-menu-open aria-expanded="false" aria-controls="menu">Меню</button>
    </div>
  </div>
</header>

<div class="menu" id="menu" aria-hidden="true" role="dialog" aria-label="Меню">
  <div class="menu__side">
    <a href="${DPROFILE}" target="_blank" rel="noopener">Dprofile ↗</a>
    <a href="${BEHANCE}" target="_blank" rel="noopener">Behance ↗</a>
    <a href="${TG}" target="_blank" rel="noopener">Telegram ↗</a>
  </div>
  <div class="menu__main">
    <ul class="menu__list">
      <li><a href="index.html">Главная<span class="sup">01</span></a></li>
      <li><a href="index.html#work">Работы<span class="sup">02</span></a></li>
      <li><a href="index.html#about">Обо мне<span class="sup">03</span></a></li>
      <li><a href="price.html"${current === 'price' ? ' aria-current="page"' : ''}>Стоимость<span class="sup">04</span></a></li>
    </ul>
    <p class="t-label muted" style="margin-top:32px"><span class="status"><i></i>Открыта к проектам</span></p>
  </div>
  <button class="menu__close" type="button" data-menu-close>Закрыть</button>
</div>

<main id="main">
${body}
</main>

${footer()}
</body>
</html>
`;
}

function footer() {
  return `<footer class="footer night" id="contact">
  <div class="wrap">
    <div class="section-label t-label" data-reveal><span class="muted">[04]</span><span>Контакты</span><span class="muted">Ответ — в течение дня</span></div>
    <p class="t-l" data-reveal style="max-width:20ch;color:var(--on-night-2)">${nb('Есть задача — сайт, презентация, упаковка или интерфейс? Расскажите о ней.')}</p>
    <a class="footer__big" href="${TG}" target="_blank" rel="noopener" data-reveal style="margin-top:clamp(28px,4vw,56px)">Напишите мне <span class="arrow">↗</span></a>
    <div class="grid footer__links" data-reveal>
      <div><div class="t-label muted">Telegram</div><a href="${TG}" target="_blank" rel="noopener">@veronikactrlz</a></div>
      <div><div class="t-label muted">Behance</div><a href="${BEHANCE}" target="_blank" rel="noopener">behance.net/veronikasa8b43</a></div>
      <div><div class="t-label muted">Dprofile</div><a href="${DPROFILE}" target="_blank" rel="noopener">dprofile.ru/veronika</a></div>
      <div><div class="t-label muted">Стоимость</div><a href="price.html">Цены по типам задач →</a></div>
    </div>
    <div class="grid footer__bottom t-label">
      <div>© <span data-year>2026</span> Вероника Саттарова</div>
      <div>Набрано в Inter</div>
      <div><button type="button" data-grid-toggle>Показать сетку <kbd>G</kbd></button></div>
      <div><button type="button" data-top>Наверх ↑</button></div>
    </div>
  </div>
</footer>`;
}

/* ---------------- главная ---------------- */
function home() {
  const grid = WORKS.map((w, i) => `
    <a class="work w-${i + 1}" href="${w.slug}.html" data-reveal>
      <div class="work__media" data-reveal="img">${img(w.cover, { alt: `${w.title} — ${w.short}`, sizes: i === 1 || i === 2 ? SIZES.third : SIZES.half })}<span class="work__go" aria-hidden="true">↗</span></div>
      <div class="work__cap">
        <span class="work__n t-label">N${w.n}.</span>
        <h3 class="work__title">${w.title} <span class="muted">— ${w.short}</span></h3>
        <span class="work__year t-label">${w.year}</span>
        <p class="work__desc">${nb(w.desc)}</p>
        <div class="work__tags">${w.tags.map((t) => `<span class="tag">${t}</span>`).join('')}</div>
      </div>
    </a>`).join('');

  const list = WORKS.map((w) => `
    <a class="wl-row" href="${w.slug}.html" data-preview="${w.list}" data-reveal>
      <span class="wl-row__title">${w.title}<span class="sup">${w.n}</span></span>
      <span class="wl-row__meta t-label">${w.short}<br>${w.year}</span>
    </a>`).join('');

  const preview = [...new Set(WORKS.map((w) => w.list))].map((k) => img(k, { alt: '', sizes: '360px' }).replace('<img ', `<img data-key="${k}" `)).join('');

  const body = `
<section class="hero wrap" aria-label="Вероника Саттарова, дизайнер">
  <div class="grid hero__meta t-label">
    <div>Портфолио — <span class="t-num">2026</span></div>
    <div class="muted">Графический и UI-дизайнер</div>
    <div class="muted">Бренд · веб · интерфейсы · упаковка</div>
    <div class="muted" style="text-align:right">Сейчас — YUMAPOS</div>
  </div>
  <div class="hero__stage">
    <h1 class="hero__name t-display">
      <span class="line line--1"><span>Вероника</span></span>
      <span class="line line--2"><span>Саттарова</span></span>
    </h1>
  </div>
  <div class="hero__photo">${img('me/portrait', { alt: 'Вероника Саттарова', sizes: '(max-width: 900px) 78vw, 36vw', eager: true })}</div>
  <div class="grid hero__bottom">
    <div class="hero__intro">
      <span class="t-label">[00] Привет</span>
      <p>${nb('Ищу подходящий способ рассказать о продукте: выстраиваю структуру, подбираю визуальный образ и делаю информацию понятной.')}</p>
    </div>
    <div class="pills" aria-label="Направления">
      <span class="pill">Бренд и айдентика</span>
      <span class="pill">Веб-дизайн</span>
      <span class="pill is-active">UI-дизайн</span>
      <span class="pill">Презентации</span>
      <span class="pill">Упаковка</span>
    </div>
  </div>
</section>

<div class="wrap">
  <div class="grid clients" data-reveal>
    <div class="clients__title t-label muted">Проекты и презентации для</div>
    <ul class="clients__list">
      <li>Авито</li><li>X5 Group</li><li>«Пятёрочка»</li><li>«Норникель»</li><li>«Русагро»</li><li>Akkermann</li><li>Ленстройтрест</li><li>YUMAPOS</li>
    </ul>
  </div>
</div>

<section class="section works wrap" id="work" data-view="grid">
  <div class="section-label t-label" data-reveal><span class="muted">[01]</span><span>Избранные работы</span><span class="muted">05 проектов</span></div>
  <div class="grid section-head">
    <h2 class="section-head__title t-xl" data-reveal>Интерфейсы, упаковка,<br>сайты и игры</h2>
    <div class="section-head__aside" data-reveal>
      <div class="view-toggle" role="group" aria-label="Вид списка работ">
        <button type="button" data-view-btn="grid" aria-pressed="true">Сетка</button>
        <button type="button" data-view-btn="list" aria-pressed="false">Список</button>
      </div>
    </div>
  </div>
  <div class="grid works-grid">${grid}
  </div>
  <div class="works-list">${list}
  </div>
  <div class="cursor-preview" aria-hidden="true">${preview}</div>
</section>

<section class="night about" id="about" style="margin-top:clamp(100px,14vw,200px)">
  <div class="wrap">
    <div class="section-label t-label" data-reveal><span class="muted">[02]</span><span>Обо мне</span><span class="muted">4 года в дизайне</span></div>
    <div class="grid">
      <p class="about__lead t-l" data-reveal style="font-size:clamp(28px,3.6vw,58px);line-height:1.06;letter-spacing:-.035em">${nb('Меня зовут Вероника. Последние 4 года я работаю с презентациями, интерфейсами, дизайн-системами, сайтами на Tilda и настольными играми.')}</p>
    </div>
    <div class="grid about__cols" data-stagger=".1">
      <div data-reveal>${nb('Мне интересно искать подходящий способ рассказать о продукте или услуге: выстраивать структуру, подбирать визуальный образ и делать информацию понятной для аудитории.')}</div>
      <div data-reveal>${nb('Люблю как чёткие задачи, в которых можно сосредоточиться на реализации, так и проекты, где есть пространство для собственных идей и поиска решений.')}</div>
      <div data-reveal>${nb('Сейчас работаю дизайнером интерфейсов в YUMAPOS. На фриланс беру сайты на Tilda, презентации и упаковку.')}</div>
    </div>
    <div class="grid stats" data-stagger=".1">
      <div class="stat" data-reveal><div class="stat__n">4</div><p class="stat__t">${nb('года практики: от корпоративных презентаций до дизайн-системы продукта')}</p></div>
      <div class="stat" data-reveal><div class="stat__n">150+</div><p class="stat__t">${nb('карточек и игровых элементов в «Ценном пути» — подготовлены к печати')}</p></div>
      <div class="stat" data-reveal><div class="stat__n">40→6</div><p class="stat__t">${nb('~40 услуг из сплошного списка сгруппировала в 6 понятных категорий на сайте СМАИЛ')}</p></div>
    </div>
    <div class="grid exp">
      <div class="exp__title t-label" data-reveal>Опыт</div>
      <div class="exp__table" data-reveal>
        <table class="table">
          <thead><tr><th style="width:22%">Период</th><th style="width:28%">Компания</th><th>Роль и задачи</th></tr></thead>
          <tbody>
            <tr><td class="t-num">11.2024 — сейчас</td><td><span class="strong">YUMAPOS</span><br><span class="muted">B2B SaaS-система для автоматизации ресторанов</span></td><td><span class="strong">Дизайнер интерфейсов</span><ul style="margin-top:8px">
              <li>${nb('Визуальная идентичность: палитра, типографика, бренд-гайд, модульный паттерн, фотостиль и правила генерации')}</li>
              <li>${nb('Макеты и вёрстка маркетингового сайта на Tilda')}</li>
              <li>${nb('Интерфейсы экосистемы и редизайн бэк-офиса: компоненты, состояния, семантическая палитра, документация')}</li>
              <li>${nb('Коммерческие и продуктовые презентации, рекламные материалы')}</li>
              <li>${nb('СМАИЛ — сайт digital-агентства, дизайн и вёрстка на Tilda')}</li></ul></td></tr>
            <tr><td class="t-num">Лето 2023 — 11.2024</td><td><span class="strong">TSQ Consulting</span><br><span class="muted">Консалтинг для бизнеса</span></td><td><span class="strong">Младший графический дизайнер</span><ul style="margin-top:8px">
              <li>${nb('Презентации для публичных выступлений и клиентов: Авито, X5 Group, «Пятёрочка», «Норникель», «Русагро», Akkermann — по брендбукам клиентов')}</li>
              <li>${nb('Вёрстка отчётов, в том числе ESG')}</li>
              <li>${nb('Дизайн настольных игр, в том числе «Ценный путь» для Ленстройтреста')}</li></ul></td></tr>
            <tr><td class="t-num">Зима — лето 2023</td><td><span class="strong">Фриланс и пет-проекты</span></td><td><ul>
              <li>${nb('HT Reviews Drinks Collection — концепт упаковки кваса и имиджевая кампания')}</li>
              <li>${nb('Liora Energy — презентации, обложки для соцсетей')}</li>
              <li>${nb('Фермент Плюс — дизайн упаковки, визуальная система для продвижения')}</li>
              <li>${nb('Studyspace — личный планер обучения на Vercel и Supabase')}</li></ul></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</section>

<section class="section wrap" id="services" style="padding-bottom:clamp(90px,12vw,180px)">
  <div class="section-label t-label" data-reveal><span class="muted">[03]</span><span>Чем я занимаюсь</span><a class="link-u" href="price.html">Стоимость →</a></div>
  <div class="grid">
    <div class="t-label muted" style="grid-column:1 / span 3" data-reveal>Направления</div>
    <ol class="services__list" data-stagger=".06">
      ${[
        ['Бренд и айдентика', 'Создание и развитие визуальных систем: палитра, типографика, паттерны, гайдлайны.'],
        ['Веб-дизайн', 'Лендинги и продуктовые страницы, сайты на Tilda — от структуры до Zero Block и адаптива.'],
        ['UI-дизайн', 'Интерфейсы, компоненты и их состояния, дизайн-библиотеки и документация.'],
        ['Коммуникационный дизайн', 'Презентации, отчёты и маркетинговые материалы — в том числе по брендбуку клиента.'],
        ['Упаковка и печать', 'От концепции до подготовки файлов к печати по требованиям типографии.'],
      ].map(([t, d], i) => `<li class="svc" data-reveal><span class="svc__n t-label">0${i + 1}</span><span class="svc__t">${t}</span><span class="svc__d">${nb(d)}</span></li>`).join('\n      ')}
    </ol>
  </div>
  <div class="grid tools">
    <div class="tools__title t-label muted" data-reveal>Инструменты</div>
    <div class="tools__list" data-stagger=".06">
      <div data-reveal><b>Figma</b><span>Дизайн-библиотеки, компоненты, переменные</span></div>
      <div data-reveal><b>Tilda</b><span>Zero Block, step-by-step анимации</span></div>
      <div data-reveal><b>Adobe</b><span>Photoshop — фото и ретушь, Illustrator — подготовка к печати</span></div>
      <div data-reveal><b>Нейросети</b><span>GPT, Nano Banana, Midjourney — фото и иллюстрации</span></div>
    </div>
  </div>
</section>`;

  return layout({ file: 'index.html', title: 'Вероника Саттарова — дизайнер. Портфолио', description: 'Графический и UI-дизайнер: интерфейсы и дизайн-системы, сайты на Tilda, презентации, упаковка и настольные игры.', body, current: 'home', ogImage: 'yuma/cover' });
}

/* ---------------- кейс ---------------- */
function casePage(slug, c) {
  const i = WORKS.findIndex((w) => w.slug === slug);
  const w = WORKS[i];
  const next = WORKS[(i + 1) % WORKS.length];
  const body = `
<section class="case-hero wrap">
  <div class="crumbs t-label" data-reveal><a href="index.html#work">← Все работы</a><span class="muted">/</span><span>N${w.n}.</span><span class="muted">${w.n} из 05</span></div>
  <div class="grid case-title"><h1 class="t-xxl" data-reveal>${c.h1 || w.title}<span class="sup">${w.n}</span></h1></div>
  <div class="grid case-lead"><p class="t-l" data-reveal style="--d:.1s">${nb(c.lead)}</p></div>
  <dl class="grid case-meta" data-stagger=".06">
    ${c.meta.map(([k, v]) => `<div data-reveal><dt class="t-label">${k}</dt><dd>${v}</dd></div>`).join('\n    ')}
  </dl>
  <div class="case-cover">${c.cover}</div>
</section>
${c.body}
<div class="wrap">
  <a class="next" href="${next.slug}.html" data-reveal>
    <div class="grid next__row">
      <div class="next__label t-label"><span>Следующий проект</span><span>N${next.n}.</span></div>
      <div class="next__title">${next.title} <span class="arrow">→</span></div>
      <div class="next__img">${img(next.list, { alt: next.title, sizes: SIZES.third })}</div>
    </div>
  </a>
</div>
<div style="height:clamp(80px,10vw,140px)"></div>`;
  return layout({ file: slug + '.html', title: `${w.title} — ${w.short} · Вероника Саттарова`, description: c.lead, body, current: 'work', ogImage: c.og || w.list });
}

/* ---------------- контент кейсов ---------------- */
const CASES = {};

CASES.yumapos = {
  lead: 'Обновила визуальный язык бэк-офиса YUMA и собрала его в систему: компоненты, состояния, семантическая палитра и гайды по применению.',
  meta: [
    ['Год', '2025'],
    ['Компания', 'YUMAPOS, in-house'],
    ['Роль', 'Визуальная концепция, UI-дизайн, дизайн-система, документация'],
    ['Инструменты', 'Figma: переменные, компоненты, автолейауты'],
  ],
  cover: `<div data-reveal="img" class="fig__media">${img('yuma/cover', { alt: 'Бэк-офис YUMA после редизайна: карточка товара и отчёты', eager: true })}</div>`,
  body: [
    block('01', 'Контекст', LEAD('Бэк-офис — рабочее место владельца и управляющего ресторана.') +
      P('YUMA — B2B SaaS-система для автоматизации ресторанов: POS-касса, киоск самообслуживания, kitchen display, приложения официанта, гостя и курьера. Бэк-офис связывает всё это вместе: меню и товары, склад, отчёты, персонал, маркетинг, финансы.') +
      P('Продукт большой: десятки разделов и сценариев, которые росли постепенно. Нужно было обновить визуальный язык и собрать минимальную дизайн-систему, на которую команда сможет опираться дальше.')),
    block('02', 'Задача', LEAD('Сделать концепцию, которую можно последовательно применить к сотням страниц.') +
      bullets(['Разработать новую визуальную концепцию бэк-офиса — такую, чтобы она масштабировалась на большое количество страниц и сценариев.', 'Обновить набор интерфейсных компонентов и описать правила их использования.'])),
    block('03', 'До и после', LEAD('Потяните ползунок, чтобы сравнить экраны.') +
      P('В старой версии все поля карточки товара жили на одном полотне, а жёлтый был единственным акцентом — им выделялись и кнопки, и переключатели, и заголовки групп. Я разбила экран на смысловые блоки, перевела интерфейс на спокойную светлую основу и оставила жёлтый только для главных действий.'),
      { after: `<div class="wrap">${figs(
        ba('yuma/before-menu', 'yuma/after-menu', { n: '01.', alt: 'карточка товара', cap: 'Карточка товара: поля собраны в блоки «Основное», «Цена и налог», «Доступность», «Опции», «Изображение» и SEO.' }),
        ba('yuma/before-login', 'yuma/after-login', { n: '02.', alt: 'страница входа', cap: 'Страница входа: мягкий фон в фирменном жёлтом, иллюстрация и карточка формы.' }),
      )}
      <div class="grid figs">
        <figure class="fig c-6" data-reveal><span class="pair-label t-label">До</span><div class="fig__media" data-reveal="img">${img('yuma/before-reports', { alt: 'Отчёты до редизайна', sizes: SIZES.half })}</div><figcaption><span class="n">03.</span><span>${nb('Отчёты: четыре колонки ссылок с яркими плашками, которые спорят друг с другом.')}</span></figcaption></figure>
        <figure class="fig c-6" data-reveal style="--d:.1s"><span class="pair-label pair-label--after t-label">После</span><div class="fig__media" data-reveal="img">${img('yuma/after-reports', { alt: 'Отчёты после редизайна', sizes: SIZES.half })}</div><figcaption><span class="n">04.</span><span>${nb('Каждая группа отчётов получила цвет из акцентной палитры и иконку — разделы различаются с первого взгляда.')}</span></figcaption></figure>
      </div></div>` }),
    block('04', 'Решение', LEAD('Общая концепция, масштабированная на весь продукт.') +
      bullets([
        '<b>Визуальная концепция.</b> Разработала общий язык интерфейса — светлые слои, карточки, спокойная типографика — и масштабировала его на множество страниц продукта.',
        '<b>Компоненты.</b> Создала и обновила набор компонентов, продумала их состояния и правила применения.',
        '<b>Семантическая палитра.</b> Цвета закреплены за ролями — текст, заливки, бренд, позитив, негатив, внимание, акценты — и последовательно используются для разных состояний.',
        '<b>Гайды.</b> Для новых компонентов подготовила описания поведения и правил использования, чтобы система оставалась целостной при дальнейшей работе.',
      ]),
      { after: `<div class="wrap">${figs(fig('yuma/shop', { n: '05.', cap: 'Модальное окно «Доступность по магазинам»: поиск, выбор в две колонки и счётчик выбранного.' }))}</div>` }),
    block('05', 'Дизайн-система', LEAD('Палитра, токены и компоненты — с описанием состояний.') +
      P('Core-палитра из одиннадцати шкал и семантический слой поверх неё. Семантические токены описаны для четырёх брендов экосистемы, поэтому одни и те же компоненты можно перекрашивать без правок в макетах.'),
      { night: true, after: `<div class="wrap">
      ${figs(
        fig('yuma/ds-colors', { col: 'c-7', n: '06.', cap: 'Core Palette: нейтральная шкала, фирменный жёлтый и акцентные цвета от 50 до 950.' }),
        fig('yuma/ds-semantic', { col: 'c-5', n: '07.', cap: 'Semantic Palette: роли Text, Fill, Brand, Negative, Positive, Attention, Layer, Stroke для четырёх брендов.', d: .1 }),
        fig('yuma/ds-multiselect', { n: '08.', cap: 'Multi Select: Default, Hover, Error, Error hover, Disabled — и вариант с выбранными элементами в виде тегов.' }),
        fig('yuma/ds-typography', { col: 'c-6', n: '09.', cap: 'Типографика.' }),
        fig('yuma/ds-tooltip', { col: 'c-6', n: '10.', cap: 'Тултипы.', d: .1 }),
        fig('yuma/ds-inputs', { col: 'c-4', n: '11.', cap: 'Поля ввода и их состояния.' }),
        fig('yuma/ds-desclist', { col: 'c-4', n: '12.', cap: 'Description List.', d: .08 }),
        fig('yuma/ds-checkbox', { col: 'c-4', n: '13.', cap: 'Чекбоксы и радиокнопки.', d: .16 }),
        fig('yuma/ds-icons', { col: 'c-6', n: '14.', cap: 'Библиотека иконок по категориям.' }),
        fig('yuma/ds-icons-detailed', { col: 'c-6', n: '15.', cap: 'Детализированные иконки модулей: склад, онлайн-меню, лояльность, ЕГАИС и другие.', d: .1 }),
      )}</div>` }),
    block('06', 'Результат', LEAD('Единая визуальная система, которую можно масштабировать на новые страницы и сценарии.') +
      P('Новые компоненты и гайды стали основой для более последовательной и самостоятельной работы команды с интерфейсом: дизайнеры и разработчики опираются на одни и те же правила.')),
  ].join('\n'),
};

CASES.kvas = {
  h1: 'HT Reviews Drinks Collection',
  lead: 'Серия упаковок ароматизированного кваса и имиджевая кампания в эстетике средневекового королевства: четыре вкуса стали рыцарями «Великого турнира вкусов».',
  meta: [
    ['Формат', 'Концепт мерча для HT Reviews'],
    ['Роль', 'Упаковка, иллюстрации, генерация и ретушь сцен'],
    ['Вкусы', 'Виноград-мята, Двойное яблоко, Арбуз-дыня, Pinkman'],
    ['Инструменты', 'Midjourney, Nano Banana, Photoshop'],
  ],
  cover: `<div data-reveal="img" class="fig__media">${img('kvas/feast', { alt: 'Банки кваса на пиршественном столе с фруктами и кубками', eager: true })}</div>`,
  body: [
    block('01', 'Контекст', LEAD('Не просто банка, а вселенная, в которой у каждого вкуса есть свой герой.') +
      P('«HT Reviews Drinks Collection» — серия упаковок для кваса, концепт мерча для HT Reviews. В основе проекта — идея «Рыцарского турнира вкусов»: четыре популярных вкуса стали героями собственной вселенной.')),
    block('02', 'Легенда', `<p class="quote">${nb('Ежегодно в королевстве HT Reviews проходит Великий турнир вкусов: лучшие вкусы сражаются за право стать выбором короля.')}</p>` +
      P('В честь победителей на банках появляется образ короля — символ признания и высшей награды. У каждого вкуса свой рыцарь и своё королевство.'),
      { after: `<div class="wrap"><ul class="grid heroes" data-stagger=".08">
        <li data-reveal style="--c:#6f5bb5"><b>Виноград-мята</b><span>Рыцарь Горного королевства свежести</span></li>
        <li data-reveal style="--c:#c8433a"><b>Двойное яблоко</b><span>Рыцарь Лесного королевства диких яблонь</span></li>
        <li data-reveal style="--c:#e2972f"><b>Арбуз-дыня</b><span>Рыцарь Южного солнечного королевства</span></li>
        <li data-reveal style="--c:#d9638b"><b>Pinkman</b><span>Рыцарь Королевства розового шторма</span></li>
      </ul>
      ${figs(fig('kvas/legend', { n: '01.', cap: '«Во славу победителей» — разворот с легендой турнира.' }), fig('kvas/riders', { n: '02.', cap: 'Рыцари четырёх королевств едут на турнир.' }))}</div>` }),
    block('03', 'Упаковка', LEAD('Белая банка, гравюра с королём и свой цвет у каждого вкуса.') +
      P('Банки собраны по одной системе: светлый фон, тонкий растительный орнамент, вензель и образ короля. Отличаются они цветом гравюры и надписи — так серия читается как коллекция, а вкус узнаётся с полки.'),
      { after: `<div class="wrap">${figs(
        fig('kvas/can-grape', { col: 'c-6', n: '03.', cap: 'Виноград-мята.' }),
        fig('kvas/can-apple', { col: 'c-6', n: '04.', cap: 'Двойное яблоко.', d: .1 }),
        fig('kvas/can-melon', { col: 'c-6', n: '05.', cap: 'Арбуз-дыня.' }),
        fig('kvas/can-pinkman', { col: 'c-6', n: '06.', cap: 'Pinkman.', d: .1 }),
      )}</div>` }),
    block('04', 'Герои', LEAD('У каждого вкуса — свой рыцарь и свой пейзаж.') +
      P('Портреты продолжают историю королевств: яблоневый сад, поле с дынями, скалы над штормовым морем, горы с замком. Для каждого героя собран лист образа — доспех в полный рост и портрет в профиль, — чтобы персонаж оставался узнаваемым во всех сценах.'),
      { after: `<div class="wrap">${figs(
        fig('kvas/knight-grape', { col: 'c-6', n: '07.', cap: 'Рыцарь Горного королевства свежести.' }),
        fig('kvas/knight-apple', { col: 'c-6', n: '08.', cap: 'Рыцарь Лесного королевства диких яблонь.', d: .1, cls: 'push' }),
        fig('kvas/knight-melon', { col: 'c-6', n: '09.', cap: 'Рыцарь Южного солнечного королевства.' }),
        fig('kvas/knight-pinkman', { col: 'c-6', n: '10.', cap: 'Рыцарь Королевства розового шторма.', d: .1, cls: 'push' }),
        fig('kvas/model-1', { col: 'c-6', n: '11.', cap: 'Лист образа: доспех и портрет.' }),
        fig('kvas/model-2', { col: 'c-6', n: '12.', cap: 'Лист образа.', d: .1 }),
        fig('kvas/model-3', { col: 'c-6', n: '13.', cap: 'Лист образа.' }),
        fig('kvas/model-4', { col: 'c-6', n: '14.', cap: 'Лист образа.', d: .1 }),
      )}</div>` }),
    block('05', 'Имиджевые сцены', LEAD('Турнирная легенда получила продолжение за пределами упаковки.') +
      P('Серия сцен, объединённых атмосферой средневекового королевства: тост победителей, выезд на турнир, битва, привал в шатре.'),
      { after: `<div class="wrap">${figs(
        fig('kvas/toast', { n: '15.', cap: 'Тост победителей.' }),
        fig('kvas/knights', { col: 'c-6', n: '16.', cap: 'Перед турниром.' }),
        fig('kvas/battle', { col: 'c-6', n: '17.', cap: 'Битва.', d: .1 }),
        fig('kvas/tent', { n: '18.', cap: 'Привал в шатре.' }),
      )}</div>` }),
    block('06', 'Натюрморты', LEAD('Бархат, серебряные кубки и фрукты каждого вкуса.') +
      P('Предметная съёмка поддерживает ту же историю: тёмно-красный бархат королевского зала и светлые сцены со свежими фруктами.'),
      { after: `<div class="wrap">${figs(
        fig('kvas/still-velvet', { col: 'c-5', n: '19.', cap: 'Банки на бархатных постаментах.' }),
        fig('kvas/hand-can', { col: 'c-7', n: '20.', cap: 'Рука в латной перчатке и банка «Виноград-мята».', d: .1 }),
        fig('kvas/still-grape', { col: 'c-6', n: '21.', cap: 'Виноград-мята.' }),
        fig('kvas/still-all', { col: 'c-6', n: '22.', cap: 'Вся коллекция.', d: .1 }),
        fig('kvas/still-pinkman', { col: 'c-6', n: '23.', cap: 'Pinkman.' }),
        fig('kvas/goblet', { col: 'c-6', n: '24.', cap: 'Кубок короля.', d: .1 }),
      )}</div>` }),
    block('07', 'Раскладки', LEAD('Шаблоны для публикаций: арки, рамки и вензели.') +
      `<div class="note"><b>Нейросети</b><span>${nb('Все изображения и иллюстрации для упаковок сделаны с помощью нейросетей: иллюстрации — в Midjourney, фотографии — в Nano Banana. Дальше — ретушь и сборка в Photoshop.')}</span></div>`,
      { night: true, after: `<div class="wrap">${figs(
        fig('kvas/layout-grape', { col: 'c-6', n: '25.', cap: 'Виноград-мята.' }),
        fig('kvas/layout-apple-melon', { col: 'c-6', n: '26.', cap: 'Двойное яблоко и Арбуз-дыня.', d: .1 }),
        fig('kvas/layout-pinkman', { col: 'c-6', n: '27.', cap: 'Pinkman.' }),
        fig('kvas/layout-tent', { col: 'c-6', n: '28.', cap: 'Сцена в шатре.', d: .1 }),
        fig('kvas/layout-still', { col: 'c-6', n: '29.', cap: 'Натюрморт.' }),
        fig('kvas/layout-still-2', { col: 'c-6', n: '30.', cap: 'Натюрморт.', d: .1 }),
      )}</div>` }),
    block('08', 'Результат', LEAD('Визуальный образ коллекции вышел за пределы упаковки.') +
      P('Разработаны дизайн упаковки, образы моделей и серия имиджевых сцен, объединённых атмосферой средневекового королевства. У каждого вкуса появился свой герой, а турнирная легенда получила продолжение в серии сцен.')),
  ].join('\n'),
};

CASES['tsenny-put'] = {
  lead: 'Визуальные материалы для корпоративной настольной игры о ценностях компании: игровое поле с картой Петербурга, более 150 карточек, правила и коробка. Всё подготовлено к печати.',
  meta: [
    ['Год', '2024'],
    ['Исполнитель', 'TSQ Consulting'],
    ['Заказчик', 'Ленстройтрест'],
    ['Партнёр', 'Мастерская «Легко-Легко» — фишки'],
    ['Роль', 'Визуальная концепция игровых карт, подготовка материалов к печати, кейс для сайта'],
    ['Команда', 'Лидер проекта, методолог, проектный менеджер, корректор, 2 дизайнера'],
  ],
  cover: `<div data-reveal="img" class="fig__media">${img('tsenny/box', { alt: 'Коробка игры «Ценный путь» с картой Петербурга', eager: true })}</div>
  <div class="grid nums" data-stagger=".08">
    <div class="num" data-reveal><b>3</b><span>месяца заняла вся работа</span></div>
    <div class="num" data-reveal><b>6</b><span>человек в команде TSQ Consulting</span></div>
    <div class="num" data-reveal><b>150+</b><span>карточек и других игровых элементов</span></div>
  </div>`,
  body: [
    block('01', 'Контекст', LEAD('Игра, которая помогает передавать корпоративную культуру.') +
      P('«Ценный путь» — настольная игра компании TSQ Consulting. Она разработана для закрепления корпоративной культуры и популяризации ценностей внутри Ленстройтреста. Игроки в роли архитекторов и градостроителей развивают Петербург и воплощают профессиональные идеи в жизнь.') +
      P('Игровое поле — детализированная карта города с достопримечательностями и главным офисом компании.')),
    block('02', 'Задача', LEAD('Создать визуал игры на основе фирменного стиля заказчика и подготовить его к производству.') +
      P('Я участвовала в разработке визуальной концепции игровых карт и подготовке игровых материалов к печати в составе команды TSQ Consulting, а также в подготовке кейса для публикации на сайте компании.')),
    block('03', 'Игровое поле', LEAD('3D-модель реального Петербурга, доработанная вручную.') +
      P('Сетку модели обработали в SketchUp, смоделировали драфты достопримечательностей и дорисовали ключевые элементы в Photoshop. Рассматривали два стиля: яркую «мультяшную» рисовку из дополнительной палитры фирменного стиля и приглушённую палитру со стилизацией под архитектурный генплан. Заказчик выбрал второй вариант.'),
      { after: `<div class="wrap">${figs(
        fig('tsenny/ref-scratch', { col: 'c-3', n: '01.', cap: 'Референс: скретч-карта Петербурга (сторонний автор).' }),
        fig('tsenny/ref-illustrated', { col: 'c-3', n: '02.', cap: 'Референс: иллюстрированная карта (сторонний автор).', d: .08 }),
        fig('tsenny/city-3d', { col: 'c-6', n: '03.', cap: 'Драфт 3D-города.', d: .16 }),
        fig('tsenny/board', { n: '04.', cap: 'Игровое поле целиком: маршрут, районы и достопримечательности.' }),
        fig('tsenny/board-detail', { col: 'c-6', n: '05.', cap: 'Фрагмент поля.' }),
        fig('tsenny/map-v2', { col: 'c-6', n: '06.', cap: 'Вариант в стиле архитектурного генплана — его выбрал заказчик.', d: .1 }),
      )}</div>` }),
    block('04', 'Игровые карты', LEAD('Архитектурные стили — как метафора ценностей.') +
      P('Визуальная концепция построена вокруг архитектурных стилей, которые отражают категории основной колоды. Каждая категория связана с одной из корпоративных ценностей: «Порядочность», «Увлечённость», «Человечность».') +
      P('Выбран стиль архитектурных чертежей: он лаконичный и подчёркивает связь со строительством. Вместо абстрактных зданий команда предложила реальные постройки Петербурга — и визуал стал ближе к игре и самому городу.'),
      { after: `<div class="wrap">${figs(
        fig('tsenny/concept', { n: '07.', cap: 'Поиск концепции и стиля карт.', frame: true }),
        fig('tsenny/card-decency-1', { col: 'c-4', n: '08.', cap: '«Порядочность».' }),
        fig('tsenny/card-passion-1', { col: 'c-4', n: '09.', cap: '«Увлечённость».', d: .08 }),
        fig('tsenny/card-human-1', { col: 'c-4', n: '10.', cap: '«Человечность».', d: .16 }),
        fig('tsenny/cards-flying', { n: '11.', cap: 'Колоды карточек.', frame: true }),
        fig('tsenny/card-photo-decency', { col: 'c-4', n: '12.', cap: 'Карта на фоне здания Биржи, которое на ней изображено.' }),
        fig('tsenny/card-photo-passion', { col: 'c-4', n: '13.', cap: 'Карта «Увлечённость» в городе.', d: .08 }),
        fig('tsenny/card-photo-human', { col: 'c-4', n: '14.', cap: 'Карта «Человечность» в городе.', d: .16 }),
      )}</div>` }),
    block('05', 'Коробка и правила', LEAD('На лицевой стороне — карта, на боковых — иллюстрации ценностей.') +
      P('Мануал для ведущего и памятки «Краткие правила игры» и «Поведенческие индикаторы» продолжают тот же стиль, что и поле.'),
      { after: `<div class="wrap">${figs(fig('tsenny/booklet', { n: '15.', cap: 'Правила и памятки для участников.' }))}</div>` }),
    block('06', 'Фишки', LEAD('Объёмные здания Петербурга вместо привычных фишек.') +
      P('Фишки изготовила мастерская «Легко-Легко»: пять комплектов по три фишки и отдельная фишка дилера.'),
      { after: `<div class="wrap">${figs(
        fig('tsenny/tokens', { n: '16.', cap: 'Фишки-здания.', frame: true }),
        fig('tsenny/tokens-board-2', { col: 'c-5', n: '17.', cap: 'Фишки на поле.' }),
        fig('tsenny/playing', { col: 'c-7', n: '18.', cap: 'Игра в офисе.', d: .1 }),
        fig('tsenny/token-closeup', { col: 'c-6', n: '19.', cap: 'Крупный план.' }),
        fig('tsenny/tokens-board', { col: 'c-6', n: '20.', cap: 'Маршрут по городу.', d: .1 }),
      )}</div>` }),
    block('07', 'Состав коробки', `<table class="table">
      <thead><tr><th>Элемент</th><th class="r">Количество</th></tr></thead>
      <tbody>
        <tr><td>Игровое поле</td><td class="r">1</td></tr>
        <tr><td>Карточки «Задания»</td><td class="r">120</td></tr>
        <tr><td>Карточки «Бонусы»</td><td class="r">10</td></tr>
        <tr><td>Карточки «Чёрные лебеди»</td><td class="r">15</td></tr>
        <tr><td>«Карточки петербуржца»</td><td class="r">30</td></tr>
        <tr><td>Фишки</td><td class="r">5 × 3 + дилер</td></tr>
        <tr><td>Мануал для ведущего</td><td class="r">1</td></tr>
        <tr><td>Памятки «Краткие правила игры» и «Поведенческие индикаторы»</td><td class="r">2</td></tr>
      </tbody></table>`),
    block('08', 'Результат', LEAD('«Ценный путь» стал частью корпоративной жизни компании.') +
      P('За три месяца команда TSQ Consulting разработала визуальные материалы игры и подготовила их к производству. Игра помогает поддерживать культуру изнутри и передавать её новым сотрудникам.')),
  ].join('\n'),
};

CASES.smile = {
  lead: 'Одностраничный сайт нового бренда digital-агентства: он отделяет отдел рекламы от материнской компании и продаёт рекламу владельцу бизнеса.',
  meta: [
    ['Год', '2025'],
    ['Роль', 'Дизайн сайта, типографика и палитра, генерация изображений, вёрстка в Tilda'],
    ['Вёрстка', 'Zero Block с адаптивом под разные экраны'],
    ['Сайт', '<a href="https://smile-digital.ru" target="_blank" rel="noopener">smile-digital.ru ↗</a>'],
  ],
  cover: `<div data-reveal="img" class="fig__media">${img('smile/cover', { alt: 'Сайт СМАИЛ на десктопе и телефоне', eager: true })}</div>`,
  body: [
    block('01', 'Контекст', LEAD('Отделу интернет-рекламы понадобились собственное имя и сайт.') +
      P('Отдел внутри компании настраивал рекламу в Яндексе и VK, но только под брендом компании и только для её клиентов. Чтобы брать заказы со стороны — у салонов красоты, ритейла, цветочных магазинов, — нужен был отдельный бренд.') +
      P('СМАИЛ — digital-агентство для HoReCa и ритейла: контекстная и таргетированная реклама, продвижение на картах, аналитика, SEO и рекламные материалы. Название и концепцию придумала маркетолог; старая страница осталась для клиентов компании.')),
    block('02', 'Задача', LEAD('Показать, что агентство самостоятельное и работает не только с общепитом.') +
      bullets(['Объяснить, как реклама превращается в заявки, звонки и заказы.', 'Вести посетителя к заявке на консультацию.', 'Исходные условия: название, концепция «улыбки», тексты и перечень услуг — от маркетолога, логотип сгенерирован в ChatGPT.'])),
    block('03', 'Метафора одним жестом', LEAD('Дуга из знака логотипа соединяет «довольных гостей» и «спокойного владельца».') +
      P('Концепция маркетолога: агентство соединяет гостей и владельцев, и улыбаются все. Моя задача была сделать так, чтобы игривая идея не обесценивала серьёзный продукт — ведь агентство отвечает за рекламный бюджет клиента. Поэтому улыбка появляется на первом экране один раз, одним жестом.'),
      { after: `<div class="wrap">${figs(fig('smile/hero', { n: '01.', cap: 'Первый экран: дуга-улыбка как связь между гостями и владельцем.', browser: 'smile-digital.ru' }))}</div>` }),
    block('04', 'Проблема → решение', LEAD('Разгрузить композицию, чтобы проблема и решение читались сразу.') +
      P('Маркетолог передала сгенерированный вариант блока: персонаж, дашборды с цифрами и плашки в одной сцене. Больше всего времени ушло на поиск композиции без лишнего шума. В итоге — две колонки: проблема на красном фоне, решение на зелёном, фото в общем стиле сайта.'),
      { after: `<div class="wrap"><div class="grid figs">
        <figure class="fig c-6" data-reveal><span class="pair-label t-label">Было — вариант маркетолога</span><div class="fig__media fig__media--frame" data-reveal="img">${img('smile/before-problem', { alt: 'Блок «проблема» в исходном варианте', sizes: SIZES.half })}</div></figure>
        <figure class="fig c-6" data-reveal style="--d:.1s"><span class="pair-label pair-label--after t-label">Стало</span><div class="fig__media fig__media--frame" data-reveal="img">${img('smile/problem', { alt: 'Блок «проблема и решение» на сайте', sizes: SIZES.half })}</div></figure>
      </div></div>` }),
    block('05', 'Услуги: из списка в 6 групп', LEAD('Владельцу бизнеса не нужно разбираться в терминах вроде «РСЯ» или «ретаргетинг».') +
      P('Перечень услуг пришёл сплошным списком из ~40 пунктов: его тяжело читать, и непонятно, что из этого нужно именно тебе. Я сгруппировала услуги в 6 категорий с иконками и кнопкой «Подробнее», а заголовки строила как ответ на вопрос «что мы делаем для клиента». По заголовку сразу понятно, какую задачу закроет агентство, детали — в списке под ним.'),
      { after: `<div class="wrap"><div class="grid figs">
        <figure class="fig c-6" data-reveal><span class="pair-label t-label">Было — список, как прислали</span><div class="fig__media fig__media--frame" data-reveal="img">${img('smile/services-raw', { alt: 'Сплошной список услуг', sizes: SIZES.half })}</div></figure>
        <figure class="fig c-6" data-reveal style="--d:.1s"><span class="pair-label pair-label--after t-label">Стало — 6 групп</span><div class="fig__media fig__media--frame" data-reveal="img">${img('smile/services-grouped', { alt: 'Услуги, сгруппированные в 6 категорий', sizes: SIZES.half })}</div></figure>
      </div>${figs(fig('smile/services', { n: '02.', cap: 'Блок услуг на сайте.', browser: 'smile-digital.ru/#services' }))}</div>` }),
    block('06', 'Единый арт-дирекшн', LEAD('Все изображения людей я сгенерировала по общим правилам.') +
      bullets(['Тёплый свет, интерьеры заведений и рабочие сцены.', 'Цвета одежды героев — под палитру сайта: оливковый и лаймовый, чтобы фото не выглядели чужеродно.', 'Одной зелёной палитры оказалось мало, поэтому в генерации добавили глубокий синий.']),
      { after: `<div class="wrap">${figs(
        fig('smile/benefits', { col: 'c-6', n: '03.', cap: 'Преимущества: команда, отчёты, фокус на заявках.', browser: 'smile-digital.ru' }),
        fig('smile/lead', { col: 'c-6', n: '04.', cap: 'Форма заявки.', browser: 'smile-digital.ru', d: .1 }),
      )}</div>` }),
    block('07', 'Сайт целиком', LEAD('Путь от первого экрана до заявки.') +
      P('Почти все блоки собраны в Zero Block и адаптированы под разные экраны.'),
      { after: `<div class="wrap">${figs(
        fig('smile/audiences', { col: 'c-6', n: '05.', cap: 'Для кого работает агентство.', browser: 'smile-digital.ru' }),
        fig('smile/path', { col: 'c-6', n: '06.', cap: 'Путь клиента от запроса до обращения.', browser: 'smile-digital.ru', d: .1 }),
        fig('smile/channels', { col: 'c-6', n: '07.', cap: 'Площадки: Яндекс и VK.', browser: 'smile-digital.ru' }),
        fig('smile/process', { col: 'c-6', n: '08.', cap: 'Как агентство доводит клиента до заявки.', browser: 'smile-digital.ru', d: .1 }),
        fig('smile/cases', { col: 'c-6', n: '09.', cap: 'Кейсы с цифрами.', browser: 'smile-digital.ru' }),
        fig('smile/faq', { col: 'c-6', n: '10.', cap: 'Частые вопросы.', browser: 'smile-digital.ru', d: .1 }),
        fig('smile/phones', { n: '11.', cap: 'Мобильная версия.' }),
      )}</div>` }),
    block('08', 'Результат', LEAD('У отдела появилось собственное имя и сайт, с которым можно идти к новым клиентам.') +
      P('Сайт запущен на <a class="link-u blue" href="https://smile-digital.ru" target="_blank" rel="noopener">smile-digital.ru</a>. Реклама на сайт пока не запущена, поэтому данных о заявках и конверсии ещё нет.')),
  ].join('\n'),
};

CASES.studyspace = {
  lead: 'Личный учебный планер, который собирает курсы из YouTube, Яндекс Диска, VK Видео и Облака Mail в одну спокойную очередь уроков. Открываешь сайт — и сразу видишь, какой урок следующий.',
  meta: [
    ['Формат', 'Личный продукт'],
    ['Роль', 'Продукт, сценарии, UX/UI, реализация'],
    ['Стек', 'GitHub, Vercel, Supabase, GPT'],
    ['Стиль', 'Lora, PT Root UI, иконки Phosphor'],
  ],
  cover: `<div data-reveal="img" class="fig__media"><video src="assets/video/studyspace.mp4" poster="assets/img/${M['studyspace/cover'].set[M['studyspace/cover'].set.length - 1][0]}" muted loop playsinline preload="none" data-autoplay width="1280" height="720" aria-label="Демонстрация Studyspace"></video></div>`,
  body: [
    block('01', 'Контекст', LEAD('Курсы копятся, а до просмотра дело не доходит.') +
      P('Учебные материалы разбросаны по видеоплатформам, облачным хранилищам и конспектам. Нужен был личный инструмент, который соберёт обучение в одном месте и поможет двигаться последовательно.')),
    block('02', 'Задача', LEAD('Простой и приятный планер — без регистрации для всех и социальных функций.') +
      P('Библиотека курсов, очередь уроков, прогресс и быстрое изменение плана.')),
    block('03', 'Что я сделала', bullets([
      'Сформулировала продукт, пользовательские сценарии и информационную структуру.',
      'Спроектировала экран «Сегодня» с текущим уроком и очередью, библиотеку курсов и страницу курса.',
      'Проработала теги направлений, прогресс, состояния и визуальные правила.',
      'Продумала добавление, редактирование, сортировку, удаление и завершение уроков.',
      'Проработала импорт уроков из YouTube и публичных материалов Яндекс Диска, а также ссылки на конспекты в Figma.',
      'Итеративно доводила реализацию через GitHub, Vercel и Supabase.',
    ])),
    block('04', '«Сегодня» вместо календаря', LEAD('Никакой перегруженной сетки дат — просто следующий шаг.') +
      P('Главный экран показывает один текущий урок с кнопками «Смотреть», «Конспект» и «Урок пройден», рядом — «Следующие уроки» с прогрессом курса. Пейзаж на фоне и белые карточки задают спокойный тон.')),
    block('05', 'Библиотека', LEAD('Карточки курсов с прогрессом и фильтр по направлениям.') +
      P('У каждого направления своя пара цветов — для текста и фона тега и для заливки прогресса.') +
      `<div class="chips" aria-label="Направления">
        <span class="chip" style="--bg:#e6ecfb;--fg:#3c5fd1"><i></i>Нейронки</span>
        <span class="chip" style="--bg:#e3f2e6;--fg:#2f8a4c"><i></i>UX</span>
        <span class="chip" style="--bg:#e8f0fb;--fg:#3a7fc2"><i></i>UI</span>
        <span class="chip" style="--bg:#fbeee2;--fg:#c26a2c"><i></i>Менеджмент</span>
        <span class="chip" style="--bg:#f8e6f0;--fg:#b04d84"><i></i>Брендинг и концепты</span>
        <span class="chip" style="--bg:#f6f0dc;--fg:#9c7c22"><i></i>Фундамент и база</span>
      </div>`,
      { after: `<div class="wrap">${figs(fig('studyspace/library', { n: '01.', cap: 'Моя библиотека: курсы, прогресс, фильтр по направлениям.' }))}</div>` }),
    block('06', 'Курс и импорт', LEAD('Вставить ссылку на плейлист — и уроки подтянутся сами.') +
      P('На странице курса — список уроков с отметками «пройдено» и ссылками на материал, отдельный блок «Конспекты». При пакетном добавлении названия и ссылки уроков подтягиваются из плейлиста, остальные дописываются строками.'),
      { after: `<div class="wrap">${figs(
        fig('studyspace/course', { col: 'c-6', n: '02.', cap: 'Страница курса.' }),
        fig('studyspace/import', { col: 'c-6', n: '03.', cap: 'Диалог «Добавить уроки» с импортом плейлиста.', d: .1 }),
        fig('studyspace/mobile', { n: '04.', cap: 'Мобильная версия.' }),
      )}</div>` }),
    block('07', 'Облако и приватность', LEAD('Вход по email, данные изолированы.') +
      P('Данные хранятся в Supabase и изолированы политиками Row Level Security, сайт закрыт от индексации, есть резервные копии в JSON.')),
    block('08', 'Принципы UX', bullets([
      '<b>Минимум действий.</b> Главное — открыть и продолжить.',
      '<b>Очередь вместо календаря.</b> Последовательность важнее дат.',
      '<b>Быстрое возвращение.</b> Следующий урок всегда на первом экране.',
    ])),
  ].join('\n'),
};

/* ---------------- стоимость ---------------- */
const PRICES = [
  { n: '01', t: 'Веб-дизайн', d: 'Лендинги и сайты на Tilda: структура, дизайн, вёрстка в Zero Block.', rows: [
    ['Лендинг на Tilda под ключ', 'Структура, дизайн в Figma, вёрстка в Zero Block, адаптив, анимации, подключение форм', '2–4 недели', 'от 60 000 ₽'],
    ['Дизайн лендинга в Figma', 'Макеты для десктопа и мобильной версии, без вёрстки', '1–2 недели', 'от 35 000 ₽'],
    ['Новый блок или доработка сайта', 'Дизайн и вёрстка отдельной секции на Tilda', '1–3 дня', 'от 7 000 ₽'],
  ] },
  { n: '02', t: 'UI-дизайн', d: 'Интерфейсы, компоненты и состояния, дизайн-библиотеки.', rows: [
    ['Экран интерфейса', 'Макет со всеми состояниями, на компонентах', '1–2 дня', 'от 6 000 ₽', 'за экран'],
    ['UI-kit / дизайн-система', 'Палитра и токены, типографика, компоненты с состояниями, переменные Figma, гайды', 'от 3 недель', 'от 80 000 ₽'],
    ['Аудит интерфейса', 'Разбор экранов и список рекомендаций с примерами', '3–5 дней', 'от 15 000 ₽'],
  ] },
  { n: '03', t: 'Бренд и айдентика', d: 'Визуальные системы: от логотипа до гайдлайна.', rows: [
    ['Логотип и базовый стиль', 'Знак, палитра, шрифты, 2–3 носителя', '2–3 недели', 'от 50 000 ₽'],
    ['Гайдлайн / бренд-гайд', 'Правила применения, паттерны, фотостиль', 'от 2 недель', 'от 40 000 ₽'],
  ] },
  { n: '04', t: 'Презентации и отчёты', d: 'В том числе по корпоративному шаблону и брендбуку клиента.', rows: [
    ['Презентация', 'Дизайн по готовому тексту: структура, инфографика, иконки', 'от 2 дней', 'от 1 500 ₽', 'за слайд'],
    ['Шаблон презентации', 'Мастер-слайды в фирменном стиле для команды', '1 неделя', 'от 20 000 ₽'],
    ['Отчёт, в том числе ESG', 'Вёрстка, таблицы, графики, подготовка к печати', 'от 1 недели', 'от 2 000 ₽', 'за полосу'],
    ['Рекламные и соцсетевые макеты', 'Баннеры, обложки, адаптации под площадки', '1–2 дня', 'от 2 000 ₽', 'за макет'],
  ] },
  { n: '05', t: 'Упаковка и печать', d: 'От концепции до файлов по требованиям типографии.', rows: [
    ['Дизайн упаковки', 'Концепция, 1 SKU, подготовка к печати', '2–3 недели', 'от 35 000 ₽'],
    ['Следующий вкус в линейке', 'Адаптация готовой системы', '2–4 дня', 'от 10 000 ₽'],
    ['Настольная игра', 'Поле, карточки, коробка, правила, препресс', 'от 1 месяца', 'от 150 000 ₽'],
  ] },
  { n: '06', t: 'Изображения с нейросетями', d: 'Фото и иллюстрации по единому арт-дирекшну.', rows: [
    ['Изображение', 'Генерация по брифу, ретушь, приведение к стилю', '1 день', 'от 2 500 ₽', 'за кадр'],
    ['Серия имиджевых сцен', 'Концепция, образы героев, 6–10 кадров в одном стиле', 'от 1 недели', 'от 25 000 ₽'],
  ] },
];

function pricePage() {
  const groups = PRICES.map((g) => `
<section class="price-group wrap">
  <div class="grid">
    <div class="price-group__head" data-reveal><div class="t-label"><span class="muted">${g.n}</span><span>Направление</span></div><h2>${nb(g.t)}</h2><p>${nb(g.d)}</p></div>
    <div class="price-group__table" data-reveal>
      <div class="price-row price-row--head t-label"><span>Задача</span><span class="price-row__d">Что входит</span><span>Срок</span><span style="text-align:right">Стоимость</span></div>
      ${g.rows.map(([t, d, time, p, unit]) => `<div class="price-row"><span class="price-row__t">${nb(t)}</span><span class="price-row__d">${nb(d)}</span><span class="price-row__time">${time}</span><span class="price-row__p">${p}${unit ? `<small>${unit}</small>` : ''}</span></div>`).join('\n      ')}
    </div>
  </div>
</section>`).join('');

  const body = `
<section class="price-hero wrap">
  <div class="crumbs t-label" data-reveal><a href="index.html">← Главная</a><span class="muted">/</span><span>Стоимость</span><span class="muted">Цены на ноябрь 2026</span></div>
  <div class="grid case-title"><h1 class="t-xxl" data-reveal>Стоимость<span class="sup">06</span></h1></div>
  <div class="grid case-lead"><p class="t-l" data-reveal style="--d:.1s">${nb('Ориентировочные цены по типам задач. Точную стоимость и сроки назову после короткого брифа — они зависят от объёма, сроков и исходных материалов.')}</p></div>
  <div style="margin-top:clamp(28px,4vw,48px)" data-reveal><a class="btn btn--lg" href="${TG}" target="_blank" rel="noopener">Обсудить задачу <span class="arrow">↗</span></a></div>
</section>
${groups}
<section class="night" style="margin-top:clamp(100px,14vw,200px);padding:clamp(80px,11vw,160px) 0">
  <div class="wrap">
    <div class="section-label t-label" data-reveal><span class="muted">[01]</span><span>Как мы работаем</span><span class="muted">5 шагов</span></div>
    <p class="t-l" data-reveal style="max-width:22ch">${nb('От брифа до готовых файлов — прозрачно и без сюрпризов.')}</p>
    <div class="grid steps" data-stagger=".08">
      ${[
        ['01', 'Бриф', 'Обсуждаем задачу, аудиторию, сроки и примеры, которые нравятся.'],
        ['02', 'Оценка', 'Фиксирую объём, этапы, стоимость и сроки.'],
        ['03', 'Концепция', 'Показываю направление и ключевые экраны или макеты.'],
        ['04', 'Доработка', 'Развиваю выбранное решение на все материалы, вношу правки.'],
      ].map(([n, t, d]) => `<div class="step" data-reveal><span class="t-label muted">${n}</span><b>${t}</b><p>${nb(d)}</p></div>`).join('\n      ')}
    </div>
    <div class="grid steps">
      <div class="step" data-reveal><span class="t-label muted">05</span><b>Передача</b><p>${nb('Отдаю исходники в Figma, файлы для печати или опубликованный сайт.')}</p></div>
      <div class="step" data-reveal style="grid-column:span 9"><span class="t-label muted">Важно</span><b>Цены указаны «от»</b><p style="max-width:60ch">${nb('Итоговая сумма зависит от объёма и срочности. Срочные задачи и работа в выходные — по договорённости.')}</p></div>
    </div>
  </div>
</section>`;
  return layout({ file: 'price.html', title: 'Стоимость — Вероника Саттарова, дизайнер', description: 'Ориентировочные цены на дизайн: сайты на Tilda, UI и дизайн-системы, презентации, айдентика, упаковка и настольные игры.', body, current: 'price' });
}

function notFound() {
  const body = `
<section class="nf wrap">
  <div class="crumbs t-label"><span>Ошибка</span><span class="muted">/</span><span>404</span></div>
  <h1 class="t-display" style="margin-top:4vw">404<span class="sup blue">!</span></h1>
  <p class="t-l" style="max-width:22ch;margin-top:24px">${nb('Такой страницы нет — возможно, она переехала.')}</p>
  <div style="margin-top:32px;display:flex;gap:10px;flex-wrap:wrap"><a class="btn btn--lg" href="index.html">На главную</a><a class="btn btn--lg btn--ghost" href="index.html#work">Все работы</a></div>
</section>`;
  return layout({ file: '404.html', title: 'Страница не найдена — Вероника Саттарова', description: 'Страница не найдена.', body, current: '' })
    .replace('<head>', '<head>\n<base href="/veronikasattarova-portfolio-2026/">');
}

const redirect = (to) => `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>Переадресация…</title><meta http-equiv="refresh" content="0; url=${to}"><link rel="canonical" href="${SITE}${to}"><meta name="robots" content="noindex"></head><body><a href="${to}">${to}</a></body></html>\n`;

/* ---------------- запись ---------------- */
const write = (f, s) => { fs.writeFileSync(path.join(DOCS, f), s); console.log('→', f); };
write('index.html', home());
for (const w of WORKS) write(w.slug + '.html', casePage(w.slug, CASES[w.slug]));
write('price.html', pricePage());
write('404.html', notFound());
// старые адреса предыдущей версии сайта
write('smail.html', redirect('smile.html'));
write('services.html', redirect('price.html'));
write('about.html', redirect('index.html#about'));
write('projects.html', redirect('index.html#work'));
fs.writeFileSync(path.join(DOCS, '.nojekyll'), '');
fs.writeFileSync(path.join(DOCS, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}sitemap.xml\n`);
fs.writeFileSync(path.join(DOCS, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${['', ...WORKS.map((w) => w.slug + '.html'), 'price.html'].map((p) => `  <url><loc>${SITE}${p}</loc></url>`).join('\n')}\n</urlset>\n`);
