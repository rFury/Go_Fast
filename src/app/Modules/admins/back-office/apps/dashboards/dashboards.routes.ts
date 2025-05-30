import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { AnalyticsComponent } from './analytics/analytics.component';
import { AnalyticsService } from './analytics/analytics.service';
import { ProjectComponent } from './project/project.component';
import { ProjectService } from './project/project.service';
import { FinanceComponent } from './finance/finance.component';
import { FinanceService } from './finance/finance.service';
import { UserService } from '../../../../../Shared/Services/user.service';
import { featureAction } from '../../../../../Shared/Guards/featureAction.guard';
import { FeatureCodes } from '../../../../../Shared/enums/feature-codes';
export default [
    {
        path     : 'analytics',
        component: AnalyticsComponent,
        data: {
          breadcrumb: 'Analytics',
          feature: FeatureCodes.analytics,
          action: 'list',
          code: FeatureCodes.analytics,
      },
      canActivate: [featureAction],
        resolve  : {
            /*data: () => inject(AnalyticsService).getData(),*/
        },
    },
    {
        path     : 'company',
        component: ProjectComponent,
        data: {
          breadcrumb: 'Company',
          feature: FeatureCodes.company,
          action: 'list',
          code: FeatureCodes.company,
      },
      canActivate: [featureAction],
        resolve  : {
            data: () => inject(ProjectService).getData(),
            user: () => inject(UserService).get(),
        },
    },
    {
        path     : 'finance',
        component: FinanceComponent,
        data: {
          breadcrumb: 'Finance',
          feature: FeatureCodes.finance,
          action: 'list',
          code: FeatureCodes.finance,
      },
      canActivate: [featureAction],
        resolve  : {
            /*data: () => inject(FinanceService).getData(),*/
        },
    },
    {
        path: '',
        redirectTo: 'company',
        pathMatch: 'full',
    }
] as Routes;
