import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FirebaseApp, initializeApp } from 'firebase/app';
import {
  getMessaging,
  getToken,
  onMessage,
  Messaging,
  deleteToken,
} from 'firebase/messaging';
import { environment, environmentFirebase } from '../../../environments/environment';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { NotificationPromptService } from '../Components/notification-prompt/notification.service';
import { AgentService } from './agent.service';
import type { Notification } from '../Components/notifications/notifications.types';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FirebaseNotification {
  private currentToken: string | null = null;
  private firebaseApp: FirebaseApp | null = null;
  private messaging: Messaging | null = null;
  private _agent = inject(AgentService);
  private notif = inject(NotificationPromptService);
  private http = inject(HttpClient);
  public connected = false;

  async connect(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      await this.initializeWebPush();
    } else {
      await this.initializeNativePush();
    }
  }

  private async initializeWebPush(): Promise<void> {
    try {
      // Initialize Firebase
      if (!this.firebaseApp) {
        this.firebaseApp = initializeApp(environmentFirebase.firebase);
      }
      if (!this.messaging) {
        this.messaging = getMessaging(this.firebaseApp);
      }

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission denied');
        return;
      }

      // Get and handle token
      await this.handleWebToken();
      this.listenForMessages();
    } catch (error) {
      console.error('Web push initialization failed:', error);
    }
  }

  private async initializeNativePush(): Promise<void> {
    try {
      const { receive } = await PushNotifications.requestPermissions();
      if (receive !== 'granted') {
        console.warn('Native notification permission denied');
        return;
      }
      
      await PushNotifications.register();
      this.setupNativeListeners();
    } catch (error) {
      console.error('Native push initialization failed:', error);
    }
  }

  private async handleWebToken(): Promise<void> {
    try {
      if (!this.messaging) throw new Error('Messaging not initialized');
      
      const token = await getToken(this.messaging, {
        vapidKey: environmentFirebase.firebase.vapidKey,
      });
      
      if (token) {
        this.currentToken = token;
        this.connected = true;
        await this.sendTokenToBackend(token);
      }
    } catch (error) {
      console.error('Error getting web FCM token:', error);
    }
  }

  private setupNativeListeners(): void {
    PushNotifications.addListener('registration', async (token) => {
      this.currentToken = token.value;
      this.connected = true;
      await this.sendTokenToBackend(token.value);
    });

    PushNotifications.addListener('registrationError', (err) => {
      console.error('Native registration error:', err);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      this.handleNotificationPayload(notification.data);
    });

  }

  private async sendTokenToBackend(token: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.patch(`${environment.api}/users/fcmToken`, { fcmToken: token })
      );
      console.log('Token saved successfully');
    } catch (err) {
      console.error('Failed to save token:', err);
    }
  }

  private listenForMessages(): void {
    if (!this.messaging) return;

    onMessage(this.messaging, (payload) => {
      this.handleNotificationPayload(payload.data || payload);
    });
  }

  private handleNotificationPayload(payload: any): void {
    const notificationType = payload?.['type'] || payload?.data?.['type'];
    
    const newNotification: Notification = {
      _id: payload?.['_id'] || payload?.data?.['_id'],
      title: payload?.['title'] || payload?.notification?.title,
      description: payload?.['body'] || payload?.notification?.body,
      read: false,
      time: payload?.['date'] || new Date().toISOString(),
      useRouter: payload?.['useRouter'] === 'true',
      link: payload?.['link'],
      icon: payload?.['icon'],
      image: payload?.['image'],
    };

    if (notificationType === 'order') {
      this.notif.openNotification(
        newNotification.title || 'New Order',
        newNotification.description || '',
        'order',
        true,
        () => this.handleOrderAcceptance(payload?.['orderId']),
        () => console.log('Order declined'),
        50000
      );
    }
  }

  private async handleOrderAcceptance(orderId: string | undefined): Promise<void> {
    if (!orderId) return;
    
    try {
      await firstValueFrom(this._agent.addOrderToJourney(orderId));
      console.log('Order added to journey');
    } catch (err) {
      console.error('Failed to add order to journey:', err);
    }
  }

  async logoutCleanup(): Promise<void> {
    try {
      // Remove token from backend
      if (this.currentToken) {
        await firstValueFrom(
          this.http.patch(`${environment.api}/users/remove-fcmToken`, {})
        );
        console.log('Token removed from backend');
      }

      // Platform-specific cleanup
      if (!Capacitor.isNativePlatform()) {
        await this.cleanupWebPush();
      } else {
        await this.cleanupNativePush();
      }
    } catch (err) {
      console.error('Logout cleanup error:', err);
    } finally {
      this.resetConnectionState();
    }
  }

  private async cleanupWebPush(): Promise<void> {
    if (!this.messaging || !this.currentToken) return;
    
    try {
      await deleteToken(this.messaging);
      console.log('Web FCM token deleted');
    } catch (err) {
      console.error('Failed to delete web FCM token:', err);
    }
  }

  private async cleanupNativePush(): Promise<void> {
    try {
      await PushNotifications.unregister();
      PushNotifications.removeAllListeners();
      console.log('Native push unregistered');
    } catch (err) {
      console.error('Native push cleanup error:', err);
    }
  }

  private resetConnectionState(): void {
    this.currentToken = null;
    this.connected = false;
    this.firebaseApp = null;
    this.messaging = null;
  }
}