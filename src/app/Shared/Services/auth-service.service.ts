import { Injectable } from '@angular/core';
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
  private token!: string;

  constructor(private router:Router,private http: HttpClient) {
  }
    private apiUrl = "http://127.0.0.1:3000/api/auth";
    AddUser(val:User): Observable<auth_conf> {
        return this.http.post<auth_conf>(this.apiUrl+"/registery",val)
    }

    SignIn(email:string,password:string): Observable<auth_conf> {
      const params = {
        email :email,
        password :password
      }
      return this.http.post<auth_conf>(this.apiUrl+"/login",params)
  }

    requestResetPassword(email: string): Observable<auth_conf> {
      return this.http.post<auth_conf>(`${this.apiUrl}/reset-password`, { email });
    }
    
    verifyResetCode(token: string, code: string): Observable<any> {
      return this.http.post(`${this.apiUrl}/verify-reset-code`, { token, code });
    }

    resetPassword(token: string,newPassword: string): Observable<any> {
      return this.http.post(`${this.apiUrl}/update-password`, { token, newPassword });
    }

    saveVerifToken(jwt: string,which: string) {
      localStorage.setItem(which, jwt);
      this.token = jwt;
    }

    getVerifToken(which:string) {
      return localStorage.getItem(which)!;

    }
  
    isTokenExpired(): Boolean {
      return this.helper.isTokenExpired(this.token);
    }
}
