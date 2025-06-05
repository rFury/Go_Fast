import {
  ChangeDetectorRef,
  Component,
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
import { FuseNavigationService } from '../../../../../../Shared/Components/navigation/navigation.service';
import { FuseVerticalNavigationComponent } from '../../../../../../Shared/Components/navigation/vertical/vertical.component';
import { FuseNavigationItem } from '../../../../../../Shared/Models/Navigation.model';
import { SuperAuthService } from '../../../../../../Shared/Services/super-auth-service.service';
import { NotificationsComponent } from '../../../../../../Shared/Components/notifications/notifications.component';
import { ShortcutsComponent } from './common/shortcuts/shortcuts.component';
import { SearchComponent } from './common/search/search.component';
import { FuseLoadingBarComponent } from '../../../../../../Shared/Components/loading-bar/loading-bar.component';
import { SideNavService } from '../../../../../../Shared/Services/sideNav.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LocationWebService } from '../../../../../../Shared/Services/location.service';
import { Agent } from '../../../../../../Shared/Models/Agent.model';
import { UserComponent } from '../../../../../../Shared/Components/user/user.component';
import { FirebaseNotification } from '../../../../../../Shared/Services/firebase.notif.service';
import { ChatService } from '../../../../../../Shared/Components/chat/chat.service';
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
  private menuService = inject(MenuService);
  private _cdr = inject(ChangeDetectorRef);
  protected _locationWebService = inject(LocationWebService);
  private _notifService = inject(FirebaseNotification);
  private _chatService = inject(ChatService);
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
    private _fuseMediaWatcherService: FuseMediaWatcherService,
    private _fuseNavigationService: FuseNavigationService
  ) {}
  Admin: boolean = false;
  Agent: boolean = false;

  async ngOnInit() {
    const admin =
      this._authService.decodeToken().type === 'user' ||
      this._authService.decodeToken().type === 'super';
    const agent = this._authService.decodeToken().type === 'agent';
    this.Admin = admin;
    this.Agent = agent;
    this._userService
      .get()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: async (res) => {
          this.user = res;
          this._userService.initializeUser(res);
          this._userService.updateState('online').subscribe((res) => {
            this.isLoading = false;
            this._cdr.markForCheck();
          });
        },
        error: (err) => console.error(err),
      });

    this.menuService.initializeMenuSocket();
    this.menuService.getMenu().subscribe({
      next: (data) => {
        this.navigation = data.menu;
        this._userService.features.set(data.features);
        console.log(this._userService.features());
        console.log('navigation', this.navigation);
        console.log('feature', data.features);
        this.menuService.menu = data;
        this.menuService.menu$
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((menu) => {
            this.navigation = menu.menu;
            this._userService.features.set(menu.features);
          });
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
        if (agent) {
          this.navigationAppearance = this.isScreenSmall ? 'default' : 'dense';
        }
      });
  }

  ngOnDestroy(): void {
    // Cleanup interval
    if (this._positionInterval) {
      clearInterval(this._positionInterval);
    }

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
  toggleNavigationAppearance(): void {
    this.navigationAppearance =
      this.navigationAppearance === 'default' ? 'dense' : 'default';
  }
}
