import { Route } from '@angular/router';
import { OrdersComponent } from './orders.component';
import { OrderDetailsComponent } from './order-details/order-details.component';


export default [
  {
    path: '',
    children: [
      {
        path: '',
        component: OrdersComponent,
        data: {
          layout: 'classy',
        },
      },
      {
        path: ':id',
        children: [
          {
            path: '',
            component: OrderDetailsComponent,
            data:{
                layout:'empty'
            },
          }
        ],
      },
    ],
  },
] as Route[];
