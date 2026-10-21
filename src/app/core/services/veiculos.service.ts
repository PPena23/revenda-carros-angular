import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, shareReplay, throwError } from 'rxjs';
import { API_CONFIG } from '../config/app.tokens';
import {
  FiltroVeiculos,
  OpcoesFiltro,
  Pagina,
  Veiculo,
  VeiculoPayload,
} from '../models/veiculo.model';
import { limparFiltro } from '../utils/filtro-veiculos';

/** Acesso à API de veículos. Todos os métodos retornam Observables "frios" (lazy). */
@Injectable({ providedIn: 'root' })
export class VeiculosService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_CONFIG).baseUrl;

  /** Opções dos filtros mudam pouco: uma requisição compartilhada entre todos os assinantes. */
  private opcoesCache$?: Observable<OpcoesFiltro>;

  buscar(filtro: FiltroVeiculos): Observable<Pagina<Veiculo>> {
    const params = new HttpParams({
      fromObject: limparFiltro(filtro) as Record<string, string | number | boolean>,
    });
    return this.http.get<Pagina<Veiculo>>(`${this.api}/veiculos`, { params });
  }

  destaques(quantidade = 6): Observable<Veiculo[]> {
    return this.buscar({ destaque: true, porPagina: quantidade }).pipe(map((p) => p.itens));
  }

  similares(v: Veiculo, quantidade = 4): Observable<Veiculo[]> {
    return this.buscar({ categoria: v.categoria, porPagina: quantidade + 1 }).pipe(
      map((p) => p.itens.filter((x) => x.id !== v.id).slice(0, quantidade)),
    );
  }

  opcoes(): Observable<OpcoesFiltro> {
    this.opcoesCache$ ??= this.http
      .get<OpcoesFiltro>(`${this.api}/veiculos/opcoes`)
      .pipe(shareReplay({ bufferSize: 1, refCount: false }));
    return this.opcoesCache$;
  }

  obter(id: string): Observable<Veiculo> {
    return this.http.get<Veiculo>(`${this.api}/veiculos/${id}`);
  }

  /**
   * Busca vários veículos em paralelo (forkJoin). Um id inexistente (ex.: carro vendido e
   * removido) não derruba a lista inteira — é apenas descartado.
   */
  obterVarios(ids: readonly string[]): Observable<Veiculo[]> {
    if (!ids.length) return of([]);
    return forkJoin(
      ids.map((id) =>
        this.obter(id).pipe(
          catchError((e: { status?: number }) => (e?.status === 404 ? of(null) : throwError(() => e))),
        ),
      ),
    ).pipe(map((lista) => lista.filter((v): v is Veiculo => v !== null)));
  }

  // ---------- Administração (exige token) ----------

  listarTodos(): Observable<Veiculo[]> {
    return this.http.get<Veiculo[]>(`${this.api}/admin/veiculos`);
  }

  criar(payload: VeiculoPayload): Observable<Veiculo> {
    this.invalidarOpcoes();
    return this.http.post<Veiculo>(`${this.api}/admin/veiculos`, payload);
  }

  atualizar(id: string, payload: VeiculoPayload): Observable<Veiculo> {
    this.invalidarOpcoes();
    return this.http.put<Veiculo>(`${this.api}/admin/veiculos/${id}`, payload);
  }

  registrarVenda(id: string, precoVenda: number, dataVenda: string): Observable<Veiculo> {
    this.invalidarOpcoes();
    return this.http.post<Veiculo>(`${this.api}/admin/veiculos/${id}/venda`, { precoVenda, dataVenda });
  }

  excluir(id: string): Observable<void> {
    this.invalidarOpcoes();
    return this.http.delete<void>(`${this.api}/admin/veiculos/${id}`);
  }

  placaDisponivel(placa: string, ignorarId?: string): Observable<boolean> {
    const params = new HttpParams({ fromObject: limparFiltro({ placa, ignorarId }) as Record<string, string> });
    return this.http
      .get<{ disponivel: boolean }>(`${this.api}/admin/veiculos/placa-disponivel`, { params })
      .pipe(map((r) => r.disponivel));
  }

  private invalidarOpcoes(): void {
    this.opcoesCache$ = undefined;
  }
}
