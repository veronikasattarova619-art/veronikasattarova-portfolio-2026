(function () {
  'use strict';

  var root = document.documentElement;
  var body = document.body;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Появление при скролле */
  var fades = document.querySelectorAll('.fade');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.04 });
    fades.forEach(function (el) { io.observe(el); });
  } else {
    fades.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Шапка: прячется при скролле вниз, появляется при скролле вверх */
  var lastY = window.scrollY;
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    body.classList.toggle('scrolled', y > 40);
    body.classList.toggle('past-sheet', y > window.innerHeight * 0.6);
    if (y < 80) {
      body.classList.remove('header-hidden');
    } else if (y > lastY + 6) {
      body.classList.add('header-hidden');
    } else if (y < lastY - 6) {
      body.classList.remove('header-hidden');
    }
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  /* Модульная сетка: кнопка и клавиша G */
  function setGrid(on) {
    root.classList.toggle('grid-on', on);
    try { localStorage.setItem('grid', on ? '1' : '0'); } catch (e) {}
  }
  document.querySelectorAll('[data-grid-toggle]').forEach(function (b) {
    b.addEventListener('click', function () { setGrid(!root.classList.contains('grid-on')); });
  });
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'g' || e.key === 'G' || e.key === 'п' || e.key === 'П') && !e.metaKey && !e.ctrlKey && !e.altKey) {
      setGrid(!root.classList.contains('grid-on'));
    }
  });

  /* Главный экран: лист с меняющейся работой */
  var stage = document.querySelector('[data-hero-stage]');
  if (stage) {
    var imgs = stage.querySelectorAll('img');
    var caps = document.querySelectorAll('[data-hero-caps] .hero__cap');
    var btns = document.querySelectorAll('[data-hero-pager] button');
    var current = 0;
    var timer = null;
    var show = function (i) {
      current = (i + imgs.length) % imgs.length;
      [imgs, caps, btns].forEach(function (list) {
        list.forEach(function (el, n) { el.classList.toggle('is-on', n === current); });
      });
      stage.setAttribute('href', imgs[current].getAttribute('data-href'));
      stage.setAttribute('aria-label', imgs[current].getAttribute('alt'));
    };
    var stop = function () { clearInterval(timer); timer = null; };
    var play = function () {
      if (reduced || timer) return;
      timer = setInterval(function () { show(current + 1); }, 4200);
    };
    btns.forEach(function (b, n) {
      b.addEventListener('click', function () { stop(); show(n); });
    });
    stage.addEventListener('mouseenter', stop);
    stage.addEventListener('mouseleave', play);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { stop(); } else { play(); }
    });
    play();
  }

  /* Каталог: наведение подсвечивает все кадры проекта */
  var tiles = document.querySelector('.tiles');
  if (tiles) {
    var groups = [tiles, document.querySelector('.index'), document.querySelector('.credits')].filter(Boolean);
    var focus = function (p) {
      groups.forEach(function (g) {
        g.classList.toggle('has-focus', !!p);
        g.querySelectorAll('[data-p]').forEach(function (el) {
          el.classList.toggle('is-match', el.getAttribute('data-p') === p);
        });
      });
    };
    groups.forEach(function (g) {
      g.querySelectorAll('[data-p]').forEach(function (el) {
        el.addEventListener('mouseenter', function () { focus(el.getAttribute('data-p')); });
        el.addEventListener('mouseleave', function () { focus(null); });
      });
    });
  }

  /* СМАИЛ: список разделов следует за длинной страницей */
  var long = document.querySelector('[data-long]');
  if (long) {
    var items = document.querySelectorAll('[data-long-list] li');
    var update = function () {
      var r = long.getBoundingClientRect();
      var pos = (window.innerHeight * 0.4 - r.top) / r.height;
      items.forEach(function (li) {
        var a = parseFloat(li.getAttribute('data-from'));
        var b = parseFloat(li.getAttribute('data-to'));
        li.classList.toggle('is-on', pos >= a && pos < b);
      });
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* Переход между страницами: где нет встроенного, делаем затемнением */
  var nativeVT = 'onpagereveal' in window;
  if (!nativeVT && !reduced) {
    root.classList.add('no-vt');
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank' || e.defaultPrevented) return;
      var url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
      e.preventDefault();
      body.classList.add('leaving');
      setTimeout(function () { location.href = a.href; }, 320);
    });
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) body.classList.remove('leaving');
    });
  }
})();
