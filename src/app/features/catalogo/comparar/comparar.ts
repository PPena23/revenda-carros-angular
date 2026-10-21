import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, switchMap } from 'rxjs';
import { Veiculo } from '../../../core/models/veiculo.model';
import { ComparadorService } from '../../../core/services/comparador.service';
import { VeiculosService } from '../../../core/services/veiculos.service';
import { comEstado } from '../../../core/utils/estado-requisicao';
import { CarIllustration } from '../../../shared/components/car-illustration/car-illustration';
import { EstadoErro, EstadoVazio, Skeleton } from '../../../shared/components/estados/estados';
import { Icone } from '../../../shared/components/icone/icone';
import { KmPipe } from '../../../shared/pipes/km.pipe';
import { MoedaBrPipe } from '../../../shared/pipes/moeda-br.pipe';

interface LinhaComparacao {
  rotulo: string;
  valor: (v: Veiculo) => string;
  /** Critério para destacar o "melhor" valor da linha (quando faz sentido). */
  melhor?: (lista: Veiculo[]) => string | undefined;
}

const menorPor = (campo: (v: Veiculo) => number) => (lista: Veiculo[]) =>
  lista.length > 1 ? [...lista].sort((a, b) => campo(a) - campo(b))[0].id : undefined;

@Component({
  selector: 'app-comparar',
  imports: [RouterLink, CarIllustration, Icone, Skeleton, EstadoErro, EstadoVazio],
  templateUrl: './comparar.html',
  styleUrl: './comparar.scss',
})
export class Comparar {
  protected readonly comparador = inject(ComparadorService);
  private readonly veiculos = inject(VeiculosService);
  protected readonly recarregar$ = new BehaviorSubject<void>(undefined);

  protected readonly estado = toSignal(
    this.recarregar$.pipe(switchMap(() => this.veiculos.obterVarios(this.comparador.lista()).pipe(comEstado()))),
    { initialValue: { status: 'carregando' } as const },
  );

  protected readonly selecionados = computed(() => {
    const e = this.estado();
    const ids = this.comparador.lista();
    return e.status === 'sucesso' ? e.dados.filter((v) => ids.includes(v.id)) : [];
  });

  private readonly moeda = new MoedaBrPipe();
  private readonly km = new KmPipe();

  protected readonly linhas: LinhaComparacao[] = [
    { rotulo: 'Preço', valor: (v) => this.moeda.transform(v.preco, 'inteiro'), melhor: menorPor((v) => v.preco) },
    { rotulo: 'Ano fab./modelo', valor: (v) => `${v.anoFabricacao}/${v.anoModelo}`, melhor: menorPor((v) => -v.anoModelo) },
    { rotulo: 'Quilometragem', valor: (v) => this.km.transform(v.km), melhor: menorPor((v) => v.km) },
    { rotulo: 'Carroceria', valor: (v) => v.categoria },
    { rotulo: 'Motor', valor: (v) => v.motor },
    { rotulo: 'Câmbio', valor: (v) => v.cambio },
    { rotulo: 'Combustível', valor: (v) => v.combustivel },
    { rotulo: 'Cor', valor: (v) => v.cor },
    { rotulo: 'Opcionais', valor: (v) => `${v.opcionais.length} itens`, melhor: menorPor((v) => -v.opcionais.length) },
  ];

  /** Pré-calcula qual veículo vence cada linha. */
  protected readonly vencedores = computed(() => {
    const lista = this.selecionados();
    return this.linhas.map((l) => l.melhor?.(lista));
  });
}
