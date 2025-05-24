import { TextFieldModule } from '@angular/cdk/text-field';
import {
  DatePipe,
  NgClass,
  NgFor,
  NgIf,
  NgTemplateOutlet,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  inject,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil, filter, take, tap } from 'rxjs';
import { ContactInfoComponent } from '../contact-info/contact-info.component';
import { Chat, Message } from '../../../Models/chat.types';
import { ChatService } from '../chat.service';
import { FuseMediaWatcherService } from '../../../Services/media-watcher/media-watcher.service';
import { UserService } from '../../../Services/user.service';
import { SuperAuthService } from '../../../Services/super-auth-service.service';
@Component({
  selector: 'chat-conversation',
  templateUrl: './conversation.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    MatSidenavModule,
    ContactInfoComponent,
    MatButtonModule,
    RouterLink,
    MatIconModule,
    MatMenuModule,
    NgClass,
    NgTemplateOutlet,
    MatFormFieldModule,
    MatInputModule,
    TextFieldModule,
    DatePipe,
  ],
})
export class ConversationComponent implements OnInit, OnDestroy {
  @ViewChild('messageInput') messageInput: ElementRef;
  chat: Chat | null = null;
  drawerMode: 'over' | 'side' = 'side';
  drawerOpened: boolean = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  myId: string | null = null;
  loading: boolean = true;
  private _inactivityTimeout: any;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _chatService: ChatService,
    private _fuseMediaWatcherService: FuseMediaWatcherService,
    private _ngZone: NgZone,
    private _superAuthService: SuperAuthService
  ) {}

  @HostListener('input')
  @HostListener('ngModelChange')
  private _resizeMessageInput(): void {
    // This doesn't need to trigger Angular's change detection by itself
    this._ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        // Set the height to 'auto' so we can correctly read the scrollHeight
        this.messageInput.nativeElement.style.height = 'auto';

        // Detect the changes so the height is applied
        this._changeDetectorRef.detectChanges();

        // Get the scrollHeight and subtract the vertical padding
        this.messageInput.nativeElement.style.height = `${this.messageInput.nativeElement.scrollHeight}px`;

        // Detect the changes one more time to apply the final height
        this._changeDetectorRef.detectChanges();
      });
    });
  }

  ngOnInit(): void {
    const _id: string = this._superAuthService.decodeToken()._id;
    this.myId = _id;
    this._trackActivity();
    // Subscribe to chat updates
    this._chatService.chat$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((chat: Chat | null) => {
        if (chat) {
          this.chat = chat;
          this.chat.messages = this.chat.messages.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          this._chatService.joinChat(this.chat._id!);
          this._changeDetectorRef.markForCheck();
        }
      });

    // Subscribe to media changes
    this._fuseMediaWatcherService.onMediaChange$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(({ matchingAliases }) => {
        this.drawerMode = matchingAliases.includes('lg') ? 'side' : 'over';
        this._changeDetectorRef.markForCheck();
      });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  openContactInfo(): void {
    // Open the drawer
    this.drawerOpened = true;

    // Mark for check
    this._changeDetectorRef.markForCheck();
  }

  resetChat(): void {
    this._chatService.resetChat();

    // Close the contact info in case it's opened
    this.drawerOpened = false;

    // Mark for check
    this._changeDetectorRef.markForCheck();
  }

  toggleMuteNotifications(): void {
    if (!this.chat?._id || !this.myId) return;

    const userId = this.myId;
    const chatId = this.chat._id as string;

    if (!this.chat.muted) {
      this.chat.muted = new Map<string, boolean>();
    }

    // Toggle the muted state for the current user
    const isMuted = this.chat.muted.get(userId!) ?? false;
    this.chat.muted.set(userId!, !isMuted);

    // Update the chat on the server
    this._chatService
      .updateChat(chatId, { muted: this.chat.muted })
      .subscribe();
  }

  sendMessage(): void {
    const chatId = this.chat?._id;
    const messageContent = this.messageInput?.nativeElement?.value?.trim();

    if (!chatId || !messageContent) return;

    this._chatService.sendMessage(chatId as string, messageContent as string);
    this.messageInput.nativeElement.value = '';
  }
  private _trackActivity() {
    window.addEventListener('mousemove', this._resetInactivityTimer.bind(this));
    window.addEventListener('keydown', this._resetInactivityTimer.bind(this));
  }
  private _resetInactivityTimer() {
    clearTimeout(this._inactivityTimeout);
    if (this.chat?.unreadCount[this.myId!] > 0) {
        this._chatService.markMessagesAsRead(this.chat!._id!);
    }
    this._inactivityTimeout = setTimeout(() => {
    }, 300000); // 5 minutes inactivity
  }
}
