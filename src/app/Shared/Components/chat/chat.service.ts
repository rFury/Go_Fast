import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Injectable, inject } from '@angular/core';
import {
  BehaviorSubject,
  filter,
  map,
  Observable,
  of,
  switchMap,
  take,
  tap,
  throwError,
  firstValueFrom,
} from 'rxjs';
import { Chat } from '../../Models/chat.types';
import { environment } from '../../../../environments/environment';
import { User } from '../../Models/User.model';
import { io, Socket } from 'socket.io-client';
import { NotificationsService } from '../notifications/notifications.service';
import type { Notification } from '../notifications/notifications.types';
import type { Attachment, Message } from '../../Models/chat.types';
import { UserService } from '../../Services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SuperAuthService } from '../../Services/super-auth-service.service';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private _chat: BehaviorSubject<Chat | null> =
    new BehaviorSubject<Chat | null>(null);
  private _chats: BehaviorSubject<Chat[] | null> = new BehaviorSubject<
    Chat[] | null
  >(null);
  private _contact: BehaviorSubject<User | null> =
    new BehaviorSubject<User | null>(null);
  private _contacts: BehaviorSubject<User[] | null> = new BehaviorSubject<
    User[] | null
  >(null);
  private _unreadCount: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private socket: Socket | null = null;
  myId: string | null = null;
  private _router = inject(Router);
  initialized: boolean = false;
  connectedToChat: boolean = false;

  constructor(
    private _httpClient: HttpClient,
    private _snackBar: MatSnackBar,
    private _superAuthService: SuperAuthService
  ) {
    console.log('ChatService: Initializing...');
    this.myId = this._superAuthService.decodeToken()._id;
    if (!this.initialized) {
      this.initialized = true;
      this.initializeSocket();
      this.getUnreadMessagesCount().subscribe({
        next: (count) => {
          this._unreadCount.next(count);
        },
        error: (error) => {
          console.error('Error fetching unread messages count:', error);
        },
      });
    }
  }

  private initializeSocket(): void {
    if (!this.myId) {
      console.error('ChatService: Cannot initialize socket - no current user');
      return;
    }

    const token = localStorage.getItem('jwt');
    if (!token) {
      console.error('ChatService: No authentication token available');
      return;
    }

    this.socket = io(`127.0.0.1:3000/chat`, {
      transports: ['websocket'],
      path: '/socket.io',
      auth: { token },
      withCredentials: true,
    });
    console.log('ChatService: Socket created, setting up listeners');
    this.setupSocketListeners();
  }
  get chat$(): Observable<Chat | null> {
    return this._chat.asObservable();
  }

  get chats$(): Observable<Chat[] | null> {
    return this._chats.asObservable();
  }


  get contact$(): Observable<User | null> {
    return this._contact.asObservable();
  }

  get contacts$(): Observable<User[] | null> {
    return this._contacts.asObservable();
  }

  get unreadCount$(): Observable<number> {
    return this._unreadCount.asObservable();
  }

  private setupSocketListeners(): void {
    this.socket?.on('connect', () => {
      console.log('Connected to chat namespace');
      // Register user after connection
      this.socket?.emit('register-user');
      if (this._router.url.includes('/chat/') && !this.connectedToChat) {
        const chatId = this._router.url.split('/chat/')[1];
        this.joinChat(chatId);
        console.log('connect without refresh');
        this.connectedToChat = true;
      }
    });

    this.socket?.on('disconnect', () => {
      console.log('Disconnected from chat namespace');
      this.connectedToChat = false;
    });

    this.socket?.on('error', (error: { message: string }) => {
      console.error('Socket error:', error.message);
      this._snackBar.open(`Chat error: ${error.message}`, 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
    });

    this.socket?.on('new-message', (message: Message) => {
      console.log('Received new message:', message);
      this.handleNewMessage(message);
    });
    this.socket?.on('unread-count', (count: number) => {
      console.log('Received unread count:', count);
      this._unreadCount.next(count);
    });

    this.socket?.on(
      'chat-update',
      (update: {
        chatId: string;
        lastMessage: Message;
        unreadCount: number;
      }) => {
        console.log('Received chat update:', update);
        this.handleChatUpdate(update);
      }
    );

  }

  private handleNewMessage(message: Message): void {
    // Update current chat if it's the one receiving the message
    this.chat$.pipe(take(1)).subscribe((currentChat) => {
      if (currentChat && currentChat._id === message.chatId) {
        const updatedChat = {
          ...currentChat,
          messages: [...(currentChat.messages || []), message],
          lastMessage: message,
        };
        this._chat.next(updatedChat);
      }
    });

    // Update chat in chats list
    this.chats$.pipe(take(1)).subscribe((chats) => {
      if (chats) {
        const chatIndex = chats.findIndex((c) => c._id === message.chatId);
        if (chatIndex >= 0) {
          const updatedChats = [...chats];
          updatedChats[chatIndex] = {
            ...updatedChats[chatIndex],
            lastMessage: message,
            unreadCount:
              (updatedChats[chatIndex].unreadCount[this.myId!] || 0) + 1,
          };
          this._chats.next(updatedChats);
        }
      }
    });
  }

  private handleChatUpdate(update: {
    chatId: string;
    lastMessage: Message;
    unreadCount: number;
  }): void {
    // Update chats list
    this.chats$.pipe(take(1)).subscribe((chats) => {
      if (!chats) return;
      console.log(update.unreadCount);

      const chatIndex = chats.findIndex((c) => c._id === update.chatId);
      if (chatIndex >= 0) {
        const updatedChats = [...chats];
        updatedChats[chatIndex] = {
          ...updatedChats[chatIndex],
          lastMessage: update.lastMessage,
          unreadCount: {
            ...updatedChats[chatIndex].unreadCount,
            [this.myId!]: update.unreadCount,
          },
        };
        console.log({
          ...updatedChats[chatIndex],
          lastMessage: update.lastMessage,
          unreadCount: update.unreadCount,
        });

        this._chats.next(updatedChats);
        } 
    });

    // Update current chat if it's the one being updated
    this.chat$.pipe(take(1)).subscribe((currentChat) => {
      if (currentChat && currentChat._id === update.chatId) {
        this._chat.next({ 
          ...currentChat,
          lastMessage: update.lastMessage,
          unreadCount: {
            ...currentChat.unreadCount,
            [this.myId!]: update.unreadCount,
          },
        });
      }
    });
  }

  private handleMessagesRead(chatId: string, id: string): void {
    this.chat$.pipe(take(1)).subscribe((currentChat) => {
      if (currentChat && currentChat._id === chatId && currentChat.messages) {
        const updatedMessages = currentChat.messages.map((msg) => {
          if (msg.senderId !== id) {
            return { ...msg, read: true };
          }
          return msg;
        });
        currentChat.unreadCount[id] = 0;
        this._chat.next({
          ...currentChat,
          messages: updatedMessages,
        });
      }
    });
  }

  registerUser(userId: string): void {
    if (this.socket?.connected) {
      console.log('ChatService: Registering user:', userId);
      this.socket.emit('register-user', userId);
    }
  }

  disconnect(): void {
    if (this.socket?.connected) {
      this.socket.disconnect();
    }
  }

  joinChat(chatId: string): void {
    if (this.socket?.connected) {
      console.log('ChatService: Joining chat:', chatId);
      this.socket.emit('join-chat', chatId);
    }
  }

  leaveChat(chatId: string): void {
    if (this.socket?.connected) {
      console.log('ChatService: Leaving chat:', chatId);
      this.socket.emit('leave-chat', chatId);
      this.chat$.pipe(take(1)).subscribe((currentChat) => {
        if (currentChat && currentChat._id === chatId) {
          this._chat.next({
            ...currentChat,
            messages: [],
          });
        }
      });
    }
  }

  sendMessage(
    chatId: string,
    senderId: string,
    content: string,
    attachments?: Attachment[]
  ): void {
    if (!this.socket?.connected || !this.myId) {
      this._snackBar.open(
        'Cannot send message: Not connected to chat server',
        'Close',
        {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
        }
      );
      return;
    }

    const message: Partial<Message> = {
      senderId,
      content,
      chatId,
      createdAt: new Date(),
      updatedAt: new Date(),
      read: false,
      attachments,
    };
    console.log(message);

    this.socket.emit('send-message', message);
  }

  markMessagesAsRead(chatId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('mark-read', { chatId });
    }
    this.handleMessagesRead(chatId, this.myId!);
    this.handleChatUpdate({
      chatId,
      lastMessage: this._chat.value?.lastMessage!,
      unreadCount: this._chat.value?.unreadCount[this.myId!]!,
    });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ HTTP Methods
  // -----------------------------------------------------------------------------------------------------

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getChats(): Observable<Chat[]> {
    console.log('ChatService: Fetching chats from', `${environment.api}/chats`);
    return this._httpClient
      .get<Chat[]>(`${environment.api}/chats`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        tap({
          next: (chats: Chat[]) => {
            console.log(
              'ChatService: Successfully fetched chats:',
              chats?.length || 0
            );
            this._chats.next(chats);
          },
          error: (error) => {
            console.error('ChatService: Error fetching chats:', error);
            this._snackBar.open(
              'Failed to load chats. Please try again.',
              'Close',
              {
                duration: 3000,
                horizontalPosition: 'end',
                verticalPosition: 'top',
              }
            );
          },
        })
      );
  }

  getContact(id: string): Observable<User> {
    return this._httpClient
      .get<User>(`${environment.api}/chats/contact`, {
        params: { id },
        headers: this.getAuthHeaders(),
      })
      .pipe(
        tap((contact: User) => {
          this._contact.next(contact);
        })
      );
  }

  /**
   * Get contacts
   */
  getContacts(): Observable<User[]> {
    return this._httpClient
      .get<User[]>(`${environment.api}/chats/contacts`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        tap((contacts: User[]) => {
          console.log('contacts', contacts);
          this._contacts.next(contacts);
        })
      );
  }

  getChatById(id: string): Observable<Chat> {
    return this._httpClient.get<Chat>(`${environment.api}/chats/${id}`).pipe(
      tap((chat: Chat) => {
        this._chat.next(chat);
      }),
      switchMap((chat: Chat) => {
        if (!chat) {
          return throwError(
            () => new Error(`Could not find chat with id of ${id}!`)
          );
        }
        return of(chat);
      })
    );
  }

  getUnreadMessagesCount(): Observable<number> {
    const id = this._superAuthService.decodeToken()._id;
    return this._httpClient.get<number>(
      `${environment.api}/chats/unread-count`
    );
  }

  createChat(contact: User): Observable<Chat | string> {
    return this._httpClient
      .post<Chat | string>(`${environment.api}/chats`, {
        contactId: contact._id,
      })
      .pipe(
        tap((chat: Chat | string) => {
          console.log('created chat', chat);
          if (typeof chat === 'object') {
            const currentChats = this._chats.value || [];
            this._chats.next([...currentChats, chat]);
          }
        })
      );
  }

  updateChat(id: string, chat: Partial<Chat>): Observable<Chat> {
    return this.chats$.pipe(
      take(1),
      switchMap((chats) => {
        if (!chats) return throwError(() => new Error('No chats available'));

        return this._httpClient
          .patch<Chat>(`${environment.api}/chats/${id}`, chat)
          .pipe(
            tap((updatedChat: Chat) => {
              const index = chats.findIndex((c) => c._id === id);
              if (index >= 0) {
                const updatedChats = [...chats];
                updatedChats[index] = updatedChat;
                this._chats.next(updatedChats);

                // Update current chat if it's the one being updated
                this.chat$.pipe(take(1)).subscribe((currentChat) => {
                  if (currentChat && currentChat._id === id) {
                    this._chat.next(updatedChat);
                  }
                });
              }
            })
          );
      })
    );
  }

  muteUnmuteChat(id: string, userId: string): Observable<boolean> {
    return this.chats$.pipe(
      take(1),
      switchMap((chats) => {
        if (!chats) return throwError(() => new Error('No chats available'));

        return this._httpClient
          .patch<boolean>(`${environment.api}/chats/${id}/mute`, { userId })
          .pipe(
            tap((muted: boolean) => {
              const index = chats.findIndex((c) => c._id === id);
              if (index >= 0) {
                const updatedChats = [...chats];
                updatedChats[index].muted[userId]=muted;
                this._chats.next(updatedChats);

                // Update current chat if it's the one being updated
                this.chat$.pipe(take(1)).subscribe((currentChat) => {
                  if (currentChat && currentChat._id === id) {
                    this._chat.next({
                      ...currentChat,
                      muted: {
                        ...currentChat.muted,
                        [userId]: muted,
                      },
                    });
                  }
                });
              }
            })
          );
      })
    );
  }

  /**
   * Reset the selected chat
   */
  resetChat(): void {
    this._chat.next(null);
  }
}
