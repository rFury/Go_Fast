import {
  Component,
  inject,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Animations } from '../../../Shared/Animations/public-api';
import { FuseAlertComponent } from '../../../Shared/Components/alert/alert.component';
import { User } from '../../../Shared/Models/User.model';
import { UserService } from '../../../Shared/Services/user.service';
import { AlertType } from '../../../Shared/Components/alert/alert.types';
import { SuperAuthService } from '../../../Shared/Services/super-auth-service.service';
import { CodeInputModule } from 'angular-code-input';

@Component({
  selector: 'auth-sign-in',
  templateUrl: './sign-in.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: Animations,
  standalone: true,
  imports: [
    CodeInputModule,
    RouterLink,
    FuseAlertComponent,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
  ],
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent implements OnInit {
  protected btn:boolean = true;
  protected missingCode: boolean = false;
  protected emailText: string = 'Email address';
  protected attempts: number = 3;
  protected verify: boolean = false;
  protected isCodeComplete: boolean = false;
  private code: string = '';
  protected activeBtn: boolean = false;
  protected btnText: string = 'Sign in';
  @ViewChild('signInNgForm') signInNgForm!: NgForm;

  alert: { type: AlertType; message: string } = {
    type: 'error',
    message: '',
  };
  signInForm!: UntypedFormGroup;
  showAlert: boolean = false;
  user!: User | undefined;
  private route = inject(ActivatedRoute);
  constructor(
    private _activatedRoute: ActivatedRoute,
    private _authService: SuperAuthService,
    private _userService: UserService,
    private _formBuilder: UntypedFormBuilder,
    private _router: Router
  ) {}
  ngOnInit(): void {
    // Create the form
    this.signInForm = this._formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [''],
    });

    const verification = this.route.snapshot.queryParamMap.get('verif');
    const email = this.route.snapshot.queryParamMap.get('email');
    if (
      verification &&
      Boolean(verification) == true &&
      email &&
      email.length > 0
    ) {
      this.verify = true;
      this.btnText = 'Verify Code';
      this.emailText = 'Code sent to';
      this.signInForm.get('email')?.disable();
      this.signInForm.get('email')?.setValue(email);
      this.signInForm.get('password')?.setValue(' ');
    } else {
      this._router.navigate(['/admin/sign-in']);
    }


  }
  signIn(): void {
    console.log('1', this.signInForm.value);
    if (this.signInForm.invalid) {
      console.log('2');
      return;
    } else if (this.code.length != 6 && this.verify) {
      this.missingCode = true;
      return;
    }

    this.signInForm.disable();
    this.btn=false;
    this.showAlert = false;

    if (!this.verify) {
      this._authService.signIn(this.signInForm?.value).subscribe(
        (res) => {
          console.log('3');
          this._router.navigate(['/admin/sign-in/verif-code'], {
            queryParams: {
              email: this.signInForm.get('email')?.value,
              verif: true,
            },
          });
        },
        (err) => {
            if(err.status === 400){
                console.log('4');
                console.error(err);
                this.alert.message = 'Wrong Credentials. Please try again';
                this.showAlert = true;
                this.signInForm?.enable();
                this.btn=true;
            }else if(err.status === 405){
                this._router.navigate(['/admin/sign-in/verif-code'], {
                    queryParams: {
                      email: this.signInForm.get('email')?.value,
                      verif: true,
                    },
                  });
            }
        }
      );
    } else {
      if (this.attempts != 0) {
        this._authService
          .verifCode({ email: this.signInForm.value.email, code: this.code })
          .subscribe(
            (res) => {
              this._userService.get().subscribe((user: User) => {
                this.user = user;
                console.log(user)
              });
              const redirectURL =
                this._activatedRoute.snapshot.queryParamMap.get(
                  'redirectURL'
                ) ||
                this._userService._defaultLink.getValue() ||
                '/admin/signed-in-redirect';
              localStorage.setItem(
                'email',
                this.signInForm?.get('email')?.value
              );
              this._router.navigateByUrl(redirectURL);
            },
            (err) => {
              if (err.status == 405) {
                this.showAlert = true;
                this.attempts = Number.parseInt(err.error.message);
                this.alert.message = 'Wrong code, ' + this.attempts + ' left !';
                this.btn=true;
              }else if(err.status == 403 || err.status == 402) {
                this._router.navigate(['/admin/sign-in']);
              }
              else{
                console.error(err);
              }
            }
          );
      } else {
        this._router.navigate(['/admin/sign-in']);
      }
    }
  }

  onCodeChanged(code: string) {
    this.isCodeComplete = false;
    this.missingCode = false;
  }

  onCodeCompleted(code: string) {
    this.isCodeComplete = true;
    this.code = code;
  }
}
