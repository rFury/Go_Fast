import { Route } from '@angular/router';
import { AgentsComponent } from './agents.component';
import { OrdersComponent } from './orders/orders.component';
import { FeatureCodes } from '../../../Shared/enums/feature-codes';
import { agentGuard } from '../../../Shared/Guards/agent.guard';


export default [
  {
    path: '',
    component: AgentsComponent,
    children: [
      {
        path: 'orders',
        component: OrdersComponent,
        data: {
          feature: FeatureCodes.ordersAgent,
      },
      canActivate:[agentGuard]
      },
    ],
  }
] satisfies Route[];
