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
    // Use environment variable for the backend URL
    this.socket = io('http://127.0.0.1:3000', {
      transports: ['websocket'],
      path: '/socket.io',
      withCredentials: true,
    });

    // Log connection status
    this.socket.on('connect', () => {
      console.log('Socket connected successfully');
    });
    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  // Register agent connection
  registerAgent(agentId: string): void {
    this.socket.emit('register-agent', agentId);
    console.log(`Registering agent ${agentId}`);
  }

  // Subscribe to specific agent updates
  subscribeToAgent(agentId: string): void {
    if (this.socket.connected) {
      this.socket.emit('subscribe-to-agent', agentId);
      console.log(`Subscribed to agent-${agentId}`);
    } else {
      console.error('Socket not connected, waiting for connection');
      this.socket.on('connect', () => {
        this.socket.emit('subscribe-to-agent', agentId);
        console.log(`Subscribed to agent-${agentId} after connect`);
      });
    }
  }

  // Unsubscribe from agent updates
  unsubscribeFromAgent(agentId: string): void {
    this.socket.emit('unsubscribe-from-agent', agentId);
    console.log(`Unsubscribed from agent-${agentId}`);
  }

  // Receive real-time updates
  getAgentLocations(
    agentId: string
  ): Observable<{ agentId: string; coordinates: any }> {
    return new Observable((observer) => {
      const listener = (data: { agentId: string; coordinates: any }) => {
        console.log('Received agent-location event:', data);
        if (data.agentId === agentId) {
          console.log('Agent ID match, emitting data:', data);
          observer.next(data);
        } else {
          console.log(`Agent ID mismatch: expected ${agentId}, got ${data.agentId}`);
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
    console.log(`Sent location update for agent ${agentId}:`, coordinates);
  }

  disconnect() {
    this.socket.disconnect();
    console.log('Socket disconnected');
  }
}