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
import { tokenGuard } from '../../Shared/Guards/token.guard';
import { NotAllowedComponent } from '../../Shared/Components/not-allowed/not-allowed.component';
import { adminGuard } from '../../Shared/Guards/admin.guard';
import { AgentsComponent } from './agents/agents.component';
import agentsRoutes from './agents/agents.routes';
import { agentGuard } from '../../Shared/Guards/agent.guard';
import { locationGuard } from '../../Shared/Guards/location.guard';
import { LocationNotAllowedComponent } from '../../Shared/Components/location-not-allowed/not-allowed.component';
import { SettingsComponent } from '../../Shared/Components/settings/settings.component';


export default [
  {
    path: '',
    component: AdminsComponent,
    children: [
      {
        path: 'dashboard',
        component: BackOfficeComponent,
        loadChildren: () => backOfficeRoutes,
        canActivate: [authGuard,adminGuard],
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
        path:'agents',
        component:AgentsComponent,
        loadChildren:()=> agentsRoutes,
        canActivate :[authGuard,agentGuard,locationGuard],
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
        redirectTo:  'agents',
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
        canActivate: [noAuthGuard,tokenGuard],
      },
      {
        path: 'unauthorized',
        component: NotAllowedComponent,
        data: {
          layout: 'empty',
        },
      },
      {
        path:'agents/not-allowed',
        component:LocationNotAllowedComponent,
        data:{
          layout:'empty'
        }
      },
      {
        path: 'settings',
        component:SettingsComponent,
      }, 
    ],
  },
  { path: 'signed-in-redirect', pathMatch: 'full', redirectTo: '' },
] satisfies Route[];
