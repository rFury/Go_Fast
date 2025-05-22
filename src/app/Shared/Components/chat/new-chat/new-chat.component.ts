import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawer } from '@angular/material/sidenav';
import { Subject, takeUntil } from 'rxjs';
import { ChatService } from '../chat.service';
import { User } from '../../../Models/User.model';


@Component({
    selector       : 'chat-new-chat',
    templateUrl    : './new-chat.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [MatButtonModule, MatIconModule],
})
export class NewChatComponent implements OnInit, OnDestroy
{
    @Input() drawer: MatDrawer;
    contacts: User[] = [];
    private _unsubscribeAll: Subject<any> = new Subject<any>();


    constructor(private _chatService: ChatService)
    {
    }

    ngOnInit(): void
    {
        // Contacts
        this._chatService.contacts$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((contacts: User[] | null) =>
            {
                this.contacts = contacts || [];
            });
    }


    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    createChat(contact: User): void
    {
        this._chatService.createChat(contact).subscribe();
    }
}
