import { BooleanInput } from '@angular/cdk/coercion';
import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { User } from '../../../../Shared/Models/User.model';
import { UserService } from '../../../../Shared/Services/user.service';

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
  private _router = inject(Router);
  user: User | null = this._userService._user();

  constructor(){
    effect(() => {
      this.user = this._userService.user();
      this._cdr.markForCheck();
    });
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
  }
  updateUserStatus(status: string): void {
    console.log("hello");
    
    if (!this.user) return;
      this._userService.updateState(status).subscribe({
        error: () => {
          this._userService._user.update(u => ({ ...u!, status:status }))
          this._cdr.detectChanges();
        },
      });
  }

  signOut(): void {
    this._router.navigate(['/admin/sign-out']);
  }
}
