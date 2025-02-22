import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Notification } from '../../Models/notification.model';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule} from '@angular/common';
import { MatIconModule} from '@angular/material/icon';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-notifications',
  imports: [
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    CommonModule,
    MatIconModule
  ],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent {
  readonly dialogRef = inject(MatDialogRef<NotificationsComponent>);
  onNoClick(): void {
    this.dialogRef.close();
  }

  notifications: Notification[] = [
    {
      id: 1,
      avatar: "logo-white.png",
      author: "Bonnie Green",
      content: "Hey, what's up? All set for the presentation?",
      time: "a few moments ago",
      type: "message",
    },
    {
      id: 2,
      avatar: "logo.png",
      author: "Jese leos",
      content: "and 5 others started following you.",
      time: "10 minutes ago",
      type: "follow",
    },
    {
      id: 3,
      avatar: "logo.png",
      author: "Joseph Mcfall",
      content: "and 141 others love your story. See it and view more stories.",
      time: "44 minutes ago",
      type: "like",
    },
    {
      id: 4,
      avatar: "logo.png",
      author: "Leslie Livingston",
      content: "mentioned you in a comment: @bonnie.green what do you say?",
      time: "1 hour ago",
      type: "mention",
    },
    {
      id: 5,
      avatar: "logo.png",
      author: "Robert Brown",
      content: "posted a new video: Glassmorphism - learn how to implement the new design trend.",
      time: "3 hours ago",
      type: "video",
    },
  ];
}
