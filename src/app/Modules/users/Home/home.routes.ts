import { Route } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { TrackingComponent } from './tracking/tracking.component';
import { ContactComponent } from './contact/contact.component';


export default [
  {
    path: 'home',
    component: HomeComponent,
  }
  ,
  {
    path: 'track',
    component: TrackingComponent,
  }
  ,
  {
    path: 'contact',
    component: ContactComponent,
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  }
] satisfies Route[];
