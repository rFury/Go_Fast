import { Component, EventEmitter, inject, Input, OnChanges, Output, ViewEncapsulation } from '@angular/core';
import { Animations } from '../../Animations/public-api';
import { CardComponent } from '../card/card.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, ActivatedRoute } from '@angular/router';
import { Order } from '../../Models/Order.model';
import { Clipboard } from '@angular/cdk/clipboard';
import { SnackBarService } from '../../Services/snack-bar.service';
import { FuseConfirmationService } from '../confirmation/confirmation.service';
import { OrderService } from '../../Services/order.service';
import { RouteService } from '../../Services/Journey.service';
import { Status } from '../../enums/status.enums';


@Component({
    selector     : 'ordercarddetails',
    templateUrl  : './order.details.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : Animations,
    standalone   : true,
    imports: [CardComponent,MatIconModule,MatButtonModule]
})
export class OrderDetailsCardComponent
{
    isFullScreen = false;
    @Input({required: true })Order: Order | null = null;
    @Input() withMap: boolean = true;
    @Output() canceled = new EventEmitter<Order>();
    details: boolean = true;
    private router = inject(Router);
    _route= inject(ActivatedRoute);
    _fuseConfirmationService = inject(FuseConfirmationService);
    _orderService = inject(OrderService);
    _JourneyService = inject(RouteService);

    
    hidden=true;
    copied = false;
    private clipboard = inject(Clipboard);
    private snackBar = inject(SnackBarService);
    orderDetails(id:string){
        this.router.navigate([`${id}`], { relativeTo: this._route }).then();
    }
    copy(code: string) {
        this.clipboard.copy(code);
        this.snackBar.openSnackBar('Copied to clipboard!', 'success');
        this.copied = true;
        setTimeout(() => {
          this.copied = false;
        }, 3000);
      }
      cancelOrder() {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
          title: 'Cancel',
          message: 'Would you like to cancel the order ?',
          actions: {
            confirm: {
              label: 'yes',
            },
            cancel: {
              label: 'no',
            },
          },
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {
          // If the confirm button pressed...
          if (result === 'confirmed') {
            this._orderService.getOrdersAgent(this.Order?._id!).subscribe((agentId) => {
              this._JourneyService.subscribeToJourney(agentId!);
              this._JourneyService.cancelOrder(agentId, this.Order!);
              this.Order!.status=Status.canceled;
              this.canceled.emit(this.Order!);
            });
          }
        });

    }
  }