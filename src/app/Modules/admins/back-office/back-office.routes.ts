import { Route } from '@angular/router';
import { BackOfficeComponent } from './back-office.component';
import featuresRouting from './apps/features/features.routing';
import groupsRouting from './apps/groups/groups.routing';
import usersRouting from './apps/users/users.routing';
import { FeatureCodes } from '../../../Shared/enums/feature-codes';
import userFeaturesRouting from './apps/user-features/user-features-routing';

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
        path: 'userfeatures',
        loadChildren: () => userFeaturesRouting,
        data: {
          breadcrumb: 'UserFeatures',
          feature: FeatureCodes.userFeatures,
      },
      },
    ],
  },
] satisfies Route[];
