import { Route } from '@angular/router';
import { AgentsComponent } from './agents.component';
import { OrdersComponent } from './orders/orders.component';
import { FeatureCodes } from '../../../Shared/enums/feature-codes';
import { agentGuard } from '../../../Shared/Guards/agent.guard';
import { SettingsComponent } from '../../../Shared/Components/settings/settings.component';
import chatRoutes from '../../../Shared/Components/chat/chat.routes';
import { FinanceComponent } from './finance/finance.component';

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
      {
        path:'track-orders',
        component:FinanceComponent,
        data:{
          feature : FeatureCodes.trackOrders,
        },
        canActivate:[agentGuard]
      },
      {
        path: 'settings',
        component:SettingsComponent,
      }, 
      {
        path: 'chat',
        
        loadChildren:()=>chatRoutes,
      },
      {
        path:'',
        redirectTo:'orders',
        pathMatch:'full'
      }
    ],
  }
] satisfies Route[];
