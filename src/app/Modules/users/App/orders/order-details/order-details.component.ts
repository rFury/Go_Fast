import { Component, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
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
import { ActivatedRoute, Router } from '@angular/router';
import { Agent } from '../../../../../Shared/Models/Agent.model';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SnackBarService } from '../../../../../Shared/Services/snack-bar.service';
import { Subscription } from 'rxjs';
import { Status } from '../../../../../Shared/enums/status.enums';
import { CommonModule } from '@angular/common';
import { NotificationPromptService } from '../../../../../Shared/Components/notification-prompt/notification.service';
import { LocationService } from '../../../../../Shared/Services/agent-location.service';
import { OrderDetailsCardComponent } from '../../../../../Shared/Components/order details/order.details.component';
import { JourneyService } from '../../../../../Shared/Services/Journey.service';
import { FuseConfirmationService } from '../../../../../Shared/Components/confirmation/confirmation.service';

@Component({
  selector: 'app-order-details',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    CardComponent,
    MatMenuModule,
    MatTooltipModule,
    OrderDetailsCardComponent,
  ],
  animations: Animations,
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.scss',
})
export class OrderDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('flippableCard') flippableCard!: CardComponent;
  details: boolean = true;
  map: mapboxgl.Map;
  dragging = signal(false);
  Status = Status;
  AgentId: string | null = null;
  private _mapService = inject(MapService);
  private _orderService = inject(OrderService);
  private _agentLocationService = inject(LocationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private clipboard = inject(Clipboard);
  private snackBar = inject(SnackBarService);
  private _notificationService = inject(NotificationPromptService);
  private _JourneyService = inject(JourneyService);
  private _fuseConfirmationService = inject(FuseConfirmationService);

  private orderSubscription: Subscription | null = null;
  private locationSubscription: Subscription | null = null;
  time = 0;

  Order: Order | null = null;
  Agent: Agent | null = null;
  isActive = false;
  trackingRouteInitialized = false;
  notificationShown: boolean = false;
  notification15Shown: boolean = false;
  notification10Shown: boolean = false;
  notification5Shown: boolean = false;

  copied = false;
  agentDetails = false;
  agentMarker: mapboxgl.Marker | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || undefined;
    if (!id) return;
    this.initializeMap();
    this._orderService.getOrder(id).subscribe({
      next: (res) => {
        this.updateOrderData(res);
      },
      error: (err) => {
        console.log(err);
        this.router.navigate(['/404']);
      },
    });
  }

  ngOnDestroy(): void {
    if (this.orderSubscription) this.orderSubscription.unsubscribe();
    if (this.locationSubscription) this.locationSubscription.unsubscribe();
    if (this.map) this.map.remove();
  }

  private updateOrderData(order: Order): void {
    this.Order = order;
    if (this.Order.agent) {
      this.Agent = this.Order.agent as Agent;
    }
    console.log(this.Order);

    if (
      this.Order.status === Status.assigned ||
      this.Order.status === Status.pending
    ) {
      if(this.Order.onRoute){
        const el2 = document.createElement('div');
        el2.className = 'custom-marker';
        el2.innerHTML = `<img src="location-a-icon.svg" alt="Marker1" class="w-8 h-8 animate-pulse">`;
        new mapboxgl.Marker({ element: el2, anchor: 'bottom' })
          .setLngLat(
            new mapboxgl.LngLat(
              this.Order?.pick_up?.place?.coordinates![0]!,
              this.Order?.pick_up?.place?.coordinates![1]!
            )
          )
          .addTo(this.map!);
        this.handleTracking();
      }else{
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
      }
    } else if (this.Order.status === Status.picked_up) {
      if (this.Order.completed === true) {
        // In your updateOrderData method, replace the depot marker creation:
        const el = document.createElement('div');
        el.className = 'depot-marker';

        el.innerHTML = `
          <img src="pin.png" alt="depot" class="w-8 h-8 z-10 animate-pulse">`

        new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat(new mapboxgl.LngLat(10.276214, 36.759965))
          .addTo(this.map!);
        this.map.flyTo({
          center: [10.276214, 36.759965],
          zoom: 10,
          pitch: 0,
          bearing: 0,
        });
      } else {
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
        this.handleTracking();
      }
    }
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
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#0ea5e9',
            'line-width': 5,
            'line-opacity': 0.75,
          },
        });
        const coordinates = route.coordinates;
        const bounds = coordinates.reduce(
          (b, coord) => b.extend(coord),
          new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
        );
        this.map.fitBounds(bounds, { padding: 50, animate: true });
      });
  }

  private updateTrackingRoute(agentCoordinates: [number, number]): void {
    if (!this.Order) return;
    let targetCoordinates: [number, number];
    if (this.Order.status === Status.assigned) {
      targetCoordinates = this.Order.pick_up?.place?.coordinates!;
    } else if (this.Order.status === Status.picked_up) {
      targetCoordinates = this.Order.destination?.place?.coordinates!;
    } else {
      return;
    }
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${agentCoordinates[0]},${agentCoordinates[1]};${targetCoordinates[0]},${targetCoordinates[1]}?geometries=geojson&access_token=${this._mapService.mapboxToken}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const route = data.routes[0].geometry;
        if (!this.map) return;
        const source = this.map.getSource('tracking-route') as
          | mapboxgl.GeoJSONSource
          | undefined;
        if (source && typeof source.setData === 'function') {
          source.setData({
            type: 'Feature',
            properties: {},
            geometry: route,
          });
        } else {
          this.map.addSource('tracking-route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: route,
            },
          });
          this.map.addLayer({
            id: 'tracking-route',
            type: 'line',
            source: 'tracking-route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#22c55e',
              'line-width': 5,
              'line-opacity': 0.75,
            },
          });
        }
        const coordinates = route.coordinates;
        const bounds = coordinates.reduce(
          (b, coord) => b.extend(coord),
          new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
        );
        this.map.fitBounds(bounds, { padding: 50, animate: true });
      });
  }

  cancelOrder() {
    const confirmation = this._fuseConfirmationService.open({
      title: 'Cancel',
      message: 'Would you like to cancel the order ?',
      actions: {
        confirm: {
          label: 'yes',
        },
        cancel: {
          label: 'no',
        },
      },
    });

    confirmation.afterClosed().subscribe((result) => {
      if (result === 'confirmed') {
        this._orderService
          .getOrdersAgent(this.Order?._id!)
          .subscribe((agentId) => {
            this._JourneyService.subscribeToJourney(agentId!);
            this._JourneyService.cancelOrder(agentId, this.Order!);
            this.router.navigate(['/orders']);
          });
      }
    });
  }

  goBack() {
    this.router.navigate(['/orders']);
  }

  detailsAgent() {
    if (this.Agent) this.agentDetails = true;
  }

  copy(code: string) {
    this.clipboard.copy(code);
    this.snackBar.openSnackBar('Copied to clipboard!', 'success');
    this.copied = true;
    setTimeout(() => (this.copied = false), 3000);
  }

  private calculateDistance(
    point1: [number, number],
    point2: [number, number]
  ): number {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(point2[1] - point1[1]);
    const dLon = toRad(point2[0] - point1[0]);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(point1[1])) *
        Math.cos(toRad(point2[1])) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private showNotification(title: string, text: string) {
    const notificationOptions = {
      body: text,
      icon: 'logo-white-canvas-removebg-preview.png',
    };
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, notificationOptions);
    });
  }

  private handleTracking(): void {
    if (this.Agent && !this.locationSubscription) {
      this._agentLocationService.subscribeToAgent(this.Agent._id!);
      console.log('before zeby');
      console.log(this.Agent._id);

      this.locationSubscription = this._agentLocationService
        .getAgentLocations(this.Agent._id!)
        .subscribe((data) => {
          console.log('zebi');
          if (!this.isActive) {
            this.isActive = true;
            if (this.map.getSource('route')) {
              this.map.removeLayer('route');
              this.map.removeSource('route');
            }
          }
          this.updateAgentMarker(data.coordinates);
          this.updateTrackingRoute(data.coordinates);

          let orderLoc: [number, number] | null = null;
          if (this.Order?.status === Status.assigned) {
            orderLoc = this.Order.pick_up?.place?.coordinates!;
          } else if (this.Order?.status === Status.picked_up) {
            orderLoc = this.Order.destination?.place?.coordinates!;
          }
          if (orderLoc) {
            const distance = this.calculateDistance(data.coordinates, orderLoc);
            this.time = distance / 0.5;
            if (distance < 0.05 && !this.notificationShown) {
              setTimeout(() => {
                this.getOrderTimeout(this.Order!._id!);
              }, 10000);
              this.showNotification(
                this.Order?.status === Status.assigned
                  ? 'Driver is at pick-up location!'
                  : 'Driver is at destination!',
                'Your driver is at the location, please contact!'
              );
              this._notificationService.openNotification(
                this.Order?.status === Status.assigned
                  ? 'Driver is at pick-up location!'
                  : 'Driver is at destination!',
                'Your driver is at the location, please contact!',
                'order',
                false,
                () => {},
                () => {},
                50000
              );
              this.notificationShown = true;
              this.notification5Shown = true;
              this.notification10Shown = true;
              this.notification15Shown = true;
            } else if (this.time < 5 && !this.notification5Shown) {
              this.showNotification(
                'Driver is almost here!',
                `Your driver is 5 minutes away from ${
                  this.Order?.status === Status.assigned
                    ? 'pick-up'
                    : 'destination'
                }`
              );
              this._notificationService.openNotification(
                'Driver is almost here!',
                `Driver is 5 minutes away from ${
                  this.Order?.status === Status.assigned
                    ? 'pick-up'
                    : 'destination'
                }`,
                'order',
                false,
                () => {},
                () => {},
                50000
              );
              this.notification5Shown = true;
              this.notification10Shown = true;
              this.notification15Shown = true;
            } else if (this.time < 10 && !this.notification10Shown) {
              this.showNotification(
                'Driver is almost here!',
                `Your driver is 10 minutes away from ${
                  this.Order?.status === Status.assigned
                    ? 'pick-up'
                    : 'destination'
                }`
              );
              this._notificationService.openNotification(
                'Driver is almost here!',
                `Driver is 10 minutes away from ${
                  this.Order?.status === Status.assigned
                    ? 'pick-up'
                    : 'destination'
                }`,
                'order',
                false,
                () => {},
                () => {},
                50000
              );
              this.notification10Shown = true;
              this.notification15Shown = true;
            } else if (this.time < 15 && !this.notification15Shown) {
              this.showNotification(
                'Driver is almost here!',
                `Your driver is 15 minutes away from ${
                  this.Order?.status === Status.assigned
                    ? 'pick-up'
                    : 'destination'
                }`
              );
              this._notificationService.openNotification(
                'Driver is almost here!',
                `Driver is 15 minutes away from ${
                  this.Order?.status === Status.assigned
                    ? 'pick-up'
                    : 'destination'
                }`,
                'order',
                false,
                () => {},
                () => {},
                50000
              );
              this.notification15Shown = true;
            }
          }
        });
    } else if (!this.isActive && this.locationSubscription) {
      this.locationSubscription.unsubscribe();
      this.locationSubscription = null;
      if (this.agentMarker) {
        this.agentMarker.remove();
        this.agentMarker = null;
      }
      if (this.map.getSource('tracking-route')) {
        this.map.removeLayer('tracking-route');
        this.map.removeSource('tracking-route');
      }
    }
  }

  private getOrderTimeout(id:string){
    this._orderService.getOrder(id).subscribe((order) => {
      this.Order = order;
      if (this.Order.agent) {
        this.Agent = this.Order.agent as Agent;
      }
    });
  }

  private updateAgentMarker(coordinates: [number, number]): void {
    if (!this.agentMarker) {
      const el = document.createElement('div');
      el.className = 'agent-marker';
      if (this.Agent?.avatar) {
        el.style.backgroundImage = `url(${this.Agent.avatar})`;
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center';
        el.style.backgroundRepeat = 'no-repeat';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid #fff';
        el.style.boxShadow = '0 0 10px 0 rgba(0, 0, 0, 0.1)';
        el.style.transition = 'all 0.1s ease';
        el.style.cursor = 'pointer';
        el.style.padding = '0';
        el.style.margin = '0';
        el.innerHTML = `<img src="${this.Agent.avatar}" alt="agent" class="w-14 h-14 z-10 animate-pulse rounded-full bg-transparent">`
      } else{
        el.innerHTML = `<div (click)="flippableCard.face = flippableCard.face === 'front' ? 'back' : 'front'" class="w-14 h-14 z-10 animate-pulse rounded-full flex items-center justify-center bg-gray-200 text-black font-bold text-3xl pointer-cursor">${this.Agent?.first_name?.charAt(0).toUpperCase()}</div>`
      }
      el.addEventListener('click', () => {
        this.flippableCard.face = this.flippableCard.face === 'front' ? 'back' : 'front'
      });
      this.agentMarker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat(coordinates)
        .addTo(this.map);
    } else {
      this.agentMarker.setLngLat(coordinates);
    }
  }
}
