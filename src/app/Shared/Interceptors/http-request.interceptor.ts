import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { SuperAuthService } from '../../Shared/Services/super-auth-service.service'
import { UserService } from '../Services/user.service';
import { Router } from '@angular/router';

export const authInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> =>
{
    const authService = inject(SuperAuthService);
    const router = inject(Router);


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
            if ( error instanceof HttpErrorResponse && error.status === 401 )
            {
                authService.signOut();

                location.reload();
            }else if (error instanceof HttpErrorResponse && error.status === 403){
                console.log(error);
                const url=authService.decodeToken().type==='client'?'/404':'/admin/unauthorized';
                router.navigate([url]);                
            }
            else if(error instanceof HttpErrorResponse && error.status === 500){
                router.navigate(['/500']);                

            }

            return throwError(error);
        }),
    );
};
