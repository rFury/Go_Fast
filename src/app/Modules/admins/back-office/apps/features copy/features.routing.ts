import { Route } from '@angular/router';
import { AddComponent } from './add/add.component';

import { featureAction } from '../../../../../Shared/Guards/featureAction.guard';

export default [
  {
    path: '',
    children: [
      {
        path: 'add',
        component: AddComponent,
        data: {
          breadcrumb: 'Add',
        }
      }
    ],
  },
] as Route[];
