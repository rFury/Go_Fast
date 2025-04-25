import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Animations } from '../../../Shared/Animations/public-api';
import { FuseAlertComponent } from '../../../Shared/Components/alert/alert.component';
import { _Validators } from '../../../Shared/Validators/validators';
import { AlertType } from '../../../Shared/Components/alert/alert.types';
import { SuperAuthService } from '../../../Shared/Services/super-auth-service.service';
import { User } from '../../../Shared/Models/User.model';
import { UserService } from '../../../Shared/Services/user.service';

@Component({
  selector: 'auth-reset-password',
  templateUrl: './reset-password.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: Animations,
  imports: [
    FuseAlertComponent,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink,
  ],
})
export class AuthResetPasswordComponent implements OnInit {
  @ViewChild('resetPasswordNgForm') resetPasswordNgForm!: NgForm;

  alert: { type: AlertType; message: string } = {
    type: 'success',
    message: '',
  };
  resetPasswordForm!: UntypedFormGroup;
  showAlert: boolean = false;
  email: string = '';
  token : string = '';
  type : boolean = false;

  constructor(
    private _authService: SuperAuthService,
    private _formBuilder: UntypedFormBuilder,
    private _route: ActivatedRoute,
    private _userService: UserService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.email = this._route.snapshot.queryParamMap.get('email')!;
    this.token = this._route.snapshot.queryParamMap.get('token')!;
    this.type = Boolean(this._route.snapshot.queryParamMap.get('type'));

    this.resetPasswordForm = this._formBuilder.group(
      {
        password: ['', Validators.required],
        passwordConfirm: ['', Validators.required],
      },
      {
        validators: _Validators.mustMatch('password', 'passwordConfirm'),
      }
    );
  }

  resetPassword(): void {
    // Return if the form is invalid
    if (this.resetPasswordForm.invalid) {
      return;
    }

    // Disable the form
    this.resetPasswordForm.disable();

    // Hide the alert
    this.showAlert = false;

    // Send the request to the server
    this._authService
      .updatePassword(this.resetPasswordForm.get('password')!.value,this.token)
      .pipe(
        finalize(() => {
          // Re-enable the form
          this.resetPasswordForm.enable();

          // Reset the form
          this.resetPasswordNgForm.resetForm();

        })
      )
      .subscribe(
        (response) => {
          this._userService.get().subscribe((user: User) => {
          });
          const redirectURL =
            this._route.snapshot.queryParamMap.get('redirectURL') ||
            this._userService._defaultLink.getValue() ||
            '/signed-in-redirect';
          localStorage.setItem('email', this.email);
          this.router.navigateByUrl(redirectURL);
        },
        (response) => {
          this.alert = {
            type: 'error',
            message: 'Something went wrong, please try again.',
          };
          this.showAlert = true;
        }
      );
  }
}
