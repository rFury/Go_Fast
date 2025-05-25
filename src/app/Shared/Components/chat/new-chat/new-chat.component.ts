import { NgFor, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawer } from '@angular/material/sidenav';
import { Subject, takeUntil } from 'rxjs';
import { ChatService } from '../chat.service';
import { User } from '../../../Models/User.model';
import { Chat } from '../../../Models/chat.types';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'chat-new-chat',
  templateUrl: './new-chat.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
})
export class NewChatComponent implements OnInit, OnDestroy {
  @Input() drawer: MatDrawer;
  contacts: User[] = [];
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _chatService: ChatService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Contacts
    this._chatService.contacts$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((contacts: User[] | null) => {
        this.contacts =
          contacts?.sort((a, b) =>
            a.first_name!.localeCompare(b.first_name!)
          ) || [];
      });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  createChat(contact: User): void {
    this._chatService.createChat(contact).subscribe({
      next: (chat: Chat | string) => {
        this.drawer.close();
        const currentUrl = this.router.url;
        let obj = currentUrl.split('/');
        let id = '';
        if(typeof chat === 'object'){
            id = chat._id!;
        }else{
            id = chat;
        }
        if(obj[obj.length - 1] === 'chat'){
            this.router.navigateByUrl(this.router.url + '/' + id);
        }
        else{
            obj[obj.length - 1] = id;
            this.router.navigateByUrl(obj.join('/'));
        }
        this._chatService.joinChat(id);
      },
      error: (error: any) => {
        console.error('error creating chat', error);
      },
    });
  }
}
