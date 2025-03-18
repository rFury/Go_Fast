import { Route } from '@angular/router';
import { BackOfficeComponent } from './back-office.component';
import featuresRouting from './apps/features/features.routing';
import groupsRouting from './apps/groups/groups.routing';

export default [
  {
    path: '',
    component: BackOfficeComponent,
    children: [
      {
        path: '/features',
        loadChildren: () => featuresRouting,
      },
      {
        path: '/groups',
        loadChildren: () => groupsRouting,
      },
    ]
    }
    ] satisfies Route[];
