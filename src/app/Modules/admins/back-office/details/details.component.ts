import { Component, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import * as mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  standalone: true,
  imports: [MatIcon],
})
export class DetailsComponent implements OnInit {
  map: mapboxgl.Map;
  lat = 36.3398;
  lng = 10.7787;
  indexStyle = 0;
  styles = [
    'mapbox://styles/mapbox/satellite-streets-v12',
    'mapbox://styles/mapbox/light-v11',
  ];
  ngOnInit(): void {
    this.map = new mapboxgl.Map({
      accessToken:
        'pk.eyJ1IjoiYmFjY291Y2htZWQiLCJhIjoiY2xrMTZwdHllMDRqdjNmcWo1aTQ0c3R4cyJ9.sPeFM-9VpxsoMHaHyWruQA',
      container: 'map',
      style: this.styles[this.indexStyle],
      zoom: 8,
      center: [this.lng, this.lat],
    });
    this.map.on('click', (event) => {
      console.info(event);
    });
    const geojson = {
      type: 'FeatureCollection',
      features: [{
        properties:{
          iconSize:[20,20],
          bg:"#FF0"
        }
        ,
        geometry:{
          coordinates:[this.lng, this.lat]
        }
      }
      ],
    };
    for (const marker of geojson.features) {
      // Create a DOM element for each marker.
      const el = document.createElement('div');
      const width = marker.properties.iconSize[0];
      const height = marker.properties.iconSize[1];
      el.className = 'marker rounded-full cursor-pointer';
      el.style.backgroundColor = marker.properties.bg;
      el.style.width = `${width}px`;
      el.style.height = `${height}px`;
      el.style.backgroundSize = '100%';
      el.style.backgroundPosition = 'center';
      el.style.border = '4px solid lime';
      el.style.backgroundRepeat = 'no-repeat';

      // Add markers to the map.
      new mapboxgl.Marker(el)
        .setLngLat(marker.geometry.coordinates)
        .addTo(this.map);
    }
  }
  switchMap(event) {
    event.stopPropagation();
    let style;
    if (this.indexStyle === 0) {
      this.indexStyle = 1;
      style = this.styles[1];
    } else {
      this.indexStyle = 0;
      style = this.styles[0];
    }
    this.map = new mapboxgl.Map({
      accessToken:
        'pk.eyJ1IjoieW9zcmEtbmFqYXIiLCJhIjoiY2xmdGw2a20wMDF4eTNxcDBiMHZycnZpdCJ9.PTo1tyEyJry6uEKaqRLkRQ',
      container: 'map',
      style,
      zoom: 8,
      center: [this.lng, this.lat],
    });
  }
}
