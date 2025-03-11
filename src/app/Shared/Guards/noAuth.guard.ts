import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { SuperAuthService } from '../Services/super-auth-service.service';

export const noAuthGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const _authService = inject(SuperAuthService);
  const _router = inject(Router);

  if (!_authService.isLoggedIn()) {
    return true;
  } else {
    return _router.createUrlTree(['admin/'], {
      queryParams: { returnUrl: state.url }
    });
  }
};
