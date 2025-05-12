import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  OnDestroy,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../../Shared/Services/user.service';
import { Agent } from '../../../../Shared/Models/Agent.model';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AgentService } from '../../../../Shared/Services/agent.service';
import { MapService } from '../../../../Shared/Services/map.service';
import * as mapboxgl from 'mapbox-gl';
import { Order } from '../../../../Shared/Models/Order.model';
import { Subscription, interval } from 'rxjs';
import { Status } from '../../../../Shared/enums/status.enums';
import { Geolocation } from '@capacitor/geolocation';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface RouteStop {
  order: Order;
  coordinates: [number, number];
  isPickup: boolean;
  status: 'pending' | 'active' | 'completed';
}

interface NavigationStep {
  maneuver: {
    type: string;
    instruction: string;
    modifier?: string;
  };
  distance: number;
  duration: number;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatBadgeModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
})
export class OrdersComponent implements OnInit, OnDestroy {
  private _userService = inject(UserService);
  private _agentService = inject(AgentService);
  private _mapService = inject(MapService);
  private _cdr = inject(ChangeDetectorRef);
  private _ngZone = inject(NgZone);
  private _snackBar = inject(MatSnackBar);

  agent: Agent | null = null;
  map: mapboxgl.Map | null = null;
  journeyActive = false;
  journeyProgress = 0;

  currentStopIndex = 0;
  stops: RouteStop[] = [];
  isSidebarOpen = true;
  isDetailModalOpen = false;
  selectedOrder: Order | null = null;

  private markers: mapboxgl.Marker[] = [];
  private userLocationMarker: mapboxgl.Marker | null = null;
  private directionArrow: mapboxgl.Marker | null = null;
  private routeSources: string[] = [];

  routeStarted = false;
  isNavigating = false;
  navigationSteps: NavigationStep[] = [];
  currentStep: NavigationStep | null = null;
  distanceToNextStop: number = 0;
  timeToNextStop: number = 0;
  currentBearing: number = 0;
  isFetchingLocation = false;

  private currentLegCoordinates: [number, number][] = [];
  private forcedSimulationMode = false;
  private simulationSubscription: Subscription | null = null;
  private subscriptions: Subscription[] = [];
  private userLocation: [number, number] | null = null;
  private previousLocation: [number, number] | null = null;
  private previousHeading: number = 0;
  private routeBounds: mapboxgl.LngLatBounds | null = null;
  private cumulativeDistances: number[] = [];
  private simulatedSpeedKmh = 10; // 10 km/h for smooth simulation
  private simulationStartTime: number | null = null;
  private routeUpdateInterval: any = null;

  ngOnInit(): void {
    this.agent = this._userService.user() as Agent;
    if (this.agent && this.agent.agentStatus !== 'offline') {
      this.journeyActive = true;
      this.fetchCurrentJourney();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    if (this.simulationSubscription) {
      this.simulationSubscription.unsubscribe();
    }
    if (this.map) {
      this.map.remove();
    }
    if (this.routeUpdateInterval) {
      clearInterval(this.routeUpdateInterval);
    }
  }

  startJourney(): void {
    this.journeyActive = true;
    const sub = this._agentService.startJourney().subscribe({
      next: (response) => {
        if (response.orders && response.orders.length > 0) {
          this.processJourneyOrders(response.orders);
        }
        this._cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error starting journey:', err);
        this.journeyActive = false;
        this._cdr.detectChanges();
      },
    });
    this.subscriptions.push(sub);
  }

  fetchCurrentJourney(): void {
    const sub = this._agentService.getJourney().subscribe({
      next: (response) => {
        const data = response[0];
        if (data.orders && data.orders.length > 0) {
          this.processJourneyOrders(data.orders);
        }
      },
      error: (err) => console.error('Error fetching current journey:', err),
    });
    this.subscriptions.push(sub);
  }

  private processJourneyOrders(orders: Order[]): void {
    this.stops = [];
    orders.forEach((order) => {
      if (
        order.status === Status.assigned &&
        order.pick_up?.place?.coordinates
      ) {
        this.stops.push({
          order,
          coordinates: order.pick_up.place.coordinates,
          isPickup: true,
          status: 'pending',
        });
      } else if (
        order.status === Status.picked_up &&
        order.destination?.place?.coordinates
      ) {
        this.stops.push({
          order,
          coordinates: order.destination.place.coordinates,
          isPickup: false,
          status: 'pending',
        });
      }
    });
    if (this.stops.length > 0) {
      this.stops[0].status = 'active';
      this.currentStopIndex = 0;
      this.initializeMapWithRoute();
    }
  }

  private initializeMapWithRoute(): void {
    if (!this.stops.length) return;
    const firstStopCoords = this.stops[0].coordinates;
    this.initializeMap(firstStopCoords[0], firstStopCoords[1]);
    this.stops.forEach((stop, index) => this.addStopMarker(stop, index));
    this.createFullRoute();
    this.updateJourneyProgress();
  }

  private initializeMap(lng: number, lat: number): void {
    if (this.map) this.map.remove();
    this.map = new mapboxgl.Map({
      accessToken: this._mapService.mapboxToken,
      container: 'map',
      style: 'mapbox://styles/mapbox/navigation-night-v1',
      center: [lng, lat],
      zoom: 14,
      pitch: 45,
      bearing: 0,
      interactive: true,
    });
    this.map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
  }

  private addStopMarker(stop: RouteStop, index: number): void {
    const el = document.createElement('div');
    el.className = 'custom-marker';
    const iconClass =
      stop.status === 'completed'
        ? 'bg-green-500'
        : stop.status === 'active'
        ? 'bg-blue-500 animate-pulse'
        : stop.isPickup
        ? 'bg-yellow-500'
        : 'bg-red-500';
    el.innerHTML = `<div class="flex items-center justify-center rounded-full ${iconClass} text-white w-8 h-8 shadow-lg">${
      index + 1
    }</div>`;
    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
      <div class="p-2">
        <strong>${stop.isPickup ? 'Pickup' : 'Delivery'}</strong>
        <p>${this.getOrderLabel(stop.order) || 'Customer'}</p>
        <button class="view-details-btn bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1" data-order-index="${index}">View Details</button>
      </div>
    `);
    popup.on('open', () => {
      setTimeout(() => {
        const btn = document.querySelector(
          `.view-details-btn[data-order-index="${index}"]`
        );
        if (btn)
          btn.addEventListener('click', () =>
            this.openOrderDetails(stop.order)
          );
      }, 100);
    });
    const marker = new mapboxgl.Marker({ element: el })
      .setLngLat(stop.coordinates)
      .setPopup(popup)
      .addTo(this.map!);
    this.markers.push(marker);
  }

  private createFullRoute(): void {
    if (this.stops.length < 2) return;
    const waypoints = this.stops
      .map((stop) => `${stop.coordinates[0]},${stop.coordinates[1]}`)
      .join(';');
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${waypoints}?geometries=geojson&overview=full&steps=true&access_token=${this._mapService.mapboxToken}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const route = data.routes[0]?.geometry;
        if (!route) return;
        this.clearRoutes();
        this.routeBounds = this.calculateRouteBounds(route.coordinates);
        this.addRouteToMap(route, 'main-route', '#4B89F0', 5);
        this.highlightActiveSegment();
        this.fitMapToRoute(route);
      })
      .catch((err) => console.error('Error fetching route:', err));
  }

  private highlightActiveSegment(): void {
    if (this.currentStopIndex >= this.stops.length - 1) return;
    const start = this.stops[this.currentStopIndex].coordinates;
    const end = this.stops[this.currentStopIndex + 1].coordinates;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${this._mapService.mapboxToken}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const route = data.routes[0]?.geometry;
        if (route) this.addRouteToMap(route, 'active-segment', '#0ea5e9', 7);
      });
  }

  private addRouteToMap(
    geometry: any,
    id: string,
    color: string,
    width: number
  ): void {
    const sourceId = `${id}-${Date.now()}`;
    this.routeSources.push(sourceId);
    if (!this.map!.isStyleLoaded()) {
      this.map!.once('styledata', () =>
        this.addSourceAndLayer(sourceId, geometry, color, width)
      );
    } else {
      this.addSourceAndLayer(sourceId, geometry, color, width);
    }
  }

  private addSourceAndLayer(
    sourceId: string,
    geometry: any,
    color: string,
    width: number
  ): void {
    this.map!.addSource(sourceId, {
      type: 'geojson',
      data: { type: 'Feature', properties: {}, geometry },
    });
    this.map!.addLayer({
      id: sourceId,
      type: 'line',
      source: sourceId,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': color, 'line-width': width, 'line-opacity': 0.75 },
    });
  }

  private fitMapToRoute(route: any): void {
    const coordinates = route.coordinates;
    if (!coordinates || coordinates.length === 0) return;
    const bounds = coordinates.reduce(
      (b: mapboxgl.LngLatBounds, coord: [number, number]) => b.extend(coord),
      new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
    );
    this.map!.fitBounds(bounds, { padding: 80, animate: true });
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    setTimeout(() => this.map!.resize(), 300);
  }

  openOrderDetails(order: Order): void {
    this.selectedOrder = order;
    this.isDetailModalOpen = true;
  }

  closeOrderDetails(): void {
    this.isDetailModalOpen = false;
  }

  completeCurrentStop(): void {
    if (this.currentStopIndex >= this.stops.length) return;
    this.stops[this.currentStopIndex].status = 'completed';
    this.currentStopIndex++;
    if (this.currentStopIndex < this.stops.length) {
      this.stops[this.currentStopIndex].status = 'active';
      this.updateMarkersStatus();
      this.updateNavigationToNextStop();
      if (!this.isNavigating) {
        this.highlightActiveSegment();
      }
      this.centerMapOnCurrentStop();
    } else {
      this.completeJourney();
    }
    this.updateJourneyProgress();
  }

  private updateMarkersStatus(): void {
    this.markers.forEach((marker) => marker.remove());
    this.markers = [];
    this.stops.forEach((stop, index) => this.addStopMarker(stop, index));
  }

  private centerMapOnCurrentStop(): void {
    if (this.currentStopIndex >= this.stops.length) return;
    const currentCoords = this.stops[this.currentStopIndex].coordinates;
    this.map!.flyTo({
      center: currentCoords,
      zoom: 15,
      pitch: 45,
      bearing: 0,
      duration: 1000,
    });
  }

  private updateJourneyProgress(): void {
    if (this.stops.length === 0) return;
    this.journeyProgress = (this.currentStopIndex / this.stops.length) * 100;
  }

  private completeJourney(): void {
    if (this.isNavigating) this.endNavigation();
    this.journeyActive = false;
    this._snackBar.open('Journey completed!', 'Close', { duration: 3000 });
  }

  private clearRoutes(): void {
    this.routeSources.forEach((sourceId) => {
      if (this.map!.getLayer(sourceId)) this.map!.removeLayer(sourceId);
      if (this.map!.getSource(sourceId)) this.map!.removeSource(sourceId);
    });
    this.routeSources = [];
  }

  getOrderLabel(order: Order): string {
    if (order.status === Status.assigned && order.pick_up?.phone)
      return order.pick_up.phone;
    if (order.status === Status.picked_up && order.destination?.phone)
      return order.destination.phone;
    return '';
  }

  private async getCurrentPosition(): Promise<[number, number]> {
    this.isFetchingLocation = true;
    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 60_000,
      maximumAge: 5_000,
    };
    try {
      const pos = await Geolocation.getCurrentPosition(options);
      this.isFetchingLocation = false;
      return [pos.coords.longitude, pos.coords.latitude];
    } catch (error) {
      console.error('Error getting position:', error);
      this.isFetchingLocation = false;
      throw error;
    }
  }

  async startNavigation(simulationMode = false): Promise<void> {
    this.forcedSimulationMode = simulationMode;
    try {
      this.clearMarkersAndRoutes();
      this.routeStarted = true;
      this.isNavigating = true;

      if (simulationMode) {
        this.userLocation =
          this.currentStopIndex === 0
            ? this.stops[0].coordinates
            : this.stops[this.currentStopIndex - 1].coordinates;
        this.initializeNavigationMap(this.userLocation);
        await this.createNavigationRoute();
        this.setupSimulatedLocationUpdates();
      } else {
        this.userLocation = await this.getCurrentPosition();
        this.initializeNavigationMap(this.userLocation);
        await this.createNavigationRoute();
        this.setupLocationTracking();
        this.startRouteUpdateInterval();
      }

      if (this.isSidebarOpen) this.toggleSidebar();
    } catch (error) {
      console.error('Error starting navigation:', error);
      this.initializeMapWithRoute();
    }
  }

  private clearMarkersAndRoutes(): void {
    this.markers.forEach((marker) => marker.remove());
    this.markers = [];
    if (this.userLocationMarker) {
      this.userLocationMarker.remove();
      this.userLocationMarker = null;
    }
    if (this.directionArrow) {
      this.directionArrow.remove();
      this.directionArrow = null;
    }
    this.clearRoutes();
  }

  private setupSimulatedLocationUpdates(): void {
    if (!this.currentLegCoordinates || this.currentLegCoordinates.length < 2) {
      console.error('No valid route coordinates for simulation');
      return;
    }

    this.cumulativeDistances = this.computeCumulativeDistances(
      this.currentLegCoordinates
    );
    const totalDistance =
      this.cumulativeDistances[this.cumulativeDistances.length - 1];
    console.log('Total Distance:', totalDistance, 'km');

    this.simulationStartTime = Date.now();
    this.simulationSubscription = interval(100).subscribe(() => {
      this._ngZone.run(() => {
        if (!this.simulationStartTime) return;
        const elapsedSeconds = (Date.now() - this.simulationStartTime) / 1000;
        const distanceTraveled =
          (this.simulatedSpeedKmh / 3600) * elapsedSeconds;
        const position = this.getPositionAtDistance(distanceTraveled);

        if (position) {
          const [lng, lat] = position;
          const nextPosition = this.getPositionAtDistance(
            distanceTraveled + 0.01
          );
          const heading = nextPosition
            ? this.calculateBearing(position, nextPosition)
            : this.currentBearing;
          this.updateUserLocation(position, heading);

          console.log(
            `Distance Traveled: ${distanceTraveled.toFixed(
              3
            )} km / ${totalDistance.toFixed(3)} km, Position: [${lng.toFixed(
              4
            )}, ${lat.toFixed(4)}]`
          );

          if (distanceTraveled >= totalDistance) {
            this.showArrivalNotification();
            this.simulationSubscription?.unsubscribe();
            setTimeout(() => {
              this.completeCurrentStop();
              if (this.currentStopIndex < this.stops.length)
                this.startNavigation(true);
            }, 2000);
          }
        }
      });
    });
  }

  private computeCumulativeDistances(
    coordinates: [number, number][]
  ): number[] {
    const distances: number[] = [0];
    for (let i = 1; i < coordinates.length; i++) {
      const distance = this.calculateDistance(
        coordinates[i - 1],
        coordinates[i]
      );
      distances.push(distances[i - 1] + distance);
    }
    return distances;
  }

  private initializeNavigationMap([lng, lat]: [number, number]): void {
    if (this.map) this.map.remove();
    this.map = new mapboxgl.Map({
      accessToken: this._mapService.mapboxToken,
      container: 'map',
      style: 'mapbox://styles/mapbox/standard',
      center: [lng, lat],
      zoom: 17,
      pitch: 60,
      bearing: 0,
      interactive: true,
    });
    this.map.addControl(
      new mapboxgl.NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: true,
      }),
      'bottom-right'
    );
    this.map.on('style.load', () => {
      this.map!.setConfigProperty('basemap', 'lightPreset', 'dusk');
    });
  }

  private add3DBuildingsLayer(): void {
    if (!this.map || this.map.getLayer('3d-buildings')) return;

    const addLayer = () => {
      this.map!.addLayer({
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 14,
        paint: {
          'fill-extrusion-color': '#aaa',
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            14,
            0,
            16,
            ['get', 'height'],
          ],
          'fill-extrusion-base': [
            'interpolate',
            ['linear'],
            ['zoom'],
            14,
            0,
            16,
            ['get', 'min_height'],
          ],
          'fill-extrusion-opacity': 0.6,
        },
      });
    };

    if (this.map.isStyleLoaded()) {
      addLayer();
    } else {
      this.map.once('styledata', addLayer);
    }
  }

  private setupLocationTracking(): void {
    if (this.forcedSimulationMode) {
      this.setupSimulatedLocationUpdates();
      return;
    }
    Geolocation.watchPosition(
      { enableHighAccuracy: true, timeout: 60000, maximumAge: 5000 },
      (position, error) => {
        if (position) {
          this._ngZone.run(() => {
            const newLocation: [number, number] = [
              position.coords.longitude,
              position.coords.latitude,
            ];
            let heading = position.coords.heading || 0;
            if (
              this.previousLocation &&
              position.coords.speed &&
              position.coords.speed > 1
            ) {
              heading = this.calculateBearing(
                this.previousLocation,
                newLocation
              );
            } else if (this.previousHeading) {
              heading = this.previousHeading;
            }
            this.previousLocation = newLocation;
            this.previousHeading = heading;
            this.updateUserLocation(newLocation, heading);
          });
        } else {
          console.error('Error watching position:', error);
          this.startNavigation(true);
        }
      }
    );
  }

  private updateUserLocation(
    location: [number, number],
    heading: number
  ): void {
    this.userLocation = location;
    const snappedLocation = this.snapToRoute(location);
    if (!this.userLocationMarker) {
      const el = document.createElement('div');
      el.innerHTML = `<div class="flex items-center justify-center rounded-full bg-blue-500 text-white w-10 h-10 shadow-lg"><div class="user-location-dot"></div></div>`;
      this.userLocationMarker = new mapboxgl.Marker({
        element: el,
        rotationAlignment: 'map',
      })
        .setLngLat(snappedLocation)
        .addTo(this.map!);
    } else {
      this.userLocationMarker.setLngLat(snappedLocation);
    }
    this.updateDirectionArrow(heading);
    this.updateCameraPosition(location, heading);
    this.checkDistanceToCurrentStop(location);
  }

  private snapToRoute(location: [number, number]): [number, number] {
    if (!this.currentLegCoordinates || this.currentLegCoordinates.length < 2)
      return location;
    let closestPoint = this.currentLegCoordinates[0];
    let minDistance = this.calculateDistance(location, closestPoint);
    for (const point of this.currentLegCoordinates) {
      const distance = this.calculateDistance(location, point);
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = point;
      }
    }
    return minDistance > 0.1 ? location : closestPoint;
  }

  private updateDirectionArrow(heading: number): void {
    if (!this.directionArrow) {
      const el = document.createElement('div');
      el.innerHTML = `<div class="direction-arrow"><mat-icon style="font-size: 32px; color: #3b82f6;">navigation</mat-icon></div>`;
      this.directionArrow = new mapboxgl.Marker({
        element: el,
        rotationAlignment: 'map',
        anchor: 'center',
      })
        .setLngLat(this.userLocation!)
        .addTo(this.map!);
    }
    this.currentBearing = heading;
    this.directionArrow.setLngLat(this.userLocation!);
    const arrowEl = this.directionArrow
      .getElement()
      .querySelector('.direction-arrow');
    if (arrowEl)
      arrowEl.setAttribute(
        'style',
        `transform: rotate(${heading}deg); display: flex; align-items: center; justify-content: center;`
      );
  }

  private updateCameraPosition(
    location: [number, number],
    heading: number
  ): void {
    if (!this.map) return;
    const currentPitch = this.map.getPitch();
    this.map.jumpTo({
      center: location,
      zoom: 17,
      pitch: currentPitch,
      bearing: heading,
    });
  }

  private checkDistanceToCurrentStop(location: [number, number]): void {
    if (this.currentStopIndex >= this.stops.length) return;
    const distance = this.calculateDistance(
      location,
      this.stops[this.currentStopIndex].coordinates
    );
    this.distanceToNextStop = distance;
    this.timeToNextStop = distance / 0.5;
    if (distance < 0.05) this.showArrivalNotification();
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

  private showArrivalNotification(): void {
    this._snackBar
      .open('You have arrived at the destination!', 'Complete Stop', {
        duration: 0,
      })
      .onAction()
      .subscribe(() => this.completeCurrentStop());
  }

  private async createNavigationRoute(): Promise<void> {
    if (this.currentStopIndex >= this.stops.length) return;
    const currentStop = this.stops[this.currentStopIndex];
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${
      this.userLocation![0]
    },${this.userLocation![1]};${currentStop.coordinates[0]},${
      currentStop.coordinates[1]
    }?steps=true&geometries=geojson&overview=full&access_token=${
      this._mapService.mapboxToken
    }`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (!data.routes || data.routes.length === 0)
        throw new Error('No route found');
      const route = data.routes[0];
      this.clearRoutes();
      this.navigationSteps = route.legs[0].steps;
      this.currentStep = this.navigationSteps[0];
      this.timeToNextStop = route.duration / 60;
      this.currentLegCoordinates = route.geometry.coordinates;
      this.cumulativeDistances = this.computeCumulativeDistances(
        this.currentLegCoordinates
      );
      // Clear existing markers before adding new one
      this.markers.forEach(marker => marker.remove());
      this.markers = [];
      this.addRouteToMap(route.geometry, 'active-navigation', '#0ea5e9', 6);
      this.addDestinationMarker(currentStop);
      this._cdr.detectChanges();
    } catch (err) {
      console.error('Error fetching navigation route:', err);
    }
  }

  private addDestinationMarker(stop: RouteStop): void {
    const el = document.createElement('div');
    el.className = 'destination-marker';
    const colorClass = stop.isPickup ? 'bg-yellow-500' : 'bg-red-500';
    el.innerHTML = `<div class="flex items-center justify-center rounded-full ${colorClass} text-white w-12 h-12 shadow-lg animate-pulse"><img src="pick-up.svg" alt="Destination" class="w-8 h-8"></div>`;
    const marker = new mapboxgl.Marker({ element: el })
      .setLngLat(stop.coordinates)
      .addTo(this.map!);
    this.markers.push(marker);
  }

  private updateNavigationToNextStop(): void {
    if (this.currentStopIndex >= this.stops.length) return;
    this.clearRoutes();
    this.createNavigationRoute();
  }

  endNavigation(): void {
    this.isNavigating = false;
    this.routeStarted = false;
    if (this.forcedSimulationMode && this.simulationSubscription) {
      this.simulationSubscription.unsubscribe();
      this.simulationSubscription = null;
    }
    if (this.userLocationMarker) {
      this.userLocationMarker.remove();
      this.userLocationMarker = null;
    }
    if (this.directionArrow) {
      this.directionArrow.remove();
      this.directionArrow = null;
    }
    this.navigationSteps = [];
    this.currentStep = null;
    this.distanceToNextStop = 0;
    this.timeToNextStop = 0;
    this.initializeMapWithRoute();
    if (this.routeUpdateInterval) {
      clearInterval(this.routeUpdateInterval);
    }
  }

  private getPositionAtDistance(distance: number): [number, number] | null {
    if (!this.cumulativeDistances.length) return null;
    const totalDistance =
      this.cumulativeDistances[this.cumulativeDistances.length - 1];
    if (distance <= 0) return this.currentLegCoordinates[0];
    if (distance >= totalDistance)
      return this.currentLegCoordinates[this.currentLegCoordinates.length - 1];

    let i = 1;
    while (
      i < this.cumulativeDistances.length &&
      this.cumulativeDistances[i] < distance
    )
      i++;
    const prevDistance = this.cumulativeDistances[i - 1];
    const nextDistance = this.cumulativeDistances[i];
    const fraction = (distance - prevDistance) / (nextDistance - prevDistance);
    const prevPoint = this.currentLegCoordinates[i - 1];
    const nextPoint = this.currentLegCoordinates[i];
    return [
      prevPoint[0] + fraction * (nextPoint[0] - prevPoint[0]),
      prevPoint[1] + fraction * (nextPoint[1] - prevPoint[1]),
    ];
  }

  private calculateBearing(
    start: [number, number],
    end: [number, number]
  ): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const toDeg = (rad: number) => (rad * 180) / Math.PI;
    const [startLng, startLat] = [toRad(start[0]), toRad(start[1])];
    const [endLng, endLat] = [toRad(end[0]), toRad(end[1])];
    const y = Math.sin(endLng - startLng) * Math.cos(endLat);
    const x =
      Math.cos(startLat) * Math.sin(endLat) -
      Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
  }

  getManeuverIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      turn: 'turn_right',
      straight: 'straight',
      'slight right': 'turn_slight_right',
      right: 'turn_right',
      'sharp right': 'turn_sharp_right',
      uturn: 'u_turn_right',
      'slight left': 'turn_slight_left',
      left: 'turn_left',
      'sharp left': 'turn_sharp_left',
      roundabout: 'roundabout_right',
      'exit roundabout': 'roundabout_right',
      fork: 'fork_right',
      merge: 'merge',
      ramp: 'ramp_right',
      exit: 'exit_to',
      arrive: 'location_on',
      depart: 'my_location',
    };
    return iconMap[type] || 'arrow_forward';
  }

  get upcomingSteps(): NavigationStep[] {
    if (!this.navigationSteps || !this.currentStep) return [];
    const currentIndex = this.navigationSteps.indexOf(this.currentStep);
    if (currentIndex === -1) return [];
    return this.navigationSteps.slice(currentIndex + 1, currentIndex + 4);
  }

  showRouteOverview(): void {
    if (!this.map || !this.routeBounds) return;
    this.map.fitBounds(this.routeBounds, { padding: 80, duration: 1000 });
  }

  private calculateRouteBounds(
    coordinates: [number, number][]
  ): mapboxgl.LngLatBounds {
    const bounds = new mapboxgl.LngLatBounds();
    coordinates.forEach((coord) => bounds.extend(coord));
    return bounds;
  }

  recenterOnUser(): void {
    if (!this.userLocation || !this.map || !this.isNavigating) return;
    this.map.flyTo({
      center: this.userLocation,
      zoom: 17,
      pitch: this.map.getPitch(),
      bearing: this.currentBearing,
      duration: 1000,
    });
  }

  toggleNavigationView(): void {
    if (!this.map) return;

    const isFlat = this.map.getPitch() === 0;
    const targetPitch = isFlat ? 60 : 0;
    const targetBearing = isFlat ? this.currentBearing : 0;

    this.map.easeTo({
      pitch: targetPitch,
      bearing: targetBearing,
      duration: 1000,
      easing: (t) => t,
    });

    this.add3DBuildingsLayer();
  }

  showUpcomingTurns(): void {
    if (!this.navigationSteps.length) return;
    const currentStepIndex = this.navigationSteps.findIndex(
      (step) => step === this.currentStep
    );
    if (currentStepIndex === -1) return;
    const upcomingTurns = this.navigationSteps.slice(
      currentStepIndex + 1,
      currentStepIndex + 4
    );
    console.log('Upcoming turns:', upcomingTurns);
  }

  private startRouteUpdateInterval(): void {
    this.routeUpdateInterval = setInterval(() => {
      if (this.isNavigating && !this.forcedSimulationMode) {
        this.updateNavigationToNextStop();
      }
    }, 10000);
  }
}