import { Inject, Injectable } from '@angular/core';
import { FUSE_CONFIG } from './config.constants';
import { merge } from 'lodash-es';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FuseConfigService {
    private _config: BehaviorSubject<any>;

    constructor(
        @Inject(FUSE_CONFIG) config: any
    ) {
        this._config = new BehaviorSubject<any>(config);
    }


    set config(value: any) {
        const config = merge({}, this._config.getValue(), value);
        this._config.next(config);
    }

    get config$(): Observable<any> {
        return this._config.asObservable();
    }

    reset(): void {
        this._config.next(this._config.getValue());
    }
}
