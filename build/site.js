// Генерирует HTML-страницы в ../docs из контента ниже. Запуск: node site.js
const fs = require('fs');
const path = require('path');

const DOCS = path.join(__dirname, '..', 'docs');
const M = JSON.parse(fs.readFileSync(path.join(__dirname, 'manifest.json'), 'utf8'));
const SITE = 'https://veronikasattarova619-art.github.io/veronikasattarova-portfolio-2026/';
const TG = 'https://t.me/veronikactrlz';
const BEHANCE = 'https://www.behance.net/veronikasa8b43';
const DPROFILE = 'https://dprofile.ru/veronika';
const YUMA_ORIGINAL = 'yumapos-original';
const STUDYSPACE_EDITORIAL = 'studyspace-editorial';
const HOME_ATLAS = 'home-atlas.html';
const HOME_EDITORIAL = 'home-editorial.html';
const workHref = (slug) => (slug === 'studyspace' ? STUDYSPACE_EDITORIAL : slug) + '.html';
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
  if (m.anim) return `<img src="assets/img/${m.src}" width="${m.w}" height="${m.h}" alt="${alt}" ${lazy} decoding="async"${cls}>`;
  const last = m.set[m.set.length - 1];
  const w = last[1], h = Math.round(m.h * last[1] / m.w);
  const srcset = m.set.map(([f, sw]) => `assets/img/${f} ${sw}w`).join(', ');
  return `<img src="assets/img/${m.set[0][0]}" srcset="${srcset}" sizes="${o.sizes || SIZES.full}" width="${w}" height="${h}" alt="${alt}" ${lazy} decoding="async"${cls}>`;
}
const largest = (key) => { const m = M[key]; return 'assets/img/' + (m.anim ? m.src : m.set[m.set.length - 1][0]); };
const browserFrame = (media, address) => `<div class="browser"><div class="browser__bar" aria-hidden="true"><i></i><i></i><i></i><span>${esc(address)}</span></div>${media}</div>`;

// фигура: картинка + подпись, по клику увеличивается
function fig(key, o = {}) {
  const col = o.col || 'c-12';
  const sizes = SIZES[colSize[col] || 'full'];
  let media = img(key, { alt: o.alt || o.cap || '', sizes });
  if (o.browser) media = browserFrame(media, o.browser);
  const mcls = ['fig__media', o.frame ? 'fig__media--frame' : '', o.dark ? 'fig__media--dark' : ''].filter(Boolean).join(' ');
  const cap = o.cap ? `<figcaption>${nb(o.cap)}</figcaption>` : '';
  return `<figure class="fig ${col}${o.cls ? ' ' + o.cls : ''}" data-reveal><div class="${mcls}" data-zoom>${media}</div>${cap}</figure>`;
}
const figs = (...items) => `<div class="grid figs">${items.join('')}</div>`;

// раздел кейса: одна линия на всю ширину, подпись слева, текст справа, картинки под ним
function block(n, label, body, o = {}) {
  return `<section class="block wrap${o.night ? ' night block--night' : ''}" id="s${n}">
  <div class="grid block__row hr">
    <div class="block__label t-label" data-reveal><span class="n">${n}</span><span>${label}</span></div>
    <div class="block__body" data-reveal>${body}</div>
  </div>
  ${o.after || ''}
</section>`;
}
const bullets = (arr) => `<ol class="bullets">${arr.map((x) => `<li>${nb(x)}</li>`).join('')}</ol>`;
const P = (s) => `<p>${nb(s)}</p>`;
const LEAD = (s) => `<p class="lead">${nb(s)}</p>`;

const caseOpening = (task, solution) => `<section class="case-opening" id="overview" aria-label="Задача и решение">
  <div data-reveal><h2 class="t-label">Задача</h2>${P(task)}</div>
  <div data-reveal><h2 class="t-label">Решение</h2>${P(solution)}</div>
</section>`;

function caseChapter(id, number, label, title, body, { after } = {}) {
  return `<section class="case-chapter hr" id="${id}">
  <div class="case-chapter__intro" data-reveal>
    <div class="case-chapter__heading">
      <h2>${nb(title)}</h2>
      <p class="case-chapter__label t-label"><span class="n" aria-hidden="true">${number}</span><span>${label}</span></p>
    </div>${body || ''}
  </div>${after ? '\n  ' + after : ''}
</section>`;
}

const caseStory = (chapters) => `<div class="wrap case-story">
${chapters.join('\n')}
</div>`;
const chapter = (number, label, title, body, options) => caseChapter('s' + number, number, label, title, body, options);

/* ---------------- работы ---------------- */
const WORKS = [
  { slug: 'yumapos', n: '01', title: 'YUMA Back Office', short: 'Редизайн бэк-офиса и дизайн-система', year: '2025', type: 'UI · дизайн-система · in-house', cover: 'yuma/cafe-hero',
    desc: 'Новый визуальный язык бэк-офиса для ресторанов: компоненты, состояния, семантическая палитра и гайды.' },
  { slug: 'kvas', n: '02', title: 'HT Reviews Drinks Collection', short: 'Упаковка кваса и имиджевая кампания', year: '2026', type: 'Упаковка · иллюстрация · нейросети', cover: 'kvas/feast',
    desc: 'Четыре вкуса кваса стали рыцарями «Великого турнира вкусов»: банки, герои и серия сцен.' },
  { slug: 'tsenny-put', n: '03', title: '«Ценный путь»', short: 'Настольная игра для Ленстройтреста', year: '2024', type: 'Настольная игра · полиграфия', cover: 'tsenny/token-closeup',
    desc: 'Поле с картой Петербурга, 150+ карточек, правила и коробка — всё готово к печати.' },
  { slug: 'smile', n: '04', title: 'СМАИЛ', short: 'Сайт digital-агентства', year: '2025', type: 'Веб-дизайн · Tilda', cover: 'smile/studio-monitor',
    desc: 'Одностраничный сайт нового бренда: от метафоры «улыбки» до вёрстки в Zero Block.' },
  { slug: 'studyspace', n: '05', title: 'Studyspace', short: 'Персональный планер обучения', year: '2026', type: 'Продукт · UX/UI', cover: 'studyspace/art-feature',
    desc: 'Личная библиотека курсов и очередь, которая показывает, какой урок следующий.' },
];

/* ---------------- каркас ---------------- */
const NAV = [
  ['index.html#work', '01', 'Работы', 'work'],
  ['index.html#about', '02', 'Обо мне', 'about'],
  ['price.html', '03', 'Услуги и цены', 'price'],
  ['#contact', '04', 'Контакты', 'contact'],
];
function layout({ file, title, description, body, current, ogImage, homeFile = 'index.html' }) {
  const screen = ['index.html','price.html', ...WORKS.map(w => workHref(w.slug))].includes(file);
  const atlas = homeFile === HOME_ATLAS;
  const edition = atlas || homeFile === HOME_EDITORIAL;
  const navigation = edition ? [
    ['#work', '', 'Проекты', 'work'], ['#principles', '', 'Подход', 'principles'],
    ['#about', '', 'Опыт', 'about'], ['#services', '', 'Услуги', 'services']
  ] : NAV.map(([href, ...rest]) => [href.replace(/^index\.html/, homeFile), ...rest]);
  const og = SITE + largest(ogImage || 'yuma/cover');
  const url = SITE + (file === 'index.html' ? '' : file);
  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="${screen ? '#121318' : '#f5f5f2'}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${og}">
<meta property="og:url" content="${url}">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="${url}">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="preload" href="assets/fonts/inter-cyrillic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/css/style.css?v=${V}">
<script>(function(d){var c='js';if(!('onpagereveal' in window))c+=' no-vt is-entering';d.className=c})(document.documentElement)</script>
<script src="assets/js/main.js?v=${V}" defer></script>
</head>
<body${screen ? (file === 'index.html' ? ' class="screen screen-home"' : ' class="screen screen-inner"') : atlas ? ' class="folio atlas"' : edition ? ' class="folio"' : ''}>
<a class="skip" href="#main">К содержанию</a>
<div class="page-fade" aria-hidden="true"></div>
${screen ? screening.nav(file === 'index.html', file === 'price.html') : `<header class="header">
  <div class="wrap grid">
    <a class="header__name" href="${homeFile}">${atlas ? 'ВС <span class="atlas-mark">/</span> Портфолио' : edition ? '<span class="folio-monogram" aria-hidden="true">ВС</span>Портфолио' : 'Вероника Саттарова'}</a>
    <nav class="nav" aria-label="Основная навигация">
      ${navigation.map(([h, n, t, k]) => `<a href="${h}"${current === k ? ' aria-current="page"' : ''}>${n ? `<span class="n">${n}</span>` : ''}${t}</a>`).join('\n      ')}
    </nav>
    <div class="header__cta"><span class="status"><i></i>Открыта к проектам</span><a class="btn btn--sm" href="${TG}" target="_blank" rel="noopener">Написать ${edition ? '<i class="ne-arrow" aria-hidden="true"></i>' : '<span class="arr">↗</span>'}</a></div>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mnav">Меню</button>
  </div>
  <nav class="mnav" id="mnav" aria-label="Меню">
    ${navigation.map(([h, n, t]) => `<a href="${h}">${t}<span class="n">${n}</span></a>`).join('\n    ')}
    <a class="btn btn--blue" href="${TG}" target="_blank" rel="noopener">Написать в Telegram ↗</a>
  </nav>
</header>`}
<main id="main">
${body}
</main>
${screen ? screening.footer() : contactFooter(edition, atlas)}
</body>
</html>
`;
}

function contactFooter(editorial = false, atlas = false) {
  if (editorial) return `<footer class="folio-contact" id="contact"><div class="wrap">
    <h2>${atlas ? 'Напишите мне' : 'Обсудим проект?'}</h2>
    <a class="folio-contact__tg" href="${TG}" target="_blank" rel="noopener">${atlas ? '@veronikactrlz' : 'Написать в Telegram'} <i class="ne-arrow" aria-hidden="true"></i></a>
    <div class="folio-contact__base"><span>© Вероника Саттарова, <span data-year>2026</span></span>
      <nav aria-label="Профили дизайнера"><a href="${BEHANCE}" target="_blank" rel="noopener">Behance</a><a href="${DPROFILE}" target="_blank" rel="noopener">Dprofile</a></nav>
      ${atlas ? `<a href="${HOME_EDITORIAL}">Сравнить с версией 18</a>` : `<a href="${HOME_ATLAS}">Новая версия главной</a><a href="index.html">Исходная главная</a>`}<button type="button" data-top>Наверх ↑</button>
    </div>
  </div></footer>`;
  return `<footer class="night contact" id="contact">
  <div class="wrap">
    <div class="shead__label t-label hr" style="padding-top:12px" data-reveal><span><span class="n">04</span>&nbsp; Контакты</span><span class="muted">Открыта к проектам</span></div>
    <p class="contact__lead t-l" data-reveal>${nb(editorial ? 'Напишите, что нужно сделать и к какому сроку.' : 'Есть задача — сайт, презентация, упаковка или интерфейс? Расскажите о ней в паре предложений.')}</p>
    <a class="contact__big" href="${TG}" target="_blank" rel="noopener" data-reveal>Напишите мне <span class="arr">↗</span></a>
    <div class="grid contact__links hr" data-reveal>
      <div><span class="t-label muted">Telegram — быстрее всего</span><a href="${TG}" target="_blank" rel="noopener">@veronikactrlz</a></div>
      <div><span class="t-label muted">Behance</span><a href="${BEHANCE}" target="_blank" rel="noopener">behance.net/veronikasa8b43</a></div>
      <div><span class="t-label muted">Dprofile</span><a href="${DPROFILE}" target="_blank" rel="noopener">dprofile.ru/veronika</a></div>
      <div><span class="t-label muted">Услуги</span><a href="price.html">Цены и этапы работы →</a></div>
    </div>
    <div class="contact__bottom hr"><span>© <span data-year>2026</span> Вероника Саттарова — графический и UI-дизайнер</span>${editorial ? '<a href="index.html">Исходная главная</a>' : ''}<button type="button" data-top>Наверх ↑</button></div>
  </div>
</footer>`;
}

const shead = (n, label, aside, title, text) => `<div class="grid shead hr">
    <div class="shead__label t-label"><span><span class="n">${n}</span>&nbsp; ${label}</span><span class="muted">${aside}</span></div>
    ${title ? `<h2 class="shead__title t-xl" data-reveal>${title}</h2>` : ''}${text ? `\n    <p class="shead__aside" data-reveal>${nb(text)}</p>` : ''}
  </div>`;

/* ---------------- главная ---------------- */
const HOME_GALLERIES = {
  yumapos: [['yuma/after-menu', 'Карточка товара после редизайна', true], ['yuma/after-reports', 'Каталог отчётов после редизайна', true]],
  kvas: [['kvas/riders', 'Рыцари в имиджевой кампании'], ['kvas/still-all', 'Серия банок на светлом фоне']],
  'tsenny-put': [['tsenny/board-detail', 'Игровое поле и карточки'], ['tsenny/booklet', 'Разворот мануала ведущего']],
  smile: [['smile/hero', 'Первый экран сайта', true], ['smile/phones', 'Мобильная версия сайта', true]],
  studyspace: [['studyspace/art-library', 'Библиотека курсов', true], ['studyspace/art-mobile', 'Три мобильных экрана планера', true]],
};
const HOME_PROJECT_COPY = {
  yumapos: 'Переработала карточку товара и отчёты. Собрала компоненты и правила для новых экранов.',
  kvas: 'Придумала упаковку для четырёх вкусов кваса и серию кадров с героями рыцарского турнира.',
  'tsenny-put': 'Разработала концепцию игровых карт и подготовила материалы к печати.',
  smile: 'Спроектировала и собрала на Tilda сайт рекламного агентства.',
  studyspace: 'Сделала планер, в котором храню курсы и вижу, какой урок смотреть дальше.',
};

function editorialWork(w) {
  const headingId = 'work-' + w.slug;
  const pictures = [[w.cover, w.short], ...HOME_GALLERIES[w.slug]];
  return `<article class="editorial-work hr" id="${headingId}" aria-labelledby="${headingId}-title">
    <div class="grid editorial-work__head">
      <h3 id="${headingId}-title"><a href="${workHref(w.slug)}">${w.title} <span class="work-title-arrow" aria-hidden="true"><i class="ne-arrow"></i></span></a></h3>
      <p class="editorial-work__desc">${nb(HOME_PROJECT_COPY[w.slug])}</p>
      <time class="editorial-work__year" datetime="${w.year}">${w.year}</time>
    </div>
    <a class="editorial-work__gallery" href="${workHref(w.slug)}" aria-label="Открыть кейс ${esc(w.title)}">
      ${pictures.map(([key, alt, contain], i) => `<div class="editorial-work__image${contain ? ' editorial-work__image--contain' : ''}" data-reveal="editorial" style="--d:${i * 90}ms">${img(key, {
        alt,
        sizes: i === 0 ? '(max-width: 720px) 100vw, 50vw' : '(max-width: 720px) 50vw, 25vw',
      })}</div>`).join('\n      ')}
      <span class="gallery-hint" aria-hidden="true">В кейс <i class="ne-arrow"></i></span>
    </a>
</article>`;
}

const COVER_ALTS = {
  yumapos: 'Карточка товара в бэк-офисе на ноутбуке в кафе',
  kvas: 'Четыре банки кваса на столе с фруктами и кубками',
  'tsenny-put': 'Деревянная фишка на карте Петербурга',
  smile: 'Главная страница агентства СМАИЛ на мониторе',
  studyspace: 'Библиотека курсов и очередь уроков в планере Studyspace',
};

function editorialHero() {
  return `<section class="folio-intro wrap" aria-labelledby="designer-name">
    <div class="mast">
      <div class="mast__profile">
        ${img('me/portrait',{alt:'Портрет Вероники Саттаровой',eager:true,sizes:'100px'})}
        <p>Графический <br>и UI-дизайнер</p>
      </div>
      <h1 id="designer-name">Вероника<br>Саттарова</h1>
      <p class="mast__bio">${nb('В YUMAPOS проектирую интерфейсы для ресторанов. Ещё делаю сайты, упаковку и настольные игры.')}</p>
    </div>
    <div class="showcase" role="region" aria-roledescription="карусель" aria-label="Избранные работы">
      <div class="showcase__stage" aria-live="polite">
        ${WORKS.map((w,i) => {
          const photo = img(w.cover,{alt:COVER_ALTS[w.slug],eager:i === 0,sizes:'(max-width: 760px) 94vw, (min-width: 1540px) 790px, 52vw'});
          return `<article class="show-slide show-slide--${w.slug}" ${i ? 'hidden' : ''}>
            <a class="show-slide__link" href="${workHref(w.slug)}" aria-label="Открыть кейс ${esc(w.title)}">
              <div class="show-slide__photo">${i ? `<template>${photo}</template>` : photo}</div>
              <div class="show-slide__main"><div><h2>${w.title}</h2><p>${w.short}</p></div><time datetime="${w.year}">${w.year}</time><span class="show-slide__arrow" aria-hidden="true"><i class="ne-arrow"></i></span></div>
            </a>
          </article>`;
        }).join('')}
      </div>
      <div class="showcase__rail">
        <div class="showcase__picks" aria-label="Выбрать проект">
          ${WORKS.map((w,i) => `<button type="button" aria-label="${esc(w.title)}" aria-pressed="${i === 0}" data-slide="${i}"><img src="assets/img/showcase/${w.slug}.webp" alt="" width="120" height="80"></button>`).join('')}
        </div>
        <div class="showcase__arrows"><button type="button" data-step="-1" aria-label="Предыдущий проект">←</button><button type="button" data-step="1" aria-label="Следующий проект">→</button></div>
      </div>
    </div>
  </section>`;
}

function atlasHero() {
  const featured = WORKS.find(work => work.slug === 'kvas');
  const slides = [featured, ...WORKS.filter(work => work !== featured)];
  const index = slides.map((w,i) => `<button type="button" data-slide="${i}" aria-pressed="${i === 0}" aria-label="${esc(w.title)}"><span class="atlas-index__no" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><span>${w.slug === 'kvas' ? 'Drinks Collection' : w.title}</span></button>`).join('');
  return `<section class="atlas-cover wrap" aria-labelledby="cover-name">
    <h1 id="cover-name"><span>Вероника</span> <em>Саттарова</em></h1>
    <div class="atlas-cover__spread">
      <aside class="atlas-profile">
        <div class="atlas-portrait">${img('me/portrait',{alt:'Вероника Саттарова',eager:true,sizes:'(max-width:760px) 95px, 150px'})}</div>
        <div><h2>Графический <br>и UI-дизайнер</h2>
        <p>${nb('В YUMAPOS проектирую интерфейсы для ресторанов. Ещё делаю сайты, упаковку и настольные игры.')}</p></div>
      </aside>
      <div class="showcase atlas-carousel" role="region" aria-roledescription="карусель" aria-label="Избранные работы">
        <div class="showcase__stage" aria-live="polite">
          ${slides.map((w,i) => {
            const photo = img(w.cover,{alt:COVER_ALTS[w.slug],eager:i === 0,sizes:'(max-width:760px) 94vw, 52vw'});
            return `<article class="show-slide show-slide--${w.slug}" ${i ? 'hidden' : ''}>
              <a class="show-slide__link" href="${workHref(w.slug)}" aria-label="Открыть кейс ${esc(w.title)}">
                <div class="show-slide__photo">${i ? `<template>${photo}</template>` : photo}</div>
                <div class="atlas-caption"><div><h2>${w.title}</h2><p>${w.short}</p></div>
                <span class="atlas-caption__end"><time>${w.year}</time><i class="ne-arrow" aria-hidden="true"></i></span></div>
              </a></article>`;
          }).join('')}
        </div>
        <div class="atlas-index"><div class="atlas-index__label">Работы</div><div class="atlas-index__list">${index}</div>
          <div class="showcase__arrows"><button type="button" data-step="-1" aria-label="Предыдущий проект">←</button><button type="button" data-step="1" aria-label="Следующий проект">→</button></div>
        </div>
      </div>
    </div>
  </section>`;
}

function atlasApproach() {
  const notes = [
    ['Сценарий', 'В Studyspace следующий урок сразу виден на главном экране. Можно продолжить с того места, где остановилась.', 'studyspace/art-library', 'Библиотека курсов в Studyspace', 'studyspace'],
    ['Система', 'В бэк-офисе я привязала цвет к роли элемента. Теперь для новой клиентской темы достаточно заменить палитру.', 'yuma/palette-semantics', 'Семантические роли цветов в интерфейсе', 'yumapos'],
    ['Образ', 'Для четырёх вкусов кваса я придумала рыцарский турнир. У каждой банки свой герой, а у всей коллекции — общий сюжет.', 'kvas/riders', 'Всадники из кампании Drinks Collection', 'kvas'],
  ];
  return `<section id="principles" class="atlas-method"><div class="wrap">
    <h2 class="atlas-section-title">Как я работаю</h2>
    <div class="atlas-method__layout">
      <div class="atlas-method__notes">${notes.map(([title,copy,,,slug],i)=>`<details name="atlas-method" ${i===0?'open':''}><summary>${title}<span aria-hidden="true"></span></summary>
        <div><p>${nb(copy)}</p><a href="${workHref(slug)}">К проекту <i class="ne-arrow" aria-hidden="true"></i></a></div>
      </details>`).join('')}</div>
      <div class="atlas-method__plates">${notes.map(([,,key,alt],i)=>`<figure>${img(key,{alt,sizes:'(max-width:760px) 90vw, 44vw'})}<div class="atlas-method__object" aria-hidden="true">${img(['studyspace/art-mobile','yuma/multi-tags','kvas/sketch-crown'][i],{sizes:'140px'})}</div></figure>`).join('')}</div>
    </div></div></section>`;
}

const APPROACH = [
  ['Сценарий','Начинаю с того, что человек хочет сделать','В Studyspace я вынесла следующий урок на главный экран. Открываю планер и сразу продолжаю с того места, где остановилась.'],
  ['Система','Ищу правило, которое можно использовать снова','В бэк-офисе цвет привязан к роли элемента. Чтобы собрать тему для другого клиента, достаточно поменять палитру.'],
  ['Образ','Ищу образ, который выдержит целую серию','Для четырёх вкусов кваса я придумала рыцарский турнир. Рыцари отличаются друг от друга, а банки воспринимаются как одна коллекция.'],
];

function approach() {
  return `<section id="principles" class="approach" aria-label="Принципы работы">
    <div class="approach__surface">
      <div class="approach__orbit" aria-hidden="true"></div>
      <div class="keepsake keepsake--cards" aria-hidden="true">${img('tsenny/cards-flying',{sizes:'(max-width:700px) 150px, 310px'})}</div>
      <div class="keepsake keepsake--knight" aria-hidden="true">${img('kvas/sketch-crown',{sizes:'(max-width:700px) 88px, 156px'})}</div>
      <div class="keepsake keepsake--field" aria-hidden="true">${img('yuma/multi-tags',{sizes:'180px'})}</div>
      <div class="keepsake keepsake--smile" aria-hidden="true">${img('smile/phones',{sizes:'400px'})}</div>
      <div class="keepsake keepsake--phone" aria-hidden="true">${img('studyspace/art-mobile',{sizes:'340px'})}</div>
      <div class="approach__center">
        <p class="approach__eyebrow">Как я работаю</p>
        <div class="approach__stories" aria-live="polite">
          ${APPROACH.map(([,heading,body],i)=>`<div class="approach__story" ${i?'hidden':''}><h2>${nb(heading)}</h2><p>${nb(body)}</p></div>`).join('')}
        </div>
        <div class="approach__switch">${APPROACH.map(([name],i)=>`<button type="button" aria-pressed="${i === 0}">${name}</button>`).join('')}</div>
      </div>
    </div>
  </section>`;
}

function home(editorial = false, atlas = false) {
  const card = (w, i) => {
    const markup = `
    <a class="work ${i < 2 ? 'work--wide' : 'work--third'}" href="${workHref(w.slug)}" data-reveal${i % 3 ? ` style="--d:${(i % 3) * 0.08}s"` : ''}>
      <div class="work__img">${img(w.cover, { alt: `${w.title} — ${w.short}`, sizes: i < 2 ? '(max-width: 860px) 100vw, 50vw' : '(max-width: 860px) 100vw, 33vw' })}<span class="work__go" aria-hidden="true">↗</span></div>
      <div class="work__cap">
        <h3 class="work__title">${w.title}</h3>
        <span class="work__year">${w.year}</span>
        <p class="work__desc">${nb(w.desc)}</p>
        <span class="work__type t-label muted">${w.type}</span>
      </div>
    </a>`;
    if (w.slug !== 'yumapos') return markup;
    return `<div class="work--wide">
${markup}
      <a class="work__version" href="${YUMA_ORIGINAL}.html">Исходная версия кейса <span aria-hidden="true">↗</span></a>
    </div>`;
  };

  const services = [
    ['Веб-дизайн и сайты на Tilda', 'Лендинги и продуктовые страницы: структура, дизайн, Zero Block, адаптив', 'от 35 000 ₽', '', '01'],
    ['UI-дизайн', 'Интерфейсы, компоненты и состояния, UI-kit и дизайн-системы', 'от 6 000 ₽', 'за экран', '02'],
    ['Бренд и айдентика', 'Логотип, палитра, типографика, паттерны, гайдлайн', 'от 40 000 ₽', '', '03'],
    ['Презентации и отчёты', 'Коммерческие и корпоративные, в том числе по брендбуку клиента', 'от 1 500 ₽', 'за слайд', '04'],
    ['Упаковка и печать', 'От концепции до файлов по требованиям типографии', 'от 35 000 ₽', '', '05'],
  ];

  if (editorial) {
    const experience = [
      ['С ноября 2024', 'YUMAPOS', 'Дизайнер интерфейсов', 'Обновляю бэк-офис и дизайн-систему. Развиваю фирменный стиль, проектирую и собираю продуктовые страницы.'],
      ['2023 — 2024', 'TSQ Consulting', 'Младший графический дизайнер', 'Оформляла презентации и годовые отчёты. Для Ленстройтреста разработала графику настольной игры «Ценный путь».'],
    ];
    const body = `${atlas ? atlasHero() : editorialHero()}
      ${atlas ? '' : approach()}
      <section class="folio-worklist wrap" id="work"><h2 class="folio-title">Избранные проекты</h2>
        <div class="editorial-works">${WORKS.map(editorialWork).join('')}</div>
      </section>
      ${atlas ? atlasApproach() : ''}
      <section class="folio-experience" id="about"><div class="wrap folio-columns"><h2 class="folio-title">Опыт</h2>
        <div>${experience.map(([period,company,role,details]) => `<article class="career-row" data-reveal>
          <div class="career-row__meta"><span>${period}</span><span>${role}</span></div>
          <h3>${company}</h3><p>${nb(details)}</p></article>`).join('')}</div>
      </div></section>
      <section class="wrap folio-columns folio-services" id="services"><div><h2 class="folio-title">Услуги</h2>
        <a class="folio-services__details" href="price.html">Цены и этапы работы →</a></div>
        <div>${services.map(([title,,price,unit,group]) => `<a class="rate-row" href="price.html#g${group}" data-reveal><span>${esc(title)}</span><span>${price}${unit ? ' ' + unit : ''}</span><i class="ne-arrow" aria-hidden="true"></i></a>`).join('')}</div>
      </section>`;
    const file = atlas ? HOME_ATLAS : HOME_EDITORIAL;
    return layout({file, homeFile: file, title: 'Вероника Саттарова — графический и UI-дизайнер', description: 'Проектирую интерфейсы для ресторанов в YUMAPOS. Сайты, упаковка и настольные игры — в пяти избранных проектах.', body, ogImage:'yuma/cafe-hero'});
  }

  const caseLink = (slug, text) => `<a href="${workHref(slug)}">${text}</a>`;

  const hero = editorial ? editorialHero() : `<section class="hero wrap" aria-label="О дизайнере">
  <div class="grid hero__meta hr t-label">
    <div>Портфолио — 2026</div>
    <div class="muted">Графический и UI-дизайнер, 4 года</div>
    <div class="muted">Сейчас — дизайнер интерфейсов в YUMAPOS</div>
    <div class="muted">Беру сайты, презентации, упаковку</div>
  </div>
  <div class="hero__stage">
    <h1 class="hero__name t-display"><span class="line line--1"><span>Вероника</span></span><span class="line line--2"><span>Саттарова</span></span></h1>
  </div>
  <div class="hero__photo">${img('me/portrait', { alt: 'Вероника Саттарова', sizes: '(max-width: 860px) 82vw, 36vw', eager: true })}</div>
  <div class="grid hero__bottom">
    <div class="hero__intro">
      <span class="status"><i></i>Открыта к проектам</span>
      <p>${nb('Ищу подходящий способ рассказать о продукте: выстраиваю структуру, подбираю визуальный образ и делаю информацию понятной. Интерфейсы, сайты, презентации, упаковка и настольные игры.')}</p>
      <div class="hero__actions">
        <a class="btn btn--blue" href="${TG}" target="_blank" rel="noopener">Написать в Telegram <span class="arr">↗</span></a>
        <a class="btn btn--ghost" href="#work">Смотреть работы <span class="arr arr--d">↓</span></a>
        <a class="home-alternate link-u blue" href="${HOME_ATLAS}">Новая главная <span aria-hidden="true">↗</span></a>
      </div>
    </div>
  </div>
</section>`;

  const body = `${hero}
${editorial ? approach() : ''}
<section class="section wrap${editorial ? ' section--editorial' : ''}" id="work">
  ${editorial ? `<h2 class="editorial-works__title">Проекты</h2>
  <div class="grid editorial-index">
    <nav class="editorial-index__nav" aria-label="Проекты на странице">
      ${WORKS.map(w => `<a href="#work-${w.slug}">${w.title}</a>`).join('\n      ')}
    </nav>` : shead('01', 'Работы', '5 проектов', 'Избранные проекты', 'Дизайн-система продукта, сайт, упаковка, настольная игра и личный сервис.')}
  <div class="${editorial ? 'editorial-works' : 'grid works'}">${WORKS.map(editorial ? editorialWork : card).join('')}
  </div>
  ${editorial ? '</div>' : ''}
</section>

<section class="night about" id="about">
  <div class="wrap">
    <div class="grid shead hr" style="padding-bottom:0"><div class="shead__label t-label"><span><span class="n">02</span>&nbsp; Обо мне</span><span class="muted">4 года в дизайне</span></div></div>
    <div class="grid">
      <p class="about__lead" data-reveal>${nb(editorial ? 'В YUMAPOS проектирую интерфейсы для ресторанов. Раньше в TSQ Consulting оформляла презентации, отчёты и настольную игру.' : 'Последние 4 года я работаю с презентациями, интерфейсами, дизайн-системами, сайтами на Tilda и настольными играми.')}</p>${editorial ? '' : `
      <p class="about__sub" data-reveal>${nb('Люблю как чёткие задачи, в которых можно сосредоточиться на реализации, так и проекты, где есть пространство для собственных идей и поиска решений.')}</p>`}
      ${editorial ? '' : `<div class="clients" data-reveal aria-label="Проекты и презентации для">${['Авито', 'X5 Group', '«Пятёрочка»', '«Норникель»', '«Русагро»', 'Akkermann', 'Ленстройтрест', 'YUMAPOS'].map((c) => `<span class="chip">${c}</span>`).join('')}</div>`}
    </div>
    <div class="exp">
      <div class="grid exp__row hr" data-reveal>
        <div class="exp__period">11.2024 — сейчас</div>
        <div class="exp__co"><b>YUMAPOS</b><span>Дизайнер интерфейсов · B2B SaaS для ресторанов</span></div>
        <ul class="exp__list">
          <li>${nb('Визуальная идентичность: палитра, типографика, бренд-гайд, модульный паттерн, фотостиль')}</li>
          <li>${caseLink('yumapos', 'Редизайн бэк-офиса и дизайн-система')}</li>
          <li>${nb('Маркетинговый сайт на Tilda, презентации, рекламные материалы')}</li>
          <li>${caseLink('smile', 'Сайт digital-агентства СМАИЛ')}</li>
        </ul>
      </div>
      <div class="grid exp__row hr" data-reveal>
        <div class="exp__period">Лето 2023 — 11.2024</div>
        <div class="exp__co"><b>TSQ Consulting</b><span>Младший графический дизайнер · консалтинг</span></div>
        <ul class="exp__list">
          <li>${nb('Презентации для Авито, X5 Group, «Пятёрочки», «Норникеля», «Русагро», Akkermann — по брендбукам клиентов')}</li>
          <li>${nb('Вёрстка отчётов, в том числе ESG')}</li>
          <li>${caseLink('tsenny-put', 'Настольная игра «Ценный путь» для Ленстройтреста')}</li>
        </ul>
      </div>
      ${editorial ? '' : `<div class="grid exp__row hr" data-reveal>
        <div class="exp__period">Зима — лето 2023</div>
        <div class="exp__co"><b>Фриланс и пет-проекты</b><span>Упаковка, презентации, продукт</span></div>
        <ul class="exp__list">
          <li>${caseLink('kvas', 'HT Reviews Drinks Collection — упаковка кваса')}</li>
          <li>${nb('Liora Energy — презентации и обложки для соцсетей')}</li>
          <li>${nb('Фермент Плюс — упаковка и визуальная система')}</li>
          <li>${caseLink('studyspace', 'Studyspace — личный планер обучения')}</li>
        </ul>
      </div>`}
    </div>
  </div>
</section>

<section class="section wrap" id="services">
  ${editorial ? '<h2 class="editorial-works__title">Услуги и цены</h2>' : shead('03', 'Услуги', 'Цены ориентировочные', 'Чем могу помочь', 'Точную стоимость и сроки назову после короткого брифа.')}
  <div>
    ${services.map(([t, d, p, u, g], i) => `<a class="grid svc hr" href="price.html#g${g}" data-reveal><span class="svc__n t-label n">0${i + 1}</span><span class="svc__t">${t}</span><span class="svc__d">${nb(d)}</span><span class="svc__p">${p}${u ? `<small>${u}</small>` : ''}</span></a>`).join('\n    ')}
    <a class="svc-more hr" href="price.html"><span>Все услуги, сроки, этапы работы и ответы на вопросы</span><span class="arr arr--r">→</span></a>
  </div>
</section>`;
  const file = editorial ? HOME_EDITORIAL : 'index.html';
  return layout({ file, homeFile: file, title: 'Вероника Саттарова — графический и UI-дизайнер', description: 'Графический и UI-дизайнер: интерфейсы и дизайн-системы, сайты на Tilda, презентации, упаковка и настольные игры. 4 года опыта.', body: body.replace(/^[ \t]+$/gm, ''), current: '', ogImage: 'yuma/cover' });
}

/* ---------------- кейс ---------------- */
function casePage(slug, c) {
  const projectSlug = { [YUMA_ORIGINAL]: 'yumapos', [STUDYSPACE_EDITORIAL]: 'studyspace' }[slug] || slug;
  const i = WORKS.findIndex((w) => w.slug === projectSlug);
  const w = WORKS[i];
  const headingYear = /^\d{4}$/.test(w.year)
    ? `&#8288;<time class="sup case-year" datetime="${w.year}">${w.year}</time>`
    : '';
  const heading = `<h1 class="t-xxl" data-reveal>${c.h1 || w.title}${headingYear}</h1>`;
  const prev = WORKS[(i - 1 + WORKS.length) % WORKS.length];
  const next = WORKS[(i + 1) % WORKS.length];
  const versions = {
    yumapos: [['yumapos', 'Обновлённая версия'], [YUMA_ORIGINAL, 'Исходная версия']],
    studyspace: [[STUDYSPACE_EDITORIAL, 'Обновлённая вёрстка'], ['studyspace', 'Предыдущая вёрстка']],
  }[projectSlug];
  const body = `
<div class="wrap"><div class="crumbs hr"><a href="index.html#work">← Все работы</a><nav aria-label="Соседние кейсы"><a href="${workHref(prev.slug)}">← ${prev.title}</a><a href="${workHref(next.slug)}">${next.title} →</a></nav></div></div>${versions ? `
<div class="wrap">
  <nav class="case-versions" aria-label="Версии кейса ${esc(w.title)}">
    ${versions.map(([route, label]) => `<a href="${route}.html"${slug === route ? ' aria-current="page"' : ''}>${label}</a>`).join('\n    ')}
  </nav>
</div>` : ''}
${c.beforeCover ? `<header class="wrap grid case-hero">
  ${heading}
  ${c.beforeCover}
</header>` : `
<header class="wrap grid case-head${c.coverInHeader ? ' case-head--with-cover' : ''}">
  ${heading}${c.coverInHeader ? '\n  ' + c.cover : ''}
  <p class="t-l" data-reveal style="--d:.08s">${nb(c.lead)}</p>
</header>
<div class="wrap"><dl class="grid meta hr" data-stagger>
  ${c.meta.slice(0, 4).map(([k, v]) => `<div data-reveal><dt class="t-label">${k}</dt><dd>${v}</dd></div>`).join('\n  ')}
</dl></div>`}
${c.coverInHeader ? '' : `<div class="wrap cover">${c.cover}</div>`}
${c.body}
<div class="wrap">
  <a class="next" href="${workHref(next.slug)}" data-reveal>
    <div class="grid next__row hr">
      <div class="next__label t-label"><span>Следующий проект</span><span>${next.n} / 05</span></div>
      <div class="next__title">${next.title} <span class="arr arr--r">→</span></div>
      <div class="next__img">${img(next.cover, { alt: next.title, sizes: '(max-width: 860px) 100vw, 33vw' })}</div>
    </div>
  </a>
  <a class="prev-link" href="${workHref(prev.slug)}">← Предыдущий: ${prev.title}</a>
</div>`;
  return layout({
    file: slug + '.html',
    title: `${w.title} — ${c.short || w.short} · Вероника Саттарова`,
    description: c.lead,
    body,
    current: 'work',
    ogImage: c.ogImage || w.cover,
  });
}

/* ---------------- контент кейсов ---------------- */
const CASES = {};

CASES[YUMA_ORIGINAL] = {
  short: 'Исходная версия кейса',
  ogImage: 'yuma/cover',
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
    block('03', 'Как было', LEAD('Много разделов — и у каждого свой вид.') +
      P('Все поля карточки товара жили на одном полотне, жёлтый был единственным акцентом — им выделялись и кнопки, и переключатели, и заголовки групп. Таблицы, всплывающие окна и отчёты были собраны каждый по-своему, поэтому продукт ощущался как набор разных экранов.'),
      { after: figs(
        fig('yuma/before-menu', { cap: 'Карточка товара: десятки полей на одном полотне, мелкий текст, тёмное меню.' }),
        fig('yuma/before-table', { col: 'c-6', cap: 'Страница с таблицей.' }),
        fig('yuma/before-popup', { col: 'c-6', cap: 'Всплывающее окно.' }),
        fig('yuma/before-reports', { col: 'c-6', cap: 'Отчёты: четыре колонки ссылок с яркими плашками, которые спорят друг с другом.' }),
        fig('yuma/before-login', { col: 'c-6', cap: 'Страница входа.' }),
      ) }),
    block('04', 'Как стало', LEAD('Светлая основа, карточки-группы и жёлтый — только для главных действий.') +
      bullets([
        '<b>Визуальная концепция.</b> Разработала общий язык интерфейса — светлые слои, карточки, спокойная типографика — и масштабировала его на множество страниц продукта.',
        '<b>Компоненты.</b> Создала и обновила набор компонентов, продумала их состояния и правила применения.',
        '<b>Семантическая палитра.</b> Цвета закреплены за ролями — текст, заливки, бренд, позитив, негатив, внимание, акценты — и последовательно используются для разных состояний.',
        '<b>Гайды.</b> Для новых компонентов подготовила описания поведения и правил использования, чтобы система оставалась целостной при дальнейшей работе.',
      ]),
      { after: figs(
        fig('yuma/after-menu', { cap: 'Карточка товара: поля собраны в блоки «Основное», «Цена и налог», «Доступность», «Опции», «Изображение» и SEO.' }),
        fig('yuma/after-reports', { cap: 'Отчёты: каждая группа получила цвет из акцентной палитры и иконку — разделы различаются с первого взгляда.' }),
        fig('yuma/shop', { col: 'c-6', cap: 'Модальное окно «Доступность по магазинам»: поиск, выбор в две колонки и счётчик выбранного.' }),
        fig('yuma/after-login', { col: 'c-6', cap: 'Страница входа: мягкий фон в фирменном жёлтом, иллюстрация и карточка формы.' }),
      ) }),
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
  ].join('\n').replace(/^[ \t]+$/gm, ''),
};

CASES.yumapos = {
  lead: 'Разделила длинную форму товара на блоки, прояснила навигацию в отчётах и описала правила, по которым команда может собирать новые экраны.',
  meta: CASES[YUMA_ORIGINAL].meta,
  ogImage: 'yuma/cafe-hero',
  cover: `<figure class="fig yuma-hero" data-reveal>
    <div class="yuma-hero__frame">
      ${img('yuma/cafe-hero', { alt: 'Карточка товара YUMA Back Office на ноутбуке за стойкой кафе', eager: true })}
    </div>
  </figure>`,
  beforeCover: caseOpening(
    'Обновить бэк-офис, в котором формы, отчёты и настройки со временем стали выглядеть по-разному.',
    'Сгруппировала поля карточки товара, уточнила навигацию в отчётах и описала общие правила для компонентов и цвета.',
  ),
  body: caseStory([
    chapter('01', 'Контекст', 'Меню, остатки и продажи',
      P('Эти задачи требуют разных экранов: формы для редактирования товара, списков для выбора параметров и каталога отчётов. По мере роста продукта у экранов появились свои правила оформления. Мне нужно было обновить интерфейс и задать общие правила для элементов, которые повторяются из раздела в раздел.') +
      P('<b>Моя роль.</b> Визуальная концепция, UI-дизайн, компоненты и их состояния, семантическая палитра и документация.')),
    chapter('02', 'Карточка товара', 'Поля сгруппированы по задачам',
      P('В прежней карточке настройки товара шли на одном полотне. В новом макете я сгруппировала поля по тому, что управляющий хочет изменить: основные сведения, цена и налог, доступность, опции, изображение и SEO. Названия блоков помогают быстро определить, куда смотреть.'),
      { after: figs(
        fig('yuma/before-menu', { col: 'c-6', cls: 'yuma-screen yuma-comparison yuma-comparison--wide-source', browser: 'YUMA Back Office', alt: 'Карточка товара до редизайна', cap: '<span class="pair-label">До</span><br>Поля и настройки расположены на одном полотне.' }),
        fig('yuma/after-menu', { col: 'c-6', cls: 'yuma-screen yuma-comparison', browser: 'YUMA Back Office', alt: 'Карточка товара после редизайна', cap: '<span class="pair-label pair-label--after">После</span><br>Поля сгруппированы по задачам.' }),
      ) }),
    chapter('03', 'Отчёты', 'Поиск отчёта в два шага',
      P('В старом каталоге жёлтые плашки выделяли почти все группы. В новой версии я сделала верхний уровень заметнее: «Продажи», «Финансы», «Склад», «Маркетинг» и «Сотрудники» различаются по цвету и иконке. Внутри каждой группы названия отчётов остались обычными ссылками.'),
      { after: figs(
        fig('yuma/before-reports', { col: 'c-6', cls: 'yuma-screen yuma-comparison', browser: 'YUMA Back Office', alt: 'Каталог отчётов до редизайна', cap: '<span class="pair-label">До</span><br>Жёлтые заголовки одинаково выделяют разные группы.' }),
        fig('yuma/after-reports', { col: 'c-6', cls: 'yuma-screen yuma-comparison', browser: 'YUMA Back Office', alt: 'Каталог отчётов после редизайна', cap: '<span class="pair-label pair-label--after">После</span><br>Цвет и иконка помогают различить разделы.' }),
      ) }),
    chapter('04', 'Дизайн-система', 'Общие правила интерфейса', '',
      { after: `<div class="yuma-bento">
        <div class="yuma-bento__card yuma-bento__card--multi" data-reveal>
          <h3>Компоненты</h3>
          <p>Multi Select в настройках целевой аудитории</p>
          ${img('yuma/multi-audience', { alt: 'Выбор магазинов, зон доставки и групп клиентов в форме промоакции', sizes: SIZES.half })}
        </div>
        <div class="yuma-bento__card yuma-bento__card--color" data-reveal>
          <h3>Цветовые токены</h3>
          ${img('yuma/palette-scales', { alt: 'Шкалы нейтральных, фирменных и статусных цветов', sizes: SIZES.half })}
        </div>
        <div class="yuma-bento__card yuma-bento__card--type" data-reveal>
          <h3>Типографика</h3>
          <div class="yuma-bento__type" aria-hidden="true">Аа<span>123</span></div>
          <p>Inter · Roboto Mono</p>
        </div>
        <div class="yuma-bento__card yuma-bento__card--icons" data-reveal>
          <h3>Иконки</h3>
          ${img('yuma/ds-icons-detailed', { alt: 'Фрагмент библиотеки иконок для модулей бэк-офиса', sizes: SIZES.quarter })}
        </div>
      </div>` }),
    chapter('05', 'Multi Select', 'Мультивыбор в промоакциях',
      P('В настройках промоакции одни списки стоят рядом, другие занимают всю строку. Для длинных списков я оставила счётчик выбранного. В варианте с тегами видно до пяти позиций, и каждую видимую позицию можно убрать прямо из поля.') +
      P('Для обоих вариантов описала обычное состояние, наведение, ошибку и недоступность. На форме их можно увидеть рядом: поле магазинов недоступно, зоны доставки уже выбраны, а у исключённых групп показана ошибка.'),
      { after: `<div class="yuma-multi-variants">
        <figure data-reveal><figcaption>Со счётчиком</figcaption>${img('yuma/multi-counter', { alt: 'Поле «Группы клиентов» со счётчиком: выбрано 67', sizes: SIZES.half })}</figure>
        <figure data-reveal><figcaption>С тегами</figcaption>${img('yuma/multi-tags', { alt: 'Поле «Группы клиентов» с тегами, кнопками удаления и индикатором оставшихся позиций', sizes: SIZES.half })}</figure>
      </div>` + figs(
        fig('yuma/multiselect-states', { cls: 'yuma-system', alt: 'Пять состояний поля мультивыбора с тегами: Default, Hover, Error, Error hover и Disabled', cap: 'Состояния варианта с тегами.' }),
      ) }),
    chapter('06', 'Семантика цвета', 'Цветовые темы для разных брендов',
      P('Семантические токены привязаны к ролям в интерфейсе. Чтобы адаптировать бэк-офис под другой бренд, достаточно поменять значения токенов в теме. Компоненты подхватят новые цвета.'),
      { after: figs(
        fig('yuma/palette-semantics', { cls: 'yuma-system', alt: 'Одна карточка товара в четырёх цветовых темах, без логотипов', cap: 'Та же карточка товара в четырёх темах. Фирменный акцент меняется, структура интерфейса сохраняется.' }),
      ) }),
    chapter('07', 'Результат', 'Макеты и правила для команды',
      P('Я подготовила макеты и гайды, в которых команда может сверить вариант компонента, его состояния и назначение цвета. Эти правила можно применять к новым формам и таблицам по мере развития бэк-офиса.')),
  ]),
};

/* ---------------- обновлённые кейсы ---------------- */
function caseCover(key, alt) {
  return `<figure class="fig project-cover" data-reveal>${img(key, { alt, eager: true })}</figure>`;
}

function characterPair(name, ref, scene) {
  return `<div class="character-pair" data-reveal>
    <h3>${name}</h3>
    <div class="character-pair__images">
      <figure>${img(ref, { alt: `Лицо персонажа из листа образа, ${name}`, sizes: SIZES.quarter })}<figcaption>Лист образа</figcaption></figure>
      <figure>${img(scene, { alt: `Тот же персонаж в имиджевой сцене, ${name}`, sizes: SIZES.quarter })}<figcaption>Имиджевая сцена</figcaption></figure>
    </div>
  </div>`;
}

CASES.kvas = {
  h1: 'HT Reviews Drinks Collection',
  lead: 'Четыре вкуса кваса стали героями рыцарского турнира. Я разработала упаковку, собрала образы персонажей и перенесла их в серию имиджевых сцен.',
  meta: [
    ['Формат', 'Концепт мерча для HT Reviews'],
    ['Роль', 'Упаковка, иллюстрации, генерация и ретушь'],
    ['Коллекция', 'Четыре вкуса кваса'],
    ['Инструменты', 'Midjourney, Nano Banana, Photoshop'],
  ],
  cover: caseCover('kvas/feast', 'Банки Drinks Collection на пиршественном столе с фруктами и кубками'),
  beforeCover: caseOpening(
    'Придумать упаковку и образы для четырёх вкусов кваса в серии мерча HT Reviews.',
    'Связала вкусы легендой о рыцарском турнире и перенесла образы с упаковки в серию имиджевых сцен.',
  ),
  body: caseStory([
    chapter('01', 'Упаковка', 'Король на банке, рыцари в кампании',
      P('В основе коллекции легенда о турнире. Король на упаковке символизирует признание победителя, а рыцари представляют четыре вкуса в имиджевой кампании. Банки объединяют светлый фон, гравюра и растительный орнамент. Цвет и детали помогают различать вкусы.'),
      { after: figs(
        fig('kvas/still-all', { cls: 'project-media', cap: 'Коллекция на светлом фоне. Фрукты подсказывают вкус, а кубки продолжают тему турнира.' }),
        fig('kvas/can-grape', { col: 'c-3', cls: 'project-media', cap: 'Виноград-мята' }),
        fig('kvas/can-apple', { col: 'c-3', cls: 'project-media', cap: 'Двойное яблоко' }),
        fig('kvas/can-melon', { col: 'c-3', cls: 'project-media', cap: 'Арбуз-дыня' }),
        fig('kvas/can-pinkman', { col: 'c-3', cls: 'project-media', cap: 'Pinkman' }),
      ) }),
    chapter('02', 'Поиск образа', 'Поиск королевского образа',
      P('В Midjourney я перебирала персонажей, силуэты и степень детализации. Сравнила рыцаря верхом, медведя с кубком и королевские фигуры. Для упаковки выбрала образ короля и связала его с оттенками и растительными деталями каждого вкуса.'),
      { after: figs(
        fig('kvas/sketch-knight', { col: 'c-4', cls: 'project-media project-sketch', cap: 'Рыцарь со щитом' }),
        fig('kvas/sketch-bear', { col: 'c-4', cls: 'project-media project-sketch', cap: 'Медведь с кубком' }),
        fig('kvas/sketch-crown', { col: 'c-4', cls: 'project-media project-sketch', cap: 'Королевская фигура' }),
      ) }),
    chapter('03', 'Герои от кадра к кадру', 'Те же герои в разных ракурсах',
      P('Для каждого рыцаря я собрала лист образа: лицо крупным планом, профиль и фигура в доспехах. По этим референсам отбирала кадры в Nano Banana, сверяя черты лица, волосы и силуэт доспехов. Отдельные детали изображений дорабатывала вручную в Photoshop, там же собирала финальные материалы.'),
      { after: `<div class="project-pairs">
        ${characterPair('Виноград-мята', 'kvas/grape-reference', 'kvas/grape-scene')}
        ${characterPair('Двойное яблоко', 'kvas/apple-reference', 'kvas/apple-scene')}
      </div>` + figs(
        fig('kvas/model-1', { col: 'c-6', cls: 'project-media', cap: 'Лист образа целиком. Доспех в полный рост и лицо в разных ракурсах.' }),
        fig('kvas/model-2', { col: 'c-6', cls: 'project-media', cap: 'У другого вкуса свои черты лица, волосы и детали доспеха.' }),
      ) }),
    chapter('04', 'Кампания', 'Упаковка в предметных и сюжетных кадрах',
      P('Светлая предметная композиция подчёркивает вкус и дизайн банки. Для имиджевых сцен я использовала доспехи, кубки и бархат, чтобы связать упаковку с миром героев. Итог проекта — серия банок, образы четырёх персонажей и материалы для публикаций.'),
      { after: figs(
        fig('kvas/toast', { cls: 'project-media', cap: 'Тост победителей. Здесь в одном кадре встречаются разные вкусы.' }),
        fig('kvas/hand-can', { col: 'c-6', cls: 'project-media', cap: 'Упаковка крупным планом в руке рыцаря.' }),
        fig('kvas/layout-grape', { col: 'c-6', cls: 'project-media', cap: 'Готовая публикация: герой рядом с банкой своего вкуса.' }),
      ) }),
  ]),
};

CASES['tsenny-put'] = {
  lead: 'Корпоративная настольная игра о ценностях Ленстройтреста. Я участвовала в разработке визуальной концепции карт и подготовке материалов к печати.',
  meta: [
    ['Год', '2024'],
    ['Команда', 'TSQ Consulting'],
    ['Заказчик', 'Ленстройтрест'],
    ['Мой вклад', 'Концепция игровых карт, препресс, оформление кейса'],
  ],
  cover: caseCover('tsenny/token-closeup', 'Керамическая миниатюра петербургского здания на игровом поле'),
  beforeCover: caseOpening(
    'Помочь сотрудникам Ленстройтреста обсудить корпоративные ценности на ситуациях из рабочей практики.',
    'Команда разработала настольную игру с картой Петербурга и карточками. Я участвовала в разработке визуальной концепции карт и подготовке материалов к печати.',
  ),
  body: caseStory([
    chapter('01', 'В контексте игры', 'Рабочие ситуации на карте Петербурга',
      P('TSQ Consulting разработала игру, чтобы сотрудники могли разобрать корпоративные ценности на реальных ситуациях. Карта Петербурга, здания-фишки и карточки превращают разговор о ценностях в маршрут по знакомому городу.'),
      { after: figs(
        fig('tsenny/playing', { col: 'c-5', cls: 'project-media project-tabletop', cap: 'Разложенная игра в офисе. Видно, как поле и колоды работают за одним столом.' }),
        fig('tsenny/board', { col: 'c-7', cls: 'project-media project-tabletop', cap: 'На большой карте отмечены маршруты, достопримечательности и офис компании.' }),
      ) }),
    chapter('02', 'Мой вклад', 'Своё здание для каждой ценности',
      P('Команда рассматривала разные подходы к иллюстрациям. В итоге взяли язык архитектурного чертежа и реальные здания Петербурга. Я участвовала в разработке визуальной концепции карт и подготовке игровых материалов к печати.'),
      { after: figs(
        fig('tsenny/concept', { cls: 'project-media', cap: 'Поиск стиля карт до финальной серии.' }),
        fig('tsenny/card-photo-decency', { col: 'c-4', cls: 'project-media project-city-card', cap: 'Порядочность' }),
        fig('tsenny/card-photo-passion', { col: 'c-4', cls: 'project-media project-city-card', cap: 'Увлечённость' }),
        fig('tsenny/card-photo-human', { col: 'c-4', cls: 'project-media project-city-card', cap: 'Человечность' }),
      ) }),
    chapter('03', 'Поле', 'Петербург в стилистике генплана',
      P('Команда взяла 3D-модель реального Петербурга. Сетку доработала в SketchUp, а ключевые детали дорисовала в Photoshop. Из двух направлений заказчик выбрал приглушённую палитру и подачу в духе генплана.'),
      { after: figs(
        fig('tsenny/city-3d', { col: 'c-6', cls: 'project-media', cap: 'Драфт 3D-модели Петербурга.' }),
        fig('tsenny/map-v2', { col: 'c-6', cls: 'project-media', cap: 'Фрагмент карты в выбранной стилистике генплана.' }),
      ) }),
    chapter('04', 'Комплект', 'Что входит в комплект',
      P('Команда подготовила поле, колоды, мануал ведущего и памятки для участников. Керамические здания-фишки изготовила мастерская «Легко-Легко». На обложку коробки вынесли карту, а на боковые стороны — иллюстрации ценностей.'),
      { after: figs(
        fig('tsenny/box', { col: 'c-6', cls: 'project-media', cap: 'Коробка с картой Петербурга на обложке.' }),
        fig('tsenny/booklet', { col: 'c-6', cls: 'project-media', cap: 'Мануал и памятки в визуальном стиле игры.' }),
      ) }),
    chapter('05', 'Результат', 'Игра для адаптации сотрудников',
      P('TSQ Consulting передала заказчику комплект и обучила внутренних ведущих. О рабочем процессе и механике игры есть <a class="link-u blue" href="https://tsqconsulting.ru/cases/lenstroytrest" target="_blank" rel="noopener">кейс команды TSQ Consulting ↗</a>.')),
  ]),
};

CASES.smile = {
  lead: 'Сайт digital-агентства для HoReCa и ритейла. Я превратила длинный список услуг в понятный маршрут от задачи бизнеса до заявки.',
  meta: [
    ['Год', '2025'],
    ['Роль', 'Веб-дизайн, арт-дирекшн, вёрстка'],
    ['Платформа', 'Tilda · Zero Block'],
    ['Сайт', '<a href="https://smile-digital.ru/" target="_blank" rel="noopener">smile-digital.ru ↗</a>'],
  ],
  cover: `<figure class="fig project-cover" data-reveal>
    <video src="assets/video/smile-screencast.mp4" poster="assets/img/smile/screencast-poster.webp"
      width="1344" height="896" muted playsinline controls preload="none" data-autoplay
      aria-label="Скринкаст сайта СМАИЛ: прокрутка от первого экрана до подвала">
      Скринкаст сайта СМАИЛ.
    </video>
  </figure>`,
  beforeCover: caseOpening(
    'Собрать сайт агентства, чтобы владельцы бизнеса могли понять, чем оно занимается, и выбрать нужную услугу.',
    'Объединила услуги в шесть групп и выстроила страницу от задач бизнеса к кейсам и заявке. Собрала сайт и адаптив в Tilda.',
  ),
  body: caseStory([
    chapter('01', 'Контекст', 'От рекламного отдела к агентству',
      P('Раньше отдел работал с клиентами материнской компании. Новому агентству нужен был сайт, который объяснит услуги владельцам ресторанов, магазинов и других локальных бизнесов. Название и идею разработала маркетолог. Я отвечала за визуальную подачу материалов, структуру блоков, адаптив и сборку в Tilda.')),
    chapter('02', 'Первый экран', 'Улыбка на первом экране',
      P('Метафору улыбки я перенесла в фотографию первого экрана. Дуга связывает довольного гостя и спокойного владельца. Рядом — предложение агентства и кнопка консультации.'),
      { after: figs(
        fig('smile/hero', { cls: 'project-media project-browser', browser: 'smile-digital.ru', cap: 'Первый экран. Предложение, фотография и дуга читаются в одной композиции.' }),
      ) }),
    chapter('03', 'Структура услуг', 'Из 40 пунктов — шесть групп услуг',
      P('Список начинался с отдельных рекламных инструментов. Я сгруппировала их по задачам бизнеса и вынесла технические детали внутрь карточек. Так посетитель может сначала найти подходящую услугу и уже потом узнать, что в неё входит.'),
      { after: figs(
        fig('smile/services-raw', { col: 'c-4', cls: 'project-media project-document', cap: 'Исходный перечень услуг.' }),
        fig('smile/services', { col: 'c-8', cls: 'project-media project-browser', browser: 'smile-digital.ru', cap: 'На сайте — шесть групп, короткие описания и подробности по каждой услуге.' }),
      ) }),
    chapter('04', 'Арт-дирекшн', 'Проблема и решение рядом',
      P('В первом варианте персонаж, цифры и плашки конкурировали за внимание. Для финального блока я развела проблему и решение по двум колонкам. Фотографии сгенерировала в тёплом свете и подобрала одежду в палитре сайта. Красный и зелёный помогают считывать сравнение.'),
      { after: figs(
        fig('smile/before-problem', { col: 'c-6', cls: 'project-media', cap: 'Первый вариант. Инфографика и персонаж в одной сцене.' }),
        fig('smile/problem', { col: 'c-6', cls: 'project-media project-browser', browser: 'smile-digital.ru', cap: 'Финальный блок. Проблема и решение читаются отдельно.' }),
      ) }),
    chapter('05', 'Путь к заявке', 'От услуг к заявке на телефоне',
      P('На странице можно узнать, кому подходит агентство, посмотреть услуги и кейсы, затем оставить заявку. Для адаптива я перестроила блоки в Zero Block и сохранила зелёный акцент для ключевых действий.'),
      { after: figs(
        fig('smile/phones', { cls: 'project-media', cap: 'Мобильные экраны: первый экран, объяснение услуг и блоки перед заявкой.' }),
        fig('smile/cases', { col: 'c-6', cls: 'project-media project-browser', browser: 'smile-digital.ru', cap: 'Кейсы помогают сверить предложение с примерами работы.' }),
        fig('smile/lead', { col: 'c-6', cls: 'project-media project-browser', browser: 'smile-digital.ru', cap: 'Форма консультации в конце маршрута.' }),
      ) }),
    chapter('06', 'Результат', 'Сайт для клиентов агентства',
      P('Опубликованный сайт доступен на <a class="link-u blue" href="https://smile-digital.ru/" target="_blank" rel="noopener">smile-digital.ru ↗</a>.')),
  ]),
};

CASES.studyspace = {
  lead: 'Личный планер, который собирает курсы в одну библиотеку и показывает, какой урок смотреть дальше.',
  meta: [
    ['Формат', 'Личный продукт'],
    ['Роль', 'Продукт, сценарии, UX/UI, реализация'],
    ['Стек', 'GitHub, Vercel, Supabase'],
    ['Интерфейс', 'Lora, PT Root UI, Phosphor'],
  ],
  coverInHeader: true,
  cover: `<figure class="fig project-cover studyspace-demo">
    <video src="assets/video/studyspace.mp4" poster="${largest('studyspace/art-feature')}"
      width="1280" height="720" muted playsinline controls preload="metadata" data-autoplay
      aria-label="Демонстрация Studyspace: текущий урок, библиотека, курс и импорт уроков">
    </video>
  </figure>`,
  body: [
    block('01', 'Задача', LEAD('Курсы хранятся в разных местах. Продолжить урок хочется сразу.') +
      P('Я сделала планер для своего обучения. В нём собрала видео, ссылки и конспекты, добавила прогресс и очередь. Главный сценарий начинается с вопроса «что смотреть сегодня?»')),
    block('02', 'Следующий урок', LEAD('Очередь помогает продолжить с того места, где остановилась.') +
      P('На главной виден текущий урок. Отсюда можно открыть видео, перейти к конспекту или отметить урок пройденным. Рядом видны следующие уроки и прогресс по курсу.')),
    block('03', 'Библиотека и курс', LEAD('У каждого курса видны направление, уроки и прогресс.') +
      P('В библиотеке можно отфильтровать курсы по темам. У каждого направления свой цвет для тега и прогресса. На странице курса собраны уроки и ссылки на конспекты, чтобы к ним можно было вернуться из этого же места.'),
      { after: figs(
        fig('studyspace/art-library', { cls: 'project-media project-browser studyspace-screen', browser: 'studyspace.app/library', cap: 'Библиотека. Цвет связывает направление курса с его индикатором прогресса.' }),
        fig('studyspace/art-course', { cls: 'project-media project-browser studyspace-screen studyspace-screen--detail', browser: 'studyspace.app/course', cap: 'На странице курса видны пройденные уроки и ссылки на конспекты.' }),
      ) }),
    block('04', 'Добавление уроков', LEAD('Курс можно добавить по ссылке на плейлист.') +
      P('Планер подтягивает названия и ссылки уроков. Список можно дополнить вручную, отредактировать и переставить уроки.'),
      { after: figs(
        fig('studyspace/art-import', { cls: 'project-media studyspace-screen studyspace-screen--detail studyspace-import', cap: 'Перед сохранением можно проверить и отредактировать названия и ссылки.' }),
        fig('studyspace/art-mobile', { cls: 'project-media studyspace-screen studyspace-screen--detail', cap: 'На телефоне можно продолжить текущий урок, открыть библиотеку и посмотреть список уроков курса.' }),
      ) }),
    block('05', 'Результат', LEAD('Учебные материалы собраны в одном личном рабочем пространстве.') +
      P('Я спроектировала и собрала Studyspace для себя. Вход по email и права доступа к данным в Supabase поддерживают личный формат продукта.')),
  ].join('\n').replace(/^[ \t]+$/gm, ''),
};

CASES[STUDYSPACE_EDITORIAL] = {
  ...CASES.studyspace,
  coverInHeader: false,
  short: 'Персональный планер обучения',
  lead: 'Сохраняю курсы в одном месте и вижу, с какого урока продолжить сегодня.',
  beforeCover: caseOpening(
    'Видео и конспекты хранились в разных местах. Перед каждым занятием приходилось вспоминать, на каком уроке я остановилась.',
    'Я собрала материалы в личный планер. На экране «Сегодня» видны текущий урок, ссылка на конспект и очередь. Отмечаю урок пройденным — планер показывает следующий.',
  ),
  body: caseStory([
    caseChapter('library', '01', 'Библиотека и курс', 'От библиотеки к уроку',
      P('Сначала выбираю направление, затем открываю курс. Цвет тега повторяется в индикаторе прогресса, а на странице курса уроки и конспекты собраны рядом.'),
      { after: `<div class="study-editorial__pair">
        ${fig('studyspace/art-library', { cls: 'project-media project-browser', browser: 'studyspace.app/library', cap: 'Библиотека с фильтрами по направлениям.' })}
        ${fig('studyspace/art-course', { cls: 'project-media project-browser', browser: 'studyspace.app/course', cap: 'Уроки, прогресс и конспекты курса.' })}
      </div>` }),
    caseChapter('import', '02', 'Импорт и адаптив', 'От ссылки до занятия',
      P('Добавляю плейлист, проверяю названия и порядок уроков. Затем могу продолжить на телефоне с того же места.'),
      { after: `<div class="study-editorial__pair">
        ${fig('studyspace/art-import', { cls: 'project-media project-browser', browser: 'studyspace.app/import', cap: 'Импорт по ссылке с редактированием списка.' })}
        ${fig('studyspace/art-mobile', { cls: 'project-media project-browser', browser: 'studyspace.app', cap: '«Сегодня», библиотека и курс на телефоне.' })}
      </div>` }),
    caseChapter('result', '03', 'Результат', 'Личное пространство для учёбы',
      P('Я спроектировала и собрала Studyspace для себя. Вход по email и права доступа в Supabase ограничивают доступ к учебным материалам.')),
  ]),
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

const redirect = (to) => `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>Переадресация…</title><meta http-equiv="refresh" content="0; url=${to}"><link rel="canonical" href="${SITE}${to}"><meta name="robots" content="noindex"></head><body><a href="${to}">${to}</a></body></html>\n`;

// мета «Ценного пути» — 4 ячейки в строку
CASES['tsenny-put'].meta = [
  ['Год', '2024 · 3 месяца'],
  ['Заказчик', 'Ленстройтрест'],
  ['Роль', 'Концепция игровых карт, подготовка материалов к печати'],
  ['Команда', 'TSQ Consulting, 6 человек; фишки — мастерская «Легко-Легко»'],
];

const FAQ = [
  ['Сколько стоит проект?', 'Ориентиры — в таблице выше. Точную стоимость назову после короткого брифа: задам несколько вопросов о задаче и пришлю оценку с этапами и сроками.'],
  ['Можно заказать только макет без вёрстки?', 'Да. Могу сделать макет в Figma для вашего разработчика или, наоборот, собрать сайт на Tilda по готовому макету.'],
  ['Что нужно от меня для старта?', 'Описание задачи, тексты или тезисы, примеры, которые нравятся и не нравятся, и брендбук, если он есть. Если текстов нет — помогу со структурой.'],
  ['Работаете с брендбуком и шаблонами компании?', 'Да, большая часть презентаций в TSQ Consulting делалась по корпоративным шаблонам и брендбукам клиентов.'],
  ['Как с вами связаться?', 'Быстрее всего — в Telegram @veronikactrlz.'],
];

function pricePage() {
  const groups = PRICES.map((g) => `
<section class="pgroup wrap" id="g${g.n}">
  <div class="grid pgroup__row hr">
    <div class="pgroup__head" data-reveal><span class="t-label"><span class="n">${g.n}</span>&nbsp; Направление</span><h2>${nb(g.t)}</h2><p>${nb(g.d)}</p></div>
    <div class="pgroup__table" data-reveal>
      <div class="price price--head t-label"><span>Задача</span><span class="price__d">Что входит</span><span>Срок</span><span style="text-align:right">Стоимость</span></div>
      ${g.rows.map(([t, d, time, p, unit]) => `<div class="price"><span class="price__t">${nb(t)}</span><span class="price__d">${nb(d)}</span><span class="price__time">${time}</span><span class="price__p">${p}${unit ? `<small>${unit}</small>` : ''}</span></div>`).join('\n      ')}
    </div>
  </div>
</section>`).join('');

  const steps = [
    ['Бриф', 'Обсуждаем задачу, аудиторию, сроки и примеры, которые нравятся.'],
    ['Оценка', 'Фиксирую объём, этапы, стоимость и сроки.'],
    ['Концепция', 'Показываю направление и ключевые экраны или макеты.'],
    ['Доработка и передача', 'Развиваю решение на все материалы, вношу правки, отдаю исходники, файлы для печати или опубликованный сайт.'],
  ];

  const body = `
<div class="wrap"><div class="crumbs hr"><a href="index.html">← Главная</a><span class="muted">Цены ориентировочные</span></div></div>
<header class="wrap grid case-head">
  <h1 class="t-xxl" data-reveal>Услуги и цены<span class="sup">03</span></h1>
  <p class="t-l" data-reveal style="--d:.08s">${nb('Цены указаны «от». Точную стоимость и сроки назову после короткого брифа — они зависят от объёма, срочности и исходных материалов.')}</p>
  <div data-reveal style="grid-column:1/-1;margin-top:clamp(24px,3vw,40px)"><a class="btn btn--blue" href="${TG}" target="_blank" rel="noopener">Обсудить задачу в Telegram <span class="arr">↗</span></a></div>
</header>
<div style="height:clamp(30px,4vw,60px)"></div>
${groups}
<section class="night" style="margin-top:clamp(100px,12vw,180px);padding:clamp(80px,10vw,150px) 0">
  <div class="wrap">
    ${shead('', 'Как проходит работа', '4 шага', 'От брифа до готовых файлов', 'Вы всегда знаете, на каком этапе проект и что будет дальше.').replace('<span class="n"></span>&nbsp; ', '')}
    <div class="grid steps hr" data-stagger>
      ${steps.map(([t, d], i) => `<div class="step" data-reveal><span class="t-label n">0${i + 1}</span><b>${t}</b><p>${nb(d)}</p></div>`).join('\n      ')}
    </div>
  </div>
</section>
<section class="section wrap" id="faq">
  <div class="grid pgroup__row hr">
    <div class="pgroup__head" data-reveal><span class="t-label">Вопросы</span><h2>Вопрос — ответ</h2><p>${nb('Не нашли свой вопрос — напишите, отвечу лично.')}</p></div>
    <div class="faq" data-reveal>
      ${FAQ.map(([q, a], i) => `<details${i === 0 ? ' open' : ''}><summary><span>${nb(q)}</span></summary><div class="ans">${nb(a)}</div></details>`).join('\n      ')}
    </div>
  </div>
</section>`;
  return layout({ file: 'price.html', title: 'Услуги и цены — Вероника Саттарова, дизайнер', description: 'Ориентировочные цены на дизайн: сайты на Tilda, UI и дизайн-системы, айдентика, презентации, упаковка и настольные игры.', body, current: 'price' });
}

function notFound() {
  const body = `
<section class="nf wrap">
  <span class="t-label n">Ошибка 404</span>
  <h1 class="t-xxl">Такой страницы нет</h1>
  <p class="t-l muted">${nb('Возможно, она переехала. Начните с главной или посмотрите работы.')}</p>
  <div class="hero__actions"><a class="btn" href="index.html">На главную</a><a class="btn btn--ghost" href="index.html#work">Все работы</a></div>
</section>`;
  return layout({ file: '404.html', title: 'Страница не найдена — Вероника Саттарова', description: 'Страница не найдена.', body, current: '' })
    .replace('<head>', '<head>\n<base href="/veronikasattarova-portfolio-2026/">');
}

/* ---------------- запись ---------------- */
const write = (f, s) => { fs.writeFileSync(path.join(DOCS, f), s); console.log('→', f); };
const screening = require('./screening')({ works: WORKS, galleries: HOME_GALLERIES, copy: HOME_PROJECT_COPY, img, workHref, tg: TG, behance: BEHANCE, dprofile: DPROFILE });
write('index.html', layout({ file: 'index.html', title: 'Вероника Саттарова — графический и UI-дизайнер', description: 'Интерфейсы для ресторанов, упаковка, сайты и настольные игры. Пять проектов Вероники Саттаровой.', ogImage: 'kvas/feast', body: screening.home() }));
write(HOME_EDITORIAL, home(true));
write(HOME_ATLAS, home(true,true));
for (const w of WORKS) write(w.slug + '.html', casePage(w.slug, CASES[w.slug]));
write(YUMA_ORIGINAL + '.html', casePage(YUMA_ORIGINAL, CASES[YUMA_ORIGINAL]));
write(STUDYSPACE_EDITORIAL + '.html', casePage(STUDYSPACE_EDITORIAL, CASES[STUDYSPACE_EDITORIAL]));
write('price.html', pricePage());
write('404.html', notFound());
// старые адреса предыдущей версии сайта
write('yumapos-v2.html', redirect('yumapos.html'));
write('smail.html', redirect('smile.html'));
write('services.html', redirect('price.html'));
write('about.html', redirect('index.html#about'));
write('projects.html', redirect('index.html#work'));
fs.writeFileSync(path.join(DOCS, '.nojekyll'), '');
fs.writeFileSync(path.join(DOCS, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}sitemap.xml\n`);
fs.writeFileSync(path.join(DOCS, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${['', ...WORKS.map((w) => workHref(w.slug)), 'price.html'].map((p) => `  <url><loc>${SITE}${p}</loc></url>`).join('\n')}\n</urlset>\n`);
