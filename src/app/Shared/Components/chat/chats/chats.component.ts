import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Subject, takeUntil, filter, take, switchMap, tap, throwError } from 'rxjs';
import { Chat } from '../../../Models/chat.types';
import { ChatService } from '../chat.service';
import { NewChatComponent } from '../new-chat/new-chat.component';
import { User } from '../../../Models/User.model';
import { UserService } from '../../../Services/user.service';
import { EmptyConversationComponent } from '../empty-conversation/empty-conversation.component';
import { Agent } from '../../../Models/Agent.model';

@Component({
    selector       : 'chat-chats',
    templateUrl    : './chats.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [MatSidenavModule, EmptyConversationComponent, CommonModule, NewChatComponent, MatButtonModule, MatIconModule, MatMenuModule, MatFormFieldModule, MatInputModule, NgClass, RouterLink, RouterOutlet],
})
export class ChatsComponent implements OnInit, OnDestroy
{
    chats: Chat[] = [];
    drawerComponent: 'new-chat';
    drawerOpened: boolean = false;
    filteredChats: Chat[] = [];
    selectedChat: Chat | null = null;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    profile: User | Agent | null = null;
    loading: boolean = true;
    type: string = '';

    constructor(
        private _chatService: ChatService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _userService: UserService
    ) {}

    ngOnInit(): void
    {
        console.log('ChatsComponent: Initializing...');
        
        // Wait for user initialization before proceeding
        this._chatService.userInitialized$.pipe(
            tap(initialized => console.log('ChatsComponent: User initialized status:', initialized)),
            filter(initialized => initialized),
            tap(() => console.log('ChatsComponent: User is initialized, proceeding...')),
            take(1),
            switchMap(() => {
                console.log('ChatsComponent: Inside switchMap');
                this.profile = this._userService.user();
                console.log('ChatsComponent: User profile:', this.profile);
                
                if (!this.profile?._id) {
                    console.error('ChatsComponent: No user ID available');
                    return throwError(() => new Error('No user ID available'));
                }
                
                this.type = this.profile.type || '';
                console.log('ChatsComponent: Connecting to chat with user ID:', this.profile._id);
                return this._chatService.connect(this.profile._id);
            })
        ).subscribe({
            next: () => {
                console.log('ChatsComponent: Successfully connected to chat');
                this.loading = false;
                this._changeDetectorRef.markForCheck();
            },
            error: (error) => {
                console.error('ChatsComponent: Failed to initialize chat:', error);
                this.loading = false;
                this._changeDetectorRef.markForCheck();
            },
            complete: () => {
                console.log('ChatsComponent: Initialization complete');
            }
        });

        // Subscribe to chats
        this._chatService.chats$
            .pipe(
                tap(chats => console.log('ChatsComponent: Received chats update:', chats?.length || 0)),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe((chats: Chat[] | null) => {
                this.chats = this.filteredChats = chats || [];
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to selected chat
        this._chatService.chat$
            .pipe(
                tap(chat => console.log('ChatsComponent: Received chat update:', chat?._id)),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe((chat: Chat | null) => {
                this.selectedChat = chat;
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Filter the chats
     *
     * @param query
     */
    filterChats(query: string): void
    {
        // Reset the filter
        if ( !query )
        {
            this.filteredChats = this.chats;
            return;
        }

        this.filteredChats = this.chats.filter(chat => (chat.contact?.first_name+chat.contact?.last_name!).toLowerCase().includes(query.toLowerCase()));
    }

    /**
     * Open the new chat sidebar
     */
    openNewChat(): void
    {
        this.drawerComponent = 'new-chat';
        this.drawerOpened = true;
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }
    

}
