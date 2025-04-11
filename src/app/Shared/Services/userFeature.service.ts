import { ChangeDetectorRef, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../Models/User.model';
import { GroupFeature } from '../Models/GroupFeature.model';
import { Pagination } from '../Models/Pagination.model';
import { UserFeature } from '../Models/UserFeature.model';

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

  getUserWithFeatures(
      limit: string,
      page: string,
      search: string
    ): Observable<Pagination<User>> {
      let searchParams = new HttpParams();
      searchParams = searchParams.append('limit', limit);
  
      searchParams = searchParams.append('page', page);
      if (search) {
        searchParams = searchParams.append('search', search);
      }
      return this.http.get<Pagination<User>>(`${this.endpointAuth}`, {
        params: searchParams,
      });
    }

    getUserFeature(id:string):Observable<User>{
      return this.http.get<User>(`${this.endpointAuth}/${id}`)
    }

  deleteUserFeature(id:string):Observable<any>{
    return this.http.delete<any>(`${this.endpointAuth}/${id}`)
  }
}
