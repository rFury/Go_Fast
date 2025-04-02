import { Route, Routes } from '@angular/router';
import { AdminsComponent } from './admins.component';
import { BackOfficeComponent } from './back-office/back-office.component';
import { authGuard } from '../../Shared/Guards/auth.guard';
import { SignInComponent } from '../admins/sign-in/sign-in.component';
import { AuthSignOutComponent } from './sign-out/sign-out.component';
import { AuthForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { AuthResetPasswordComponent } from './reset-password/reset-password.component';
import { noAuthGuard } from '../../Shared/Guards/noAuth.guard';
import backOfficeRoutes from './back-office/back-office.routes';

export default [
  {
    path: '',
    component: AdminsComponent,
    children: [
      {
        path: 'dashboard',
        component: BackOfficeComponent,
        loadChildren: () => backOfficeRoutes,
        canActivate: [authGuard],
        data: {
          layout: 'classy',
          data: {
            breadcrumb: {
                label: 'Dashboard',
                info: { myData: { icon: 'home', iconType: 'material' } },
            },
        },
        },
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'sign-in',
        component: SignInComponent,
        data: {
          layout: 'empty',
        },
        canActivate: [noAuthGuard],
      },
      {
        path: 'sign-in/verif-code',
        component: SignInComponent,
        data: {
          layout: 'empty',
          verif: true,
          email: '',
        },
        canActivate: [noAuthGuard],
      },
      {
        path: 'sign-out',
        component: AuthSignOutComponent,
        data: {
          layout: 'empty',
        }
      },
      {
        path: 'forgot-password',
        component: AuthForgotPasswordComponent,
        data: {
          layout: 'empty',
        },
        canActivate: [noAuthGuard],
      },
      {
        path: 'reset-password',
        component: AuthResetPasswordComponent,
        data: {
          layout: 'empty',
        },
        canActivate: [noAuthGuard],
      },
    ],
  },
  { path: 'signed-in-redirect', pathMatch: 'full', redirectTo: '' },
] satisfies Route[];
