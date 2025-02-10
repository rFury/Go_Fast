import { Routes } from '@angular/router';
import { WelcomeComponent } from './Modules/welcome/welcome.component';
import { SignInComponent } from './Modules/sign-in/sign-in.component';
import { SignUpComponent } from './Modules/sign-up/sign-up.component';
import { ResetPasswordComponent } from './Modules/reset-password/reset-password.component';
import { VerifyCodeComponent } from './Modules/reset-password/verify-code/verify-code.component';
import { ChangePasswordComponent } from './Modules/reset-password/change-password/change-password.component';
import { MainComponent } from './mini-projet/main/main.component';

export const routes: Routes = [
  { path: 'Sign-In',component: SignInComponent},
  { path: 'Reset-Password', component: ResetPasswordComponent },
  { path: 'Sign-Up',component: SignUpComponent},
  { path: 'Verify-Code', component: VerifyCodeComponent },
  { path: 'Change-Password', component: ChangePasswordComponent },
  { path: 'Home', component: WelcomeComponent },
  { path: 'Main',component:MainComponent },
  { path: '', redirectTo: 'Home', pathMatch: 'full' },
];
