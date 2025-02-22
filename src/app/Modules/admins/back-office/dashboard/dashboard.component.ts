import { Component } from '@angular/core';
import { NotificationsComponent } from "../../../../Shared/Components/notifications/notifications.component";

@Component({
  selector: 'app-dashboard',
  imports: [NotificationsComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

}
