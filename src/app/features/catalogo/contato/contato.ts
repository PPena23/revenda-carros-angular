import { Component, inject } from '@angular/core';
import { LOJA_CONFIG } from '../../../core/config/app.tokens';
import { Icone } from '../../../shared/components/icone/icone';
import { LeadForm } from '../lead-form/lead-form';

@Component({
  selector: 'app-contato',
  imports: [LeadForm, Icone],
  template: `
    <div class="container pagina">
      <header class="pagina__topo">
        <p class="sobretitulo">Fale com a gente</p>
        <h1>Contato</h1>
        <p class="texto-suave">Dúvidas, avaliação do seu usado ou agendamento de test drive — escolha o canal que preferir.</p>
      </header>

      <div class="contato">
        <app-lead-form titulo="Envie uma mensagem" />

        <aside class="loja" aria-label="Informações da loja">
          <div class="mapa" role="img" aria-label="Mapa ilustrativo da localização da loja">
            <span class="mapa__pino"><app-icone nome="local" [tamanho]="22" /></span>
          </div>
          <ul class="loja__lista">
            <li><app-icone nome="local" /><span>{{ loja.endereco }}<br />{{ loja.cidade }}</span></li>
            <li><app-icone nome="telefone" /><span>{{ loja.telefone }}<br />WhatsApp {{ loja.whatsapp }}</span></li>
            <li><app-icone nome="email" /><span>{{ loja.email }}</span></li>
            <li>
              <app-icone nome="relogio" />
              <span>
                @for (h of loja.horarios; track h.dias) {
                  {{ h.dias }}: {{ h.horas }}<br />
                }
              </span>
            </li>
          </ul>
          <p class="loja__aviso">Endereço e telefones fictícios — projeto de portfólio.</p>
        </aside>
      </div>
    </div>
  `,
  styleUrl: './contato.scss',
})
export class Contato {
  protected readonly loja = inject(LOJA_CONFIG);
}
