import {Component, inject, OnInit, signal} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgForm, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';

import { MatOption } from '@angular/material/core';
import { MatSelect, MatSelectChange, MatSelectTrigger } from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel, MatError, MatHint } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import {forkJoin, startWith,map} from "rxjs";
import { FuseConfirmationService } from '../../../../../../../../Shared/Components/confirmation/confirmation.service';
import { listFeatureStatus } from '../../../../../../../../Shared/enums/featureStatus';
import { Feature } from '../../../../../../../../Shared/Models/Feature.model';
import { FeatureService } from '../../../../../../../../Shared/Services/feature.service';
import { LoadingService } from '../../../../../../../../Shared/Services/loading.service';
import { material } from '../../../../../../icons/data';
import { icon } from '../../../../../../../../Shared/enums/iconType';
import { FeatureType, listFeatureType } from '../../../../../../../../Shared/enums/featureType';
import { HasPermissionDirective } from '../../../../../../../../Shared/directives/permission/has-permission.directive';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Point } from '../../../../../../../../Shared/Models/Point.model';
import { DeliveryType, listOrderType } from '../../../../../../../../Shared/enums/delivery.enums';
import { Client } from '../../../../../../../../Shared/Models/Client.model';
import { Order } from '../../../../../../../../Shared/Models/Order.model';
import { Place } from '../../../../../../../../Shared/Models/Place.model';
import { OrderService } from '../../../../../../../../Shared/Services/order.service';
import { UserService } from '../../../../../../../../Shared/Services/user.service';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { NgClass } from '@angular/common';
import { MapComponent } from '../../../../../../../../Shared/Components/map/map.component';
import { CurriedFunction4 } from 'lodash';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  imports: [
    FormsModule,
    MatButton,
    MatIcon,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    MatSelect,
    MatSelectTrigger,
    MatOption,
    ReactiveFormsModule,
    HasPermissionDirective,
    NgxMatSelectSearchModule,
    MatButtonToggleModule,
    MatCardModule,
    MatHint,
    NgClass,
    MapComponent
  ],
})
export class EditComponent implements OnInit {
   
  hideSingleSelectionIndicator = signal(false);
  //********* INJECT SERVICES ***********//
  _userService = inject(UserService);
  _orderService = inject(OrderService);
  _router = inject(Router);
  _fuseConfirmationService = inject(FuseConfirmationService);
  _route = inject(ActivatedRoute);
  _loadingService = inject(LoadingService);
  //********* DECLARE CLASSES/ENUMS ***********//
  Order = new Order();
  PointA  = new Point();
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
  mapboxToken =
    'pk.eyJ1IjoieW9zcmEtbmFqYXIiLCJhIjoiY2xmdGw2a20wMDF4eTNxcDBiMHZycnZpdCJ9.PTo1tyEyJry6uEKaqRLkRQ';
  userLocation = { lat: 36.8, lng: 10.2 };
  close:boolean = false;
  coordinatesA: [number,number] | null = null;
  coordinatesB: [number,number] | null = null;
  userFilterControl: FormControl<any> = new FormControl();
  listUsers: Client[] = [];
  filteredListUsers : Client[] = [];
  client!: Client;
  clientLabel: string='';
  id = this._route.snapshot.paramMap.get('id') || undefined;
  ngOnInit(): void {
    this.Order.type = DeliveryType.building;
    if (this.id) {
      this._loadingService.show()
      forkJoin([
          this._userService.getAll("client"),
          this._orderService.getOrder(this.id),
      ]).subscribe({
          next: (result:[Client[], Order]) => {
              this.listUsers = result[0];
              this.filteredListUsers = result[0];
              this.Order = result[1];
              this.client = this.Order.client as Client;
              this.clientLabel=this.client.first_name+" "+this.client.last_name+" ("+this.client.email+")"
              this.PointA = this.Order.pick_up as Point;
              this.PointB = this.Order.destination as Point;
              this.searchQueryA = this.Order.pick_up?.place?.gouvernorat+", "+this.Order.pick_up?.place?.name;
              this.searchQueryB = this.Order.destination?.place?.gouvernorat+", "+this.Order.destination?.place?.name;
              this.coordinatesA = this.Order.pick_up?.place?.coordinates!;
              this.coordinatesB = this.Order.destination?.place?.coordinates!;
              console.log(this.Order);
              this._loadingService.hide()
          },
          error: () => {
              this._loadingService.hide()
          }
      });
  }
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

  updateOrder(myForm: NgForm): void {
    if (myForm.valid && !myForm.pristine) {
      this.Order.client = this.client._id;
      this.Order.pick_up != this.PointA;
      this.Order.destination != this.PointB;
        console.log(this.Order)
      this._orderService.updateOrder(this.Order).subscribe(() => {
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
  onSearchChange(type:string) {
    let searchQuery
    if(type==='a'){
      searchQuery = this.searchQueryA;
    }
    else{
      searchQuery = this.searchQueryB;
    }
    if (searchQuery.length < 3) {
      this.suggestions = [];
      return;
    }
    fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        searchQuery
      )}.json?country=TN&proximity=${this.userLocation.lng},${
        this.userLocation.lat
      }&access_token=${this.mapboxToken}&limit=10`
    )
      .then((res) => res.json())
      .then((data) => {
        this.suggestions = data.features;
        this.suggestions.sort((a, b) => {
          let distanceA = this.getDistance(a);
          let distanceB = this.getDistance(b);
          return Number(distanceA) - Number(distanceB);
        });
      });
  }

  selectSuggestion(suggestion: any,type:string) {
    console.log('Selected location:', suggestion);
    let place:Place = new Place();
    place.id = suggestion.id;
    place.setPlace(suggestion.place_name,'');
    place.coordinates = suggestion.geometry.coordinates;
    if(type==='a'){
      this.searchQueryA = suggestion.place_name;
      this.coordinatesA = [suggestion.geometry.coordinates[0],suggestion.geometry.coordinates[1]];
      this.PointA.place = place;
    } else if(type==='b'){
      this.searchQueryB = suggestion.place_name;
      this.PointB.place = place;
      this.coordinatesB = [suggestion.geometry.coordinates[0],suggestion.geometry.coordinates[1]];
    }
    this.suggestions = [];
    console.log(this.Order);
    
  }
  onMarkersChanged(markers: mapboxgl.Marker): void {
    console.log('Got markers:', markers);
  }

  getDistance(suggestion: any): string {
    const from = [this.userLocation.lng, this.userLocation.lat];
    const to = suggestion.geometry.coordinates;
    const distance = this.calculateDistance(from, to);
    return distance.toFixed(1);
  }

  // Haversine formula
  calculateDistance([lng1, lat1]: number[], [lng2, lat2]: number[]) {
    const R = 6371; // km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }
  onUserSelected($event: MatSelectChange<any>) {
    this.userLocation.lng = this.client.city!.coordinates[0];
    this.userLocation.lat = this.client.city!.coordinates[1];
    }

    cancelEdit(myForm: NgForm) {
      if (myForm.pristine) {
        this._router.navigate([`../../`], { relativeTo: this._route }).then();
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
            this._router.navigate([`../../`], { relativeTo: this._route }).then();
          }
        });
      }
    }
  deleteOrder(order) {
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
          this._orderService.deleteOrder(order._id).subscribe(() => {
            this._router.navigate(['/admin/dashboard/features']).then();
          });
        }
      });
    }

}

