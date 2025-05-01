// src/app/services/location.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private socket: Socket;

  constructor() {
    this.socket = io(`${environment.api}/track-agent-location`);
  }

  // Receive real-time updates
  getLocations() {
    return new Observable<{ agentId: string, coordinates:[number,number]}>((observer) => {
      this.socket.on('newLocation', (data) => {
        observer.next(data);
      });
    });
  }

  // Send location updates (for agent app)
  sendLocation(agentId: string, coordinates:[number,number]) {
    this.socket.emit('locationUpdate', {
      agentId,
      coordinates
    });
  }
}