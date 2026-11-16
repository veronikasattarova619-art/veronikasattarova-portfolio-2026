# Сборка сайта

Сайт — статический, лежит в `docs/` и публикуется GitHub Pages (ветка `main`, папка `/docs`).

```bash
cd build
npm install
node capture-smile.js .cache/smile   # (по желанию) пересъёмка скриншотов smile-digital.ru
node mockups.js                       # мокапы-обложки из скриншотов → .cache/mock
node assets.js                        # сжатие картинок → docs/assets/img + manifest.json
node site.js                          # генерация HTML-страниц → docs/
node preview.js index.html --full     # локальный просмотр/скриншоты → .cache/preview
```

Тексты кейсов и цены — в `site.js` (объекты `WORKS`, `CASES`, `PRICES`).
Стили — `docs/assets/css/style.css`, скрипты — `docs/assets/js/main.js`.
Папка `.cache` (исходные скриншоты, мокапы) в репозиторий не попадает.
