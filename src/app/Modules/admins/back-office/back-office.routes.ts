import { Route } from '@angular/router';
import { BackOfficeComponent } from './back-office.component';
import featuresRouting from './apps/features/features.routing';
import featuresCopyRouting from './apps/orders/orders.routing';

import groupsRouting from './apps/groups/groups.routing';
import usersRouting from './apps/users/users.routing';
import { FeatureCodes } from '../../../Shared/enums/feature-codes';
import userFeaturesRouting from './apps/user-features/user-features-routing';
import clientsRouting from './apps/clients/clients.routing';
import agentsRouting from './apps/clients copy/agents.routing';


export default [
  {
    path: '',
    component: BackOfficeComponent,
    children: [
      {
        path: 'features',
        loadChildren: () => featuresRouting,
        data: {
          breadcrumb: 'Features',
          feature: FeatureCodes.features,
      },
      },
      {
        path: 'groups',
        loadChildren: () => groupsRouting,
        data: {
          breadcrumb: 'Groups',
          feature: FeatureCodes.groups,
      },
      },
      
      {
        path: 'users',
        loadChildren: () => usersRouting,
        data: {
          breadcrumb: 'Users',
          feature: FeatureCodes.users,
      },
      },
      {
        path: 'clients',
        loadChildren: () => clientsRouting,
        data: {
          breadcrumb: 'Clients',
          feature: FeatureCodes.clients,
      },
      },
      {
        path: 'agents',
        loadChildren: () => agentsRouting,
        data: {
          breadcrumb: 'Agents',
          feature: FeatureCodes.agents,
      },
      },
      {
        path: 'userfeatures',
        loadChildren: () => userFeaturesRouting,
        data: {
          breadcrumb: 'UserFeatures',
          feature: FeatureCodes.userFeatures,
      },
      },
      {
        path: 'orders',
        loadChildren: () => featuresCopyRouting,
        data: {
          breadcrumb: 'UserFeatures',
          feature: FeatureCodes.orders,
      },
      },
    ],
  }
] satisfies Route[];
