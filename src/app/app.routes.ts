import { Routes } from '@angular/router';

/**
 * Rotas raiz. Cada área do produto é um "módulo" de rotas carregado sob demanda
 * (lazy loading) — o equivalente standalone dos antigos NgModules de feature.
 */
export const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: '',
    loadChildren: () => import('./features/catalogo/catalogo.routes').then((m) => m.CATALOGO_ROUTES),
  },
];
