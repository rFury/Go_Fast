import {
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
import { RouterOutlet } from '@angular/router';
import { Subject, takeUntil, tap } from 'rxjs';
import { User } from '../../../../../Shared/Models/User.model';
import { UserService } from '../../../../../Shared/Services/user.service';
import { FuseMediaWatcherService } from '../../../../../Shared/Services/media-watcher/media-watcher.service';
import { FuseNavigationService } from '../../../../../Shared/Components/navigation/navigation.service';
import { FuseVerticalNavigationComponent } from '../../../../../Shared/Components/navigation/vertical/vertical.component';
import { FuseNavigationItem } from '../../../../../Shared/Models/Navigation.model';
import { SuperAuthService } from '../../../../../Shared/Services/super-auth-service.service';
import { NotificationsComponent } from './common/notifications/notifications.component';
import { UserComponent } from './common/user/user.component';
import { FuseLoadingBarComponent } from '../../../../../Shared/Components/loading-bar/loading-bar.component';
import { SideNavService } from '../../../../../Shared/Services/sideNav.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LocationService } from '../../../../../Shared/Services/agent-location.service';
import { Geolocation } from '@capacitor/geolocation';
import { LocationWebService } from '../../../../../Shared/Services/location.service';

@Component({
  selector: 'agent-classy-layout',
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
    UserComponent,
  ],
  standalone: true,
})
export class ClassyLayoutComponent implements OnInit, OnDestroy {
  protected _authService = inject(SuperAuthService);
  protected _userService = inject(UserService);
  protected _sideNavService = inject(SideNavService);
  protected _locationService = inject(LocationService);
  protected _locationWebService = inject(LocationWebService);
  private _positionInterval: any;
  showUser: boolean = false;
  isScreenSmall!: boolean;
  navigation!: FuseNavigationItem[];
  user!: User;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  isLoading: boolean = true;
  email: string = '';
  error: boolean;
  position: [number, number];
  constructor(
    private _fuseMediaWatcherService: FuseMediaWatcherService,
    private _fuseNavigationService: FuseNavigationService
  ) {}

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent) {
    const url = `${this._userService.endpointUser}/status`;
    const data = JSON.stringify({ status: 'not-visible' });
    navigator.sendBeacon(url, data);
  }
  async ngOnInit() {
    this.isLoading = false;

    console.log(this._authService.getToken());
    const Orders: FuseNavigationItem = {
      id: 'orders',
      title: 'Orders',
      type: 'basic',
      icon: 'heroicons_outline:shopping-cart',
      link: '/orders',
    };
    const newOrder: FuseNavigationItem = {
      id: 'new-order',
      title: 'New Order',
      type: 'basic',
      icon: 'heroicons_outline:plus',
      link: '/new-order',
    };
    this.navigation = [newOrder, Orders];

    this._userService
      .get()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: async (res) => {
          this.user = res;
          this._userService.initializeUser(res);
          this.isLoading = false;

          // Register agent with error handling
          try {
            await this._locationService.registerAgent(this.user._id!);

            // Start position updates with cleanup
            this._positionInterval = setInterval(async () => {
              try {
                const pos = await this._locationWebService.getCurrentPosition();
                this._locationService.sendAgentLocation(this.user._id!, pos);
              } catch (error) {
                console.error('Position update error:', error);
              }
            }, 3000);
          } catch (error) {
            console.error('Agent registration failed:', error);
          }
        },
        error: (err) => console.error(err),
      });

    this._fuseMediaWatcherService.onMediaChange$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(({ matchingAliases }) => {
        this.isScreenSmall = !matchingAliases.includes('md');
        this._sideNavService.setOpen(!this.isScreenSmall);
      });
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
}
