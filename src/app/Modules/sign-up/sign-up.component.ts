import { Component,signal,ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { FormControl,FormGroup,Validators,ReactiveFormsModule,AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { User } from '../../Shared/Models/User.model';
import { AuthService } from '../../Shared/Services/auth-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    RouterModule,
    CommonModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css',
  changeDetection:ChangeDetectionStrategy.OnPush,
})
export class SignUpComponent {

  constructor (protected authService : AuthService){

  }

  protected readonly value = signal('');


  userForm = new FormGroup({
    first_name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    last_name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl('', [Validators.required])
  },
  { validators: passwordMatchValidator() }
);
  protected onInput(event: Event) {
    this.value.set((event.target as HTMLInputElement).value);
  }

  onSubmit() {
    if (this.userForm.valid) {
      const newUser: User = {
        first_name: this.userForm.value.first_name!,
        last_name: this.userForm.value.last_name!,
        email: this.userForm.value.email!,
        password: this.userForm.value.password!,
      };
      this.authService.AddUser(newUser).subscribe({
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
export function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  };
}