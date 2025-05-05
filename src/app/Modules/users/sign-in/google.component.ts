import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SuperAuthService } from '../../../Shared/Services/super-auth-service.service';

@Component({
  selector: 'app-auth-callback',
  template: '<p>google</p>'
})
export class CallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private authService: SuperAuthService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params.token) {
        this.authService.handleCallback(params.token);
        window.location.href = params.state || '/';
      }
    });
  }
}