import { Routes } from '@angular/router';
import { WelcomeComponent } from './welcome/welcome.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';

export const routes: Routes = [
    {path: 'signup', component: SignUpComponent},
    {path: 'signin', component: SignInComponent},
    { path: 'Home', component: WelcomeComponent },
    { path: '', redirectTo: 'Home', pathMatch: 'full' },
];
