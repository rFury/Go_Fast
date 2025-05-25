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
import { Subject, takeUntil } from 'rxjs';
import { ContactInfoComponent } from '../contact-info/contact-info.component';
import { Chat } from '../../../Models/chat.types';
import { ChatService } from '../chat.service';
import { FuseMediaWatcherService } from '../../../Services/media-watcher/media-watcher.service';
import { SuperAuthService } from '../../../Services/super-auth-service.service';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
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
    PickerModule,
  ],
  styles: [
    `
      /* Add this CSS to your component's styles or global styles */

      /* Fix emoji picker display issues */
      emoji-mart {
        .emoji-mart-bar {
          border: none !important;
        }

        .emoji-mart-emoji {
          cursor: pointer !important;
        }

        /* Ensure emoji images load properly */
        .emoji-mart-emoji img {
          width: 100% !important;
          height: 100% !important;
          display: block !important;
        }

        /* Fix for missing or broken emoji images */
        .emoji-mart-emoji span {
          font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
            'Noto Color Emoji', sans-serif !important;
          font-size: 24px !important;
          line-height: 1 !important;
        }

        /* Dark mode compatibility */
        &.emoji-mart-dark {
          background: #2d3748 !important;
          border: 1px solid #4a5568 !important;
        }
      }

      /* Alternative: Force native emoji display if sheet images fail */
      .emoji-mart-emoji img {
        display: none !important;
      }

      .emoji-mart-emoji span {
        display: inline-block !important;
        font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
          'Noto Color Emoji', sans-serif !important;
        font-size: 24px !important;
        line-height: 1 !important;
      }

      /* Fix positioning issues */
      .emoji-mart-bar:first-child {
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
      }

      .emoji-mart-scroll {
        max-height: 200px;
        overflow-y: auto;
      }
    `,
  ],
})
export class ConversationComponent implements OnInit, OnDestroy {
  @ViewChild('messageInput') messageInput: ElementRef;
  chat: Chat | null = null;
  drawerMode: 'over' | 'side' = 'side';
  drawerOpened: boolean = false;
  joinedChat: boolean = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  myId: string | null = null;
  loading: boolean = true;
  private _inactivityTimeout: any;
  showEmojiPicker: boolean = false; // Add this property
  emojiTitle = 'Choose an emoji';
  emojiBackgroundImageFn = (set: string, sheetSize: number) => {
    // Option A: Use CDN (recommended)
    return `https://cdn.jsdelivr.net/npm/emoji-datasource-${set}@15.0.1/img/${set}/sheets-256/${sheetSize}.png`;

    // Option B: If you have local assets, ensure the path is correct
    // return `/assets/emoji-sheets/${set}-${sheetSize}.png`;
  };

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

  scrollToBottom(): void {
    const textarea = this.messageInput?.nativeElement;
    if (textarea) {
      textarea.scrollTop = textarea.scrollHeight;
    }
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
          if (!this.joinedChat) {
            this._chatService.joinChat(this.chat._id!);
            this.joinedChat = true;
          }
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
    this._chatService.leaveChat(this.chat?._id!);
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

    this._chatService.sendMessage(
      chatId as string,
      this.myId as string,
      messageContent as string
    );
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
    this._inactivityTimeout = setTimeout(() => {}, 300000); // 5 minutes inactivity
  }
  toggleEmojiPicker(): void {
    this.showEmojiPicker = !this.showEmojiPicker;
    this._changeDetectorRef.markForCheck();
  }
  addEmoji(event: any): void {
    const emoji = event.emoji.native; // Get the emoji character
    const textarea = this.messageInput.nativeElement;
    const start = textarea.selectionStart; // Cursor start position
    const end = textarea.selectionEnd; // Cursor end position
    const textBefore = textarea.value.substring(0, start);
    const textAfter = textarea.value.substring(end);
    textarea.value = textBefore + emoji + textAfter; // Insert emoji
    textarea.selectionStart = textarea.selectionEnd = start + emoji.length; // Move cursor after emoji
    this._resizeMessageInput(); // Adjust textarea height
    this.showEmojiPicker = false; // Hide picker after selection
    this._changeDetectorRef.markForCheck();
    textarea.focus();
  }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('emoji-mart') && !target.closest('[mat-icon-button]')) {
      this.showEmojiPicker = false;
      this._changeDetectorRef.markForCheck();
    }
  }
}
