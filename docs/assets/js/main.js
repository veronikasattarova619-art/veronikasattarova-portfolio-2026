/* Вероника Саттарова — портфолио. Без зависимостей. */
(function () {
  var html = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Загрузка страницы ---------- */
  function loaded() {
    requestAnimationFrame(function () {
      html.classList.add('is-loaded');
      html.classList.remove('is-entering');
    });
  }
  if (document.readyState === 'complete') loaded(); else window.addEventListener('load', loaded);
  // страховка, если картинки грузятся долго
  setTimeout(loaded, 1200);

  /* ---------- Переходы между страницами (если нет cross-document View Transitions) ---------- */
  if (html.classList.contains('no-vt') && !reduce) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      if (a.target && a.target !== '_self') return;
      if (a.hasAttribute('download')) return;
      var url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.hash) return;
      e.preventDefault();
      html.classList.add('is-leaving');
      setTimeout(function () { location.href = url.href; }, 360);
    });
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) html.classList.remove('is-leaving', 'is-entering');
    });
  }

  /* ---------- Появление при скролле ---------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }
  // каскад для групп
  document.querySelectorAll('[data-stagger]').forEach(function (group) {
    var step = parseFloat(group.getAttribute('data-stagger')) || 0.08;
    group.querySelectorAll(':scope > [data-reveal]').forEach(function (el, i) { el.style.setProperty('--d', (i * step).toFixed(2) + 's'); });
  });

  /* ---------- Шапка: прячется при скролле вниз ---------- */
  var header = document.querySelector('.header');
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY;
    if (header) {
      header.classList.toggle('is-solid', y > 20);
      if (!document.body.classList.contains('menu-open')) header.classList.toggle('is-hidden', y > lastY && y > 240);
    }
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Меню ---------- */
  var menu = document.querySelector('.menu');
  function setMenu(open) {
    if (!menu) return;
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    document.querySelectorAll('[data-menu-open]').forEach(function (b) { b.setAttribute('aria-expanded', String(open)); });
    if (open) { var f = menu.querySelector('.menu__list a'); if (f) f.focus({ preventScroll: true }); }
  }
  document.querySelectorAll('[data-menu-open]').forEach(function (b) { b.addEventListener('click', function () { setMenu(true); }); });
  document.querySelectorAll('[data-menu-close]').forEach(function (b) { b.addEventListener('click', function () { setMenu(false); }); });
  if (menu) menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });

  /* ---------- Сетка по клавише G ---------- */
  function toggleGrid() {
    var on = html.classList.toggle('grid-on');
    try { localStorage.setItem('grid', on ? '1' : '0'); } catch (e) {}
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
    var t = e.target;
    if (t && (t.isContentEditable || /input|textarea|select/i.test(t.tagName))) return;
    if ((e.key === 'g' || e.key === 'G' || e.key === 'п' || e.key === 'П') && !e.metaKey && !e.ctrlKey && !e.altKey) toggleGrid();
  });
  document.querySelectorAll('[data-grid-toggle]').forEach(function (b) { b.addEventListener('click', toggleGrid); });
  document.querySelectorAll('[data-top]').forEach(function (b) { b.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); }); });

  /* ---------- Плашки направлений — подсветка по очереди ---------- */
  var pills = document.querySelectorAll('.pills .pill');
  if (pills.length && !reduce) {
    var pi = 0, paused = false;
    pills.forEach(function (p) {
      p.addEventListener('mouseenter', function () { paused = true; pills.forEach(function (x) { x.classList.remove('is-active'); }); });
      p.addEventListener('mouseleave', function () { paused = false; });
    });
    setInterval(function () {
      if (paused) return;
      pills.forEach(function (x) { x.classList.remove('is-active'); });
      pills[pi % pills.length].classList.add('is-active');
      pi++;
    }, 1800);
  }

  /* ---------- Параллакс фото на главном экране ---------- */
  var photo = document.querySelector('.hero__photo img');
  if (photo && !reduce) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, window.innerHeight);
        photo.style.transform = 'translate3d(0,' + (y * 0.12).toFixed(1) + 'px,0)';
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- Работы: сетка / список ---------- */
  var works = document.querySelector('.works');
  if (works) {
    var btns = works.querySelectorAll('[data-view-btn]');
    var saved = null; try { saved = localStorage.getItem('works-view'); } catch (e) {}
    function setView(v) {
      works.setAttribute('data-view', v);
      btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-view-btn') === v)); });
      try { localStorage.setItem('works-view', v); } catch (e) {}
      if (v === 'list') works.querySelectorAll('.works-list [data-reveal]').forEach(function (el) { el.classList.add('is-in'); });
    }
    btns.forEach(function (b) { b.addEventListener('click', function () { setView(b.getAttribute('data-view-btn')); }); });
    if (saved === 'list') setView('list');

    // превью за курсором в режиме списка
    var preview = document.querySelector('.cursor-preview');
    if (preview && window.matchMedia('(hover: hover)').matches) {
      var px = 0, py = 0, cx = 0, cy = 0, raf = null;
      function loop() {
        cx += (px - cx) * 0.18; cy += (py - cy) * 0.18;
        preview.style.left = cx + 'px'; preview.style.top = cy + 'px';
        raf = Math.abs(px - cx) + Math.abs(py - cy) > 0.5 ? requestAnimationFrame(loop) : null;
      }
      works.querySelectorAll('.wl-row').forEach(function (row) {
        row.addEventListener('mouseenter', function (e) {
          var k = row.getAttribute('data-preview');
          preview.querySelectorAll('img').forEach(function (img) { img.classList.toggle('is-on', img.getAttribute('data-key') === k); });
          preview.classList.add('is-on');
          if (!cx) { cx = e.clientX; cy = e.clientY; }
        });
        row.addEventListener('mouseleave', function () { preview.classList.remove('is-on'); });
        row.addEventListener('mousemove', function (e) { px = e.clientX; py = e.clientY; if (!raf) raf = requestAnimationFrame(loop); });
      });
    }
  }

  /* ---------- До / после ---------- */
  document.querySelectorAll('.ba').forEach(function (ba) {
    var range = ba.querySelector('input[type="range"]');
    function set(v) { ba.style.setProperty('--pos', v + '%'); }
    if (range) {
      range.addEventListener('input', function () { set(range.value); });
      set(range.value);
    }
  });

  /* ---------- Видео: играть только в зоне видимости ---------- */
  var vids = document.querySelectorAll('video[data-autoplay]');
  if ('IntersectionObserver' in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting && !reduce) { if (v.preload === 'none') v.preload = 'auto'; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else v.pause();
      });
    }, { threshold: 0.25 });
    vids.forEach(function (v) { vio.observe(v); });
  }

  /* ---------- Год в подвале ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
