
import { Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FuseLoadingBarComponent } from '../../../../../Shared/Components/loading-bar/loading-bar.component';
import { Subject } from 'rxjs';
import { SuperAuthService } from '../../../../../Shared/Services/super-auth-service.service';
import { FirebaseNotification } from '../../../../../Shared/Services/firebase.notif.service';

@Component({
    selector: 'user-empty-layout',
    templateUrl: './empty.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [RouterOutlet,FuseLoadingBarComponent]
})
export class EmptyLayoutComponent implements OnDestroy ,OnInit
{
    protected isLoggedIn=false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private _authService = inject(SuperAuthService);
    private firebase = inject(FirebaseNotification);
    constructor()
    {
        this.isLoggedIn= this._authService.isLoggedIn()==true;
    }
    ngOnInit(){
        if(!this.firebase.connected && this.isLoggedIn){
            this.firebase.connect();
        }
    }

    ngOnDestroy(): void
    {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
