import { Component, inject } from '@angular/core';
import {  RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NotificationService } from './Shared/Components/notification-prompt/notification.service';
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CommonModule,
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private notif = inject(NotificationService);
  title = 'Go_Fast';
  ngOnInit() {
    this.notif.openNotification(
      'Order',
      'This is a test notification',
      'order',
      true,
      () => console.log('Accepted'),
      () => console.log('Declined'),
      100000
    );
  }  
}
