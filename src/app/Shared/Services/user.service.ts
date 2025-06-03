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
import { Agent } from '../Models/Agent.model';
import { Governorate } from '../Models/Gouvernorat.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  endpointUser = `${environment.api}/users`;
  endpointClient = `${environment.api}/clients`;
  endpointAgent = `${environment.api}/agents`;
  _user = signal<User | Client | Agent | null>(null);
  private _inactivityTimeout: any;
  _defaultLink = new BehaviorSubject<string | null>(null);
  features=signal<FeatureAuth[] | null>(null);
  http = inject(HttpClient);
  router = inject(Router);
  _menu = inject(MenuService); 

  
    user = this._user.asReadonly();
    userObservable = new BehaviorSubject<User | Client | Agent | null>(null);

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
  get userObs(){
    return this.userObservable.asObservable()
  }

  set defaultLink(value: string) {
    this._defaultLink.next(value);
  }
  get defaultLink$(): BehaviorSubject<string | null> {
    return this._defaultLink;
  }

  checkPermission(code: string, action: string): Observable<boolean> {
    const check = (features: any[]): boolean => {
      if (action === "list") {
        return features?.some(fau => fau.code === code);
      }
      return features?.some(
        fau => fau.code === code && fau.actions?.includes(action as FeatureActions)
      );
    };
    const featuresAuth = this.features();
    if (featuresAuth) {
      return of(check(featuresAuth));
    }
    return this._menu.getActions().pipe(
      map(actions => check(actions))
    );
  }
  
  
  

  get(): Observable<User | Agent | Client> {
    return this.http.get<User>(`${this.endpointUser}/me`).pipe(
      tap((user)=>{
        if(user.type === "client"){         
          this._user.set(user as Client);
          this.userObservable.next(user as Client);
        }else if(user.type === "agent"){
          this._user.set(user as Agent);
          this.userObservable.next(user as Agent);
        }else{
          this._user.set(user);
          this.userObservable.next(user);
        }
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }
  getAll(type:string): Observable<User[] | Client[] | Agent[]> {
    if(type === "client"){
    return this.http.get<Client[]>(`${this.endpointClient}/all`,{params:{type:"client"}})
    }else if(type === "agent"){
      return this.http.get<Agent[]>(`${this.endpointAgent}/all`,{params:{type:"agent"}})
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
  completeUpdatePersonalInfo({email,phone,city,key,newEmail}:{email:string,phone:string,city:Governorate,key:string,newEmail:boolean}): Observable<User> {
    return this.http.patch<User>(`${this.endpointUser}/completed-personal-info`, {email,phone,city,key});
  }
  updatePersonalInfo(): Observable<User> {
    return this.http.patch<User>(`${this.endpointUser}/personal-info`,{});
  }

  addUser(user: User | Client | Agent): Observable<any> {
    let endpoint;
    if(user instanceof Client){
      endpoint = this.endpointClient;
    }else if(user instanceof Agent){
      endpoint = this.endpointAgent;
    }else{
      endpoint= this.endpointUser
    }
    
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
    let endpoint;
    if(who === "client"){
      endpoint = this.endpointClient;
    }else if(who === "agent"){
      endpoint = this.endpointAgent;
    }else{
      endpoint = this.endpointUser;
    }
    return this.http.get<Pagination<User | Client>>(`${endpoint}`, {
      params: searchParams,
    });
  }
  getOne(id: string,who:string): Observable<User | Client> {
    let endpoint;
    if(who === "client"){
      endpoint = this.endpointClient;
    }else if(who === "agent"){
      endpoint = this.endpointAgent;
    }else{
      endpoint = this.endpointUser;
    }
    return this.http.get<User>(`${endpoint}/${id}`);
  }
  updateOne(user: User | Client | Agent): Observable<User | Client | Agent> {
    let endpoint;
    if(user.type === "client"){
      endpoint = this.endpointClient;
    }else if(user.type === "agent"){
      endpoint = this.endpointAgent;
    }else{
      endpoint = this.endpointUser;
    }
    return this.http.put<User | Client>(`${endpoint}/${user._id}`, { user });
  }
  enableAccount(id: string): Observable<User> {
    return this.http.get<User>(`${this.endpointUser}/${id}/enable-disable`);
  }
  deleteOne(id: string,who?:string): Observable<null> {
    let endpoint;
    if(who === "client"){
      endpoint = this.endpointClient;
    }else if(who === "agent"){
      endpoint = this.endpointAgent;
    }else{
      endpoint = this.endpointUser;
    }
    return this.http.delete<null>(`${endpoint}/${id}`);
  }
  updateAvatar(file: File): Observable<User> {
    const formData = new FormData();
    formData.append('avatar', file); 
    return this.http.patch<User>(`${this.endpointUser}/avatar`, formData);
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
  updatePassword(data: any): Observable<any> {
    return this.http.patch<any>(`${this.endpointUser}/update-password`, {currentPassword:data.currentPassword});
  }
  completePasswordChange(code: string,newPassword: string): Observable<any> {
    return this.http.patch<any>(`${this.endpointUser}/complete-password-change`, {key:code,newPassword});
  }

}
