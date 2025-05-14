import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationPromptComponent } from './notification.component';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

  openNotification(
    title: string,
    message: string,
    type: string,
    showActions: boolean,
    onAccept: () => void,
    onDecline: () => void,
    duration?: number
  ) {
    this.snackBar.openFromComponent(NotificationPromptComponent, {
      data: {
        title,
        message,
        type,
        showActions,
        onAccept,
        onDecline,
      },
      duration: duration, // Optional: auto-dismiss after specified milliseconds
      verticalPosition: 'top', // Float on top of the screen
      panelClass: ['custom-snackbar'], // Optional: for custom styling
    });
  }
}