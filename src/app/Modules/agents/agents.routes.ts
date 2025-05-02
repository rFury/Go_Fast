import { Route, Routes } from '@angular/router';
import { authGuard } from '../../Shared/Guards/auth.guard';
import { SignInComponent } from '../admins/sign-in/sign-in.component';
import { noAuthGuard } from '../../Shared/Guards/noAuth.guard';
import { tokenGuard } from '../../Shared/Guards/token.guard';
import { NotAllowedComponent } from '../../Shared/Components/location-not-allowed/not-allowed.component';
import { adminGuard } from '../../Shared/Guards/admin.guard';
import { AgentsComponent } from './agents.component';
import { locationGuard } from '../../Shared/Guards/location.guard';

export default [
  {
    path: '',
    component: AgentsComponent,canActivate:[locationGuard]
  },
  {
    path:'not-allowed',
    component:NotAllowedComponent
  }
] satisfies Route[];
