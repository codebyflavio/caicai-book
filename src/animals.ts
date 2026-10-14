// Figurinhas em SVG: traço de nanquim + manchas de aquarela.
// Os filtros #wc (borda de aquarela) e #ink (traço irregular) ficam no index.html.
// Este arquivo é a fonte: `npm run assets` transforma tudo em public/decor/*.webp.
import type { Animal } from './content';

const INK = '#5b4a3e';

const wrap = (viewBox: string, fill: string, line: string) => `
<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <g filter="url(#wc)" opacity="0.92">${fill}</g>
  <g filter="url(#ink)" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${line}</g>
</svg>`;

// Filhote de cachorro sentado, coleira azul com plaquinha roxa
const dog = wrap(
  '0 0 200 210',
  `
  <path d="M146 160 q30 -10 26 -42" stroke="#e3c194" stroke-width="13" fill="none" stroke-linecap="round"/>
  <ellipse cx="100" cy="148" rx="48" ry="46" fill="#ecd0a6"/>
  <ellipse cx="100" cy="158" rx="26" ry="30" fill="#f8ead6"/>
  <ellipse cx="100" cy="80" rx="44" ry="39" fill="#f0d5ae"/>
  <path d="M62 58 q-24 10 -16 52 q4 14 18 6 q8 -30 10 -50 z" fill="#b98a5e"/>
  <path d="M138 58 q24 10 16 52 q-4 14 -18 6 q-8 -30 -10 -50 z" fill="#b98a5e"/>
  <ellipse cx="100" cy="96" rx="20" ry="14" fill="#faf0e0"/>
  <ellipse cx="76" cy="96" rx="7" ry="4" fill="#f3a9b5" opacity=".7"/>
  <ellipse cx="124" cy="96" rx="7" ry="4" fill="#f3a9b5" opacity=".7"/>
  <path d="M66 116 q34 16 68 0 l0 9 q-34 16 -68 0 z" fill="#6c8ebf"/>
  <circle cx="100" cy="132" r="7" fill="#9b7ebd"/>
  <ellipse cx="80" cy="192" rx="15" ry="9" fill="#f3ddbf"/>
  <ellipse cx="120" cy="192" rx="15" ry="9" fill="#f3ddbf"/>`,
  `
  <path d="M146 160 q30 -10 26 -42"/>
  <path d="M62 112 q-14 40 6 74 M138 112 q14 40 -6 74"/>
  <path d="M64 62 A44 39 0 0 1 136 62"/>
  <path d="M62 58 q-24 10 -16 52 q4 14 18 6 q8 -30 10 -50"/>
  <path d="M138 58 q24 10 16 52 q-4 14 -18 6 q-8 -30 -10 -50"/>
  <path d="M74 114 q26 12 52 0"/>
  <ellipse cx="80" cy="192" rx="15" ry="9"/>
  <ellipse cx="120" cy="192" rx="15" ry="9"/>
  <path d="M74 186 v10 M80 186 v12 M114 186 v12 M120 186 v10"/>
  <ellipse cx="100" cy="88" rx="6.5" ry="4.5" fill="${INK}"/>
  <path d="M100 93 v5 q-5 6 -10 2 M100 98 q5 6 10 2"/>
  <circle cx="84" cy="76" r="4" fill="${INK}" stroke="none"/>
  <circle cx="116" cy="76" r="4" fill="${INK}" stroke="none"/>
  <circle cx="85.5" cy="74.5" r="1.3" fill="#fff" stroke="none"/>
  <circle cx="117.5" cy="74.5" r="1.3" fill="#fff" stroke="none"/>`,
);

// Cachorrinho dormindo enrolado
const dogSleep = wrap(
  '0 0 220 130',
  `
  <ellipse cx="120" cy="88" rx="82" ry="34" fill="#ecd0a6"/>
  <path d="M190 92 q22 18 -6 30 q-40 6 -90 2" stroke="#e3c194" stroke-width="14" fill="none" stroke-linecap="round"/>
  <ellipse cx="62" cy="82" rx="34" ry="28" fill="#f0d5ae"/>
  <path d="M46 62 q-22 2 -24 30 q2 12 16 6 q6 -20 14 -30 z" fill="#b98a5e"/>
  <ellipse cx="46" cy="94" rx="14" ry="9" fill="#faf0e0"/>
  <ellipse cx="66" cy="96" rx="6" ry="3.5" fill="#f3a9b5" opacity=".7"/>
  <path d="M40 104 q30 10 50 -2" stroke="#6c8ebf" stroke-width="6" fill="none"/>`,
  `
  <path d="M90 58 q40 -14 90 2 q30 14 18 40"/>
  <path d="M190 92 q22 18 -6 30 q-40 6 -100 0"/>
  <path d="M30 76 q4 -26 32 -24 q28 0 34 24"/>
  <path d="M46 62 q-22 2 -24 30 q2 12 16 6 q6 -20 14 -30"/>
  <ellipse cx="34" cy="90" rx="4.5" ry="3.2" fill="${INK}"/>
  <path d="M52 80 q5 4 10 0 M70 78 q5 4 10 0"/>
  <path d="M38 102 q20 10 46 0"/>`,
);

// Hamster dourado de corpo inteiro
const hamsterBody = `
  <ellipse cx="100" cy="112" rx="70" ry="58" fill="#e9b872"/>
  <ellipse cx="100" cy="124" rx="44" ry="42" fill="#fff6e8"/>
  <circle cx="58" cy="62" r="14" fill="#e9a77e"/>
  <circle cx="142" cy="62" r="14" fill="#e9a77e"/>
  <circle cx="58" cy="63" r="7" fill="#f6c3b5"/>
  <circle cx="142" cy="63" r="7" fill="#f6c3b5"/>
  <ellipse cx="70" cy="108" rx="9" ry="5" fill="#f3a9b5" opacity=".75"/>
  <ellipse cx="130" cy="108" rx="9" ry="5" fill="#f3a9b5" opacity=".75"/>`;
const hamsterLine = `
  <path d="M48 70 q-30 40 -6 86 q56 30 116 0 q24 -46 -6 -86 q-52 -40 -104 0"/>
  <circle cx="58" cy="62" r="14"/>
  <circle cx="142" cy="62" r="14"/>
  <circle cx="83" cy="94" r="5" fill="${INK}" stroke="none"/>
  <circle cx="117" cy="94" r="5" fill="${INK}" stroke="none"/>
  <circle cx="84.6" cy="92.4" r="1.6" fill="#fff" stroke="none"/>
  <circle cx="118.6" cy="92.4" r="1.6" fill="#fff" stroke="none"/>
  <path d="M96 104 l4 4 l4 -4 z" fill="#e58a9a"/>
  <path d="M100 108 q-5 6 -9 2 M100 108 q5 6 9 2"/>
  <path d="M76 104 l-22 -3 M76 108 l-22 3 M124 104 l22 -3 M124 108 l22 3" stroke-width="1.2"/>`;

const hamster = wrap(
  '0 0 200 185',
  `${hamsterBody}
  <ellipse cx="84" cy="138" rx="9" ry="7" fill="#f6c3b5"/>
  <ellipse cx="116" cy="138" rx="9" ry="7" fill="#f6c3b5"/>
  <ellipse cx="74" cy="172" rx="14" ry="7" fill="#f6c3b5"/>
  <ellipse cx="126" cy="172" rx="14" ry="7" fill="#f6c3b5"/>`,
  `${hamsterLine}
  <ellipse cx="84" cy="138" rx="9" ry="7"/>
  <ellipse cx="116" cy="138" rx="9" ry="7"/>
  <ellipse cx="74" cy="172" rx="14" ry="7"/>
  <ellipse cx="126" cy="172" rx="14" ry="7"/>`,
);

// Hamster espiando por cima da borda da página (só a parte de cima aparece)
const hamsterPeek = wrap(
  '0 40 200 104',
  `${hamsterBody}
  <ellipse cx="80" cy="136" rx="11" ry="8" fill="#f6c3b5"/>
  <ellipse cx="120" cy="136" rx="11" ry="8" fill="#f6c3b5"/>`,
  `${hamsterLine}
  <ellipse cx="80" cy="136" rx="11" ry="8"/>
  <ellipse cx="120" cy="136" rx="11" ry="8"/>
  <path d="M74 132 v6 M80 131 v7 M86 132 v6 M114 132 v6 M120 131 v7 M126 132 v6" stroke-width="1.3"/>`,
);

// Coelhinho branco-lavanda (diferente das lebres do livro)
const bunny = wrap(
  '0 0 200 230',
  `
  <path d="M74 20 q-16 40 4 76 l18 -4 q6 -44 -22 -72 z" fill="#f2eef8"/>
  <path d="M126 20 q16 40 -4 76 l-18 -4 q-6 -44 22 -72 z" fill="#f2eef8"/>
  <path d="M78 34 q-8 30 4 54 l8 -2 q2 -30 -12 -52 z" fill="#f6c3cf"/>
  <path d="M122 34 q8 30 -4 54 l-8 -2 q-2 -30 12 -52 z" fill="#f6c3cf"/>
  <ellipse cx="100" cy="170" rx="54" ry="50" fill="#ede6f6"/>
  <ellipse cx="100" cy="176" rx="30" ry="34" fill="#faf8fd"/>
  <ellipse cx="100" cy="116" rx="42" ry="36" fill="#f2eef8"/>
  <circle cx="156" cy="196" r="13" fill="#ffffff"/>
  <ellipse cx="74" cy="128" rx="8" ry="4.5" fill="#f3a9b5" opacity=".75"/>
  <ellipse cx="126" cy="128" rx="8" ry="4.5" fill="#f3a9b5" opacity=".75"/>
  <ellipse cx="80" cy="214" rx="16" ry="8" fill="#e4dcef"/>
  <ellipse cx="120" cy="214" rx="16" ry="8" fill="#e4dcef"/>`,
  `
  <path d="M74 20 q-16 40 4 76 M96 92 q6 -44 -22 -72"/>
  <path d="M126 20 q16 40 -4 76 M104 92 q-6 -44 22 -72"/>
  <path d="M60 110 q2 -32 40 -32 q38 0 40 32 q0 28 -22 38"/>
  <path d="M82 148 q-22 -10 -22 -38"/>
  <path d="M60 150 q-24 40 4 70 M140 150 q24 40 -4 70"/>
  <circle cx="156" cy="196" r="13"/>
  <ellipse cx="80" cy="214" rx="16" ry="8"/>
  <ellipse cx="120" cy="214" rx="16" ry="8"/>
  <circle cx="84" cy="112" r="4.2" fill="${INK}" stroke="none"/>
  <circle cx="116" cy="112" r="4.2" fill="${INK}" stroke="none"/>
  <circle cx="85.5" cy="110.5" r="1.4" fill="#fff" stroke="none"/>
  <circle cx="117.5" cy="110.5" r="1.4" fill="#fff" stroke="none"/>
  <path d="M96 122 l4 4 l4 -4 z" fill="#e58a9a"/>
  <path d="M100 126 q-5 6 -9 2 M100 126 q5 6 9 2"/>`,
);

export const animals: Record<Animal, string> = { dog, dogSleep, hamster, hamsterPeek, bunny };

// Fundo da página dos animais: manchas de aquarela azul e roxa, bolinhas e estrelas
export const animalsWash = `
<svg viewBox="0 0 200 270" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <g filter="url(#wash)">
    <ellipse cx="60" cy="150" rx="70" ry="60" fill="#a8c4e0" opacity=".55"/>
    <ellipse cx="150" cy="130" rx="60" ry="64" fill="#c9b6e4" opacity=".55"/>
    <ellipse cx="110" cy="230" rx="90" ry="34" fill="#a8c4e0" opacity=".35"/>
    <ellipse cx="40" cy="40" rx="30" ry="22" fill="#c9b6e4" opacity=".35"/>
  </g>
</svg>`;

// Estrelinhas que piscam: ficam em SVG de verdade (sem filtro) por cima da imagem
export const twinkleGroup = `<g fill="#d4a857">
    <path class="twinkle" d="M30 40 l2.4 6 6 2.4 -6 2.4 -2.4 6 -2.4 -6 -6 -2.4 6 -2.4z"/>
    <path class="twinkle d2" d="M172 54 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z"/>
    <path class="twinkle d3" d="M110 26 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6z"/>
  </g>`;

export const animalsTwinkle = `<svg viewBox="0 0 200 270" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${twinkleGroup}</svg>`;

export const animalsProps = `
<svg viewBox="0 0 200 270" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <g filter="url(#wc)">
    <circle cx="168" cy="236" r="13" fill="#6c8ebf"/>
    <circle cx="26" cy="232" r="11" fill="#9b7ebd"/>
  </g>
  <g filter="url(#ink)" fill="none" stroke="#5b4a3e" stroke-width="1.2">
    <circle cx="168" cy="236" r="13"/>
    <path d="M156 230 q12 6 24 0 M158 244 q10 -6 20 0"/>
    <circle cx="26" cy="232" r="11"/>
    <path d="M17 226 q9 10 18 0 M16 236 q10 -4 20 2"/>
  </g>
  ${twinkleGroup}
  <g fill="#e58aa8" opacity=".8">
    <path d="M96 92 c-4 -6 -12 -2 -8 4 l8 8 8 -8 c4 -6 -4 -10 -8 -4z"/>
  </g>
</svg>`;
