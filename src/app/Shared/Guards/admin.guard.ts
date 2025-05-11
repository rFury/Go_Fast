import { ActivatedRoute, CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { SuperAuthService } from '../Services/super-auth-service.service';

export const adminGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const _authService = inject(SuperAuthService);
  const router = inject(Router);
  
    if( _authService.isLoggedIn()){
      return (_authService.decodeToken().type === 'user' || _authService.decodeToken().type === 'super')?true:false;
    }else{
    return false;
  }
};
