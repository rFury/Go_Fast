import { Route } from '@angular/router';
import { DetailsComponent } from './list/components/details/details.component';
import { AddComponent } from './add/add.component';
import { EditComponent } from './list/components/edit/edit.component';
import {ListComponent} from "./list/list.component";
import { featureAction } from '../../../../../Shared/Guards/featureAction.guard';

export default [
  {
    path: '',
    children: [
      {
        path: '',
        component: ListComponent,
        data: {
          breadcrumb: 'Users',
        },
      },
      {
        path: 'add',
        component: AddComponent,
        data: {
          breadcrumb: 'Add',
          action:'create',
          code:"users"

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
              code:"users"

            },
            canActivate:[featureAction]

          },
          {
            path: 'edit',
            component: EditComponent,
            data: {
              action:'update',
              code:"users"

            },
            canActivate:[featureAction]

          },
        ],
      },
    ],
  },
] as Route[];
