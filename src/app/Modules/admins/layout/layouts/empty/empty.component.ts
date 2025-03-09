
import { Component, OnDestroy, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FuseLoadingBarComponent } from '../../../../../Shared/Components/loading-bar/loading-bar.component';
import { Subject } from 'rxjs';

@Component({
    selector: 'empty-layout',
    templateUrl: './empty.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [RouterOutlet]
})
export class EmptyLayoutComponent implements OnDestroy
{
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor()
    {
    }
    ngOnDestroy(): void
    {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
