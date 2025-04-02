import { Injectable } from '@angular/core';
import { takeUntil } from 'rxjs';
import { FuseMediaWatcherService } from './media-watcher/media-watcher.service';

@Injectable({
  providedIn: 'root',
})
export class SideNavService {

    private open:boolean = false;


    setOpen(value:boolean) {
        this.open = value;
    }

    getOpen() {
        return this.open;
    }

    toggle(){
        this.open = !this.open;
    }
}
