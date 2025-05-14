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
import { NotificationService } from '../Components/notification-prompt/notification.service';
import { AgentService } from './agent.service';

@Injectable({
  providedIn: 'root',
})
export class FirebaseNotification {
  private firebaseApp: FirebaseApp;
  private messaging: Messaging;
  private _agent=inject(AgentService)

  constructor(private http: HttpClient,private notif:NotificationService) {
    if (!Capacitor.isNativePlatform()) {
      this.firebaseApp = initializeApp(environmentFirebase.firebase);
      this.messaging = getMessaging(this.firebaseApp);
      this.requestPermission();
      this.listenForMessages();
    } else {
      this.requestNativePermission();
    }
  }

  requestPermission() {
    Notification.requestPermission().then((result) => {
      console.log('Permission result:', result);
      if (result === 'granted') {
        this.getToken();
      } else {
        this.requestPermission();
      }
    });
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
      console.log('Message received:', payload);
      this.showNotification(payload);
      this.notif.openNotification(
        payload.notification?.title!,
        payload.notification?.body!,
        'order',
        true,
        () => {
          const orderId=payload.data!['orderId'];
          this._agent.addOrderToJourney(orderId).subscribe({
            next: () => {
              console.log('Order added to journey');
            },
            error: (err) => {
              console.error('Failed to add order to journey:', err);
            },
          });
        },
        () => console.log('Declined'),
        50000
      );
    });
  }

  private showNotification(payload: any) {
    const notificationOptions = {
      body: payload.notification.body,
      icon: payload.notification.icon,
    };
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(
        payload.notification.title,
        notificationOptions
      );
    });
  }
}
