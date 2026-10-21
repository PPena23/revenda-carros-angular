import { Directive, DOCUMENT, ElementRef, OnDestroy, Renderer2, inject, input } from '@angular/core';

let contador = 0;

/**
 * Tooltip acessível: aparece no hover E no foco do teclado, liga-se ao elemento
 * via aria-describedby e fecha com Esc. Uso: <button appTooltip="Texto">.
 */
@Directive({
  selector: '[appTooltip]',
  host: {
    '(mouseenter)': 'mostrar()',
    '(focusin)': 'mostrar()',
    '(mouseleave)': 'esconder()',
    '(focusout)': 'esconder()',
    '(keydown.escape)': 'esconder()',
  },
})
export class TooltipDirective implements OnDestroy {
  readonly appTooltip = input.required<string>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly documento = inject(DOCUMENT);
  private readonly id = `tooltip-${++contador}`;
  private balao: HTMLElement | null = null;

  mostrar(): void {
    if (this.balao || !this.appTooltip()) return;
    const balao = this.renderer.createElement('span') as HTMLElement;
    this.renderer.addClass(balao, 'tooltip');
    this.renderer.setAttribute(balao, 'role', 'tooltip');
    this.renderer.setAttribute(balao, 'id', this.id);
    balao.textContent = this.appTooltip();
    this.renderer.appendChild(this.documento.body, balao);

    // Posiciona acima do elemento (ou abaixo, se não couber), sem sair da tela.
    const r = this.host.nativeElement.getBoundingClientRect();
    const b = balao.getBoundingClientRect();
    const largura = this.documento.documentElement.clientWidth;
    const esquerda = Math.min(Math.max(8, r.left + r.width / 2 - b.width / 2), largura - b.width - 8);
    const topo = r.top - b.height - 8 > 8 ? r.top - b.height - 8 : r.bottom + 8;
    this.renderer.setStyle(balao, 'left', `${esquerda + window.scrollX}px`);
    this.renderer.setStyle(balao, 'top', `${topo + window.scrollY}px`);
    this.renderer.setAttribute(this.host.nativeElement, 'aria-describedby', this.id);
    this.balao = balao;
  }

  esconder(): void {
    if (!this.balao) return;
    this.renderer.removeChild(this.documento.body, this.balao);
    this.renderer.removeAttribute(this.host.nativeElement, 'aria-describedby');
    this.balao = null;
  }

  ngOnDestroy(): void {
    this.esconder();
  }
}
