// Gera os assets do site a partir de assets-src/:
//  - limpa o texto original das páginas escaneadas e corta pra 3:2
//  - converte as ilustrações pra webp
//  - gera a fonte LXGW WenKai só com os caracteres usados no site
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import subsetFont from 'subset-font';

const root = path.resolve(import.meta.dirname, '..');
const src = path.join(root, 'assets-src');
const out = path.join(root, 'public');
const W = 1264;
const H = 848;

// Preenche cada retângulo com "papel" interpolado das bordas (patch de Coons),
// com um pouco de ruído pra não ficar liso demais.
function paperFill(data, width, channels, rects) {
  const px = (x, y, c) => data[(y * width + x) * channels + c];
  const band = 3;
  const avg = (x, y, axis) => {
    const res = [0, 0, 0];
    for (let i = 0; i < band; i++) {
      const xx = axis === 'x' ? x + i : x;
      const yy = axis === 'y' ? y + i : y;
      for (let c = 0; c < 3; c++) res[c] += px(xx, yy, c) / band;
    }
    return res;
  };
  for (const [x0, y0, x1, y1] of rects) {
    const top = [], bottom = [], left = [], right = [];
    for (let x = x0; x <= x1; x++) {
      top.push(avg(x, y0 - band, 'y'));
      bottom.push(avg(x, y1 + 1, 'y'));
    }
    for (let y = y0; y <= y1; y++) {
      left.push(avg(x0 - band, y, 'x'));
      right.push(avg(x1 + 1, y, 'x'));
    }
    for (const arr of [top, bottom, left, right]) smooth(arr, 6);
    const c00 = top[0], c10 = top[top.length - 1];
    const c01 = bottom[0], c11 = bottom[bottom.length - 1];
    for (let y = y0; y <= y1; y++) {
      const v = (y - y0) / (y1 - y0);
      for (let x = x0; x <= x1; x++) {
        const u = (x - x0) / (x1 - x0);
        const i = x - x0, j = y - y0;
        const noise = (Math.random() - 0.5) * 3;
        for (let c = 0; c < 3; c++) {
          const val =
            (1 - v) * top[i][c] + v * bottom[i][c] +
            (1 - u) * left[j][c] + u * right[j][c] -
            ((1 - u) * (1 - v) * c00[c] + u * (1 - v) * c10[c] +
              (1 - u) * v * c01[c] + u * v * c11[c]);
          data[(y * width + x) * channels + c] = Math.max(0, Math.min(255, val + noise));
        }
      }
    }
  }
}

// média móvel nas bordas amostradas, pra não virar listras no preenchimento
function smooth(arr, r) {
  const copy = arr.map((c) => [...c]);
  for (let i = 0; i < arr.length; i++) {
    const a = Math.max(0, i - r), b = Math.min(arr.length - 1, i + r);
    for (let c = 0; c < 3; c++) {
      let sum = 0;
      for (let k = a; k <= b; k++) sum += copy[k][c];
      arr[i][c] = sum / (b - a + 1);
    }
  }
}

async function cleanScan(file, rects, crop) {
  const { data, info } = await sharp(path.join(src, 'img', file))
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  paperFill(data, info.width, info.channels, rects);
  return sharp(data, { raw: info })
    .extract(crop)
    .resize(W, Math.round(W / 1.5), { kernel: 'lanczos3' })
    .sharpen({ sigma: 0.6 });
}

const scans = {
  // coelho abrindo os braços no toco (texto no alto à esquerda; o corte tira o selo da editora e centraliza a dobra)
  'scanA.png': {
    rects: [[150, 90, 670, 310]],
    crop: { left: 240, top: 100, width: 1450, height: 967 },
  },
  // coelhinho puxando a orelha (texto à direita + números de página)
  'scanB.png': {
    rects: [[406, 40, 690, 70], [416, 70, 690, 211], [158, 386, 200, 416], [495, 386, 537, 416]],
    crop: { left: 35, top: 0, width: 642, height: 428 },
  },
  // coelho grande de braços abertos
  'scanC.png': {
    rects: [[395, 38, 640, 195], [158, 386, 200, 416], [495, 386, 537, 416]],
    crop: { left: 35, top: 0, width: 642, height: 428 },
  },
};

await fs.mkdir(path.join(out, 'spreads'), { recursive: true });
await fs.mkdir(path.join(out, 'fonts'), { recursive: true });

for (const [file, cfg] of Object.entries(scans)) {
  const img = await cleanScan(file, cfg.rects, cfg.crop);
  await img.webp({ quality: 86 }).toFile(path.join(out, 'spreads', file.replace('.png', '.webp')));
}

for (const name of ['capa', 'p05', 'p06', 'p07', 'p08', 'p10', 'p11']) {
  await sharp(path.join(src, 'img', `${name}.jpg`))
    .resize(W, H, { fit: 'cover' })
    .webp({ quality: 86 })
    .toFile(path.join(out, 'spreads', `${name}.webp`));
}

// Fonte: só os caracteres que aparecem no código-fonte e no index.html.
let text = await fs.readFile(path.join(root, 'index.html'), 'utf8');
for (const f of await fs.readdir(path.join(root, 'src'), { recursive: true })) {
  if (/\.(ts|css)$/.test(f)) text += await fs.readFile(path.join(root, 'src', f), 'utf8');
}
for (let c = 0x20; c < 0x7f; c++) text += String.fromCharCode(c);
const chars = [...new Set(text)].join('');
const font = await fs.readFile(path.join(src, 'fonts', 'LXGWWenKai-Regular.ttf'));
const woff2 = await subsetFont(font, chars, { targetFormat: 'woff2' });
await fs.writeFile(path.join(out, 'fonts', 'wenkai.woff2'), woff2);

console.log(`ok: ${chars.length} caracteres, fonte ${(woff2.length / 1024).toFixed(0)} KB`);
