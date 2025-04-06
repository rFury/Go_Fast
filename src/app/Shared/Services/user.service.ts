import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../Models/User.model';
import { catchError, map, tap } from 'rxjs/operators';
import { FeatureAuth } from '../Models/FeatureAuth.model';
import { Pagination } from '../Models/Pagination.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  endpointAuth = `${environment.api}/users`;
  obsUser = new BehaviorSubject<User | null>(null);
  _user=signal<User | null>(null);
  _defaultLink = new BehaviorSubject<string | null>(null);
  _features: BehaviorSubject<FeatureAuth[] | null> = new BehaviorSubject<
    FeatureAuth[] | null
  >(null);
  http = inject(HttpClient);
  router = inject(Router);

  constructor() {
  }

  get user$(){
    return this._user()
  }

  get obsUser$(): Observable<User | null> {
    return this.obsUser.asObservable();
  }

  set defaultLink(value: string) {
    this._defaultLink.next(value);
  }
  get defaultLink$(): BehaviorSubject<string | null> {
    return this._defaultLink;
  }

  set features(value: FeatureAuth[]) {
    this._features.next(value);
  }

  get features$(): BehaviorSubject<FeatureAuth[] | null> {
    return this._features;
  }
  checkPermission(permissions: FeatureAuth[]): boolean {
    const featuresAuth: FeatureAuth[] | null = this.features$?.getValue();
    let permission: FeatureAuth;
    for (permission of permissions) {
      const fa = featuresAuth?.find(
        (fau: FeatureAuth) => fau.code === permission.code
      );
      if (!fa) {
        return false;
      }
      let permissionAction;
      if (permission.actions) {
        for (permissionAction of permission.actions) {
          if (!fa.actions?.includes(permissionAction)) {
            return false;
          }
        }
      }
    }
    return true;
  }

  get(): Observable<User> {
    return this.http.get<User>(`${this.endpointAuth}/me`).pipe(
      tap((user) => {
        this._user.set(user);
        this.obsUser.next(user);
      }),
      catchError((error) => {
        return throwError(() => error); // Propagate the error
      })
    );
  }

  changePassword(
    password: string,
    newPassword: string,
    code: string,
    id: string
  ): Observable<null> {
    return this.http.post<null>(`${this.endpointAuth}/${id}/change-password`, {
      password,
      newPassword,
      code,
    });
  }
  checkPassword(password: string): Observable<null> {
    return this.http.post<null>(`${this.endpointAuth}/check-password`, {
      password,
    });
  }
  sendCode(
    id: string,
    password: string,
    newPassword: string
  ): Observable<null> {
    return this.http.post<null>(`${this.endpointAuth}/${id}/send-code`, {
      password,
      newPassword,
    });
  }
  resendCode(id: string, params: any): Observable<null> {
    return this.http.patch<null>(`${this.endpointAuth}/${id}/resend-code`, {
      params,
    });
  }

  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.endpointAuth}/me`);
  }
  updatePersonalInfo(user: User): Observable<User> {
    return this.http.post<User>(`${this.endpointAuth}/personal-info`, user);
  }
  updateMyAvatar(data: FormData): Observable<User> {
    return this.http.post<User>(`${this.endpointAuth}/my-avatar`, data).pipe(
      tap((user) => {
        this._user.set(user);
      })
    );
  }

  addUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.endpointAuth}`, {
      user,
    });
  }
  getUsers(
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
  getOne(id: string): Observable<User> {
    return this.http.get<User>(`${this.endpointAuth}/${id}`);
  }
  updateOne(user: User): Observable<User> {
    return this.http.put<User>(`${this.endpointAuth}/${user._id}`, { user });
  }
  enableAccount(id: string): Observable<User> {
    return this.http.get<User>(`${this.endpointAuth}/${id}/enable-disable`);
  }
  deleteOne(id: string): Observable<null> {
    return this.http.delete<null>(`${this.endpointAuth}/${id}`);
  }
  updateAvatar(data: FormData, id: string): Observable<User> {
    return this.http.post<User>(`${this.endpointAuth}/${id}/avatar`, data).pipe(
      tap((user) => {
        this._user.set(user);
      })
    );
  }
  updateState(user: User): Observable<any> {
    return this.http.patch<User>(`${this.endpointAuth}/state`, { user }).pipe(
      map((response) => {
        this._user.set(response);
      })
    );
  }
}
