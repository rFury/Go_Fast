import { TextFieldModule } from '@angular/cdk/text-field';
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
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { UserService } from '../../../Services/user.service';
import { Client } from '../../../Models/Client.model';
import { ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';

import { Agent } from '../../../Models/Agent.model';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { startWith } from 'rxjs/operators';
import { GOVERNORATES } from '../../../Models/Gouvernorat.model';
import { Governorate } from '../../../Models/Gouvernorat.model';
import { FormControl } from '@angular/forms';
import { User } from '../../../Models/User.model';
import { CommonModule } from '@angular/common';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { VerificationDialogComponent } from '../../verificationDialog/verification-dialog.component';
import { AlertType } from '../../alert/alert.types';
import { FuseAlertComponent } from '../../alert/alert.component';
import { FuseConfirmationService } from '../../confirmation/confirmation.service';
import { SuperAuthService } from '../../../Services/super-auth-service.service';
import { Animations } from '../../../Animations/public-api';
import { Router } from '@angular/router';
@Component({
  selector: 'settings-account',
  templateUrl: './account.component.html',
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
    TextFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    CommonModule,
    NgxMatSelectSearchModule,
    FuseAlertComponent,
    VerificationDialogComponent,  
  ],
})
export class SettingsAccountComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  accountForm: UntypedFormGroup;
  private _formBuilder = inject(UntypedFormBuilder);
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);
  private _fuseConfirmationService = inject(FuseConfirmationService);
  private router = inject(Router);
  selectedFile: File | null = null;
  user: User | Agent | Client | null = null;
  placeSearchControl = new FormControl('');
  list : Governorate[] = GOVERNORATES;
  suggestions: Governorate[] =  GOVERNORATES; 
  showDialog: boolean = false;
  showAlert: boolean = false;
  isVerifying: boolean = false;
  alert: { type: AlertType; message: string } = {
    type: 'error',
    message: '',
  };
  newMail:Boolean=false;
  ngOnInit(): void {
    this.user = this.userService.user();
    if (this.user === null) return;
    const title = this.user.type === 'agent' ? 'Delivery driver' : 'Adminstrator';
    if (this.user.type === 'client') {
      console.log('zebi');
      
      let client = this.user as Client;
      this.accountForm = this._formBuilder.group({
        name: [client.first_name + ' ' + client.last_name],
        username: [client.username],
        email: [client.email, [Validators.email,Validators.required]],
        phone1: [client.phone, [Validators.required,Validators.minLength(8),Validators.maxLength(8),Validators.pattern(/^[0-9]+$/)]],
        gouvernorat: [client.city?.gouvernorat ,[Validators.required]],
      });
      this.placeSearchControl.valueChanges.pipe(
        startWith(''),
        distinctUntilChanged(),
      ).subscribe((search) => {
        const searchTerm = search?.toLowerCase() || '';
        this.suggestions = this.list.filter(icon => 
          icon.gouvernorat.toLowerCase().includes(searchTerm)
        );
      });
    } else if (this.user.type === 'agent') {
      let agent = this.user as Agent;
      this.accountForm = this._formBuilder.group({
        name: [agent.first_name + ' ' + agent.last_name],
        username: [agent.username],
        title: [title],
        company: ['GoFast'],
        email: [agent.email, Validators.email],
        phone1: [agent.phone1],
        phone2: [agent.phone2],
      });
    } else {
      this.accountForm = this._formBuilder.group({
        name: [this.user.first_name + ' ' + this.user.last_name],
        username: [this.user.username],
        title: [title],
        company: ['GoFast'],
        email: [this.user.email, Validators.email],
      });
    }
  }
  changeProfilePhoto(){
    this.fileInput.nativeElement.click();
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/gif','image/jpg'];
      const maxSizeMB = 5;
      
      if (!validTypes.includes(file.type)) {
        this.showError('Invalid file type. Please select a JPEG, PNG, or GIF image.');
        return;
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        this.showError(`File size exceeds ${maxSizeMB}MB limit.`);
        return;
      }

      this.selectedFile = file;
      // Process the image (preview and upload)
      this.previewImage(file);
    }
    // Reset input to allow selecting same file again
    input.value = '';
  }

  private previewImage(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      // Update user avatar for immediate preview
      this.user!.avatar = e.target.result;

      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  uploadImage(): void {
    if(this.selectedFile){
      const formData = new FormData();
      formData.append('avatar', this.selectedFile);

    // Call your avatar update API
    this.userService.updateAvatar(this.selectedFile).subscribe({
      next: (response) => {
        // Update user data in service/store
        this.userService.get().subscribe((user) => {
          this.user = user;
        });
        this.showSuccess('Profile picture updated successfully!');
      },
      error: (err) => {
        this.showError('Failed to update profile picture. Please try again.');
        console.error('Avatar upload error:', err);
      }
    });
  }
  }
  updateAccount(){
    if(this.user?.email?.toString().trim() !== this.accountForm.value.email.toString().trim()){
      const confirmation = this._fuseConfirmationService.open({
        title: 'New Email',
        message: 'Would you like to update your email ?\n to this one : "'+this.accountForm.value.email+'"',
        actions: {
          confirm: {
            label: 'yes',
          },
          cancel: {
            label: 'no',
          },
        },
      });
      confirmation.afterClosed().subscribe((result) => {
        // If the confirm button pressed...
        if (result === 'confirmed') {
          this.newMail=true;
          this.userService.updatePersonalInfo().subscribe({
            next: (response) => {
              this.showDialog = true;
              this.cdr.detectChanges();
            },
            error: (err) => {
              this.showError('Failed to update account. Please try again.');
            }
          });
        }else{
          this.newMail=false;
          const client = this.user as Client;
          this.accountForm = this._formBuilder.group({
            name: [client.first_name + ' ' + client.last_name],
            username: [client.username],
            email: [client.email, [Validators.email,Validators.required]],
            phone1: [client.phone, [Validators.required,Validators.minLength(8),Validators.maxLength(8),Validators.pattern(/^[0-9]+$/)]],
            gouvernorat: [client.city?.gouvernorat ,[Validators.required]],
          });
          this.cdr.detectChanges();
        }
      });
    }
    else{
      this.userService.updatePersonalInfo().subscribe({
        next: (response) => {
          this.showDialog = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.showError('Failed to update account. Please try again.');
      }
      });
    }
  }
  private showSuccess(message: string): void {
    // Implement your notification logic (Snackbar, Toast, etc.)
  }

  private showError(message: string): void {
    // Implement error notification
  }
  canceled(event: boolean): void {
    this.showDialog = false;
    const client = this.user as Client;
    this.accountForm = this._formBuilder.group({
      name: [client.first_name + ' ' + client.last_name],
      username: [client.username],
      email: [client.email, [Validators.email,Validators.required]],
      phone1: [client.phone, [Validators.required,Validators.minLength(8),Validators.maxLength(8),Validators.pattern(/^[0-9]+$/)]],
      gouvernorat: [client.city?.gouvernorat ,[Validators.required]],
    });
    this.cdr.detectChanges();
  }
  verified(event: string): void {
    this.isVerifying = true;
    this.cdr.detectChanges();
    const city = this.list.find(item => item.gouvernorat === this.accountForm.value.gouvernorat)!
    this.userService.completeUpdatePersonalInfo({
      email: this.accountForm.value.email,
      phone: this.accountForm.value.phone1,
      city: city,
      key: event,
    }).subscribe(      {
      next: (res) => {
          console.log(res);
          this.showDialog = false;
          this.alert.type = 'success';
          this.alert.message = this.newMail ? 'Account updated successfully ,Sign in you out to verify your new email' : 'Account updated successfully';
          this.showAlert = true;
          this.isVerifying = false;
          this.cdr.detectChanges();
          this.router.navigate(['/sign-out']);
      },
      error: (error) => {
        console.log(error);
        if(error.status == 406){
          this.showDialog=false;
        }
        this.alert.type = 'error';
        this.alert.message = error.error.message;
        this.showAlert = true;
        this.isVerifying = false;
        this.cdr.detectChanges();
      },
    });
  }
}
