import { ActivatedRoute, CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { SuperAuthService } from '../Services/super-auth-service.service';

export const adminGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const _authService = inject(SuperAuthService);
  const router = inject(Router);
  
    if( _authService.isLoggedIn()){
      const who = _authService.decodeToken().type;
      if (who === 'user' || who === 'super'){
        return true;
      }else{
        if(who === 'agent'){
          return router.createUrlTree(['admin/agents/'], {
            queryParams: { returnUrl: state.url },
          });
        }else{
          return router.createUrlTree(['/'], {
            queryParams: { returnUrl: state.url },
          });
        }
      }
    }else{
      return router.createUrlTree(['admin/sign-in'], {
        queryParams: { returnUrl: state.url },
      });
  }
};
