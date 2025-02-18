import { Routes } from '@angular/router';
import { AdminsComponent } from './admins.component';
import { adminSignInRoutes } from './sign-in/sign-in.admin.routes';


export const adminRoutes: Routes = [
    {path:'',component:AdminsComponent},
    {path:'sign-in',loadChildren:()=>adminSignInRoutes},
];
