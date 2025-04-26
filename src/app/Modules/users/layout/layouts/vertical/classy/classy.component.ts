
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {  Router, RouterOutlet } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { User } from '../../../../../../Shared/Models/User.model';
import { MenuService } from '../../../../../../Shared/Services/menu.service';
import { UserService } from '../../../../../../Shared/Services/user.service';
import { FuseMediaWatcherService } from '../../../../../../Shared/Services/media-watcher/media-watcher.service';
import { Navigation, NavigationService } from '../../../../../../Shared/Services/navigation.service';
import { FuseNavigationService } from '../../../../../../Shared/Components/navigation/navigation.service';
import { FuseVerticalNavigationComponent } from '../../../../../../Shared/Components/navigation/vertical/vertical.component';
import { FuseNavigationItem } from '../../../../../../Shared/Models/Navigation.model';
import { SuperAuthService } from '../../../../../../Shared/Services/super-auth-service.service';
import { NotificationsComponent } from "./common/notifications/notifications.component";
import { UserComponent } from "./common/user/user.component";
import { FuseLoadingBarComponent } from '../../../../../../Shared/Components/loading-bar/loading-bar.component';
import { SideNavService } from '../../../../../../Shared/Services/sideNav.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@Component({
    selector: 'user-classy-layout',
    templateUrl: './classy.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [FuseLoadingBarComponent,MatProgressSpinnerModule, FuseVerticalNavigationComponent, MatIconModule, MatButtonModule, RouterOutlet, NotificationsComponent, UserComponent],
    standalone: true,
})
export class ClassyLayoutComponent implements OnInit, OnDestroy
{
    protected _authService=inject(SuperAuthService);
    protected _userService=inject(UserService);
    protected _sideNavService=inject(SideNavService);
    private _cdr = inject(ChangeDetectorRef);
    showUser:boolean = false;
    isScreenSmall!: boolean;
    navigation!: FuseNavigationItem[];
    user!: User;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    isLoading: boolean = true;
    email : string = "";
    constructor(
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService,
    )
    {
    }

    @HostListener('window:beforeunload', ['$event'])
    onBeforeUnload(event: BeforeUnloadEvent) {
      const url = `${this._userService.endpointUser}/status`;
      const data = JSON.stringify({ status: 'not-visible' });
      navigator.sendBeacon(url, data);
    }
    async ngOnInit()
    {
        this.isLoading=false;

        console.log(this._authService.getToken());
        const Orders:FuseNavigationItem={
            id: 'orders',
            title: 'Orders',
            type: 'basic',
            icon: 'heroicons_outline:shopping-cart',
            link: '/orders'
        }
        const newOrder:FuseNavigationItem={
            id: 'new-order',
            title: 'New Order',
            type: 'basic',
            icon: 'heroicons_outline:plus',
            link: '/new-order'
        }
        this.navigation = [newOrder,Orders]

        this._userService.get().subscribe({
            next: (res) => {
              this._userService.initializeUser(res);
              this.showUser = true;
              this.user = res;
              this._userService.updateState('online').subscribe(
                (res) => {
                    this._cdr.markForCheck();
                }
              );
            },
            error: (err) => console.error(err)
          });

        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) =>
            {
                this.isScreenSmall = !matchingAliases.includes('md');
                this._sideNavService.setOpen(!this.isScreenSmall);
            });
    }

    ngOnDestroy(): void
    {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    toggleNavigation(name: string): void
    {
        // Get the navigation
        const navigation = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(name);

        if ( navigation )
        {
            navigation.toggle();
            if(!this.isScreenSmall){
                this._sideNavService.toggle();
            }

        }
    }
}
