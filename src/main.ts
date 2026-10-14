import { PageFlip } from 'page-flip/dist/js/page-flip.module.js';
import './style.css';
import { spreads, ui, type Decor, type Side, type Spread, type TextBlock } from './content';
import { animals, animalsProps, animalsWash } from './animals';
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
  return `<div class="decor ${d.animal} ${d.motion ?? ''} ${d.flip ? 'flip' : ''}" style="${style}">${animals[d.animal]}</div>`;
}

function sceneHtml(s: Spread, side: Side): string {
  if (s.scene === 'animals' && side === 'R') return `<div class="wash">${animalsWash}</div><div class="props">${animalsProps}</div>`;
  if (s.scene === 'finale' && side === 'R') {
    return `<div class="wash">${animalsWash}</div>
      <div class="secret-wrap">
        <button class="secret-btn" type="button"><span class="heart" aria-hidden="true"></span>${ui.secret}</button>
        <p class="secret-hint">${ui.secretHint}</p>
      </div>`;
  }
  if (s.scene) return `<div class="wash soft">${animalsWash}</div>`;
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

// Pré-carrega as ilustrações
for (const s of spreads) if (s.image) new Image().src = `${base}spreads/${s.image}.webp`;

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

function build() {
  const pw = layout();
  if (flip) {
    flip.getSettings().flippingTime = flipTime(pw);
    flip.update();
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
  flip.loadFromHTML(book.querySelectorAll('.page'));
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

async function openSecret() {
  overlay.hidden = false;
  requestAnimationFrame(() => overlay.classList.add('open'));
  await document.fonts.load('100px WenKai', ui.fireworks.join(''));
  stopFireworks = launchFireworks(fwCanvas, ui.fireworks);
  closeBtn.focus();
}

function closeSecret() {
  stopFireworks?.();
  stopFireworks = null;
  overlay.classList.remove('open');
  setTimeout(() => (overlay.hidden = true), 400);
}

prevBtn.addEventListener('click', () => flip?.flipPrev());
nextBtn.addEventListener('click', () => flip?.flipNext());
closeBtn.addEventListener('click', closeSecret);
window.addEventListener('keydown', (e) => {
  if (!overlay.hidden) {
    if (e.key === 'Escape') closeSecret();
    return;
  }
  if (e.key === 'ArrowRight') flip?.flipNext();
  if (e.key === 'ArrowLeft') flip?.flipPrev();
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
      if (dx < 0) flip.flipNext();
      else flip.flipPrev();
    } else if (Math.abs(dx) < 12 && Math.abs(dy) < 12) {
      const r = stage.getBoundingClientRect();
      if (t.clientX - r.left < r.width / 2) flip.flipPrev();
      else flip.flipNext();
    }
  },
  { capture: true },
);

let resizeTimer = 0;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(build, 150);
});

document.fonts.load('20px WenKai').finally(build);
