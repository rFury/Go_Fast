// src/app/services/location.service.ts
import { Injectable } from '@angular/core';
import { Geolocation as CapGeolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';


@Injectable({
  providedIn: 'root',
})
export class LocationWebService {
    async checkPermission(): Promise<'granted'|'prompt'|'denied'> {
        const platform = Capacitor.getPlatform();
        if (platform === 'web') {
            console.log("hi");
          try {
            const status = await (navigator as any).permissions.query({ name: 'geolocation' });
            return status.state;
          } catch(err) {
            console.log('catch ',err);
            return 'prompt';
          }
        } else {            
          const perm = await CapGeolocation.requestPermissions();
          const locationState = perm.location;
          switch (locationState) {
            case 'granted':
              return 'granted';
            case 'denied': 
              return 'denied';
            case 'prompt-with-rationale':
            case 'prompt':
            default:
              return 'prompt';
          }
        }
      }

      async getCurrentPosition(): Promise<[number,number]> {
        const platform = Capacitor.getPlatform();
        if (platform === 'web') {
          return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
              return reject(new Error('Geolocation not supported'));
            }
            navigator.geolocation.getCurrentPosition(
              pos => resolve([pos.coords.longitude, pos.coords.latitude]),
              err => reject(err),
              { enableHighAccuracy: true, timeout: 30000, maximumAge: 5000 }
            );
          });
        } else {
          const pos = await CapGeolocation.getCurrentPosition({ enableHighAccuracy: true,timeout:30000, maximumAge: 5000 });
          return [pos.coords.longitude, pos.coords.latitude];
          ;
        }
      }
}
