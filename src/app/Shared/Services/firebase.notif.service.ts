import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FirebaseApp, initializeApp } from 'firebase/app';
import {
  getMessaging,
  getToken,
  onMessage,
  Messaging,
} from 'firebase/messaging';
import {
  environment,
  environmentFirebase,
} from '../../../environments/environment';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { NotificationPromptService } from '../Components/notification-prompt/notification.service';
import { AgentService } from './agent.service';
import { NotificationsService } from '../../Modules/admins/layout/layouts/vertical/classy/common/notifications/notifications.service';
import type { Notification } from '../../Modules/admins/layout/layouts/vertical/classy/common/notifications/notifications.types';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirebaseNotification {
  private firebaseApp: FirebaseApp;
  private messaging: Messaging;
  private _agent=inject(AgentService)
  private _notificationService=inject(NotificationsService)
  private notif=inject(NotificationPromptService)
  private permission=false;
constructor(private http: HttpClient) {
    if (!Capacitor.isNativePlatform()) {
      this.initializeWebPush();
    } else {
      this.requestNativePermission();
    }
  }
  private async initializeWebPush() {
    this.firebaseApp = initializeApp(environmentFirebase.firebase);
    this.messaging = getMessaging(this.firebaseApp);
    this.getToken();
    this.listenForMessages();
        if ('serviceWorker' in navigator) {
      try {
        Notification.requestPermission().then((result) => {
          console.log('Permission result:', result);
          if (result === 'granted') {
              this.permission=true;
          } else {
            this.permission=false;
          }
        });
      } catch (err) {
        console.error('Service Worker registration failed:', err);
      }
    } else {
      console.warn('Service workers not supported');
    }
  }
  private requestNativePermission() {
    PushNotifications.requestPermissions().then((result) => {
      if (result.receive === 'granted') {
        this.registerNativePush();
      }
    });
  }

  private registerNativePush() {
    PushNotifications.register();

    PushNotifications.addListener('registration', (token) => {
      console.log('Native FCM Token:', token.value);
      this.sendTokenToBackend(token.value);
    });

    PushNotifications.addListener('registrationError', (err) => {
      console.error('Native registration error:', err);
    });

    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification) => {
        console.log('Push received (native):', notification);
      }
    );

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (action) => {
        console.log('Push action performed:', action);
      }
    );
  }

  private getToken() {
    getToken(this.messaging, {
      vapidKey: environmentFirebase.firebase.vapidKey,
    })
      .then((currentToken) => {
        if (currentToken) {
          this.sendTokenToBackend(currentToken);
        }
      })
      .catch((err) => {
        console.error('Error getting FCM token:', err);
      });
  }

  private sendTokenToBackend(token: string) {
    this.http
      .patch(`${environment.api}/users/fcmToken`, { fcmToken: token })
      .subscribe({
        next: () => console.log('Token saved successfully'),
        error: (err) => console.error('Failed to save token:', err),
      });
  }

  listenForMessages() {
    onMessage(this.messaging, (payload) => {
      console.log('Foreground message received:', payload);
      this.handleNotificationPayload(payload);
    });
  }

  private handleNotificationPayload(payload: any) {
    const notificationType = payload.data?.['type'];
    
    if (notificationType === 'message') {
      const newNotification: Notification = {
        _id: payload.data!['_id'],
        title: payload.data!['title'],
        description: payload.data!['description'],
        read: false,
        time: payload.data!['date'],
        useRouter: payload.data!['useRouter'] === 'true',
        link: payload.data!['link'],
        icon: payload.data!['icon'],
        image: payload.data!['image'],
      };
      this._notificationService.pushNotification(newNotification);
    } 
    else {
      this.notif.openNotification(
        payload.notification?.title!,
        payload.notification?.body!,
        'order',
        true,
        () => this.handleOrderAcceptance(payload.data!['orderId']),
        () => console.log('Declined'),
        50000
      );
      
      const newNotification: Notification = {
        _id: payload.data!['_id'],
        title: payload.notification?.title,
        description: payload.notification?.body,
        read: false,
        time: payload.data!['date'],
      };
      this._notificationService.pushNotification(newNotification);
    }
  }
  private async handleOrderAcceptance(orderId: string) {
    try {
      await firstValueFrom(this._agent.addOrderToJourney(orderId));
      console.log('Order added to journey');
    } catch (err) {
      console.error('Failed to add order to journey:', err);
    }
  }
}
