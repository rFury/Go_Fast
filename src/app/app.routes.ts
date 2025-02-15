import { Routes } from '@angular/router';
import { WelcomeComponent } from './Modules/welcome/welcome.component';
import { signInRoutes } from './Modules/sign-in/sign-in.routes';
import { signUpRoutes } from './Modules/sign-up/sign-up.routes';


export const routes: Routes = [
  { path: 'Sign-In',loadChildren:()=>signInRoutes},
  { path: 'Sign-Up',loadChildren:()=>signUpRoutes},
  { path: 'Home', component: WelcomeComponent },
  { path: '', redirectTo: 'Home', pathMatch: 'full' },
];
