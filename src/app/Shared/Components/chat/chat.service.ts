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
import { NotificationsService } from '../../../Modules/admins/layout/layouts/vertical/classy/common/notifications/notifications.service';
import type { Notification } from '../../../Modules/admins/layout/layouts/vertical/classy/common/notifications/notifications.types';
import type { Attachment, Message } from '../../Models/chat.types';
import { UserService } from '../../Services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  private socket: Socket | null = null;
  private currentUser: User | null = null;
  private _userInitialized: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  private _notificationService = inject(NotificationsService);

  /**
   * Constructor
   */
  constructor(
    private _httpClient: HttpClient,
    private _snackBar: MatSnackBar,
    private _userService: UserService
  ) {
    console.log('ChatService: Initializing...');
    this.currentUser = this._userService.user();
    console.log(this.currentUser);
    if(this.currentUser){
        console.log(this.currentUser);
      this._userInitialized.next(true);
      this.initializeSocket();
    }else{
        this._userService.get().subscribe((user) => {
            this.currentUser = user;
            this._userInitialized.next(true);
            this.initializeSocket();
        });
    }

  }

  private initializeSocket(): void {
    console.log('ChatService: Initializing socket...');
    if (!this.currentUser) {
      console.error('ChatService: Cannot initialize socket - no current user');
      return;
    }

    // Get the JWT token from localStorage or your auth service
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

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Getter for chat
   */
  get chat$(): Observable<Chat | null> {
    return this._chat.asObservable();
  }

  /**
   * Getter for chats
   */
  get chats$(): Observable<Chat[] | null> {
    return this._chats.asObservable();
  }

  /**
   * Getter for contact
   */
  get contact$(): Observable<User | null> {
    return this._contact.asObservable();
  }

  /**
   * Getter for contacts
   */
  get contacts$(): Observable<User[] | null> {
    return this._contacts.asObservable();
  }


  // Add back the getter with proper typing
  get userInitialized$(): Observable<boolean> {
    return this._userInitialized.asObservable();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Socket.io Methods
  // -----------------------------------------------------------------------------------------------------

  private setupSocketListeners(): void {
    console.log('ChatService: Setting up socket listeners');

    this.socket?.on('connect', () => {
      console.log('Connected to chat namespace');
      // Register user after connection
        this.socket?.emit('register-user');
      
    });

    this.socket?.on('disconnect',    () => {
      console.log('Disconnected from chat namespace');
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

    /*this.socket?.on(
      'messages-read',
      (data: { chatId: string; readBy: string }) => {
        console.log('Messages marked as read:', data);
        this.handleMessagesRead(data);
      }
    );*/
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
            unreadCount: (updatedChats[chatIndex].unreadCount || 0) + 1,
          };
          this._chats.next(updatedChats);
        }
      }
    });

    // Create notification if message is from another user
    if (message.senderId !== this.currentUser?._id) {
      const notification: Notification = {
        _id: message._id!,
        title: 'New Message',
        description: message.content,
        read: false,
        time: message.createdAt.toString(),
      };
      this._notificationService.pushNotification(notification);
    }
  }

  private handleChatUpdate(update: {
    chatId: string;
    lastMessage: Message;
    unreadCount: number;
  }): void {
    // Update chats list
    this.chats$.pipe(take(1)).subscribe((chats) => {
      if (!chats) return;

      const chatIndex = chats.findIndex((c) => c._id === update.chatId);
      if (chatIndex >= 0) {
        const updatedChats = [...chats];
        updatedChats[chatIndex] = {
          ...updatedChats[chatIndex],
          lastMessage: update.lastMessage,
          unreadCount: update.unreadCount,
        };
        this._chats.next(updatedChats);
      }
    });

    // Update current chat if it's the one being updated
    this.chat$.pipe(take(1)).subscribe((currentChat) => {
      if (currentChat && currentChat._id === update.chatId) {
        this._chat.next({
          ...currentChat,
          lastMessage: update.lastMessage,
          unreadCount: update.unreadCount,
        });
      }
    });
  }

  private handleMessagesRead(chatId: string,id:string): void {
    this.chat$.pipe(take(1)).subscribe((currentChat) => {
      if (
        currentChat &&
        currentChat._id === chatId &&
        currentChat.messages
      ) {
        const updatedMessages = currentChat.messages.map((msg) =>
        {
          if(msg.senderId !== id){
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

  // Modify connect method to wait for user initialization
  async connect(userId: string): Promise<void> {
    console.log('ChatService: Connecting with userId:', userId);

    if (!this.socket?.connected) {
      console.log('ChatService: Connecting socket...');
      this.socket?.connect();
    }

    // The register-user event is now handled in the socket connection handler
    console.log('ChatService: Socket connection established');
  }

  disconnect(): void {
    if (this.socket?.connected) {
      this.socket.disconnect();
    }
  }

  joinChat(chatId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join-chat', chatId);
    }
  }

  leaveChat(chatId: string): void {
    if (this.socket?.connected) {
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
    content: string,
    attachments?: Attachment[]
  ): void {
    if (!this.socket?.connected || !this.currentUser) {
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
      content,
      senderId: this.currentUser._id,
      chatId,
      createdAt: new Date(),
      updatedAt: new Date(),
      read: false,
      attachments,
    };

    this.socket.emit(
      'send-message',
      { chatId, content, attachments },
      (response: { success: boolean; error?: string }) => {
        if (response.success) {
          // Update UI only after successful message send
          this.chat$.pipe(take(1)).subscribe((chat) => {
            if (chat && chat._id === chatId) {
              const updatedChat = {
                ...chat,
                messages: [...(chat.messages || []), message as Message],
                lastMessage: message as Message,
              };
              this._chat.next(updatedChat);
              console.log(updatedChat);
              // Update chat in chats list
              this.chats$.pipe(take(1)).subscribe((chats) => {
                if (chats) {
                  const index = chats.findIndex((c) => c._id === chatId);
                  if (index >= 0) {
                    const updatedChats = [...chats];
                    updatedChats[index] = updatedChat;
                    this._chats.next(updatedChats);
                  }
                }
              });
            }
          });
        } else {
          this._snackBar.open(
            `Failed to send message: ${response.error || 'Unknown error'}`,
            'Close',
            {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
            }
          );
        }
      }
    );
  }

  markMessagesAsRead(chatId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('mark-read', { chatId });
    }
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

  getUnreadMessagesCount(chatId: string): Observable<number> {
    return this._httpClient.get<number>(
      `${environment.api}/messages/chats/${chatId}/unread/count`
    );
  }

  createChat(contact: User): Observable<Chat> {
    return this._httpClient
      .post<Chat>(`${environment.api}/chats`, { contactId: contact._id })
      .pipe(
        tap((chat: Chat) => {
          const currentChats = this._chats.value || [];
          this._chats.next([...currentChats, chat]);
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

  /**
   * Reset the selected chat
   */
  resetChat(): void {
    this._chat.next(null);
  }
}
