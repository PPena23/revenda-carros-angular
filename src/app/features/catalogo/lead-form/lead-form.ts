import { Component, ElementRef, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Lead, PreferenciaContato } from '../../../core/models/lead.model';
import { Veiculo } from '../../../core/models/veiculo.model';
import { LeadsService } from '../../../core/services/leads.service';
import { mensagemDeErro } from '../../../core/utils/estado-requisicao';
import { tituloVeiculo } from '../../../core/utils/rotulos';
import { Icone } from '../../../shared/components/icone/icone';
import { MascaraTelefoneDirective } from '../../../shared/directives/mascara-telefone.directive';
import { nomeCompletoValidator, telefoneBrValidator } from '../../../shared/validators/validadores';

type Campo = 'nome' | 'telefone' | 'email' | 'mensagem' | 'aceite';

/**
 * Formulário "Tenho interesse" — gera um Lead que aparece no painel administrativo.
 * Validações: nativas (required, email, minLength) + customizadas (nome completo, telefone BR).
 */
@Component({
  selector: 'app-lead-form',
  imports: [ReactiveFormsModule, RouterLink, Icone, MascaraTelefoneDirective],
  templateUrl: './lead-form.html',
  styleUrl: './lead-form.scss',
})
export class LeadForm implements OnInit {
  readonly veiculo = input<Veiculo | null>(null);
  readonly titulo = input('Tenho interesse');

  private readonly leads = inject(LeadsService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly enviando = signal(false);
  protected readonly enviado = signal<Lead | null>(null);
  protected readonly erroEnvio = signal<string | null>(null);

  protected readonly uid = `lead-${Math.random().toString(36).slice(2, 7)}`;

  protected readonly preferencias: { valor: PreferenciaContato; rotulo: string }[] = [
    { valor: 'whatsapp', rotulo: 'WhatsApp' },
    { valor: 'telefone', rotulo: 'Ligação' },
    { valor: 'email', rotulo: 'E-mail' },
  ];

  protected readonly mensagemPadrao = computed(() => {
    const v = this.veiculo();
    return v
      ? `Olá! Tenho interesse no ${tituloVeiculo(v)} ${v.anoFabricacao}/${v.anoModelo}. Ainda está disponível?`
      : '';
  });

  protected readonly form = inject(FormBuilder).nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(80), nomeCompletoValidator]],
    telefone: ['', [Validators.required, telefoneBrValidator]],
    email: ['', [Validators.required, Validators.email]],
    mensagem: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
    preferencia: ['whatsapp' as PreferenciaContato],
    aceite: [false, Validators.requiredTrue],
  });

  ngOnInit(): void {
    this.form.controls.mensagem.setValue(this.mensagemPadrao());
  }

  protected invalido(campo: Campo): boolean {
    const c = this.form.controls[campo];
    return c.invalid && (c.touched || c.dirty);
  }

  /** Mensagens de erro em português, uma por vez, na ordem de prioridade. */
  protected erro(campo: Campo): string {
    const e = this.form.controls[campo].errors ?? {};
    if (e['required']) {
      return {
        nome: 'Informe seu nome.',
        telefone: 'Informe um telefone para contato.',
        email: 'Informe seu e-mail.',
        mensagem: 'Escreva uma mensagem.',
        aceite: 'É preciso autorizar o contato.',
      }[campo];
    }
    if (e['nomeCompleto']) return 'Informe nome e sobrenome.';
    if (e['telefoneBr']) return e['telefoneBr'] as string;
    if (e['email']) return 'E-mail inválido. Ex.: nome@exemplo.com';
    if (e['minlength']) return `Escreva pelo menos ${e['minlength'].requiredLength} caracteres.`;
    if (e['maxlength']) return `Máximo de ${e['maxlength'].requiredLength} caracteres.`;
    return 'Campo inválido.';
  }

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      // Leva o foco ao primeiro campo com erro (melhor para teclado e leitor de tela).
      queueMicrotask(() =>
        this.host.nativeElement.querySelector<HTMLElement>('.ng-invalid:not(form)')?.focus(),
      );
      return;
    }

    const { aceite, ...dados } = this.form.getRawValue();
    this.enviando.set(true);
    this.erroEnvio.set(null);

    this.leads
      .enviar({ ...dados, veiculoId: this.veiculo()?.id })
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: (lead) => {
          this.enviado.set(lead);
          this.form.reset({ preferencia: 'whatsapp', mensagem: this.mensagemPadrao() });
        },
        error: (e: unknown) => this.erroEnvio.set(mensagemDeErro(e)),
      });
  }

  protected novoContato(): void {
    this.enviado.set(null);
  }
}
