/* Общий каркас и главная страница портфолио. */
function screening({ works, galleries, copy, img, workHref, tg, behance, dprofile }) {
  const projects = ['kvas', 'yumapos', 'smile', 'tsenny-put', 'studyspace'].map(slug => works.find(w => w.slug === slug));
  const title = w => w.slug === 'kvas' ? 'Drinks Collection' : w.title;
  const media = (key, alt, sizes, eager = false) => img(key, { alt, sizes, eager });
  const nav = (home, price) => {
    const link = id => (home ? '' : 'index.html') + '#' + id;
    return `<header class="header screen-nav"><div class="screen-bar">
      <a class="screen-sign" href="index.html" aria-label="Вероника Саттарова — на главную"><b aria-hidden="true">вс</b><span>Вероника Саттарова</span></a>
      <nav class="screen-links" aria-label="Основная навигация"><a href="${link('work')}">Проекты</a><a href="${link('about')}">Обо мне</a><a href="price.html"${price ? ' aria-current="page"' : ''}>Услуги</a></nav>
      <a class="screen-message" href="${tg}" target="_blank" rel="noopener">Написать <i class="ne-arrow" aria-hidden="true"></i></a>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mnav">Меню</button></div>
      <nav class="mnav" id="mnav" aria-label="Меню"><a href="${link('work')}">Проекты</a><a href="${link('about')}">Обо мне</a><a href="price.html">Услуги</a><a href="${tg}" target="_blank" rel="noopener">Telegram <i class="ne-arrow" aria-hidden="true"></i></a></nav></header>`;
  };
  const footer = () => `<footer class="screen-contact" id="contact"><div>
    <p>Связаться со мной</p><a class="screen-contact__title" href="${tg}" target="_blank" rel="noopener">Telegram <span><i class="ne-arrow" aria-hidden="true"></i></span></a></div>
    <div class="screen-base"><span>© Вероника Саттарова</span><nav aria-label="Профили"><a href="${behance}" target="_blank" rel="noopener">Behance <i class="ne-arrow" aria-hidden="true"></i></a><a href="${dprofile}" target="_blank" rel="noopener">Dprofile <i class="ne-arrow" aria-hidden="true"></i></a></nav><button type="button" data-top>Наверх ↑</button></div></footer>`;
  function hero() {
    const art = {
      kvas: ['kvas/riders', 'kvas/feast', 'Четыре вкуса кваса в образах рыцарей.', ['Упаковка', 'Арт-дирекшн']],
      yumapos: ['yuma/cafe-hero', 'yuma/after-menu', 'Карточка товара, отчёты и компоненты для бэк-офиса ресторана.', ['Интерфейс', 'Дизайн-система']],
      smile: ['smile/studio-monitor', 'smile/hero', 'Сайт агентства, где услуги собраны по задачам бизнеса.', ['Веб-дизайн', 'Tilda']],
      'tsenny-put': ['tsenny/tokens-board', 'tsenny/box', 'Настольная игра о ценностях компании на карте Петербурга.', ['Игра', 'Полиграфия']],
      studyspace: ['studyspace/cover', 'studyspace/art-feature', 'Личный планер с курсами, конспектами и очередью уроков.', ['UX/UI', 'Личный проект']]
    };
    const deskScenes = projects.map((w,i) => `<img class="desk-photo" data-desk-scene="${w.slug}" src="assets/img/desk/scene-${w.slug}.webp" alt="Вероника за рабочим столом в образе для проекта ${title(w)}" aria-hidden="${i !== 0}"${i === 0 ? ' data-current fetchpriority="high"' : ''}>`).join('');
    const slides = projects.map((w,i) => {
      const [scene, cover, description, tags] = art[w.slug];
      const picture = (key, alt, sizes) => {
        const photo = media(key,alt,sizes,i === 0);
        return i === 0 ? photo : `<template>${photo}</template>`;
      };
      return `<div data-project="${w.slug}" class="show-slide feature-slide feature-slide--${w.slug}" ${i ? 'hidden' : ''}>
        <div class="feature-scene">${picture(scene,'','(max-width: 700px) 100vw, 50vw')}</div>
        <a class="feature-card" href="${workHref(w.slug)}" aria-label="Открыть кейс ${title(w)}">
          <div class="feature-picture">${picture(cover,w.short,'(max-width: 700px) 70vw, 360px')}</div>
          <div class="feature-copy"><div class="feature-meta"><span>${tags.join(' · ')}</span><time>${w.year}</time></div>
            <div class="feature-title"><h2>${title(w)}</h2><i class="ne-arrow" aria-hidden="true"></i></div><p>${description}</p></div>
        </a></div>`;
    }).join('');
    return `<section class="feature" aria-label="О дизайнере и её проектах">
      <div class="feature-author"><div class="desk-intro"><p class="desk-role">Графический и UI-дизайнер</p>
        <h1>Вероника<br>Саттарова</h1><p class="feature-bio">Проектирую интерфейсы для ресторанов в YUMAPOS. Делаю сайты, упаковку и настольные игры.</p>
        <a class="feature-all" href="#work">Все проекты <span aria-hidden="true">↓</span></a></div>
        <div class="desk-space"><div class="desk-stage">${deskScenes}</div></div>
      </div>
      <div class="showcase feature-show" aria-label="Карусель проектов" aria-roledescription="карусель">
        <div class="showcase__stage feature-stage">${slides}</div>
        <div class="feature-controls"><span class="carousel-count"><b data-position>01</b> / 05</span><div class="feature-picks" role="group" aria-label="Выбрать проект">${projects.map((w,i) => `<button type="button" data-slide="${i}" aria-pressed="${i===0}" aria-label="Показать ${title(w)}"><span></span></button>`).join('')}</div>
        </div>
      </div></section>`;
  }
  function project(w) {
    const frames = {
      yumapos: [['yuma/cafe-hero','Рабочее место управляющего'],['yuma/after-reports','Каталог отчётов']],
      kvas: [['kvas/hand-can','Банка кваса в руке рыцаря'],['kvas/riders','Персонажи кампании']],
      smile: [['smile/studio-monitor','Сайт агентства'],['smile/phones','Мобильные экраны']],
      'tsenny-put': [['tsenny/tokens-board','Деревянные фишки на игровом поле'],['tsenny/booklet','Разворот правил игры']],
      studyspace: [['studyspace/art-feature','Планер обучения'],['studyspace/art-course','Экран курса']]
    };
    return `<article class="work-spread work-spread--${w.slug}" data-reveal><a href="${workHref(w.slug)}" aria-label="Открыть кейс ${title(w)}">
      <div class="spread-caption"><time>${w.year}</time><h3>${title(w)}</h3><p>${copy[w.slug]}</p></div>
      <div class="spread-frames">${frames[w.slug].map(([key,alt]) => `<div>${media(key,alt,'(max-width: 700px) 58vw, 32vw')}</div>`).join('')}
      <span class="spread-open" aria-hidden="true"><i class="ne-arrow"></i></span></div></a></article>`;
  }
  function home() {
    const principles = [
      ['yuma/after-menu','Начинаю со сценария','В карточке товара собрала рядом поля, которые управляющий заполняет за один раз.','yumapos'],
      ['kvas/hand-can','Проверяю образ в серии','Для четырёх вкусов кваса придумала рыцарей. Сохраняла их лица от сцены к сцене, детали доводила в Photoshop.','kvas'],
      ['tsenny/board-detail','Проверяю в масштабе','Для «Ценного пути» готовила к печати поле, карты и правила. На столе они должны читаться вместе.','tsenny-put']
    ];
    return hero() + `<section class="work-edition" id="work"><h2 class="screen-title">Избранные проекты</h2>
      <div class="work-spreads">${works.map(project).join('')}</div></section>
      <section id="about" class="career-section"><h2>Опыт</h2><div class="career-details"><p>В YUMAPOS я работаю над инструментами для ресторанов. Сегодня это может быть форма для управляющего, завтра — страница о работе кухни.</p>
      <div class="screen-job"><time>С 2024</time><div><strong>YUMAPOS</strong><span>Дизайнер интерфейсов</span></div></div><div class="screen-job"><time>2023–2024</time><div><strong>TSQ Consulting</strong><span>Младший графический дизайнер</span></div></div></div></section>
      <section class="screen-method" id="principles"><h2 class="screen-title">Как я работаю</h2>
      <div class="screen-methods">${principles.map(([key,h,p,slug]) => `<article data-reveal><a href="${workHref(slug)}" aria-label="Посмотреть пример в кейсе">${media(key,h,'(max-width: 680px) 92vw, 33vw')}</a><h3>${h}</h3><p>${p}</p></article>`).join('')}</div></section>
      <section class="screen-services" id="services"><h2>Услуги</h2><p>Интерфейсы, сайты на Tilda, айдентика, презентации и упаковка.</p><a href="price.html">Цены и этапы <span><i class="ne-arrow" aria-hidden="true"></i></span></a></section>`;
  }
  return { nav, footer, home };
}
module.exports = screening;
