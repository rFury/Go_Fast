// src/app/services/location.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://127.0.0.1:3000', {
      transports: ['websocket'], // ← only websocket
      path: '/socket.io', // must match your server.path
      withCredentials: true,
    });
  }

   // Register agent connection
   registerAgent(agentId: string): void {
    this.socket.emit('register-agent', agentId);
  }

  // Subscribe to specific agent updates
  subscribeToAgent(agentId: string): void {
    this.socket.emit('subscribe-to-agent', agentId);
  }

  // Unsubscribe from agent updates
  unsubscribeFromAgent(agentId: string): void {
    this.socket.emit('unsubscribe-from-agent', agentId);
  }

  // Receive real-time updates
  getAgentLocations(
    agentId: string
  ): Observable<{ agentId: string; coordinates: [number, number] }> {
    return new Observable((observer) => {
      const listener = (data: {
        agentId: string;
        coordinates: [number, number];
      }) => {
        if (data.agentId === agentId) {
          observer.next(data);
        }
      };

      this.socket.on('agent-location', listener);

      return () => {
        this.socket.off('agent-location', listener);
        this.unsubscribeFromAgent(agentId);
      };
    });
  }

  // Send location updates for specific agent
  sendAgentLocation(agentId: string, coordinates: [number, number]): void {
    this.socket.emit('track-agent-location', {
      agentId,
      coordinates,
    });
  }

  diconnect() {
    this.socket.disconnect();
  }
}
