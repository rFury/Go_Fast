import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormControl,
  NgForm,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatOption } from '@angular/material/core';
import { MatSelect, MatSelectTrigger } from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import {
  MatFormField,
  MatLabel,
  MatError,
  MatHint,
} from '@angular/material/form-field';
import { MatButton } from '@angular/material/button';
import { forkJoin } from 'rxjs';
import { Animations } from '../../../../../../Shared/Animations/public-api';
import { listFeatureStatus } from '../../../../../../Shared/enums/featureStatus';
import {
  FeatureType,
  listFeatureType,
} from '../../../../../../Shared/enums/featureType';
import { Feature } from '../../../../../../Shared/Models/Feature.model';
import { FeatureService } from '../../../../../../Shared/Services/feature.service';
import { FuseConfirmationService } from '../../../../../../Shared/Components/confirmation/confirmation.service';
import { LoadingService } from '../../../../../../Shared/Services/loading.service';
import { material } from '../../../../icons/data';
import { icon } from '../../../../../../Shared/enums/iconType';
import { HasPermissionDirective } from '../../../../../../Shared/directives/permission/has-permission.directive';
import { Order } from '../../../../../../Shared/Models/Order.model';
import {
  DeliveryType,
  listOrderType,
} from '../../../../../../Shared/enums/delivery.enums';
import { MatCard, MatCardModule } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Point } from '../../../../../../Shared/Models/Point.model';
import { CommonModule, NgClass } from '@angular/common';
import * as mapboxgl from 'mapbox-gl';

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
    MatCardModule,
    MatSelectTrigger,
    MatOption,
    ReactiveFormsModule,
    MatIcon,
    HasPermissionDirective,
    MatHint,
    MatDivider,
    MatButtonToggleModule,
    MatCheckboxModule,
    NgClass,
  ],
})
export class AddComponent implements OnInit {
  hideSingleSelectionIndicator = signal(false);
  pickupAddress: string = '';
  entranceType: string = '';
  floor!: number;
  apartment!: string;
  entryphone!: string;
  phoneNumber!: string;
  instructions: string = '';
  //********* INJECT SERVICES ***********//
  _featureService = inject(FeatureService);
  _router = inject(Router);
  _fuseConfirmationService = inject(FuseConfirmationService);
  _route = inject(ActivatedRoute);
  _loadingService = inject(LoadingService);
  //********* DECLARE CLASSES/ENUMS ***********//
  Order = new Order();
  PointA = new Point();
  PointB = new Point();
  listParentFeatures: Feature[] = [];

  readonly FeatureType = FeatureType;
  DeliveryType = DeliveryType;
  OrderTypes = listOrderType;
  map: mapboxgl.Map;
  lat = 36.3398;
  lng = 10.7787;
  indexStyle = 0;
  styles = [
    'mapbox://styles/mapbox/satellite-streets-v12',
    'mapbox://styles/mapbox/light-v11',
  ];

  ngOnInit(): void {
    this.Order.type = DeliveryType.building;
    /*this._loadingService.show();
    /*forkJoin([
        this._featureService.getFeatureParent()
    ]).subscribe({
        next:(result:[Feature[]]) => {
            this.listParentFeatures = result[0];
            this._loadingService.hide();
        },
        error: () => {
            this._loadingService.hide();
        }
    })*/
    this.map = new mapboxgl.Map({
      accessToken:
        'pk.eyJ1IjoiYmFjY291Y2htZWQiLCJhIjoiY2xrMTZwdHllMDRqdjNmcWo1aTQ0c3R4cyJ9.sPeFM-9VpxsoMHaHyWruQA',
      container: 'map',
      style: this.styles[this.indexStyle],
      zoom: 8,
      center: [this.lng, this.lat],
    });
    this.map.on('click', (event) => {
      console.info(event);
    });
  }
  switchMap(event) {
    event.stopPropagation();
    let style;
    if (this.indexStyle === 0) {
      this.indexStyle = 1;
      style = this.styles[1];
    } else {
      this.indexStyle = 0;
      style = this.styles[0];
    }
    this.map = new mapboxgl.Map({
      accessToken:
        'pk.eyJ1IjoieW9zcmEtbmFqYXIiLCJhIjoiY2xmdGw2a20wMDF4eTNxcDBiMHZycnZpdCJ9.PTo1tyEyJry6uEKaqRLkRQ',
      container: 'map',
      style,
      zoom: 8,
      center: [this.lng, this.lat],
    });
  }
  toggleSingleSelectionIndicator() {
    this.hideSingleSelectionIndicator.update((value) => !value);
  }
  addOrder(myForm: NgForm): void {
    /*if (myForm.valid) {
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
    }*/
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
