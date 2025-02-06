import { Routes } from '@angular/router';
import { WelcomeComponent } from './Modules/welcome/welcome.component';
import { SignInComponent } from './Modules/sign-in/sign-in.component';
import { SignUpComponent } from './Modules/sign-up/sign-up.component';
import { ResetPasswordComponent } from './Modules/reset-password/reset-password.component';
import { VerifyCodeComponent } from './Modules/reset-password/verify-code/verify-code.component';
import { ChangePasswordComponent } from './Modules/reset-password/change-password/change-password.component';

export const routes: Routes = [
    {path: 'signup', component: SignUpComponent},
    {path: 'signin', component: SignInComponent},
    { path: 'home', component: WelcomeComponent },
    { path: 'reset-password', component: ResetPasswordComponent },
    { path: 'verify-code', component: VerifyCodeComponent },
    { path: 'change-password', component: ChangePasswordComponent },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
];
