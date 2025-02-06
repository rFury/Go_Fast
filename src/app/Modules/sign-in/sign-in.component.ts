import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { FormControl,FormGroup,Validators,ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService } from '../../Shared/Services/auth-service.service';
import { User } from '../../Shared/Models/User.model';


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
FormsModule,ReactiveFormsModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css'
})
export class SignInComponent {

  constructor (protected authService : AuthService){
  
    }  
  
    userForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required])});


    onSubmit() {
      if (this.userForm.valid) {
        this.authService.SignIn(this.userForm.value.email!,this.userForm.value.password!).subscribe({
          next: (res) => {
            console.log('User registered:', res);
          },
          error: (err) => {
            console.error('Registration error:', err);
          }
        });
      }
    }
  }
