import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { FeatureAuth } from '../Models/FeatureAuth.model';
import { io, Socket } from 'socket.io-client';
import { FuseNavigationItem } from '../Models/Navigation.model';
import { Feature } from '../Models/Feature.model';
import { UserService } from './user.service';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class MenuService {
  endpoint = `${environment.api}/menu`;
  private socket: Socket;
  http = inject(HttpClient);
  router = inject(Router);
  private _menu = new BehaviorSubject<any>(null);
  get menu$() {
    return this._menu.asObservable();
  }
  set menu(menu: any) {
    this._menu.next(menu);
  }
  initializeMenuSocket() {
    const token = localStorage.getItem('jwt');
    if (!token) {
      console.error('ChatService: No authentication token available');
      this.router.navigate(['/admin/sign-in']);
    }

    this.socket = io(`${environment.socket}/menu`, {
      transports: ['websocket'],
      path: '/socket.io',
      auth: { token },
      withCredentials: true,
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    console.log('in socket menu');

    this.socket?.on('connect', () => {
      console.log('Connected to chat namespace');
      // Register user after connection
      this.socket?.emit('join-menu');
    });

    this.socket?.on('disconnect', () => {
      console.log('Disconnected from chat namespace');
    });

    this.socket?.on('new-menu', (menu: any) => {
      console.log('Received new feature:', menu);
      this._menu.next(menu);
    });
  }

  markAsRead(id: string) {
    this.socket.emit(`mark-read`, { featureId: id });
  }

  getMenu(): Observable<any> {
    return this.http.get<any>(`${this.endpoint}`);
  }

  getActions(): Observable<FeatureAuth[]> {
    return this.http.get<FeatureAuth[]>(`${this.endpoint}/actions`);
  }
}
