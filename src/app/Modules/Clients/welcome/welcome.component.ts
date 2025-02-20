import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../Shared/Services/auth-service.service';
@Component({
  selector: 'app-welcome',
  imports: [MatButtonModule,
    RouterModule
  ],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css'
})
export class WelcomeComponent {

  constructor(private authService: AuthService){
    console.log('Welcome ',this.authService.getToken());
  }

}
