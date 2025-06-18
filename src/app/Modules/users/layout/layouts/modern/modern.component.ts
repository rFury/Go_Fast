import { NgIf } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';
import { FuseLoadingBarComponent } from '../../../../../Shared/Components/loading-bar/loading-bar.component';
import { FuseNavigationService } from '../../../../../Shared/Components/navigation/navigation.service';
import { FuseVerticalNavigationComponent } from '../../../../../Shared/Components/navigation/vertical/vertical.component';
import { NotificationsComponent } from '../../../../../Shared/Components/notifications/notifications.component';
import { UserComponent } from '../../../../../Shared/Components/user/user.component';
import { FuseMediaWatcherService } from '../../../../../Shared/Services/media-watcher/media-watcher.service';
import { FuseHorizontalNavigationComponent } from '../../../../../Shared/Components/navigation/horizontal/horizontal.component';
import { SearchComponent } from '../../../../../Shared/Components/search/search.component';
import { FuseNavigationItem } from '../../../../../Shared/Models/Navigation.model';
import { SuperAuthService } from '../../../../../Shared/Services/super-auth-service.service';

@Component({
    selector     : 'user-modern-layout',
    templateUrl  : './modern.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone   : true,
    imports      : [FuseLoadingBarComponent, NgIf, FuseVerticalNavigationComponent, FuseHorizontalNavigationComponent, MatButtonModule, MatIconModule, SearchComponent, NotificationsComponent, UserComponent, RouterOutlet],
})
export class ModernLayoutComponent implements OnInit, OnDestroy
{
    isScreenSmall: boolean;
    navigation: FuseNavigationItem[];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    isloggedIn=false;
    private _superAuthService=inject(SuperAuthService)

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService,
    )
    {
    }
    get currentYear(): number
    {
        return new Date().getFullYear();
    }
    ngOnInit(): void
    {
        if(this._superAuthService.isLoggedIn()){
            this.isloggedIn=true;
        }

                this.navigation = [
                    {
                        id:'home',
                        title:'Home',
                        type:'basic',
                        icon:'heroicons_outline:home',
                        link:'main/home'
                    },{
                        id:'contact',
                        title:'Contact Us',
                        type:'basic',
                        icon:'heroicons_outline:envelope',
                        link:'main/contact'
                    },{
                        id:'track',
                        title:'Track Order',
                        type:'basic',
                        icon:'heroicons_outline:truck',
                        link:'main/track'
                    }
                ];

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
