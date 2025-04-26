import { Component, inject, OnInit, signal } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { MapService } from '../../../../Shared/Services/map.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  MatSelectModule,
  MatSelectTrigger,
  MatSelect,
} from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import {
  MatButtonToggleModule,
  MatButtonToggleGroup,
} from '@angular/material/button-toggle';
import { Order } from '../../../../Shared/Models/Order.model';
import { FormsModule } from '@angular/forms';
import { DeliveryType } from '../../../../Shared/enums/delivery.enums';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { selectMapComponent } from '../../../../Shared/Components/map-select/map.component';
import { Place } from '../../../../Shared/Models/Place.model';
import { Point } from '../../../../Shared/Models/Point.model';
@Component({
  selector: 'app-new-order',
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatSelectTrigger,
    MatSelect,
    MatOptionModule,
    MatButtonToggleModule,
    MatButtonToggleGroup,
    FormsModule,
    MatIconModule,
    NgClass,
    selectMapComponent
  ],
  templateUrl: './new-order.component.html',
  styleUrl: './new-order.component.css',
})
export class NewOrderComponent implements OnInit {
userLocation: { lng: number; lat: number; } = { lng: 10.1956, lat: 36.8625 };
onSelectPlace($event: Place,arg1: string) {
throw new Error('Method not implemented.');
}
  hideSingleSelectionIndicator = signal(false);
  Order = new Order();
  PointA = new Point();
  PointB = new Point();
  DeliveryType = DeliveryType;
  map: mapboxgl.Map;
  private _mapService = inject(MapService);
searchQueryA: string;
  ngOnInit(): void {
    this.Order.type = DeliveryType.building;
    setTimeout(() => {
      this.map = new mapboxgl.Map({
        accessToken: this._mapService.mapboxToken,
        container: 'map',
        style: 'mapbox://styles/mapbox/standard',
        center: new mapboxgl.LngLat(10.1956, 36.8625),
        zoom: 15,
        pitch: 0,
        bearing: 0,
      });
      /*
      // Add click event listener for markers
      this.map.on('click', (e) => {
        this.addMarker(e.lngLat);
      });

      if(this.approximity){
        this.addMarker(lnglat);
      }*/
    }, 0);
  }
}
