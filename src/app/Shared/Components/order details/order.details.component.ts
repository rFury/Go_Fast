import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, ViewEncapsulation } from '@angular/core';
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
import { JourneyService } from '../../Services/Journey.service';
import { Status } from '../../enums/status.enums';
import { SuperAuthService } from '../../Services/super-auth-service.service';


@Component({
    selector     : 'ordercarddetails',
    templateUrl  : './order.details.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : Animations,
    standalone   : true,
    imports: [CardComponent,MatIconModule,MatButtonModule]
})
export class OrderDetailsCardComponent implements OnInit
{
    isFullScreen = false;
    @Input({required: true })Order: Order | null = null;
    @Input() withMap: boolean = true;
    @Output() canceled = new EventEmitter<Order>();
    loggedIn = false;
    details: boolean = true;
    private router = inject(Router);
    _route= inject(ActivatedRoute);
    _fuseConfirmationService = inject(FuseConfirmationService);
    _orderService = inject(OrderService);
    _JourneyService = inject(JourneyService);
    _authService=inject(SuperAuthService)
    Status = Status;
    type=false;
    hidden=true;
    copied = false;
    private clipboard = inject(Clipboard);
    private snackBar = inject(SnackBarService);
    ngOnInit(){
      if(this._authService.isLoggedIn()){
        this.loggedIn = true;
        this.type=this._authService.decodeToken().type==='client';
      }else{
        this.loggedIn = false;
        this.type=true;
      }
    }
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
        this.canceled.emit(this.Order!);
    }
  }