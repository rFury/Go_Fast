import { Component, Inject, inject, OnInit, signal } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { MapService } from '../../../../../Shared/Services/map.service';
import { MatIconModule } from '@angular/material/icon';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatButtonModule } from '@angular/material/button';
import { CardComponent } from '../../../../../Shared/Components/card/card.component';
import { Order } from '../../../../../Shared/Models/Order.model';
import { OrderService } from '../../../../../Shared/Services/order.service';
import { Animations } from '../../../../../Shared/Animations/public-api';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FuseSplashScreenService } from '../../../../../Shared/Services/splash-screen.service';
import { Agent } from '../../../../../Shared/Models/Agent.model';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SnackBarService } from '../../../../../Shared/Services/snack-bar.service';
import { NgClass } from '@angular/common';
@Component({
  selector: 'app-order-details',
  imports: [
    MatIconModule,
    MatButtonModule,
    CardComponent,
    MatMenuModule,
    MatTooltipModule,
    NgClass,
  ],
  animations: Animations,
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.scss',
})
export class OrderDetailsComponent implements OnInit {
  details: boolean = true;
  map: mapboxgl.Map;
  dragging = signal(false);
  private _mapService = inject(MapService);
  private _orderService = inject(OrderService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private clipboard = inject(Clipboard);
  private snackBar = inject(SnackBarService);

  Order: Order | null = null;
  Agent: Agent | null = null;

  copied = false;
  agentDetails = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || undefined;
    if (!id) return;
    this.initializeMap();
    this._orderService.getOrder(id).subscribe({
      next: (res) => {
        console.log(res);
        this.Order = res;
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.innerHTML = `<img src="location-a-icon.svg" alt="Marker" class="w-8 h-8 animate-pulse">`;
        new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat(
            new mapboxgl.LngLat(
              this.Order?.pick_up?.place?.coordinates![0]!,
              this.Order?.pick_up?.place?.coordinates![1]!
            )
          )
          .addTo(this.map!);
        const el2 = document.createElement('div');
        el2.className = 'custom-marker';
        el2.innerHTML = `<img src="location-b-icon.svg" alt="Marker2" class="w-8 h-8 animate-pulse">`;
        new mapboxgl.Marker({ element: el2, anchor: 'bottom' })
          .setLngLat(
            new mapboxgl.LngLat(
              this.Order?.destination?.place?.coordinates![0]!,
              this.Order?.destination?.place?.coordinates![1]!
            )
          )
          .addTo(this.map!);
        this.getRoute(
          this.Order.pick_up?.place?.coordinates!,
          this.Order.destination?.place?.coordinates!
        );
        if (this.Order.agent as Agent) {
          this.Agent = this.Order.agent as Agent;
        }
      },
      error: (err) => {
        console.log(err);
      },
      complete: () => {
        console.log('zebi');
      },
    });
  }

  private initializeMap(lng?: number, lat?: number): void {
    if (this.map) return;

    this.map = new mapboxgl.Map({
      accessToken: this._mapService.mapboxToken,
      container: 'map',
      style: 'mapbox://styles/mapbox/standard',
      center: new mapboxgl.LngLat(lng ?? 10.1956, lat ?? 36.8625),
      zoom: 12,
      pitch: 0,
      bearing: 0,
    });
    this.map.on('dragstart', () => this.dragging.set(true));
    this.map.on('dragend', () => this.dragging.set(false));
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
            'line-color': '#0ea5e9',
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
  cancelOrder() {}
  goBack() {
    this.router.navigate(['/orders']);
  }
  detailsAgent() {
    if (this.Agent) {
      this.agentDetails = true;
    }
  }
  copy(code: string) {
    this.clipboard.copy(code);
    this.snackBar.openSnackBar('Copied to clipboard!', 'success');
    this.copied = true;
    setTimeout(() => {
      this.copied = false;
    }, 3000);
  }
}
