import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Injectable, inject   } from '@angular/core';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError, firstValueFrom } from 'rxjs';
import { Chat } from '../../Models/chat.types';
import { environment } from '../../../../environments/environment';
import { User } from '../../Models/User.model';
import { io, Socket } from 'socket.io-client';
import { NotificationsService } from '../../../Modules/admins/layout/layouts/vertical/classy/common/notifications/notifications.service';
import type { Notification } from '../../../Modules/admins/layout/layouts/vertical/classy/common/notifications/notifications.types';
import type { Attachment, Message } from '../../Models/chat.types';
import { UserService } from '../../Services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({providedIn: 'root'})
export class ChatService
{
    private _chat: BehaviorSubject<Chat | null> = new BehaviorSubject<Chat | null>(null);
    private _chats: BehaviorSubject<Chat[] | null> = new BehaviorSubject<Chat[] | null>(null);
    private _contact: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
    private _contacts: BehaviorSubject<User[] | null> = new BehaviorSubject<User[] | null>(null);
    private socket: Socket | null = null;
    private currentUser: User | null = null;
    private _userInitialized: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    private _notificationService = inject(NotificationsService);

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient, 
        private _userService: UserService,
        private _snackBar: MatSnackBar,
    )
    {
        console.log('ChatService: Initializing...');
        this._userService.get().pipe(
            tap(user => {
                console.log('ChatService: Received user:', user);
                if (!user) {
                    console.error('ChatService: No user received from UserService');
                    return;
                }
                this.currentUser = user;
                console.log('ChatService: Setting user initialized to true');
                this._userInitialized.next(true);
                this.initializeSocket();
            })
        ).subscribe({
            error: (error) => {
                console.error('ChatService: Error getting user:', error);
                this._snackBar.open('Failed to initialize chat: User not available', 'Close', {
                    duration: 3000,
                    horizontalPosition: 'end',
                    verticalPosition: 'top',
                });
            }
        });
    }

    private initializeSocket(): void {
        console.log('ChatService: Initializing socket...');
        if (!this.currentUser) {
            console.error('ChatService: Cannot initialize socket - no current user');
            return;
        }

        this.socket = io('http://localhost:3000/chat', {
            transports: ['websocket'],
            path: '/socket.io',
            withCredentials: true,
            auth: { userId: this.currentUser._id }
        });

        console.log('ChatService: Socket created, setting up listeners');
        this.setupSocketListeners();
    }

    // Add a getter for user initialization status
    get userInitialized$(): Observable<boolean> {
        return this._userInitialized.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for chat
     */
    get chat$(): Observable<Chat | null>
    {
        return this._chat.asObservable();
    }

    /**
     * Getter for chats
     */
    get chats$(): Observable<Chat[] | null>
    {
        return this._chats.asObservable();
    }

    /**
     * Getter for contact
     */
    get contact$(): Observable<User | null>
    {
        return this._contact.asObservable();
    }

    /**
     * Getter for contacts
     */
    get contacts$(): Observable<User[] | null>
    {
        return this._contacts.asObservable();
    }

    /**
     * Getter for profile
     */
    //get profile$(): Observable<Profile | null>
    //{
    //    return this._profile.asObservable();
    //}

    // -----------------------------------------------------------------------------------------------------
    // @ Socket.io Methods
    // -----------------------------------------------------------------------------------------------------

    private setupSocketListeners(): void
    {
        console.log('setupSocketListeners');
        this.socket?.on('connect', () =>
        {
            console.log('Connected to chat namespace');
        });

        this.socket?.on('disconnect', () =>
        {
            console.log('Disconnected from chat namespace');
        });

        this.socket?.on('error', (error: { message: string }) =>
        {
            console.error('Socket error:', error.message);
        });

        this.socket?.on('new-message', (message: Message) =>
        {
            this.handleNewMessage(message);
        });

        this.socket?.on('chat-update', (update: { chatId: string; lastMessage: Message; unreadCount: number }) => {
            this.handleChatUpdate(update);
        });

        this.socket?.on('messages-read', (data: { chatId: string; readBy: string }) => {
            this.handleMessagesRead(data);
        });
    }

    private handleNewMessage(message: Message): void
    {
        // Update current chat if it's the one receiving the message
        this.chat$.pipe(take(1)).subscribe(currentChat =>
        {
            if (currentChat && currentChat._id === message.chatId)
            {
                const updatedChat = {
                    ...currentChat,
                    messages: [...(currentChat.messages || []), message],
                    lastMessage: message
                };
                this._chat.next(updatedChat);
            }
        });

        // Update chat in chats list
        this.chats$.pipe(take(1)).subscribe(chats =>
        {
            if (chats)
            {
                const chatIndex = chats.findIndex(c => c._id === message.chatId);
                if (chatIndex >= 0)
                {
                    const updatedChats = [...chats];
                    updatedChats[chatIndex] = {
                        ...updatedChats[chatIndex],
                        lastMessage: message,
                        unreadCount: (updatedChats[chatIndex].unreadCount || 0) + 1
                    };
                    this._chats.next(updatedChats);
                }
            }
        });

        // Create notification if message is from another user
        if (message.senderId !== this.currentUser?._id)
        {
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

    private handleChatUpdate(update: { chatId: string; lastMessage: Message; unreadCount: number }): void
    {
        // Update chats list
        this.chats$.pipe(take(1)).subscribe(chats =>
        {
            if (!chats) return;

            const chatIndex = chats.findIndex(c => c._id === update.chatId);
            if (chatIndex >= 0)
            {
                const updatedChats = [...chats];
                updatedChats[chatIndex] = {
                    ...updatedChats[chatIndex],
                    lastMessage: update.lastMessage,
                    unreadCount: update.unreadCount
                };
                this._chats.next(updatedChats);
            }
        });

        // Update current chat if it's the one being updated
        this.chat$.pipe(take(1)).subscribe(currentChat =>
        {
            if (currentChat && currentChat._id === update.chatId)
            {
                this._chat.next({
                    ...currentChat,
                    lastMessage: update.lastMessage,
                    unreadCount: update.unreadCount
                });
            }
        });
    }

    private handleMessagesRead(data: { chatId: string; readBy: string }): void
    {
        this.chat$.pipe(take(1)).subscribe(currentChat =>
        {
            if (currentChat && currentChat._id === data.chatId && currentChat.messages)
            {
                const updatedMessages = currentChat.messages.map(msg => 
                    msg.senderId !== data.readBy ? { ...msg, read: true } : msg
                );
                
                this._chat.next({
                    ...currentChat,
                    messages: updatedMessages,
                    unreadCount: 0
                });
            }
        });
    }

    // Modify connect method to wait for user initialization
    async connect(userId: string): Promise<void> {
        console.log('ChatService: Connecting with userId:', userId);
        if (!this._userInitialized.value) {
            console.log('ChatService: Waiting for user initialization...');
            await firstValueFrom(this._userInitialized.pipe(
                filter(initialized => initialized)
            ));
            console.log('ChatService: User initialization complete');
        }

        if (!this.socket?.connected) {
            console.log('ChatService: Connecting socket...');
            this.socket?.connect();
        }

        console.log('ChatService: Registering user...');
        await this.registerUser(userId);
        console.log('ChatService: User registered successfully');
    }

    disconnect(): void
    {
        if (this.socket?.connected)
        {
            this.socket.disconnect();
        }
    }

    private async registerUser(userId: string): Promise<void> {
        console.log('ChatService: Registering user:', userId);
        if (!this.socket?.connected) {
            console.error('ChatService: Cannot register user - socket not connected');
            throw new Error('Socket not connected');
        }

        return new Promise((resolve, reject) => {
            console.log('ChatService: Emitting register-user event');
            this.socket!.emit('register-user', userId, (response: { success: boolean; error?: string }) => {
                if (response.success) {
                    console.log('ChatService: User registration successful');
                    resolve();
                } else {
                    console.error('ChatService: User registration failed:', response.error);
                    reject(new Error(response.error || 'Failed to register user'));
                }
            });
        });
    }

    joinChat(chatId: string): void
    {
        if (this.socket?.connected)
        {
            this.socket.emit('join-chat', chatId);
        }
    }

    leaveChat(chatId: string): void
    {
        if (this.socket?.connected)
        {
            this.socket.emit('leave-chat', chatId);
            this.chat$.pipe(take(1)).subscribe(currentChat =>
            {
                if (currentChat && currentChat._id === chatId)
                {
                    this._chat.next({
                        ...currentChat,
                        messages: []
                    });
                }
            });
        }
    }

    // Modify sendMessage to check for socket and user
    sendMessage(chatId: string, content: string, attachments?: Attachment[]): void {
        if (!this.socket?.connected || !this.currentUser) {
            this._snackBar.open('Cannot send message: Not connected to chat server', 'Close', {
                duration: 3000,
                horizontalPosition: 'end',
                verticalPosition: 'top',
            });
            return;
        }

        const message: Partial<Message> = {
            content,
            senderId: this.currentUser._id,
            chatId,
            createdAt: new Date(),
            updatedAt: new Date(),
            read: false,
            attachments
        };

        this.socket.emit('send-message', { chatId, content, attachments }, (response: { success: boolean; error?: string }) => {
            if (response.success) {
                // Update UI only after successful message send
                this.chat$.pipe(take(1)).subscribe(chat => {
                    if (chat && chat._id === chatId) {
                        const updatedChat = {
                            ...chat,
                            messages: [...(chat.messages || []), message as Message],
                            lastMessage: message as Message
                        };
                        this._chat.next(updatedChat);

                        // Update chat in chats list
                        this.chats$.pipe(take(1)).subscribe(chats => {
                            if (chats) {
                                const index = chats.findIndex(c => c._id === chatId);
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
                this._snackBar.open(`Failed to send message: ${response.error || 'Unknown error'}`, 'Close', {
                    duration: 3000,
                    horizontalPosition: 'end',
                    verticalPosition: 'top',
                });
            }
        });
    }

    markMessagesAsRead(chatId: string): void
    {
        if (this.socket?.connected)
        {
            this.socket.emit('mark-read', { chatId });
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ HTTP Methods
    // -----------------------------------------------------------------------------------------------------

    getChats(): Observable<Chat[]>
    {
        return this._httpClient.get<Chat[]>(`${environment.api}/chats`).pipe(
            tap((chats: Chat[]) =>
            {
                this._chats.next(chats);
            })
        );
    }

    getContact(id: string): Observable<User>
    {
        return this._httpClient.get<User>(`${environment.api}/chats/contact`, { params: { id } }).pipe(
            tap((contact: User) =>
            {
                this._contact.next(contact);
            })
        );
    }

    /**
     * Get contacts
     */
    getContacts(): Observable<User[]>
    {
        return this._httpClient.get<User[]>(`${environment.api}/chats/contacts`).pipe(
            tap((contacts: User[]) =>
            {
                this._contacts.next(contacts);
            })
        );
    }

    getChatById(id: string): Observable<Chat>
    {
        return this._httpClient.get<Chat>(`${environment.api}/chats/${id}`).pipe(
            tap((chat: Chat) =>
            {
                this._chat.next(chat);
            }),
            switchMap((chat: Chat) =>
            {
                if (!chat)
                {
                    return throwError(() => new Error(`Could not find chat with id of ${id}!`));
                }
                return of(chat);
            })
        );
    }

    getUnreadMessagesCount(chatId: string): Observable<number>
    {
        return this._httpClient.get<number>(`${environment.api}/messages/chats/${chatId}/unread/count`);
    }

    createChat(contact: User): Observable<Chat>
    {
        return this._httpClient.post<Chat>(`${environment.api}/chats`, { contactId: contact._id }).pipe(
            tap((chat: Chat) =>
            {
                const currentChats = this._chats.value || [];
                this._chats.next([...currentChats, chat]);
            })
        );
    }

    updateChat(id: string, chat: Partial<Chat>): Observable<Chat>
    {
        return this.chats$.pipe(
            take(1),
            switchMap(chats =>
            {
                if (!chats) return throwError(() => new Error('No chats available'));
                
                return this._httpClient.patch<Chat>(`${environment.api}/chats/${id}`, chat).pipe(
                    tap((updatedChat: Chat) =>
                    {
                        const index = chats.findIndex(c => c._id === id);
                        if (index >= 0)
                        {
                            const updatedChats = [...chats];
                            updatedChats[index] = updatedChat;
                            this._chats.next(updatedChats);

                            // Update current chat if it's the one being updated
                            this.chat$.pipe(take(1)).subscribe(currentChat =>
                            {
                                if (currentChat && currentChat._id === id)
                                {
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
    resetChat(): void
    {
        this._chat.next(null);
    }
}
