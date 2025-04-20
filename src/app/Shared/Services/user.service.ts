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
import { Client } from '../Models/Client.model';
import { MenuService } from './menu.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  endpointUser = `${environment.api}/users`;
  endpointClient = `${environment.api}/clients`;
  _user = signal<User | Client | null>(null);
  private _statusTimeout: any;
  private _inactivityTimeout: any;
  _defaultLink = new BehaviorSubject<string | null>(null);
  features=signal<FeatureAuth[] | null>(null);
  http = inject(HttpClient);
  router = inject(Router);
  _menu = inject(MenuService);

  
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

  checkPermission(code: string, action: string): Observable<boolean> {
    if (this.features()) {
      const featuresAuth = this.features();
      return of(!!featuresAuth?.some(
        (fau) => fau.code === code && fau.actions?.includes(action as FeatureActions)
      ));
    } else {
      return this._menu.getActions().pipe(
        map(actions => {
          return !!actions?.some(
            (fau) => fau.code === code && fau.actions?.includes(action as FeatureActions)
          );
        })
      );
    }
  }
  
  

  get(): Observable<User> {
    return this.http.get<User>(`${this.endpointUser}/me`).pipe(
      tap((user)=>{
        if(user.type === "client"){
          this._user.set(user as Client);
        }else{
          this._user.set(user);
        }
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }
  getAll(type:string): Observable<User[] | Client[]> {
    if(type === "client"){
    return this.http.get<Client[]>(`${this.endpointClient}/all`,{params:{type:"client"}})
    }
    return this.http.get<User[]>(`${this.endpointUser}/all`,{params:{type:"user"}})
  }


  changePassword(
    password: string,
    newPassword: string,
    code: string,
    id: string
  ): Observable<null> {
    return this.http.post<null>(`${this.endpointUser}/${id}/change-password`, {
      password,
      newPassword,
      code,
    });
  }
  checkPassword(password: string): Observable<null> {
    return this.http.post<null>(`${this.endpointUser}/check-password`, {
      password,
    });
  }
  sendCode(
    id: string,
    password: string,
    newPassword: string
  ): Observable<null> {
    return this.http.post<null>(`${this.endpointUser}/${id}/send-code`, {
      password,
      newPassword,
    });
  }
  resendCode(id: string, params: any): Observable<null> {
    return this.http.patch<null>(`${this.endpointUser}/${id}/resend-code`, {
      params,
    });
  }

  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.endpointUser}/me`);
  }
  updatePersonalInfo(user: User): Observable<User> {
    return this.http.post<User>(`${this.endpointUser}/personal-info`, user);
  }
  updateMyAvatar(data: FormData): Observable<User> {
    return this.http.post<User>(`${this.endpointUser}/my-avatar`, data).pipe(
      tap((user) => {
        this._user.set(user);
      })
    );
  }

  addUser(user: User | Client): Observable<any> {
    const endpoint = user instanceof Client ?this.endpointClient: this.endpointUser ;
    console.log(user instanceof Client);
    
    return this.http.post<any>(`${endpoint}`, {
      user,
    });
  }
  getUsers(
    limit: string,
    page: string,
    search: string,
    filterGroups : string,
    filterStatus :string,
    filterNewOld : string,
    who : string
  ): Observable<Pagination<User | Client>> {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('limit', limit);

    searchParams = searchParams.append('page', page);
    
    if (search) {
      searchParams = searchParams.append('search', search);
    }
    if (filterGroups) {
      searchParams = searchParams.append('filtergroups', filterGroups);
    }
    if (filterStatus) {
      searchParams = searchParams.append('filterStatus', filterStatus);
    }
    if (filterNewOld) {
      searchParams = searchParams.append('filterNewOld', filterNewOld);
    }
    const endpoint = who === "client" ? this.endpointClient : this.endpointUser;
    return this.http.get<Pagination<User | Client>>(`${endpoint}`, {
      params: searchParams,
    });
  }
  getOne(id: string,who:string): Observable<User | Client> {
    const endpoint = who === "client" ? this.endpointClient : this.endpointUser;
    return this.http.get<User>(`${endpoint}/${id}`);
  }
  updateOne(user: User | Client): Observable<User | Client> {
    const endpoint = user.type === 'client' ?this.endpointClient: this.endpointUser ;
    console.log(user instanceof Client);
    return this.http.put<User | Client>(`${endpoint}/${user._id}`, { user });
  }
  enableAccount(id: string): Observable<User> {
    return this.http.get<User>(`${this.endpointUser}/${id}/enable-disable`);
  }
  deleteOne(id: string,who?:string): Observable<null> {
    const endpoint = who === "client" ? this.endpointClient : this.endpointUser;

    return this.http.delete<null>(`${endpoint}/${id}`);
  }
  updateAvatar(data: FormData, id: string): Observable<User> {
    return this.http.post<User>(`${this.endpointUser}/${id}/avatar`, data).pipe(
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
    
    return this.http.patch<User>(`${this.endpointUser}/status`, { status }).pipe(
      tap(updatedUser => {
        this._user.update(u => ({ ...u!, status }));
      })
    );
  }
  
}
