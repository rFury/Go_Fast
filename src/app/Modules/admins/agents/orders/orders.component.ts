import { Component, inject, OnInit } from '@angular/core';
import { SuperAuthService } from '../../../../Shared/Services/super-auth-service.service';
import { UserService } from '../../../../Shared/Services/user.service';
import { Agent } from '../../../../Shared/Models/Agent.model';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-orders',
  imports: [
    MatButtonModule
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit {

  private _userService = inject(UserService);
  Agent:Agent | null = null;

  ngOnInit(): void {
    this.Agent = this._userService.user() as Agent;
    console.log(this.Agent);

  }

}
