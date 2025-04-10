import { ChangeDetectorRef, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../Models/User.model';
import { catchError, map, tap } from 'rxjs/operators';
import { FeatureAuth } from '../Models/FeatureAuth.model';
import { Pagination } from '../Models/Pagination.model';
import { FeatureActions } from '../enums/feature-actions';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  endpointAuth = `${environment.api}/users`;
  _user=signal<User | null>(null);
  private _statusTimeout: any;
  private _inactivityTimeout: any;
  _defaultLink = new BehaviorSubject<string | null>(null);
  features=signal<FeatureAuth[] | null>(null);
  http = inject(HttpClient);
  router = inject(Router);

  
    user = this._user.asReadonly();

    private _trackActivity() {
      window.addEventListener('mousemove', this._resetInactivityTimer.bind(this));
      window.addEventListener('keydown', this._resetInactivityTimer.bind(this));
    }
    private _resetInactivityTimer() {      
        clearTimeout(this._inactivityTimeout);
        if(this._user()?.status==="away"){
          this._user.update(u => ({ ...u!, status:"online" }));
          console.log(this._user());
          
          this.updateState("online").subscribe()
        }
        this._inactivityTimeout = setTimeout(() => {
          this.updateState('away').subscribe();
        }, 300000); // 5 minutes inactivity
    }

  get user$(){
    return this._user()
  }


  set defaultLink(value: string) {
    this._defaultLink.next(value);
  }
  get defaultLink$(): BehaviorSubject<string | null> {
    return this._defaultLink;
  }



  checkPermissions(permissions: FeatureAuth[]): boolean {
    const featuresAuth: FeatureAuth[] | null = this.features();
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

  checkPermission(code: string, action: string): boolean {
    const featuresAuth = this.features();
    return !!featuresAuth?.some(
      (fau) => fau.code === code && fau.actions?.includes(action as FeatureActions)
    );
  }
  
  

  get(): Observable<User> {
    return this.http.get<User>(`${this.endpointAuth}/me`).pipe(
      tap((user) => {
        this._user.set(user);
      }),
      catchError((error) => {
        return throwError(() => error); // Propagate the error
      })
    );
  }
  getAll(): Observable<User[]> {
    return this.http.get<User[]>(`${this.endpointAuth}/all`)
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

  initializeUser(user: User) {
    this._user.set(user);
    this._trackActivity();
  }
  updateState(status: string): Observable<User> {
    console.log("hello service");
    
    return this.http.patch<User>(`${this.endpointAuth}/status`, { status }).pipe(
      tap(updatedUser => {
        this._user.update(u => ({ ...u!, status }));
      })
    );
  }
  
}
