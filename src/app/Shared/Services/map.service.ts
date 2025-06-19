import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { catchError, map, of } from 'rxjs';
import { Place } from '../Models/Place.model';
@Injectable({
  providedIn: 'root',
})
export class MapService {
  http = inject(HttpClient);

  mapboxToken =
    'pk.eyJ1IjoieW9zcmEtbmFqYXIiLCJhIjoiY2xmdGw2a20wMDF4eTNxcDBiMHZycnZpdCJ9.PTo1tyEyJry6uEKaqRLkRQ';

  reverseGeocode(lng: number, lat: number) {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${this.mapboxToken}`;

    return this.http.get<any>(url).pipe(
      map(res => {
      let suggestion =res.features[0];
      let place: Place = new Place();
      place.id = suggestion.id;
      place.setPlace(suggestion.place_name, 'postcode');
      place.coordinates = [lng,lat];
        return place;
      }),
      catchError(err => {
        return of(null);
      })
    );
  }
  // Haversine formula
  calculateDistance([lng1, lat1]: number[], [lng2, lat2]: number[]) {
    const R = 6371; // km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }
}
