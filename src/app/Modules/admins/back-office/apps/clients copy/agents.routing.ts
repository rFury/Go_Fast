import { Route } from '@angular/router';
import { featureAction } from '../../../../../Shared/Guards/featureAction.guard';
import { AddComponent } from './add/add.component';
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
          breadcrumb: 'agents',
        },
      },
      {
        path: 'add',
        component: AddComponent,
        data: {
          breadcrumb: 'Add',
          action:'create',
          code:"agents"

        },
        canActivate:[featureAction]

      },
      {
        path: ':id',
        children: [
          {
            path: '',
            component: DetailsComponent,        
            data: {
              action:'read',
              code:"agents"

            },
            canActivate:[featureAction]

          },
          {
            path: 'edit',
            component: EditComponent,
            data: {
              action:'update',
              code:"agents"

            },
            canActivate:[featureAction]

          },
        ],
      },
    ],
  },
] as Route[];
