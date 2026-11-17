/* Вероника Саттарова — портфолио. Без зависимостей. */
(function () {
  var html = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function loaded() { html.classList.remove('is-entering'); }
  if (document.readyState !== 'loading') requestAnimationFrame(loaded); else document.addEventListener('DOMContentLoaded', function () { requestAnimationFrame(loaded); });

  /* Переход между страницами — там, где нет View Transitions между документами */
  if (html.classList.contains('no-vt') && !reduce) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      if ((a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      var url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
      e.preventDefault();
      html.classList.add('is-leaving');
      setTimeout(function () { location.href = url.href; }, 230);
    });
    window.addEventListener('pageshow', function (e) { if (e.persisted) html.classList.remove('is-leaving', 'is-entering'); });
  }

  /* Появление при скролле */
  var els = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    els.forEach(function (el) { io.observe(el); });
  } else els.forEach(function (el) { el.classList.add('is-in'); });
  document.querySelectorAll('[data-stagger]').forEach(function (g) {
    g.querySelectorAll(':scope > [data-reveal]').forEach(function (el, i) { el.style.setProperty('--d', (i * 0.06).toFixed(2) + 's'); });
  });

  /* Мобильное меню */
  var btn = document.querySelector('.menu-btn'), mnav = document.querySelector('.mnav');
  if (btn && mnav) {
    btn.addEventListener('click', function () {
      var open = mnav.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Закрыть' : 'Меню';
    });
    mnav.addEventListener('click', function (e) { if (e.target.closest('a')) { mnav.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); btn.textContent = 'Меню'; } });
  }

  /* Оглавление кейса: подсветка текущего раздела */
  var toc = document.querySelectorAll('.toc a[href^="#"]');
  if (toc.length && 'IntersectionObserver' in window) {
    var map = {};
    toc.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          toc.forEach(function (a) { a.classList.remove('is-active'); });
          var a = map[en.target.id]; if (a) a.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* До / после */
  document.querySelectorAll('.ba').forEach(function (ba) {
    var r = ba.querySelector('input[type="range"]');
    if (!r) return;
    var set = function () { ba.style.setProperty('--pos', r.value + '%'); };
    r.addEventListener('input', set); set();
  });

  /* Видео играет только в зоне видимости */
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

  /* Лайтбокс для картинок кейса */
  var zoom = Array.prototype.slice.call(document.querySelectorAll('[data-zoom] img'));
  if (zoom.length) {
    var lb = document.createElement('div');
    lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Просмотр изображения');
    lb.innerHTML = '<div class="lb__bar"><span class="lb__count"></span><button type="button" class="lb__close">Закрыть ✕</button></div><img alt=""><button type="button" class="lb__nav lb__prev" aria-label="Предыдущее">←</button><button type="button" class="lb__nav lb__next" aria-label="Следующее">→</button><div class="lb__cap"></div>';
    document.body.appendChild(lb);
    var lbImg = lb.querySelector('img'), cur = 0, last = null;
    var biggest = function (img) {
      var ss = img.getAttribute('srcset'); if (!ss) return img.currentSrc || img.src;
      var parts = ss.split(',').map(function (s) { return s.trim().split(/\s+/)[0]; });
      return parts[parts.length - 1];
    };
    var show = function (i) {
      cur = (i + zoom.length) % zoom.length;
      var img = zoom[cur];
      lbImg.src = biggest(img); lbImg.alt = img.alt;
      var fig = img.closest('figure'); var cap = fig && fig.querySelector('figcaption');
      lb.querySelector('.lb__cap').textContent = cap ? cap.textContent.trim() : img.alt;
      lb.querySelector('.lb__count').textContent = (cur + 1) + ' / ' + zoom.length;
    };
    var open = function (i) { last = document.activeElement; show(i); lb.classList.add('is-open'); document.body.style.overflow = 'hidden'; lb.querySelector('.lb__close').focus(); };
    var close = function () { lb.classList.remove('is-open'); document.body.style.overflow = ''; if (last) last.focus(); };
    zoom.forEach(function (img, i) {
      var box = img.closest('[data-zoom]');
      box.setAttribute('tabindex', '0'); box.setAttribute('role', 'button'); box.setAttribute('aria-label', 'Увеличить: ' + (img.alt || 'изображение'));
      box.addEventListener('click', function () { open(i); });
      box.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); } });
    });
    lb.querySelector('.lb__close').addEventListener('click', close);
    lb.querySelector('.lb__prev').addEventListener('click', function () { show(cur - 1); });
    lb.querySelector('.lb__next').addEventListener('click', function () { show(cur + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(cur - 1);
      if (e.key === 'ArrowRight') show(cur + 1);
    });
  }

  document.querySelectorAll('[data-top]').forEach(function (b) { b.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); }); });
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
