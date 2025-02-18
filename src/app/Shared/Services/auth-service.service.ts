import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../Models/User.model';
import { HttpClient, HttpHeaders, HttpParams } from'@angular/common/http';
import { Observable } from 'rxjs';
import { auth_conf } from '../Models/auth-confirmation.model';
import { JwtHelperService } from '@auth0/angular-jwt';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'myAppUserDataKey';
  private helper = new JwtHelperService();
  private token=signal<string>('');
  private http=inject(HttpClient);

  constructor() {
    this.loadToken();
  }

    private apiUrl = "http://127.0.0.1:3000/api/auth";
    AddUser(val:User): Observable<auth_conf> {
        return this.http.post<auth_conf>(this.apiUrl+"/registery",val
        )
    }

    SignIn(email:string,password:string): Observable<auth_conf> {
      const params = {
        email :email,
        password :password
      }
      return this.http.post<auth_conf>(this.apiUrl+"/login",params
      )
  }

    requestResetPassword(email: string): Observable<auth_conf> {
      return this.http.post<auth_conf>(`${this.apiUrl}/reset-password`, { email });
    }
    
    verifyResetCode(token: string, code: string): Observable<auth_conf> {
      return this.http.post<auth_conf>(`${this.apiUrl}/verify-reset-code`, { token, code });
    }

    verifyEmailCode(token: string, code: string): Observable<auth_conf> {
      return this.http.post<auth_conf>(`${this.apiUrl}/verify-mail`, { token, code });
    }

    resetPassword(token: string,newPassword: string): Observable<auth_conf> {
      return this.http.post<auth_conf>(`${this.apiUrl}/update-password`, { token, newPassword });
    }

    resendCode(email:string): Observable<auth_conf>{
      return this.http.post<auth_conf>(`${this.apiUrl}/resend-mail`,{email:email});
    }

    //TOKEN WISE

    loadToken(){
      this.token.set(localStorage.getItem('jwt')!);
    }
    saveToken(jwt: string) {
      localStorage.setItem('jwt', jwt);
      this.token.set(jwt);
    }

    getToken() {
      return this.token().toString();
    }

    removeToken() {
      localStorage.removeItem('jwt');
      this.token.set('');
    }

    decodeToken(){
      return this.helper.decodeToken(this.token().toString());
    }
    decodeVerifToken(Token:string){
      return this.helper.decodeToken(Token);
    }
    isTokenExpired(): Boolean {
      return this.helper.isTokenExpired(this.token().toString());
    }
}

