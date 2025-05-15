import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Notification } from './notifications.types';
import { map, Observable, ReplaySubject, switchMap, take, tap } from 'rxjs';
import { environment } from '../../../../../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private _httpClient: HttpClient = inject(HttpClient);
  private _notifications: ReplaySubject<Notification[]> = new ReplaySubject<
    Notification[]
  >(1);
  private endpoint = `${environment.api}/notificationsx`;

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Getter for notifications
   */
  get notifications$(): Observable<Notification[]> {
    return this._notifications.asObservable();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Get all notifications
   */
  getAll(): Observable<Notification[]> {
    return this._httpClient.get<Notification[]>(this.endpoint).pipe(
      tap((notifications) => {
        this._notifications.next(notifications);
      })
    );
  }

  /**
   * Update the notification
   *
   * @param id
   * @param notification
   */
  update(id: string): Observable<Notification> {
    return this.notifications$.pipe(
      take(1),
      switchMap((notifications) =>
        this._httpClient.patch<Notification>(`${this.endpoint}/${id}`, {}).pipe(
          map((updatedNotification: Notification) => {
            console.log('hi');

            // Find the index of the updated notification
            const index = notifications.findIndex((item) => item.id === id);

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

  /**
   * Delete the notification
   *
   * @param id
   */
  delete(id: string): Observable<boolean> {
    return this.notifications$.pipe(
      take(1),
      switchMap((notifications) =>
        this._httpClient
          .delete<boolean>(this.endpoint, { params: { id } })
          .pipe(
            map((isDeleted: boolean) => {
              // Find the index of the deleted notification
              const index = notifications.findIndex((item) => item.id === id);

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

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): Observable<boolean> {
    return this.notifications$.pipe(
      take(1),
      switchMap((notifications) =>
        this._httpClient
          .get<boolean>('api/common/notifications/mark-all-as-read')
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
}
