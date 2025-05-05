import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../Models/User.model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { from, map, Observable, of, switchMap, throwError } from 'rxjs';
import { auth_conf } from '../Models/auth-confirmation.model';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../../environments/environment';
import { UserService } from './user.service';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { Governorate } from '../Models/Gouvernorat.model';

@Injectable({
  providedIn: 'root',
})
export class SuperAuthService {
  private apiUrl = `${environment.api}/auth`;
  private helper = new JwtHelperService();
  private token = signal<string>('');
  public who = signal<string>('admin');
  private isloggedin = signal<boolean>(false);
  private _httpClient = inject(HttpClient);
  private _userService = inject(UserService);
  private _router = inject(Router);

  constructor() {
    this.loadToken();
  }

  loginWithGoogle() {
    window.location.href = `${
      this.apiUrl
    }/google?redirect=${encodeURIComponent(window.location.href)}`;
  }

  loginWithFacebook() {
    window.location.href = `${
      this.apiUrl
    }/facebook?redirect=${encodeURIComponent(window.location.href)}`;
  }

  handleCallback(token: string) {
    this.saveToken(token);
    const connectedUser = this.decodeToken();
    this._userService._defaultLink.next(connectedUser?.defaultLink);
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
    return this._httpClient
      .post(`${this.apiUrl}/reset-password`, password)
      .pipe(
        switchMap((response: any) => {
          this.saveToken(response.token);
          const connectedUser = this.decodeToken();
          this._userService._defaultLink.next(connectedUser?.defaultLink);
          return of(response);
        })
      );
  }

  updatePassword(password: string, token: string): Observable<any> {
    return this._httpClient
      .patch(`${this.apiUrl}/update-password`, { token, password })
      .pipe(
        switchMap((response: any) => {
          this.saveToken(response.token);
          const connectedUser = this.decodeToken();
          this._userService._defaultLink.next(
            '/admin/' + connectedUser?.defaultLink
          );
          return of(response);
        })
      );
  }

  signIn(
    credentials: { email: string; password: string },
    who: string
  ): Observable<any> {
    if (this.isloggedin()) {
      return throwError(() => new Error('User is already logged in.'));
    }

    if (who === 'user') {
      return this.getFingerprint$().pipe(
        switchMap((fingerprint) =>
          this._httpClient.post(`${this.apiUrl}/login`, {
            ...credentials,
            who,
            fingerprint,
          })
        )
      );
    }
    // fallback for other roles
    return this._httpClient.post(`${this.apiUrl}/login`, {
      ...credentials,
      who,
    });
  }
  signUp(credentials: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
  }) {
    return this._httpClient.post(`${this.apiUrl}/register`, { user:{...credentials} });
  }
  Complete(phone:string,city:Governorate):Observable<any>{
    return this._httpClient.patch(`${this.apiUrl}/add-info`,{phone,city}).pipe(
      switchMap((response: any) => {
        this.removeToken();
        this.saveToken(response.token);
        return of(response);
      })
    )
  }
  verifCode(
    elems: { code: string; email: string },
    who: string
  ): Observable<any> {
    if (who === 'user') {
      return this.getFingerprint$().pipe(
        switchMap((fingerprint) =>
          this._httpClient
            .post(`${this.apiUrl}/verif-account`, { ...elems, fingerprint })
            .pipe(
              switchMap((response: any) => {
                this.saveToken(response.token);
                const connectedUser = this.decodeToken();
                this._userService._defaultLink.next(connectedUser?.defaultLink);
                this.who.set(connectedUser?.type);
                return of(response);
              })
            )
        )
      );
    }
    return this._httpClient
      .post(`${this.apiUrl}/verif-account`, { ...elems })
      .pipe(
        switchMap((response: any) => {
          this.saveToken(response.token);
          const connectedUser = this.decodeToken();
          this._userService._defaultLink.next(connectedUser?.defaultLink);
          this.who.set(connectedUser?.type);
          return of(response);
        })
      );
  }

  signOut(): Observable<any> {
    this.removeToken();
    return of(true);
  }
  unauthorized() {
    this._router.navigate['/admin/unauthorized'];
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

  checkToken(token: string): Observable<boolean> {
    return this._httpClient
      .post<{ valid: boolean }>(`${this.apiUrl}/check-token`, { token })
      .pipe(map((response) => response.valid));
  }

  getFingerprint$(): Observable<string> {
    return from(FingerprintJS.load()).pipe(
      switchMap((fp) => from(fp.get())),
      map((result) => result.visitorId)
    );
  }
}
