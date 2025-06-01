import { ActivatedRoute, CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { SuperAuthService } from '../Services/super-auth-service.service';

export const noAuthGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const _authService = inject(SuperAuthService);
  const _router = inject(Router);
  const _route = inject(ActivatedRoute);
  const who = _route.snapshot.data['who'];

  if (!_authService.isLoggedIn()) {
    return true;
  } else {
    if (who === 'users') {
      return _router.createUrlTree(['/'], {
        queryParams: { returnUrl: state.url },
      });
    } else if (who === 'agents') {
      return _router.createUrlTree(['admin/agents/'], {
        queryParams: { returnUrl: state.url },
      });
    }
    return _router.createUrlTree(['admin/'], {
      queryParams: { returnUrl: state.url },
    });
  }
};
