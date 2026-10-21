import { Routes } from '@angular/router';
import { alteracoesPendentesGuard } from '../../core/guards/alteracoes-pendentes.guard';
import { authGuard, visitanteGuard } from '../../core/guards/auth.guard';
import { AdminLayout } from './layout/admin-layout';

/**
 * Rotas do painel — este arquivo inteiro só é baixado quando alguém acessa /admin
 * (loadChildren no app.routes.ts). Equivale a um "AdminModule" lazy, sem NgModule.
 */
export const ADMIN_ROUTES: Routes = [
  {
    path: 'login',
    title: 'Entrar no painel',
    canActivate: [visitanteGuard],
    loadComponent: () => import('./login/login').then((m) => m.Login),
  },
  {
    path: '',
    component: AdminLayout,
    canActivate: [authGuard], // CanActivate funcional: protege todo o painel
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Painel',
        loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'veiculos',
        title: 'Veículos',
        loadComponent: () => import('./veiculos/veiculos-lista').then((m) => m.VeiculosLista),
      },
      {
        path: 'veiculos/novo',
        title: 'Novo veículo',
        canDeactivate: [alteracoesPendentesGuard], // pergunta antes de descartar o formulário
        loadComponent: () => import('./veiculos/veiculo-form').then((m) => m.VeiculoForm),
      },
      {
        path: 'veiculos/:id/editar',
        title: 'Editar veículo',
        canDeactivate: [alteracoesPendentesGuard],
        loadComponent: () => import('./veiculos/veiculo-form').then((m) => m.VeiculoForm),
      },
      {
        path: 'leads',
        title: 'Leads',
        loadComponent: () => import('./leads/leads').then((m) => m.Leads),
      },
    ],
  },
];
