import { Route } from '@angular/router';
import { ApplicationComponent } from './application.component';
import { NewOrderComponent } from './new-order/new-order.component';
import ordersRoutes from './orders/orders.routes';



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
        path: 'orders',loadChildren:()=>ordersRoutes,
        data:{
          who:'users'
        }
      },
      {
        path: 'new-order',
        component:NewOrderComponent,
        data:{
          who:'users'
        }
      },    
    ],
  }
] satisfies Route[];
