import { TextFieldModule } from '@angular/cdk/text-field';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { UserService } from '../../../Services/user.service';
import { Client } from '../../../Models/Client.model';
import { Agent } from '../../../Models/Agent.model';

@Component({
  selector: 'settings-account',
  templateUrl: './account.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    TextFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
  ],
})
export class SettingsAccountComponent implements OnInit {
  accountForm: UntypedFormGroup;
  private _formBuilder = inject(UntypedFormBuilder);
  private userService = inject(UserService);
   user = this.userService.user();
  ngOnInit(): void {

    if (!this.user) return;
    const title = this.user.type === 'agent' ? 'Delivery driver' : 'Adminstrator';
    if (this.user.type === 'client') {
      let client = this.user as Client;
      this.accountForm = this._formBuilder.group({
        name: [client.first_name + ' ' + client.last_name],
        username: [client.username],
        email: [client.email, Validators.email],
        phone1: ['+216-' + client.phone],
        Gouvernorat: [client.city?.gouvernorat],
      });
    } else if (this.user.type === 'agent') {
      let agent = this.user as Agent;
      this.accountForm = this._formBuilder.group({
        name: [agent.first_name + ' ' + agent.last_name],
        username: [agent.username],
        title: [title],
        company: ['GoFast'],
        about: [
          "Hey! This is Brian; husband, father and gamer. I'm mostly passionate about bleeding edge tech and chocolate! 🍫",
        ],
        email: [agent.email, Validators.email],
        phone1: ['+216-' + agent.phone1],
        phone2: ['+216-' + agent.phone2],
      });
    } else {
      this.accountForm = this._formBuilder.group({
        name: [this.user.first_name + ' ' + this.user.last_name],
        username: [this.user.username],
        title: [title],
        company: ['GoFast'],
        about: [
          "Hey! This is Brian; husband, father and gamer. I'm mostly passionate about bleeding edge tech and chocolate! 🍫",
        ],
        email: [this.user.email, Validators.email],
      });
    }
  }
}
