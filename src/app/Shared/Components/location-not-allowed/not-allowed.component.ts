import { Component, inject, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import { Geolocation } from '@capacitor/geolocation';
import { LocationWebService } from '../../Services/location.service';
import { FuseAlertComponent } from "../alert/alert.component";
import { AlertType } from '../alert/alert.types';
import { Animations } from '../../Animations/public-api';


@Component({
  selector: 'location-not-allowed',
  imports: [MatCardModule, FuseAlertComponent],
  animations:Animations,
  templateUrl: './not-allowed.component.html',
})
export class LocationNotAllowedComponent implements OnInit {
  private router=inject(Router)
  private location=inject(LocationWebService)
  showAlert=false;
  alert: { type: AlertType; message: string } = {
    type: 'error',
    message: '',
  };
  async ngOnInit(): Promise<void> {
    const permission = await this.location.checkPermission();
    console.log(permission);
    if(permission === 'granted'){
      console.log('in ');
      this.router.navigate(['/admin/agents']);
    }else{
      if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition((pos)=>{
          this.router.navigate(['/admin/agents']);
        },(err)=>{
          console.log(err);
          if(err.PERMISSION_DENIED){
            this.alert.message= 'Permission denied. Please allow location access.';
            this.alert.type = 'error'
            this.showAlert=true;
          }
          else if(err.POSITION_UNAVAILABLE){
            this.alert.message= 'Position unavailable.';
            this.alert.type = 'warn'
            this.showAlert=true;
          }
          else if(err.TIMEOUT){
            this.alert.message= 'Timed out while retrieving location.';
            this.alert.type = 'warn'
            this.showAlert=true;
          }
        })
      }else{
        this.alert.message= 'Your browser does not support geolocation !';
        this.alert.type = 'info'
        this.showAlert=true;
      }
    }

  }

  reload() {
    window.location.reload();
  }
}
