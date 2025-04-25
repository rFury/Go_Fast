import { Component, Provider, Renderer2, ViewEncapsulation,Inject, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, provideRouter, Router, RouterOutlet } from '@angular/router';
import { Subject, combineLatest, takeUntil, map, filter } from 'rxjs';
import { ClassyLayoutComponent } from './layout/layouts/vertical/classy/classy.component'
import { FuseConfigService } from '../../Shared/Services/config/config.service';
import { FuseMediaWatcherService } from '../../Shared/Services/media-watcher/media-watcher.service';
import { FusePlatformService } from '../../Shared/Services/platform/platform.service';
import { FuseConfig } from '../../Shared/Services/config/config.types';
import { DOCUMENT } from '@angular/common';
import { EmptyLayoutComponent } from './layout/layouts/empty/empty.component';
import { UserService } from '../../Shared/Services/user.service';

@Component({
  selector: 'app-users',
  encapsulation: ViewEncapsulation.None,
  imports: [ClassyLayoutComponent,EmptyLayoutComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent 
  {
    config!: FuseConfig;
    layout!: string;
    scheme!: 'dark' | 'light';
    theme!: string;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        @Inject(DOCUMENT) private _document: any,
        private _renderer2: Renderer2,
        private _router: Router,
        private _fuseConfigService: FuseConfigService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fusePlatformService: FusePlatformService,
    )
    {
    }

    ngOnInit(): void
    {
        // Set the theme and scheme based on the configuration
        combineLatest([
            this._fuseConfigService.config$,
            this._fuseMediaWatcherService.onMediaQueryChange$(['(prefers-color-scheme: dark)', '(prefers-color-scheme: light)']),
        ]).pipe(
            takeUntil(this._unsubscribeAll),
            map(([config, mql]) =>
            {
                const options = {
                    scheme: config.scheme,
                    theme : config.theme,
                };

                // If the scheme is set to 'auto'...
                if ( config.scheme === 'auto' )
                {
                    // Decide the scheme using the media query
                    options.scheme = mql.breakpoints['(prefers-color-scheme: dark)'] ? 'dark' : 'light';
                }

                return options;
            }),
        ).subscribe((options) =>
        {
            // Store the options
            this.scheme = options.scheme;
            this.theme = options.theme;

            // Update the scheme and theme
            this._updateScheme();
            this._updateTheme();
        });

        // Subscribe to config changes
        this._fuseConfigService.config$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config: FuseConfig) =>
            {
                // Store the config
                this.config = config;

                // Update the layout
                this._updateLayout();
            });

        // Subscribe to NavigationEnd event
        this._router.events.pipe(
            filter(event => event instanceof NavigationEnd),
            takeUntil(this._unsubscribeAll),
        ).subscribe(() =>
        {
            // Update the layout
            this._updateLayout();
        });

        // Set the OS name
        this._renderer2.addClass(this._document.body, this._fusePlatformService.osName);
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
    private _updateLayout(): void
    {
        // Get the current activated route
        let route = this._activatedRoute;
        while ( route.firstChild )
        {
            route = route.firstChild;
        }

        // 1. Set the layout from the config
        this.layout = this.config.layout;

        // 2. Get the query parameter from the current route and
        // set the layout and save the layout to the config
        const layoutFromQueryParam = route.snapshot.queryParamMap.get('layout');
        if ( layoutFromQueryParam )
        {
            this.layout = layoutFromQueryParam;
            if ( this.config )
            {
                this.config.layout = layoutFromQueryParam;
            }
        }

        const paths = route.pathFromRoot;
        paths.forEach((path) =>
        {
            // Check if there is a 'layout' data
            if ( path.routeConfig && path.routeConfig.data && path.routeConfig.data['layout'] )
            {
                // Set the layout
                this.layout = path.routeConfig.data['layout'];
            }
        });
    }

    /**
     * Update the selected scheme
     *
     * @private
     */
    private _updateScheme(): void
    {
        // Remove class names for all schemes
        this._document.body.classList.remove('light', 'dark');

        // Add class name for the currently selected scheme
        this._document.body.classList.add(this.scheme);
    }

    /**
     * Update the selected theme
     *
     * @private
     */
    private _updateTheme(): void
    {
        // Find the class name for the previously selected theme and remove it
        this._document.body.classList.forEach((className: string) =>
        {
            if ( className.startsWith('theme-') )
            {
                this._document.body.classList.remove(className, className.split('-')[1]);
            }
        });

        // Add class name for the currently selected theme
        this._document.body.classList.add(this.theme);
    }
}
