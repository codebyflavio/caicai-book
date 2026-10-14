// Fogos de artifício: foguetes sobem, explodem em vários formatos e, no meio do show,
// o nome dela aparece letra por letra (em HTML, nítido em qualquer tela), cada letra
// acompanhada de uma faísca dourada.

const COLORS = ['#a8c4e0', '#6c8ebf', '#c9b6e4', '#9b7ebd', '#ffd27a', '#f6b6cf', '#ffffff'];
const BLUE = [0, 1];
const PURPLE = [2, 3];
const GOLD = 4;
const PINK = 5;
const WHITE = 6;
// os traços são desenhados em lotes (um traçado por cor + nível de brilho + espessura)
const LEVELS = 6;
const WIDTHS = [1.1, 2];
const TEXT_AT = 2900; // ms até o nome começar a aparecer

interface Spark {
  x: number;
  y: number;
  tail: number[]; // posições recentes (x, y, tempo) para desenhar o rastro
  trail: number; // duração do rastro em ms
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: number;
  drag: number;
  grav: number;
  thin: boolean;
  glitter: boolean;
}

interface Rocket {
  x: number;
  y: number;
  tail: number[];
  vy: number;
  vx: number;
  kind: Kind;
  scale: number;
}

interface Flash {
  x: number;
  y: number;
  r: number;
  life: number;
}

type Kind = 'peony' | 'ring' | 'willow' | 'duo';

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const GRAV = 0.14; // só dos foguetes subindo

function buildText(lines: string[]): { el: HTMLDivElement; marks: { span: HTMLElement; at: number }[] } {
  const el = document.createElement('div');
  el.className = 'fw-text';
  el.setAttribute('role', 'text');
  const marks: { span: HTMLElement; at: number }[] = [];
  const starts = [0, 1100, 2100];
  const gaps = [280, 170, 55];
  lines.forEach((line, i) => {
    const p = document.createElement('p');
    p.className = `fw-l${i}`;
    [...line].forEach((ch, j) => {
      const s = document.createElement('span');
      s.textContent = ch;
      const d = starts[i] + j * gaps[i];
      s.style.animationDelay = `${TEXT_AT + d}ms`;
      p.append(s);
      if (i < 2) marks.push({ span: s, at: TEXT_AT + d + 260 });
    });
    el.append(p);
  });
  return { el, marks };
}

export function launchFireworks(canvas: HTMLCanvasElement, lines: string[]): () => void {
  const ctx = canvas.getContext('2d')!;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w = 0;
  let h = 0;
  let unit = 1; // velocidade das faíscas proporcional ao tamanho da tela
  let sparks: Spark[] = [];
  let rockets: Rocket[] = [];
  let flashes: Flash[] = [];
  let raf = 0;
  let last = 0;
  let nextLaunch = 0;
  let bigDone = false;
  let clock = 0;

  const { el: text, marks } = buildText(lines);
  if (reduce) text.classList.add('instant');
  canvas.after(text);

  const level = (a: number) => Math.max(0, Math.min(LEVELS - 1, Math.ceil(a * LEVELS) - 1));
  const trim = (tail: number[], x: number, y: number, ms: number) => {
    tail.push(x, y, clock);
    while (tail.length > 6 && clock - tail[2] > ms) tail.splice(0, 3);
  };
  const buckets: number[][] = Array.from({ length: COLORS.length * LEVELS * 2 }, () => []);

  const resize = () => {
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    unit = Math.min(w, h) / 380;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  const spark = (x: number, y: number, vx: number, vy: number, o: Partial<Spark> & { life: number; color: number }) => {
    sparks.push({ x, y, tail: [x, y, clock], trail: 200, vx, vy, drag: 0.975, grav: 0.045, thin: false, glitter: false, max: o.life, ...o });
  };

  const explode = (x: number, y: number, kind: Kind, scale = 1) => {
    const s = 4.2 * unit * scale;
    flashes.push({ x, y, r: 60 * unit * scale, life: 1 });
    if (kind === 'willow') {
      for (let i = 0; i < Math.round(130 * scale); i++) {
        const a = Math.random() * Math.PI * 2;
        const v = s * rand(0.55, 0.9);
        spark(x, y, Math.cos(a) * v, Math.sin(a) * v, {
          life: rand(130, 170), color: Math.random() < 0.2 ? WHITE : GOLD, drag: 0.965, grav: 0.022, glitter: true, trail: 420,
        });
      }
      return;
    }
    if (kind === 'ring') {
      const c = pick([...BLUE, ...PURPLE, PINK]);
      const n = 64;
      const tilt = rand(0.35, 0.8);
      const rot = rand(0, Math.PI);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const rx = Math.cos(a) * s;
        const ry = Math.sin(a) * s * tilt;
        spark(x, y, rx * Math.cos(rot) - ry * Math.sin(rot), rx * Math.sin(rot) + ry * Math.cos(rot), {
          life: rand(65, 80), color: c,
        });
      }
      for (let i = 0; i < 24; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = s * rand(0.1, 0.35);
        spark(x, y, Math.cos(a) * v, Math.sin(a) * v, { life: rand(40, 60), color: WHITE, thin: true, glitter: true });
      }
      return;
    }
    // peony: casca esférica; duo: casca + miolo de outra cor
    const outer = pick([...BLUE, ...PURPLE, PINK, GOLD]);
    const n = Math.round(120 * scale);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      // casca vista de frente: mais faíscas perto da borda
      const v = s * Math.sqrt(1 - Math.pow(Math.random(), 2));
      spark(x, y, Math.cos(a) * v, Math.sin(a) * v, {
        life: rand(60, 85), color: Math.random() < 0.15 ? WHITE : outer, glitter: Math.random() < 0.3,
      });
    }
    if (kind === 'duo') {
      const inner = outer === GOLD ? pick(PURPLE) : GOLD;
      for (let i = 0; i < 50; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = s * rand(0.25, 0.45);
        spark(x, y, Math.cos(a) * v, Math.sin(a) * v, { life: rand(50, 70), color: inner });
      }
    }
  };

  const launch = (x: number, top: number, kind: Kind = pick(['peony', 'peony', 'duo', 'ring', 'willow']), scale = 1) => {
    const y0 = h + 10;
    // velocidade para parar exatamente na altura alvo
    const vy = -Math.sqrt(2 * GRAV * (y0 - top));
    rockets.push({ x, y: y0, tail: [x, y0, clock], vy, vx: scale > 1 ? 0 : rand(-0.3, 0.3) * unit, kind, scale });
  };

  // Brilho dourado em volta de cada caractere quando ele aparece
  const twinkleAt = (x: number, y: number) => {
    for (let i = 0; i < 26; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = unit * rand(0.6, 2.2);
      spark(x, y, Math.cos(a) * v, Math.sin(a) * v, {
        life: rand(35, 55), color: Math.random() < 0.4 ? WHITE : GOLD, thin: true, glitter: true, drag: 0.94, grav: 0.02,
      });
    }
  };

  const start = performance.now();
  let markIdx = 0;

  const frame = (now: number) => {
    const t = now - start;
    // passo em "quadros de 60 Hz": celular de 90/120 Hz não acelera os fogos
    const k = last ? Math.min(3, Math.max(0.1, (now - last) / (1000 / 60))) : 1;
    last = now;
    clock = now;

    // tela limpa a cada quadro; o rastro vem das posições guardadas em cada faísca.
    // (escurecer o quadro anterior deixava fantasmas cinza por arredondamento)
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';

    if (!reduce) {
      // abertura com vários foguetes, um dourado grande atrás do nome, depois show mais calmo
      if (t >= nextLaunch) {
        if (t < 2400) {
          launch(rand(w * 0.15, w * 0.85), rand(h * 0.1, t < 900 ? h * 0.45 : h * 0.3));
          nextLaunch = t + rand(260, 420);
        } else if (t > 5500) {
          const side = Math.random() < 0.5;
          launch(side ? rand(w * 0.1, w * 0.35) : rand(w * 0.65, w * 0.9), rand(h * 0.08, h * 0.26));
          if (Math.random() < 0.25) launch(rand(w * 0.3, w * 0.7), rand(h * 0.06, h * 0.2), 'ring');
          nextLaunch = t + rand(650, 1150);
        } else nextLaunch = t + 100;
      }
      if (!bigDone && t > 1300) {
        bigDone = true;
        launch(w / 2, h * 0.36, 'willow', 1.25);
      }
      while (markIdx < marks.length && t >= marks[markIdx].at) {
        const r = marks[markIdx++].span.getBoundingClientRect();
        twinkleAt(r.left + r.width / 2, r.top + r.height / 2);
      }
    }

    // foguetes subindo, com rastro de faíscas
    rockets = rockets.filter((r) => {
      r.vy += GRAV * k;
      r.x += r.vx * k;
      r.y += r.vy * k;
      trim(r.tail, r.x, r.y, 140);
      if (Math.random() < 0.6) {
        spark(r.x, r.y, rand(-0.15, 0.15), rand(0.1, 0.5), { life: rand(10, 18), color: GOLD, thin: true, drag: 0.9 });
      }
      const lvl = LEVELS - 1;
      buckets[(GOLD * LEVELS + lvl) * 2 + 1].push(r.tail[0], r.tail[1], r.x, r.y);
      if (r.vy >= -0.3) {
        explode(r.x, r.y, r.kind, r.scale);
        return false;
      }
      return true;
    });

    sparks = sparks.filter((s) => s.life > 0);
    for (const s of sparks) {
      const drag = Math.pow(s.drag, k);
      s.vx *= drag;
      s.vy = s.vy * drag + s.grav * unit * k;
      s.x += s.vx * k;
      s.y += s.vy * k;
      s.life -= k;
      trim(s.tail, s.x, s.y, s.trail);
      const f = s.life / s.max;
      let alpha = Math.min(1, f / 0.45);
      if (s.glitter && f < 0.6 && Math.random() < 0.45) alpha *= 0.15;
      if (alpha < 0.04) continue;
      // cabeça forte até o meio do rastro, cauda mais fraca até o ponto mais antigo
      const m = Math.floor(s.tail.length / 6) * 3;
      const wc = s.thin ? 0 : 1;
      buckets[(s.color * LEVELS + level(alpha)) * 2 + wc].push(s.tail[m], s.tail[m + 1], s.x, s.y);
      if (m > 0) buckets[(s.color * LEVELS + level(alpha * 0.35)) * 2 + 0].push(s.tail[0], s.tail[1], s.tail[m], s.tail[m + 1]);
    }

    ctx.lineCap = 'round';
    buckets.forEach((b, i) => {
      if (!b.length) return;
      const key = i >> 1;
      ctx.globalAlpha = ((key % LEVELS) + 1) / LEVELS;
      ctx.strokeStyle = COLORS[Math.floor(key / LEVELS)];
      ctx.lineWidth = WIDTHS[i & 1] * Math.max(1, unit * 0.9);
      ctx.beginPath();
      for (let j = 0; j < b.length; j += 4) {
        ctx.moveTo(b[j], b[j + 1]);
        // traço mínimo, para a faísca parada ainda aparecer como ponto
        ctx.lineTo(b[j + 2] + 0.01, b[j + 3]);
      }
      ctx.stroke();
      b.length = 0;
    });

    // clarão rápido no centro de cada explosão
    flashes = flashes.filter((f) => {
      const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
      g.addColorStop(0, `rgba(255, 240, 220, ${0.5 * f.life})`);
      g.addColorStop(1, 'rgba(255, 240, 220, 0)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = g;
      ctx.fillRect(f.x - f.r, f.y - f.r, f.r * 2, f.r * 2);
      f.life -= 0.18 * k;
      return f.life > 0;
    });

    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  };

  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    text.remove();
    ctx.clearRect(0, 0, w, h);
  };
}
