  import { CommonModule } from '@angular/common';
  import { Component, inject, viewChild } from '@angular/core';
  import {
    FormBuilder,
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
  } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
  import { MatCheckboxModule } from '@angular/material/checkbox';
  import { MatFormFieldModule } from '@angular/material/form-field';
  import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CodeInputModule } from 'angular-code-input';
import { SuperAuthService } from '../../../Shared/Services/super-auth-service.service';
import { AlertComponent } from '../../../Shared/Components/alert/alert.component';
import { auth_conf } from '../../../Shared/Models/auth-confirmation.model';
import { Router } from '@angular/router';
import { LoaderService } from '../../../Shared/Services/loader.service';


  @Component({
    selector: 'app-sign-in',
    imports: [
    MatFormFieldModule,
    MatIconModule,
    MatCheckboxModule,
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    CodeInputModule,
    AlertComponent,
],
    templateUrl: './sign-in.component.html',
    styleUrls: ['./sign-in.component.css'],
  })
  export class SignInComponent {
    protected attempts:number = 0;
    protected showAlert = false;
    protected error:string = '';
    protected verify:boolean = false;
    protected isCodeComplete:boolean = false;
    private code:string = '';
    protected activeBtn:boolean=false;
    protected btnText:string = 'Sign in to your account';
    private _authService=inject(SuperAuthService);
    private _router=inject(Router);
    private _loaderService=inject(LoaderService);

    signinForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
      ]),
    });
    

    submit(){;
      this._loaderService.show('auth');
      if(this.signinForm.valid && !this.verify){
        this._authService.SignIn(this.signinForm.value.email!,this.signinForm.value.password!).subscribe({
          next:(res)=>{
            this.verify=true;
            this.activeBtn=true;
            this.btnText='Verify Code';
          },
          error:(err)=>{
              this.error=err.error.message;
          },
        })
      }else if(this.signinForm.valid && this.verify && this.isCodeComplete && this.attempts!=0){
        this._authService.verifyEmailCode(this.signinForm.value.email!,this.code).subscribe({
          next:(res)=>{
           let auth_conf:auth_conf=res;
           this._authService.saveToken(auth_conf.token);
           this._router.navigate(['back-office']);
          },
          error:(err)=>{
            this.showAlert=true;
            this.error=err.error.message;
          }
        })
      }
    }

    onCodeChanged(code: string) {
      this.isCodeComplete =false;
    }
  
    // this called only if user entered full code
    onCodeCompleted(code: string) {
      this.isCodeComplete=true;
      this.activeBtn=false;
      this.code = code;
    }
  }
