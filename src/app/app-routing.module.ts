import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: () => import('./main/main.module').then(m => m.MainModule) },
  { path: '', loadChildren: () => import('./registry/registry.module').then(m => m.RegistryModule) },
  { path: '**', redirectTo: '/', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { 
    //onSameUrlNavigation: 'ignore', // default behavior
    //enableTracing: true,
    //onSameUrlNavigation: 'reload' 
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
