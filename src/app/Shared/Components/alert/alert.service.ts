import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable({providedIn: 'root'})
export class AlertService
{
    private readonly _onDismiss: ReplaySubject<string> = new ReplaySubject<string>(1);
    private readonly _onShow: ReplaySubject<string> = new ReplaySubject<string>(1);

    constructor()
    {
    }


    get onDismiss(): Observable<any>
    {
        return this._onDismiss.asObservable();
    }

    get onShow(): Observable<any>
    {
        return this._onShow.asObservable();
    }
    dismiss(name: string): void
    {
        // Return if the name is not provided
        if ( !name )
        {
            return;
        }

        // Execute the observable
        this._onDismiss.next(name);
    }
    show(name: string): void
    {
        // Return if the name is not provided
        if ( !name )
        {
            return;
        }

        // Execute the observable
        this._onShow.next(name);
    }

}
