import { Routes } from '@angular/router';
import { AUTH_ROUTES } from './auth/auth.routes';

export const routes: Routes = [
  ...AUTH_ROUTES,
  { path: '', loadChildren: () => import('./main/main.routes').then((m) => m.MAIN_ROUTES) },
  {
    path: '',
    loadChildren: () => import('./registry/registry.routes').then((m) => m.REGISTRY_ROUTES),
  },
  { path: '**', redirectTo: '/', pathMatch: 'full' },
];
