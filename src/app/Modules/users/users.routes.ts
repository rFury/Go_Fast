import { Route, Routes } from '@angular/router';
import { UsersComponent } from './users.component';
import { userAuthGuard } from '../../Shared/Guards/userAuth.guard';
import { SignInComponent } from './sign-in/sign-in.component';
import { AuthForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { AuthResetPasswordComponent } from './reset-password/reset-password.component';
import { noAuthGuard } from '../../Shared/Guards/noAuth.guard';
import { tokenGuard } from '../../Shared/Guards/token.guard';
import { NotAllowedComponent } from '../../Shared/Components/not-allowed/not-allowed.component';
import { ApplicationComponent } from './App/application.component';
import applicationRoutes from './App/application.routes';
import { SignUpComponent } from './sign-up/sign-up.component';
import { userGuard } from '../../Shared/Guards/user.guard';
import { AuthSignOutComponent } from './sign-out/sign-out.component';
import { CompleteComponent } from './complete-sign-up/complete.component';
import { authGuard } from '../../Shared/Guards/auth.guard';

export default [
  {
    path: '',
    component: UsersComponent,
    children: [
      {
        path: '',
        component: ApplicationComponent,
        loadChildren: () => applicationRoutes,
        canActivate: [userAuthGuard,userGuard],
        data: {
          layout: 'classy',
          who: 'users',
        },
      },
      {
        path: 'sign-in',
        component: SignInComponent,
        data: {
          layout: 'empty',
          who: 'users',
        },
        canActivate: [noAuthGuard],
      },
      {
        path: 'sign-up',
        component: SignUpComponent,
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
          who: 'users',

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
          who: 'users',

        },
        canActivate: [noAuthGuard],
        
      },
      {
        path: 'reset-password',
        component: AuthResetPasswordComponent,
        data: {
          layout: 'empty',
          who: 'users',

        },
        canActivate: [noAuthGuard,tokenGuard],
      },
      {
        path: 'complete-credentials',
        component: CompleteComponent,
        data: {
          layout: 'empty',
          who: 'users',
        },
        canActivate: [userAuthGuard],
      },
      {
        path: 'unauthorized',
        component: NotAllowedComponent,
        data: {
          layout: 'empty',
        },
      },
    ],
  },
  { path: 'signed-in-redirect', pathMatch: 'full', redirectTo: '' },
] satisfies Route[];
