import { Injectable, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FirebaseNotification } from './firebase.notif.service';
import { NotificationsService } from '../../Modules/admins/layout/layouts/vertical/classy/common/notifications/notifications.service';
import type { Notification } from '../../Modules/admins/layout/layouts/vertical/classy/common/notifications/notifications.types';

export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  private socket: Socket;
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$ = this.messagesSubject.asObservable();
  
  private _notificationService = inject(NotificationsService);
  private _http = inject(HttpClient);

  constructor() {
    this.socket = io('http://localhost:3000/Messaging', {
        transports: ['websocket'],
        path: '/socket.io',
        withCredentials: true,
    });

    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    this.socket.on('connect', () => {
      console.log('Connected to messaging server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from messaging server');
    });

    this.socket.on('new_message', (message: Message) => {
      const currentMessages = this.messagesSubject.value;
      this.messagesSubject.next([...currentMessages, message]);
      
      const notification: Notification = {
        _id: message._id,
        title: 'New Message',
        description: message.content,
        read: false,
        time: message.timestamp.toString()
      };
      
      this._notificationService.pushNotification(notification);
    });

    this.socket.on('message_read', (messageId: string) => {
      const currentMessages = this.messagesSubject.value;
      const updatedMessages = currentMessages.map(msg => 
        msg._id === messageId ? { ...msg, read: true } : msg
      );
      this.messagesSubject.next(updatedMessages);
    });
  }

  connect(userId: string): void {
    if (!this.socket.connected) {
      this.socket.auth = { userId };
      this.socket.connect();
    }
  }

  disconnect(): void {
    if (this.socket.connected) {
      this.socket.disconnect();
    }
  }

  sendMessage(receiverId: string, content: string): Observable<Message> {
    return this._http.post<Message>(`${environment.api}/messages`, {
      receiverId,
      content
    });
  }

  getMessages(userId: string): Observable<Message[]> {
    return this._http.get<Message[]>(`${environment.api}/messages/${userId}`);
  }

  markMessageAsRead(messageId: string): Observable<void> {
    return this._http.patch<void>(`${environment.api}/messages/${messageId}/read`, {});
  }

  getUnreadMessagesCount(): Observable<number> {
    return this._http.get<number>(`${environment.api}/messages/unread/count`);
  }
} 