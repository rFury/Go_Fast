import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { DatePipe, NgClass, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import * as mapboxgl from 'mapbox-gl';
import { MatProgressSpinner, MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'Map',
  templateUrl: './map.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'Map',
  styleUrls: ['./map.component.scss'],
  imports: [MatButtonModule, MatIconModule, MatTooltipModule,MatProgressSpinnerModule],
})
export class MapComponent implements OnInit, OnDestroy {
  @ViewChild('notificationsOrigin') private _notificationsOrigin!: MatButton;
  @ViewChild('notificationsPanel')
  private _notificationsPanel!: TemplateRef<any>;
  @Input() approximity: [number, number] | null = null;
  @Input() markerIcon: string | null = null;
  isMapInitialized = false; // Add this flag
  @Output() markersChange = new EventEmitter<mapboxgl.Marker>();
  markers: mapboxgl.Marker[] = [];
  markerCount: number = 0;
  private _overlayRef!: OverlayRef;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  map: mapboxgl.Map;
  mapboxToken =
    'pk.eyJ1IjoieW9zcmEtbmFqYXIiLCJhIjoiY2xmdGw2a20wMDF4eTNxcDBiMHZycnZpdCJ9.PTo1tyEyJry6uEKaqRLkRQ';
  loading: boolean;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _overlay: Overlay,
    private _viewContainerRef: ViewContainerRef
  ) {}

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();

    // Dispose the overlay
    if (this._overlayRef) {
      this._overlayRef.dispose();
    }
    if (this.map) {
      this.map.remove();
    }
  }

  openPanel(): void {
    // Return if the notifications panel or its origin is not defined
    if (!this._notificationsPanel || !this._notificationsOrigin) {
      return;
    }

    // Create the overlay if it doesn't exist
    if (!this._overlayRef) {
      this._createOverlay();
    }

    // Attach the portal to the overlay
    this._overlayRef.attach(
      new TemplatePortal(this._notificationsPanel, this._viewContainerRef)
    );
    let lnglat;
    if(this.approximity){
       lnglat= new mapboxgl.LngLat(
        this.approximity[0],
        this.approximity[1]
      );
    }
    if (!this.isMapInitialized) {
      console.log(this.approximity);
      
      setTimeout(() => {
        this.map = new mapboxgl.Map({
          accessToken: this.mapboxToken,
          container: 'map',
          style: 'mapbox://styles/mapbox/standard',
          center: this.approximity==undefined?new mapboxgl.LngLat(10.1956,36.8625):this.approximity,
          zoom: 15,
        });
        // Add click event listener for markers
        this.map.on('click', (e) => {
          this.addMarker(e.lngLat);
        });

        if(this.approximity){
          this.addMarker(lnglat);
        }
      }, 0);
    }
    console.log(this.map);
  }
  addMarker(lngLat: mapboxgl.LngLat) {
    this.clearMarkers();
    let marker;
    if (this.markerIcon !== null) {
      console.log('zebi');

      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.innerHTML = `
            <img src="${this.markerIcon}" 
                 alt="Marker" 
                 class="w-8 h-8 animate-pulse">
        `;
      marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat(lngLat)
        .addTo(this.map);
      console.log(marker);
    } else {
      marker = new mapboxgl.Marker().setLngLat(lngLat).addTo(this.map);
    }
    this.markerCount++;
    this.markers.push(marker);
    this.markersChange.emit(this.markers[0]);
  }
  clearMarkers() {
    this.markers.forEach((marker) => marker.remove());
    this.markers = [];
    this.markerCount = 0;
  }

  closePanel(): void {
    this._overlayRef.detach();
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  private _createOverlay(): void {
    // Create the overlay
    this._overlayRef = this._overlay.create({
      hasBackdrop: true,
      backdropClass: 'fuse-backdrop-on-mobile',
      scrollStrategy: this._overlay.scrollStrategies.block(),
      positionStrategy: this._overlay
        .position()
        .flexibleConnectedTo(
          this._notificationsOrigin._elementRef.nativeElement
        )
        .withLockedPosition(true)
        .withPush(true)
        .withPositions([
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top',
          },
          {
            originX: 'start',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'bottom',
          },
          {
            originX: 'end',
            originY: 'bottom',
            overlayX: 'end',
            overlayY: 'top',
          },
          {
            originX: 'end',
            originY: 'top',
            overlayX: 'end',
            overlayY: 'bottom',
          },
        ]),
    });

    // Detach the overlay from the portal on backdrop click
    this._overlayRef.backdropClick().subscribe(() => {
      this._overlayRef.detach();
    });
  }
  checkFullyLoaded(){
    if (this.map) {
      this.loading=this.map._fullyLoaded===true?false:true;
      console.log(this.loading);
      if (this.loading) {
        setTimeout(()=>{
          this.checkFullyLoaded();
        },1000)
      }
    }else{
      setTimeout(()=>{
        this.checkFullyLoaded();
      },1000)
    }
  }
}
