import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize, Observable, take } from 'rxjs';
import { LoadingService } from '../Services/loading.service';

export const LoadingInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> =>
{
    const loadingService = inject(LoadingService);
    let handleRequestsAutomatically = false;

    loadingService.auto$
        .pipe(take(1))
        .subscribe((value) =>
        {
            handleRequestsAutomatically = value;
        });

    if ( !handleRequestsAutomatically )
    {
        return next(req);
    }

    loadingService._setLoadingStatus(true, req.url);
    loadingService.isloading.set(true);

    return next(req).pipe(
        finalize(() =>
        {
            loadingService._setLoadingStatus(false, req.url);
            loadingService.isloading.set(false);
        }));
};
