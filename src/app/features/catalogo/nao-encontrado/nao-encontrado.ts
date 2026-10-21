import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarIllustration } from '../../../shared/components/car-illustration/car-illustration';

@Component({
  selector: 'app-nao-encontrado',
  imports: [RouterLink, CarIllustration],
  template: `
    <div class="container nf">
      <app-car-illustration categoria="Hatch" cor="#5A6069" angulo="traseira" rotulo="Carro de costas, indo embora" />
      <p class="sobretitulo">Erro 404</p>
      <h1>Essa página saiu da garagem.</h1>
      <p class="texto-suave">O endereço pode ter mudado ou o veículo já foi vendido.</p>
      <div class="nf__acoes">
        <a routerLink="/estoque" class="btn btn--primario">Ver estoque</a>
        <a routerLink="/" class="btn btn--secundario">Página inicial</a>
      </div>
    </div>
  `,
  styles: `
    .nf { display: flex; flex-direction: column; align-items: center; text-align: center; padding-top: 2rem; }
    app-car-illustration { width: min(28rem, 100%); border-radius: var(--raio-lg); margin-bottom: 1.5rem; }
    h1 { margin: 0 0 .5rem; font-size: clamp(1.8rem, 4vw, 2.6rem); }
    .nf__acoes { display: flex; flex-wrap: wrap; justify-content: center; gap: .6rem; margin-top: 1.5rem; }
  `,
})
export class NaoEncontrado {}
