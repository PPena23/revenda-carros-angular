import { Component, DOCUMENT, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmacaoService } from '../../../core/services/confirmacao.service';
import { LeadsService } from '../../../core/services/leads.service';
import { NotificacaoService } from '../../../core/services/notificacao.service';
import { DemoControles } from '../../../shared/components/demo-controles/demo-controles';
import { Icone, NomeIcone } from '../../../shared/components/icone/icone';
import { Logo } from '../../../shared/components/logo/logo';

/** Casca do painel (tema claro): menu lateral recolhível no celular + barra superior. */
@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icone, Logo, DemoControles],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
  host: { class: 'tema-claro', '(keydown.escape)': 'menuAberto.set(false)' },
})
export class AdminLayout {
  protected readonly auth = inject(AuthService);
  private readonly confirmacao = inject(ConfirmacaoService);
  private readonly leads = inject(LeadsService);
  private readonly notificacao = inject(NotificacaoService);
  private readonly documento = inject(DOCUMENT);

  protected readonly menuAberto = signal(false);

  protected readonly itens: { rota: string; rotulo: string; icone: NomeIcone }[] = [
    { rota: '/admin/dashboard', rotulo: 'Visão geral', icone: 'painel' },
    { rota: '/admin/veiculos', rotulo: 'Veículos', icone: 'carro' },
    { rota: '/admin/leads', rotulo: 'Leads', icone: 'leads' },
  ];

  constructor() {
    inject(Router)
      .events.pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.menuAberto.set(false));
  }

  protected irParaConteudo(): void {
    this.documento.getElementById('conteudo-admin')?.focus();
  }

  protected async restaurar(): Promise<void> {
    const ok = await this.confirmacao.perguntar({
      titulo: 'Restaurar dados de demonstração?',
      mensagem: 'Todos os veículos e leads voltarão ao estado inicial. Suas alterações serão perdidas.',
      confirmar: 'Restaurar',
      perigo: true,
    });
    if (!ok) return;
    this.leads.restaurarDados().subscribe({
      next: () => {
        this.notificacao.sucesso('Dados restaurados. Recarregando…');
        setTimeout(() => this.documento.location.reload(), 600);
      },
      error: () => this.notificacao.erro('Não foi possível restaurar os dados.'),
    });
  }
}
