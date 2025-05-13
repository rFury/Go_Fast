import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SuperAuthService } from '../../../Shared/Services/super-auth-service.service';
import { FuseSplashScreenService } from '../../../Shared/Services/splash-screen.service';
@Component({
  selector: 'app-auth-callback',
  template: '<p>google/facebook</p>'
})
export class CallbackComponent implements OnInit,OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private authService: SuperAuthService,
    private splashService:FuseSplashScreenService
  ) {}

  ngOnInit() {
    this.splashService.show()
    console.log('1')
    this.route.queryParams.subscribe(params => {
      console.log('2')
      if (params['token']) {
        console.log('3')
        this.authService.handleCallback(params['token']);
        window.location.href = params['state'] || '/';
      }
    });
  }
  ngOnDestroy(): void {
      this.splashService.hide();
  }
  
}