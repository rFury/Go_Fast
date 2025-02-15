import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { AuthService } from '../../Shared/Services/auth-service.service';
import { auth_conf } from '../../Shared/Models/auth-confirmation.model';
import { AlertComponent } from '../../Shared/Components/alert/alert.component';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    RouterModule,
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    AlertComponent,
    CommonModule,
    MatIcon,
  ],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css',
})
export class SignInComponent {
  showAlert: boolean = false;
  error: string = '';
  showNotif:boolean = false;

  constructor(protected authService: AuthService, private router: Router) {}

  userForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
    ]),
  });

  onSubmit() {
    if (this.userForm.valid) {
      this.authService
        .SignIn(this.userForm.value.email!, this.userForm.value.password!)
        .subscribe({
          next: (res) => {
            let auth_conf: auth_conf = res;
            this.authService.saveToken(auth_conf.token);
            this.router.navigate(['/']);
          },
          error: (err) => {
            if (err.status == 426) {
              this.showNotif=true;
            } else {
              this.showAlert = true;
              this.error = err.error.message;
              console.error(err)
            }
          },
        });
    }
  }

  verif(){
    this.authService
    .resendCode(this.userForm.value.email!)
    .subscribe({
      next: (res) => {
        let result: auth_conf = res;
        console.log(result.token);
        this.router.navigate(['/Verify-Code'], {
          queryParams: { verifToken: result.token },
        });
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}
