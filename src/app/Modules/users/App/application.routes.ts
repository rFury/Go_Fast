import { Route } from '@angular/router';
import { ApplicationComponent } from './application.component';

import { FeatureCodes } from '../../../Shared/enums/feature-codes';



export default [
  {
    path: '',
    component: ApplicationComponent,
    children: [/*
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
      },*/
    ],
  }
] satisfies Route[];
