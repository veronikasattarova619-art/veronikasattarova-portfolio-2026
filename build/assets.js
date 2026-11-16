// Оптимизирует исходники кейсов → docs/assets/img/<group>/<name>-<w>.webp и пишет build/manifest.json
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CASES = path.join(ROOT, 'cases');
const CACHE = path.join(__dirname, '.cache');
const OUT = path.join(ROOT, 'docs/assets/img');

const K = (f) => path.join(CASES, '02_Drinks_Collection_kvas', f);
const T = (f) => path.join(CASES, '03_Tsenny_put_board_game', f);
const S = (f) => path.join(CASES, '04_Smile_digital_website', f);
const SS = (f) => path.join(CASES, '05_Studyspace_learning_planner', f);
const Y = (f) => path.join(CACHE, 'yuma', f);
const SM = (f) => path.join(CACHE, 'smile', f);
const MK = (f) => path.join(CACHE, 'mock', f);

const PHOTO = [900, 1800];
const UI = [1000, 2000];

// [group, name, source, widths | {anim}]
const list = [
  ['me', 'portrait', path.join(ROOT, 'author-photo.png'), [700, 1300]],

  // YUMA
  ['yuma', 'cover', MK('yuma-cover.png'), UI],
  ['yuma', 'shop', MK('yuma-shop.png'), UI],
  ['yuma', 'before-menu', Y('before_menu.png'), [1000, 1363]],
  ['yuma', 'after-menu', Y('after_menu.png'), [1000, 1600]],
  ['yuma', 'before-reports', Y('before_reports.png'), [1000, 1363]],
  ['yuma', 'after-reports', Y('after_reports.png'), [1000, 1600]],
  ['yuma', 'before-login', Y('before_login.png'), [1000, 1363]],
  ['yuma', 'after-login', Y('after_login.png'), [1000, 1363]],
  ['yuma', 'before-table', Y('before_table.png'), [1000, 1363]],
  ['yuma', 'before-popup', Y('before_popup.png'), [1000, 1363]],
  ['yuma', 'ds-colors', Y('ds_colors1.png'), [800, 1196]],
  ['yuma', 'ds-semantic', Y('ds_colors2.png'), [640]],
  ['yuma', 'ds-typography', Y('ds_typography.png'), [800, 1196]],
  ['yuma', 'ds-inputs', Y('ds_inputs.png'), [800]],
  ['yuma', 'ds-desclist', Y('ds_desclist.png'), [800]],
  ['yuma', 'ds-checkbox', Y('ds_checkbox.png'), [800]],
  ['yuma', 'ds-tooltip', Y('ds_tooltip.png'), [800]],
  ['yuma', 'ds-multiselect', Y('ds_multiselect.png'), [1200, 2400]],
  ['yuma', 'ds-icons', Y('ds_icons.png'), [1000, 1363]],
  ['yuma', 'ds-icons-detailed', Y('ds_icons_detailed.png'), [1000, 1363]],

  // Квас
  ['kvas', 'feast', K('1.jpg'), PHOTO],
  ['kvas', 'legend', K('13.jpg'), PHOTO],
  ['kvas', 'riders', K('2.jpg'), PHOTO],
  ['kvas', 'can-grape', K('fca417191b76ebef6f82863419f0edaa_692888aa-d7ab-445a-9f3c-267371b68d37 1.jpg'), PHOTO],
  ['kvas', 'can-apple', K('86de2d527a8ca761e7ec3ca72b41236a_98629ea1-9153-4d0b-8220-8a761f0bddaa 1.jpg'), PHOTO],
  ['kvas', 'can-melon', K('d275b89765717acd443748c9e707e641_8a862f29-e9ba-4f3f-b989-f343dba4db95 1.jpg'), PHOTO],
  ['kvas', 'can-pinkman', K('3416cbf9c2f307f486e90647acc8bee6_4b682969-b32a-4932-8b3d-f91341e646bc 1.jpg'), PHOTO],
  ['kvas', 'knight-apple', K('332bdb34fb300ddbc7c8892f60e3659c_f440caaa-f505-48c2-8076-46fcd4236aa8 1.jpg'), PHOTO],
  ['kvas', 'knight-melon', K('4d6a5bf4920cdd37795d199e608c30bd_2004b10d-8821-4742-98bc-514cfbbb94ac (1) 1.jpg'), PHOTO],
  ['kvas', 'knight-pinkman', K('7f26536693515946ff1197311872dacb_54312134-dcaa-4725-87bd-b8d6f045b17e 1.jpg'), PHOTO],
  ['kvas', 'knight-grape', K('89b5e2dad5df28d30ffc3b3ec8f47e25_35185cc1-1ee2-432b-8711-20cbf4372587 1.jpg'), PHOTO],
  ['kvas', 'model-1', K('Group 2085662646.jpg'), [1000, 2000]],
  ['kvas', 'model-2', K('Group 2085662647.jpg'), [1000, 2000]],
  ['kvas', 'model-3', K('Group 2085662648.jpg'), [1000, 2000]],
  ['kvas', 'model-4', K('Group 2085662649.jpg'), [1000, 2000]],
  ['kvas', 'still-velvet', K('12.jpg'), PHOTO],
  ['kvas', 'still-grape', K('455189cf0ba72c12742c20оf1e414ef19_d1a0fd96-ca56-4da6-b60a-6377b0711a55 1.jpg'), PHOTO],
  ['kvas', 'still-all', K('455189cf0ba72c12742c20оf1e414ef19_d1a0fd96-ca56-4da6-b60a-6377b0711a55 2.jpg'), PHOTO],
  ['kvas', 'still-pinkman', K('58bdbabe7e987a69d0f85141b71b331f_5370b135-4600-4ffb-b120-1742c698463b 1.jpg'), PHOTO],
  ['kvas', 'hand-can', K('55b890654a7ad0046b34f1745ddb744e_ec2d2124-15f3-4e45-a184-e790564f7123 1.jpg'), PHOTO],
  ['kvas', 'goblet', K('69f8605b88ff7b5e446ce2f6_result_0 2.jpg'), [780]],
  ['kvas', 'layout-grape', K('3.jpg'), PHOTO],
  ['kvas', 'layout-apple-melon', K('6.jpg'), PHOTO],
  ['kvas', 'layout-pinkman', K('9.jpg'), PHOTO],
  ['kvas', 'layout-still', K('4.jpg'), PHOTO],
  ['kvas', 'layout-still-2', K('8.jpg'), PHOTO],
  ['kvas', 'layout-tent', K('11.jpg'), PHOTO],
  ['kvas', 'toast', K('10.jpg'), PHOTO],
  ['kvas', 'knights', K('5.jpg'), PHOTO],
  ['kvas', 'battle', K('7.jpg'), PHOTO],
  ['kvas', 'tent', K('c313d23bc28e66b0bd51a62c281265be_af2d18b5-c00b-4300-874a-30fe9e5f0972 1.jpg'), PHOTO],

  // Ценный путь
  ['tsenny', 'box', T('Box_Mockups_OK_1 копия 1.png'), PHOTO],
  ['tsenny', 'board', T('Frame 2087327430.jpg'), PHOTO],
  ['tsenny', 'cards-flying', T('Frame 2087327430.png'), [1000, 1494]],
  ['tsenny', 'tokens', T('Frame_2087327344@1x-25fps.gif'), { anim: 1611 }],
  ['tsenny', 'concept', T('Поиск концепции и стиля.gif'), { anim: 1600 }],
  ['tsenny', 'booklet', T('Free_A4_Brochure_Mockup_1 копия 1.jpg'), PHOTO],
  ['tsenny', 'ref-scratch', T('_references_third_party/ref_01_scratch_map.avif'), [800]],
  ['tsenny', 'ref-illustrated', T('_references_third_party/ref_02_illustrated_map.avif'), [800]],
  ['tsenny', 'playing', T('image (10) (1) 1.jpg'), PHOTO],
  ['tsenny', 'card-photo-human', T('image.jpg'), PHOTO],
  ['tsenny', 'card-photo-decency', T('image2.jpg'), PHOTO],
  ['tsenny', 'card-photo-passion', T('image3.jpg'), PHOTO],
  ['tsenny', 'tokens-board', T('image4.jpg'), PHOTO],
  ['tsenny', 'tokens-board-2', T('image5.jpg'), PHOTO],
  ['tsenny', 'token-closeup', T('image6.jpg'), PHOTO],
  ['tsenny', 'board-detail', T('lst_02_game_board_detail.avif'), PHOTO],
  ['tsenny', 'city-3d', T('lst_03_3d_city_draft.avif'), PHOTO],
  ['tsenny', 'map-v2', T('lst_05_map_variant_2_detail.avif'), PHOTO],
  ['tsenny', 'card-decency-1', T('Порядочность-1.png'), [700, 1200]],
  ['tsenny', 'card-decency-2', T('Порядочность-2.png'), [700, 1200]],
  ['tsenny', 'card-passion-1', T('Увлеченность-1.png'), [700, 1200]],
  ['tsenny', 'card-passion-2', T('Увлеченность-2.png'), [700, 1200]],
  ['tsenny', 'card-human-1', T('Человечность-1.png'), [700, 1200]],
  ['tsenny', 'card-human-2', T('Человечность-2.png'), [700, 1200]],

  // СМАИЛ
  ['smile', 'cover', MK('smile-cover.png'), UI],
  ['smile', 'phones', MK('smile-phones.png'), UI],
  ['smile', 'hero', SM('d_hero_viewport.png'), UI],
  ['smile', 'problem', SM('d_08.png'), UI],
  ['smile', 'audiences', SM('d_09.png'), UI],
  ['smile', 'path', SM('d_12.png'), UI],
  ['smile', 'channels', SM('d_13.png'), UI],
  ['smile', 'services', SM('d_15.png'), UI],
  ['smile', 'benefits', SM('d_16.png'), UI],
  ['smile', 'process', SM('d_17.png'), UI],
  ['smile', 'cases', SM('d_20.png'), UI],
  ['smile', 'lead', SM('d_22.png'), UI],
  ['smile', 'faq', SM('d_24.png'), UI],
  ['smile', 'before-problem', S('второй блок - до, вариант маркетолога.png'), [1000, 1600]],
  ['smile', 'services-raw', S('список услуг в формате который прислали.png'), [1000, 1600]],
  ['smile', 'services-grouped', S('список услуг после того я разделила их на группы.png'), [1000, 1600]],

  // Studyspace
  ['studyspace', 'cover', path.join(CACHE, 'ss', 'f_00.png'), [1000, 1280]],
  ['studyspace', 'library', SS('ss_03_library.avif'), UI],
  ['studyspace', 'course', SS('ss_04_course_page.avif'), UI],
  ['studyspace', 'import', SS('ss_05_import_lessons_dialog.avif'), UI],
  ['studyspace', 'mobile', SS('ss_06_mobile_screens.avif'), UI],
];

(async () => {
  const manifest = {};
  const only = process.argv[2];
  const prev = fs.existsSync(path.join(__dirname, 'manifest.json')) ? JSON.parse(fs.readFileSync(path.join(__dirname, 'manifest.json'), 'utf8')) : {};
  for (const [group, name, src, opt] of list) {
    const key = `${group}/${name}`;
    if (only && !key.startsWith(only)) { if (prev[key]) manifest[key] = prev[key]; continue; }
    if (!fs.existsSync(src)) { console.warn('MISSING', src); continue; }
    const dir = path.join(OUT, group);
    fs.mkdirSync(dir, { recursive: true });
    const meta = await sharp(src).metadata();
    if (opt.anim) {
      const w = Math.min(opt.anim, meta.width);
      const file = `${name}.webp`;
      const img = sharp(src, { animated: true }).resize({ width: w });
      const info = await img.webp({ quality: 72, effort: 4 }).toFile(path.join(dir, file));
      manifest[key] = { src: `${group}/${file}`, w, h: Math.round((meta.pageHeight || meta.height) * w / meta.width), anim: true };
      console.log(key, 'anim', (info.size / 1e6).toFixed(2) + 'MB');
      continue;
    }
    const widths = [...new Set(opt.map((w) => Math.min(w, meta.width)))];
    const set = [];
    for (const w of widths) {
      const file = `${name}-${w}.webp`;
      await sharp(src).resize({ width: w, withoutEnlargement: true }).webp({ quality: meta.hasAlpha ? 82 : 78, effort: 5, alphaQuality: 90 }).toFile(path.join(dir, file));
      set.push([`${group}/${file}`, w]);
    }
    manifest[key] = { set, w: meta.width, h: meta.height, alpha: !!meta.hasAlpha };
    process.stdout.write('.');
  }
  fs.writeFileSync(path.join(__dirname, 'manifest.json'), JSON.stringify(manifest, null, 1));
  console.log('\nimages:', Object.keys(manifest).length);
})();
