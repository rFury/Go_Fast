import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterLink, RouterOutlet } from '@angular/router';
import {
  Subject,
  takeUntil,
  take,
  tap,
} from 'rxjs';
import { Chat } from '../../../Models/chat.types';
import { ChatService } from '../chat.service';
import { NewChatComponent } from '../new-chat/new-chat.component';
import { User } from '../../../Models/User.model';
import { UserService } from '../../../Services/user.service';
import { SuperAuthService } from '../../../Services/super-auth-service.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
@Component({
  selector: 'chat-chats',
  templateUrl: './chats.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatSidenavModule,
    CommonModule,
    NewChatComponent,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    NgClass,
    RouterLink,
    RouterOutlet,
    MatProgressSpinnerModule
  ],
})
export class ChatsComponent implements OnInit, OnDestroy {
  chats: Chat[] = [];
  drawerComponent: 'new-chat';
  drawerOpened: boolean = false;
  filteredChats: Chat[] = [];
  selectedChat: Chat | null = null;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  profile: User | null = null;
  loading: boolean = true;
  type: string = '';
  _id: string = '';

  constructor(
    private _chatService: ChatService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _userService: UserService,
    private _superAuthService: SuperAuthService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this._userService.userObs.pipe(take(1)).subscribe((user) => {
      this.profile = user;
      this._id = this._superAuthService.decodeToken()._id;
      //this.profile!._id = _id;
      this._changeDetectorRef.markForCheck();
      this.type = this.profile?.type || '';
      this.loading = false;
    });
    // Subscribe to chats
    this._chatService.chats$
      .pipe(
        tap((chats) =>
          console.log(
            'ChatsComponent: Received chats update:',
            chats?.length || 0
          )
        ),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe((chats: Chat[] | null) => {
        this.chats = this.filteredChats = chats || [];
        this._changeDetectorRef.markForCheck();
      });

    // Subscribe to selected chat
    this._chatService.chat$
      .pipe(
        tap((chat) =>
          console.log('ChatsComponent: Received chat update:', chat?._id)
        ),
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
  ngOnDestroy(): void {
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
  filterChats(query: string): void {
    // Reset the filter
    if (!query) {
      this.filteredChats = this.chats;
      return;
    }

    this.filteredChats = this.chats.filter((chat) =>
      (chat.contact?.first_name + chat.contact?.last_name!)
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }

  /**
   * Open the new chat sidebar
   */
  openNewChat(): void {
    this.drawerComponent = 'new-chat';
    this.drawerOpened = true;
    // Mark for check
    this._changeDetectorRef.markForCheck();
  }
}
