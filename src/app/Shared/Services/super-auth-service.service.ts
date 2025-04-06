import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../Models/User.model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, switchMap, throwError } from 'rxjs';
import { auth_conf } from '../Models/auth-confirmation.model';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../../environments/environment';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class SuperAuthService {
  private apiUrl = `${environment.api}/auth`;
  private helper = new JwtHelperService();
  private token = signal<string>('');
  private isloggedin = signal<boolean>(false);
  private _httpClient = inject(HttpClient);
  private _userService = inject(UserService);

  constructor() {
    this.loadToken();
    
  }

  forgotPassword(email: string): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/forgot-password`, {
      email,
      resetUrl: `${
        environment.api
      }/confirmation-required?email=${encodeURIComponent(
        email.toLowerCase()
      )}&type=forgot`,
    });
  }

  resetPassword(password: string): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/reset-password`, password)
    .pipe(
      switchMap((response: any) => {
        this.saveToken(response.token);
        const connectedUser = this.decodeToken();
        this._userService._defaultLink.next(connectedUser?.defaultLink);
        return of(response);
      })
    );;
  }

  signIn(credentials: { email: string; password: string }): Observable<any> {
    if (this.isloggedin()) {
      return throwError('User is already logged in.');
    }
    return this._httpClient.post(`${this.apiUrl}/login`, { ...credentials });
  }
  verifCode(elems: { code: string; email: string }): Observable<any> {
    return this._httpClient
      .post(`${this.apiUrl}/verif-account`, { ...elems })
      .pipe(
        switchMap((response: any) => {
          this.saveToken(response.token);
          const connectedUser = this.decodeToken();
          this._userService._defaultLink.next(connectedUser?.defaultLink);
          return of(response);
        })
      );
  }

  signOut(): Observable<any> {
    this.removeToken();
    return of(true);
  }
  /*requestResetPassword(email: string): Observable<auth_conf> {
      return this.http.post<auth_conf>(`${this.apiUrl}/reset-password`, { email });
    }*/

  /*verifyResetCode(token: string, code: string): Observable<auth_conf> {
      return this.http.post<auth_conf>(`${this.apiUrl}/verify-reset-code`, { token, code });
    }*/

  //TOKEN WISE

  loadToken() {
    this.token.set(localStorage.getItem('jwt')!);
    if (this.isTokenExpired()) {
      this.removeToken();
    } else {
      this.isloggedin.set(true);
    }
  }
  saveToken(jwt: string) {
    localStorage.setItem('jwt', jwt);
    this.token.set(jwt);
    this.isloggedin.set(true);
  }

  getToken() {
    return this.token().toString();
  }

  removeToken() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('email');
    this.token.set('');
    this.isloggedin.set(false);
  }

  decodeToken() {
    return this.helper.decodeToken(this.token().toString());
  }
  decodeVerifToken(Token: string) {
    return this.helper.decodeToken(Token);
  }
  isTokenExpired(): Boolean {
    return this.helper.isTokenExpired(this.token());
  }
  isLoggedIn(): Boolean {
    return this.isloggedin();
  }

  check(): Observable<boolean> {
    // Check if the user is logged in
    if (this.isloggedin()) {
      return of(true);
    }

    // Check the access token availability
    if (!this.token() || this.token() === '') {
      localStorage.removeItem('jwt');
      return of(false);
    }

    // Check the access token expire date
    if (this.isTokenExpired()) {
      return of(false);
    }
    return of(true);
  }
}
