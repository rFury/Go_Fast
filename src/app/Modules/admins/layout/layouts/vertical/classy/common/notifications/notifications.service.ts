import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Notification } from './notifications.types';
import { map, Observable, ReplaySubject, switchMap, take, tap } from 'rxjs';
import { environment } from '../../../../../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private _notifications: ReplaySubject<Notification[]> = new ReplaySubject<
    Notification[]
  >(1);
  private _httpClient = inject(HttpClient);

  get notifications$(): Observable<Notification[]> {
    return this._notifications.asObservable();
  }

  getAll(): Observable<Notification[]> {
    return this._httpClient
      .get<Notification[]>(`${environment.api}/notifications`)
      .pipe(
        tap((notifications) => {
          this._notifications.next(notifications);
        })
      );
  }

    /**
     * Create a notification
     *
     * @param notification
     */
    create(notification: Notification): Observable<Notification>
    {
        return this.notifications$.pipe(
            take(1),
            switchMap(notifications => this._httpClient.post<Notification>('api/common/notifications', {notification}).pipe(
                map((newNotification) =>
                {
                    // Update the notifications with the new notification
                    this._notifications.next([...notifications, newNotification]);

                    // Return the new notification from observable
                    return newNotification;
                }),
            )),
        );
    }

    /**
     * Update the notification
     *
     * @param id
     * @param notification
     */
    update(id: string, notification: Notification): Observable<Notification>
    {
        return this.notifications$.pipe(
            take(1),
            switchMap(notifications => this._httpClient.patch<Notification>('api/common/notifications', {
                id,
                notification,
            }).pipe(
                map((updatedNotification: Notification) =>
                {
                    // Find the index of the updated notification
                    const index = notifications.findIndex(item => item.id === id);

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
    delete(id: string): Observable<boolean>
    {
        return this.notifications$.pipe(
            take(1),
            switchMap(notifications => this._httpClient.delete<boolean>('api/common/notifications', {params: {id}}).pipe(
                map((isDeleted: boolean) =>
                {
                    // Find the index of the deleted notification
                    const index = notifications.findIndex(item => item.id === id);

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
  pushNotification(notification: Notification): void {
    this._notifications.pipe(take(1)).subscribe(currentNotifications => {
      const updatedNotifications = [notification, ...currentNotifications];
      this._notifications.next(updatedNotifications);
    });
  }
}
