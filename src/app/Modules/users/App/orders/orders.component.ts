import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { CardComponent } from '../../../../Shared/Components/card/card.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Order } from '../../../../Shared/Models/Order.model';
import { MapService } from '../../../../Shared/Services/map.service';
import { OrderService } from '../../../../Shared/Services/order.service';
import { Animations } from '../../../../Shared/Animations/public-api';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule } from '@angular/forms';
import { DatePipe, NgClass } from '@angular/common';
import { Pagination } from '../../../../Shared/Models/Pagination.model';
import * as mapboxgl from 'mapbox-gl';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import {
  listOrderStatus,
  OrderStatus,
} from '../../../../Shared/enums/status.enums';
import { OrderDetailsCardComponent } from '../../../../Shared/Components/order details/order.details.component';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-orders',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatRippleModule,
    MatMenuModule,
    MatTabsModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    FormsModule,
    NgClass,
    MatSelectModule,
    OrderDetailsCardComponent,
  ],
  animations: Animations,
  templateUrl: './orders.component.html',
  styles: [
    `
      .animate-fade-in {
        animation: fadeIn 0.5s ease-in;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }

        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
  providers: [DatePipe],
})
export class OrdersComponent implements OnInit {
  details: boolean = true;
  map: mapboxgl.Map;
  private _mapService = inject(MapService);
  private _orderService = inject(OrderService);
  protected _datePipe = inject(DatePipe);
  private _cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  _route = inject(ActivatedRoute);
  status = listOrderStatus;
  Order: Order | null = null;
  Orders: Order[] = [];
  date: Date = new Date();
  formattedDate: string = '';
  currentSize = 6;
  currentPage = 1;
  displayedList: Pagination<Order>;
  selectedOrderId: string | null = null;
  hidden = true;
  private markers: mapboxgl.Marker[] = [];
  private routeSources: string[] = [];
  max = 0;
  clicked = false;
  _fuseMediaWatcherService: any;
  isScreenSmall: boolean;

  ngOnInit(): void {
    this.formattedDate = this._datePipe.transform(this.date, 'dd/MM/yyyy')!;
    this.getOrders();
  }
  getSelectedDate(): void {
    console.log(this.date);
  }
  getDate(date: Date): string {
    return this._datePipe.transform(date, 'dd/MM/yyyy')!;
  }
  getTime(date: Date): string {
    return this._datePipe.transform(date, 'HH:mm')!;
  }
  getOrders(status: string = ''): void {
    console.log(status);
    this._orderService
      .getOrders(
        this.currentSize.toString(),
        this.currentPage.toString(),
        '',
        status === 'All' ? '' : status
      )
      .subscribe({
        next: (res) => {
          console.log(res);
          this.displayedList = res;
          this.Orders = this.displayedList.data;
          if (this.Orders.length > 0) {
            this.selectOrder(this.Orders[0]._id!, true);
          }
          this.max = res.total;
        },
      });
  }
  getOrdersByDate(): void {
    this._orderService
      .getOrders(
        this.currentSize.toString(),
        this.currentPage.toString(),
        this.formattedDate,
        ''
      )
      .subscribe({
        next: (res) => {
          console.log(res);
          this.displayedList = res;
          this.Orders = this.displayedList.data;
        },
      });
  }
  getOrdersByDateAndStatus(): void {
    this._orderService
      .getOrders(
        this.currentSize.toString(),
        this.currentPage.toString(),
        this.formattedDate,
        ''
      )
      .subscribe({
        next: (res) => {
          console.log(res);
          this.displayedList = res;
          this.Orders = this.displayedList.data;
        },
      });
  }
  selectOrder(orderId: string, firstTime: boolean = false): void {
    this.selectedOrderId = orderId;
    const order = this.Orders.find((order) => order._id === orderId);
    if (order) {
      let isMobile = window.innerWidth <= 768; // Tailwind's 'md' breakpoint
      if (!firstTime && isMobile) {
        this.clicked = true;
      }
      this.Order = order;
      this._cdr.detectChanges();
      this.updateMap(order);
    }
  }
  private updateMap(order: Order): void {
    // Clear existing map elements
    this.clearMap();
    // Initialize map if not exists
    if (!this.map) {
      this.initializeMap(
        order.pick_up?.place?.coordinates![0],
        order.pick_up?.place?.coordinates![1]
      );
    }

    // Add markers
    this.addMarker(
      order.pick_up?.place?.coordinates!,
      'location-a-icon.svg',
      'Marker A'
    );
    this.addMarker(
      order.destination?.place?.coordinates!,
      'location-b-icon.svg',
      'Marker B'
    );

    // Add route
    this.getRoute(
      order.pick_up?.place?.coordinates!,
      order.destination?.place?.coordinates!
    );
  }
  private addMarker(coords: [number, number], icon: string, alt: string): void {
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.innerHTML = `<img src="${icon}" alt="${alt}" class="w-8 h-8 animate-pulse">`;

    const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat(coords)
      .addTo(this.map);

    this.markers.push(marker);
  }

  private getRoute(start: [number, number], end: [number, number]): void {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${this._mapService.mapboxToken}`;

    fetch(url)
      .then((res) => res.json())
      .then(async (data) => {
        const route = data.routes[0]?.geometry;
        if (!route || !this.map) return;

        // Clear existing route
        this.clearRoute();

        const sourceId = `route-${Date.now()}`;
        this.routeSources.push(sourceId);

        // Vérifier que le style est chargé
        if (!this.map.isStyleLoaded()) {
          await new Promise((resolve) => this.map.once('styledata', resolve));
        }

        this.map.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: route,
          },
        });

        this.map.addLayer({
          id: sourceId,
          type: 'line',
          source: sourceId,
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

        // Fit bounds
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

  private clearMap(): void {
    // Remove all markers
    this.markers.forEach((marker) => marker.remove());
    this.markers = [];

    // Remove all route layers
    this.clearRoute();
  }

  private clearRoute(): void {
    this.routeSources.forEach((sourceId) => {
      if (this.map.getLayer(sourceId)) {
        this.map.removeLayer(sourceId);
      }
      if (this.map.getSource(sourceId)) {
        this.map.removeSource(sourceId);
      }
    });
    this.routeSources = [];
  }
  private initializeMap(lng?: number, lat?: number): void {
    if (this.map) {
      return;
    }

    this.map = new mapboxgl.Map({
      accessToken: this._mapService.mapboxToken,
      container: 'map',
      style: 'mapbox://styles/mapbox/standard',
      center: new mapboxgl.LngLat(lng ?? 10.1956, lat ?? 36.8625),
      zoom: 12,
      pitch: 0,
      bearing: 0,
      interactive: false,
    });
  }

  filterByCategory($event: MatSelectChange<any>) {
    this.getOrders($event.value);
  }
  orderDetails(id: string) {
    this.router.navigate([`${id}`], { relativeTo: this._route }).then();
  }
  loadMore() {
    if (this.max > this.currentSize) {
      this.currentSize += 1;
      this.getOrders();
    }
  }
  canceled(order: Order) {
    this.Order = order;
    this._cdr.detectChanges();
  }
}
