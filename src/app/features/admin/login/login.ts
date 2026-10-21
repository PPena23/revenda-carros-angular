import { Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { CREDENCIAIS_DEMO } from '../../../core/interceptors/fake-backend.interceptor';
import { AuthService } from '../../../core/services/auth.service';
import { mensagemDeErro } from '../../../core/utils/estado-requisicao';
import { CarIllustration } from '../../../shared/components/car-illustration/car-illustration';
import { Icone } from '../../../shared/components/icone/icone';
import { Logo } from '../../../shared/components/logo/logo';

/** Login FAKE da demonstração — as credenciais ficam visíveis na própria tela. */
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, Logo, Icone, CarIllustration],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  /** ?returnUrl=... vindo do authGuard (component input binding também lê query params). */
  readonly returnUrl = input<string>();

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly demo = CREDENCIAIS_DEMO;
  protected readonly entrando = signal(false);
  protected readonly erro = signal<string | null>(null);
  protected readonly mostrarSenha = signal(false);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected preencherDemo(): void {
    this.form.setValue({ email: this.demo.email, senha: this.demo.senha });
    this.erro.set(null);
  }

  protected invalido(campo: 'email' | 'senha'): boolean {
    const c = this.form.controls[campo];
    return c.invalid && c.touched;
  }

  protected entrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, senha } = this.form.getRawValue();
    this.entrando.set(true);
    this.erro.set(null);
    this.auth
      .login(email, senha)
      .pipe(finalize(() => this.entrando.set(false)))
      .subscribe({
        next: () => this.router.navigateByUrl(this.returnUrl() || '/admin/dashboard'),
        error: (e: unknown) => this.erro.set(mensagemDeErro(e)),
      });
  }
}
