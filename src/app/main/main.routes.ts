import { Routes } from '@angular/router';
import { authGuard } from '../auth/guards/auth.guard';
import { HomeComponent } from './components/home/home.component';
import { IndexComponent } from './components/index/index.component';

export const MAIN_ROUTES: Routes = [
  {
    path: '',
    children: [{ path: '', component: HomeComponent, data: { title: 'home' } }],
    component: IndexComponent,
    canActivate: [authGuard],
  },
];
