import { Route } from '@angular/router';
import { ApplicationComponent } from './application.component';

import { FeatureCodes } from '../../../Shared/enums/feature-codes';
import { OrdersComponent } from './orders/orders.component';
import { NewOrderComponent } from './new-order/new-order.component';



export default [
  {
    path: '',
    component: ApplicationComponent,
    children: [
      {
        path: '',
        redirectTo: 'new-order',
        pathMatch: 'full',
      },
      {
        path: 'orders',
        component:OrdersComponent,
      },
      {
        path: 'new-order',
        component:NewOrderComponent,
      },    
    ],
  }
] satisfies Route[];
