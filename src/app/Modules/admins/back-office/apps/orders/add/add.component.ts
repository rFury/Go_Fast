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
import { MatSelect, MatSelectChange, MatSelectTrigger } from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import {
  MatFormField,
  MatLabel,
  MatError,
  MatHint,
} from '@angular/material/form-field';
import { MatButton } from '@angular/material/button';
import { forkJoin, map, startWith } from 'rxjs';
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
import { MapComponent } from '../../../../../../Shared/Components/map/map.component';
import { Client } from '../../../../../../Shared/Models/Client.model';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { UserService } from '../../../../../../Shared/Services/user.service';
import { OrderService } from '../../../../../../Shared/Services/order.service';
import { Place } from '../../../../../../Shared/Models/Place.model';
import { MapService } from '../../../../../../Shared/Services/map.service';
import { selectMapComponent } from '../../../../../../Shared/Components/map-select/map.component';
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
    MatOption,
    ReactiveFormsModule,
    MatIcon,
    HasPermissionDirective,
    MatHint,
    MatButtonToggleModule,
    MatCheckboxModule,
    NgClass,
    MapComponent,
    MatSelectTrigger,
    NgxMatSelectSearchModule,
    selectMapComponent,
  ],
})
export class AddComponent implements OnInit {
  hideSingleSelectionIndicator = signal(false);
  //********* INJECT SERVICES ***********//
  _userService = inject(UserService);
  _mapService=inject(MapService)
  _orderService = inject(OrderService);
  _router = inject(Router);
  _fuseConfirmationService = inject(FuseConfirmationService);
  _route = inject(ActivatedRoute);
  _loadingService = inject(LoadingService);
  //********* DECLARE CLASSES/ENUMS ***********//
  Order = new Order();
  PointA = new Point();
  PointB = new Point();
  listParentFeatures: Feature[] = [];
  hover:boolean = false;
  readonly FeatureType = FeatureType;
  DeliveryType = DeliveryType;
  OrderTypes = listOrderType;
  placeSearchControl = new FormControl('');
  searchQueryA = '';
  searchQueryB = '';
  suggestions: any[] = [];
  mapboxToken ='pk.eyJ1IjoieW9zcmEtbmFqYXIiLCJhIjoiY2xmdGw2a20wMDF4eTNxcDBiMHZycnZpdCJ9.PTo1tyEyJry6uEKaqRLkRQ';
  userLocation = { lat: 36.8, lng: 10.2 };
  close:boolean = false;
  coordinatesA: [number,number] | null = null;
  coordinatesB: [number,number] | null = null;
  userFilterControl: FormControl<any> = new FormControl();
  listUsers: Client[] = [];
  filteredListUsers : Client[] = [];
  client!: Client;
  ngOnInit(): void {
    this.Order.type = DeliveryType.building;
    this._loadingService.show();
      this._userService.getAll("client").subscribe({
        next:(result) => {
          this.filteredListUsers = result;
          this.listUsers = result;
            this._loadingService.hide();
        },
        error: () => {
            this._loadingService.hide();
        }
    })
    this.userFilterControl.valueChanges
    .pipe(
      startWith(''),
      map(search => search?.toLowerCase() || '')
    )
    .subscribe(search => {
      this.filteredListUsers = this.listUsers.filter(icon => 
        icon.email!.toLowerCase().includes(search)
      );
    });
  }
  toggleSingleSelectionIndicator() {
    this.hideSingleSelectionIndicator.update((value) => !value);
  }
  addOrder(myForm: NgForm): void {
    if (myForm.valid) {
      this.Order.client = this.client._id;
      this.Order.pick_up = this.PointA;
      this.Order.destination = this.PointB;
        console.log(this.Order)
        
      this._orderService.addOrderAdmin(this.Order).subscribe(() => {
        this._router.navigate([`../../`], { relativeTo: this._route }).then();
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
  onSelectPlace($event: Place,who:string) {
    if(who==='a'){
      this.PointA.place = $event;
      this.coordinatesA = $event?.coordinates!;
    }else{
      this.PointB.place = $event;
      this.coordinatesB = $event?.coordinates!;
    }
  }


  onMarkersChanged(markers: mapboxgl.Marker,type:string): void {
    this._mapService.reverseGeocode(markers._lngLat.lng,markers._lngLat.lat).subscribe(place =>{
      if(type==='a'){
        this.PointA.place = place!;
        this.searchQueryA = place!.name+', '+place!.gouvernorat;
        this.coordinatesA = place?.coordinates!;
      }else{
        this.PointB.place = place!;
        this.searchQueryB = place!.name+', '+place!.gouvernorat;
        this.coordinatesB = place?.coordinates!;
      }
    });
  }



  onUserSelected($event: MatSelectChange<any>) {
    this.userLocation.lng = this.client.city!.coordinates[0];
    this.userLocation.lat = this.client.city!.coordinates[1];
    }
}
