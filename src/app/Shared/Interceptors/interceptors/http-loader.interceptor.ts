// loader.interceptor.ts
import { inject, Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoaderService,LoaderType } from '../../Services/loader.service'
import { LOADER_TYPE } from './http.context';


@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
  private _loaderService=inject(LoaderService);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const loaderType:LoaderType = request.context.get(LOADER_TYPE);
    
    this._loaderService.show(loaderType);
    
    return next.handle(request).pipe(
      finalize(() => this._loaderService.hide(loaderType))
    );
  }
}