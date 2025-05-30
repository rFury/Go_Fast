import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { UserService } from '../Services/user.service';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export const featureAction: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const user = inject(UserService);

  const requiredRole = route.data?.['action'];
  const feature = route.data?.['code'];

  return user.checkPermission(feature, requiredRole).pipe(
    map((hasPermission) => {
      return hasPermission ? true : router.parseUrl('/admin/unauthorized');
    }),
    catchError(() => {
      return of(router.parseUrl('/admin/unauthorized'));
    })
  );
};
