import { Routes } from '@angular/router';
import { WelcomeComponent } from './Modules/Clients/welcome/welcome.component';
import { signInRoutes } from './Modules/Clients/sign-in/sign-in.routes';
import { signUpRoutes } from './Modules/Clients/sign-up/sign-up.routes';
import { adminRoutes } from './Modules/admins/admins.routes';


export const routes: Routes = [
  { path: 'Sign-In',loadChildren:()=>signInRoutes},
  { path: 'Sign-Up',loadChildren:()=>signUpRoutes},
  { path: 'Home', component: WelcomeComponent },
  {path:'Admin',loadChildren:()=>adminRoutes},
  { path: '', redirectTo: 'Home', pathMatch: 'full' },
];
