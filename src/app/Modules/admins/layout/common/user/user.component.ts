import { BooleanInput } from '@angular/cdk/coercion';
import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { User } from '../../../../../Shared/Models/User.model';
import { UserService } from '../../../../../Shared/Services/user.service';

@Component({
  selector: 'user',
  templateUrl: './user.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'user',
  imports: [
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    NgClass,
    MatDividerModule,
  ],
})
export class UserComponent implements OnInit, OnDestroy {
  static ngAcceptInputType_showAvatar: BooleanInput;
  @Input() showAvatar: boolean = true;
  private _cdr = inject(ChangeDetectorRef);
  private _userService = inject(UserService);
  private _router=inject(Router);
  user:User | null = this._userService._user();

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  ngOnInit(): void {
    console.log(this.user);
    this._cdr.markForCheck();
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  updateUserStatus(status: string): void {
    // Return if user is not available
    if (!this.user) {
      return;
    }
    this.user.status = status;
    // Update the user
    this._userService
      .updateState(this.user.status)
      .subscribe();
      console.log(this.user);

  }

  /**
   * Sign out
   */
  signOut(): void {
    this._router.navigate(['/admin/sign-out']);
  }
}
