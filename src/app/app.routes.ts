import { Routes } from '@angular/router';
//import { WelcomeComponent } from './Modules/Clients/welcome/welcome.component';



export const routes: Routes = [
{ path: "admin", loadChildren: () => import('./Modules/admins/admins.routes') },
    { path: '', loadChildren: () => import('./Modules/users/users.routes') },
];
