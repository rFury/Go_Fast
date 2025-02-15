import { Routes } from '@angular/router';
import { VerifMailComponent } from './verif-mail/verif-mail.component';
import { SignUpComponent } from './sign-up.component';

export const signUpRoutes: Routes = [
    {path:'',component:SignUpComponent},
    {path:'Verif-Code',component:VerifMailComponent},
];
