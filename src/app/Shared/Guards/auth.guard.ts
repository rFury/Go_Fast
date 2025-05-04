import { ActivatedRoute, CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { SuperAuthService } from '../Services/super-auth-service.service';

export const authGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const _authService = inject(SuperAuthService);
  const _router = inject(Router);
  const _route = inject(ActivatedRoute);
  const who = _route.snapshot.data['who'];
  console.log(_route.snapshot.data);
  console.log('Blocked URL:', state.url);

  
  if (_authService.isLoggedIn()) {
    return true;
  } else {
    if(who === 'users'){
      return _router.createUrlTree(['/sign-in'], {
        queryParams: { returnUrl: state.url }
      });
    }else if(who === 'agents'){
      return _router.createUrlTree(['agent/sign-in'], {
        queryParams: { returnUrl: state.url }
      });
    }    
    return _router.createUrlTree(['admin/sign-in'], {
      queryParams: { returnUrl: state.url }
    });
  }
};
