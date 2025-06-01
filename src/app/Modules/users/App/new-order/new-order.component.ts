import { Component, inject, OnInit, signal, OnDestroy, AfterViewInit } from '@angular/core';
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
import { takeUntil, Subject } from 'rxjs';
import { state, style, trigger } from '@angular/animations';
import { Animations } from '../../../../Shared/Animations/public-api';
import { OrderService } from '../../../../Shared/Services/order.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-order',
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
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
  animations: Animations,
  templateUrl: './new-order.component.html',
  styleUrl: './new-order.component.scss',
})
export class NewOrderComponent implements OnInit,AfterViewInit, OnDestroy {
  toggle: boolean = false;
  private destroy$ = new Subject<void>();
  isScreenSmall: boolean = false;
  dragging = signal(false);
  userLocation: { lng: number; lat: number } = { lng: 10.1956, lat: 36.8625 };
  searchQueryB: string = '';
  hideSingleSelectionIndicator = signal(false);
  Order = new Order();
  PointA = new Point();
  PointB = new Point();
  DeliveryType = DeliveryType;
  map: mapboxgl.Map | null = null;
  private _mapService = inject(MapService);
  private _fuseMediaWatcherService = inject(FuseMediaWatcherService);
  private _orderService = inject(OrderService);
  private _router = inject(Router);
  searchQueryA: string = '';
  coordinatesA?: [number, number];
  coordinatesB?: [number, number];
  markers: { marker: mapboxgl.Marker; type: string }[] = [];

  ngOnInit(): void {
    this.Order.type = DeliveryType.building;
    this.initializeMap();

    this._fuseMediaWatcherService.onMediaChange$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ matchingAliases }) => {
        this.isScreenSmall = !matchingAliases.includes('sm');
        this.handleMapResize();
      });
  }
  ngAfterViewInit(): void {
    this.initializeMap();
  }
  ngOnDestroy(): void {
    this.destroyMap();
    this.destroy$.next();
    this.destroy$.complete();
  }
  private handleMapResize(): void {
    if (this.map) {
      setTimeout(() => this.map?.resize(), 100);
    }
  }

  private destroyMap(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.markers.forEach((m) => m.marker.remove());
    this.markers = [];
  }

  UserOrder(): void {
    console.log(this.Order);
    console.log(this.PointA);
    console.log(this.PointB);
    this.Order.pick_up = this.PointA;
    this.Order.destination = this.PointB;
    this._orderService.addOrder(this.Order).subscribe((res) => {
      this._router.navigate(['/orders/' + res.id]).then();
    });
  }

  private initializeMap(lng?: number, lat?: number): void {
    if (this.map) return;

    this.map = new mapboxgl.Map({
      accessToken: this._mapService.mapboxToken,
      container: 'OrderMap',
      style: 'mapbox://styles/mapbox/standard',
      center: new mapboxgl.LngLat(lng ?? 10.1956, lat ?? 36.8625),
      zoom: 12,
      pitch: 0,
      bearing: 0,
    });

    this.map.resize();
    this.setupMapEvents();
  }

  private setupMapEvents(): void {
    if (!this.map) return;

    this.map.on('load', () => {
      this.map?.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.terrain-rgb',
        tileSize: 512,
        maxzoom: 14,
      });
    });

    this.map.on('dragstart', () => this.dragging.set(true));
    this.map.on('dragend', () => this.dragging.set(false));
    this.map.on('click', (e) => this.addMarker(e.lngLat));
    this.map.on('mouseenter', () => this.updateCursor());
    this.map.on('mouseleave', () => this.updateCursor());
    this.map.getCanvas().style.cursor = `url(location-a-icon.svg) 16 16, auto`;
  }

  private updateCursor(): void {
    if (!this.map) return;
    const icon = this.getCursor();
    this.map.getCanvas().style.cursor =
      this.markers.length === 2 ? 'grab' : `url(${icon}) 16 16, auto`;
  }

  onSelectPlace(event: Place | undefined, type: 'a' | 'b'): void {
    if (!event) {
      this.removeMarker(type);
      this.clearPointData(type);
      if (this.map?.getSource('route')) {
        this.map?.removeLayer('route');
        this.map?.removeSource('route');
      }
      return;
    }
    this.flyToLocation(event.coordinates![0], event.coordinates![1]);
    this.updatePointData(event, type);
    this.addMarker(
      new mapboxgl.LngLat(event.coordinates![0], event.coordinates![1]),
      type
    );
  }

  private removeMarker(type: string): void {
    const markerIndex = this.markers.findIndex((m) => m.type === type);
    if (markerIndex === -1) return;

    this.markers[markerIndex].marker.remove();
    this.markers.splice(markerIndex, 1);
    this.updateCursor();
  }

  private clearPointData(type: 'a' | 'b'): void {
    if (type === 'a') {
      this.PointA = new Point();
      this.searchQueryA = '';
    } else {
      this.PointB = new Point();
      this.searchQueryB = '';
    }
  }

  private updatePointData(place: Place, type: 'a' | 'b'): void {
    let point = type === 'a' ? this.PointA : this.PointB;
    point.place = place;
    let coordinates = type === 'a' ? this.coordinatesA : this.coordinatesB;
    coordinates = place.coordinates;
    console.log(coordinates, 'coordinates' + type);

    if (type === 'a') {
      this.searchQueryA = `${place.name}, ${place.gouvernorat}`;
    } else {
      this.searchQueryB = `${place.name}, ${place.gouvernorat}`;
    }
  }

  addMarker(lngLat: mapboxgl.LngLat, type?: 'a' | 'b'): void {
    if (this.markers.length >= 2) {
      return;
    }

    const markerType = type ?? (this.markers.length === 0 ? 'a' : 'b');
    const icon = `location-${markerType}-icon.svg`;
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.innerHTML = `<img src="${icon}" alt="Marker" class="w-8 h-8 animate-pulse">`;

    const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat(lngLat)
      .addTo(this.map!);

    this.markers.push({ marker, type: markerType });
    this.updateCursor();
    this.onMarkersChanged(marker, markerType);
  }

  private getCursor(): string {
    if (this.markers.length >= 2) return 'grab';
    return this.markers.length === 0
      ? 'location-a-icon.svg'
      : 'location-b-icon.svg';
  }

  private onMarkersChanged(marker: mapboxgl.Marker, type: string): void {
    this._mapService
      .reverseGeocode(marker.getLngLat().lng, marker.getLngLat().lat)
      .subscribe((place) => {
        const point = type === 'a' ? this.PointA : this.PointB;
        point.place = place!;
        console.log(marker, 'place' + type);

        if (type === 'a') {
          this.searchQueryA = `${place!.name}, ${place!.gouvernorat}`;
          this.coordinatesA = place!.coordinates;
        } else {
          this.searchQueryB = `${place!.name}, ${place!.gouvernorat}`;
          this.coordinatesB = place!.coordinates;
        }
        if (this.markers.length === 2) {
          this.getRoute(this.coordinatesA!, this.coordinatesB!);
        }
      });
  }

  flyToLocation(lng: number, lat: number, zoom = 15) {
    if (!this.map) return;
    this.map.flyTo({
      center: [lng, lat],
      zoom,
      speed: 1.0,
      curve: 1.4,
      essential: true,
    });
  }
  getRoute(start: [number, number], end: [number, number]) {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${this._mapService.mapboxToken}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const route = data.routes[0].geometry;

        if (!this.map) return;
        // Remove old route layer if it exists
        if (this.map.getSource('route')) {
          this.map.removeLayer('route');
          this.map.removeSource('route');
        }

        this.map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: route,
          },
        });

        this.map.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#3887be',
            'line-width': 5,
            'line-opacity': 0.75,
          },
        });
        const coordinates = route.coordinates;
        const bounds = coordinates.reduce((b, coord) => {
          return b.extend(coord);
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

        this.map.fitBounds(bounds, {
          padding: 50,
          animate: true,
        });
      });
  }
}
