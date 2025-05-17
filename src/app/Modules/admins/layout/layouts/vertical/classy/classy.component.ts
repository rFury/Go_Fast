import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterOutlet } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { User } from '../../../../../../Shared/Models/User.model';
import { MenuService } from '../../../../../../Shared/Services/menu.service';
import { UserService } from '../../../../../../Shared/Services/user.service';
import { FuseMediaWatcherService } from '../../../../../../Shared/Services/media-watcher/media-watcher.service';
import {
  Navigation,
  NavigationService,
} from '../../../../../../Shared/Services/navigation.service';
import { FuseNavigationService } from '../../../../../../Shared/Components/navigation/navigation.service';
import { FuseVerticalNavigationComponent } from '../../../../../../Shared/Components/navigation/vertical/vertical.component';
import { FuseNavigationItem } from '../../../../../../Shared/Models/Navigation.model';
import { SuperAuthService } from '../../../../../../Shared/Services/super-auth-service.service';
import { NotificationsComponent } from './common/notifications/notifications.component';
import { ShortcutsComponent } from './common/shortcuts/shortcuts.component';
import { SearchComponent } from './common/search/search.component';
import { FuseLoadingBarComponent } from '../../../../../../Shared/Components/loading-bar/loading-bar.component';
import { SideNavService } from '../../../../../../Shared/Services/sideNav.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LocationService } from '../../../../../../Shared/Services/agent-location.service';
import { LocationWebService } from '../../../../../../Shared/Services/location.service';
import { Agent } from '../../../../../../Shared/Models/Agent.model';
import { NgZone } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { UserComponent } from '../../../../../../Shared/Components/user/user.component';
import { FirebaseNotification } from '../../../../../../Shared/Services/firebase.notif.service';

@Component({
  selector: 'classy-layout',
  templateUrl: './classy.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [
    FuseLoadingBarComponent,
    MatProgressSpinnerModule,
    FuseVerticalNavigationComponent,
    MatIconModule,
    MatButtonModule,
    RouterOutlet,
    NotificationsComponent,
    ShortcutsComponent,
    SearchComponent,
    UserComponent,
  ],
  standalone: true,
})
export class ClassyLayoutComponent implements OnInit, OnDestroy {
  protected _authService = inject(SuperAuthService);
  protected _userService = inject(UserService);
  protected _sideNavService = inject(SideNavService);
  private _cdr = inject(ChangeDetectorRef);
  protected _locationService = inject(LocationService);
  protected _locationWebService = inject(LocationWebService);
  private _ngZone = inject(NgZone);
  private _notifService = inject(FirebaseNotification);
  navigationAppearance: 'default' | 'dense' = 'default';
  private _positionInterval: any;
  showUser: boolean = false;
  isScreenSmall!: boolean;
  navigation!: FuseNavigationItem[];
  user!: User | Agent;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  isLoading: boolean = true;
  email: string = '';
  constructor(
    private menuService: MenuService,
    private _fuseMediaWatcherService: FuseMediaWatcherService,
    private _fuseNavigationService: FuseNavigationService
  ) {}
  Admin: boolean = false;
  Agent: boolean = false;

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent) {
    // Synchronous “offline” ping so the browser doesn’t cancel it
    const url = `${this._userService.endpointUser}/status`;
    const data = JSON.stringify({ status: 'not-visible' });
    navigator.sendBeacon(url, data);
  }
  async ngOnInit() {
    this.isLoading = true;

    const admin =
      this._authService.decodeToken().type === 'user' ||
      this._authService.decodeToken().type === 'super';
    const agent = this._authService.decodeToken().type === 'agent';
    this.Admin = admin;
    this.Agent = agent;

    if (admin) {
      this._userService
        .get()
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe({
          next: (res) => {
            this._userService.initializeUser(res);
            this.user = res;
            this._userService.updateState('online').subscribe((res) => {
              this._cdr.markForCheck();
            });
          },
          error: (err) => console.error(err),
        });
    } else if (agent) {
      this._userService
        .get()
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe({
          next: async (res) => {
            this.user = res;
            this._userService.initializeUser(res);
            this.isLoading = false;
            this._userService.updateState('online').subscribe((res) => {
              this._cdr.markForCheck();
            });
          },
          error: (err) => console.error(err),
        });
    } else {
      console.log('error');
    }

    this.menuService.getMenu().subscribe({
      next: (data) => {
        this.navigation = data.menu;
        this._userService.features.set(data.features);
        console.log(this._userService.features());
        console.log('navigation', this.navigation);
        console.log('feature', data.features);
      },
      error: () => {},
      complete: () => {
        this.isLoading = false;
      },
    });

    this._fuseMediaWatcherService.onMediaChange$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(({ matchingAliases }) => {
        this.isScreenSmall = !matchingAliases.includes('md');
        this._sideNavService.setOpen(!this.isScreenSmall);
        if(agent){
          this.navigationAppearance = this.isScreenSmall ? 'default' : 'dense';
        }
      });

      this._notifService.requestPermission();
  }

  ngOnDestroy(): void {
    // Cleanup interval
    if (this._positionInterval) {
      clearInterval(this._positionInterval);
    }
    // Unregister agent
    this._locationService.unsubscribeFromAgent(this.user?._id!);
    this._locationService.diconnect();

    // Existing cleanup
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  toggleNavigation(name: string): void {
    // Get the navigation
    const navigation =
      this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(
        name
      );

    if (navigation) {
      navigation.toggle();
      if (!this.isScreenSmall) {
        this._sideNavService.toggle();
      }
    }
  }
  toggleNavigationAppearance(): void
  {
      this.navigationAppearance = (this.navigationAppearance === 'default' ? 'dense' : 'default');
  }
}
