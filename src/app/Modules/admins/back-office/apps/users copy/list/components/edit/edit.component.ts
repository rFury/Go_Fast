import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  NgForm,
  FormsModule,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatButton } from '@angular/material/button';
import { forkJoin, map, startWith } from 'rxjs';
import { MatOption } from '@angular/material/autocomplete';
import { MatSelect, MatSelectTrigger } from '@angular/material/select';
import { FuseConfirmationService } from '../../../../../../../../Shared/Components/confirmation/confirmation.service';
import { Group } from '../../../../../../../../Shared/Models/Group.model';
import { User } from '../../../../../../../../Shared/Models/User.model';
import { GroupService } from '../../../../../../../../Shared/Services/group.service';
import { LoadingService } from '../../../../../../../../Shared/Services/loading.service';
import { UserService } from '../../../../../../../../Shared/Services/user.service';
import { MatIcon } from '@angular/material/icon';
import { HasPermissionDirective } from '../../../../../../../../Shared/directives/permission/has-permission.directive';
import { Client } from '../../../../../../../../Shared/Models/Client.model';
import {
  Governorate,
  GOVERNORATES,
} from '../../../../../../../../Shared/Models/Gouvernorat.model';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  imports: [
    FormsModule,
    MatButton,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    ReactiveFormsModule,
    MatOption,
    MatSelect,
    MatIcon,
    HasPermissionDirective,
    MatSelectTrigger,
    NgxMatSelectSearchModule,
  ],
})
export class EditComponent implements OnInit {
  //********* INJECT SERVICES ***********//
  _userService = inject(UserService);
  _router = inject(Router);
  _route = inject(ActivatedRoute);
  _fuseConfirmationService = inject(FuseConfirmationService);
  _loadingService = inject(LoadingService);
  //********* DECLARE CLASSES/ENUMS ***********//
  id = this._route.snapshot.paramMap.get('id') || undefined;
  user: Client;
  list: Governorate[] = GOVERNORATES;
  suggestions: Governorate[] = GOVERNORATES;
  placeSearchControl = new FormControl('');
  ngOnInit(): void {
    if (this.id) {
      this._loadingService.show();
      forkJoin([this._userService.getOne(this.id, 'client')]).subscribe({
        next: (result: [Client]) => {
          this.user = result[0];
          console.log(this.user);
          this._loadingService.hide();
        },
        error: () => {
          this._loadingService.hide();
        },
      });
    }
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
  compareGovObjects(g1: Governorate, g2: Governorate): boolean {
    return g1 && g2 ? g1.gouvernorat === g2.gouvernorat : false;
  }
  
  updateOne(myForm: NgForm) {
    if (myForm.valid) {
      this._userService.updateOne(this.user).subscribe(() => {
        this._router.navigate(['../'], { relativeTo: this._route }).then();
      });
    }
  }
  cancelEdit(myForm: NgForm) {
    if (myForm.pristine) {
      this._router.navigate([`../`], { relativeTo: this._route }).then();
    } else {
      // Open the confirmation dialog
      const confirmation = this._fuseConfirmationService.open({
        title: 'Cancel',
        message: 'Would you like to cancel the modification ?',
        actions: {
          confirm: {
            label: 'yes',
          },
          cancel: {
            label: 'no',
          },
        },
      });
      // Subscribe to the confirmation dialog closed action
      confirmation.afterClosed().subscribe((result) => {
        // If the confirm button pressed...
        if (result === 'confirmed') {
          this._router.navigate([`../`], { relativeTo: this._route }).then();
        }
      });
    }
  }
  deleteOne(row: Client) {
    // Open the confirmation dialog
    const confirmation = this._fuseConfirmationService.open({
      title: 'Delete',
      message: 'Would you like to confirm the deletion ?',
      actions: {
        confirm: {
          label: 'yes',
        },
        cancel: {
          label: 'no',
        },
      },
    });

    // Subscribe to the confirmation dialog closed action
    confirmation.afterClosed().subscribe((result) => {
      // If the confirm button pressed...
      if (result === 'confirmed') {
        this._userService.deleteOne(row._id!).subscribe(() => {
          this._router.navigate([`../`], { relativeTo: this._route }).then();
        });
      }
    });
  }
}
