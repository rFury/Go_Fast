import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Notification } from './notifications.types';
import { BehaviorSubject, map, Observable, ReplaySubject, switchMap, take, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SuperAuthService } from '../../Services/super-auth-service.service';
import { io, Socket } from 'socket.io-client';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private _notifications: ReplaySubject<Notification[]> = new ReplaySubject<
    Notification[]
  >(1);
  private _superAuthService = inject(SuperAuthService);
  private _unreadCount: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private initialized: boolean = false;
  private myId: string | null = null;
  private socket: Socket | null = null;
  private _httpClient = inject(HttpClient);
  private _snackBar: MatSnackBar;
  constructor(){
    console.log('NotificationService: Initializing...');
    this.myId = this._superAuthService.decodeToken()._id;
    if (!this.initialized) {
      this.initialized = true;
      this.initializeSocket();
    }
  }
  private initializeSocket(): void {
    if (!this.myId) {
      console.error('NotificationService: Cannot initialize socket - no current user');
      return;
    }

    const token = localStorage.getItem('jwt');
    if (!token) {
      console.error('NotificationService: No authentication token available');
      return;
    }

    this.socket = io(`${environment.socket}/notifications`, {
      transports: ['websocket'],
      path: '/socket.io',
      auth: { token },
      withCredentials: true,
    });
    console.log('NotificationService: Socket created, setting up listeners');
    this.setupSocketListeners();
  }
  private setupSocketListeners(): void {
    this.socket?.on('connect', () => {
      console.log('Connected to Notification namespace');
      this.socket?.emit('register-user');
    });

    this.socket?.on('disconnect', () => {
      console.log('Disconnected from Notification namespace');
    });

    this.socket?.on('error', (error: { message: string }) => {
      console.error('Socket error:', error.message);
      this._snackBar.open(`Notification error: ${error.message}`, 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
    });

    this.socket?.on('new-notification', (notificationData: Notification) => {
      console.log('Received new notification:', notificationData);
      this.pushNotification(notificationData);
    });
    this.socket?.on('unread-count', (count: number) => {
      console.log('Received unread count:', count);
      this._unreadCount.next(count);
    });

  }
  get notifications$(): Observable<Notification[]> {
    return this._notifications.asObservable();
  }
  get unreadCount$(): Observable<number> {
    return this._unreadCount.asObservable();
  }

  getAll(): Observable<Notification[]> {
    return this._httpClient
      .get<Notification[]>(`${environment.api}/notifications`)
      .pipe(
        tap((notifications) => {
          console.log('notifications', notifications);
          
          this._notifications.next(notifications);
        })
      );
  }

  update(id: string): Observable<Notification> {
    return this.notifications$.pipe(
      take(1),
      switchMap((notifications) =>
        this._httpClient
          .patch<Notification>(`${environment.api}/notifications`, {
            id,
          })
          .pipe(
            map((updatedNotification: Notification) => {
              console.log('hi', updatedNotification);
              // Find the index of the updated notification
              const index = notifications.findIndex((item) => item._id === id);

              // Update the notification
              notifications[index] = updatedNotification;

              // Update the notifications
              this._notifications.next(notifications);

              // Return the updated notification
              return updatedNotification;
            })
          )
      )
    );
  }

  delete(id: string): Observable<boolean> {
    return this.notifications$.pipe(
      take(1),
      switchMap((notifications) =>
        this._httpClient
          .delete<boolean>(`${environment.api}/notifications`, {
            params: { id },
          })
          .pipe(
            map((isDeleted: boolean) => {
              // Find the index of the deleted notification
              const index = notifications.findIndex((item) => item._id === id);

              // Delete the notification
              notifications.splice(index, 1);

              // Update the notifications
              this._notifications.next(notifications);

              // Return the deleted status
              return isDeleted;
            })
          )
      )
    );
  }

  markAllAsRead(): Observable<boolean> {
    return this.notifications$.pipe(
      take(1),
      switchMap((notifications) =>
        this._httpClient
          .get<boolean>(`${environment.api}/notifications/mark-all-as-read`)
          .pipe(
            map((isUpdated: boolean) => {
              // Go through all notifications and set them as read
              notifications.forEach((notification, index) => {
                notifications[index].read = true;
              });

              // Update the notifications
              this._notifications.next(notifications);

              // Return the updated status
              return isUpdated;
            })
          )
      )
    );
  }
  handleReadUpdate(NotificationId: string): void {
    this.notifications$.pipe(take(1)).subscribe((currentNotifications) => {
      const updatedNotifications = currentNotifications.map((notification) => {
        if (notification.link?.includes('/Notification/' + NotificationId)) {

          notification.read = true;
        }
        return notification;
      });
      this._notifications.next(updatedNotifications);
    });
  }
  pushNotification(notification: Notification): void {
    this.notifications$.pipe(take(1)).subscribe((currentNotifications) => {
      const index = currentNotifications.findIndex((n) => n._id === notification._id);
      let updatedNotifications: Notification[];
  
      if (index === -1) {
        updatedNotifications = [notification, ...currentNotifications];
      } else {
        currentNotifications.splice(index, 1);
        updatedNotifications = [notification, ...currentNotifications];
      }
  
      this._notifications.next(updatedNotifications);
    });
  }
  
}
