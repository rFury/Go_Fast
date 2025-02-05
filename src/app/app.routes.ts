import { Routes } from '@angular/router';
import { WelcomeComponent } from './Modules/welcome/welcome.component';
import { SignInComponent } from './Modules/sign-in/sign-in.component';
import { SignUpComponent } from './Modules/sign-up/sign-up.component';

export const routes: Routes = [
    {path: 'signup', component: SignUpComponent},
    {path: 'signin', component: SignInComponent},
    { path: 'Home', component: WelcomeComponent },
    { path: '', redirectTo: 'Home', pathMatch: 'full' },
];
