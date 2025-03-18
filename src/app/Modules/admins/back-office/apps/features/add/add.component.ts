import {Component, inject, OnInit} from '@angular/core';
import { FormControl, NgForm, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatOption } from '@angular/material/core';
import { MatSelect, MatSelectTrigger} from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatButton } from '@angular/material/button';
import {forkJoin} from "rxjs";
import { Animations } from '../../../../../../Shared/Animations/public-api';
import { listFeatureStatus } from '../../../../../../Shared/enums/featureStatus';
import { FeatureType, listFeatureType } from '../../../../../../Shared/enums/featureType';
import { Feature } from '../../../../../../Shared/Models/Feature.model';
import { FeatureService } from '../../../../../../Shared/Services/feature.service';
import { FuseConfirmationService } from '../../../../../../Shared/Components/confirmation/confirmation.service';
import { LoadingService } from '../../../../../../Shared/Services/loading.service';
import { material } from '../../../../icons/data';
import { icon } from '../../../../../../Shared/enums/iconType';

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
        MatSelect,
        MatSelectTrigger,
        MatOption,
        ReactiveFormsModule,
        MatIcon,
    ],
})
export class AddComponent implements OnInit {
    //********* INJECT SERVICES ***********//
    _featureService= inject(FeatureService);
    _router= inject(Router);
    _fuseConfirmationService= inject(FuseConfirmationService);
    _route= inject(ActivatedRoute);
    _loadingService = inject(LoadingService)
    //********* DECLARE CLASSES/ENUMS ***********//
    feature = new Feature();
    listParentFeatures: Feature[] = [];

    readonly FeatureType = FeatureType;
    listFeatureStatus = listFeatureStatus;
    listFeatureType = listFeatureType;
    filteredListIcons : icon[] = [];
    filteredListFeature : icon[] = [];
    listIcons = [];
    divider: string;
    iconFilterControl: FormControl<any> = new FormControl();

  ngOnInit(): void {
    this.listIcons != material;
    this.filteredListIcons != material;
    this._loadingService.show();
    forkJoin([
        this._featureService.getFeatureParent()
    ]).subscribe({
        next:(result:[Feature[]]) => {
            this.listParentFeatures = result[0];
            this._loadingService.hide();
        },
        error: () => {
            this._loadingService.hide();
        }
    })
    this.feature.divider = true;
  }
  addFeature(myForm: NgForm): void {
    if (myForm.valid) {
      this.feature.divider = this.divider === 'true';
      if (this.feature.type === FeatureType.group) {
        this.feature.link != null;
      } else {
        this.feature.subtitle != null;
      }
        console.log(this.feature)
      this._featureService.createFeature(this.feature).subscribe(() => {
        this._router.navigate([`../`], { relativeTo: this._route }).then();
      });
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
