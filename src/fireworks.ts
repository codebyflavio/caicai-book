// Fogos de artifício em azul e roxo que terminam formando o nome dela.

const COLORS = ['#a8c4e0', '#6c8ebf', '#c9b6e4', '#9b7ebd', '#d4a857', '#ffffff'];
const WHITE = COLORS.length - 1;
// Os pontinhos são desenhados em lotes (um preenchimento por cor + nível de brilho)
// em vez de um por um: milhares de chamadas a mais por quadro derrubavam o fps no celular.
const LEVELS = 6;
const FONT = '"WenKai", "Kaiti SC", "STKaiti", serif';

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: number;
  size: number;
  tx?: number;
  ty?: number;
  delay?: number;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pickColor = () => Math.floor(Math.random() * COLORS.length);

function textTargets(lines: string[], w: number, h: number): { x: number; y: number }[] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#000';
  ctx.strokeStyle = '#000';
  ctx.lineJoin = 'round';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const base = Math.min(w / 4.2, h / 5.5);
  const sizes = [base, base * 0.52, base * 0.36];
  const ys = [h * 0.4, h * 0.4 + base * 0.95, h * 0.4 + base * 1.6];
  lines.forEach((line, i) => {
    ctx.font = `${sizes[i]}px ${FONT}`;
    ctx.fillText(line, w / 2, ys[i]);
    // engrossa o traço pra letra continuar legível depois de virar pontinhos
    ctx.lineWidth = sizes[i] * 0.05;
    ctx.strokeText(line, w / 2, ys[i]);
  });
  const data = ctx.getImageData(0, 0, w, h).data;
  const step = Math.max(2, Math.round(base / 34));
  const pts: { x: number; y: number }[] = [];
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      if (data[(y * w + x) * 4 + 3] > 128) pts.push({ x, y });
    }
  }
  return pts;
}

export function launchFireworks(canvas: HTMLCanvasElement, lines: string[]): () => void {
  const ctx = canvas.getContext('2d')!;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w = 0;
  let h = 0;
  let sparks: Spark[] = [];
  let raf = 0;
  let start = performance.now();
  let lastBurst = 0;
  let last = 0;
  const buckets: number[][] = Array.from({ length: COLORS.length * LEVELS }, () => []);
  const add = (s: Spark, alpha: number) => {
    const lvl = Math.max(0, Math.min(LEVELS - 1, Math.ceil(alpha * LEVELS) - 1));
    buckets[s.color * LEVELS + lvl].push(s.x, s.y, s.size);
  };
  let textBuilt = false;

  const resize = () => {
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  const burst = (x: number, y: number, n = 70) => {
    const color = pickColor();
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const s = rand(1.2, 4.2);
      sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rand(50, 90), color: Math.random() < 0.25 ? WHITE : color, size: rand(1.2, 2.4) });
    }
  };

  const buildText = () => {
    textBuilt = true;
    const pts = textTargets(lines, Math.floor(w), Math.floor(h));
    for (const p of pts) {
      sparks.push({
        x: w / 2 + rand(-30, 30),
        y: h * 0.45 + rand(-30, 30),
        vx: rand(-6, 6),
        vy: rand(-6, 6),
        life: Infinity,
        color: pickColor(),
        size: rand(1.1, 2),
        tx: p.x,
        ty: p.y,
        delay: rand(0, 30),
      });
    }
  };

  if (reduce) {
    buildText();
    for (const s of sparks) {
      s.x = s.tx!;
      s.y = s.ty!;
    }
  }

  const frame = (now: number) => {
    const t = now - start;
    // passo em "quadros de 60 Hz": celular de 90/120 Hz não acelera os fogos
    const k = last ? Math.min(3, Math.max(0.1, (now - last) / (1000 / 60))) : 1;
    last = now;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgba(18, 20, 52, ${1 - Math.pow(0.78, k)})`;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';

    if (!reduce) {
      const gap = t < 3200 ? 380 : 1400;
      if (now - lastBurst > gap) {
        lastBurst = now;
        burst(rand(w * 0.15, w * 0.85), rand(h * 0.12, t < 3200 ? h * 0.55 : h * 0.25), t < 3200 ? 80 : 40);
      }
      if (!textBuilt && t > 2600) buildText();
    }

    sparks = sparks.filter((s) => s.life > 0);
    for (const s of sparks) {
      if (s.tx !== undefined) {
        if (s.delay! > 0) {
          s.delay! -= k;
          s.x += s.vx * k;
          s.y += s.vy * k;
        } else {
          const e = 1 - Math.pow(0.93, k);
          s.x += (s.tx - s.x) * e;
          s.y += (s.ty! - s.y) * e;
        }
        add(s, 0.65 + 0.35 * Math.sin(now / 260 + s.tx * 0.05 + s.ty! * 0.03));
      } else {
        const drag = Math.pow(0.985, k);
        s.vy += 0.045 * k;
        s.vx *= drag;
        s.vy *= drag;
        s.x += s.vx * k;
        s.y += s.vy * k;
        s.life -= k;
        add(s, Math.min(1, s.life / 40));
      }
    }
    buckets.forEach((b, i) => {
      if (!b.length) return;
      ctx.globalAlpha = ((i % LEVELS) + 1) / LEVELS;
      ctx.fillStyle = COLORS[Math.floor(i / LEVELS)];
      ctx.beginPath();
      for (let j = 0; j < b.length; j += 3) {
        const r = b[j + 2] * 0.9;
        ctx.rect(b[j] - r, b[j + 1] - r, r * 2, r * 2);
      }
      ctx.fill();
      b.length = 0;
    });
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  };

  ctx.fillStyle = 'rgb(18, 20, 52)';
  ctx.fillRect(0, 0, w, h);
  start = performance.now();
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    ctx.clearRect(0, 0, w, h);
  };
}
