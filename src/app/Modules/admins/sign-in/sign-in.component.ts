
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
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

@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: Animations,
    standalone: true,
    imports: [RouterLink, FuseAlertComponent, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatCheckboxModule, MatProgressSpinnerModule]
})
export class SignInComponent implements OnInit
{
    @ViewChild('signInNgForm') signInNgForm!: NgForm;

    alert: { type: AlertType; message: string } = {
        type   : 'success',
        message: '',
    };
    signInForm!: UntypedFormGroup;
    showAlert: boolean = false;
    user!: User | undefined;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: SuperAuthService,
        private _userService: UserService,
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
        this.signInForm = this._formBuilder.group({
            email     : ['ala@travelease.com', [Validators.required, Validators.email]],
            password  : ['Test123', Validators.required],
            rememberMe: [''],
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     */
    signIn(): void
    {
        // Return if the form is invalid
        if ( this.signInForm.invalid )
        {
            return;
        }

        // Disable the form
        this.signInForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Sign in
        /*this._authService.signIn(this.signInForm?.value).subscribe(
            () => {
                // Set the redirect url.
                // The '/signed-in-redirect' is a dummy url to catch the internationalization and redirect the user
                // to the correct page after a successful sign in. This way, that url can be set via
                // routing file and we don't have to touch here.
                this._userService.get().subscribe((user: User) => {
                    this.user = user;
                });
                const redirectURL =
                    this._activatedRoute.snapshot.queryParamMap.get('redirectURL') ||
                    this._userService._defaultLink.getValue() ||
                    '/signed-in-redirect';
                localStorage.setItem('email', this.signInForm?.get('email')?.value);
                // Navigate to the redirect url
                this._router.navigateByUrl(redirectURL);
            },
            () => {
                // Re-enable the form
                this.signInForm?.enable();
            },
        );*/
    }
}
