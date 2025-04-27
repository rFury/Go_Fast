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
import { MatButtonModule } from '@angular/material/button';
import { FuseMediaWatcherService } from '../../../../Shared/Services/media-watcher/media-watcher.service';
import { takeUntil } from 'rxjs';
@Component({
  selector: 'app-new-order',
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatSelectTrigger,
    MatSelect,
    MatOptionModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatButtonToggleGroup,
    FormsModule,
    MatIconModule,
    NgClass,
    selectMapComponent,
  ],
  templateUrl: './new-order.component.html',
  styleUrl: './new-order.component.scss',
})
export class NewOrderComponent implements OnInit {
  isScreenSmall: boolean=false;
  dragging = signal(false);
  userLocation: { lng: number; lat: number } = { lng: 10.1956, lat: 36.8625 };
  searchQueryB: string;
  hideSingleSelectionIndicator = signal(false);
  Order = new Order();
  PointA = new Point();
  PointB = new Point();
  DeliveryType = DeliveryType;
  map: mapboxgl.Map;
  private _mapService = inject(MapService);
  private _fuseMediaWatcherService = inject(FuseMediaWatcherService);
  searchQueryA: string;
  ngOnInit(): void {
    this.Order.type = DeliveryType.building;
    this.InitializeMap();
    this._fuseMediaWatcherService.onMediaChange$
      .pipe()
      .subscribe(({matchingAliases}) => {
        this.isScreenSmall = !matchingAliases.includes('sm');
        this.InitializeMap(this.isScreenSmall);
      });
  }
  UserOrder() {
    console.log(this.Order);
    console.log(this.PointA);
    console.log(this.PointB);
  }
  InitializeMap(dragEffect?:boolean,lng?: number, lat?: number) {
    setTimeout(() => {
      this.map = new mapboxgl.Map({
        accessToken: this._mapService.mapboxToken,
        container: 'map',
        style: 'mapbox://styles/mapbox/standard',
        center: new mapboxgl.LngLat(lng || 10.1956, lat || 36.8625),
        zoom: 15,
        pitch: 0,
        bearing: 0,
      });
      this.map.on('load', () => {
        this.map.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.terrain-rgb',
          tileSize: 512,
          maxzoom: 14,
        });
      });
      if(dragEffect){
        this.map.on('dragstart', () => {
          this.dragging.set(true);
        });
        this.map.on('dragend', () => {
          this.dragging.set(false);
        });
      }
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
  onSelectPlace($event: Place, arg1: string) {
    this.InitializeMap(this.isScreenSmall,$event.coordinates![0], $event.coordinates![1]);
  }
}
