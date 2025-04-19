import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { SuperAuthService } from '../Services/super-auth-service.service';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserService } from '../Services/user.service';

export const featureAction: CanActivateFn = async (route, state) => {
    const router = inject(Router);
    const user = inject(UserService);
  
    const requiredRole = route.data?.['action'];
    const feature = route.data?.['code'];
  
    if ( user.checkPermission(feature,requiredRole)) {
      return true;
    } else {
      return router.parseUrl('/admin/unauthorized');
    }
};
