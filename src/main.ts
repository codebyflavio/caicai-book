import { PageFlip } from 'page-flip/dist/js/page-flip.module.js';
import './style.css';
import { spreads, ui, type Decor, type Side, type Spread, type TextBlock } from './content';
import { animalsTwinkle } from './animals';
import { launchFireworks } from './fireworks';

const PAGE_W = 632;
const PAGE_H = 848;
const RATIO = PAGE_W / PAGE_H;
const base = import.meta.env.BASE_URL;

const stage = document.querySelector<HTMLDivElement>('#stage')!;
const prevBtn = document.querySelector<HTMLButtonElement>('#prev')!;
const nextBtn = document.querySelector<HTMLButtonElement>('#next')!;
const counter = document.querySelector<HTMLSpanElement>('#counter')!;
const hint = document.querySelector<HTMLParagraphElement>('#hint')!;
const overlay = document.querySelector<HTMLDivElement>('#secret')!;
const fwCanvas = document.querySelector<HTMLCanvasElement>('#fireworks')!;
const closeBtn = document.querySelector<HTMLButtonElement>('#close')!;

prevBtn.setAttribute('aria-label', ui.prev);
nextBtn.setAttribute('aria-label', ui.next);
hint.textContent = ui.hint;
closeBtn.textContent = ui.close;

function textHtml(t: TextBlock): string {
  const cls = ['txt', t.light && 'light', t.glow && 'glow', t.title && 'title'].filter(Boolean).join(' ');
  const style = `left:${t.x}%;top:${t.y}%;width:${t.w}%;font-size:${t.size ?? 5}cqw;text-align:${t.align ?? 'left'}`;
  const lines = t.lines.map((l, i) => `<span class="line" style="--i:${i}">${l}</span>`).join('');
  return `<p class="${cls}" style="${style}">${lines}</p>`;
}

function decorHtml(d: Decor): string {
  const style = `left:${d.x}%;top:${d.y}%;width:${d.w}%`;
  const zzz = d.animal === 'dogSleep' ? '<span class="zzz" aria-hidden="true"><i>z</i><i>z</i><i>z</i></span>' : '';
  return `<div class="decor ${d.animal} ${d.motion ?? ''} ${d.flip ? 'flip' : ''}" style="${style}"><img src="${base}decor/${d.animal}.webp" alt="" draggable="false">${zzz}</div>`;
}

const wash = (soft = false) => `<div class="wash${soft ? ' soft' : ''}" style="background-image:url('${base}decor/wash.webp')"></div>`;

function sceneHtml(s: Spread, side: Side): string {
  if (s.scene === 'animals' && side === 'R')
    return `${wash()}<div class="props" style="background-image:url('${base}decor/props.webp')">${animalsTwinkle}</div>`;
  if (s.scene === 'finale' && side === 'R') {
    return `${wash()}
      <div class="secret-wrap">
        <button class="secret-btn" type="button"><span class="heart" aria-hidden="true"></span>${ui.secret}</button>
        <p class="secret-hint">${ui.secretHint}</p>
      </div>`;
  }
  if (s.scene) return wash(true);
  return '';
}

function pageHtml(s: Spread, side: Side): string {
  const img = s.image
    ? `<div class="art" style="background-image:url('${base}spreads/${s.image}.webp')"></div>`
    : '';
  const texts = s.texts.filter((t) => t.side === side).map(textHtml).join('');
  const decor = (s.decor ?? []).filter((d) => d.side === side).map(decorHtml).join('');
  return `<div class="page ${side === 'L' ? 'left' : 'right'}${s.image ? '' : ' paper'}">
    <div class="page-inner">${img}${sceneHtml(s, side)}${decor}${texts}<div class="gutter"></div></div>
  </div>`;
}

// Pré-carrega e decodifica as imagens; manter a referência evita que o navegador
// descarte a versão decodificada e trave ao virar a página.
const preloaded: HTMLImageElement[] = [];
const urls = [
  ...spreads.filter((s) => s.image).map((s) => `${base}spreads/${s.image}.webp`),
  ...['dog', 'dogSleep', 'hamster', 'hamsterPeek', 'bunny', 'wash', 'props'].map((n) => `${base}decor/${n}.webp`),
];
for (const url of urls) {
  const img = new Image();
  img.src = url;
  img.decode().catch(() => {});
  preloaded.push(img);
}

let flip: PageFlip | null = null;
let current = 0;

// Sempre livro aberto (duas páginas), inclusive no celular
function layout() {
  const availW = window.innerWidth - (window.innerWidth < 600 ? 8 : 24);
  const availH = window.innerHeight - 96;
  const pw = Math.floor(Math.min(availW / 2, availH * RATIO));
  stage.style.width = `${pw * 2}px`;
  stage.style.height = `${Math.floor(pw / RATIO)}px`;
  return pw;
}

// O page-flip encurta a virada em livro pequeno (duração proporcional à largura em px);
// compensa pra virada levar ~0,9s em qualquer tela.
const flipTime = (pw: number) => Math.round(900 * Math.max(1, 1000 / (2 * pw)));

// O page-flip desenha num laço de requestAnimationFrame que nunca para. Com um laço
// desses ativo, o Chrome passa a calcular todas as animações CSS (estrelas, figurinhas)
// na CPU a cada quadro, em vez de deixar na GPU. Aqui o laço dele só roda enquanto
// algo se mexe e para meio segundo depois.
const nativeRaf = window.requestAnimationFrame.bind(window);
let flipLoop: FrameRequestCallback | null = null;
let capturingLoop = false;
let loopRunning = false;
let awakeUntil = 0;
window.requestAnimationFrame = (cb) => {
  if (capturingLoop && !flipLoop) flipLoop = cb;
  if (cb !== flipLoop) return nativeRaf(cb);
  loopRunning = performance.now() < awakeUntil || flip?.getState() !== 'read';
  return loopRunning ? nativeRaf(cb) : 0;
};
function wakeFlip() {
  awakeUntil = performance.now() + 600;
  if (!loopRunning && flipLoop) {
    loopRunning = true;
    nativeRaf(flipLoop);
  }
}
for (const ev of ['pointerdown', 'pointermove', 'touchstart']) stage.addEventListener(ev, wakeFlip, { capture: true, passive: true });

function build() {
  const pw = layout();
  if (flip) {
    flip.getSettings().flippingTime = flipTime(pw);
    flip.update();
    wakeFlip();
    return;
  }
  stage.innerHTML = '<div id="book"></div>';
  const book = stage.querySelector<HTMLDivElement>('#book')!;
  book.innerHTML = spreads.map((s) => pageHtml(s, 'L') + pageHtml(s, 'R')).join('');
  book.querySelectorAll<HTMLButtonElement>('.secret-btn').forEach((b) => b.addEventListener('click', openSecret));

  flip = new PageFlip(book, {
    width: PAGE_W,
    height: PAGE_H,
    size: 'stretch',
    minWidth: 50,
    maxWidth: 2000,
    minHeight: 100,
    maxHeight: 3000,
    startPage: current,
    showCover: false,
    usePortrait: false,
    drawShadow: true,
    maxShadowOpacity: 0.35,
    flippingTime: flipTime(pw),
    mobileScrollSupport: false,
    swipeDistance: 20,
  });
  capturingLoop = true;
  flip.loadFromHTML(book.querySelectorAll('.page'));
  capturingLoop = false;
  // A cada quadro da virada o page-flip reescreve o style de todas as páginas, inclusive
  // das escondidas. Ignorar reescritas idênticas corta metade do recálculo de estilo.
  const cssText = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, 'cssText')!;
  book.querySelectorAll<HTMLElement>('.page, [class*="stf__"]').forEach((el) => {
    let last = '';
    let applied = '';
    Object.defineProperty(el.style, 'cssText', {
      get: () => cssText.get!.call(el.style),
      set: (v: string) => {
        // também confere o estilo atual, porque o page-flip às vezes muda o z-index direto
        if (v === last && cssText.get!.call(el.style) === applied) return;
        cssText.set!.call(el.style, v);
        last = v;
        applied = cssText.get!.call(el.style);
      },
    });
  });
  flip.on('changeState', wakeFlip);
  wakeFlip();
  flip.on('flip', () => {
    current = flip!.getCurrentPageIndex();
    hint.classList.add('gone');
    sync();
  });
  sync();
}

function sync() {
  if (!flip) return;
  const total = flip.getPageCount();
  const idx = flip.getCurrentPageIndex();
  const visible = [idx - (idx % 2), idx - (idx % 2) + 1];
  document.querySelectorAll('#book .page').forEach((p, i) => p.classList.toggle('shown', visible.includes(i)));
  counter.textContent = `${Math.floor(idx / 2) + 1} / ${total / 2}`;
  prevBtn.disabled = idx === 0;
  nextBtn.disabled = visible[visible.length - 1] >= total - 1;
}

let stopFireworks: (() => void) | null = null;
let hideBookTimer = 0;

async function openSecret() {
  overlay.hidden = false;
  requestAnimationFrame(() => overlay.classList.add('open'));
  // com os fogos cobrindo a tela, tira o livro da renderização (ele seguia animando por baixo)
  hideBookTimer = window.setTimeout(() => document.body.classList.add('secret-open'), 450);
  await document.fonts.load('100px WenKai', ui.fireworks.join(''));
  stopFireworks = launchFireworks(fwCanvas, ui.fireworks);
  closeBtn.focus();
}

function closeSecret() {
  clearTimeout(hideBookTimer);
  document.body.classList.remove('secret-open');
  build();
  stopFireworks?.();
  stopFireworks = null;
  overlay.classList.remove('open');
  setTimeout(() => (overlay.hidden = true), 400);
}

function next() {
  wakeFlip();
  flip?.flipNext();
}

function prev() {
  wakeFlip();
  flip?.flipPrev();
}

prevBtn.addEventListener('click', prev);
nextBtn.addEventListener('click', next);
closeBtn.addEventListener('click', closeSecret);
window.addEventListener('keydown', (e) => {
  if (!overlay.hidden) {
    if (e.key === 'Escape') closeSecret();
    return;
  }
  if (e.key === 'ArrowRight') next();
  if (e.key === 'ArrowLeft') prev();
});

// Toque no celular: o page-flip ignora toque rápido e o arrasto lento é instável,
// então os gestos de toque são tratados aqui e o evento não chega nele.
let touch: { x: number; y: number } | null = null;
stage.addEventListener(
  'touchstart',
  (e) => {
    if ((e.target as Element).closest('button')) return;
    e.stopPropagation();
    e.preventDefault(); // evita o clique "de mouse" que o navegador simula depois do toque
    touch = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
  },
  { capture: true, passive: false },
);
stage.addEventListener(
  'touchend',
  (e) => {
    if (!touch || !flip) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.x;
    const dy = t.clientY - touch.y;
    touch = null;
    if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next();
      else prev();
    } else if (Math.abs(dx) < 12 && Math.abs(dy) < 12) {
      const r = stage.getBoundingClientRect();
      if (t.clientX - r.left < r.width / 2) prev();
      else next();
    }
  },
  { capture: true },
);

let resizeTimer = 0;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => {
    if (!document.body.classList.contains('secret-open')) build();
  }, 150);
});

document.fonts.load('20px WenKai').finally(build);
