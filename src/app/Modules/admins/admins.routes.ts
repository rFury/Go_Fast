import { Route, Routes } from '@angular/router';
import { AdminsComponent } from './admins.component';
import { BackOfficeComponent } from './back-office/back-office.component';
import { authGuard } from '../../Shared/Guards/auth.guard';
import { SignInComponent } from '../admins/sign-in/sign-in.component';


export default[
    {path:'',component:AdminsComponent,children:[
        {path:'',component:BackOfficeComponent,/*canActivate:[authGuard]*/},
        {path:'sign-in',component:SignInComponent}
    ]}
] satisfies Route[];
