import { ActivatedRoute, CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { SuperAuthService } from '../Services/super-auth-service.service';

export const userAuthGuard: CanActivateFn = (
  route,
  state
): boolean | UrlTree => {
  const _authService = inject(SuperAuthService);
  const _router = inject(Router);
  console.log(state.url);
  console.log(_authService.decodeToken()?.complete);

  if (_authService.isLoggedIn()) {
    const isComplete = _authService.decodeToken()?.complete === false;
    if (state.url.startsWith('/complete-credentials')) {
      console.log('condition 1');
      return isComplete ? true : false;
    } else {
      console.log('condition 2');
      return isComplete
        ? _router.createUrlTree(['/complete-credentials'], {
            queryParams: { returnUrl: state.url },
          })
        : true;
    }
  } else {
    return _router.createUrlTree(['/sign-in'], {
      queryParams: { returnUrl: state.url },
    });
  }
};
