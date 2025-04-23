import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { DatePipe, NgClass, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
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
import { FormsModule } from '@angular/forms';
import { MapService } from '../../Services/map.service';
import { Place } from '../../Models/Place.model';
import { MatDialogRef } from '@angular/material/dialog';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'select-map',
  templateUrl: './map.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'select-map',
  styleUrls: ['./map.component.scss'],
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, FormsModule],
})
export class selectMapComponent implements OnInit, OnDestroy {
  @ViewChild('selectMap') selectMap!: TemplateRef<any>;
  @ViewChild('Zokicen') Zokicen!: ElementRef;
  _mapService = inject(MapService);
  _viewContainerRef = inject(ViewContainerRef);
  _overlay = inject(Overlay);
  searchQuery: string = '';
  suggestions: any[] = [];
  _overlayRef!: OverlayRef;
  @Input() userLocation: { lng: number; lat: number };
  @Output() selectPlace = new EventEmitter<Place>();

  ngOnInit(): void {}
  ngOnDestroy(): void {}
  onSearchChange(boolean: boolean) {
    if (this.searchQuery.length < 3) {
      this.suggestions = [];
      return;
    }
    // Create the overlay if it doesn't exist
    if (!this._overlayRef) {
      this._createOverlay();
      
    }
    if(!this._overlayRef.hasAttached()){
    this._overlayRef.attach(
      new TemplatePortal(this.selectMap, this._viewContainerRef)
    );
  }

    fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        this.searchQuery
      )}.json?country=TN&proximity=${this.userLocation.lng},${
        this.userLocation.lat
      }&access_token=${this._mapService.mapboxToken}&limit=10`
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
  selectSuggestion(suggestion: any) {
    let place: Place = new Place();
    place.id = suggestion.id;
    place.setPlace(suggestion.place_name, '');
    place.coordinates = suggestion.geometry.coordinates;
    this.searchQuery = suggestion.place_name;
    this.suggestions = [];
    this.selectPlace.emit(place);
  }
  getDistance(suggestion: any): string {
    const from = [this.userLocation.lng, this.userLocation.lat];
    const to = suggestion.geometry.coordinates;
    const distance = this._mapService.calculateDistance(from, to);
    return distance.toFixed(1);
  }
  private _createOverlay(): void
  {
      // Create the overlay
      this._overlayRef = this._overlay.create({
          hasBackdrop     : true,
          backdropClass   : 'fuse-backdrop-on-mobile',
          scrollStrategy  : this._overlay.scrollStrategies.block(),
          positionStrategy: this._overlay.position()
              .flexibleConnectedTo(this.Zokicen.nativeElement)
              .withLockedPosition(true)
              .withPush(true)
              .withPositions([
                  {
                      originX : 'start',
                      originY : 'bottom',
                      overlayX: 'start',
                      overlayY: 'top',
                  }, 
              ]),
              width: this.Zokicen.nativeElement.width,
      });

      // Detach the overlay from the portal on backdrop click
      this._overlayRef.backdropClick().subscribe(() =>
      {
          this._overlayRef.detach();
      });
      
  }
}
