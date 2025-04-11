import {Component, inject, OnInit} from '@angular/core';
import { NgForm, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatButton } from '@angular/material/button';
import {forkJoin} from "rxjs";
import {MatOption} from "@angular/material/autocomplete";
import {MatSelect} from "@angular/material/select";
import { Animations } from '../../../../../../Shared/Animations/public-api';
import { FuseConfirmationService } from '../../../../../../Shared/Components/confirmation/confirmation.service';
import { listFeatureType } from '../../../../../../Shared/enums/featureType';
import { Group } from '../../../../../../Shared/Models/Group.model';
import { User } from '../../../../../../Shared/Models/User.model';
import { GroupService } from '../../../../../../Shared/Services/group.service';
import { LoadingService } from '../../../../../../Shared/Services/loading.service';
import { UserService } from '../../../../../../Shared/Services/user.service';
import { MatIcon } from '@angular/material/icon';
import { HasPermissionDirective } from '../../../../../../Shared/directives/permission/has-permission.directive';

@Component({
  selector: 'app-details',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
  animations: Animations,
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
        HasPermissionDirective
    ],
})
export class AddComponent implements OnInit{
    //********* INJECT SERVICES ***********//
    _userService= inject(UserService);
    _groupService= inject(GroupService);
    _router= inject(Router);
    _fuseConfirmationService= inject(FuseConfirmationService);
    _route= inject(ActivatedRoute);
    _loadingService = inject(LoadingService)
    //********* DECLARE CLASSES/ENUMS ***********//
    user = new User();
    listGroups: Group[] = [];

    ngOnInit(): void {
        this._loadingService.show();
        forkJoin([
            this._groupService.getAll()
        ]).subscribe({
            next:(result: [Group[]]) => {
                this.listGroups = result[0];
                console.log(this.listGroups);
                
                this._loadingService.hide();
            },
            error: () => {
                this._loadingService.hide();
            }
        })
    }
  addOne(myForm: NgForm): void {
    if (myForm.valid) {
      this.user.companyId=this._userService.user$!.companyId;
      this.user.type="user";
        this._userService.addUser(this.user).subscribe(() => {
            this._router.navigate([`../`], { relativeTo: this._route }).then();
        })
    }
  }
  resetForm(myForm: NgForm, event) {
    event.stopPropagation();
    if (myForm.pristine) {
      myForm.resetForm();
    } else {
      // Open the confirmation dialog
      const confirmation = this._fuseConfirmationService.open({
        title: 'Clear',
        message: 'Would you like to clear the information ?',
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
          myForm.resetForm();
        }
      });
    }
  }
  cancelForm(myForm: NgForm) {
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

    protected readonly listFeatureType = listFeatureType;
}
