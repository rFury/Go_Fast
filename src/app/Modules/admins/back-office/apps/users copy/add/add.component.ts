import { Component, inject, OnInit, signal } from '@angular/core';
import {
  NgForm,
  FormsModule,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatButton } from '@angular/material/button';
import { forkJoin, map, startWith } from 'rxjs';
import { MatOption } from '@angular/material/autocomplete';
import { MatSelect, MatSelectTrigger } from '@angular/material/select';
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
import { Client } from '../../../../../../Shared/Models/Client.model';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Governorate, GOVERNORATES } from '../../../../../../Shared/Models/Gouvernorat.model';

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
    HasPermissionDirective,
    NgxMatSelectSearchModule,
    MatSelectTrigger
  ],
})
export class AddComponent implements OnInit {
  //********* INJECT SERVICES ***********//
  _clientService = inject(UserService);
  _router = inject(Router);
  _fuseConfirmationService = inject(FuseConfirmationService);
  _route = inject(ActivatedRoute);
  _loadingService = inject(LoadingService);
  //********* DECLARE CLASSES/ENUMS ***********//
  Client = new Client();
  list : Governorate[] = GOVERNORATES;
  suggestions: Governorate[] =  GOVERNORATES;
  mapboxToken =
    'pk.eyJ1IjoieW9zcmEtbmFqYXIiLCJhIjoiY2xmdGw2a20wMDF4eTNxcDBiMHZycnZpdCJ9.PTo1tyEyJry6uEKaqRLkRQ';
  placeSearchControl = new FormControl('');


  ngOnInit(): void {
    console.log(this.suggestions);
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
  addOne(myForm: NgForm): void {
    if (myForm.valid) {
      this._clientService.addUser(this.Client).subscribe(() => {
        this._router.navigate([`../../`], { relativeTo: this._route }).then();
      });
    }
  }
  selectSuggestion(suggestion: any) {
    if (suggestion) {
      console.log('Selected location:', suggestion);
      this.suggestions = [];
      this.Client.city?.coordinates!= suggestion.coordinates;
      this.Client.city?.gouvernorat!= suggestion.name;
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
}
