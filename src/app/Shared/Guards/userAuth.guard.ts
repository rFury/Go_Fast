import { ActivatedRoute, CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { SuperAuthService } from '../Services/super-auth-service.service';

export const userAuthGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const _authService = inject(SuperAuthService);
  const _router = inject(Router);

  if (_authService.isLoggedIn()) {
    return true;
  } else {
    return _router.createUrlTree(['/sign-in'], {
      queryParams: { returnUrl: state.url },
    });
  }
};
