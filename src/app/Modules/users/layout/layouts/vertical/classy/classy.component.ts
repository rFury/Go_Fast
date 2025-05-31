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
import { Subject, takeUntil } from 'rxjs';
import { User } from '../../../../../../Shared/Models/User.model';
import { UserService } from '../../../../../../Shared/Services/user.service';
import { FuseMediaWatcherService } from '../../../../../../Shared/Services/media-watcher/media-watcher.service';
import { FuseNavigationService } from '../../../../../../Shared/Components/navigation/navigation.service';
import { FuseVerticalNavigationComponent } from '../../../../../../Shared/Components/navigation/vertical/vertical.component';
import { FuseNavigationItem } from '../../../../../../Shared/Models/Navigation.model';
import { SuperAuthService } from '../../../../../../Shared/Services/super-auth-service.service';
import { NotificationsComponent } from './common/notifications/notifications.component';
import { UserComponent } from '../../../../../../Shared/Components/user/user.component';
import { FuseLoadingBarComponent } from '../../../../../../Shared/Components/loading-bar/loading-bar.component';
import { SideNavService } from '../../../../../../Shared/Services/sideNav.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationService } from '../../../../../../Shared/Components/notification-prompt/notification.service';
import { FirebaseNotification } from '../../../../../../Shared/Services/firebase.notif.service';
import { ChatService } from '../../../../../../Shared/Components/chat/chat.service';

@Component({
  selector: 'user-classy-layout',
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
  private _cdr = inject(ChangeDetectorRef);
  private _notifService = inject(FirebaseNotification);

  showUser: boolean = false;
  isScreenSmall!: boolean;
  navigation!: FuseNavigationItem[];
  user!: User;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  isLoading: boolean = false;
  email: string = '';
  constructor(
    private _fuseMediaWatcherService: FuseMediaWatcherService,
    private _fuseNavigationService: FuseNavigationService
  ) {}
  async ngOnInit() {
    this.isLoading= true;
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
    const divider: FuseNavigationItem = {
      id: 'divider',
      title: '',
      type: 'divider',
    };
    const chat: FuseNavigationItem = {
      id: 'chat',
      title: 'Chat',
      type: 'basic',
      icon: 'heroicons_outline:chat-bubble-bottom-center-text',
      link: '/chat',
      badge: {
        title: '1',
        classes:
          'bg-indigo-500 text-white rounded-full w-6 flex items-center justify-center',
      },
    };
    this.navigation = [newOrder, Orders, divider, chat];
    this._userService
      .get()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: async (res) => {
          console.log(res);
          this.user = res;
          this._userService.initializeUser(res);
          this.isLoading = false;
          this._userService.updateState('online').subscribe((res) => {
            this._cdr.markForCheck();
          });
        },
        error: (err) => console.error(err),
      });

    this._fuseMediaWatcherService.onMediaChange$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(({ matchingAliases }) => {
        this.isScreenSmall = !matchingAliases.includes('md');
        this._sideNavService.setOpen(!this.isScreenSmall);
      });
    this._notifService.requestPermission();
  }

  ngOnDestroy(): void {
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
