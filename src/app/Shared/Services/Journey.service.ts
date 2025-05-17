import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { Order } from '../Models/Order.model';
import { Routes } from '../Models/Routes.model';

@Injectable({
  providedIn: 'root',
})
export class RouteService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://127.0.0.1:3000/Journey', {
      transports: ['websocket'],
      path: '/socket.io',
      withCredentials: true,
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });
  }

  registerJourney(agentId: string): void {
    if (!agentId) throw new Error('Agent ID is required');
    this.socket.emit('register-journey', agentId);
  }

  subscribeToJourney(agentId: string): void {
    if (!agentId) throw new Error('Agent ID is required');
    this.socket.emit('subscribe-to-journey', agentId);
  }

  unsubscribeFromJourney(agentId: string): void {
    if (!agentId) return;
    this.socket.emit('unsubscribe-from-journey', agentId);
  }

  getJourney(agentId: string): Observable<Routes> {
    if (!agentId) throw new Error('Agent ID is required');
    return new Observable((observer) => {
      const listener = (data: Routes) => {
        console.log('Journey data received:', data);
        observer.next(data);
      };
      this.socket.on('journey-update', listener);
      return () => {
        this.socket.off('journey-update', listener);
        this.unsubscribeFromJourney(agentId);
      };
    });
  }

  cancelOrder(agentId: string, order: Order): void {
    if (!agentId || !order) throw new Error('Agent ID and order are required');
    this.socket.emit('cancel-order', { agentId, order });
  }

  disconnect(): void {
    this.socket.disconnect();
  }
}