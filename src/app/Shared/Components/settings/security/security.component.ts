import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { UserService } from '../../../Services/user.service';
import { VerificationDialogComponent } from '../../verificationDialog/verification-dialog.component';
@Component({
  selector: 'settings-security',
  templateUrl: './security.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSlideToggleModule,
    MatButtonModule,
    VerificationDialogComponent,
  ],
})
export class SettingsSecurityComponent implements OnInit {
  securityForm: UntypedFormGroup;
  private userService = inject(UserService);
  user = this.userService.user();
  showDialog: boolean = false;

  /**
   * Constructor
   */
  constructor(private _formBuilder: UntypedFormBuilder) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Create the form
    this.securityForm = this._formBuilder.group(
      {
        currentPassword: ['', [Validators.required,Validators.minLength(8)]],
        newPassword: ['', [Validators.required,Validators.minLength(8)]],
        twoStep: [true],
        askPasswordChange: [false],
      }
    );
  }
  save(): void {
    this.securityForm.markAllAsTouched();
    if (this.securityForm.valid) {
      this.userService
        .updatePassword(this.securityForm.value)
        .subscribe((res) => {
          console.log(res);
        });
    }
  }
  openVerificationDialog(): void {
    this.showDialog = true;
  }
  canceled(event: boolean): void {
    this.showDialog = false;
  }
}
