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
import dashboardsRouting from './apps/dashboards/dashboards.routes';
import { featureAction } from '../../../Shared/Guards/featureAction.guard';
export default [
  {
    path: '',
    component: BackOfficeComponent,
    children: [
      {
        path:'',
        loadChildren: () => dashboardsRouting,
        data: {
          breadcrumb: 'Dashboard',
        },
      },
      {
        path: 'features',
        loadChildren: () => featuresRouting,
        data: {
          breadcrumb: 'Features',
          feature: FeatureCodes.features,
          action: 'list',
          code: FeatureCodes.features,
      },
      canActivate: [featureAction],
      },
      {
        path: 'groups',
        loadChildren: () => groupsRouting,
        data: {
          breadcrumb: 'Groups',
          feature: FeatureCodes.groups,
          action: 'list',
          code: FeatureCodes.groups,
      },
      canActivate: [featureAction],
      },
      
      {
        path: 'users',
        loadChildren: () => usersRouting,
        data: {
          breadcrumb: 'Users',
          feature: FeatureCodes.users,
          action: 'list',
          code: FeatureCodes.users,
      },
      canActivate: [featureAction],
      },
      {
        path: 'clients',
        loadChildren: () => clientsRouting,
        data: {
          breadcrumb: 'Clients',
          feature: FeatureCodes.clients,
          action: 'list',
          code: FeatureCodes.clients,
      },
      canActivate: [featureAction],
      },
      {
        path: 'agents',
        loadChildren: () => agentsRouting,
        data: {
          breadcrumb: 'Agents',
          feature: FeatureCodes.agents,
          action: 'list',
          code: FeatureCodes.agents,
      },
      canActivate: [featureAction],
      },
      {
        path: 'userfeatures',
        loadChildren: () => userFeaturesRouting,
        data: {
          breadcrumb: 'UserFeatures',
          feature: FeatureCodes.userFeatures,
          action: 'list',
          code: FeatureCodes.userFeatures,
      },
      canActivate: [featureAction],
      },
      {
        path: 'orders',
        loadChildren: () => featuresCopyRouting,
        data: {
          breadcrumb: 'orders',
          action: 'list',
          code: FeatureCodes.orders,
          feature: FeatureCodes.orders,
      },
      canActivate: [featureAction],
      },
    ],
  }
] satisfies Route[];
