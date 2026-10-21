import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import localePt from '@angular/common/locales/pt';
import {
  ApplicationConfig,
  DEFAULT_CURRENCY_CODE,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  TitleStrategy,
  provideRouter,
  withComponentInputBinding,
  withHashLocation,
} from '@angular/router';
import { routes } from './app.routes';
import { FINANCIAMENTO_CONFIG, LOJA_CONFIG } from './core/config/app.tokens';
import { TituloStrategy } from './core/config/titulo.strategy';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { fakeBackendInterceptor } from './core/interceptors/fake-backend.interceptor';
import { loggingInterceptor } from './core/interceptors/logging.interceptor';

registerLocaleData(localePt);

/**
 * Configuração da aplicação standalone — substitui o antigo AppModule.
 * Tudo que antes ficava em `imports`/`providers` de NgModules está aqui.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withHashLocation(), // GitHub Pages: atualizar a página em /#/estoque não dá 404
      withComponentInputBinding(), // :id da rota chega como input() no componente
    ),
    // Ordem importa: log → token → back-end simulado (último, responde no lugar do servidor)
    provideHttpClient(
      withFetch(),
      withInterceptors([loggingInterceptor, authInterceptor, fakeBackendInterceptor]),
    ),
    { provide: TitleStrategy, useClass: TituloStrategy },
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'BRL' },
    {
      provide: LOJA_CONFIG,
      useValue: {
        nome: 'Vértice Motors',
        slogan: 'Seminovos premium em Ribeirão Preto',
        cidade: 'Ribeirão Preto · SP',
        endereco: 'Av. das Palmeiras Imperiais, 1450 — Jardim Fictício',
        telefone: '(16) 3000-0000',
        whatsapp: '(16) 99000-0000',
        email: 'contato@verticemotors.exemplo',
        horarios: [
          { dias: 'Segunda a sexta', horas: '9h às 19h' },
          { dias: 'Sábado', horas: '9h às 14h' },
        ],
      },
    },
    // Sobrescreve o valor padrão do token (definido via factory) — exemplo de DI configurável.
    {
      provide: FINANCIAMENTO_CONFIG,
      useValue: { taxaMensalPadrao: 1.69, parcelasMin: 12, parcelasMax: 60, entradaSugeridaPercentual: 30 },
    },
  ],
};
