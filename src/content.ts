// Todo o texto do livro fica aqui. Cada "spread" é uma página dupla:
// L = página da esquerda, R = página da direita (no celular viram duas páginas seguidas).
// Posições em % da página (x, y, w); size em % da largura da página.

export type Side = 'L' | 'R';
export type Animal = 'dog' | 'dogSleep' | 'hamster' | 'hamsterPeek' | 'bunny';

export interface TextBlock {
  side: Side;
  x: number;
  y: number;
  w: number;
  lines: string[];
  size?: number;
  align?: 'left' | 'center' | 'right';
  light?: boolean; // texto claro, para fundos escuros
  glow?: boolean; // halo de papel atrás do texto
  title?: boolean;
}

export interface Decor {
  side: Side;
  animal: Animal;
  x: number;
  y: number;
  w: number;
  flip?: boolean;
  motion?: 'bob' | 'peek' | 'breathe';
}

export interface Spread {
  image?: string;
  scene?: 'animals' | 'finale';
  texts: TextBlock[];
  decor?: Decor[];
}

export const spreads: Spread[] = [
  // Capa
  {
    image: 'capa',
    texts: [
      { side: 'L', x: 6, y: 9, w: 88, size: 11, align: 'center', title: true, lines: ['猜猜我有多爱你'] },
      { side: 'R', x: 8, y: 10, w: 84, size: 5.6, align: 'center', lines: ['给 Yuruzinha 的生日书'] },
      { side: 'R', x: 8, y: 17.5, w: 84, size: 4, align: 'center', lines: ['2026 · 10 · 19'] },
    ],
  },
  // O coelhinho puxando a orelha
  {
    image: 'scanB',
    texts: [
      {
        side: 'R', x: 12, y: 9, w: 82, size: 5,
        lines: ['有一天，我想让你好好听我说。', '“猜猜我有多爱你？”我问。', '你笑着说：', '“喔，这我可猜不出来。”'],
      },
    ],
  },
  // Braços abertos no toco
  {
    image: 'scanA',
    texts: [
      { side: 'L', x: 9, y: 4, w: 84, size: 5, lines: ['我把手臂张开，', '开得不能再开。', '“我爱你有这么多。”'] },
      { side: 'R', x: 10, y: 6, w: 56, size: 5.4, lines: ['可是……', '这还不够。'] },
    ],
  },
  // O coelho grande de braços abertos
  {
    image: 'scanC',
    texts: [
      { side: 'R', x: 12, y: 10, w: 82, size: 5.2, lines: ['因为我的手臂再长，', '也伸不到地球的另一边——', '伸不到你那里。'] },
    ],
  },
  // O dia a dia dela
  {
    image: 'p05',
    texts: [
      { side: 'R', x: 10, y: 7, w: 86, size: 4.8, lines: ['你给我发你的工作、你的宿舍、', '你走过的每一条街。', '每一张，我都看了好多好多遍。'] },
    ],
    decor: [{ side: 'R', animal: 'hamsterPeek', x: 74, y: 92.3, w: 20, motion: 'peek' }],
  },
  // A frase do papel de parede
  {
    image: 'p06',
    texts: [
      {
        side: 'L', x: 12, y: 28, w: 80, size: 5.6,
        lines: ['你在我的电脑桌面上，', '在我的手机里，', '在我的脑海里，在我的心里，', '一天二十四个小时。'],
      },
    ],
    decor: [{ side: 'L', animal: 'dogSleep', x: 9, y: 76, w: 34, motion: 'breathe' }],
  },
  // O fuso horário
  {
    image: 'p07',
    texts: [
      { side: 'L', x: 8, y: 8, w: 84, size: 6.2, align: 'center', lines: ['你的早晨，', '是我的夜晚。'] },
      { side: 'R', x: 9, y: 7, w: 86, size: 4.7, lines: ['我们之间隔着十一个小时。', '可是每个早上、每个晚上，', '我们都在聊天。'] },
    ],
  },
  // O sonho
  {
    image: 'p08',
    texts: [
      {
        side: 'L', x: 8, y: 3.5, w: 86, size: 4.2, glow: true,
        lines: ['你说你做了一个梦。', '梦里有一个派对，有好多人，好多选择。', '可是你选了我。', '如果是我，我也会选你，无数次。'],
      },
    ],
  },
  // Cores e animais
  {
    scene: 'animals',
    texts: [
      {
        side: 'L', x: 10, y: 14, w: 84, size: 4.6,
        lines: [
          '我问你最喜欢什么颜色、什么动物。',
          '你说：“太难选了！”',
          '那就选两个吧。',
          '你选了蓝色和紫色，',
          '小狗和仓鼠，还有小兔子。',
          '所以这本书是蓝色和紫色的，',
          '它们也一直在偷偷看着你。',
        ],
      },
    ],
    decor: [
      { side: 'R', animal: 'dog', x: 6, y: 46, w: 44, motion: 'bob' },
      { side: 'R', animal: 'bunny', x: 54, y: 40, w: 40, flip: true, motion: 'bob' },
      { side: 'R', animal: 'hamster', x: 34, y: 70, w: 30, motion: 'bob' },
      { side: 'L', animal: 'hamsterPeek', x: 70, y: 92.3, w: 20, motion: 'peek' },
    ],
  },
  // Gratidão
  {
    image: 'p10',
    texts: [
      { side: 'L', x: 9, y: 8, w: 84, size: 4.8, light: true, lines: ['我知道，过了今天，', '我们还会一直聊下去。', '我还有好多好多话，', '想放进这本书里。'] },
      { side: 'R', x: 14, y: 8, w: 80, size: 4.8, light: true, lines: ['可是现在，我只想说：', '谢谢你，', '给了我每一个美好的时刻。'] },
    ],
  },
  // Fechamento
  {
    image: 'p11',
    texts: [
      { side: 'L', x: 8, y: 18, w: 84, size: 7, align: 'center', title: true, lines: ['猜猜我有多爱你？'] },
      { side: 'L', x: 8, y: 34, w: 84, size: 5.1, align: 'center', lines: ['我爱你，从巴西一直到中国，', '再从中国，绕回到这里来。'] },
      { side: 'L', x: 8, y: 52, w: 84, size: 5.6, align: 'center', lines: ['生日快乐，Yuruzinha'] },
      { side: 'L', x: 8, y: 61, w: 76, size: 4.4, align: 'right', lines: ['爱你的 Flavio'] },
    ],
    decor: [
      { side: 'L', animal: 'dog', x: 10, y: 74, w: 24, motion: 'bob' },
      { side: 'L', animal: 'hamster', x: 34, y: 82, w: 16, motion: 'bob' },
    ],
  },
  // Página final com a surpresa
  {
    scene: 'finale',
    texts: [
      { side: 'L', x: 8, y: 30, w: 84, size: 6.4, align: 'center', title: true, lines: ['未完待续……'] },
      { side: 'L', x: 8, y: 42, w: 84, size: 4.4, align: 'center', lines: ['我们的故事，还有好多页。'] },
    ],
    decor: [
      { side: 'L', animal: 'dogSleep', x: 12, y: 74, w: 40, motion: 'breathe' },
      { side: 'L', animal: 'bunny', x: 56, y: 66, w: 30, flip: true, motion: 'bob' },
    ],
  },
];

export const ui = {
  hint: '点击或滑动，翻开下一页',
  prev: '上一页',
  next: '下一页',
  secret: '最后一个小秘密……',
  secretHint: '轻轻点一下',
  close: '合上',
  fireworks: ['贾裕如', '生日快乐', 'Yuruzinha'],
};
