import { Route } from '@angular/router';
import { featureAction } from '../../../../../Shared/Guards/featureAction.guard';
import { DetailsComponent } from '../features/list/components/details/details.component';
import { EditComponent } from '../features/list/components/edit/edit.component';
import { AddComponent } from './add/add.component';
import { ListComponent } from './list/list.component';

export default [
  {
    path: '',
    children: [
      {
        path: '',
        component: ListComponent,
        data: {
          breadcrumb: 'clients',
        },
      },
      {
        path: 'add',
        component: AddComponent,
        data: {
          breadcrumb: 'Add',
          action:'create',
          code:"clients"

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
              code:"clients"

            },
            canActivate:[featureAction]

          },
          {
            path: 'edit',
            component: EditComponent,
            data: {
              action:'update',
              code:"clients"

            },
            canActivate:[featureAction]

          },
        ],
      },
    ],
  },
] as Route[];
