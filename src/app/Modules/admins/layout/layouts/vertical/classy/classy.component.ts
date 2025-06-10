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
import { NotificationsService } from '../../../../../../Shared/Components/notifications/notifications.service';
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
  private firebase = inject(FirebaseNotification);
  private _chatService = inject(ChatService);
  private _notificationsService = inject(NotificationsService);
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
  _id: string = '';
  
  async ngOnInit() {
     this._id = this._authService.decodeToken()._id;
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
        this.processMenuItems(data.menu);
        console.log(data.menu);
        
        this.navigation = data.menu;
        this._userService.features.set(data.features);
        console.log(this._userService.features());
        console.log('navigation', this.navigation);
        console.log('feature', data.features);
        this.menuService.menu = data;
        this.menuService.menu$
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((menu) => {
            this.processMenuItems(menu.menu);
            this.navigation = menu.menu;
            this._userService.features.set(menu.features);
          });
      },
      error: () => {},
      complete: () => {
        this.isLoading = false;
        this._chatService.unreadCount$
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((count) => {
            const parent = this.navigation[0];

            if (!parent.children) return;

            const index = parent.children.findIndex(
              (item) => item.id === '682f0adeb8f63a9874a5e805'
            );

            if (index === -1) return;

            const updatedChat = {
              ...parent.children[index],
              ...(count > 0
                ? {
                    badge: {
                      title: count.toString(),
                      classes:
                        'bg-indigo-500 text-white rounded-full w-6 flex items-center justify-center',
                    },
                  }
                : {
                    badge: undefined,
                  }),
            };

            const updatedChildren = [...parent.children];
            updatedChildren.splice(index, 1, updatedChat);

            const updatedNavigation = [...this.navigation];
            updatedNavigation[0] = {
              ...parent,
              children: updatedChildren,
            };

            this.navigation = updatedNavigation;
            this._cdr.markForCheck();
          });
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
    if (this.Agent) {
      this.firebase.connect();
    }
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
  processMenuItems(items: FuseNavigationItem[]){
    console.log('Processing menu items');
    items.forEach((item: FuseNavigationItem) => {
      // If the item is a group or collapsable, recursively process its children
      if (item.type === 'group' || item.type === 'collapsable') {
        if (item.children) {
          this.processMenuItems(item.children);
        }
      }
      // If the item is a basic item with a badge and is not the excluded ID
      else if (item.type === 'basic') {
        if (
          item.badge?.title &&
          item.badge.classes &&
          item.id !== '682f0adeb8f63a9874a5e805'
        ) {
          console.log('Assigned function to:', item.id);
          console.log('_id',this._id);
          
          if(item.badge.readBy?.includes(this._id)){
            item.badge={};
          }else{
          item.function = (clickedItem: FuseNavigationItem) => {
            this.menuService.markAsRead(clickedItem.id!);
          };
        }
        }
      }
    });
  };
  
}
