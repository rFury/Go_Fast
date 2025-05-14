import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { MatIcon } from '@angular/material/icon';
import { CardComponent } from "../card/card.component";
import { Animations } from '../../Animations/public-api';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'notification-component',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  standalone: true,
  animations:Animations,
  imports: [MatIcon, CardComponent,MatButtonModule],
})
export class NotificationPromptComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {}

  getIcon(type: string): string {
    switch (type) {
      case 'order':
        return 'heroicons_outline:shopping-bag';
      case 'message':
        return 'heroicons_outline:chat-bubble-oval-left-ellipsis';
      case 'info':
        return 'heroicons_outline:light-bulb';
      case 'error':
      case 'warn': // Handle 'warn' as an alias for 'error'
        return 'heroicons_solid:x-circle';
      default:
        return 'heroicons_solid:check-circle'; // Fallback icon
    }
  }

  onAccept() {
    if (this.data.onAccept) this.data.onAccept();
  }

  onDecline() {
    if (this.data.onDecline) this.data.onDecline();
  }
}