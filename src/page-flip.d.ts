declare module 'page-flip/dist/js/page-flip.module.js' {
  export class PageFlip {
    constructor(element: HTMLElement, settings: Record<string, unknown>);
    loadFromHTML(items: NodeListOf<HTMLElement> | HTMLElement[]): void;
    on(event: 'flip' | 'changeOrientation' | 'changeState' | 'init', cb: (e: { data: unknown }) => void): this;
    flipNext(): void;
    flipPrev(): void;
    update(): void;
    destroy(): void;
    getPageCount(): number;
    getCurrentPageIndex(): number;
    getOrientation(): 'portrait' | 'landscape';
    getSettings(): { flippingTime: number };
  }
}
