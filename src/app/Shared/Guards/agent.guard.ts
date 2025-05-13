import { ActivatedRoute, CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { SuperAuthService } from '../Services/super-auth-service.service';

export const agentGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const _authService = inject(SuperAuthService);
    if(_authService.isLoggedIn()){
      return (_authService.decodeToken().type === 'agent')?true:false;
    }else{
    return false;
  }
};
