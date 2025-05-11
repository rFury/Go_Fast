import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  OnDestroy,
  NgZone,
} from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { SuperAuthService } from '../../../../Shared/Services/super-auth-service.service';
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
  map: mapboxgl.Map;
  journeyActive = false;
  journeyProgress = 0;

  // Navigation data
  currentStopIndex = 0;
  stops: RouteStop[] = [];

  // UI controls
  isSidebarOpen = true;
  isDetailModalOpen = false;
  selectedOrder: Order | null = null;

  // Map elements
  private markers: mapboxgl.Marker[] = [];
  private userLocationMarker: mapboxgl.Marker | null = null;
  private directionArrow: mapboxgl.Marker | null = null;
  private routeSources: string[] = [];

  // Navigation state
  routeStarted = false;
  isNavigating = false;
  navigationSteps: NavigationStep[] = [];
  currentStep: NavigationStep | null = null;
  distanceToNextStop: number = 0;
  timeToNextStop: number = 0;
  currentBearing: number = 0;

  // Route management
  private currentLegCoordinates: [number, number][] = [];
  private simulationMode = false;
  private simulationSubscription: Subscription | null = null;

  // Subscriptions
  private subscriptions: Subscription[] = [];

  // User location tracking
  private userLocation: [number, number] | null = null;

  ngOnInit(): void {
    // Get agent data
    this.agent = this._userService.user() as Agent;

    // Check if journey is already in progress
    if (this.agent.agentStatus !== 'offline') {
      this.journeyActive = true;
      this.fetchCurrentJourney();
    }
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe());

    if (this.simulationSubscription) {
      this.simulationSubscription.unsubscribe();
    }

    // Remove map
    if (this.map) {
      this.map.remove();
    }
  }

  startJourney(): void {
    this.journeyActive = true;

    const sub = this._agentService.startJourney().subscribe({
      next: (response) => {
        console.log('Journey started:', response);
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
      error: (err) => {
        console.error('Error fetching current journey:', err);
      },
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
        // Add pickup stop for assigned orders
        this.stops.push({
          order: order,
          coordinates: order.pick_up.place.coordinates,
          isPickup: true,
          status: 'pending',
        });
      } else if (
        order.status === Status.picked_up &&
        order.destination?.place?.coordinates
      ) {
        // Add delivery stop for picked_up orders
        this.stops.push({
          order: order,
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

    // Initialize map at the first stop
    const firstStopCoords = this.stops[0].coordinates;
    this.initializeMap(firstStopCoords[0], firstStopCoords[1]);

    // Add markers for all stops
    this.stops.forEach((stop, index) => {
      this.addStopMarker(stop, index);
    });

    // Create the full route connecting all stops
    this.createFullRoute();

    // Update progress bar
    this.updateJourneyProgress();
  }

  private initializeMap(lng: number, lat: number): void {
    if (this.map) {
      this.map.remove();
    }

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

    // Add navigation controls
    this.map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
  }

  private addStopMarker(stop: RouteStop, index: number): void {
    const el = document.createElement('div');
    el.className = 'custom-marker';

    // Determine marker appearance based on status and type
    let iconClass = '';
    if (stop.status === 'completed') {
      iconClass = 'bg-green-500';
    } else if (stop.status === 'active') {
      iconClass = 'bg-blue-500 animate-pulse';
    } else {
      iconClass = stop.isPickup ? 'bg-yellow-500' : 'bg-red-500';
    }

    el.innerHTML = `
      <div class="flex items-center justify-center rounded-full ${iconClass} text-white w-8 h-8 shadow-lg">
        ${index + 1}
      </div>
    `;

    // Create popup with order details
    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
      <div class="p-2">
        <strong>${stop.isPickup ? 'Pickup' : 'Delivery'}</strong>
        <p>${this.getOrderLabel(stop.order) || 'Customer'}</p>
        <button class="view-details-btn bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1" 
                data-order-index="${index}">
          View Details
        </button>
      </div>
    `);

    // Add popup event listener after it's added to the DOM
    popup.on('open', () => {
      setTimeout(() => {
        const btn = document.querySelector(
          `.view-details-btn[data-order-index="${index}"]`
        );
        if (btn) {
          btn.addEventListener('click', () => {
            this.openOrderDetails(stop.order);
          });
        }
      }, 100);
    });

    // Create and add marker
    const marker = new mapboxgl.Marker({ element: el })
      .setLngLat(stop.coordinates)
      .setPopup(popup)
      .addTo(this.map);

    this.markers.push(marker);
  }

  private createFullRoute(): void {
    if (this.stops.length < 2) return;

    // Create waypoints string from all stops
    const waypoints = this.stops
      .map((stop) => `${stop.coordinates[0]},${stop.coordinates[1]}`)
      .join(';');
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${waypoints}?geometries=geojson&overview=full&steps=true&access_token=${this._mapService.mapboxToken}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const route = data.routes[0]?.geometry;
        if (!route) return;

        // Clear any existing routes
        this.clearRoutes();

        // Add the main route
        this.addRouteToMap(route, 'main-route', '#4B89F0', 5);

        // Add the active segment with different styling
        this.highlightActiveSegment();

        // Fit the map to show the entire route
        this.fitMapToRoute(route);
      })
      .catch((err) => {
        console.error('Error fetching route:', err);
      });
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
        if (!route) return;

        // Add the active segment with different styling
        this.addRouteToMap(route, 'active-segment', '#0ea5e9', 7);
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

    // Ensure map style is loaded
    if (!this.map.isStyleLoaded()) {
      this.map.once('styledata', () => {
        this.addSourceAndLayer(sourceId, geometry, color, width);
      });
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
    this.map.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: geometry,
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
        'line-color': color,
        'line-width': width,
        'line-opacity': 0.75,
      },
    });
  }

  private fitMapToRoute(route: any): void {
    const coordinates = route.coordinates;
    if (!coordinates || coordinates.length === 0) return;

    const bounds = coordinates.reduce((b, coord) => {
      return b.extend(coord);
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

    this.map.fitBounds(bounds, {
      padding: 80,
      animate: true,
    });
  }

  // UI Control Methods
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    // Allow map to resize properly
    setTimeout(() => {
      this.map.resize();
    }, 300);
  }

  openOrderDetails(order: Order): void {
    this.selectedOrder = order;
    this.isDetailModalOpen = true;
  }

  closeOrderDetails(): void {
    this.isDetailModalOpen = false;
  }

  // Navigation Actions
  completeCurrentStop(): void {
    if (this.currentStopIndex >= this.stops.length) return;

    // Mark current stop as completed
    this.stops[this.currentStopIndex].status = 'completed';

    // Move to next stop
    this.currentStopIndex++;

    // If there are more stops, mark the next one as active
    if (this.currentStopIndex < this.stops.length) {
      this.stops[this.currentStopIndex].status = 'active';

      // Update markers and route
      this.updateMarkersStatus();

      if (this.isNavigating) {
        // If we're in active navigation, update the route to the next stop
        this.updateNavigationToNextStop();
      } else {
        this.highlightActiveSegment();
      }

      // Center map on next stop
      this.centerMapOnCurrentStop();
    } else {
      // Journey completed
      this.completeJourney();
    }

    // Update progress
    this.updateJourneyProgress();
  }

  private updateMarkersStatus(): void {
    // Remove existing markers
    this.markers.forEach((marker) => marker.remove());
    this.markers = [];

    // Re-add all markers with updated status
    this.stops.forEach((stop, index) => {
      this.addStopMarker(stop, index);
    });
  }

  private centerMapOnCurrentStop(): void {
    if (this.currentStopIndex >= this.stops.length) return;

    const currentCoords = this.stops[this.currentStopIndex].coordinates;
    this.map.flyTo({
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
    // Stop navigation if active
    if (this.isNavigating) {
      this.endNavigation();
    }

    this.journeyActive = false;
    this._snackBar.open('Journey completed!', 'Close', { duration: 3000 });
  }

  private clearRoutes(): void {
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

  getOrderLabel(order: Order): string {
    if (order.status === Status.assigned && order.pick_up?.phone) {
      return order.pick_up.phone;
    } else if (order.status === Status.picked_up && order.destination?.phone) {
      return order.destination.phone;
    } else {
      return '';
    }
  }

  private async getCurrentPosition(): Promise<[number, number]> {
    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 30_000,
      maximumAge: 5_000,
    };

    try {
      console.log('getting position');
      const pos = await Geolocation.getCurrentPosition(options);
      console.log('position', pos);
      return [pos.coords.longitude, pos.coords.latitude];
    } catch (error) {
      console.error('Capacitor geolocation error:', error);
      this._snackBar.open(
        'Could not get location. Using simulated navigation.',
        'Dismiss',
        { duration: 5_000 }
      );
      this.simulationMode = true;
      return this.stops[0]?.coordinates || [0, 0];
    }
  }

  async startNavigation() {
    try {
      // Get user's current location
      this.userLocation = await this.getCurrentPosition();
      console.log('in');

      this.routeStarted = true;
      this.isNavigating = true;

      // If we can't get user location, use simulation mode
      if (!this.userLocation) {
        this.simulationMode = true;
      }

      // Initialize navigation map
      this.initializeNavigationMap(this.userLocation);

      // Setup location tracking
      this.setupLocationTracking();

      // Create route from current location to first active stop
      this.createNavigationRoute();

      // Add direction arrow for navigation
      this.setupDirectionArrow();

      // Hide sidebar automatically for better map view
      if (this.isSidebarOpen) {
        this.toggleSidebar();
      }
    } catch (error) {
      console.error('Error starting navigation:', error);
      this.initializeMapWithRoute(); // Fallback to original route
    }
  }

  private initializeNavigationMap([lng, lat]: [number, number]): void {
    if (this.map) this.map.remove();

    this.map = new mapboxgl.Map({
      accessToken: this._mapService.mapboxToken,
      container: 'map',
      style: 'mapbox://styles/mapbox/navigation-guidance-night-v4',
      center: [lng, lat],
      zoom: 17,
      pitch: 60,
      bearing: 0,
      interactive: true,
    });

    // Add navigation controls
    this.map.addControl(
      new mapboxgl.NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: true,
      }),
      'bottom-right'
    );

    // Setup map event listeners
    this.map.on('load', () => {
      this.add3DBuildingsLayer();
    });
  }

  private add3DBuildingsLayer(): void {
    // Check if the style has a building layer already
    if (this.map.getLayer('building')) {
      this.map.removeLayer('building');
    }

    // Add 3D buildings
    this.map.addLayer({
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
  }

  private setupLocationTracking(): void {
    if (this.simulationMode) {
      this.startSimulatedLocationUpdates();
    } else {
      // Real device location tracking
      Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 5000,
        },
        (position, error) => {
          if (position) {
            this._ngZone.run(() => {
              const newLocation: [number, number] = [
                position.coords.longitude,
                position.coords.latitude,
              ];
              console.log('success', newLocation);

              this.updateUserLocation(
                newLocation,
                position.coords.heading || 0
              );
            });
          } else {
            console.error('Error watching position:', error);
            this.simulationMode = true;
            this.startSimulatedLocationUpdates();
          }
        }
      );
    }
  }

  private updateUserLocation(
    location: [number, number],
    heading: number
  ): void {
    this.userLocation = location;

    // Update or create user location marker
    if (!this.userLocationMarker) {
      const el = document.createElement('div');
      el.innerHTML = `
        <div class="flex items-center justify-center rounded-full bg-blue-500 text-white w-10 h-10 shadow-lg">
          <div class="user-location-dot"></div>
        </div>
      `;

      this.userLocationMarker = new mapboxgl.Marker({
        element: el,
        rotationAlignment: 'map',
      })
        .setLngLat(location)
        .addTo(this.map);
    } else {
      this.userLocationMarker.setLngLat(location);
    }

    // Update direction arrow
    this.updateDirectionArrow(heading);

    // Update camera position based on location
    this.updateCameraPosition(location, heading);

    // Check distance to current stop and update UI
    this.checkDistanceToCurrentStop(location);
  }

  private setupDirectionArrow(): void {
    if (!this.userLocation) return;

    const el = document.createElement('div');
    el.innerHTML = `
      <div class="direction-arrow">
        <mat-icon style="font-size: 32px; color: #3b82f6;">navigation</mat-icon>
      </div>
    `;

    this.directionArrow = new mapboxgl.Marker({
      element: el,
      rotationAlignment: 'map',
      anchor: 'center',
    })
      .setLngLat(this.userLocation)
      .addTo(this.map);
  }

  private updateDirectionArrow(heading: number): void {
    if (!this.directionArrow || !this.userLocation) return;

    this.currentBearing = heading;

    // Update position
    this.directionArrow.setLngLat(this.userLocation);

    // Update rotation
    const el = this.directionArrow.getElement();
    const arrowEl = el.querySelector('.direction-arrow');
    if (arrowEl) {
      arrowEl.setAttribute(
        'style',
        `transform: rotate(${heading}deg); display: flex; align-items: center; justify-content: center;`
      );
    }
  }

  private updateCameraPosition(
    location: [number, number],
    heading: number
  ): void {
    // Adjust camera for navigation view - looking ahead of the car
    if (!this.map) return;

    this.map.jumpTo({
      center: location,
      zoom: 17,
      pitch: 60,
      bearing: heading,
    });
  }

  private checkDistanceToCurrentStop(location: [number, number]): void {
    if (this.currentStopIndex >= this.stops.length) return;

    const currentStop = this.stops[this.currentStopIndex];
    const distance = this.calculateDistance(location, currentStop.coordinates);

    this.distanceToNextStop = distance;
    this.timeToNextStop = distance / 0.5; // Rough estimate: 30km/h average speed

    // If very close to the current stop, prompt to mark as completed
    if (distance < 0.05) {
      // 50 meters
      this.showArrivalNotification();
    }
  }

  private calculateDistance(
    point1: [number, number],
    point2: [number, number]
  ): number {
    // Haversine formula to calculate distance between two points
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // Earth radius in km

    const dLat = toRad(point2[1] - point1[1]);
    const dLon = toRad(point2[0] - point1[0]);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(point1[1])) *
        Math.cos(toRad(point2[1])) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  private showArrivalNotification(): void {
    this._snackBar
      .open('You have arrived at the destination!', 'Complete Stop', {
        duration: 0, // Doesn't auto-dismiss
      })
      .onAction()
      .subscribe(() => {
        this.completeCurrentStop();
      });
  }

  private createNavigationRoute(): void {
    if (!this.userLocation || this.currentStopIndex >= this.stops.length)
      return;

    const currentStop = this.stops[this.currentStopIndex];

    // Get detailed route with steps
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${this.userLocation[0]},${this.userLocation[1]};${currentStop.coordinates[0]},${currentStop.coordinates[1]}?steps=true&geometries=geojson&overview=full&access_token=${this._mapService.mapboxToken}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (!data.routes || data.routes.length === 0) return;

        const route = data.routes[0];
        const geometry = route.geometry;

        // Clear previous routes
        this.clearRoutes();

        // Store current route details
        this.navigationSteps = route.legs[0].steps;
        this.currentStep = this.navigationSteps[0];
        this.timeToNextStop = route.duration / 60; // Convert to minutes
        this.currentLegCoordinates = geometry.coordinates;

        // Add route to map
        this.addRouteToMap(geometry, 'active-navigation', '#0ea5e9', 6);

        // Add destination marker
        this.addDestinationMarker(currentStop);

        // Update UI
        this._cdr.detectChanges();
      })
      .catch((err) => {
        console.error('Error fetching navigation route:', err);
      });
  }

  private addDestinationMarker(stop: RouteStop): void {
    const el = document.createElement('div');
    el.className = 'destination-marker';

    // Different styling based on pickup/delivery
    const colorClass = stop.isPickup ? 'bg-yellow-500' : 'bg-red-500';

    el.innerHTML = `
      <div class="flex items-center justify-center rounded-full ${colorClass} text-white w-12 h-12 shadow-lg animate-pulse">
        <img src="pick-up.svg" alt="Destination" class="w-8 h-8">
      </div>
    `;

    // Add destination marker to map
    const marker = new mapboxgl.Marker({ element: el })
      .setLngLat(stop.coordinates)
      .addTo(this.map);

    this.markers.push(marker);
  }

  private updateNavigationToNextStop(): void {
    if (!this.userLocation || this.currentStopIndex >= this.stops.length)
      return;

    // Clear existing routes
    this.clearRoutes();

    // Create a new route to the next stop
    this.createNavigationRoute();
  }

  endNavigation(): void {
    this.isNavigating = false;
    this.routeStarted = false;

    // Stop simulation if active
    if (this.simulationMode && this.simulationSubscription) {
      this.simulationSubscription.unsubscribe();
      this.simulationSubscription = null;
    }

    // Clear navigation UI elements
    if (this.userLocationMarker) {
      this.userLocationMarker.remove();
      this.userLocationMarker = null;
    }

    if (this.directionArrow) {
      this.directionArrow.remove();
      this.directionArrow = null;
    }

    // Reset navigation data
    this.navigationSteps = [];
    this.currentStep = null;
    this.distanceToNextStop = 0;
    this.timeToNextStop = 0;

    // Reinitialize the map with route overview
    this.initializeMapWithRoute();
  }

  private startSimulatedLocationUpdates(): void {
    if (!this.currentLegCoordinates || this.currentLegCoordinates.length < 2) {
      this.createNavigationRoute();
      return;
    }

    let pointIndex = 0;
    const totalPoints = this.currentLegCoordinates.length;
    this.simulationSubscription = interval(1000).subscribe(() => {
      this._ngZone.run(() => {
        if (pointIndex < totalPoints) {
          const currentPoint = this.currentLegCoordinates[pointIndex];
          const nextPoint =
            this.currentLegCoordinates[
              Math.min(pointIndex + 1, totalPoints - 1)
            ];
          const heading = this.calculateBearing(
            [currentPoint[0], currentPoint[1]],
            [nextPoint[0], nextPoint[1]]
          );

          // Update user location marker
          this.updateUserLocation([currentPoint[0], currentPoint[1]], heading);

          // Move to next point
          pointIndex++;

          // Check if we need to update the current navigation step
          this.updateCurrentNavigationStep(pointIndex);

          // Check if we've reached the end of the route
          if (pointIndex >= totalPoints - 1) {
            // Arrived at destination
            this.showArrivalNotification();

            // For demo purposes, automatically complete the stop after 5 seconds
            setTimeout(() => {
              this.completeCurrentStop();

              // If there are more stops, start simulating the next route
              if (this.currentStopIndex < this.stops.length) {
                this.simulationSubscription?.unsubscribe();
                this.startSimulatedLocationUpdates();
              } else {
                this.simulationSubscription?.unsubscribe();
              }
            }, 5000);
          }
        }
      });
    });
  }

  private calculateBearing(
    start: [number, number],
    end: [number, number]
  ): number {
    const startLat = this.toRadians(start[1]);
    const startLng = this.toRadians(start[0]);
    const endLat = this.toRadians(end[1]);
    const endLng = this.toRadians(end[0]);

    const y = Math.sin(endLng - startLng) * Math.cos(endLat);
    const x =
      Math.cos(startLat) * Math.sin(endLat) -
      Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);

    let bearing = Math.atan2(y, x);
    bearing = this.toDegrees(bearing);
    bearing = (bearing + 360) % 360; // Normalize to 0-360

    return bearing;
  }

  private toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  private toDegrees(radians: number): number {
    return (radians * 180) / Math.PI;
  }

  private updateCurrentNavigationStep(pointIndex: number): void {
    if (!this.navigationSteps || this.navigationSteps.length === 0) return;

    // Find the current step based on progress along the route
    const progress = pointIndex / this.currentLegCoordinates.length;
    const stepIndex = Math.floor(progress * this.navigationSteps.length);

    if (
      stepIndex < this.navigationSteps.length &&
      this.currentStep !== this.navigationSteps[stepIndex]
    ) {
      // Update current step
      this.currentStep = this.navigationSteps[stepIndex];

      // Show turn notification
      this.showTurnNotification(this.currentStep);

      // Update UI
      this._cdr.detectChanges();
    }
  }

  private showTurnNotification(step: NavigationStep): void {
    if (!step || !step.maneuver) return;

    // In a real app, you would show this in the UI
    console.log(`Turn notification: ${step.maneuver.instruction}`);

    // Play audio instruction (in a real app)
    // this.speakInstruction(step.maneuver.instruction);
  }

  // Optional: For a complete navigation experience
  private speakInstruction(instruction: string): void {
    // Use browser's text-to-speech API
    if ('speechSynthesis' in window) {
      const speech = new SpeechSynthesisUtterance(instruction);
      speech.rate = 1.0;
      speech.pitch = 1.0;
      speech.volume = 1.0;
      window.speechSynthesis.speak(speech);
    }
  }

  // Enhance the navigation view with 3D buildings and improved camera angles
  toggleNavigationView(): void {
    if (!this.map) return;

    // Toggle between 2D and 3D view
    const currentPitch = this.map.getPitch();
    const newPitch = currentPitch < 50 ? 60 : 0;

    this.map.easeTo({
      pitch: newPitch,
      duration: 1000,
    });
  }

  // Add a method to recenter on user's location during navigation
  recenterOnUser(): void {
    if (!this.userLocation || !this.map || !this.isNavigating) return;

    this.map.flyTo({
      center: this.userLocation,
      zoom: 17,
      pitch: 60,
      bearing: this.currentBearing,
      duration: 1000,
    });
  }

  // Add method for showing upcoming turns
  showUpcomingTurns(): void {
    if (!this.navigationSteps || this.navigationSteps.length === 0) return;

    // Find current step index
    const currentStepIndex = this.navigationSteps.findIndex(
      (step) => step === this.currentStep
    );
    if (currentStepIndex === -1) return;

    // Get next 3 turns
    const upcomingTurns = this.navigationSteps
      .slice(currentStepIndex + 1, currentStepIndex + 4)
      .filter(
        (step) =>
          step.maneuver.type !== 'continue' && step.maneuver.type !== 'straight'
      );

    console.log('Upcoming turns:', upcomingTurns);
    // In a real app, you would show this in the UI
  }

  // Method to handle arrival at destination
  private handleArrival(): void {
    // Stop navigation updates
    if (this.simulationSubscription) {
      this.simulationSubscription.unsubscribe();
    }

    // Show arrival notification
    this.showArrivalNotification();

    // Play arrival sound or voice prompt
    this.speakInstruction('You have arrived at your destination');

    // Update UI to prompt user to mark as complete
    // In a real app, you would show a prominent UI element
  }
  // Add these helper functions to your OrdersComponent class

  // Helper method to get the appropriate icon for different maneuver types
  getManeuverIcon(maneuverType: string): string {
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

    // Default icon
    return iconMap[maneuverType] || 'arrow_forward';
  }

  // Helper method for custom camera animation during navigation
  private animateCameraThroughRoute(): void {
    if (
      !this.isNavigating ||
      !this.map ||
      this.currentLegCoordinates.length < 2
    )
      return;

    // Get a subset of points for smoother animation
    const animationPoints = this.currentLegCoordinates.filter(
      (_, i) => i % 5 === 0
    );
    if (animationPoints.length < 2) return;

    let currentPointIndex = 0;

    const animate = () => {
      if (currentPointIndex >= animationPoints.length - 1) return;

      const currentPoint = animationPoints[currentPointIndex];
      const nextPoint = animationPoints[currentPointIndex + 1];
      const bearing = this.calculateBearing(
        [currentPoint[0], currentPoint[1]],
        [nextPoint[0], nextPoint[1]]
      );

      this.map.easeTo({
        center: currentPoint,
        bearing: bearing,
        duration: 1000,
        pitch: 60,
        zoom: 17,
        easing: (t) => t,
        essential: true,
      });

      currentPointIndex++;

      // Continue animation
      if (currentPointIndex < animationPoints.length - 1) {
        setTimeout(animate, 1000);
      }
    };

    // Start animation
    animate();
  }

  // Method to simulate lane guidance during navigation
  showLaneGuidance(): void {
    if (!this.currentStep || !this.isNavigating) return;

    // In a real app, you would get this data from the directions API
    // For now, we'll create a simple mock
    const laneTypes = [
      'straight',
      'slight-right',
      'right',
      'slight-left',
      'left',
    ];
    const recommendedLanes = [1, 2]; // Indexes of recommended lanes

    // In a real app, you would render these lanes in the UI
    console.log('Lane guidance:', {
      totalLanes: laneTypes.length,
      recommendedLanes: recommendedLanes.map((i) => laneTypes[i]),
    });
  }

  // Method to show street view images at key points
  showStreetView(coordinates: [number, number]): void {
    // In a real app, you'd integrate with a street view API
    console.log('Showing street view at coordinates:', coordinates);

    // Mock implementation - in a real app you would:
    // 1. Get street view imagery from an API
    // 2. Display it in a modal or side panel
    // 3. Allow user to toggle between map and street view
  }

  // Method to optimize camera movement based on speed and turns
  private optimizeCameraForNavigation(
    speed: number,
    distanceToNextTurn: number
  ): void {
    if (!this.map || !this.isNavigating) return;

    let zoom = 17; // Default zoom
    let pitch = 60; // Default pitch

    // Adjust zoom based on speed (km/h)
    if (speed > 80) {
      // Highway
      zoom = 15;
    } else if (speed > 50) {
      // Main road
      zoom = 16;
    } else {
      // City street
      zoom = 17;
    }

    // Adjust pitch when approaching turns
    if (distanceToNextTurn < 0.1) {
      // Within 100m of turn
      pitch = 45; // Lower pitch to see the intersection better
    }

    // Smooth transition to new camera settings
    this.map.easeTo({
      zoom: zoom,
      pitch: pitch,
      duration: 1000,
    });
  }

  // Method to handle alternative routes
  showAlternativeRoutes(): void {
    if (!this.userLocation || this.currentStopIndex >= this.stops.length)
      return;

    const destination = this.stops[this.currentStopIndex].coordinates;

    // Fetch alternative routes
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${this.userLocation[0]},${this.userLocation[1]};${destination[0]},${destination[1]}?alternatives=true&geometries=geojson&access_token=${this._mapService.mapboxToken}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (!data.routes || data.routes.length <= 1) {
          console.log('No alternative routes available');
          return;
        }

        // Clear previous routes
        this.clearRoutes();

        // Add main route (first one)
        this.addRouteToMap(data.routes[0].geometry, 'main-route', '#0ea5e9', 6);

        // Add alternative routes with different styles
        const alternativeColors = ['#6366f1', '#8b5cf6', '#d946ef'];
        data.routes.slice(1).forEach((route: any, index: number) => {
          if (index < alternativeColors.length) {
            this.addRouteToMap(
              route.geometry,
              `alt-route-${index}`,
              alternativeColors[index],
              4
            );
          }
        });

        console.log(`Showing ${data.routes.length} routes`);
      })
      .catch((err) => {
        console.error('Error fetching alternative routes:', err);
      });
  }
  // Add this method to the component class
  recenterMap(): void {
    if (!this.userLocation || !this.map) return;

    this.map.flyTo({
      center: this.userLocation,
      zoom: 17,
      pitch: 60,
      bearing: this.currentBearing,
      duration: 500,
    });
  }
}
