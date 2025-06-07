import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { DatePipe, NgClass, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { NotificationsService } from './notifications.service';
import { Notification } from './notifications.types';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'notifications-component',
  templateUrl: './notifications.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'notifications',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    NgClass,
    NgTemplateOutlet,
    RouterLink,
    DatePipe,
  ],
})
export class NotificationsComponent implements OnInit, OnDestroy {
  @ViewChild('notificationsOrigin') private _notificationsOrigin!: MatButton;
  @ViewChild('notificationsPanel')
  private _notificationsPanel!: TemplateRef<any>;

  notifications!: Notification[];
  unreadCount: number = 0;
  private _overlayRef!: OverlayRef;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  interval: any;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _notificationsService: NotificationsService,
    private _overlay: Overlay,
    private _viewContainerRef: ViewContainerRef
  ) {}

  ngOnInit(): void {
    // Subscribe to notification changes
    this._notificationsService.notifications$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(notifications => {
        this.notifications = notifications;
        this._changeDetectorRef.markForCheck();
      });
      this._notificationsService.unreadCount$.pipe(takeUntil(this._unsubscribeAll))
      .subscribe((count) => {
        this.unreadCount = count;
        this._changeDetectorRef.markForCheck();
      });
      this.get()
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
    clearInterval(this.interval);
    this.interval = null;

    // Dispose the overlay
    if (this._overlayRef) {
      this._overlayRef.dispose();
    }
  }

  openPanel(): void {
    // Return if the notifications panel or its origin is not defined
    if (!this._notificationsPanel || !this._notificationsOrigin) {
      return;
    }

    // Create the overlay if it doesn't exist
    if (!this._overlayRef) {
      this._createOverlay();
    }

    // Attach the portal to the overlay
    this._overlayRef.attach(
      new TemplatePortal(this._notificationsPanel, this._viewContainerRef)
    );
  }

  get(){
    this._notificationsService.getAll().subscribe({
        next: (notifications) => {
          this.notifications = notifications;
          this._calculateUnreadCount();
          this._changeDetectorRef.markForCheck();
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  closePanel(): void {
    this._overlayRef.detach();
  }

  markAllAsRead(): void {
    // Mark all as read
    this._notificationsService.markAllAsRead().subscribe();
  }
  toggleRead(notification: Notification): void {
    // Toggle the read status
    notification.read = !notification.read;

    // Update the notification
    this._notificationsService
      .update(notification._id)
      .subscribe();
  }
  delete(notification: Notification): void {
    this._notificationsService.delete(notification._id).subscribe();
  }

  private _createOverlay(): void {
    // Create the overlay
    this._overlayRef = this._overlay.create({
      hasBackdrop: true,
      backdropClass: 'fuse-backdrop-on-mobile',
      scrollStrategy: this._overlay.scrollStrategies.block(),
      positionStrategy: this._overlay
        .position()
        .flexibleConnectedTo(
          this._notificationsOrigin._elementRef.nativeElement
        )
        .withLockedPosition(true)
        .withPush(true)
        .withPositions([
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top',
          },
          {
            originX: 'start',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'bottom',
          },
          {
            originX: 'end',
            originY: 'bottom',
            overlayX: 'end',
            overlayY: 'top',
          },
          {
            originX: 'end',
            originY: 'top',
            overlayX: 'end',
            overlayY: 'bottom',
          },
        ]),
    });

    this._overlayRef.backdropClick().subscribe(() => {
      this._overlayRef.detach();
    });
  }
  private _calculateUnreadCount(): void {
    let count = 0;

    if (this.notifications && this.notifications.length) {
      count = this.notifications.filter(
        (notification) => !notification.read
      ).length;
    }

    this.unreadCount = count;
  }
}
