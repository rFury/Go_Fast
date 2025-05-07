import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { SuperAuthService } from '../Services/super-auth-service.service';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export const tokenGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(SuperAuthService);

  const token = route.queryParamMap.get('token'); 
  const who = route.queryParamMap.get('who');
  const url = who==='users'?'/sign-in': '/admin/sign-in';


  if (!token) {
    console.log("error")
    return of(router.parseUrl(url));
  }

  return authService.checkToken(token).pipe(
    map((isValid: boolean) => {
      if (isValid) {
        return true;
      } else {
        console.log("error")
        return router.parseUrl(url);
      }
    }),
    catchError((err) => {
      console.error('Token validation error', err);
      console.log("error")
      return of(router.parseUrl(url));
    })
  );
};
