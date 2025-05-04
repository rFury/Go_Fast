// src/app/guards/location.guard.ts
import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { from, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { LocationWebService } from '../Services/location.service';

export const locationGuard: CanActivateFn = (
  route,
  state
): Observable<boolean | UrlTree> => {
    const router = inject(Router);
    const location = inject(LocationWebService);
    console.log("in location guard");
    
    return from(location.checkPermission()).pipe(
      map(permission => {
        console.log(permission);
        if (permission === 'granted') {
          return true;
        }
        return router.parseUrl('admin/agents/not-allowed');
      }),
      catchError((_) =>
        of(router.parseUrl('admin/agents/not-allowed'))
      )
    );
};
