import { Route, Routes } from '@angular/router';
import { AdminsComponent } from './admins.component';
import { BackOfficeComponent } from './back-office/back-office.component';
import { authGuard } from '../../Shared/Guards/auth.guard';
import { SignInComponent } from '../admins/sign-in/sign-in.component';
import { backOfficeRoutes } from './back-office/back-office.routes';
import { AuthSignOutComponent } from './sign-out/sign-out.component';
import { AuthForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { AuthResetPasswordComponent } from './reset-password/reset-password.component';
import { NoAuthGuard } from '../../Shared/Guards/noAuth.guard';

export default [
  {
    path: '',
    component: AdminsComponent,
    children: [
      {
        path: '',
        component: BackOfficeComponent,
        loadChildren: () => backOfficeRoutes,
        canActivate: [authGuard],
      },
      { path: 'sign-in', component: SignInComponent ,data:{
        layout:'empty'
      },canActivate:[NoAuthGuard]
    },{
      path: 'sign-out', component:AuthSignOutComponent,data:{
        layout:'empty'},canActivate:[NoAuthGuard]
    }
    ,{
      path: 'forgot-password', component:AuthForgotPasswordComponent,data:{
        layout:'empty'},canActivate:[NoAuthGuard]
    },
    {
      path: 'reset-password', component:AuthResetPasswordComponent,data:{
        layout:'empty'},canActivate:[NoAuthGuard]
    }
    ],
  },
  {path: 'signed-in-redirect', pathMatch : 'full', redirectTo: ''},
] satisfies Route[];
