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
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { _Validators } from '../../../Shared/Validators/validators';


@Component({
  selector: 'auth-sign-up',
  templateUrl: './sign-up.component.html',
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
  styleUrl: './sign-up.component.scss',
})
export class SignUpComponent implements OnInit {
  @ViewChild('signUpNgForm') signUpNgForm: NgForm;

    alert: { type: AlertType; message: string } = {
        type   : 'success',
        message: '',
    };
    signUpForm: UntypedFormGroup;
    showAlert: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _authService: SuperAuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Create the form
        this.signUpForm = this._formBuilder.group({
                first_name      : ['', Validators.required],
                last_name      : ['', Validators.required],
                email     : ['', [Validators.required, Validators.email]],
                password  : ['', Validators.required],
                passwordConfirm   : ['',Validators.required],
                agreements: ['', Validators.requiredTrue],
            },
            {
              validators: _Validators.mustMatch('password', 'passwordConfirm'),
            }
        );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign up
     */
    signUp(): void
    {
        if ( this.signUpForm.invalid )
        {
            return;
        }

        // Disable the form
        this.signUpForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Sign up
        this._authService.signUp(this.signUpForm.value)
            .subscribe(
                (response) =>
                {
                  this._router.navigate(['/sign-in'], {
                    queryParams: { verif: true,email:this.signUpForm.value.email},
                  });                },
                (error) =>
                {
                  console.error(error)
                    // Re-enable the form
                    this.signUpForm.enable();

                    // Set the alert
                    this.alert = {
                        type   : 'error',
                        message: 'Something went wrong, please try again.',
                    };
                    this.showAlert = true;
                },
            );
    }
}
