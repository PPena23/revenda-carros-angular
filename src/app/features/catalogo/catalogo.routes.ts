import { Routes } from '@angular/router';
import { CatalogoLayout } from './layout/catalogo-layout';

/** Rotas públicas — cada página é um componente standalone carregado sob demanda. */
export const CATALOGO_ROUTES: Routes = [
  {
    path: '',
    component: CatalogoLayout,
    children: [
      { path: '', loadComponent: () => import('./home/home').then((m) => m.Home) },
      { path: 'estoque', title: 'Estoque', loadComponent: () => import('./estoque/estoque').then((m) => m.Estoque) },
      {
        path: 'veiculo/:id',
        title: 'Veículo',
        loadComponent: () => import('./veiculo-detalhe/veiculo-detalhe').then((m) => m.VeiculoDetalhe),
      },
      { path: 'favoritos', title: 'Favoritos', loadComponent: () => import('./favoritos/favoritos').then((m) => m.Favoritos) },
      { path: 'comparar', title: 'Comparar veículos', loadComponent: () => import('./comparar/comparar').then((m) => m.Comparar) },
      { path: 'contato', title: 'Contato', loadComponent: () => import('./contato/contato').then((m) => m.Contato) },
      {
        path: '**',
        title: 'Página não encontrada',
        loadComponent: () => import('./nao-encontrado/nao-encontrado').then((m) => m.NaoEncontrado),
      },
    ],
  },
];
