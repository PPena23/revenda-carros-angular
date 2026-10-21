import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { API_CONFIG } from '../config/app.tokens';
import { Sessao } from '../models/dashboard.model';

const CHAVE = 'vertice-motors:sessao';

/**
 * Login FAKE, apenas para demonstração (o "servidor" é o fakeBackendInterceptor).
 * Em produção o token viria de um back-end real e seria validado no servidor.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly api = inject(API_CONFIG).baseUrl;

  private readonly sessao = signal<Sessao | null>(this.lerSessao());

  readonly usuario = computed(() => this.sessao()?.usuario ?? null);
  readonly autenticado = computed(() => this.sessao() !== null);
  readonly token = computed(() => this.sessao()?.token ?? null);

  login(email: string, senha: string): Observable<Sessao> {
    return this.http.post<Sessao>(`${this.api}/auth/login`, { email, senha }).pipe(
      tap((s) => {
        this.sessao.set(s);
        this.persistir(s);
      }),
    );
  }

  logout(redirecionar = true): void {
    this.sessao.set(null);
    this.persistir(null);
    if (redirecionar) this.router.navigate(['/admin/login']);
  }

  private lerSessao(): Sessao | null {
    try {
      const bruto = sessionStorage.getItem(CHAVE);
      return bruto ? (JSON.parse(bruto) as Sessao) : null;
    } catch {
      return null;
    }
  }

  private persistir(s: Sessao | null): void {
    try {
      if (s) sessionStorage.setItem(CHAVE, JSON.stringify(s));
      else sessionStorage.removeItem(CHAVE);
    } catch {
      /* ignora */
    }
  }
}
