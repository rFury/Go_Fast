
import { Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
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

@Component({
    selector: 'classy-layout',
    templateUrl: './classy.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [ FuseVerticalNavigationComponent,  MatIconModule, MatButtonModule,     RouterOutlet],
    standalone: true,
})
export class ClassyLayoutComponent implements OnInit, OnDestroy
{
    protected _authService=inject(SuperAuthService);
    isScreenSmall!: boolean;
    navigation!: FuseNavigationItem[];
    user!: User;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    isLoading: boolean = true;

    /**
     * Constructor
     */
    constructor(
        private menuService: MenuService,
        private _router: Router,
        private _navigationService: NavigationService,
        private _userService: UserService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService,
    )
    {
    }
    ngOnInit(): void
    {
        /*this.menuService.getMenu().subscribe({
            next: (data) => {
                this.navigation = data.menu;
                console.log('this.navigation', this.navigation)
            },
            error: () => {},
        });*/


        // Subscribe to the user service
        /*this._userService.user$
            .pipe((takeUntil(this._unsubscribeAll)))
            .subscribe((user: User | null) =>
            {
                if(user != null){
                    this.user = user;
                }
            });*/

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) =>
            {
                // Check if the screen is small
                this.isScreenSmall = !matchingAliases.includes('md');
            });
    }


    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle navigation
     *
     * @param name
     */
    toggleNavigation(name: string): void
    {
        // Get the navigation
        const navigation = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(name);

        if ( navigation )
        {
            // Toggle the opened status
            navigation.toggle();
        }
    }
}
