import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, combineLatest, skip } from 'rxjs';
import { API_CONFIG } from '../config/app.tokens';
import { Lead } from '../models/lead.model';
import { Veiculo } from '../models/veiculo.model';
import { DadosIniciais, gerarDadosIniciais } from './seed';

/**
 * "Banco de dados" do back-end simulado.
 * Estado em BehaviorSubjects + persistência automática no localStorage.
 * Apenas o fakeBackendInterceptor conversa com esta classe — os componentes
 * consomem a API via HttpClient, como fariam com um back-end real.
 */
@Injectable({ providedIn: 'root' })
export class BancoLocalService {
  private readonly chave = inject(API_CONFIG).chaveStorage;

  private readonly veiculosSubject: BehaviorSubject<Veiculo[]>;
  private readonly leadsSubject: BehaviorSubject<Lead[]>;

  constructor() {
    const dados = this.carregar() ?? gerarDadosIniciais();
    this.veiculosSubject = new BehaviorSubject(dados.veiculos);
    this.leadsSubject = new BehaviorSubject(dados.leads);

    // Toda alteração em qualquer "tabela" é gravada no localStorage.
    combineLatest([this.veiculosSubject, this.leadsSubject])
      .pipe(skip(1))
      .subscribe(([veiculos, leads]) => this.salvar({ veiculos, leads }));
    this.salvar({ veiculos: this.veiculos, leads: this.leads });
  }

  get veiculos(): Veiculo[] {
    return this.veiculosSubject.value;
  }

  get leads(): Lead[] {
    return this.leadsSubject.value;
  }

  setVeiculos(lista: Veiculo[]): void {
    this.veiculosSubject.next(lista);
  }

  setLeads(lista: Lead[]): void {
    this.leadsSubject.next(lista);
  }

  /** Recria os dados de demonstração (botão "Restaurar dados" no painel). */
  restaurar(): void {
    const dados = gerarDadosIniciais();
    this.veiculosSubject.next(dados.veiculos);
    this.leadsSubject.next(dados.leads);
  }

  private carregar(): DadosIniciais | null {
    try {
      const bruto = localStorage.getItem(this.chave);
      if (!bruto) return null;
      const dados = JSON.parse(bruto) as DadosIniciais;
      return Array.isArray(dados.veiculos) && Array.isArray(dados.leads) ? dados : null;
    } catch {
      return null;
    }
  }

  private salvar(dados: DadosIniciais): void {
    try {
      localStorage.setItem(this.chave, JSON.stringify(dados));
    } catch {
      /* armazenamento indisponível (aba anônima, cota) — segue só em memória */
    }
  }
}
