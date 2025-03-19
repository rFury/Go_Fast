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
import { User } from '../../../../../Shared/Models/User.model';
import { UserService } from '../../../../../Shared/Services/user.service';
import { Subject, takeUntil } from 'rxjs';

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

  @Input() showAvatar: boolean = false;
  user!: User;

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _router = inject(Router);
  private _userService = inject(UserService);

   ngOnInit() {
    this.user =  this._userService._user()!;
    console.log("in user component");

    console.log(this.user);
    this._changeDetectorRef.markForCheck();
  }
  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
  updateUserStatus(status: string): void {
    if (!this.user) {
      return;
    }
    this.user.status = status;
    this._userService
      .updateOne({
        ...this.user,
      })
      .subscribe();
  }

  signOut(): void {
    this._router.navigate(['/admin/sign-out']);
  }
}
