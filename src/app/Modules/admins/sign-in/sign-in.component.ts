  import { CommonModule } from '@angular/common';
  import { Component, viewChild } from '@angular/core';
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
  
    ],
    templateUrl: './sign-in.component.html',
    styleUrls: ['./sign-in.component.css'],
  })
  export class SignInComponent {

    protected verify:boolean = false;
    protected isCodeComplete:boolean = false;
    private code:string = '';
    protected activeBtn:boolean=false;

    signinForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
      ]),
    });

    submit(){
      this.verify=true;
      this.activeBtn=true;
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
