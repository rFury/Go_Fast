import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../Services/auth-service.service';
import { TokenVerif } from '../../Models/TokenVerif.model';
import { auth_conf } from '../../Models/auth-confirmation.model';
import { CodeInputModule } from 'angular-code-input';
import { AlertComponent } from '../alert/alert.component';

@Component({
  selector: 'app-verify-code',
  imports: [
    MatCardModule,
    CommonModule,
    MatButtonModule,
    CodeInputModule,
    AlertComponent
  ],
  templateUrl: './verify-code.component.html',
  styleUrls: ['./verify-code.component.css'],
})
export class VerifyCodeComponent implements OnInit, OnDestroy {

  showAlert:boolean = false;
  isCodeComplete:Boolean = false;
  timeLeft = 0;
  timer: any;
  token!: string | null;
  activebtn: Boolean = false;
  resendDisabled: Boolean = false;
  resendTimer: number = 30;
  resendInterval: any;
  email!: string;
  now = new Date();
  which!: Boolean; //true == verif email || false == reset password
  code!:string;

  constructor(
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      let token = params['verifToken'];
      this.which = true;
      if (token == undefined || token == null) {
        token = params['resetToken'];
        this.which = false;
      }
      if (token) {
        this.token = token;
        let object: TokenVerif = this.authService.decodeVerifToken(this.token!);
        this.email = object.email;
        let timestamp = object.exp;
        const expDate = new Date(timestamp * 1000);
        this.timeLeft = Math.floor(
          (expDate.getTime() - this.now.getTime()) / 1000
        );
      }
    });
    this.startTimer();
  }
  startTimer() {
    this.timer = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        clearInterval(this.timer);
        this.router.navigate(['/home']);
      }
    }, 1000);
  }

  startResendTimer() {
    this.resendDisabled = true;
    this.resendTimer = 10;

    this.resendInterval = setInterval(() => {
      if (this.resendTimer > 0) {
        this.resendTimer--;
      } else {
        clearInterval(this.resendInterval);
        this.resendDisabled = false;
      }
    }, 1000);
  }

  ngOnDestroy() {
    clearInterval(this.timer);
    clearInterval(this.resendInterval);
  }

  verifyCode() {
    if (this.isCodeComplete && this.code!=undefined) {
      console.log(this.code);
      if (this.which == true) {
        this.authService.verifyEmailCode(this.token!, this.code).subscribe({
          next: (res) => {
            let auth_conf: auth_conf = res;
            this.authService.saveToken(auth_conf.token);
            this.router.navigate(['/']);
          },
          error: (err) => {
            console.error(err);
            this.showAlert=true;
          },
        });
      } else if (this.which == false) {
        this.authService.verifyResetCode(this.token!, this.code).subscribe({
          next: (res) => {
            let auth_conf: auth_conf = res;
            this.router.navigate(['/Change-Password'], {
              queryParams: { Token: auth_conf.token },
            });
          },
          error: (err) => {
            console.error(err);
          },
        });
      }
    }
  }

  get formattedTime(): string {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    return `${this.pad(minutes)}:${this.pad(seconds)}`;
  }

  pad(value: number): string {
    return value < 10 ? '0' + value : value.toString();
  }

  resendCode() {

    let token:TokenVerif = this.authService.decodeVerifToken(this.token!);
    if(token.email){
      this.authService.resendCode(token.email).subscribe({
        next : (res)=>{
          let result:auth_conf = res;
          console.log(result.token);
          this.router.navigate(["/Verify-Code"], { queryParams: { verifToken:result.token } });
        },
        error : (err)=>{
          console.error(err);
        }
      })
    }


    this.startResendTimer();
  }

  // this called every time when user changed the code
  onCodeChanged(code: string) {
    this.isCodeComplete =false;
    this.activebtn=this.isCodeComplete;
  }

  // this called only if user entered full code
  onCodeCompleted(code: string) {
    this.isCodeComplete=true;
    this.activebtn=this.isCodeComplete;
    this.code = code;
  }

}
