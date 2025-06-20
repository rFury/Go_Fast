import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
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
import { FuseAlertComponent } from '../../../Components/alert/alert.component';
import { AlertType } from '../../alert/alert.types';
import { Animations } from '../../../Animations/public-api';
import { Client } from '../../../Models/Client.model';
@Component({
  selector: 'settings-security',
  templateUrl: './security.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: Animations,
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
    FuseAlertComponent,
  ],
})
export class SettingsSecurityComponent implements OnInit {
  securityForm: UntypedFormGroup;
  private userService = inject(UserService);
  private _formBuilder = inject(UntypedFormBuilder);
  private _cdr = inject(ChangeDetectorRef);
  user = this.userService.user();
  showDialog: boolean = false;
  showAlert: boolean = false;
  isVerifying: boolean = false;
  alert: { type: AlertType; message: string } = {
    type: 'error',
    message: '',
  };
  ngOnInit(): void {
    // Create the form
    this.securityForm = this._formBuilder.group({
      currentPassword: ['', [Validators.required, Validators.minLength(8)]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      twoStep: [true],
      askPasswordChange: [false],
    });
    this.userService.userObs.subscribe((user) => {
      this.user = user;
      if(this.user?.type === 'client'){
        this.securityForm.controls['twoStep'].setValue((this.user as Client).twostep?(this.user as Client).twostep:false);
      }
      this._cdr.detectChanges();
    });
  }
  save(): void {
    this.securityForm.markAllAsTouched();
    if (this.securityForm.valid) {
      this.userService.updatePassword(this.securityForm.value).subscribe({
        next: (res) => {
          this.alert.type = 'success';
          this.alert.message = res.message;
          this.showAlert = true;
          this._cdr.detectChanges();
          this.openVerificationDialog();
        },
        error: (error) => {
          console.log(error);
          this.alert.type = 'error';
          this.alert.message = error.error.message;
          this.showAlert = true;
          this._cdr.detectChanges();
        },
      });
    }
  }
  openVerificationDialog(): void {
    this.showDialog = true;
    this._cdr.detectChanges();
  }
  canceled(event: boolean): void {
    this.showDialog = false;
    this._cdr.detectChanges();
  }
  verified(event: string): void {
    this.isVerifying = true;
    this._cdr.detectChanges();
    this.userService
      .completePasswordChange(event, this.securityForm.value.newPassword)
      .subscribe({
        next: (res) => {
          console.log(res);
          this.showDialog = false;
          this.alert.type = 'success';
          this.alert.message = res.message;
          this.showAlert = true;
          this.isVerifying = false;
          this._cdr.detectChanges();
        },
        error: (error) => {
          console.log(error);
          if (error.status == 406) {
            this.showDialog = false;
          }
          this.alert.type = 'error';
          this.alert.message = error.error.message;
          this.showAlert = true;
          this.isVerifying = false;
          this._cdr.detectChanges();
        },
      });
  }
  twoStep(): void {
    this.securityForm.controls['twoStep'].disable()
    this.userService.updateTwoStep().subscribe({
      next: (res) => {
        this.securityForm.controls['twoStep'].enable()
        this._cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.securityForm.controls['twoStep'].enable()
        this._cdr.detectChanges();
      },
    });

  }
}
