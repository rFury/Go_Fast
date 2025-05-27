import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { AnalyticsComponent } from './analytics/analytics.component';
import { AnalyticsService } from './analytics/analytics.service';
import { ProjectComponent } from './project/project.component';
import { ProjectService } from './project/project.service';
import { FinanceComponent } from './finance/finance.component';
import { FinanceService } from './finance/finance.service';
import { UserService } from '../../../../../Shared/Services/user.service';
export default [
    {
        path     : 'analytics',
        component: AnalyticsComponent,
        resolve  : {
            data: () => inject(AnalyticsService).getData(),
        },
    },
    {
        path     : 'company',
        component: ProjectComponent,
        resolve  : {
            data: () => inject(ProjectService).getData(),
            user: () => inject(UserService).get(),
        },
    },
    {
        path     : 'finance',
        component: FinanceComponent,
        resolve  : {
            data: () => inject(FinanceService).getData(),
        },
    },
    {
        path: '',
        redirectTo: 'company',
        pathMatch: 'full',
    }
] as Routes;
