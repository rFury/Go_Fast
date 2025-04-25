import { Route } from '@angular/router';
import { AddComponent } from './add/add.component';

import { featureAction } from '../../../../../Shared/Guards/featureAction.guard';
import { ListComponent } from './list/list.component';
import { DetailsComponent } from './list/components/details/details.component';
import { EditComponent } from './list/components/edit/edit.component';

export default [
  {
    path: '',
    children: [
      {
        path: '',
        component: ListComponent,
        data: {
          breadcrumb: 'Orders',
        },
      },
      {
        path: 'add',
        component: AddComponent,
        data: {
          breadcrumb: 'Add',
          action:"create",
          code:"orders"

        },
        canActivate:[featureAction]
      },
      {
        path: ':id',
        children: [
          {
            path: '',
            component: DetailsComponent,
            data:{
              action:"read",
              code:"orders"

            },
            canActivate:[featureAction]
          },
          {
            path: 'edit',
            component: EditComponent,
            data:{
              action:"update",
              code:"orders"

            },
            canActivate:[featureAction]
          },
        ],
      },
    ],
  },
] as Route[];
