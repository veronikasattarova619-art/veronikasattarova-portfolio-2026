// node slice.js file.png [width=800] [chunk=1600] — режет длинный скриншот на части для просмотра
const sharp = require('sharp');
const path = require('path');
(async () => {
  const [f, w = 800, ch = 1600] = process.argv.slice(2);
  const buf = await sharp(f).resize({ width: +w }).png().toBuffer();
  const { height } = await sharp(buf).metadata();
  const n = Math.ceil(height / +ch);
  for (let i = 0; i < n; i++) {
    const top = i * +ch, h = Math.min(+ch, height - top);
    const out = f.replace(/\.png$/, `_part${i}.png`);
    await sharp(buf).extract({ left: 0, top, width: +w, height: h }).toFile(out);
    console.log(path.basename(out));
  }
})();
