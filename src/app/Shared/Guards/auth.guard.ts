import { ActivatedRoute, CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { SuperAuthService } from '../Services/super-auth-service.service';

export const authGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const _authService = inject(SuperAuthService);
  const _router = inject(Router);
  const _route = inject(ActivatedRoute);
  console.log(_route.snapshot.data);
  if (_authService.isLoggedIn()) {
    const token = localStorage.getItem('jwt');
    if (token) {
      return true;
    }
    console.log('Blocked URL:', state.url);
    return _router.createUrlTree(['admin/sign-in'], {
      queryParams: { returnUrl: state.url },
    });
  } else {
    console.log('Blocked URL:', state.url);
    return _router.createUrlTree(['admin/sign-in'], {
      queryParams: { returnUrl: state.url },
    });
  }
};
