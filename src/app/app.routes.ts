import { Routes } from '@angular/router';
import { Error404Component } from './Shared/Components/error/error-404/error-404.component';
//import { WelcomeComponent } from './Modules/Clients/welcome/welcome.component';

export const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./Modules/admins/admins.routes'),
  },
  { path: '', loadChildren: () => import('./Modules/users/users.routes') },
  //{ path: '', redirectTo: 'admin', pathMatch: 'full' },
  { path: '**', component: Error404Component }

];
