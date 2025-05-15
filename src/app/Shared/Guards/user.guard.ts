import { ActivatedRoute, CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { SuperAuthService } from '../Services/super-auth-service.service';

export const userGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const _authService = inject(SuperAuthService);
  const _router = inject(Router);
  const who = _authService.decodeToken().type;

  if (_authService.isLoggedIn()) {
    if(who === 'client'){
      return true;
    }else{
      if(who === 'agent'){
        return _router.createUrlTree(['admin/agents/'], {
          queryParams: { returnUrl: state.url },
        });
      }else{
        return _router.createUrlTree(['admin/dashboard/'], {
          queryParams: { returnUrl: state.url },
        });
      }
    }
  } else {
    return _router.createUrlTree(['/sign-in'], {
      queryParams: { returnUrl: state.url },
    });
  }
};
