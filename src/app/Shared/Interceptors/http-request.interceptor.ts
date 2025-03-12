import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { SuperAuthService } from '../../Shared/Services/super-auth-service.service'
import { UserService } from '../Services/user.service';

export const authInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> =>
{
    const authService = inject(SuperAuthService);

    let newReq = req.clone();
    if ( authService.getToken()!='' && !authService.isTokenExpired())
    {
        newReq = req.clone({
            headers: req.headers.set('Authorization', 'Bearer ' + authService.getToken()),
        });
    }

    return next(newReq).pipe(
        catchError((error) =>
        {
            // Catch "401 Unauthorized" responses
            if ( error instanceof HttpErrorResponse && error.status === 401 )
            {
                // Sign out
                authService.signOut();

                // Reload the app
                location.reload();
            }

            return throwError(error);
        }),
    );
};
