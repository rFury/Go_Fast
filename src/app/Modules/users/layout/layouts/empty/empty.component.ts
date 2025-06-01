
import { Component, inject, OnDestroy, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FuseLoadingBarComponent } from '../../../../../Shared/Components/loading-bar/loading-bar.component';
import { Subject } from 'rxjs';
import { SuperAuthService } from '../../../../../Shared/Services/super-auth-service.service';

@Component({
    selector: 'user-empty-layout',
    templateUrl: './empty.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [RouterOutlet,FuseLoadingBarComponent]
})
export class EmptyLayoutComponent implements OnDestroy
{
    protected isLoggedIn=false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private _authService = inject(SuperAuthService);
    constructor()
    {
        this.isLoggedIn= this._authService.isLoggedIn()==true;
    }

    ngOnDestroy(): void
    {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
