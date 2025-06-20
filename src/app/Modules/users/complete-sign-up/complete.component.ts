import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    FormControl,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import {
  FuseAlertComponent,
  AlertType,
} from '../../../Shared/Components/alert/public-api';
import { finalize, map, startWith } from 'rxjs';
import { SuperAuthService } from '../../../Shared/Services/super-auth-service.service';
import { Animations } from '../../../Shared/Animations/public-api';
import { Place } from '../../../Shared/Models/Place.model';
import { MatOption,MatSelect, MatSelectTrigger } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { HasPermissionDirective } from '../../../Shared/directives/permission/has-permission.directive';
import { Governorate, GOVERNORATES } from '../../../Shared/Models/Gouvernorat.model';

@Component({
  selector: 'complete-signup',
  templateUrl: './complete.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: Animations,
  imports: [
    FuseAlertComponent,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterLink,
    MatOption,
    MatSelect,
    MatIcon,
    NgxMatSelectSearchModule,
    MatSelectTrigger
  ],
})
export class CompleteComponent implements OnInit {
  @ViewChild('forgotPasswordNgForm') forgotPasswordNgForm!: NgForm;

  alert: { type: AlertType; message: string } = {
    type: 'success',
    message: '',
  };
  phone: string = '';
  city: Governorate | null = null;
  showAlert: boolean = false;
  placeSearchControl = new FormControl('');
  list : Governorate[] = GOVERNORATES;
  suggestions: Governorate[] =  GOVERNORATES;
  /**
   * Constructor
   */
  constructor(
    private _authService: SuperAuthService,
    private router: Router
    ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Create the form
    this.placeSearchControl.valueChanges
      .pipe(
        startWith(''),
        map((search) => search?.toLowerCase() || '')
      )
      .subscribe((search) => {
        this.suggestions = this.list.filter((icon) =>
          icon.gouvernorat.toLowerCase().includes(search)
        );
      });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Send the reset link
   */
  sendResetLink(NgForm:NgForm): void {
    // Return if the form is invalid
    if (NgForm.invalid) {
      return;
    }

    // Disable the form
    NgForm.form.disable();

    // Hide the alert
    this.showAlert = false;

    // Forgot password
    this._authService
      .Complete(this.phone,this.city!)
      .subscribe(
        (response) => {
          this.router.navigate(['/']);
        },
        (err) => {
            // Re-enable the form
            NgForm.form.enable();

            // Set the alert
            this.alert = {
              type: 'error',
              message: err.error.message + ', please try again.',
            };
            this.showAlert = true;
          }
      );
  }
}
