import { Component, Inject } from '@angular/core';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarRef,
} from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { CardComponent } from '../card/card.component'; // make sure this is standalone
import { MatButtonModule } from '@angular/material/button';
import { Animations } from '../../Animations/public-api';

@Component({
  selector: 'notification-component',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  standalone: true,
  imports: [MatIconModule, MatButtonModule, CardComponent],
  animations: [Animations],
})
export class NotificationPromptComponent {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: any,
    private snackBarRef: MatSnackBarRef<NotificationPromptComponent>
  ) {
  }

  getIcon(type: string): string {
    switch (type) {
      case 'order':
        return 'heroicons_outline:shopping-bag';
      case 'message':
        return 'heroicons_outline:chat-bubble-oval-left-ellipsis';
      case 'info':
        return 'heroicons_outline:light-bulb';
      case 'warn':
        return 'heroicons_solid:x-circle';
      default:
        return 'heroicons_solid:check-circle';
    }
  }

  onAccept() {
    if (this.data.onAccept) this.data.onAccept();
    this.snackBarRef.dismiss();
  }

  onDecline() {
    if (this.data.onDecline) this.data.onDecline();
    this.snackBarRef.dismiss();
  }
}
