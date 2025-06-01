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
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from '../../Services/user.service';
import { User } from '../../Models/User.model';
import { Agent } from '../../Models/Agent.model';
import { Client } from '../../Models/Client.model';

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
    RouterLink
  ],
})
export class UserComponent implements OnInit, OnDestroy {
  static ngAcceptInputType_showAvatar: BooleanInput;
  @Input() showAvatar: boolean = true;
  private _cdr = inject(ChangeDetectorRef);
  private _userService = inject(UserService);
  private _router = inject(Router);
  user: User | Agent | Client | null = this._userService._user();
  link='/settings';
  constructor(){
      this.user = this._userService.user();
      console.log(this.user);
      if(this.user?.type === 'super' || this.user?.type === 'user'){
        this.link='/admin/settings';
      }else if(this.user?.type === 'agent'){
        this.link='/admin/agents/settings';
      }  
      this._cdr.markForCheck();
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
    this._router.navigate(['/sign-out']);
  }
}
