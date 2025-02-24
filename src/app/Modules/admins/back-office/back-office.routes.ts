import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FeatureGroupComponent } from './feature-group/feature-group.component';



export const backOfficeRoutes: Routes = [
    { path:'',redirectTo:'dashboard',pathMatch:'full'},
  { path: 'dashboard',component:DashboardComponent},
  { path: 'feature-group',component:FeatureGroupComponent},
];
