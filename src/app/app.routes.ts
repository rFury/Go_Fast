import { Routes } from '@angular/router';
import { WelcomeComponent } from './Modules/Clients/welcome/welcome.component';
import { signInRoutes } from './Modules/Clients/sign-in/sign-in.routes';
import { signUpRoutes } from './Modules/Clients/sign-up/sign-up.routes';
import { AdminsComponent } from './Modules/admins/admins.component';



export const routes: Routes = [
  { path: 'Sign-In',loadChildren:()=>signInRoutes},
  { path: 'Sign-Up',loadChildren:()=>signUpRoutes},
  { path: 'Home', component: WelcomeComponent },
{ path: "admin", loadChildren: () => import('./Modules/admins/admins.routes') },
    { path: '', redirectTo: 'Home', pathMatch: 'full' },
];
