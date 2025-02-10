import { Component,signal,ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { FormControl,FormGroup,Validators,ReactiveFormsModule,AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { User } from '../../Shared/Models/User.model';
import { AuthService } from '../../Shared/Services/auth-service.service';
import { CommonModule } from '@angular/common';
import { AlertComponent } from '../../Shared/Components/alert/alert.component';
import { auth_conf } from '../../Shared/Models/auth-confirmation.model';

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
    CommonModule,
  AlertComponent],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css',
  changeDetection:ChangeDetectionStrategy.OnPush,
})
export class SignUpComponent {

  constructor (protected authService : AuthService,private cdr: ChangeDetectorRef){

  }

  protected readonly value = signal('');
  protected error!:string;
  protected showAlert = false;


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
      console.log(newUser)
      this.authService.AddUser(newUser).subscribe({
        next: (res) => {
          let result:auth_conf = res;
          
        },
        error: (err) => {
          this.error = err.error.message;
          this.showAlert=true;
          this.cdr.detectChanges();
        }
      });
    }
  }

  check(){
  }

}


export function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if(password === confirmPassword){
      return null;      
    }else{
      return  {passwordMismatch: true} ;
    }
  };
}