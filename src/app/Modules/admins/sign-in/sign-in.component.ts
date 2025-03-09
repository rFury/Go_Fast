
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
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: SuperAuthService,
        private _userService: UserService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
    )
    {
    }
    ngOnInit(): void
    {
        // Create the form
        this.signInForm = this._formBuilder.group({
            email     : ['', [Validators.required, Validators.email]],
            password  : ['', Validators.required],
            rememberMe: [''],
        });
    }
    signIn(): void
    {
        console.log('1',this.signInForm.value);
        if ( this.signInForm.invalid )
        {
            console.log('2');
            return;

        }

        this.signInForm.disable();

        this.showAlert = false;

        this._authService.signIn(this.signInForm?.value).subscribe(
            (res) => {
                console.log('3');
                this._userService.get().subscribe((user: User) => {
                    this.user = user;
                });
                const redirectURL =
                    this._activatedRoute.snapshot.queryParamMap.get('redirectURL') ||
                    this._userService._defaultLink.getValue() ||
                    '/signed-in-redirect';
                localStorage.setItem('email', this.signInForm?.get('email')?.value);
                this._router.navigateByUrl(redirectURL);
            },
            (err) => {
                console.log('4');
                console.error(err);
                this.signInForm?.enable();
            },
        );
    }
}
