import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { gsap } from 'gsap';
import { SuperAuthService } from '../../../../Shared/Services/super-auth-service.service';
import { Router } from '@angular/router';

interface TrackingStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  time?: string;
}

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tracking.component.html',
  styleUrl: './tracking.component.css'
})
export class TrackingComponent implements OnInit, AfterViewInit {
  trackingCode: string = '';
  isLoading: boolean = false;
  orderFound: boolean = false;
  currentStep: number = 2;
  private superAuthService=inject(SuperAuthService);
  private router=inject(Router)

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initAnimations();
    }
  }

  initAnimations(): void {
    gsap.fromTo('.tracking-header', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    );

    gsap.fromTo('.tracking-form', 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: 'power2.out' }
    );
  }

  trackOrder(): void {
    if (this.trackingCode.length < 6) return;

    this.isLoading = true;
    if(this.superAuthService.isLoggedIn() && this.superAuthService.decodeToken()?.type === 'client'){
      this.router.navigate([`/orders/${this.trackingCode}`])
    }else{
      this.router.navigate([`/guest/${this.trackingCode}`])
    }

  }
}