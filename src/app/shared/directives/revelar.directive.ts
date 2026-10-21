import { Directive, ElementRef, OnDestroy, afterNextRender, inject, input } from '@angular/core';

/**
 * Animação de entrada ao rolar a página (IntersectionObserver).
 * Com prefers-reduced-motion o CSS desliga a transição (ver styles.scss).
 * Uso: <article appRevelar> ou <article [appRevelar]="i * 60"> para efeito cascata.
 */
@Directive({
  selector: '[appRevelar]',
  host: { class: 'revelar' },
})
export class RevelarDirective implements OnDestroy {
  readonly appRevelar = input<number | ''>('');

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private observer?: IntersectionObserver;

  constructor() {
    afterNextRender(() => {
      const elemento = this.el.nativeElement;
      const atraso = Number(this.appRevelar()) || 0;
      if (atraso) elemento.style.transitionDelay = `${Math.min(atraso, 480)}ms`;

      if (typeof IntersectionObserver === 'undefined') {
        elemento.classList.add('revelado');
        return;
      }
      this.observer = new IntersectionObserver(
        (entradas) => {
          if (entradas.some((e) => e.isIntersecting)) {
            elemento.classList.add('revelado');
            this.observer?.disconnect();
          }
        },
        { rootMargin: '0px 0px -30px 0px', threshold: 0.05 },
      );
      this.observer.observe(elemento);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
