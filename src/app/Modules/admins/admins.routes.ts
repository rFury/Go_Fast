import { Routes } from '@angular/router';
import { AdminsComponent } from './admins.component';
import { BackOfficeComponent } from './back-office/back-office.component';
import { adminSignInRoutes } from './sign-in/sign-in.admin.routes';
import { authGuard } from '../../Shared/Guards/auth.guard';


export const adminRoutes: Routes = [
    {path:'sign-in',loadChildren:()=>adminSignInRoutes},
    {path:'',component:BackOfficeComponent,canActivate:[authGuard]}
];
