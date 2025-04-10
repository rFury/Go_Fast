import { ChangeDetectorRef, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../Models/User.model';
import { GroupFeature } from '../Models/GroupFeature.model';

@Injectable({
  providedIn: 'root',
})
export class UserFeaturesService {
  endpointAuth = `${environment.api}/user-feature`;
  http = inject(HttpClient);
  router = inject(Router);

  creatUserFeatures(user:User,group:GroupFeature[]):Observable<any>{
    return this.http.post<Observable<any>>(`${this.endpointAuth}`,{user,group})
  }
}
