import { Routes } from '@angular/router';
import { SignInComponent } from './sign-in.component';
import { VerifMailComponent } from './verif-mail/verif-mail.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

export const signInRoutes: Routes = [
    {path:'',component:SignInComponent},
    {path:'Verif-Code',component:VerifMailComponent},
    {path:'Reset-Password',component:ResetPasswordComponent},
];
